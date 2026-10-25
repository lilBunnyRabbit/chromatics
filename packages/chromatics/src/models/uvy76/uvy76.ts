import { chromaticity } from "../../core/luv.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// CIE 015:2018 eq. 8.1; inverse X = 9Y·u′ / (4v′), Z = Y·(12 − 3u′ − 20v′) / (4v′). v′ = 0 needs Y = 0: black.
function toUvy(c: Xyz65): Uvy76 {
  const uv = chromaticity(c.x, c.y, c.z) ?? [0, 0];
  return new Uvy76(uv[0], uv[1], c.y, c.alpha);
}

function toXyz(c: Uvy76): Xyz65 {
  if (c.v === 0) return new Xyz65(0, 0, 0, c.alpha);
  const k = c.Y / (4 * c.v);
  return new Xyz65(9 * c.u * k, c.Y, (12 - 3 * c.u - 20 * c.v) * k, c.alpha);
}

/**
 * CIE 1976 UCS chromaticity u′ v′ with luminance Y (CIE 015:2018 §8.1, eq. 8.1), the chromaticity diagram
 * CIELUV uses. Black (X + 15Y + 3Z = 0) is stored as u′ = v′ = 0. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(Uvy76);   // u′ 0.1978, v′ 0.4683: D65
 * ```
 */
export class Uvy76 extends RectangularColor {
  static readonly id = "uvy-1976";
  static readonly channels = {
    u: { range: [0, 0.7] },
    v: { range: [0, 0.7] },
    Y: { range: [0, 1] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toUvy)];
  static readonly terminal = false;

  private _u: number;
  private _v: number;
  private _Y: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(u: number, v: number, Y: number, alpha = 1) {
    super(alpha);
    this._u = finite(u, "uvy-1976", "u");
    this._v = finite(v, "uvy-1976", "v");
    this._Y = finite(Y, "uvy-1976", "Y");
  }

  get model(): "uvy-1976" {
    return "uvy-1976";
  }

  /** u′ = 4X / (X + 15Y + 3Z). */
  get u(): number {
    return this._u;
  }
  set u(value: number) {
    this._u = finite(value, "uvy-1976", "u");
  }

  /** v′ = 9Y / (X + 15Y + 3Z). */
  get v(): number {
    return this._v;
  }
  set v(value: number) {
    this._v = finite(value, "uvy-1976", "v");
  }

  /** Luminance Y, the same as Xyz65's. */
  get Y(): number {
    return this._Y;
  }
  set Y(value: number) {
    this._Y = finite(value, "uvy-1976", "Y");
  }

  get coords(): readonly [u: number, v: number, Y: number] {
    return [this._u, this._v, this._Y];
  }

  /**
   * Parses `uvy-1976(u v Y [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Uvy76 {
    const { coords, alpha } = readFunction(input, ["uvy-1976"], Uvy76.channels);
    const [u = 0, v = 0, Y = 0] = coords;
    return new Uvy76(u, v, Y, alpha);
  }

  /** `uvy-1976(u v Y)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("uvy-1976", Uvy76.channels, this.coords, this.alpha, "exact");
  }
}
