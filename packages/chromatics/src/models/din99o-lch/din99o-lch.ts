import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import type { Edge } from "../../core/model.js";
import { fromPolar, toPolar } from "../../core/polar.js";
import { Din99o } from "../din99o/din99o.js";

// Lch's CSS Color 4 grey threshold, on DIN99o's similar chroma scale (borrowed, as Lchuv65 does).
const ACHROMATIC = 0.0015;

/**
 * DIN99o LCh: {@link Din99o} in cylindrical form, the studio's `dlch`. Checked against culori only (grill 67).
 * Not CSS.
 */
export class Din99oLch extends HueColor {
  static readonly id = "din99o-lch";
  static readonly channels = {
    l: { range: [0, 100] },
    c: { range: [0, 60] },
    h: { range: [0, 360], hue: true },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Din99o,
      (c: Din99oLch) => new Din99o(c.l, ...fromPolar(c.c, c.h), c.alpha),
      (c) => new Din99oLch(c.l, ...toPolar(c.a, c.b, ACHROMATIC), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _c: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, c: number, h: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "din99o-lch", "l");
    this._c = finite(c, "din99o-lch", "c");
    this._h = wrapHue(h, "din99o-lch");
  }

  get model(): "din99o-lch" {
    return "din99o-lch";
  }

  /** Lightness, 0 black to 100 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "din99o-lch", "l");
  }

  /** Chroma: 0 is grey; reference range 0–60. Unbounded. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "din99o-lch", "c");
  }

  /** Hue angle in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "din99o-lch");
  }

  get coords(): readonly [l: number, c: number, h: number] {
    return [this._l, this._c, this._h];
  }

  /** `true` when chroma is at most 0.0015. */
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

  /** Adds `amount` × the `c` reference range to `c` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "c", amount);
  }

  /** Subtracts `amount` × the `c` reference range from `c` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "c", -amount);
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
   * Parses `din99o-lch(l c h [/ alpha])`: numbers, hue also in angle units. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Din99oLch {
    const { coords, alpha } = readFunction(input, ["din99o-lch"], Din99oLch.channels);
    const [l = 0, c = 0, h = 0] = coords;
    return new Din99oLch(l, c, h, alpha);
  }

  /** `din99o-lch(l c h)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("din99o-lch", Din99oLch.channels, this.coords, this.alpha, "exact");
  }
}
