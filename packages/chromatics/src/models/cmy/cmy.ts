import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Srgb } from "../srgb/srgb.js";

/**
 * CMY: cyan, magenta, yellow as 1 − R, 1 − G, 1 − B of encoded sRGB (colour-science
 * `colour/models/rgb/cmyk.py` `RGB_to_CMY`, after EasyRGB). A device-free complement, not a print
 * profile. Channels are 0–1 fractions. Not CSS.
 *
 * @example
 * ```ts
 * new Cmy(0, 1, 1).to(Srgb);                // r 1, g 0, b 0
 * Cmy.parse('cmy(0% 100% 100%)');
 * ```
 */
export class Cmy extends RectangularColor {
  static readonly id = "cmy";
  static readonly channels = {
    c: { range: [0, 1], percent: 1 },
    m: { range: [0, 1], percent: 1 },
    y: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Srgb,
      (c: Cmy) => new Srgb(1 - c.c, 1 - c.m, 1 - c.y, c.alpha),
      (c) => new Cmy(1 - c.r, 1 - c.g, 1 - c.b, c.alpha)
    ),
  ];
  static readonly terminal = false;

  private _c: number;
  private _m: number;
  private _y: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(c: number, m: number, y: number, alpha = 1) {
    super(alpha);
    this._c = finite(c, "cmy", "c");
    this._m = finite(m, "cmy", "m");
    this._y = finite(y, "cmy", "y");
  }

  get model(): "cmy" {
    return "cmy";
  }

  /** Cyan, 1 − R: 0 is none, 1 full. */
  get c(): number {
    return this._c;
  }
  set c(value: number) {
    this._c = finite(value, "cmy", "c");
  }

  /** Magenta, 1 − G: 0 is none, 1 full. */
  get m(): number {
    return this._m;
  }
  set m(value: number) {
    this._m = finite(value, "cmy", "m");
  }

  /** Yellow, 1 − B: 0 is none, 1 full. */
  get y(): number {
    return this._y;
  }
  set y(value: number) {
    this._y = finite(value, "cmy", "y");
  }

  get coords(): readonly [c: number, m: number, y: number] {
    return [this._c, this._m, this._y];
  }

  /**
   * Parses `cmy(c m y [/ alpha])`: numbers 0–1 or percentages. Not CSS; nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Cmy {
    const { coords, alpha } = readFunction(input, ["cmy"], Cmy.channels);
    const [c = 0, m = 0, y = 0] = coords;
    return new Cmy(c, m, y, alpha);
  }

  /** `cmy(c m y)`, shortest exact numbers. Not CSS. */
  override toString(): string {
    return serialize("cmy", Cmy.channels, this.coords, this.alpha, "exact");
  }
}
