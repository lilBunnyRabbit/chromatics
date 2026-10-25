import { multiply } from "../../core/linear.js";
import { YIQ_TO_RGB, RGB_TO_YIQ } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

// Reference ranges: the extremes of each row over the RGB cube (rows sum to 0, so they're symmetric).
const I = RGB_TO_YIQ[1][0];
const Q = RGB_TO_YIQ[2][0] + RGB_TO_YIQ[2][2];

/**
 * YIQ, the NTSC encoding, with SMPTE 170M-2004 Annex A's precise values (eq. 6–7): I and Q are the reduced
 * B′ − Y′ and R′ − Y′ rotated 33°. A matrix over encoded sRGB. culori's `yiq` uses other digits
 * (about 4e-4 apart). Not CSS.
 */
export class Yiq extends RectangularColor {
  static readonly id = "yiq";
  static readonly channels = {
    y: { range: [0, 1] },
    i: { range: [-I, I] },
    q: { range: [-Q, Q] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Yiq) => new Srgb(...multiply(YIQ_TO_RGB, c.y, c.i, c.q), c.alpha),
      (c) => new Yiq(...multiply(RGB_TO_YIQ, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _y: number;
  private _i: number;
  private _q: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(y: number, i: number, q: number, alpha = 1) {
    super(alpha);
    this._y = finite(y, "yiq", "y");
    this._i = finite(i, "yiq", "i");
    this._q = finite(q, "yiq", "q");
  }

  get model(): "yiq" {
    return "yiq";
  }

  /** Luma Y′ (BT.601 weights), 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "yiq", "y");
  }

  /** In-phase I (orange–blue), ±0.5959. */
  get i(): number {
    return this._i;
  }
  set i(value: number) {
    this._i = finite(value, "yiq", "i");
  }

  /** Quadrature Q (purple–green), ±0.5227. */
  get q(): number {
    return this._q;
  }
  set q(value: number) {
    this._q = finite(value, "yiq", "q");
  }

  get coords(): readonly [y: number, i: number, q: number] {
    return [this._y, this._i, this._q];
  }

  /**
   * Parses `yiq(y i q [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Yiq {
    const { coords, alpha } = readFunction(input, ["yiq"], Yiq.channels);
    const [y = 0, i = 0, q = 0] = coords;
    return new Yiq(y, i, q, alpha);
  }

  /** `yiq(y i q)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("yiq", Yiq.channels, this.coords, this.alpha, "exact");
  }
}
