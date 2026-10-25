import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Xyy } from "./xyy.js";

// A chromaticity near 0 with Y ≠ 0 is an astronomically large XYZ, so the sweep stays in the reference ranges.
describeModel(Xyy, models, { realistic: 1 });

// colour-science @ 248121e3 (BSD-3, secondary), 8 decimals, D65 from xy (0.3127, 0.3290) like ours.
const close = (actual: readonly number[], expected: readonly number[]) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(5e-9 + 1e-12));
const INPUTS: [number, number, number][] = [
  [0.20654008, 0.12197225, 0.05136952],
  [0.1422201, 0.23042768, 0.10495772],
  [0.0781878, 0.06157201, 0.28099326],
];

describe("Xyy references", () => {
  // `colour/models/tests/test_cie_xyy.py:55-98`.
  it.each([
    [INPUTS[0], [0.54369557, 0.32107944, 0.12197225]],
    [INPUTS[1], [0.29777735, 0.48246446, 0.23042768]],
    [INPUTS[2], [0.18582823, 0.14633764, 0.06157201]],
    [
      [0, 0, 1],
      [0, 0, 0],
    ],
  ] as const)("XYZ %j → xyY %j", (xyz, expected) =>
    close(new Xyz65(xyz![0], xyz![1], xyz![2]).to(Xyy).coords, expected)
  );

  it("black has x = y = 0 (colour-science's convention), and y = 0 is black", () => {
    expect([...new Xyz65(0, 0, 0).to(Xyy).coords]).toEqual([0, 0, 0]);
    expect([...new Xyy(0.3457, 0, 0.5).to(Xyz65).coords]).toEqual([0, 0, 0]);
  });
});

// colour-science @ 248121e3 colour/temperature/tests/test_mccamy1992.py, 8 decimals.
describe("cct (McCamy 1992)", () => {
  it.each([
    [0.3127, 0.329, 6505.08059131],
    [0.44757, 0.40745, 2857.28961266],
    [0.252520939374083, 0.252220883926284, 19501.6195313],
  ])("x %d, y %d is %d K", (x, y, k) => {
    expect(new Xyy(x, y, 1).cct()).toBeCloseTo(k, 7);
  });

  it("ignores Y and is not finite at y = 0.1858", () => {
    expect(new Xyy(0.3127, 0.329, 0.2).cct()).toBe(new Xyy(0.3127, 0.329, 1).cct());
    expect(Number.isFinite(new Xyy(0.3, 0.1858, 1).cct())).toBe(false);
  });
});
