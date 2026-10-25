import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { describeModel } from "../../testing/harness.js";
import { Ipt } from "./ipt.js";

describeModel(Ipt, models);

const close = (actual: readonly number[], expected: readonly number[], tol = 5e-9) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol + 1e-12));

// colour-science `colour/models/tests/test_ipt.py:46-59` @ 248121e3 (BSD-3, secondary), 8 decimals.
describe("Ipt references", () => {
  it.each([
    [
      [0.20654008, 0.12197225, 0.05136952],
      [0.38426191, 0.38487306, 0.18886838],
    ],
    [
      [0.1422201, 0.23042768, 0.10495772],
      [0.49437481, -0.19251742, 0.18080304],
    ],
    [
      [0.0781878, 0.06157201, 0.28099326],
      [0.35167774, -0.07525627, -0.30921279],
    ],
  ] as const)("XYZ %j → IPT %j", (xyz, expected) => close(new Xyz65(xyz[0], xyz[1], xyz[2]).to(Ipt).coords, expected));
});
