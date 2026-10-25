import { acescctToLinear, linearToAcescct } from "../../core/transfer.js";
import { Acescg } from "../acescg/acescg.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";

// S-2016-001 §4.4: ACEScct(0) = B and the encoding of 65504.
const MIN = 0.0729055341958355;
const MAX = (Math.log2(65504) + 9.72) / 17.52;

/**
 * ACEScct (Academy S-2016-001): ACEScc with a linear toe below 0.0078125, so shadows grade like a film
 * scan. Identical to {@link Acescc} above the toe. Reference range: the encoding of 0 (0.0729) to that of
 * 65504 (1.4680). The spec's 65504 decode cap is dropped (grill 70). Not CSS.
 */
export class Acescct extends RectangularColor {
  static readonly id = "acescct";
  static readonly channels = {
    r: { range: [MIN, MAX] },
    g: { range: [MIN, MAX] },
    b: { range: [MIN, MAX] },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Acescg,
      (c: Acescct) => new Acescg(acescctToLinear(c.r), acescctToLinear(c.g), acescctToLinear(c.b), c.alpha),
      (c) => new Acescct(linearToAcescct(c.r), linearToAcescct(c.g), linearToAcescct(c.b), c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "acescct", "r");
    this._g = finite(g, "acescct", "g");
    this._b = finite(b, "acescct", "b");
  }

  get model(): "acescct" {
    return "acescct";
  }

  /** Red, log2-encoded AP1 with a linear toe. */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "acescct", "r");
  }

  /** Green, log2-encoded AP1 with a linear toe. */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "acescct", "g");
  }

  /** Blue, log2-encoded AP1 with a linear toe. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "acescct", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `acescct(r g b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Acescct {
    const { coords, alpha } = readFunction(input, ["acescct"], Acescct.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Acescct(r, g, b, alpha);
  }

  /** `acescct(r g b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("acescct", Acescct.channels, this.coords, this.alpha, "exact");
  }
}
