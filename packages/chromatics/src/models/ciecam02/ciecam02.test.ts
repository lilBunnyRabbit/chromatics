import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Ciecam02 } from "./ciecam02.js";

describeModel(Ciecam02, models, { realistic: 0, strings: [["ciecam02(50 20 30)", [50, 20, 30], 1]] });

// colour-science `test_ciecam02.py` @ 248121e3, "generated from data of ... Fairchild (2013)" AppModEx.xls:
// J, C, h, s, Q, M, H, each to the digits printed (half a digit is the tolerance). Y_b 20, average.
const half = (v: number) => 0.5 * 10 ** -(String(v).split(".")[1] ?? "").length;

describe("Ciecam02 references (Fairchild, via colour-science)", () => {
  it.each([
    [[19.01, 20, 21.78], [95.05, 100, 108.88], 318.31, [41.73, 0.1, 219, 2.36, 195.37, 0.11, 278.1]],
    [[57.06, 43.06, 31.96], [95.05, 100, 108.88], 31.83, [65.96, 48.57, 19.6, 52.25, 152.67, 41.67, 399.6]],
    [[3.53, 6.56, 2.14], [109.85, 100, 35.58], 318.31, [21.79, 46.94, 177.1, 58.79, 141.17, 48.8, 220.4]],
    [[19.01, 20, 21.78], [109.85, 100, 35.58], 31.83, [42.53, 51.92, 248.9, 60.22, 122.83, 44.54, 305.8]],
  ] as const)("XYZ %j, white %j, L_A %s", (xyz, white, la, expected) => {
    const View = Ciecam02.viewedIn({
      white: white.map((v) => v / 100) as [number, number, number],
      adaptingLuminance: la,
      backgroundLuminance: 20,
    });
    const c = new Xyz65(...(xyz.map((v) => v / 100) as [number, number, number])).to(View);
    [c.J, c.C, c.h, c.s, c.Q, c.M, c.H].forEach((v, i) =>
      expect(Math.abs(v - expected[i]!), `${i}`).toBeLessThanOrEqual(half(expected[i]!) + 1e-9)
    );
  });
});
