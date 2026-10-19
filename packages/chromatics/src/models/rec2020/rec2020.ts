import { finite } from "../../core/channel.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import { multiply } from "../../core/linear.js";
import type { Edge } from "../../core/model.js";
import { LINEAR_REC2020_TO_XYZ_D65, XYZ_D65_TO_LINEAR_REC2020 } from "../../core/matrices.js";
import { linearToRec2020, rec2020ToLinear } from "../../core/transfer.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * ITU-R BT.2020 (Rec. 2020), as CSS Color 4 `rec2020`: the UHDTV gamut with D65 white, decoded with the
 * BT.1886 reference curve (gamma 2.4). Wider than Display P3.
 *
 * Channels are 0–1 in gamut; values outside are stored as is.
 *
 * @example
 * ```ts
 * new Rec2020(0, 1, 0).to(DisplayP3).inGamut(); // false: Rec. 2020 green is outside P3
 * ```
 */
export class Rec2020 extends RgbColor {
  static readonly id = "rec2020";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Rec2020) =>
        new Xyz65(
          ...multiply(LINEAR_REC2020_TO_XYZ_D65, rec2020ToLinear(c.r), rec2020ToLinear(c.g), rec2020ToLinear(c.b)),
          c.alpha
        ),
      (c) => {
        const [r, g, b] = multiply(XYZ_D65_TO_LINEAR_REC2020, c.x, c.y, c.z);
        return new Rec2020(linearToRec2020(r), linearToRec2020(g), linearToRec2020(b), c.alpha);
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
    this._r = finite(r, "rec2020", "r");
    this._g = finite(g, "rec2020", "g");
    this._b = finite(b, "rec2020", "b");
  }

  get model(): "rec2020" {
    return "rec2020";
  }

  /** Red, 0–1 in gamut. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "rec2020", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "rec2020", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "rec2020", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(rec2020 r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Rec2020 {
    const { coords, alpha } = readColorFunction(input, ["rec2020"], Rec2020.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Rec2020(r, g, b, alpha);
  }

  /** `color(rec2020 r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", Rec2020.channels, this.coords, this.alpha, "exact", [], "rec2020");
  }

  /** `color(rec2020 r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", Rec2020.channels, this.coords, this.alpha, options, [], "rec2020");
  }
}
