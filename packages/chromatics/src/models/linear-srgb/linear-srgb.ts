import { finite } from "../../core/channel.js";
import { RgbColor } from "../../core/families/rgb.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { multiply } from "../../core/linear.js";
import { LINEAR_SRGB_TO_XYZ_D65, XYZ_D65_TO_LINEAR_SRGB } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { sourceOver } from "../../core/composite.js";

/**
 * Linear-light sRGB: sRGB primaries and D65 white without the transfer curve (CSS Color 4
 * `srgb-linear`). Channels are proportional to light, so this is where light mixes physically.
 *
 * In gamut is 0–1 per channel; wider colors come out negative or above 1 and are stored as is.
 *
 * @example
 * ```ts
 * new LinearSrgb(0.5, 0.5, 0.5).to(Srgb).r; // above 0.5: half the light encodes lighter than mid-scale
 * ```
 */
export class LinearSrgb extends RgbColor {
  static readonly id = "srgb-linear";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: LinearSrgb) => new Xyz65(...multiply(LINEAR_SRGB_TO_XYZ_D65, c.r, c.g, c.b), c.alpha),
      (c) => new LinearSrgb(...multiply(XYZ_D65_TO_LINEAR_SRGB, c.x, c.y, c.z), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "srgb-linear", "r");
    this._g = finite(g, "srgb-linear", "g");
    this._b = finite(b, "srgb-linear", "b");
  }

  get model(): "srgb-linear" {
    return "srgb-linear";
  }

  /** Red, linear light, 0–1 in gamut. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "srgb-linear", "r");
  }

  /** Green, linear light, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "srgb-linear", "g");
  }

  /** Blue, linear light, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "srgb-linear", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Composites this color over `backdrop` (Porter-Duff source-over, CSS Compositing 1) in linear light,
   * which is physically additive, and returns this color (mutates). Browsers composite in gamma-encoded
   * sRGB: for that, `Srgb.over()`.
   *
   * @example
   * ```ts
   * const glass = new LinearSrgb(0, 0, 1, 0.5);
   * glass.over(new LinearSrgb(1, 1, 0)); // r 0.5, g 0.5, b 0.5, alpha 1
   * ```
   */
  over(backdrop: LinearSrgb): this {
    const [channels, alpha] = sourceOver(this.coords, this.alpha, backdrop.coords, backdrop.alpha);
    return this.assign(channels, alpha);
  }

  /**
   * Parses `color(srgb-linear r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): LinearSrgb {
    const { coords, alpha } = readColorFunction(input, ["srgb-linear"], LinearSrgb.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new LinearSrgb(r, g, b, alpha);
  }

  /** `color(srgb-linear r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", LinearSrgb.channels, this.coords, this.alpha, "exact", [], "srgb-linear");
  }

  /** `color(srgb-linear r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", LinearSrgb.channels, this.coords, this.alpha, options, [], "srgb-linear");
  }
}
