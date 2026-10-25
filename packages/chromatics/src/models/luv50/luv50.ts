import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import { luvToXyz, xyzToLuv } from "../../core/luv.js";
import { D50_WHITE } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { Xyz50 } from "../xyz50/xyz50.js";

/**
 * CIE 1976 L\*u\*v\* (CIELUV, CIE 015:2018 §8.2.2) relative to D50. Lightness `l` 0–100 (the same L\* as
 * {@link Lab}), `u` green(−)/red(+), `v` blue(−)/yellow(+). The ranges cover the sRGB gamut; values are
 * unbounded and never clamped. The D65 twin is {@link Luv65} (the white HSLuv uses); culori's `luv` is this one.
 *
 * Not CSS: there is no `toCss()`. `toString()` writes `luv-d50(l u v)`, which only {@link Luv50.parse} reads.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Luv50);
 * Luv50.parse("luv-d50(53.2 175 37.8)");
 * ```
 */
export class Luv50 extends RectangularColor {
  static readonly id = "luv-d50";
  static readonly channels = {
    l: { range: [0, 100] },
    u: { range: [-100, 200] },
    v: { range: [-150, 150] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz50,
      (c: Luv50) => new Xyz50(...luvToXyz(c._l, c._u, c._v, D50_WHITE), c.alpha),
      (c) => new Luv50(...xyzToLuv(c.x, c.y, c.z, D50_WHITE), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _u: number;
  private _v: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, u: number, v: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "luv-d50", "l");
    this._u = finite(u, "luv-d50", "u");
    this._v = finite(v, "luv-d50", "v");
  }

  get model(): "luv-d50" {
    return "luv-d50";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. At 0 the color is black whatever `u` and `v` say. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "luv-d50", "l");
  }

  /** Green (−) to red (+). */
  get u(): number {
    return this._u;
  }
  set u(value: number) {
    this._u = finite(value, "luv-d50", "u");
  }

  /** Blue (−) to yellow (+). */
  get v(): number {
    return this._v;
  }
  set v(value: number) {
    this._v = finite(value, "luv-d50", "v");
  }

  get coords(): readonly [l: number, u: number, v: number] {
    return [this._l, this._u, this._v];
  }

  /** Adds `amount` × the `l` range (0–100) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–100) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
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

  /** CIE ΔE\*uv (CIE 015:2018 eq. 8.35): the Euclidean distance to `other` in this space. */
  deltaEuv(other: Luv50): number {
    return Math.hypot(this._l - other._l, this._u - other._u, this._v - other._v);
  }

  /**
   * Parses `luv-d50(l u v [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Luv50 {
    const { coords, alpha } = readFunction(input, ["luv-d50"], Luv50.channels);
    const [l = 0, u = 0, v = 0] = coords;
    return new Luv50(l, u, v, alpha);
  }

  /** `luv-d50(l u v)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("luv-d50", Luv50.channels, this.coords, this.alpha, "exact");
  }
}
