import { multiply } from "../../core/linear.js";
import { ICTCP_TO_PQ_LMS, LMS_ICTCP_TO_XYZ_D65, PQ_LMS_TO_ICTCP, XYZ_D65_TO_LMS_ICTCP } from "../../core/matrices.js";
import { pqDecode, pqEncode } from "../../core/transfer.js";
import { finite } from "../../core/channel.js";
import { readFunction, serialize, type CssOptions } from "../../core/css.js";
import { edge } from "../../core/edge.js";
import { RectangularColor } from "../../core/families/rectangular.js";
import type { Edge } from "../../core/model.js";
import { Xyz65 } from "../xyz65/xyz65.js";

// ITU-R BT.2100-3 Table 7 (PQ): LMS from linear BT.2020 RGB, here folded into one exact XYZ → LMS matrix
// (scripts/matrices). Relative Y = 1 is 203 cd/m² (BT.2100-3 Table 10 note 10a, CSS Color HDR 1).
const YW = 203;

function toIctcp(c: Xyz65): Ictcp {
  const [l, m, s] = multiply(XYZ_D65_TO_LMS_ICTCP, c.x, c.y, c.z).map((v) => pqEncode((v * YW) / 10000)) as [
    number,
    number,
    number,
  ];
  return new Ictcp(...multiply(PQ_LMS_TO_ICTCP, l, m, s), c.alpha);
}

function toXyz(c: Ictcp): Xyz65 {
  const [l, m, s] = multiply(ICTCP_TO_PQ_LMS, c.i, c.ct, c.cp).map((v) => (pqDecode(v) * 10000) / YW) as [
    number,
    number,
    number,
  ];
  return new Xyz65(...multiply(LMS_ICTCP_TO_XYZ_D65, l, m, s), c.alpha);
}

// ITU-R BT.2124-0: ITP is (I, T = 0.5·Ct, P = Cp), and ΔE_ITP = 720 · √(ΔI² + ΔT² + ΔP²).
function deltaEItp(x: Ictcp, y: Ictcp): number {
  return 720 * Math.hypot(x.i - y.i, 0.5 * (x.ct - y.ct), x.cp - y.cp);
}

/**
 * ICtCp (ITU-R BT.2100-3 Table 7, PQ), as CSS Color HDR 1 defines `ictcp()`: intensity `i`, blue–yellow
 * `ct`, red–green `cp`. CSS reference ranges: `i` 0–1, `ct` / `cp` ±0.5. D65, BT.2020 primaries underneath.
 *
 * Takes absolute light: relative Y = 1 is 203 cd/m² (BT.2100-3 Table 10 note 10a), so sRGB white is
 * `ictcp(0.58069 0 0)`. Negative light passes through PQ mirrored around PQ(0) (grill 60). For the HLG
 * variant see {@link IctcpHlg}. CSS HDR is an Editor's Draft; its syntax may still change.
 *
 * @example
 * ```ts
 * new Srgb(0, 1, 0).to(Ictcp);           // ictcp(0.5393 -0.2643 -0.0625)
 * a.to(Ictcp).deltaEItp(b.to(Ictcp));    // BT.2124: 1 is about one just-noticeable difference
 * ```
 */
export class Ictcp extends RectangularColor {
  static readonly id = "ictcp";
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
    this._i = finite(i, "ictcp", "i");
    this._ct = finite(ct, "ictcp", "ct");
    this._cp = finite(cp, "ictcp", "cp");
  }

  get model(): "ictcp" {
    return "ictcp";
  }

  /** Intensity: 0 is black, 1 is PQ's 10 000 cd/m² peak; diffuse white (203 cd/m²) is 0.58069. */
  get i(): number {
    return this._i;
  }
  set i(value: number) {
    this._i = finite(value, "ictcp", "i");
  }

  /** Blue (−) to yellow (+) (tritan axis); CSS reference range ±0.5. */
  get ct(): number {
    return this._ct;
  }
  set ct(value: number) {
    this._ct = finite(value, "ictcp", "ct");
  }

  /** Green (−) to red (+) (protan axis); CSS reference range ±0.5. */
  get cp(): number {
    return this._cp;
  }
  set cp(value: number) {
    this._cp = finite(value, "ictcp", "cp");
  }

  get coords(): readonly [i: number, ct: number, cp: number] {
    return [this._i, this._ct, this._cp];
  }

  /**
   * ΔE_ITP (ITU-R BT.2124-0) to `other`: 720 · √(ΔI² + (½ΔCt)² + ΔCp²). About 1 is the threshold of
   * visibility; BT.2124 Annex 4 calls below 3 acceptable for a reference display. Symmetric.
   */
  deltaEItp(other: Ictcp): number {
    return deltaEItp(this, other);
  }

  /**
   * Parses `ictcp(i ct cp [/ alpha])` (CSS Color HDR 1): numbers or percentages of the reference
   * ranges. Nothing clamps.
   *
   * @throws {SyntaxError} on any other syntax.
   */
  static parse(input: string): Ictcp {
    const { coords, alpha } = readFunction(input, ["ictcp"], Ictcp.channels);
    const [i = 0, ct = 0, cp = 0] = coords;
    return new Ictcp(i, ct, cp, alpha);
  }

  /** `ictcp(i ct cp)`, shortest exact numbers. */
  override toString(): string {
    return serialize("ictcp", Ictcp.channels, this.coords, this.alpha, "exact");
  }

  /** `ictcp(i ct cp)`, rounded per {@link CssOptions}. */
  toCss(options: CssOptions = {}): string {
    return serialize("ictcp", Ictcp.channels, this.coords, this.alpha, options);
  }
}
