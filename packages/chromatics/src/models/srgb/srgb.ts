import { multiply } from "../../core/linear.js";
import { LINEAR_SRGB_TO_XYZ_D65 } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { RgbColor } from "../../core/families/rgb.js";
import { invalid, parseFunction, readAlpha, readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import type { Edge } from "../../core/model.js";
import { linearToSrgb, srgbToLinear } from "../../core/transfer.js";
import { applyFilter, type FilterName } from "../../core/filter.js";
import { sourceOver } from "../../core/composite.js";
import { LinearSrgb } from "../linear-srgb/linear-srgb.js";

// WCAG 2.2 #dfn-relative-luminance, Note 1: "L = 0.2126 * R + 0.7152 * G + 0.0722 * B", with the sRGB
// transfer at threshold 0.04045 (the same curve as `srgbToLinear`).
function wcagLuminance(c: Srgb): number {
  return 0.2126 * srgbToLinear(c.r) + 0.7152 * srgbToLinear(c.g) + 0.0722 * srgbToLinear(c.b);
}

/**
 * sRGB with its transfer curve, channels 0–1 (CSS Color 4 `srgb`, IEC 61966-2-1). What `rgb()` and
 * most screens mean by a color.
 *
 * Out-of-gamut colors (from a wider space) keep channels below 0 or above 1; nothing clamps unless
 * asked. For 8-bit values and hex use {@link Srgb8}.
 *
 * @example
 * ```ts
 * new Srgb(1, 0.5, 0);
 * Srgb.parse('rgb(255 128 0 / 50%)');      // r 1, g 128/255, b 0, alpha 0.5
 * Srgb.parse('color(srgb 1 0.5 0)');
 * c.to(Srgb).toCss();                       // 'color(srgb 1 0.50196 0)'
 * ```
 */
export class Srgb extends RgbColor {
  static readonly id = "srgb";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      LinearSrgb,
      (c: Srgb) => new LinearSrgb(srgbToLinear(c.r), srgbToLinear(c.g), srgbToLinear(c.b), c.alpha),
      (c) => new Srgb(linearToSrgb(c.r), linearToSrgb(c.g), linearToSrgb(c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "srgb", "r");
    this._g = finite(g, "srgb", "g");
    this._b = finite(b, "srgb", "b");
  }

  get model(): "srgb" {
    return "srgb";
  }

  /** Red, 0–1 in gamut (not 0–255: that's {@link Srgb8}). */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "srgb", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "srgb", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "srgb", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Relative luminance Y, 0 (black) to 1 (white) for in-gamut colors: the linear-light channels weighted
   * by the sRGB → XYZ matrix's Y row. Equal to `this.to(Xyz65).y`.
   */
  luminance(): number {
    return multiply(LINEAR_SRGB_TO_XYZ_D65, srgbToLinear(this._r), srgbToLinear(this._g), srgbToLinear(this._b))[1];
  }

  /**
   * WCAG 2.x contrast ratio with `other`, 1 (none) to 21 (black on white). Symmetric. WCAG 2.2 SC 1.4.3
   * (AA) asks 4.5 for text and 3 for large text; SC 1.4.6 (AAA) asks 7 and 4.5.
   *
   * Follows WCAG 2.2's definition literally (#dfn-relative-luminance: `0.2126 R + 0.7152 G + 0.0722 B`,
   * threshold 0.04045), not {@link luminance}: they differ in the 4th decimal, which flipped 1,951 of
   * 33.5M pass/fail checks (every 8-bit color on white and black, at 3 / 4.5 / 7), and audit tools use
   * WCAG's numbers (grill 43).
   *
   * @example
   * ```ts
   * Srgb8.parse("#3366cc").to(Srgb).contrast(new Srgb(0, 0, 0)); // 3.9 (WCAG technique G183)
   * ```
   */
  contrast(other: Srgb): number {
    const a = wcagLuminance(this);
    const b = wcagLuminance(other);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  /**
   * Applies a CSS filter function, as `filter: name(amount)` does in a browser, and returns this color
   * (mutates). Filter Effects 1 §13.1 matrices and transfer functions, on these gamma-encoded channels
   * (§5: "Filter Functions must operate in the sRGB color space"). Amounts are CSS's as numbers: 1 is
   * 100%, hue-rotate in degrees. Grayscale, sepia and invert treat amounts over 1 as 1, as CSS does.
   * Results are not clamped: `saturate` and `contrast` can leave [0, 1].
   *
   * @throws {RangeError} on a negative amount (CSS doesn't allow them), except for hue-rotate.
   *
   * @example
   * ```ts
   * c.to(Srgb).filter("grayscale", 1);
   * c.to(Srgb).filter("contrast", 1.8).filter("brightness", 0.5);
   * ```
   */
  filter(name: FilterName, amount: number): this {
    return this.assign(applyFilter(name, amount, [this._r, this._g, this._b]), this.alpha);
  }

  /**
   * Composites this color over `backdrop` (Porter-Duff source-over, CSS Compositing 1) in gamma-encoded
   * sRGB, which is what browsers do, and returns this color (mutates): the result is what shows when this
   * color, at its alpha, is painted on `backdrop`. For linear-light compositing, `LinearSrgb.over()`.
   *
   * @example
   * ```ts
   * const text = fg.to(Srgb);
   * text.alpha = 0.7;
   * text.over(bg.to(Srgb)).contrast(bg.to(Srgb));
   * ```
   */
  over(backdrop: Srgb): this {
    const [channels, alpha] = sourceOver(this.coords, this.alpha, backdrop.coords, backdrop.alpha);
    return this.assign(channels, alpha);
  }

  /**
   * Parses `rgb()` / `rgba()` (modern and legacy comma syntax) and `color(srgb …)`.
   *
   * `rgb()` follows CSS: numbers are 0–255, percentages of 255, and channels clamp to 0–255 at parse
   * time. `color(srgb …)` is 0–1 and never clamps. Hex and named colors are {@link Srgb8}.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Srgb {
    const fn = parseFunction(input, input.trim().toLowerCase().startsWith("color(") ? 1 : 0);
    if (fn.name === "color") {
      const { coords, alpha } = readColorFunction(input, ["srgb"], Srgb.channels);
      const [r = 0, g = 0, b = 0] = coords;
      return new Srgb(r, g, b, alpha);
    }
    if (fn.name !== "rgb" && fn.name !== "rgba") throw invalid(input, "expected rgb() or color(srgb …)");
    if (fn.args.length !== 3) throw invalid(input, "expected 3 channels");
    if (fn.legacy) {
      if (fn.args.some((c) => c.kind === "none") || fn.alpha?.kind === "none") {
        throw invalid(input, '"none" not allowed in comma syntax');
      }
      const kinds = new Set(fn.args.map((c) => c.kind));
      if (kinds.size !== 1) throw invalid(input, "comma syntax needs all numbers or all percentages");
    }
    // CSS Color 4 #rgb-functions: "Values outside these ranges are not invalid, but are clamped to
    // the ranges defined here at parsed-value time."
    const [r = 0, g = 0, b = 0] = fn.args.map((c) => {
      if (c.kind === "angle") throw invalid(input, "angle not allowed in rgb()");
      if (c.kind === "none") return 0;
      const v = c.kind === "percent" ? c.value : c.value / 255;
      return v < 0 ? 0 : v > 1 ? 1 : v;
    });
    return new Srgb(r, g, b, readAlpha(fn.alpha, input));
  }

  /** `color(srgb r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", Srgb.channels, this.coords, this.alpha, "exact", [], "srgb");
  }

  /** `color(srgb r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", Srgb.channels, this.coords, this.alpha, options, [], "srgb");
  }
}
