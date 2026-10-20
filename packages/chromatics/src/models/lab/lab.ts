import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite } from "../../core/channel.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { deltaE2000, labToXyz, xyzToLab } from "../../core/cielab.js";
import { D50_WHITE } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { clamp } from "../../core/polar.js";
import { Xyz50 } from "../xyz50/xyz50.js";

function xyzToLab50(c: Xyz50): Lab {
  return new Lab(...xyzToLab(c.x, c.y, c.z, D50_WHITE), c.alpha);
}

function labToXyz50(c: Lab): Xyz50 {
  return new Xyz50(...labToXyz(c.l, c.a, c.b, D50_WHITE), c.alpha);
}

/**
 * CIE L\*a\*b\* (CIE 1976) relative to D50, as CSS Color 4 defines `lab()`. Lightness `l` 0–100,
 * `a` green(−)/red(+) and `b` blue(−)/yellow(+), CSS reference range ±125. The space of ΔE 2000.
 *
 * For perceptual work prefer {@link Oklab}. Unbounded; nothing clamps
 * except at parse time.
 *
 * @example
 * ```ts
 * Lab.parse('lab(52.2 40 59.2)');
 * Lab.parse('lab(52% 32% 47%)');          // percentages: l of 100, a / b of 125
 * ```
 */
export class Lab extends RectangularColor {
  static readonly id = "lab";
  static readonly channels = {
    l: { range: [0, 100], percent: 100 },
    a: { range: [-125, 125], percent: 125 },
    b: { range: [-125, 125], percent: 125 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz50, labToXyz50, xyzToLab50)];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lab", "l");
    this._a = finite(a, "lab", "a");
    this._b = finite(b, "lab", "b");
  }

  get model(): "lab" {
    return "lab";
  }

  /** CIE lightness L\*, 0 (black) to 100 (diffuse white). Not 0–1. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lab", "l");
  }

  /** Green (−) to red (+); CSS reference range ±125. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "lab", "a");
  }

  /** Blue (−) to yellow (+); CSS reference range ±125. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "lab", "b");
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

  /** CIE ΔE*ab (1976): the Euclidean distance to `other` in Lab. Prefer {@link deltaE2000}, which corrects Lab's non-uniformity. */
  deltaE76(other: Lab): number {
    return Math.hypot(this._l - other._l, this._a - other._a, this._b - other._b);
  }

  /**
   * CIEDE2000 color difference to `other`, with kL = kC = kH = 1 (CIE 142-2001; implemented after Sharma,
   * Wu & Dalal 2005 and checked against their 34 published test pairs). Symmetric.
   *
   * @example
   * ```ts
   * a.to(Lab).deltaE2000(b.to(Lab)); // CSS Color 4 takes 2 as one just-noticeable difference
   * ```
   */
  deltaE2000(other: Lab): number {
    return deltaE2000(this, other);
  }

  /**
   * Parses `lab(l a b [/ alpha])`. Percentages: `l` of 100, `a` / `b` of 125. As in CSS, `l` clamps to
   * 0–100 at parse time.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lab {
    const { coords, alpha } = readFunction(input, ["lab"], Lab.channels);
    const [l = 0, a = 0, b = 0] = coords;
    // CSS Color 4 #specifying-lab-lch: L below 0% / above 100% clamps at parsed-value time.
    return new Lab(clamp(l, 0, 100), a, b, alpha);
  }

  /** `lab(l a b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("lab", Lab.channels, this.coords, this.alpha, "exact");
  }

  /** `lab(l a b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("lab", Lab.channels, this.coords, this.alpha, options);
  }
}
