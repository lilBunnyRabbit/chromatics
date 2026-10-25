import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { D65_WHITE } from "../../core/matrices.js";
import { hlgDecode, hlgEncode } from "../../core/transfer.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { IctcpHlg } from "./ictcp-hlg.js";

describeModel(IctcpHlg, models, {
  realistic: 1,
  strings: [["ictcp-hlg(0.75 0 0)", [0.75, 0, 0], 1]],
  invalid: ["ictcp(0.75, 0, 0)"],
});

const grey = (y: number) => new Xyz65(D65_WHITE[0] * y, y, D65_WHITE[2] * y).to(IctcpHlg);

describe("IctcpHlg references", () => {
  // ITU-R BT.2408-8 Table 1: diffuse white 75 %HLG, 18 % grey 38 %HLG, 90 % reflectance 73 %HLG (2 digits).
  // A grey has L = M = S, and each Ct / Cp row of BT.2100-3 Table 7 sums to 0.
  it.each([
    [1, 0.75],
    [0.18, 0.38],
    [0.9, 0.73],
  ])("grey Y %s is I %s, Ct = Cp = 0 (BT.2408-8 Table 1)", (y, i) => {
    const c = grey(y);
    expect(Math.abs(c.i - i)).toBeLessThanOrEqual(y === 1 ? 1e-12 : 0.005);
    expect(Math.abs(c.ct)).toBeLessThan(1e-12);
    expect(Math.abs(c.cp)).toBeLessThan(1e-12);
  });

  // BT.2100-3 Note 5c: b = 1 − 4a and c = 0.5 − a·ln(4a) make the √ and log branches meet at E = 1/12,
  // E′ = 0.5. Its b and c are published to 8 digits, so the join holds to that.
  it("the HLG OETF is continuous at E = 1/12 (E′ = 0.5)", () => {
    expect(hlgEncode(1 / 12)).toBe(0.5);
    expect(Math.abs(hlgEncode((1 / 12) * (1 + 1e-12)) - 0.5)).toBeLessThan(1e-8);
  });

  it("the √ branch is odd, so negative scene light keeps its sign (BT.2100-3 Note 5h)", () => {
    for (const e of [-0.05, -1e-6]) {
      expect(hlgEncode(e)).toBe(-hlgEncode(-e));
      expect(hlgDecode(hlgEncode(e))).toBeCloseTo(e, 15);
    }
  });

  it("negative light round-trips", () => {
    const c = new Srgb(-0.2, 1, 0).to(IctcpHlg).to(Srgb);
    [-0.2, 1, 0].forEach((e, i) => expect(c.coords[i]!).toBeCloseTo(e, 10));
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new IctcpHlg(0, 0, 0)).toBe(false);
  });
});
