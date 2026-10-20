import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Uvw64 } from "./uvw64.js";

// A chromaticity near 0 with Y ≠ 0 is an astronomically large XYZ, so the sweep stays in the reference ranges.
describeModel(Uvw64, models, { realistic: 1 });

// colour-science @ 248121e3 (BSD-3, secondary), 8 decimals, D65 from xy (0.3127, 0.3290) like ours.
const close = (actual: readonly number[], expected: readonly number[]) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(5e-9 + 1e-12));
const INPUTS: [number, number, number][] = [
  [0.20654008, 0.12197225, 0.05136952],
  [0.1422201, 0.23042768, 0.10495772],
  [0.0781878, 0.06157201, 0.28099326],
];

describe("Uvw64 references", () => {
  // `colour/models/tests/test_cie_uvw.py:48-61`: XYZ × 100 input, D65 default white.
  it.each([
    [INPUTS[0], [94.55035725, 11.55536523, 40.54757405]],
    [INPUTS[1], [-36.92762376, 28.90425105, 54.14071478]],
    [INPUTS[2], [-10.6011155, -41.9458, 28.82134002]],
  ] as const)("XYZ %j → U*V*W* %j", (xyz, expected) =>
    close(new Xyz65(xyz![0], xyz![1], xyz![2]).to(Uvw64).coords, expected)
  );

  it("black is W* = −17 and comes back black (the studio's W = 0 bug)", () => {
    expect(new Xyz65(0, 0, 0).to(Uvw64).W).toBe(-17);
    expect([...new Uvw64(0, 0, -17).to(Xyz65).coords]).toEqual([0, 0, 0]);
    expect(new Uvw64(0, 0, 0).to(Xyz65).y).toBeCloseTo((17 / 25) ** 3 / 100, 15);
  });
});
