import { finite } from "../../core/channel.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import { multiply } from "../../core/linear.js";
import type { Edge } from "../../core/model.js";
import { LINEAR_DISPLAY_P3_TO_XYZ_D65, XYZ_D65_TO_LINEAR_DISPLAY_P3 } from "../../core/matrices.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * Linear-light Display P3: P3 primaries and D65 white without the transfer curve (CSS Color 4
 * `display-p3-linear`). Channels are proportional to light.
 *
 * @example
 * ```ts
 * new DisplayP3(1, 0.5, 0).to(LinearDisplayP3);
 * LinearDisplayP3.parse("color(display-p3-linear 1 0.2 0)");
 * ```
 */
export class LinearDisplayP3 extends RgbColor {
  static readonly id = "display-p3-linear";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: LinearDisplayP3) => new Xyz65(...multiply(LINEAR_DISPLAY_P3_TO_XYZ_D65, c.r, c.g, c.b), c.alpha),
      (c) => new LinearDisplayP3(...multiply(XYZ_D65_TO_LINEAR_DISPLAY_P3, c.x, c.y, c.z), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "display-p3-linear", "r");
    this._g = finite(g, "display-p3-linear", "g");
    this._b = finite(b, "display-p3-linear", "b");
  }

  get model(): "display-p3-linear" {
    return "display-p3-linear";
  }

  /** Red, 0–1 in gamut. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "display-p3-linear", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "display-p3-linear", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "display-p3-linear", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(display-p3-linear r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): LinearDisplayP3 {
    const { coords, alpha } = readColorFunction(input, ["display-p3-linear"], LinearDisplayP3.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new LinearDisplayP3(r, g, b, alpha);
  }

  /** `color(display-p3-linear r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", LinearDisplayP3.channels, this.coords, this.alpha, "exact", [], "display-p3-linear");
  }

  /** `color(display-p3-linear r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", LinearDisplayP3.channels, this.coords, this.alpha, options, [], "display-p3-linear");
  }
}
