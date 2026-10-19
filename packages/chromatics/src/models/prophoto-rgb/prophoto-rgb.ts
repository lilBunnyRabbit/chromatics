import { finite } from "../../core/channel.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import { multiply } from "../../core/linear.js";
import type { Edge } from "../../core/model.js";
import { LINEAR_PROPHOTO_RGB_TO_XYZ_D50, XYZ_D50_TO_LINEAR_PROPHOTO_RGB } from "../../core/matrices.js";
import { linearToProphoto, prophotoToLinear } from "../../core/transfer.js";
import { Xyz50 } from "../xyz50/xyz50.js";

/**
 * ProPhoto RGB (ROMM RGB), as CSS Color 4 `prophoto-rgb`: a very wide gamut with D50 white and a gamma
 * 1.8 curve. Converts through {@link Xyz50}.
 *
 * Channels are 0–1 in gamut; values outside are stored as is.
 *
 * @example
 * ```ts
 * ProphotoRgb.parse("color(prophoto-rgb 0.4 0.2 0.1)").to(Lab);
 * ```
 */
export class ProphotoRgb extends RgbColor {
  static readonly id = "prophoto-rgb";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz50,
      (c: ProphotoRgb) =>
        new Xyz50(
          ...multiply(
            LINEAR_PROPHOTO_RGB_TO_XYZ_D50,
            prophotoToLinear(c.r),
            prophotoToLinear(c.g),
            prophotoToLinear(c.b)
          ),
          c.alpha
        ),
      (c) => {
        const [r, g, b] = multiply(XYZ_D50_TO_LINEAR_PROPHOTO_RGB, c.x, c.y, c.z);
        return new ProphotoRgb(linearToProphoto(r), linearToProphoto(g), linearToProphoto(b), c.alpha);
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
    this._r = finite(r, "prophoto-rgb", "r");
    this._g = finite(g, "prophoto-rgb", "g");
    this._b = finite(b, "prophoto-rgb", "b");
  }

  get model(): "prophoto-rgb" {
    return "prophoto-rgb";
  }

  /** Red, 0–1 in gamut. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "prophoto-rgb", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "prophoto-rgb", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "prophoto-rgb", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(prophoto-rgb r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): ProphotoRgb {
    const { coords, alpha } = readColorFunction(input, ["prophoto-rgb"], ProphotoRgb.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new ProphotoRgb(r, g, b, alpha);
  }

  /** `color(prophoto-rgb r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", ProphotoRgb.channels, this.coords, this.alpha, "exact", [], "prophoto-rgb");
  }

  /** `color(prophoto-rgb r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", ProphotoRgb.channels, this.coords, this.alpha, options, [], "prophoto-rgb");
  }
}
