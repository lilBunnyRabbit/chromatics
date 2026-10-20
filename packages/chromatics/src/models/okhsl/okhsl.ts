// Port of ok_color.h (MIT), Copyright (c) 2021 Björn Ottosson. See THIRD_PARTY_NOTICES.md.
import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readHueFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import type { Edge } from "../../core/model.js";
import { chromas, shapeless, toe, toeInv } from "../../core/okhsl.js";
import { Oklab } from "../oklab/oklab.js";

// Oklch's grey threshold (CSS Color 4 `OKLab_to_OKLCH`), so the hue is dropped exactly where Oklch drops it.
const ACHROMATIC = 0.000004;
const RAD = Math.PI / 180;

// ok_color.h defines s up to the gamut edge, s = 1; its curve then runs into a pole. Beyond the edge the
// chroma grows linearly at the curve's slope there, dC/ds = 5·(Cmax − Cmid)² / k1, so every chroma has an
// s and the conversion round-trips (ADR-003; package-defined, not Ottosson's).
function edgeSlope(c0: number, mid: number, max: number): number {
  return 5 * (max - mid) * ((max - mid) / (0.3125 * mid * (mid / c0)));
}

// ok_color.h `okhsl_to_srgb`, ending in Oklab. Grill 59: l outside (0, 1) is black / white.
function toOklab(c: Okhsl): Oklab {
  const { h, s, l } = c;
  if (l >= 1) return new Oklab(1, 0, 0, c.alpha);
  if (l <= 0) return new Oklab(0, 0, 0, c.alpha);
  const lightness = toeInv(l);
  if (lightness >= 1) return new Oklab(1, 0, 0, c.alpha);
  if (s === 0 || shapeless(lightness)) return new Oklab(lightness, 0, 0, c.alpha);
  const a = Math.cos(h * RAD);
  const b = Math.sin(h * RAD);
  const [c0, mid, max] = chromas(lightness, a, b);
  let chroma: number;
  if (s < 0.8) {
    const t = 1.25 * s;
    const k1 = 0.8 * c0;
    const k2 = 1 - k1 / mid;
    chroma = (t * k1) / (1 - k2 * t);
  } else if (s <= 1) {
    const t = (s - 0.8) / 0.2;
    const k1 = 0.3125 * mid * (mid / c0);
    const k2 = 1 - k1 / (max - mid);
    chroma = mid + (t * k1) / (1 - k2 * t);
  } else {
    chroma = max + (s - 1) * edgeSlope(c0, mid, max);
  }
  return new Oklab(lightness, chroma * a, chroma * b, c.alpha);
}

// ok_color.h `srgb_to_okhsl`, starting from Oklab. Grill 59: L outside (0, 1) is black / white.
function fromOklab(c: Oklab): Okhsl {
  const chroma = Math.hypot(c.a, c.b);
  const h = chroma <= ACHROMATIC ? 0 : Math.atan2(c.b, c.a) / RAD;
  if (c.l >= 1) return new Okhsl(0, 0, 1, c.alpha);
  if (c.l <= 0) return new Okhsl(0, 0, 0, c.alpha);
  if (chroma === 0 || shapeless(c.l)) return new Okhsl(0, 0, toe(c.l), c.alpha);
  // With the hue zeroed (grill 29), the shape is read along hue 0 too, so s and h describe one color.
  const [c0, mid, max] = h === 0 ? chromas(c.l, 1, 0) : chromas(c.l, c.a / chroma, c.b / chroma);
  let s: number;
  if (chroma < mid) {
    const k1 = 0.8 * c0;
    const k2 = 1 - k1 / mid;
    s = (chroma / (k1 + k2 * chroma)) * 0.8;
  } else if (chroma <= max) {
    const k1 = 0.3125 * mid * (mid / c0);
    const k2 = 1 - k1 / (max - mid);
    const d = chroma - mid;
    s = 0.8 + 0.2 * (d / (k1 + k2 * d));
  } else {
    s = 1 + (chroma - max) / edgeSlope(c0, mid, max);
  }
  return new Okhsl(h, s, toe(c.l), c.alpha);
}

/**
 * Okhsl (Ottosson 2021): an HSL-like picker space built on {@link Oklab}. `s` = 1 is the edge of sRGB
 * at that hue and lightness, and `l` is Oklab L through Ottosson's toe, so it tracks CIE lightness. Hue
 * `h` in degrees (Oklch's hue), `s` and `l` 0–1 fractions.
 *
 * sRGB only. Defined for Oklab L in [0, 1]: a color brighter than white or darker than black converts
 * to white / black (grill 59), the only place these conversions lose data. `s` > 1 is outside sRGB.
 * Not CSS: there is no `toCss()`. Built on this package's Oklab matrices with Ottosson's fitted
 * polynomials, so it agrees with ok_color.h, culori and colorjs to about 1e-6, not bit for bit.
 *
 * @example
 * ```ts
 * new Okhsl(30, 1, 0.6).to(Srgb);
 * Okhsl.parse("okhsl(30 100% 60%)");
 * ```
 */
export class Okhsl extends HueColor {
  static readonly id = "okhsl";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    l: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Oklab, toOklab, fromOklab)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _l: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, l: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "okhsl");
    this._s = finite(s, "okhsl", "s");
    this._l = finite(l, "okhsl", "l");
  }

  get model(): "okhsl" {
    return "okhsl";
  }

  /** Hue angle in degrees, the same as {@link Oklch}'s, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "okhsl");
  }

  /** Saturation: 0 is grey, 1 the sRGB edge at this hue and lightness. */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "okhsl", "s");
  }

  /** Lightness: Oklab L through Ottosson's toe, 0 black to 1 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "okhsl", "l");
  }

  get coords(): readonly [h: number, s: number, l: number] {
    return [this._h, this._s, this._l];
  }

  /** `true` when the Oklab chroma is at most 0.000004 (Oklch's threshold), or the color is black / white. */
  override isAchromatic(): boolean {
    const c = toOklab(this);
    return Math.hypot(c.a, c.b) <= ACHROMATIC;
  }

  /** Adds `amount` to `l` (a 0–1 fraction) and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` to `s` (mutates). Not clamped: above 1 is outside sRGB. */
  saturate(amount: number): this {
    return shift(this, "s", amount);
  }

  /** Subtracts `amount` from `s` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "s", -amount);
  }

  /**
   * `n` new colors with this one's other channels and `l` evenly spaced from `from` to `to` (fractions
   * of the range, default 0.05–0.95).
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "l", n, options);
  }

  /**
   * Parses `okhsl(h s l [/ alpha])`: hue in degrees or any angle unit; `s` and `l` as percentages or
   * 0–100 numbers. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Okhsl {
    const { coords, alpha } = readHueFunction(input, ["okhsl"], Okhsl.channels);
    const [h = 0, s = 0, l = 0] = coords;
    return new Okhsl(h, s, l, alpha);
  }

  /** `okhsl(h s% l%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("okhsl", Okhsl.channels, this.coords, this.alpha, "exact", ["s", "l"]);
  }
}
