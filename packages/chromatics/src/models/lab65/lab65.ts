import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import { deltaE2000, deltaE94, deltaECmc, labToXyz, xyzToLab, type Delta94Application } from "../../core/cielab.js";
import { D65_WHITE } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * CIE L\*a\*b\* (CIE 015:2018 §8.2.1) relative to D65, not CSS's D50 {@link Lab}: no chromatic
 * adaptation from the RGB spaces, which are all D65. Lightness `l` 0–100, `a` green(−)/red(+),
 * `b` blue(−)/yellow(+). Unbounded; nothing clamps.
 *
 * Not CSS: there is no `toCss()`. `toString()` writes `lab-d65(l a b)`, which only {@link Lab65.parse} reads.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Lab65);
 * a.to(Lab65).deltaE2000(b.to(Lab65));
 * ```
 */
export class Lab65 extends RectangularColor {
  static readonly id = "lab-d65";
  static readonly channels = {
    l: { range: [0, 100] },
    a: { range: [-125, 125] },
    b: { range: [-125, 125] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Lab65) => new Xyz65(...labToXyz(c._l, c._a, c._b, D65_WHITE), c.alpha),
      (c) => new Lab65(...xyzToLab(c.x, c.y, c.z, D65_WHITE), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lab-d65", "l");
    this._a = finite(a, "lab-d65", "a");
    this._b = finite(b, "lab-d65", "b");
  }

  get model(): "lab-d65" {
    return "lab-d65";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lab-d65", "l");
  }

  /** Green (−) to red (+); reference range ±125 (CSS Lab's). */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "lab-d65", "a");
  }

  /** Blue (−) to yellow (+); reference range ±125. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "lab-d65", "b");
  }

  get coords(): readonly [l: number, a: number, b: number] {
    return [this._l, this._a, this._b];
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

  /** CIE ΔE*ab (1976): the Euclidean distance to `other`. Prefer {@link deltaE2000}. */
  deltaE76(other: Lab65): number {
    return Math.hypot(this._l - other._l, this._a - other._a, this._b - other._b);
  }

  /** CIEDE2000 to `other`, kL = kC = kH = 1 (CIE 142-2001, after Sharma, Wu & Dalal 2005). Symmetric. */
  deltaE2000(other: Lab65): number {
    return deltaE2000(this, other);
  }

  /**
   * CIE94 color difference from this reference to the sample `other` (CIE 116-1995). Not symmetric: the
   * reference's chroma sets the weights. `application` picks CIE 116's weights, graphic arts (default) or
   * textiles. Superseded by {@link deltaE2000}; kept for workflows specified in ΔE94.
   *
   * @example
   * ```ts
   * standard.to(Lab65).deltaE94(sample.to(Lab65));
   * standard.to(Lab65).deltaE94(sample.to(Lab65), { application: "textiles" });
   * ```
   */
  deltaE94(other: Lab65, options: { application?: Delta94Application } = {}): number {
    return deltaE94(this, other, options.application ?? "graphic-arts");
  }

  /**
   * CMC l:c color difference from this reference to the sample `other` (Clarke, McDonald & Rigg 1984;
   * BS 6923). Not symmetric. Default 2:1, the acceptability setting; 1:1 is perceptibility.
   *
   * @example
   * ```ts
   * standard.to(Lab65).deltaECmc(sample.to(Lab65));            // l 2, c 1
   * standard.to(Lab65).deltaECmc(sample.to(Lab65), { l: 1 });  // 1:1
   * ```
   */
  deltaECmc(other: Lab65, options: { l?: number; c?: number } = {}): number {
    return deltaECmc(this, other, options.l ?? 2, options.c ?? 1);
  }

  /**
   * Parses `lab-d65(l a b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lab65 {
    const { coords, alpha } = readFunction(input, ["lab-d65"], Lab65.channels);
    const [l = 0, a = 0, b = 0] = coords;
    return new Lab65(l, a, b, alpha);
  }

  /** `lab-d65(l a b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("lab-d65", Lab65.channels, this.coords, this.alpha, "exact");
  }
}
