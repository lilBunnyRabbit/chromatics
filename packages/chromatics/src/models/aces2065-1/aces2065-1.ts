import { multiply } from "../../core/linear.js";
import { LINEAR_AP0_TO_XYZ_D65, XYZ_D65_TO_LINEAR_AP0 } from "../../core/matrices.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";

/**
 * ACES2065-1 (SMPTE ST 2065-1; Academy S-2008-001): the ACES interchange encoding. Scene-linear RGB on the
 * AP0 primaries, which enclose the whole spectral locus, with the ACES white (x 0.32168, y 0.33767, close to
 * but not D60). Converted to the D65 hub with Bradford, as the ACES CTL output transforms and OCIO do.
 *
 * Scene-referred: 0.18 is mid grey and values above 1 are ordinary. The reference range is the spec's
 * half-float [0, 65504] (§4.2.2); nothing clamps. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(Aces2065); // ≈ (1, 1, 1): the hub adapts D65 white to the ACES white
 * ```
 */
export class Aces2065 extends RectangularColor {
  static readonly id = "aces2065-1";
  static readonly channels = {
    r: { range: [0, 65504] },
    g: { range: [0, 65504] },
    b: { range: [0, 65504] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Aces2065) => new Xyz65(...multiply(LINEAR_AP0_TO_XYZ_D65, c.r, c.g, c.b), c.alpha),
      (c) => new Aces2065(...multiply(XYZ_D65_TO_LINEAR_AP0, c.x, c.y, c.z), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "aces2065-1", "r");
    this._g = finite(g, "aces2065-1", "g");
    this._b = finite(b, "aces2065-1", "b");
  }

  get model(): "aces2065-1" {
    return "aces2065-1";
  }

  /** Red, scene-linear (0.18 is mid grey). */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "aces2065-1", "r");
  }

  /** Green, scene-linear (0.18 is mid grey). */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "aces2065-1", "g");
  }

  /** Blue, scene-linear (0.18 is mid grey). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "aces2065-1", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `aces2065-1(r g b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Aces2065 {
    const { coords, alpha } = readFunction(input, ["aces2065-1"], Aces2065.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Aces2065(r, g, b, alpha);
  }

  /** `aces2065-1(r g b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("aces2065-1", Aces2065.channels, this.coords, this.alpha, "exact");
  }
}
