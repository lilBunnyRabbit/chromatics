import { finite } from "../../core/channel.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import { multiply } from "../../core/linear.js";
import type { Edge } from "../../core/model.js";
import { LINEAR_A98_RGB_TO_XYZ_D65, XYZ_D65_TO_LINEAR_A98_RGB } from "../../core/matrices.js";
import { a98ToLinear, linearToA98 } from "../../core/transfer.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * Adobe RGB (1998), as CSS Color 4 `a98-rgb`: wider than sRGB in the greens, D65 white, a pure power
 * curve of 563/256 (≈ 2.2).
 *
 * Channels are 0–1 in gamut; values outside are stored as is.
 *
 * @example
 * ```ts
 * A98Rgb.parse("color(a98-rgb 0.4 0.8 0.3)").to(Srgb);
 * ```
 */
export class A98Rgb extends RgbColor {
  static readonly id = "a98-rgb";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: A98Rgb) =>
        new Xyz65(
          ...multiply(LINEAR_A98_RGB_TO_XYZ_D65, a98ToLinear(c.r), a98ToLinear(c.g), a98ToLinear(c.b)),
          c.alpha
        ),
      (c) => {
        const [r, g, b] = multiply(XYZ_D65_TO_LINEAR_A98_RGB, c.x, c.y, c.z);
        return new A98Rgb(linearToA98(r), linearToA98(g), linearToA98(b), c.alpha);
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
    this._r = finite(r, "a98-rgb", "r");
    this._g = finite(g, "a98-rgb", "g");
    this._b = finite(b, "a98-rgb", "b");
  }

  get model(): "a98-rgb" {
    return "a98-rgb";
  }

  /** Red, 0–1 in gamut. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "a98-rgb", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "a98-rgb", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "a98-rgb", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(a98-rgb r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): A98Rgb {
    const { coords, alpha } = readColorFunction(input, ["a98-rgb"], A98Rgb.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new A98Rgb(r, g, b, alpha);
  }

  /** `color(a98-rgb r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", A98Rgb.channels, this.coords, this.alpha, "exact", [], "a98-rgb");
  }

  /** `color(a98-rgb r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", A98Rgb.channels, this.coords, this.alpha, options, [], "a98-rgb");
  }
}
