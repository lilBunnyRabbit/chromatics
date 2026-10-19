// Port of HSLuv (hsluv/hsluv, MIT), Copyright (c) 2012-2026 Alexei Boronine, (c) 2016 Florian Dormont.
// See THIRD_PARTY_NOTICES.md.
import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readHueFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import { maxChromaForHue, singular } from "../../core/hsluv.js";
import type { Edge } from "../../core/model.js";
import { Lchuv65 } from "../lchuv65/lchuv65.js";

// The Lchuv65 grey threshold, so a color is achromatic exactly when its hue was dropped on the way in.
const ACHROMATIC = 0.0015;

function toLchuv(c: Hsluv): Lchuv65 {
  const l = c.l * 100;
  const end = singular(l);
  const chroma = end === undefined ? maxChromaForHue(l, c.h) * c.s : 0;
  return new Lchuv65(end ?? l, chroma, c.h, c.alpha);
}

function fromLchuv(c: Lchuv65): Hsluv {
  const end = singular(c.l);
  if (end !== undefined) return new Hsluv(c.h, 0, end / 100, c.alpha);
  return new Hsluv(c.h, c.c / maxChromaForHue(c.l, c.h), c.l / 100, c.alpha);
}

/**
 * HSLuv (hsluv.org): {@link Lchuv65} with chroma as a fraction `s` of the most sRGB holds at that
 * lightness and hue, so `s` = 1 is always the edge of sRGB and `l` is CIE L\*. Hue `h` in degrees;
 * `s` and `l` are 0–1 fractions (hsluv.org writes 0–100).
 *
 * D65, sRGB only. `s` > 1 is outside sRGB; nothing clamps. At `l` 0 or 1 every `s` is black or white.
 * Not CSS: there is no `toCss()`. Built on this package's exact CIELUV, so it agrees with the reference
 * implementation to about 1e-9, not bit for bit (ADR-011).
 *
 * @example
 * ```ts
 * new Hsluv(250, 1, 0.6).to(Srgb).inGamut();   // true: s = 1 is the sRGB edge
 * Hsluv.parse("hsluv(250 100% 60%)");
 * ```
 */
export class Hsluv extends HueColor {
  static readonly id = "hsluv";
  static readonly channels = {
    h: { range: [0, 360], hue: true },
    s: { range: [0, 1], percent: 1 },
    l: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Lchuv65, toLchuv, fromLchuv)];
  static readonly terminal = false;

  private _h: number;
  private _s: number;
  private _l: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(h: number, s: number, l: number, alpha = 1) {
    super(alpha);
    this._h = wrapHue(h, "hsluv");
    this._s = finite(s, "hsluv", "s");
    this._l = finite(l, "hsluv", "l");
  }

  get model(): "hsluv" {
    return "hsluv";
  }

  /** Hue angle h(uv) in degrees, the same as {@link Lchuv65}'s, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "hsluv");
  }

  /** Saturation: the fraction of the sRGB maximum chroma at this `l` and `h`. 0 is grey, 1 the gamut edge. */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "hsluv", "s");
  }

  /** CIE lightness L\* as a 0–1 fraction (L\* / 100): 0 is black, 1 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "hsluv", "l");
  }

  get coords(): readonly [h: number, s: number, l: number] {
    return [this._h, this._s, this._l];
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
   * Parses `hsluv(h s l [/ alpha])`: hue in degrees or any angle unit; `s` and `l` as percentages or
   * 0–100 numbers, like hsluv.org. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Hsluv {
    const { coords, alpha } = readHueFunction(input, ["hsluv"], Hsluv.channels);
    const [h = 0, s = 0, l = 0] = coords;
    return new Hsluv(h, s, l, alpha);
  }

  /** `hsluv(h s% l%)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hsluv", Hsluv.channels, this.coords, this.alpha, "exact", ["s", "l"]);
  }
}
