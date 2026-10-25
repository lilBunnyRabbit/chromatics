import { finite, wrapHue } from "../../core/channel.js";
import { HueColor } from "../../core/families/hue.js";
import { readHueFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { hslToRgb, rgbToHue } from "../../core/hue.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// CSS Color 4 sample code `rgbToHwb`: "account for multiply by 100" (ADR-003).
const ACHROMATIC = 0.00001;

// CSS Color 4 sample code `hwbToRgb`: white + black ≥ 1 is a grey of white's share.
function hwbToSrgb(c: Hwb): Srgb {
  const { w, b } = c;
  if (w + b >= 1) {
    const grey = w / (w + b);
    return new Srgb(grey, grey, grey, c.alpha);
  }
  const [r, g, bl] = hslToRgb(c.h, 1, 0.5).map((v) => v * (1 - w - b) + w) as [number, number, number];
  return new Srgb(r, g, bl, c.alpha);
}

// CSS Color 4 sample code `rgbToHwb`.
function srgbToHwb(c: Srgb): Hwb {
  const w = Math.min(c.r, c.g, c.b);
  const b = 1 - Math.max(c.r, c.g, c.b);
  const h = w + b >= 1 - ACHROMATIC ? 0 : rgbToHue(c.r, c.g, c.b);
  return new Hwb(h, w, b, c.alpha);
}

/**
 * HWB: hue, whiteness, blackness over sRGB (CSS Color 4 `hwb()`, Smith 1996). Start from a pure hue
 * and mix in white and black. `w` and `b` are 0–1 fractions.
 *
 * When `w + b` ≥ 1 the color is a grey of `w / (w + b)` and the hue no longer matters, so such a
 * color doesn't round-trip through sRGB with its `w`, `b` intact. `h` wraps into [0, 360) on write.
 *
 * @example
 * ```ts
 * new Hwb(30, 0, 0).toCss();                // 'hwb(30 0% 0%)', pure orange
 * Hwb.parse('hwb(150 20% 10%)');
 * ```
 */
export class Hwb extends HueColor {
  static readonly id = "hwb";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    w: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Srgb, hwbToSrgb, srgbToHwb)];
  static readonly terminal = false;

  private _h: number;
  private _w: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, w: number, b: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hwb");
    this._w = finite(w, "hwb", "w");
    this._b = finite(b, "hwb", "b");
  }

  get model(): "hwb" {
    return "hwb";
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hwb");
  }

  /** Whiteness, 0–1 (not 0–100). */
  get w(): number {
    return this._w;
  }
  set w(value: number) {
    this._w = finite(value, "hwb", "w");
  }

  /** Blackness, 0–1 (not 0–100). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "hwb", "b");
  }

  get coords(): readonly [h: number, w: number, b: number] {
    return [this._h, this._w, this._b];
  }

  /** `true` when `w + b` is at least 0.99999, the CSS Color 4 threshold: the color is a grey. */
  override isAchromatic(): boolean {
    return this._w + this._b >= 1 - ACHROMATIC;
  }

  /**
   * Parses `hwb(h w b [/ alpha])`. `w` and `b` take percentages or 0–100 numbers. No comma syntax
   * (CSS never had one for `hwb()`); nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hwb {
    const { coords, alpha } = readHueFunction(input, ["hwb"], Hwb.channels);
    const [h = 0, w = 0, b = 0] = coords;
    return new Hwb(h, w, b, alpha);
  }

  /** `hwb(h w% b%)`, shortest exact numbers. */
  override toString(): string {
    return serialize("hwb", Hwb.channels, this.coords, this.alpha, "exact", ["w", "b"]);
  }

  /** `hwb(h w% b%)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("hwb", Hwb.channels, this.coords, this.alpha, options, ["w", "b"]);
  }
}
