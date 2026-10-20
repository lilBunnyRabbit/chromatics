import { multiply } from "../../core/linear.js";
import { LINEAR_SMPTE_C_TO_XYZ_D65, XYZ_D65_TO_LINEAR_SMPTE_C } from "../../core/matrices.js";
import { linearToSmpte170m, smpte170mToLinear } from "../../core/transfer.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import type { Edge } from "../../core/model.js";

/**
 * SMPTE C (SMPTE 170M-2004 §4): the NTSC / BT.601 525-line primaries with D65 white, gamma-encoded with
 * 170M's transfer function (§5: 1.099·L^0.45 − 0.099, linear below 0.018), mirrored for negatives.
 *
 * Channels are 0–1 in gamut; values outside are stored as is. Not CSS.
 */
export class SmpteC extends RgbColor {
  static readonly id = "smpte-c";
  static readonly channels = {
    r: { range: [0, 1] },
    g: { range: [0, 1] },
    b: { range: [0, 1] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: SmpteC) =>
        new Xyz65(
          ...multiply(
            LINEAR_SMPTE_C_TO_XYZ_D65,
            smpte170mToLinear(c.r),
            smpte170mToLinear(c.g),
            smpte170mToLinear(c.b)
          ),
          c.alpha
        ),
      (c) => {
        const [r, g, b] = multiply(XYZ_D65_TO_LINEAR_SMPTE_C, c.x, c.y, c.z);
        return new SmpteC(linearToSmpte170m(r), linearToSmpte170m(g), linearToSmpte170m(b), c.alpha);
      }
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "smpte-c", "r");
    this._g = finite(g, "smpte-c", "g");
    this._b = finite(b, "smpte-c", "b");
  }

  get model(): "smpte-c" {
    return "smpte-c";
  }

  /** Red, 0–1 in gamut. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "smpte-c", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "smpte-c", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "smpte-c", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `smpte-c(r g b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): SmpteC {
    const { coords, alpha } = readFunction(input, ["smpte-c"], SmpteC.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new SmpteC(r, g, b, alpha);
  }

  /** `smpte-c(r g b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("smpte-c", SmpteC.channels, this.coords, this.alpha, "exact");
  }
}
