import { multiply } from "../../core/linear.js";
import { LINEAR_REC2020_TO_XYZ_D65, XYZ_D65_TO_LINEAR_REC2020 } from "../../core/matrices.js";
import { hlgDecode, hlgEncode } from "../../core/transfer.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { finite } from "../../core/channel.js";
import { readColorFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RgbColor } from "../../core/families/rgb.js";
import type { Edge } from "../../core/model.js";

// ITU-R BT.2100-3 Table 5 (HLG) on BT.2020 primaries. Relative Y = 1 maps to scene light E = OETF⁻¹(0.75),
// so diffuse white encodes to 0.75 (BT.2408-8 §5.1.4.1 and Table 1, as IctcpHlg).
const GAIN = hlgDecode(0.75);
const encode = (v: number) => hlgEncode(v * GAIN);
const decode = (v: number) => hlgDecode(v) / GAIN;

/**
 * Rec. 2100 HLG (ITU-R BT.2100-3), as CSS Color HDR 1 `rec2100-hlg`: BT.2020 primaries, D65, encoded with
 * the hybrid log-gamma OETF. Scene-referred: diffuse white (relative Y = 1) is 0.75, the 75 % HLG of
 * BT.2408-8. Negatives keep their sign (BT.2100 Note 5h: don't clip). CSS HDR is an Editor's Draft.
 */
export class Rec2100Hlg extends RgbColor {
  static readonly id = "rec2100-hlg";
  static readonly channels = {
    r: { range: [0, 1], percent: 1 },
    g: { range: [0, 1], percent: 1 },
    b: { range: [0, 1], percent: 1 },
  } as const;
  static readonly edges: readonly Edge[] = [
    edge(
      Xyz65,
      (c: Rec2100Hlg) =>
        new Xyz65(...multiply(LINEAR_REC2020_TO_XYZ_D65, decode(c.r), decode(c.g), decode(c.b)), c.alpha),
      (c) => {
        const [r, g, b] = multiply(XYZ_D65_TO_LINEAR_REC2020, c.x, c.y, c.z);
        return new Rec2100Hlg(encode(r), encode(g), encode(b), c.alpha);
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
    this._r = finite(r, "rec2100-hlg", "r");
    this._g = finite(g, "rec2100-hlg", "g");
    this._b = finite(b, "rec2100-hlg", "b");
  }

  get model(): "rec2100-hlg" {
    return "rec2100-hlg";
  }

  /** Red, 0–1 (diffuse white 0.75). */
  get r(): number {
    return this._r;
  }
  set r(value: number) {
    this._r = finite(value, "rec2100-hlg", "r");
  }

  /** Green, 0–1 (diffuse white 0.75). */
  get g(): number {
    return this._g;
  }
  set g(value: number) {
    this._g = finite(value, "rec2100-hlg", "g");
  }

  /** Blue, 0–1 (diffuse white 0.75). */
  get b(): number {
    return this._b;
  }
  set b(value: number) {
    this._b = finite(value, "rec2100-hlg", "b");
  }

  get coords(): readonly [r: number, g: number, b: number] {
    return [this._r, this._g, this._b];
  }

  /**
   * Parses `color(rec2100-hlg r g b [/ alpha])`. Percentages are of 1.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Rec2100Hlg {
    const { coords, alpha } = readColorFunction(input, ["rec2100-hlg"], Rec2100Hlg.channels);
    const [r = 0, g = 0, b = 0] = coords;
    return new Rec2100Hlg(r, g, b, alpha);
  }

  /** `color(rec2100-hlg r g b)`, shortest exact numbers. */
  override toString(): string {
    return serialize("color", Rec2100Hlg.channels, this.coords, this.alpha, "exact", [], "rec2100-hlg");
  }

  /** `color(rec2100-hlg r g b)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("color", Rec2100Hlg.channels, this.coords, this.alpha, options, [], "rec2100-hlg");
  }
}
