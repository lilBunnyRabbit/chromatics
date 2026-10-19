import { finite } from "../../core/channel.js";
import { Color } from "../../core/color.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { multiply } from "../../core/linear.js";
import { XYZ_D50_TO_XYZ_D65, XYZ_D65_TO_XYZ_D50 } from "../../core/matrices.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

/**
 * CIE XYZ relative to the D50 white, `y` = 1 for diffuse white (CSS Color 4 `xyz-d50`). The
 * connection space of CIE Lab / LCH.
 *
 * Converts to {@link Xyz65} by Bradford chromatic adaptation (CSS Color 4 `D50_to_D65`, matrix derived
 * exactly from the 4-figure white chromaticities). Values are unbounded and never clamped.
 *
 * @example
 * ```ts
 * Xyz50.parse('color(xyz-d50 0.2 0.3 0.4)').to(Xyz65);
 * ```
 */
export class Xyz50 extends Color {
  static readonly id = "xyz-d50";
  static readonly channels = {
    x: { range: [0, 1], percent: 1 },
    y: { range: [0, 1], percent: 1 },
    z: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Xyz50) => new Xyz65(...multiply(XYZ_D50_TO_XYZ_D65, c.x, c.y, c.z), c.alpha),
      (c) => new Xyz50(...multiply(XYZ_D65_TO_XYZ_D50, c.x, c.y, c.z), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _x: number;
  private _y: number;
  private _z: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(x: number, y: number, z: number, alpha = 1) {
    super(alpha);
    this._x = finite(x, "xyz-d50", "x");
    this._y = finite(y, "xyz-d50", "y");
    this._z = finite(z, "xyz-d50", "z");
  }

  get model(): "xyz-d50" {
    return "xyz-d50";
  }

  /** X tristimulus, D50-relative. */
  get x(): number {
    return this._x;
  }
  set x(value: number) {
    this._x = finite(value, "xyz-d50", "x");
  }

  /** Y, the luminance: 1 is diffuse white. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "xyz-d50", "y");
  }

  /** Z tristimulus, D50-relative. */
  get z(): number {
    return this._z;
  }
  set z(value: number) {
    this._z = finite(value, "xyz-d50", "z");
  }

  get coords(): readonly [x: number, y: number, z: number] {
    return [this._x, this._y, this._z];
  }

  /**
   * Parses `color(xyz-d50 x y z [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Xyz50 {
    const { coords, alpha } = readColorFunction(input, ["xyz-d50"], Xyz50.channels);
    const [x = 0, y = 0, z = 0] = coords;
    return new Xyz50(x, y, z, alpha);
  }

  /** `color(xyz-d50 x y z)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", Xyz50.channels, this.coords, this.alpha, "exact", [], "xyz-d50");
  }

  /** `color(xyz-d50 x y z)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", Xyz50.channels, this.coords, this.alpha, options, [], "xyz-d50");
  }
}
