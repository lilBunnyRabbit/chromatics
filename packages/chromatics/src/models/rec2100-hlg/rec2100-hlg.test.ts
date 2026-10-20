import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Rec2020 } from "../rec2020/rec2020.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Rec2100Hlg } from "./rec2100-hlg.js";

describeModel(Rec2100Hlg, models, {
  // The HLG decode is exponential above 0.5.
  realistic: 1,
  strings: [["color(rec2100-hlg 0.75 0.75 0.75)", [0.75, 0.75, 0.75], 1]],
});

describe("Rec2100Hlg references", () => {
  // BT.2408-8 Table 1 ("75%HLG"): diffuse white (relative Y = 1) is HLG 0.75.
  it("sRGB white encodes to 0.75", () => {
    new Srgb(1, 1, 1).to(Rec2100Hlg).coords.forEach((v) => expect(v).toBeCloseTo(0.75, 12));
  });

  // colour-science `transfer_functions/tests/test_itur_bt_2100.py:604-617` @ 248121e3: OETF(0.18 / 12) =
  // 0.212132034355964 and OETF(1) = 0.999999995536569, so their scene lights are 0.015 : 1.
  it("decodes colour-science's OETF values in proportion", () => {
    const y = (e: number) => new Rec2100Hlg(e, e, e).to(Xyz65).y;
    expect(y(0.212132034355964) / y(0.999999995536569)).toBeCloseTo(0.015, 12);
  });

  it("negatives keep their sign and round-trip (BT.2100 Note 5h)", () => {
    const c = new Rec2020(-0.2, 0.5, 1.2).to(Rec2100Hlg).to(Rec2020);
    [-0.2, 0.5, 1.2].forEach((v, i) => expect(c.coords[i]!).toBeCloseTo(v, 10));
  });
});
