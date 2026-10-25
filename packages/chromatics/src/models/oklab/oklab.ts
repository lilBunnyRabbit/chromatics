import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { finite } from "../../core/channel.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { multiply } from "../../core/linear.js";
import type { Edge } from "../../core/model.js";
import { clamp } from "../../core/polar.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// CSS Color 4 sample code `XYZ_to_OKLab` / `OKLab_to_XYZ`: Ottosson's matrices recalculated for a
// consistent D65 white at 64-bit precision (csswg-drafts #6642, color.js #357). Ottosson's own
// 10-decimal matrices round-trip 1.2e-4 off near black (ADR-003).
export const XYZ_TO_LMS = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
] as const;
export const LMS_TO_OKLAB = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
] as const;
export const LMS_TO_XYZ = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
] as const;
export const OKLAB_TO_LMS = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092],
] as const;

function xyzToOklab(c: Xyz65): Oklab {
  const [l, m, s] = multiply(XYZ_TO_LMS, c.x, c.y, c.z);
  // Math.cbrt keeps the sign; a general power function would return NaN for negative LMS.
  return new Oklab(...multiply(LMS_TO_OKLAB, Math.cbrt(l), Math.cbrt(m), Math.cbrt(s)), c.alpha);
}

function oklabToXyz(c: Oklab): Xyz65 {
  const [l, m, s] = multiply(OKLAB_TO_LMS, c.l, c.a, c.b);
  return new Xyz65(...multiply(LMS_TO_XYZ, l ** 3, m ** 3, s ** 3), c.alpha);
}

/**
 * Oklab (Björn Ottosson, 2020): a perceptual space where equal distances look roughly equally
 * different. `l` is 0 (black) to 1 (white); `a` is green(−) to red(+), `b` blue(−) to yellow(+),
 * CSS reference range ±0.4. Use it for mixing, gradients and color distance (`deltaEOk`).
 *
 * Unbounded: out-of-gamut and imaginary colors are stored as given. Its cylindrical form is
 * {@link Oklch}.
 *
 * @example
 * ```ts
 * Oklab.parse('oklab(0.7 0.1 -0.05)');
 * Oklab.parse('oklab(70% 25% -12.5%)');    // percentages: l of 1, a / b of 0.4
 * ```
 */
export class Oklab extends RectangularColor {
  static readonly id = "oklab";
  static readonly channels = {
    l: { range: [0, 1], percent: 1 },
    a: { range: [-0.4, 0.4], percent: 0.4 },
    b: { range: [-0.4, 0.4], percent: 0.4 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, oklabToXyz, xyzToOklab)];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "oklab", "l");
    this._a = finite(a, "oklab", "a");
    this._b = finite(b, "oklab", "b");
  }

  get model(): "oklab" {
    return "oklab";
  }

  /** Perceptual lightness, 0 (black) to 1 (white). Not 0–100. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "oklab", "l");
  }

  /** Green (−) to red (+); CSS reference range ±0.4. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "oklab", "a");
  }

  /** Blue (−) to yellow (+); CSS reference range ±0.4. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "oklab", "b");
  }

  get coords(): readonly [l: number, a: number, b: number] {
    return [this._l, this._a, this._b];
  }

  /** Adds `amount` × the `l` range (0–1) to `l` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "l", amount);
  }

  /** Subtracts `amount` × the `l` range (0–1) from `l` (mutates). Not clamped. */
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

  /**
   * ΔEOK: the Euclidean distance to `other` in Oklab (CSS Color 4 `#color-difference-OK`). 0.02 is one
   * just-noticeable difference.
   *
   * @example
   * ```ts
   * a.to(Oklab).deltaEOk(b.to(Oklab));
   * ```
   */
  deltaEOk(other: Oklab): number {
    return Math.hypot(this._l - other._l, this._a - other._a, this._b - other._b);
  }

  /**
   * `true` when `other` is closer than one just-noticeable difference: ΔEOK < 0.02 (CSS Color 4
   * `#GMA-Binary-local-MINDE`: "one JND is an OkLCh difference of 0.02"; ADR-006).
   */
  looksSame(other: Oklab): boolean {
    return this.deltaEOk(other) < 0.02;
  }

  /**
   * Parses `oklab(l a b [/ alpha])`. Percentages: `l` of 1, `a` / `b` of 0.4. `l` clamps to 0–1 at
   * parse time, as in CSS; the constructor doesn't clamp.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Oklab {
    const { coords, alpha } = readFunction(input, ["oklab"], Oklab.channels);
    const [l = 0, a = 0, b = 0] = coords;
    // CSS Color 4 #specifying-oklab-oklch: L below 0% / above 100% clamps at parsed-value time.
    return new Oklab(clamp(l, 0, 1), a, b, alpha);
  }

  /** `oklab(l a b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("oklab", Oklab.channels, this.coords, this.alpha, "exact");
  }

  /** `oklab(l a b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("oklab", Oklab.channels, this.coords, this.alpha, options);
  }
}
