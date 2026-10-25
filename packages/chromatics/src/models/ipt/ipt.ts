import { multiply } from "../../core/linear.js";
import { IPT_IPT_TO_LMS, IPT_LMS_TO_IPT, IPT_LMS_TO_XYZ, IPT_XYZ_TO_LMS } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// Ebner & Fairchild 1998 Eq. 1: LMS′ = LMS^0.43, sign-preserving for negative (out-of-gamut) responses.
const spow = (x: number, p: number) => Math.sign(x) * Math.abs(x) ** p;

function toIpt(c: Xyz65): Ipt {
  const lms = multiply(IPT_XYZ_TO_LMS, c.x, c.y, c.z).map((v) => spow(v, 0.43)) as [number, number, number];
  return new Ipt(...multiply(IPT_LMS_TO_IPT, ...lms), c.alpha);
}

function toXyz(c: Ipt): Xyz65 {
  const lms = multiply(IPT_IPT_TO_LMS, c.i, c.p, c.t).map((v) => spow(v, 1 / 0.43)) as [number, number, number];
  return new Xyz65(...multiply(IPT_LMS_TO_XYZ, ...lms), c.alpha);
}

/**
 * IPT (Ebner & Fairchild 1998, IS&T CIC6, Eq. 1): intensity `i`, protan (red–green) `p`, tritan
 * (yellow–blue) `t`, built for hue uniformity. D65; white is i ≈ 1 (0.99999 with this package's D65, as
 * published matrices give). Not CSS.
 */
export class Ipt extends RectangularColor {
  static readonly id = "ipt";
  static readonly channels = {
    i: { range: [0, 1] },
    p: { range: [-1, 1] },
    t: { range: [-1, 1] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toIpt)];
  static readonly terminal = false;

  private _i: number;
  private _p: number;
  private _t: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(i: number, p: number, t: number, alpha = 1) {
    super(alpha);
    this._i = finite(i, "ipt", "i");
    this._p = finite(p, "ipt", "p");
    this._t = finite(t, "ipt", "t");
  }

  get model(): "ipt" {
    return "ipt";
  }

  /** Intensity, 0 black to about 1 white. */
  get i(): number {
    return this._i;
  }
  set i(value: number) {
    this._i = finite(value, "ipt", "i");
  }

  /** Red (+) / green (−). */
  get p(): number {
    return this._p;
  }
  set p(value: number) {
    this._p = finite(value, "ipt", "p");
  }

  /** Yellow (+) / blue (−). */
  get t(): number {
    return this._t;
  }
  set t(value: number) {
    this._t = finite(value, "ipt", "t");
  }

  get coords(): readonly [i: number, p: number, t: number] {
    return [this._i, this._p, this._t];
  }

  /**
   * Parses `ipt(i p t [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ipt {
    const { coords, alpha } = readFunction(input, ["ipt"], Ipt.channels);
    const [i = 0, p = 0, t = 0] = coords;
    return new Ipt(i, p, t, alpha);
  }

  /** `ipt(i p t)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("ipt", Ipt.channels, this.coords, this.alpha, "exact");
  }
}
