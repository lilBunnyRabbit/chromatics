import { multiply } from "../../core/linear.js";
import { LINEAR_REC2020_TO_XYZ_D65, XYZ_D65_TO_LINEAR_REC2020 } from "../../core/matrices.js";
import { pqDecode, pqEncode } from "../../core/transfer.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { finite } from "../../core/channel.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import type { Edge } from "../../core/model.js";

// ITU-R BT.2100-3 Table 4 (PQ) on BT.2020 primaries. Relative Y = 1 is 203 cd/m² (BT.2100-3 Table 10
// note 10a, CSS Color HDR 1), as in Ictcp.
const YW = 203;
const encode = (v: number) => pqEncode((v * YW) / 10000);
const decode = (v: number) => (pqDecode(v) * 10000) / YW;

/**
 * Rec. 2100 PQ (ITU-R BT.2100-3), as CSS Color HDR 1 `rec2100-pq`: BT.2020 primaries, D65, encoded with the
 * PQ curve. Absolute light: 1 is PQ's 10 000 cd/m² peak, and relative Y = 1 (diffuse white) is 203 cd/m²,
 * so sRGB white is `color(rec2100-pq 0.58069 0.58069 0.58069)`.
 *
 * Negative light passes through PQ mirrored around PQ(0) (grill 60). CSS HDR is an Editor's Draft; its
 * syntax may still change.
 */
export class Rec2100Pq extends RgbColor {
  static readonly id = "rec2100-pq";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Rec2100Pq) =>
        new Xyz65(...multiply(LINEAR_REC2020_TO_XYZ_D65, decode(c.r), decode(c.g), decode(c.b)), c.alpha),
      (c) => {
        const [r, g, b] = multiply(XYZ_D65_TO_LINEAR_REC2020, c.x, c.y, c.z);
        return new Rec2100Pq(encode(r), encode(g), encode(b), c.alpha);
      }
    ),
  ];
  static readonly terminal = false;

  private _r: number;
  private _g: number;
  private _b: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(r: number, g: number, b: number, alpha = 1) {
    super(alpha);
    this._r = finite(r, "rec2100-pq", "r");
    this._g = finite(g, "rec2100-pq", "g");
    this._b = finite(b, "rec2100-pq", "b");
  }

  get model(): "rec2100-pq" {
    return "rec2100-pq";
  }

  /** Red, 0–1 (1 is 10 000 cd/m²). */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "rec2100-pq", "r");
  }

  /** Green, 0–1 (1 is 10 000 cd/m²). */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "rec2100-pq", "g");
  }

  /** Blue, 0–1 (1 is 10 000 cd/m²). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "rec2100-pq", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(rec2100-pq r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Rec2100Pq {
    const { coords, alpha } = readColorFunction(input, ["rec2100-pq"], Rec2100Pq.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Rec2100Pq(r, g, b, alpha);
  }

  /** `color(rec2100-pq r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", Rec2100Pq.channels, this.coords, this.alpha, "exact", [], "rec2100-pq");
  }

  /** `color(rec2100-pq r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", Rec2100Pq.channels, this.coords, this.alpha, options, [], "rec2100-pq");
  }
}
