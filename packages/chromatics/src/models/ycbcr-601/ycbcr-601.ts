import { multiply } from "../../core/linear.js";
import { YCBCR_601_TO_RGB, RGB_TO_YCBCR_601 } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

/**
 * Y′CbCr with the BT.601-7 §2.5 luma weights (Kr 0.299, Kb 0.114), in the float form of ITU-T H.273 eq. 45–47:
 * Y′ 0–1, Cb = 0.5·(B′ − Y′)/(1 − Kb) and Cr = 0.5·(R′ − Y′)/(1 − Kr), each ±0.5, with no offset.
 * A matrix over the encoded Srgb values. Over sRGB this is sYCC (IEC 61966-2-1 Amd. 1) and JPEG / JFIF's Y′CbCr; YPbPr is the same analog form.
 *
 * Integer code values (8-bit 16–235, full-range JPEG) aren't modelled: scale these yourself. Not CSS.
 */
export class Ycbcr601 extends RectangularColor {
  static readonly id = "ycbcr-601";
  static readonly channels = {
    y: { range: [0, 1] },
    cb: { range: [-0.5, 0.5] },
    cr: { range: [-0.5, 0.5] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Ycbcr601) => new Srgb(...multiply(YCBCR_601_TO_RGB, c.y, c.cb, c.cr), c.alpha),
      (c) => new Ycbcr601(...multiply(RGB_TO_YCBCR_601, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _y: number;
  private _cb: number;
  private _cr: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(y: number, cb: number, cr: number, alpha = 1) {
    super(alpha);
    this._y = finite(y, "ycbcr-601", "y");
    this._cb = finite(cb, "ycbcr-601", "cb");
    this._cr = finite(cr, "ycbcr-601", "cr");
  }

  get model(): "ycbcr-601" {
    return "ycbcr-601";
  }

  /** Luma Y′, 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "ycbcr-601", "y");
  }

  /** Blue-difference Cb, ±0.5. */
  get cb(): number {
    return this._cb;
  }
  set cb(value: number) {
    this._cb = finite(value, "ycbcr-601", "cb");
  }

  /** Red-difference Cr, ±0.5. */
  get cr(): number {
    return this._cr;
  }
  set cr(value: number) {
    this._cr = finite(value, "ycbcr-601", "cr");
  }

  get coords(): readonly [y: number, cb: number, cr: number] {
    return [this._y, this._cb, this._cr];
  }

  /**
   * Parses `ycbcr-601(y cb cr [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ycbcr601 {
    const { coords, alpha } = readFunction(input, ["ycbcr-601"], Ycbcr601.channels);
    const [y = 0, cb = 0, cr = 0] = coords;
    return new Ycbcr601(y, cb, cr, alpha);
  }

  /** `ycbcr-601(y cb cr)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("ycbcr-601", Ycbcr601.channels, this.coords, this.alpha, "exact");
  }
}
