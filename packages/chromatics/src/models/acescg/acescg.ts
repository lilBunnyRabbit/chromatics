import { multiply } from "../../core/linear.js";
import { AP0_TO_AP1, AP1_TO_AP0, LINEAR_AP1_TO_XYZ_D65, XYZ_D65_TO_LINEAR_AP1 } from "../../core/matrices.js";
import { Aces2065 } from "../aces2065-1/aces2065-1.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";

/**
 * ACEScg (Academy S-2014-004): scene-linear RGB on the AP1 primaries with the ACES white, the working space
 * for CG rendering and compositing. Converted to the D65 hub with Bradford (ACES CTL, OCIO); to
 * {@link Aces2065} with the spec's AP1 → AP0 matrix.
 *
 * Scene-referred: 0.18 is mid grey. Reference range [0, 65504]; negatives (colors outside AP1) are kept.
 * Not CSS.
 */
export class Acescg extends RectangularColor {
  static readonly id = "acescg";
  static readonly channels = {
    r: { range: [0, 65504] },
    g: { range: [0, 65504] },
    b: { range: [0, 65504] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Acescg) => new Xyz65(...multiply(LINEAR_AP1_TO_XYZ_D65, c.r, c.g, c.b), c.alpha),
      (c) => new Acescg(...multiply(XYZ_D65_TO_LINEAR_AP1, c.x, c.y, c.z), c.alpha)
    ),
    // S-2014-004 §4.5 TRA1 / TRA2: AP0 and AP1 share the ACES white, so no adaptation.
    edge(
      Aces2065,
      (c: Acescg) => new Aces2065(...multiply(AP1_TO_AP0, c.r, c.g, c.b), c.alpha),
      (c) => new Acescg(...multiply(AP0_TO_AP1, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "acescg", "r");
    this._g = finite(g, "acescg", "g");
    this._b = finite(b, "acescg", "b");
  }

  get model(): "acescg" {
    return "acescg";
  }

  /** Red, scene-linear (0.18 is mid grey). */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "acescg", "r");
  }

  /** Green, scene-linear (0.18 is mid grey). */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "acescg", "g");
  }

  /** Blue, scene-linear (0.18 is mid grey). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "acescg", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `acescg(r g b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Acescg {
    const { coords, alpha } = readFunction(input, ["acescg"], Acescg.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Acescg(r, g, b, alpha);
  }

  /** `acescg(r g b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("acescg", Acescg.channels, this.coords, this.alpha, "exact");
  }
}
