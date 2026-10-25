import { shift, ramp, type RampOptions } from "../../core/adjust.js";
import { multiply } from "../../core/linear.js";
import {
  JZAZBZ_IZAZBZ_TO_LMS,
  JZAZBZ_LMS_TO_IZAZBZ,
  JZAZBZ_LMS_TO_XYZ,
  JZAZBZ_XYZ_TO_LMS,
} from "../../core/matrices.js";
import { pqDecode, pqEncode } from "../../core/transfer.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// Safdar et al. 2017, Opt. Express 25(13) 15131, eqs. 8–15 (forward) and Appendix A (inverse), in CSS
// Color HDR 1 §11.4's form: relative XYZ × 203 cd/m² (diffuse white, BT.2408-8 §2.1).
const YW = 203;
const B = 1.15;
const G = 0.66;
const D = -0.56;
const D0 = 1.6295499532821566e-11;
const P = (1.7 * 2523) / 32;

function toJzazbz(c: Xyz65): Jzazbz {
  const [x, y, z] = [c.x * YW, c.y * YW, c.z * YW];
  const lms = multiply(JZAZBZ_XYZ_TO_LMS, B * x - (B - 1) * z, G * y - (G - 1) * x, z);
  const [l, m, s] = lms.map((v) => pqEncode(v / 10000, P)) as [number, number, number];
  const [iz, a, b] = multiply(JZAZBZ_LMS_TO_IZAZBZ, l, m, s);
  return new Jzazbz(((1 + D) * iz) / (1 + D * iz) - D0, a, b, c.alpha);
}

function toXyz(c: Jzazbz): Xyz65 {
  const j = c.j + D0;
  const iz = j / (1 + D - D * j);
  const lms = multiply(JZAZBZ_IZAZBZ_TO_LMS, iz, c.a, c.b).map((v) => 10000 * pqDecode(v, P));
  const [xm, ym, z] = multiply(JZAZBZ_LMS_TO_XYZ, lms[0]!, lms[1]!, lms[2]!);
  const x = (xm + (B - 1) * z) / B;
  const y = (ym + (G - 1) * x) / G;
  return new Xyz65(x / YW, y / YW, z / YW, c.alpha);
}

/**
 * Jzazbz (Safdar et al. 2017): a perceptually uniform space for HDR and wide gamut, built on the PQ
 * curve, as CSS Color HDR 1 defines `jzazbz()`. Lightness `j` (Jz; diffuse white is about 0.222),
 * `a` / `b` opponent axes, CSS reference range ±0.21. D65.
 *
 * Takes absolute light: relative Y = 1 is 203 cd/m², the HDR reference white (BT.2408-8 §2.1, CSS HDR).
 * Light up to PQ's 10 000 cd/m² peak is in range. Negative light (out of gamut) passes through PQ mirrored
 * around PQ(0) and round-trips (grill 60). CSS HDR is an Editor's Draft; its syntax may still change.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(Jzazbz);   // jzazbz(0.22207 -0.00016 -0.00012): Jzazbz white isn't neutral
 * Jzazbz.parse("jzazbz(0.5 10% -10%)");
 * ```
 */
export class Jzazbz extends RectangularColor {
  static readonly id = "jzazbz";
  static readonly channels = {
    j: { range: [0, 1], percent: 1 },
    a: { range: [-0.21, 0.21], percent: 0.21 },
    b: { range: [-0.21, 0.21], percent: 0.21 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toJzazbz)];
  static readonly terminal = false;

  private _j: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(j: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._j = finite(j, "jzazbz", "j");
    this._a = finite(a, "jzazbz", "a");
    this._b = finite(b, "jzazbz", "b");
  }

  get model(): "jzazbz" {
    return "jzazbz";
  }

  /** Lightness Jz: 0 is black; diffuse white (203 cd/m²) is about 0.222. Unbounded. */
  get j(): number {
    return this._j;
  }
  set j(value: number) {
    this._j = finite(value, "jzazbz", "j");
  }

  /** Green (−) to red (+); CSS reference range ±0.21. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "jzazbz", "a");
  }

  /** Blue (−) to yellow (+); CSS reference range ±0.21. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "jzazbz", "b");
  }

  get coords(): readonly [j: number, a: number, b: number] {
    return [this._j, this._a, this._b];
  }

  /** Adds `amount` × the `j` range (0–1) to `j` and returns this color (mutates). Not clamped. */
  lighten(amount: number): this {
    return shift(this, "j", amount);
  }

  /** Subtracts `amount` × the `j` range (0–1) from `j` (mutates). Not clamped. */
  darken(amount: number): this {
    return shift(this, "j", -amount);
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
   * Parses `jzazbz(j a b [/ alpha])` (CSS Color HDR 1): numbers or percentages of the reference
   * ranges. Nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Jzazbz {
    const { coords, alpha } = readFunction(input, ["jzazbz"], Jzazbz.channels);
    const [j = 0, a = 0, b = 0] = coords;
    return new Jzazbz(j, a, b, alpha);
  }

  /** `jzazbz(j a b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("jzazbz", Jzazbz.channels, this.coords, this.alpha, "exact");
  }

  /** `jzazbz(j a b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("jzazbz", Jzazbz.channels, this.coords, this.alpha, options);
  }
}
