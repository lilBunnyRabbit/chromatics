import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Cam16Lcd } from "../cam16-lcd/cam16-lcd.js";
import { Cam16Scd } from "../cam16-scd/cam16-scd.js";
import { Cam16 } from "../cam16/cam16.js";
import { Ciecam02 } from "../ciecam02/ciecam02.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Cam16Ucs } from "./cam16-ucs.js";

describeModel(Cam16Ucs, models, { realistic: 0, strings: [["cam16-ucs(50 10 -10)", [50, 10, -10], 1]] });

// The UCS step is a formula on J, M, h alone, so colour-science's vectors apply whatever model or conditions
// produced the JMh.
describe("UCS references (colour-science, secondary, 8 decimals)", () => {
  // `colour/models/tests/test_cam02_ucs.py` @ 248121e3: JMh of CIECAM02(XYZ [19.01, 20, 21.78], white
  // [95.05, 100, 108.88], L_A 318.31, Y_b 20, average) through each Luo 2006 coefficient set.
  const View = Ciecam02.viewedIn({ white: [0.9505, 1, 1.0888], adaptingLuminance: 318.31, backgroundLuminance: 20 });
  const jmh = new Xyz65(0.1901, 0.2, 0.2178).to(View);
  const cam = new Cam16(jmh.J, jmh.M, jmh.h);
  it.each([
    [Cam16Lcd, [54.90433134, -0.08450395, -0.06854831]],
    [Cam16Scd, [54.90433134, -0.08436178, -0.06843298]],
    [Cam16Ucs, [54.90433134, -0.08442362, -0.06848314]],
  ] as const)("%s", (model, expected) => {
    cam.to(model).coords.forEach((v, i) => expect(Math.abs(v - expected[i]!)).toBeLessThan(5e-9));
  });

  // `colour/models/tests/test_cam16_ucs.py` @ 248121e3: XYZ [0.20654008, 0.12197225, 0.05136952] → CAM16-LCD
  // under white [0.95047, 1, 1.08883], L_A 64/π · 0.2, Y_b 20, average.
  it("CAM16-LCD of colour-science's sRGB-conditions sample", () => {
    const Srgbish = Cam16.viewedIn({
      white: [0.95047, 1, 1.08883],
      adaptingLuminance: (64 / Math.PI) * 0.2,
      backgroundLuminance: 20,
    });
    const c = new Xyz65(0.20654008, 0.12197225, 0.05136952).to(Srgbish);
    new Cam16(c.J, c.M, c.h)
      .to(Cam16Lcd)
      .coords.forEach((v, i) => expect(Math.abs(v - [46.06573617, 41.07444159, 14.50807598][i]!)).toBeLessThan(5e-9));
  });

  it("deltaE weights J′ by 1 / K_L (Luo 2006: UCS 1, LCD 0.77, SCD 1.24)", () => {
    expect(new Cam16Ucs(50, 0, 0).deltaE(new Cam16Ucs(51, 0, 0))).toBeCloseTo(1, 15);
    expect(new Cam16Lcd(50, 0, 0).deltaE(new Cam16Lcd(51, 0, 0))).toBeCloseTo(1 / 0.77, 15);
    expect(new Cam16Scd(50, 0, 0).deltaE(new Cam16Scd(51, 0, 0))).toBeCloseTo(1 / 1.24, 15);
    expect(new Cam16Ucs(50, 3, 0).deltaE(new Cam16Ucs(50, 0, 4))).toBeCloseTo(5, 15);
  });
});
