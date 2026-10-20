import { multiply } from "../../core/linear.js";
import { YCBCR_2020_TO_RGB, RGB_TO_YCBCR_2020 } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Rec2020 } from "../rec2020/rec2020.js";

/**
 * Y′CbCr with the BT.2020-2 Table 4 luma weights (Kr 0.2627, Kb 0.0593), in the float form of ITU-T H.273 eq. 45–47:
 * Y′ 0–1, Cb = 0.5·(B′ − Y′)/(1 − Kb) and Cr = 0.5·(R′ − Y′)/(1 − Kr), each ±0.5, with no offset.
 * A matrix over the encoded Rec2020 values. BT.2020's non-constant-luminance Y′CbCr (also BT.2100 Table 6).
 *
 * Integer code values (8-bit 16–235, full-range JPEG) aren't modelled: scale these yourself. Not CSS.
 */
export class Ycbcr2020 extends RectangularColor {
  static readonly id = "ycbcr-2020";
  static readonly channels = {
    y: { range: [0, 1] },
    cb: { range: [-0.5, 0.5] },
    cr: { range: [-0.5, 0.5] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Rec2020,
      (c: Ycbcr2020) => new Rec2020(...multiply(YCBCR_2020_TO_RGB, c.y, c.cb, c.cr), c.alpha),
      (c) => new Ycbcr2020(...multiply(RGB_TO_YCBCR_2020, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _y: number;
  private _cb: number;
  private _cr: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(y: number, cb: number, cr: number, alpha = 1) {
    super(alpha);
    this._y = finite(y, "ycbcr-2020", "y");
    this._cb = finite(cb, "ycbcr-2020", "cb");
    this._cr = finite(cr, "ycbcr-2020", "cr");
  }

  get model(): "ycbcr-2020" {
    return "ycbcr-2020";
  }

  /** Luma Y′, 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "ycbcr-2020", "y");
  }

  /** Blue-difference Cb, ±0.5. */
  get cb(): number {
    return this._cb;
  }
  set cb(value: number) {
    this._cb = finite(value, "ycbcr-2020", "cb");
  }

  /** Red-difference Cr, ±0.5. */
  get cr(): number {
    return this._cr;
  }
  set cr(value: number) {
    this._cr = finite(value, "ycbcr-2020", "cr");
  }

  get coords(): readonly [y: number, cb: number, cr: number] {
    return [this._y, this._cb, this._cr];
  }

  /**
   * Parses `ycbcr-2020(y cb cr [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ycbcr2020 {
    const { coords, alpha } = readFunction(input, ["ycbcr-2020"], Ycbcr2020.channels);
    const [y = 0, cb = 0, cr = 0] = coords;
    return new Ycbcr2020(y, cb, cr, alpha);
  }

  /** `ycbcr-2020(y cb cr)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("ycbcr-2020", Ycbcr2020.channels, this.coords, this.alpha, "exact");
  }
}
