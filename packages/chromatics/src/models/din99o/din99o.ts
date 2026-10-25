import { DIN99O, fromLab, toLab } from "../../core/din99.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Lab65 } from "../lab65/lab65.js";

function fromDin99o(c: Lab65): Din99o {
  return new Din99o(...fromLab(DIN99O, c.l, c.a, c.b), c.alpha);
}

function toDin99o(c: Din99o): Lab65 {
  return new Lab65(...toLab(DIN99O, c.l, c.a, c.b), c.alpha);
}

/**
 * DIN99o (Cui et al. 2002): the DIN99 refinement the studio's `dlab` uses (constants as de.wikipedia and
 * culori). No independent reference vectors exist: it is checked against culori only (grill 67). D65.
 * Not CSS.
 */
export class Din99o extends RectangularColor {
  static readonly id = "din99o";
  static readonly channels = {
    l: { range: [0, 100] },
    a: { range: [-55, 55] },
    b: { range: [-55, 55] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Lab65, toDin99o, fromDin99o)];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "din99o", "l");
    this._a = finite(a, "din99o", "a");
    this._b = finite(b, "din99o", "b");
  }

  get model(): "din99o" {
    return "din99o";
  }

  /** Lightness L99, 0 black to 100 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "din99o", "l");
  }

  /** Red–green opponent axis. */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "din99o", "a");
  }

  /** Yellow–blue opponent axis. */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "din99o", "b");
  }

  get coords(): readonly [l: number, a: number, b: number] {
    return [this._l, this._a, this._b];
  }

  /** Euclidean distance to `other`: the space's color difference (ΔE99 with k_E = k_CH = 1). */
  deltaE(other: Din99o): number {
    return Math.hypot(this._l - other._l, this._a - other._a, this._b - other._b);
  }

  /**
   * Parses `din99o(l a b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Din99o {
    const { coords, alpha } = readFunction(input, ["din99o"], Din99o.channels);
    const [l = 0, a = 0, b = 0] = coords;
    return new Din99o(l, a, b, alpha);
  }

  /** `din99o(l a b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("din99o", Din99o.channels, this.coords, this.alpha, "exact");
  }
}
