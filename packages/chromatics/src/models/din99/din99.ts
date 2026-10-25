import { DIN99, fromLab, toLab } from "../../core/din99.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Lab65 } from "../lab65/lab65.js";

function fromDin99(c: Lab65): Din99 {
  return new Din99(...fromLab(DIN99, c.l, c.a, c.b), c.alpha);
}

function toDin99(c: Din99): Lab65 {
  return new Lab65(...toLab(DIN99, c.l, c.a, c.b), c.alpha);
}

/**
 * DIN99 (DIN 6176:2001): {@link Lab65} with lightness and chroma compressed by logarithms and the a/b
 * plane rotated by 16°, so Euclidean distances approximate DIN's color difference. D65. Not CSS.
 *
 * @example
 * ```ts
 * a.to(Din99).deltaE(b.to(Din99));
 * ```
 */
export class Din99 extends RectangularColor {
  static readonly id = "din99";
  static readonly channels = {
    l: { range: [0, 100] },
    a: { range: [-55, 55] },
    b: { range: [-55, 55] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Lab65, toDin99, fromDin99)];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "din99", "l");
    this._a = finite(a, "din99", "a");
    this._b = finite(b, "din99", "b");
  }

  get model(): "din99" {
    return "din99";
  }

  /** Lightness L99, 0 black to 100 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "din99", "l");
  }

  /** Red–green opponent axis. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "din99", "a");
  }

  /** Yellow–blue opponent axis. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "din99", "b");
  }

  get coords(): readonly [l: number, a: number, b: number] {
    return [this._l, this._a, this._b];
  }

  /** Euclidean distance to `other`: the space's color difference (ΔE99 with k_E = k_CH = 1). */
  deltaE(other: Din99): number {
    return Math.hypot(this._l - other._l, this._a - other._a, this._b - other._b);
  }

  /**
   * Parses `din99(l a b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Din99 {
    const { coords, alpha } = readFunction(input, ["din99"], Din99.channels);
    const [l = 0, a = 0, b = 0] = coords;
    return new Din99(l, a, b, alpha);
  }

  /** `din99(l a b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("din99", Din99.channels, this.coords, this.alpha, "exact");
  }
}
