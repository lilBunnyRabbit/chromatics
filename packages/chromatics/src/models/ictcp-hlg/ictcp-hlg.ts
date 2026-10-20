import { multiply } from "../../core/linear.js";
import { HLG_LMS_TO_ICTCP, ICTCP_TO_HLG_LMS, LMS_ICTCP_TO_XYZ_D65, XYZ_D65_TO_LMS_ICTCP } from "../../core/matrices.js";
import { hlgDecode, hlgEncode } from "../../core/transfer.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// ITU-R BT.2100-3 Table 7 (HLG): the HLG OETF applied to the LMS of scene light E in [0, 1]. Relative Y = 1
// maps to E = OETF⁻¹(0.75), BT.2408-8 §5.1.4.1's scene-referred gain, so diffuse white is I = 0.75
// (BT.2408-8 Table 1: "75%HLG"; ADR-011).
const GAIN = hlgDecode(0.75);

function toIctcp(c: Xyz65): IctcpHlg {
  const [l, m, s] = multiply(XYZ_D65_TO_LMS_ICTCP, c.x, c.y, c.z).map((v) => hlgEncode(v * GAIN)) as [
    number,
    number,
    number,
  ];
  return new IctcpHlg(...multiply(HLG_LMS_TO_ICTCP, l, m, s), c.alpha);
}

function toXyz(c: IctcpHlg): Xyz65 {
  const [l, m, s] = multiply(ICTCP_TO_HLG_LMS, c.i, c.ct, c.cp).map((v) => hlgDecode(v) / GAIN) as [
    number,
    number,
    number,
  ];
  return new Xyz65(...multiply(LMS_ICTCP_TO_XYZ_D65, l, m, s), c.alpha);
}

/**
 * ICtCp with the HLG transfer function (ITU-R BT.2100-3 Table 7, HLG matrix): intensity `i`, `ct`, `cp`.
 * Scene-referred: relative Y = 1 (diffuse white) is I = 0.75, the 75 % HLG of BT.2408-8 Table 1.
 *
 * BT.2408 prefers Y′C′BC′R for HLG, and BT.2124 defines ΔE_ITP on PQ, so for color differences convert
 * to {@link Ictcp}. Not CSS: there is no `toCss()`; `toString()` writes `ictcp-hlg(i ct cp)`.
 *
 * @example
 * ```ts
 * new Srgb(1, 1, 1).to(IctcpHlg);   // ictcp-hlg(0.75 0 0)
 * ```
 */
export class IctcpHlg extends RectangularColor {
  static readonly id = "ictcp-hlg";
  static readonly channels = {
    i: { range: [0, 1], percent: 1 },
    ct: { range: [-0.5, 0.5], percent: 0.5 },
    cp: { range: [-0.5, 0.5], percent: 0.5 },
  } as const;
  static readonly edges: readonly Edge[] = [edge(Xyz65, toXyz, toIctcp)];
  static readonly terminal = false;

  private _i: number;
  private _ct: number;
  private _cp: number;

  /** @throws {TypeError} on `NaN` / `Infinity`. */
  constructor(i: number, ct: number, cp: number, alpha = 1) {
    super(alpha);
    this._i = finite(i, "ictcp-hlg", "i");
    this._ct = finite(ct, "ictcp-hlg", "ct");
    this._cp = finite(cp, "ictcp-hlg", "cp");
  }

  get model(): "ictcp-hlg" {
    return "ictcp-hlg";
  }

  /** Intensity: 0 is black, 0.75 diffuse white (75 % HLG), 1 the HLG signal peak. */
  get i(): number {
    return this._i;
  }
  set i(value: number) {
    this._i = finite(value, "ictcp-hlg", "i");
  }

  /** Blue (−) to yellow (+). */
  get ct(): number {
    return this._ct;
  }
  set ct(value: number) {
    this._ct = finite(value, "ictcp-hlg", "ct");
  }

  /** Green (−) to red (+). */
  get cp(): number {
    return this._cp;
  }
  set cp(value: number) {
    this._cp = finite(value, "ictcp-hlg", "cp");
  }

  get coords(): readonly [i: number, ct: number, cp: number] {
    return [this._i, this._ct, this._cp];
  }

  /**
   * Parses `ictcp-hlg(i ct cp [/ alpha])` (Not CSS): numbers or percentages of the reference
   * ranges. Nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): IctcpHlg {
    const { coords, alpha } = readFunction(input, ["ictcp-hlg"], IctcpHlg.channels);
    const [i = 0, ct = 0, cp = 0] = coords;
    return new IctcpHlg(i, ct, cp, alpha);
  }

  /** `ictcp-hlg(i ct cp)`, shortest exact numbers. */
  override toString(): string {
    return serialize("ictcp-hlg", IctcpHlg.channels, this.coords, this.alpha, "exact");
  }
}
