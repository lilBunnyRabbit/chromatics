import { multiply } from "../../core/linear.js";
import { YCGCO_TO_RGB, RGB_TO_YCGCO } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

/**
 * YCgCo (ITU-T H.273 eq. 51–53, Malvar & Sullivan): Y = ½G + ¼(R + B), Cg = ½G − ¼(R + B), Co = ½(R − B),
 * in H.273's channel order. A matrix over encoded sRGB with exact dyadic coefficients. The reversible
 * integer YCgCo-R isn't modelled. Not CSS.
 */
export class Ycgco extends RectangularColor {
  static readonly id = "ycgco";
  static readonly channels = {
    y: { range: [0, 1] },
    cg: { range: [-0.5, 0.5] },
    co: { range: [-0.5, 0.5] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Ycgco) => new Srgb(...multiply(YCGCO_TO_RGB, c.y, c.cg, c.co), c.alpha),
      (c) => new Ycgco(...multiply(RGB_TO_YCGCO, c.r, c.g, c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _y: number;
  private _cg: number;
  private _co: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(y: number, cg: number, co: number, alpha = 1) {
    super(alpha);
    this._y = finite(y, "ycgco", "y");
    this._cg = finite(cg, "ycgco", "cg");
    this._co = finite(co, "ycgco", "co");
  }

  get model(): "ycgco" {
    return "ycgco";
  }

  /** Luma Y = ½G + ¼(R + B), 0–1. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "ycgco", "y");
  }

  /** Green chroma Cg = ½G − ¼(R + B), ±0.5. */
  get cg(): number {
    return this._cg;
  }
  set cg(value: number) {
    this._cg = finite(value, "ycgco", "cg");
  }

  /** Orange chroma Co = ½(R − B), ±0.5. */
  get co(): number {
    return this._co;
  }
  set co(value: number) {
    this._co = finite(value, "ycgco", "co");
  }

  get coords(): readonly [y: number, cg: number, co: number] {
    return [this._y, this._cg, this._co];
  }

  /**
   * Parses `ycgco(y cg co [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ycgco {
    const { coords, alpha } = readFunction(input, ["ycgco"], Ycgco.channels);
    const [y = 0, cg = 0, co = 0] = coords;
    return new Ycgco(y, cg, co, alpha);
  }

  /** `ycgco(y cg co)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("ycgco", Ycgco.channels, this.coords, this.alpha, "exact");
  }
}
