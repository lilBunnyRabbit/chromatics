import { multiply } from "../../core/linear.js";
import { XYB_OPSIN, XYB_OPSIN_INVERSE } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { LinearSrgb } from "../linear-srgb/linear-srgb.js";

// libjxl `opsin_params.h` kOpsinAbsorbanceBias; `CubeRootAndAdd` subtracts its cube root so black is 0.
const BIAS = 0.0037930732552754493;
const ROOT = Math.cbrt(BIAS);

function toXyb(c: LinearSrgb): Xyb {
  const [l, m, s] = multiply(XYB_OPSIN, c.r, c.g, c.b).map((v) => Math.cbrt(v + BIAS) - ROOT) as [
    number,
    number,
    number,
  ];
  return new Xyb((l - m) / 2, (l + m) / 2, s, c.alpha);
}

function toLinear(c: Xyb): LinearSrgb {
  const [l, m, s] = [c.y + c.x, c.y - c.x, c.b].map((v) => (v + ROOT) ** 3 - BIAS) as [number, number, number];
  return new LinearSrgb(...multiply(XYB_OPSIN_INVERSE, l, m, s), c.alpha);
}

/**
 * XYB, JPEG XL's perceptual space (libjxl `enc_xyb.cc` @ f23e813b, BSD-3): opsin absorbance on linear sRGB
 * plus a bias, cube roots, then X = (L′ − M′)/2, Y = (L′ + M′)/2, B = S′. As in libjxl, B is S′ itself
 * (grey has b = y); culori's `xyb` stores S′ − Y′. Negatives keep their sign (libjxl clamps them; this
 * package doesn't lose data, ADR-003). Not CSS.
 */
export class Xyb extends RectangularColor {
  static readonly id = "xyb";
  static readonly channels = {
    x: { range: [-0.05, 0.05] },
    y: { range: [0, 1] },
    b: { range: [0, 1] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(LinearSrgb, toLinear, toXyb)];
  static readonly terminal = false;

  private _x: number;
  private _y: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(x: number, y: number, b: number, alpha = 1) {
    super(alpha);
    this._x = finite(x, "xyb", "x");
    this._y = finite(y, "xyb", "y");
    this._b = finite(b, "xyb", "b");
  }

  get model(): "xyb" {
    return "xyb";
  }

  /** X = (L′ − M′) / 2: red–green, near 0 for greys. */
  get x(): number {
    return this._x;
  }
  set x(value: number) {
    this._x = finite(value, "xyb", "x");
  }

  /** Y = (L′ + M′) / 2: luma-like, 0 black. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "xyb", "y");
  }

  /** B = S′: blue (equal to y for greys). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "xyb", "b");
  }

  get coords(): readonly [x: number, y: number, b: number] {
    return [this._x, this._y, this._b];
  }

  /**
   * Parses `xyb(x y b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Xyb {
    const { coords, alpha } = readFunction(input, ["xyb"], Xyb.channels);
    const [x = 0, y = 0, b = 0] = coords;
    return new Xyb(x, y, b, alpha);
  }

  /** `xyb(x y b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("xyb", Xyb.channels, this.coords, this.alpha, "exact");
  }
}
