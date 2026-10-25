import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// CIE 015:2018 eq. 7.5. y = 0 has no XYZ unless Y = 0 too; both give black, as in colour-science.
function toXyy(c: Xyz65): Xyy {
  const sum = c.x + c.y + c.z;
  if (sum === 0) return new Xyy(0, 0, c.y, c.alpha);
  return new Xyy(c.x / sum, c.y / sum, c.y, c.alpha);
}

function toXyz(c: Xyy): Xyz65 {
  if (c.y === 0) return new Xyz65(0, 0, 0, c.alpha);
  const k = c.Y / c.y;
  return new Xyz65(c.x * k, c.Y, (1 - c.x - c.y) * k, c.alpha);
}

/**
 * CIE xyY (CIE 015:2018 §7.3, eq. 7.5): chromaticity `x`, `y` and luminance `Y` of {@link Xyz65} (white Y = 1).
 * Black (X + Y + Z = 0) has no chromaticity and is stored as x = y = 0, as colour-science does. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(Xyy);   // xyy(0.3127 0.329 1): D65
 * ```
 */
export class Xyy extends RectangularColor {
  static readonly id = "xyy";
  static readonly channels = {
    x: { range: [0, 1] },
    y: { range: [0, 1] },
    Y: { range: [0, 1] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toXyy)];
  static readonly terminal = false;

  private _x: number;
  private _y: number;
  private _Y: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(x: number, y: number, Y: number, alpha = 1) {
    super(alpha);
    this._x = finite(x, "xyy", "x");
    this._y = finite(y, "xyy", "y");
    this._Y = finite(Y, "xyy", "Y");
  }

  get model(): "xyy" {
    return "xyy";
  }

  /** Chromaticity x = X / (X + Y + Z). */
  get x(): number {
    return this._x;
  }
  set x(value: number) {
    this._x = finite(value, "xyy", "x");
  }

  /** Chromaticity y = Y / (X + Y + Z). */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "xyy", "y");
  }

  /** Luminance Y, the same as Xyz65's: 1 is the white. */
  get Y(): number {
    return this._Y;
  }
  set Y(value: number) {
    this._Y = finite(value, "xyy", "Y");
  }

  get coords(): readonly [x: number, y: number, Y: number] {
    return [this._x, this._y, this._Y];
  }

  /**
   * Correlated colour temperature in kelvin from the chromaticity, by McCamy's cubic (McCamy 1992, Color
   * Res. Appl. 17(2) 142–144): `n = (x − 0.3320) / (y − 0.1858)`, `T = −449n³ + 3525n² − 6823.3n + 5520.33`.
   * The fit holds for roughly 2000–12500 K near the Planckian locus; outside it the cubic's value is
   * returned as is, and it is not finite at y = 0.1858.
   *
   * @example
   * ```ts
   * new Xyy(0.3127, 0.329, 1).cct(); // ≈ 6505 (D65)
   * ```
   */
  cct(): number {
    const n = (this._x - 0.332) / (this._y - 0.1858);
    return -449 * n ** 3 + 3525 * n ** 2 - 6823.3 * n + 5520.33;
  }

  /**
   * Parses `xyy(x y Y [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Xyy {
    const { coords, alpha } = readFunction(input, ["xyy"], Xyy.channels);
    const [x = 0, y = 0, Y = 0] = coords;
    return new Xyy(x, y, Y, alpha);
  }

  /** `xyy(x y Y)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("xyy", Xyy.channels, this.coords, this.alpha, "exact");
  }
}
