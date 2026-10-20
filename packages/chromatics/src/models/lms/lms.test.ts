import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { XYZ_TO_HPE } from "../../core/matrices.js";
import { Lms } from "./lms.js";

describeModel(Lms, models);

// colour-science @ 248121e3 (BSD-3, secondary), 8 decimals, D65 from xy (0.3127, 0.3290) like ours.
const close = (actual: readonly number[], expected: readonly number[]) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(5e-9 + 1e-12));
const INPUTS: [number, number, number][] = [
  [0.20654008, 0.12197225, 0.05136952],
  [0.1422201, 0.23042768, 0.10495772],
  [0.0781878, 0.06157201, 0.28099326],
];

describe("Lms references", () => {
  // colour-science `colour/appearance/hunt.py:147` `MATRIX_XYZ_TO_HPE` (grill 66): the matrix is the published one,
  // and it maps the equal-energy white to (1.00001, 1, 1) — its row sums.
  it("uses Hunt's HPE matrix, equal-energy normalised", () => {
    expect(XYZ_TO_HPE).toEqual([
      [0.38971, 0.68898, -0.07868],
      [-0.22981, 1.1834, 0.04641],
      [0, 0, 1],
    ]);
    close(new Xyz65(1, 1, 1).to(Lms).coords, [1.00001, 1, 1]);
  });
});
