import { fromXyz as hunterFromXyz, toXyz as hunterToXyz } from "../../core/hunter.js";
import { D65_WHITE } from "../../core/matrices.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

function toHunter(c: Xyz65): HunterLab {
  return new HunterLab(...hunterFromXyz(c.x, c.y, c.z, D65_WHITE), c.alpha);
}

function toXyz(c: HunterLab): Xyz65 {
  return new Xyz65(...hunterToXyz(c.l, c.a, c.b, D65_WHITE), c.alpha);
}

/**
 * Hunter L, a, b (Hunter 1958): L = 100·√(Y/Yn), a = Ka·(X/Xn − Y/Yn)/√(Y/Yn), b = Kb·(Y/Yn − Z/Zn)/√(Y/Yn),
 * with Ka, Kb from the white by the 1966 formula (colour-science `XYZ_to_K_ab_HunterLab1966`). On this
 * package's D65. Not CSS.
 */
export class HunterLab extends RectangularColor {
  static readonly id = "hunter-lab";
  static readonly channels = {
    l: { range: [0, 100] },
    a: { range: [-100, 100] },
    b: { range: [-100, 100] },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toHunter)];
  static readonly terminal = false;

  private _l: number;
  private _a: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(l: number, a: number, b: number, alpha = 1) {
    super(alpha);
    this._l = finite(l, "hunter-lab", "l");
    this._a = finite(a, "hunter-lab", "a");
    this._b = finite(b, "hunter-lab", "b");
  }

  get model(): "hunter-lab" {
    return "hunter-lab";
  }

  /** Lightness, 0 black to 100 white. */
  get l(): number {
    return this._l;
  }
  set l(value: number) {
    this._l = finite(value, "hunter-lab", "l");
  }

  /** Red (+) / green (−). */
  get a(): number {
    return this._a;
  }
  set a(value: number) {
    this._a = finite(value, "hunter-lab", "a");
  }

  /** Yellow (+) / blue (−). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "hunter-lab", "b");
  }

  get coords(): readonly [l: number, a: number, b: number] {
    return [this._l, this._a, this._b];
  }

  /**
   * Parses `hunter-lab(l a b [/ alpha])`, numbers only. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): HunterLab {
    const { coords, alpha } = readFunction(input, ["hunter-lab"], HunterLab.channels);
    const [l = 0, a = 0, b = 0] = coords;
    return new HunterLab(l, a, b, alpha);
  }

  /** `hunter-lab(l a b)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("hunter-lab", HunterLab.channels, this.coords, this.alpha, "exact");
  }
}
