import { acesccToLinear, linearToAcescc } from "../../core/transfer.js";
import { Acescg } from "../acescg/acescg.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";

// S-2014-003 §4.4: ACEScc(0) = (log2(2^-16) + 9.72) / 17.52 and the encoding of 65504.
const MIN = (-16 + 9.72) / 17.52;
const MAX = (Math.log2(65504) + 9.72) / 17.52;

/**
 * ACEScc (Academy S-2014-003): ACEScg's AP1 values under a pure log2 curve, for color grading. Mid grey
 * 0.18 encodes to 0.4136; the reference range runs from the encoding of 0 (−0.3584) to that of 65504
 * (1.4680).
 *
 * The spec sends every value ≤ 0 to −0.3584 and caps decoding at 65504. Here the curve mirrors for
 * negatives and isn't capped, so every value round-trips (grill 70). Not CSS.
 */
export class Acescc extends RectangularColor {
  static readonly id = "acescc";
  static readonly channels = {
    r: { range: [MIN, MAX] },
    g: { range: [MIN, MAX] },
    b: { range: [MIN, MAX] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Acescg,
      (c: Acescc) => new Acescg(acesccToLinear(c.r), acesccToLinear(c.g), acesccToLinear(c.b), c.alpha),
      (c) => new Acescc(linearToAcescc(c.r), linearToAcescc(c.g), linearToAcescc(c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "acescc", "r");
    this._g = finite(g, "acescc", "g");
    this._b = finite(b, "acescc", "b");
  }

  get model(): "acescc" {
    return "acescc";
  }

  /** Red, log2-encoded AP1. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "acescc", "r");
  }

  /** Green, log2-encoded AP1. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "acescc", "g");
  }

  /** Blue, log2-encoded AP1. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "acescc", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `acescc(r g b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Acescc {
    const { coords, alpha } = readFunction(input, ["acescc"], Acescc.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Acescc(r, g, b, alpha);
  }

  /** `acescc(r g b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("acescc", Acescc.channels, this.coords, this.alpha, "exact");
  }
}
