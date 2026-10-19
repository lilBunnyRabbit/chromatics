import { finite } from "../../core/channel.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import type { Edge } from "../../core/model.js";

/**
 * CIE XYZ relative to the D65 white, scaled so diffuse white has `y` = 1 (CSS Color 4 `xyz-d65`).
 * The hub of the conversion graph: every RGB space and Oklab connect here.
 *
 * Values are unbounded: `y` > 1 is brighter than diffuse white, negatives can come out of
 * chromatic adaptation. Nothing is clamped.
 *
 * @example
 * ```ts
 * const white = new Xyz65(0.9504559270516717, 1, 1.0890577507598784);
 * Xyz65.parse('color(xyz-d65 0.2 0.3 0.4)');
 * Xyz65.parse('color(xyz 0.2 0.3 0.4)');   // `xyz` is D65 in CSS
 * ```
 */
export class Xyz65 extends RectangularColor {
  static readonly id = "xyz-d65";
  static readonly channels = {
    x: { range: [0, 1], percent: 1 },
    y: { range: [0, 1], percent: 1 },
    z: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [];
  static readonly terminal = false;

  private _x: number;
  private _y: number;
  private _z: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(x: number, y: number, z: number, alpha = 1) {
    super(alpha);
    this._x = finite(x, "xyz-d65", "x");
    this._y = finite(y, "xyz-d65", "y");
    this._z = finite(z, "xyz-d65", "z");
  }

  get model(): "xyz-d65" {
    return "xyz-d65";
  }

  /** X tristimulus, D65-relative. */
  get x(): number {
    return this._x;
  }
  set x(value: number) {
    this._x = finite(value, "xyz-d65", "x");
  }

  /** Y, the luminance: 1 is diffuse white. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "xyz-d65", "y");
  }

  /** Z tristimulus, D65-relative. */
  get z(): number {
    return this._z;
  }
  set z(value: number) {
    this._z = finite(value, "xyz-d65", "z");
  }

  get coords(): readonly [x: number, y: number, z: number] {
    return [this._x, this._y, this._z];
  }

  /**
   * Parses `color(xyz-d65 x y z [/ alpha])`, or `color(xyz …)`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Xyz65 {
    const { coords, alpha } = readColorFunction(input, ["xyz-d65", "xyz"], Xyz65.channels);
    const [x = 0, y = 0, z = 0] = coords;
    return new Xyz65(x, y, z, alpha);
  }

  /** `color(xyz-d65 x y z)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", Xyz65.channels, this.coords, this.alpha, "exact", [], "xyz-d65");
  }

  /** `color(xyz-d65 x y z)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", Xyz65.channels, this.coords, this.alpha, options, [], "xyz-d65");
  }
}
