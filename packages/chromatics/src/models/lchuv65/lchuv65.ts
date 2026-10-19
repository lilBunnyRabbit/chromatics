import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import type { Edge } from "../../core/model.js";
import { fromPolar, toPolar } from "../../core/polar.js";
import { Luv65 } from "../luv65/luv65.js";

// No source gives an LCh(uv) threshold; Lch's (CSS Color 4 `Lab_to_LCH`) is borrowed: both have L* 0–100
// and chroma on the same scale (ADR-011).
const ACHROMATIC = 0.0015;

/**
 * CIE LCh(uv): {@link Luv65} in cylindrical form (CIE 015:2018 eqs. 8.32–8.33), D65. Lightness `l` 0–100,
 * chroma `c` (0 is grey; the range covers sRGB), hue `h` in degrees.
 *
 * `h` wraps into [0, 360) on every write. A grey's hue is 0, never `NaN`; check {@link isAchromatic}
 * when the hue matters. Not CSS: `toString()` writes `lchuv-d65(l c h)`, which only {@link Lchuv65.parse} reads.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Lchuv65).h;
 * Lchuv65.parse("lchuv-d65(53.2 179 12.2)");
 * ```
 */
export class Lchuv65 extends HueColor {
  static readonly id = "lchuv-d65";
  static readonly channels = {
    l: { range: [0, 100] },
    c: { range: [0, 200] },
    h: { range: [0, 360], hue: true },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Luv65,
      (c: Lchuv65) => new Luv65(c._l, ...fromPolar(c._c, c._h), c.alpha),
      (c) => new Lchuv65(c.l, ...toPolar(c.u, c.v, ACHROMATIC), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _c: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, c: number, h: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lchuv-d65", "l");
    this._c = finite(c, "lchuv-d65", "c");
    this._h = wrapHue(h, "lchuv-d65");
  }

  get model(): "lchuv-d65" {
    return "lchuv-d65";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lchuv-d65", "l");
  }

  /** Chroma C\*uv: 0 is grey; sRGB reaches 179 (red, D65). Unbounded. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "lchuv-d65", "c");
  }

  /** Hue angle h(uv) in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "lchuv-d65");
  }

  get coords(): readonly [l: number, c: number, h: number] {
    return [this._l, this._c, this._h];
  }

  /** `true` when chroma is at most 0.0015 (Lch's CSS Color 4 threshold, borrowed). */
  override isAchromatic(): boolean {
    return this._c <= ACHROMATIC;
  }

  /** Adds `amount` × the `l` range (0–100) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–100) from `l` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "l", -amount);
  }

  /** Adds `amount` × the `c` range (0–200) to `c` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "c", amount);
  }

  /** Subtracts `amount` × the `c` range (0–200) from `c` (mutates). Not clamped: below 0 is stored as is. */
  desaturate(amount: number): this {
    return shift(this, "c", -amount);
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
   * Parses `lchuv-d65(l c h [/ alpha])`: numbers, hue also in any CSS angle unit. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lchuv65 {
    const { coords, alpha } = readFunction(input, ["lchuv-d65"], Lchuv65.channels);
    const [l = 0, c = 0, h = 0] = coords;
    return new Lchuv65(l, c, h, alpha);
  }

  /** `lchuv-d65(l c h)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("lchuv-d65", Lchuv65.channels, this.coords, this.alpha, "exact");
  }
}
