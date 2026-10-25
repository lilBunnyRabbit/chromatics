import { chromaticity } from "../../core/luv.js";
import { D65_WHITE } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

const [U0, V0p] = chromaticity(...D65_WHITE)!;
const V0 = V0p / 1.5;

function toUvw(c: Xyz65): Uvw64 {
  const w = 25 * Math.cbrt(100 * c.y) - 17;
  // Below the grill 45 floor (|Y| < 1e-12) W* + 17 cancels on the way back; U* V* there are invisible.
  const uv = Math.abs(c.y) < 1e-12 ? undefined : chromaticity(c.x, c.y, c.z);
  if (uv === undefined) return new Uvw64(0, 0, w, c.alpha);
  return new Uvw64(13 * w * (uv[0] - U0), 13 * w * (uv[1] / 1.5 - V0), w, c.alpha);
}

// At W* = 0 (Y ≈ 0.0031, not black) U* and V* must be 0, so u v are the white's. Within the grill 45 floor
// of it, U*/W* outruns the precision of X + 15Y + 3Z and the chromaticity can't come back, so it's the same.
function toXyz(c: Uvw64): Xyz65 {
  const y = ((c.W + 17) / 25) ** 3 / 100;
  if (Math.abs(y) < 1e-12) return new Xyz65(D65_WHITE[0] * y, y, D65_WHITE[2] * y, c.alpha);
  const flat = Math.abs(c.W) < 1e-12;
  const u = flat ? U0 : c.U / (13 * c.W) + U0;
  const v = flat ? V0 : c.V / (13 * c.W) + V0;
  if (v === 0) return new Xyz65(0, 0, 0, c.alpha);
  const k = y / (6 * v);
  return new Xyz65(9 * u * k, y, (12 - 3 * u - 30 * v) * k, c.alpha);
}

/**
 * CIE 1964 U\*V\*W\* (CIE 015:2018 Annex A.4, eqs. A.4–A.6, with Y as a percentage): W\* = 25·(100Y)^⅓ − 17,
 * U\* = 13W\*(u − u₀), V\* = 13W\*(v − v₀) on CIE 1960 u v, with u₀ v₀ the D65 white's. Black is W\* = −17.
 * Superseded by CIELUV; kept for older work. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(Uvw64);   // U* 0, V* 0, W* 99
 * ```
 */
export class Uvw64 extends RectangularColor {
  static readonly id = "uvw-1964";
  static readonly channels = {
    U: { range: [-100, 150] },
    V: { range: [-100, 100] },
    W: { range: [-17, 100] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toUvw)];
  static readonly terminal = false;

  private _U: number;
  private _V: number;
  private _W: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(U: number, V: number, W: number, alpha = 1) {
    super(alpha);
    this._U = finite(U, "uvw-1964", "U");
    this._V = finite(V, "uvw-1964", "V");
    this._W = finite(W, "uvw-1964", "W");
  }

  get model(): "uvw-1964" {
    return "uvw-1964";
  }

  /** U\* = 13 W\* (u − u₀). */
  get U(): number {
    return this._U;
  }
  set U(value: number) {
    this._U = finite(value, "uvw-1964", "U");
  }

  /** V\* = 13 W\* (v − v₀). */
  get V(): number {
    return this._V;
  }
  set V(value: number) {
    this._V = finite(value, "uvw-1964", "V");
  }

  /** W\* = 25 (100 Y)^⅓ − 17: −17 is black, 99 the white. */
  get W(): number {
    return this._W;
  }
  set W(value: number) {
    this._W = finite(value, "uvw-1964", "W");
  }

  get coords(): readonly [U: number, V: number, W: number] {
    return [this._U, this._V, this._W];
  }

  /**
   * Parses `uvw-1964(U V W [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Uvw64 {
    const { coords, alpha } = readFunction(input, ["uvw-1964"], Uvw64.channels);
    const [U = 0, V = 0, W = 0] = coords;
    return new Uvw64(U, V, W, alpha);
  }

  /** `uvw-1964(U V W)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("uvw-1964", Uvw64.channels, this.coords, this.alpha, "exact");
  }
}
