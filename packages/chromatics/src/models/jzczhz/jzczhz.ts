import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite, wrapHue } from "../../core/channel.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { HueColor } from "../../core/families/hue.js";
import type { Edge } from "../../core/model.js";
import { fromPolar, toPolar } from "../../core/polar.js";
import { Jzazbz } from "../jzazbz/jzazbz.js";

// CSS Color HDR 1 §6.5, JzCzhz characteristics: "Powerless hue ε: Cz <= 0.0000026".
const ACHROMATIC = 0.0000026;

/**
 * JzCzhz: {@link Jzazbz} in cylindrical form, as CSS Color HDR 1 defines `jzczhz()`. Lightness `j` (Jz),
 * chroma `c` (Cz, CSS reference range 0–0.26), hue `h` in degrees from the positive `a` axis.
 *
 * `h` wraps into [0, 360) on every write. A grey's hue is 0, never `NaN`; check {@link isAchromatic}.
 * CSS HDR is an Editor's Draft; its syntax may still change.
 *
 * @example
 * ```ts
 * new Srgb(0, 1, 0).to(Jzczhz);   // jzczhz(0.17542 0.1614 132.50)
 * Jzczhz.parse("jzczhz(0.2 0.1 30deg)");
 * ```
 */
export class Jzczhz extends HueColor {
  static readonly id = "jzczhz";
  static readonly channels = {
    j: { range: [0, 1], percent: 1 },
    c: { range: [0, 0.26], percent: 0.26 },
    h: { range: [0, 360], hue: true },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Jzazbz,
      (c: Jzczhz) => new Jzazbz(c.j, ...fromPolar(c.c, c.h), c.alpha),
      (c) => new Jzczhz(c.j, ...toPolar(c.a, c.b, ACHROMATIC), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _j: number;
  private _c: number;
  private _h: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(j: number, c: number, h: number, alpha = 1) {
    super(alpha);
    this._j = finite(j, "jzczhz", "j");
    this._c = finite(c, "jzczhz", "c");
    this._h = wrapHue(h, "jzczhz");
  }

  get model(): "jzczhz" {
    return "jzczhz";
  }

  /** Lightness Jz: 0 is black; diffuse white (203 cd/m²) is about 0.222. Unbounded. */
  get j(): number {
    return this._j;
  }
  set j(value: number) {
    this._j = finite(value, "jzczhz", "j");
  }

  /** Chroma Cz: 0 is grey; CSS reference range 0–0.26. Unbounded. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "jzczhz", "c");
  }

  /** Hue angle hz in degrees, wrapped into [0, 360) on write. 0 for greys. */
  get h(): number {
    return this._h;
  }
  set h(value: number) {
    this._h = wrapHue(value, "jzczhz");
  }

  get coords(): readonly [j: number, c: number, h: number] {
    return [this._j, this._c, this._h];
  }

  /** `true` when chroma is at most 0.0000026, CSS Color HDR 1's powerless-hue threshold. */
  override isAchromatic(): boolean {
    return this._c <= ACHROMATIC;
  }

  /** Adds `amount` × the `j` range (0–1) to `j` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "j", amount);
  }

  /** Subtracts `amount` × the `j` range (0–1) from `j` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "j", -amount);
  }

  /** Adds `amount` × the `c` reference range (0–0.26) to `c` (mutates). Not clamped. */
  saturate(amount: number): this {
    return shift(this, "c", amount);
  }

  /** Subtracts `amount` × the `c` reference range (0–0.26) from `c` (mutates). Not clamped. */
  desaturate(amount: number): this {
    return shift(this, "c", -amount);
  }

  /**
   * `n` new colors with this one's other channels and `j` evenly spaced from `from` to `to` (fractions
   * of the range, default 0.05–0.95). Steps are raw: map each for display, `c.to(Srgb).gamutMap()`.
   *
   * @throws {RangeError} when `n` isn't an integer ≥ 2.
   */
  ramp(n: number, options: RampOptions = {}): this[] {
    return ramp(this, "j", n, options);
  }

  /**
   * Parses `jzczhz(j c h [/ alpha])` (CSS Color HDR 1): numbers or percentages of the reference ranges,
   * hue in degrees or any angle unit. Nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Jzczhz {
    const { coords, alpha } = readFunction(input, ["jzczhz"], Jzczhz.channels);
    const [j = 0, c = 0, h = 0] = coords;
    return new Jzczhz(j, c, h, alpha);
  }

  /** `jzczhz(j c h)`, shortest exact numbers. */
  override toString(): string {
    return serialize("jzczhz", Jzczhz.channels, this.coords, this.alpha, "exact");
  }

  /** `jzczhz(j c h)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("jzczhz", Jzczhz.channels, this.coords, this.alpha, options);
  }
}
