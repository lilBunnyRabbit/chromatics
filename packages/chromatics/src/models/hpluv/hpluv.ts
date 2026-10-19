// Port of HSLuv (hsluv/hsluv, MIT), Copyright (c) 2012-2026 Alexei Boronine, (c) 2016 Florian Dormont.
// See THIRD_PARTY_NOTICES.md.
import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readHueFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import { maxChroma, singular } from "../../core/hsluv.js";
import type { Edge } from "../../core/model.js";
import { Lchuv65 } from "../lchuv65/lchuv65.js";

// The Lchuv65 grey threshold, so a color is achromatic exactly when its hue was dropped on the way in.
const ACHROMATIC = 0.0015;

function toLchuv(c: Hpluv): Lchuv65 {
  const l = c.l * 100;
  const end = singular(l);
  const chroma = end === undefined ? maxChroma(l) * c.p : 0;
  return new Lchuv65(end ?? l, chroma, c.h, c.alpha);
}

function fromLchuv(c: Lchuv65): Hpluv {
  const end = singular(c.l);
  if (end !== undefined) return new Hpluv(c.h, 0, end / 100, c.alpha);
  return new Hpluv(c.h, c.c / maxChroma(c.l), c.l / 100, c.alpha);
}

/**
 * HPLuv (hsluv.org): {@link Lchuv65} with chroma as a fraction `p` of the largest hue circle sRGB holds
 * at that lightness. Every hue reaches the same chroma, so `p` ≤ 1 gives pastels that are always in
 * sRGB; brighter colors need `p` > 1 (#11ee00 is 3.08 in the HSLuv snapshot). `l` is CIE L\* / 100.
 *
 * D65, sRGB only. Nothing clamps. At `l` 0 or 1 every `p` is black or white. Not CSS: there is no
 * `toCss()`. Built on this package's exact CIELUV (ADR-011).
 *
 * @example
 * ```ts
 * new Hpluv(250, 1, 0.6).to(Srgb).inGamut();   // true for any hue
 * Hpluv.parse("hpluv(250 100% 60%)");
 * ```
 */
export class Hpluv extends HueColor {
  static readonly id = "hpluv";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    p: { range: [0, 1], percent: 1 },
    l: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Lchuv65, toLchuv, fromLchuv)];
  static readonly terminal = false;

  private _h: number;
  private _p: number;
  private _l: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, p: number, l: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hpluv");
    this._p = finite(p, "hpluv", "p");
    this._l = finite(l, "hpluv", "l");
  }

  get model(): "hpluv" {
    return "hpluv";
  }

  /** Hue angle h(uv) in degrees, the same as {@link Lchuv65}'s, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hpluv");
  }

  /** The fraction of the largest in-gamut hue circle at this `l`. 0 is grey; above 1 some hues leave sRGB. */
  get p(): number {
    return this._p;
  }
  set p(value: number) {
    this._p = finite(value, "hpluv", "p");
  }

  /** CIE lightness L\* as a 0–1 fraction (L\* / 100): 0 is black, 1 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "hpluv", "l");
  }

  get coords(): readonly [h: number, p: number, l: number] {
    return [this._h, this._p, this._l];
  }

  /** `true` when the Lchuv65 chroma is at most 0.0015, or `l` is black / white: the hue is meaningless. */
  override isAchromatic(): boolean {
    return Math.abs(toLchuv(this).c) <= ACHROMATIC;
  }

  /** Adds `amount` to `l` (a 0–1 fraction) and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` to `p` (mutates). Not clamped: above 1 is outside sRGB. */
  saturate(amount: number): this {
    return shift(this, "p", amount);
  }

  /** Subtracts `amount` from `p` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "p", -amount);
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
   * Parses `hpluv(h p l [/ alpha])`: hue in degrees or any angle unit; `p` and `l` as percentages or
   * 0–100 numbers, like hsluv.org. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hpluv {
    const { coords, alpha } = readHueFunction(input, ["hpluv"], Hpluv.channels);
    const [h = 0, p = 0, l = 0] = coords;
    return new Hpluv(h, p, l, alpha);
  }

  /** `hpluv(h p% l%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hpluv", Hpluv.channels, this.coords, this.alpha, "exact", ["p", "l"]);
  }
}
