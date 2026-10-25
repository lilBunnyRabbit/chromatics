// Port of ok_color.h (MIT), Copyright (c) 2021 Björn Ottosson. See THIRD_PARTY_NOTICES.md.
import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readHueFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import type { Edge } from "../../core/model.js";
import { cusp, scaleL, shapeless, toe, toeInv } from "../../core/okhsl.js";
import { Oklab } from "../oklab/oklab.js";

// Oklch's grey threshold (CSS Color 4 `OKLab_to_OKLCH`), so the hue is dropped exactly where Oklch drops it.
const ACHROMATIC = 0.000004;
const RAD = Math.PI / 180;
// ok_color.h `okhsv_to_srgb`: S_0 = 0.5.
const S0 = 0.5;

// ok_color.h `okhsv_to_srgb`, ending in Oklab. v above 1 is outside sRGB and kept; grill 59: a result
// at or past white is white, v ≤ 0 black.
function toOklab(c: Okhsv): Oklab {
  const { h, s, v } = c;
  if (v <= 0) return new Oklab(0, 0, 0, c.alpha);
  if (s === 0) return new Oklab(Math.min(toeInv(v), 1), 0, 0, c.alpha);
  const a = Math.cos(h * RAD);
  const b = Math.sin(h * RAD);
  const top = cusp(a, b);
  const sMax = top.c / top.l;
  const tMax = top.c / (1 - top.l);
  const k = 1 - S0 / sMax;
  const lv = 1 - (s * S0) / (S0 + tMax - tMax * k * s);
  const cv = (s * tMax * S0) / (S0 + tMax - tMax * k * s);
  let l = v * lv;
  if (l <= 0) return new Oklab(0, 0, 0, c.alpha);
  let chroma = v * cv;
  const lvt = toeInv(lv);
  const cvt = (cv * lvt) / lv;
  const lNew = toeInv(l);
  chroma = (chroma * lNew) / l;
  l = lNew;
  const scale = scaleL(lvt, cvt, a, b);
  if (l * scale >= 1) return new Oklab(1, 0, 0, c.alpha);
  if (shapeless(l * scale)) return new Oklab(l * scale, 0, 0, c.alpha);
  return new Oklab(l * scale, chroma * scale * a, chroma * scale * b, c.alpha);
}

// ok_color.h `srgb_to_okhsv`, starting from Oklab. Grill 59: L outside (0, 1) is black / white.
function fromOklab(c: Oklab): Okhsv {
  const chroma = Math.hypot(c.a, c.b);
  const h = chroma <= ACHROMATIC ? 0 : Math.atan2(c.b, c.a) / RAD;
  if (c.l >= 1) return new Okhsv(0, 0, 1, c.alpha);
  if (c.l <= 0) return new Okhsv(0, 0, 0, c.alpha);
  if (chroma === 0 || shapeless(c.l)) return new Okhsv(0, 0, toe(c.l), c.alpha);
  // With the hue zeroed (grill 29), the shape is read along hue 0 too, so s and h describe one color.
  const a = h === 0 ? 1 : c.a / chroma;
  const b = h === 0 ? 0 : c.b / chroma;
  const top = cusp(a, b);
  const sMax = top.c / top.l;
  const tMax = top.c / (1 - top.l);
  const k = 1 - S0 / sMax;
  const t = tMax / (chroma + c.l * tMax);
  const lv = t * c.l;
  const cv = t * chroma;
  const lvt = toeInv(lv);
  const cvt = (cv * lvt) / lv;
  const scale = scaleL(lvt, cvt, a, b);
  const v = toe(c.l / scale) / lv;
  return new Okhsv(h, ((S0 + tMax) * cv) / (tMax * S0 + tMax * k * cv), v, c.alpha);
}

/**
 * Okhsv (Ottosson 2021): an HSV-like picker space built on {@link Oklab}. `v` = 1 is the top of sRGB
 * and `s` = 1 its edge, so (h, 1, 1) is the most chromatic sRGB color at that hue. Hue `h` in degrees
 * (Oklch's hue), `s` and `v` 0–1 fractions.
 *
 * sRGB only. Defined for Oklab L in [0, 1]: a color brighter than white or darker than black converts
 * to white / black (grill 59), the only place these conversions lose data. `v` > 1 is outside sRGB.
 * Not CSS: there is no `toCss()`. Built on this package's Oklab matrices with Ottosson's fitted
 * polynomials, so it agrees with ok_color.h, culori and colorjs to about 1e-6, not bit for bit.
 *
 * @example
 * ```ts
 * new Okhsv(30, 1, 1).to(Srgb);   // the sRGB cusp at hue 30
 * Okhsv.parse("okhsv(30 100% 100%)");
 * ```
 */
export class Okhsv extends HueColor {
  static readonly id = "okhsv";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    v: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Oklab, toOklab, fromOklab)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _v: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, v: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "okhsv");
    this._s = finite(s, "okhsv", "s");
    this._v = finite(v, "okhsv", "v");
  }

  get model(): "okhsv" {
    return "okhsv";
  }

  /** Hue angle in degrees, the same as {@link Oklch}'s, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "okhsv");
  }

  /** Saturation: 0 is grey (white at v = 1), 1 the sRGB edge. */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "okhsv", "s");
  }

  /** Value: 0 black, 1 the top of sRGB at this hue and saturation. */
  get v(): number {
    return this._v;
  }
  set v(value: number) {
    this._v = finite(value, "okhsv", "v");
  }

  get coords(): readonly [h: number, s: number, v: number] {
    return [this._h, this._s, this._v];
  }

  /** `true` when the Oklab chroma is at most 0.000004 (Oklch's threshold), or the color is black / white. */
  override isAchromatic(): boolean {
    const c = toOklab(this);
    return Math.hypot(c.a, c.b) <= ACHROMATIC;
  }

  /** Adds `amount` to `v` (a 0–1 fraction) and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "v", amount);
  }

  /** Subtracts `amount` from `v` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "v", -amount);
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
   * `n` new colors with this one's other channels and `v` evenly spaced from `from` to `to` (fractions
   * of the range, default 0.05–0.95).
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "v", n, options);
  }

  /**
   * Parses `okhsv(h s v [/ alpha])`: hue in degrees or any angle unit; `s` and `v` as percentages or
   * 0–100 numbers. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Okhsv {
    const { coords, alpha } = readHueFunction(input, ["okhsv"], Okhsv.channels);
    const [h = 0, s = 0, v = 0] = coords;
    return new Okhsv(h, s, v, alpha);
  }

  /** `okhsv(h s% v%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("okhsv", Okhsv.channels, this.coords, this.alpha, "exact", ["s", "v"]);
  }
}
