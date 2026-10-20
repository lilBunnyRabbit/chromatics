import { multiply } from "../../core/linear.js";
import { HPE_TO_XYZ, XYZ_TO_HPE } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

function toLms(c: Xyz65): Lms {
  return new Lms(...multiply(XYZ_TO_HPE, c.x, c.y, c.z), c.alpha);
}

function toXyz(c: Lms): Xyz65 {
  return new Xyz65(...multiply(HPE_TO_XYZ, c.l, c.m, c.s), c.alpha);
}

/**
 * LMS cone responses through the Hunt-Pointer-Estevez matrix, normalised to the equal-energy white
 * (colour-science `MATRIX_XYZ_TO_HPE`; grill 66): l m s = HPE · XYZ. D65 white is about (0.974, 1.016, 1.089),
 * not (1, 1, 1). Unbounded; nothing clamps. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 0, 0).to(Lms);
 * ```
 */
export class Lms extends RectangularColor {
  static readonly id = "lms";
  static readonly channels = {
    l: { range: [0, 1] },
    m: { range: [0, 1] },
    s: { range: [0, 1] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toLms)];
  static readonly terminal = false;

  private _l: number;
  private _m: number;
  private _s: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, m: number, s: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "lms", "l");
    this._m = finite(m, "lms", "m");
    this._s = finite(s, "lms", "s");
  }

  get model(): "lms" {
    return "lms";
  }

  /** Long-wavelength cone response. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "lms", "l");
  }

  /** Medium-wavelength cone response. */
  get m(): number {
    return this._m;
  }
  set m(value: number) {
    this._m = finite(value, "lms", "m");
  }

  /** Short-wavelength cone response. */
  get s(): number {
    return this._s;
  }
  set s(value: number) {
    this._s = finite(value, "lms", "s");
  }

  get coords(): readonly [l: number, m: number, s: number] {
    return [this._l, this._m, this._s];
  }

  /**
   * Parses `lms(l m s [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Lms {
    const { coords, alpha } = readFunction(input, ["lms"], Lms.channels);
    const [l = 0, m = 0, s = 0] = coords;
    return new Lms(l, m, s, alpha);
  }

  /** `lms(l m s)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("lms", Lms.channels, this.coords, this.alpha, "exact");
  }
}
