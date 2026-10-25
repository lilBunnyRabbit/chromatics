import { chromaticity } from "../../core/luv.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// CIE 015:2018 Annex A.4: u = u′, v = 2v′/3; inverse through u′ v′ as Uvy76.
function toUvy(c: Xyz65): Uvy60 {
  const uv = chromaticity(c.x, c.y, c.z) ?? [0, 0];
  return new Uvy60(uv[0], uv[1] / 1.5, c.y, c.alpha);
}

function toXyz(c: Uvy60): Xyz65 {
  if (c.v === 0) return new Xyz65(0, 0, 0, c.alpha);
  const k = c.Y / (6 * c.v);
  return new Xyz65(9 * c.u * k, c.Y, (12 - 3 * c.u - 30 * c.v) * k, c.alpha);
}

/**
 * CIE 1960 UCS chromaticity u v with luminance Y (CIE 015:2018 Annex A.4: v = 2v′/3):
 * the diagram correlated colour temperature is read in. Black is stored as u = v = 0. Not CSS.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(Uvy60);   // u 0.1978, v 0.3122: D65
 * ```
 */
export class Uvy60 extends RectangularColor {
  static readonly id = "uvy-1960";
  static readonly channels = {
    u: { range: [0, 0.7] },
    v: { range: [0, 0.5] },
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
    this._u = finite(u, "uvy-1960", "u");
    this._v = finite(v, "uvy-1960", "v");
    this._Y = finite(Y, "uvy-1960", "Y");
  }

  get model(): "uvy-1960" {
    return "uvy-1960";
  }

  /** u = 4X / (X + 15Y + 3Z). */
  get u(): number {
    return this._u;
  }
  set u(value: number) {
    this._u = finite(value, "uvy-1960", "u");
  }

  /** v = 6Y / (X + 15Y + 3Z). */
  get v(): number {
    return this._v;
  }
  set v(value: number) {
    this._v = finite(value, "uvy-1960", "v");
  }

  /** Luminance Y, the same as Xyz65's. */
  get Y(): number {
    return this._Y;
  }
  set Y(value: number) {
    this._Y = finite(value, "uvy-1960", "Y");
  }

  get coords(): readonly [u: number, v: number, Y: number] {
    return [this._u, this._v, this._Y];
  }

  /**
   * Parses `uvy-1960(u v Y [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Uvy60 {
    const { coords, alpha } = readFunction(input, ["uvy-1960"], Uvy60.channels);
    const [u = 0, v = 0, Y = 0] = coords;
    return new Uvy60(u, v, Y, alpha);
  }

  /** `uvy-1960(u v Y)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("uvy-1960", Uvy60.channels, this.coords, this.alpha, "exact");
  }
}
