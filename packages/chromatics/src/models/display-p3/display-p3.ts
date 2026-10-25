import { finite } from "../../core/channel.js";
import { RgbColor } from "../../core/families/rgb.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import type { Edge } from "../../core/model.js";
import { linearToSrgb, srgbToLinear } from "../../core/transfer.js";
import { LinearDisplayP3 } from "../linear-display-p3/linear-display-p3.js";

/**
 * Display P3: DCI-P3 primaries with the D65 white and the sRGB transfer curve (CSS Color 4
 * `display-p3`). A wider gamut than sRGB; what most current phones and Macs display.
 *
 * Channels are 0–1 in gamut; values outside are stored as is.
 *
 * @example
 * ```ts
 * DisplayP3.parse('color(display-p3 1 0 0)').to(Srgb).r; // > 1: P3 red is outside sRGB
 * ```
 */
export class DisplayP3 extends RgbColor {
  static readonly id = "display-p3";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      LinearDisplayP3,
      (c: DisplayP3) => new LinearDisplayP3(srgbToLinear(c.r), srgbToLinear(c.g), srgbToLinear(c.b), c.alpha),
      (c) => new DisplayP3(linearToSrgb(c.r), linearToSrgb(c.g), linearToSrgb(c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "display-p3", "r");
    this._g = finite(g, "display-p3", "g");
    this._b = finite(b, "display-p3", "b");
  }

  get model(): "display-p3" {
    return "display-p3";
  }

  /** Red, 0–1 in gamut, transfer-encoded like sRGB. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "display-p3", "r");
  }

  /** Green, 0–1 in gamut. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "display-p3", "g");
  }

  /** Blue, 0–1 in gamut. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "display-p3", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(display-p3 r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): DisplayP3 {
    const { coords, alpha } = readColorFunction(input, ["display-p3"], DisplayP3.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new DisplayP3(r, g, b, alpha);
  }

  /** `color(display-p3 r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", DisplayP3.channels, this.coords, this.alpha, "exact", [], "display-p3");
  }

  /** `color(display-p3 r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", DisplayP3.channels, this.coords, this.alpha, options, [], "display-p3");
  }
}
