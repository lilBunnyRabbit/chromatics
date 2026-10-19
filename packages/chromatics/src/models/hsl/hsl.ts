import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { HueColor } from "../../core/families/hue.js";
import { readHueFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { GREY_NOISE, hslToRgb, rgbToHue } from "../../core/hue.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// CSS Color 4 sample code `rgbToHsl`: "max Sat is 1, in this code" (ADR-003).
const ACHROMATIC = 0.00001;

// CSS Color 4 sample code `rgbToHsl` (better-rgbToHsl.js).
function srgbToHsl(c: Srgb): Hsl {
  const { r, g, b } = c;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Halving each term is exact, so this equals (min + max) / 2 without its overflow (grill 32).
  const l = min / 2 + max / 2;
  const d = max - min;
  if (d < GREY_NOISE) return new Hsl(0, 0, l, c.alpha);
  let h = rgbToHue(r, g, b);
  let s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l);
  // Very out-of-gamut colors give a negative saturation: rotate the hue instead (csswg-drafts #9222).
  if (s < 0) {
    h += 180;
    s = Math.abs(s);
  }
  return new Hsl(s <= ACHROMATIC ? 0 : h, s, l, c.alpha);
}

/**
 * HSL: hue, saturation, lightness over sRGB (CSS Color 4 `hsl()`). Saturation and lightness are 0–1
 * fractions, not percentages: `new Hsl(30, 1, 0.5)` is `hsl(30 100% 50%)`.
 *
 * Not perceptual: equal `l` doesn't look equally light across hues. Use {@link Oklch} for that.
 * `h` wraps into [0, 360) on every write; a grey's hue is 0.
 *
 * @example
 * ```ts
 * new Hsl(30, 1, 0.5).toCss();              // 'hsl(30 100% 50%)'
 * Hsl.parse('hsl(30deg, 100%, 50%)');       // legacy comma syntax works too
 * ```
 */
export class Hsl extends HueColor {
  static readonly id = "hsl";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    l: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(Srgb, (c: Hsl) => new Srgb(...hslToRgb(c.h, c.s, c.l), c.alpha), srgbToHsl),
  ];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _l: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, l: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hsl");
    this._s = finite(s, "hsl", "s");
    this._l = finite(l, "hsl", "l");
  }

  get model(): "hsl" {
    return "hsl";
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hsl");
  }

  /** Saturation, 0–1 (not 0–100). */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "hsl", "s");
  }

  /** Lightness, 0 (black) to 1 (white), 0.5 for the pure hue. Not 0–100. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "hsl", "l");
  }

  get coords(): readonly [h: number, s: number, l: number] {
    return [this._h, this._s, this._l];
  }

  /** `true` when saturation is at most 0.00001, the CSS Color 4 threshold below which hue is meaningless. */
  override isAchromatic(): boolean {
    return this._s <= ACHROMATIC;
  }

  /** Adds `amount` × the `l` range (0–1) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–1) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` × the `s` reference range (0–1) to `s` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "s", amount);
  }

  /** Subtracts `amount` × the `s` reference range (0–1) from `s` (mutates). Not clamped: below 0 is stored as is. */
  desaturate(amount: number): this {
    return shift(this, "s", -amount);
  }

  /**
   * `n` new colors with this one's other channels and `l` evenly spaced from `from` to `to` (fractions
   * of the range, default 0.05–0.95). Steps are raw: map each for display, `c.to(Srgb).gamutMap()`.
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "l", n, options);
  }

  /**
   * Parses `hsl()` / `hsla()`, modern or legacy comma syntax. `s` and `l` take percentages or
   * 0–100 numbers. As in CSS, a negative saturation clamps to 0 at parse time.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hsl {
    const { coords, alpha } = readHueFunction(input, ["hsl", "hsla"], Hsl.channels, true);
    const [h = 0, s = 0, l = 0] = coords;
    // CSS Color 4 #the-hsl-notation: "if the saturation is less than 0% it is clamped to 0% at
    // parsed-value time".
    return new Hsl(h, Math.max(s, 0), l, alpha);
  }

  /** `hsl(h s% l%)`, shortest exact numbers. */
  override toString(): string {
    return serialize("hsl", Hsl.channels, this.coords, this.alpha, "exact", ["s", "l"]);
  }

  /** `hsl(h s% l%)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("hsl", Hsl.channels, this.coords, this.alpha, options, ["s", "l"]);
  }
}
