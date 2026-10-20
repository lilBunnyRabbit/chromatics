import { multiply } from "../../core/linear.js";
import { YUV_TO_RGB, RGB_TO_YUV } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// Reference ranges: SMPTE 170M's reduction factors times the largest B′ − Y′ (0.886) and R′ − Y′ (0.701).
const U = 0.492111 * 0.886;
const V = 0.877283 * 0.701;

/**
 * Y′UV, the PAL / NTSC analog color-difference form: U = 0.492111·(B′ − Y′), V = 0.877283·(R′ − Y′)
 * (SMPTE 170M-2004 Annex A eq. 4–5; BT.470's 0.493 / 0.877 carry the arithmetic slip 170M explains). A
 * matrix over encoded sRGB. Not CSS.
 */
export class Yuv extends RectangularColor {
  static readonly id = "yuv";
  static readonly channels = {
    y: { range: [0, 1] },
    u: { range: [-U, U] },
    v: { range: [-V, V] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Yuv) => new Srgb(...multiply(YUV_TO_RGB, c.y, c.u, c.v), c.alpha),
      (c) => new Yuv(...multiply(RGB_TO_YUV, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _y: number;
  private _u: number;
  private _v: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(y: number, u: number, v: number, alpha = 1) {
    super(alpha);
    this._y = finite(y, "yuv", "y");
    this._u = finite(u, "yuv", "u");
    this._v = finite(v, "yuv", "v");
  }

  get model(): "yuv" {
    return "yuv";
  }

  /** Luma Y′ (BT.601 weights), 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "yuv", "y");
  }

  /** U = 0.492111·(B′ − Y′), ±0.436. */
  get u(): number {
    return this._u;
  }
  set u(value: number) {
    this._u = finite(value, "yuv", "u");
  }

  /** V = 0.877283·(R′ − Y′), ±0.615. */
  get v(): number {
    return this._v;
  }
  set v(value: number) {
    this._v = finite(value, "yuv", "v");
  }

  get coords(): readonly [y: number, u: number, v: number] {
    return [this._y, this._u, this._v];
  }

  /**
   * Parses `yuv(y u v [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Yuv {
    const { coords, alpha } = readFunction(input, ["yuv"], Yuv.channels);
    const [y = 0, u = 0, v = 0] = coords;
    return new Yuv(y, u, v, alpha);
  }

  /** `yuv(y u v)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("yuv", Yuv.channels, this.coords, this.alpha, "exact");
  }
}
