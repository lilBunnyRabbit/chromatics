import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import type { Edge } from "../../core/model.js";
import { fromPolar, toPolar } from "../../core/polar.js";
import { Lab65 } from "../lab65/lab65.js";

// CSS Color 4 sample code `Lab_to_LCH` epsilon, as on Lch: the same CIELAB chroma scale.
const ACHROMATIC = 0.0015;

/**
 * CIE LCh(ab): {@link Lab65} in cylindrical form (CIE 015:2018 §8.2.1), D65. Lightness `l` 0–100, chroma
 * `c`, hue `h` in degrees. `h` wraps into [0, 360) on every write; a grey's hue is 0.
 *
 * Not CSS: `toString()` writes `lch-d65(l c h)`, which only {@link Lch65.parse} reads.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Lch65).h;
 * ```
 */
export class Lch65 extends HueColor {
  static readonly id = "lch-d65";
  static readonly channels = {
    l: { range: [0, 100] },
    c: { range: [0, 150] },
    h: { range: [0, 360], hue: true },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Lab65,
      (c: Lch65) => new Lab65(c._l, ...fromPolar(c._c, c._h), c.alpha),
      (c) => new Lch65(c.l, ...toPolar(c.a, c.b, ACHROMATIC), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _c: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, c: number, h: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lch-d65", "l");
    this._c = finite(c, "lch-d65", "c");
    this._h = wrapHue(h, "lch-d65");
  }

  get model(): "lch-d65" {
    return "lch-d65";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lch-d65", "l");
  }

  /** Chroma C\*ab: 0 is grey; reference range 0–150 (CSS Lch's). Unbounded. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "lch-d65", "c");
  }

  /** Hue angle h(ab) in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "lch-d65");
  }

  get coords(): readonly [l: number, c: number, h: number] {
    return [this._l, this._c, this._h];
  }

  /** `true` when chroma is at most 0.0015 (CSS Color 4 `Lab_to_LCH`, as on Lch). */
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

  /** Adds `amount` × the `c` reference range (0–150) to `c` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "c", amount);
  }

  /** Subtracts `amount` × the `c` reference range (0–150) from `c` (mutates). Not clamped: below 0 is stored as is. */
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
   * Parses `lch-d65(l c h [/ alpha])`: numbers, hue also in any CSS angle unit. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lch65 {
    const { coords, alpha } = readFunction(input, ["lch-d65"], Lch65.channels);
    const [l = 0, c = 0, h = 0] = coords;
    return new Lch65(l, c, h, alpha);
  }

  /** `lch-d65(l c h)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("lch-d65", Lch65.channels, this.coords, this.alpha, "exact");
  }
}
