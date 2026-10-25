import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { acesccToLinear, linearToAcescc } from "../../core/transfer.js";
import { describeModel } from "../../testing/harness.js";
import { Acescg } from "../acescg/acescg.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Acescc } from "./acescc.js";

describeModel(Acescc, models, {
  // The log2 decode is exponential: ACEScc 58 is already 2^1016 linear.
  realistic: 1,
  strings: [["acescc(0.4136 0.4136 0.4136)", [0.4136, 0.4136, 0.4136], 1]],
});

const close = (actual: readonly number[], expected: readonly number[], tol: number) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol));

describe("Acescc references", () => {
  // colour-science `transfer_functions/tests/test_aces.py:262-285, 353-376` @ 248121e3 (15 digits).
  it.each([
    [0, -0.358447488584475],
    [0.18, 0.413588402492442],
    [1, 0.554794520547945],
  ])("encodes %s as colour-science does", (lin, v) => {
    expect(Math.abs(linearToAcescc(lin) - v)).toBeLessThan(1e-15);
    expect(Math.abs(acesccToLinear(v) - lin)).toBeLessThan(1e-14);
  });

  // color.js `test/conversions.js:744-786` @ 4d3ab457, "ACEScc to XYZ" (Bradford to D65), printed to 4–6
  // figures; its encoder's toe bug (2^-16 for 2^-15) doesn't reach these values.
  it.each([
    [[1, 1, 1], [211.8195, 222.861, 242.7084], 1e-3],
    [[0.4977169, 0.4977169, 0.4977169], [0.475228, 0.5, 0.544529], 1e-6],
    [[0, 0, 0], [0.001127, 0.001186, 0.001291], 1e-6],
    [[1, 0, 0], [145.3586, 59.6545, -1.1981], 1e-3],
    [[0, 1, 0], [28.5798, 150.2844, 0.306392], 1e-3],
    [[0, 0, 1], [37.8833, 12.9243, 243.6027], 1e-3],
  ] as const)("acescc %j → XYZ D65 matches color.js", (rgb, xyz, tol) => {
    close(new Acescc(rgb[0], rgb[1], rgb[2]).to(Xyz65).coords, xyz, tol);
  });

  it("negative linear values mirror around ACEScc(0) and round-trip (grill 70)", () => {
    const zero = linearToAcescc(0);
    expect(linearToAcescc(-0.18)).toBeCloseTo(2 * zero - linearToAcescc(0.18), 15);
    const back = new Acescg(-0.05, 1e-6, 3e5).to(Acescc).to(Acescg);
    close(back.coords, [-0.05, 1e-6, 3e5], 1e-9);
  });

  it("isn't capped at 65504", () => {
    expect(acesccToLinear(2)).toBeGreaterThan(65504);
  });
});
