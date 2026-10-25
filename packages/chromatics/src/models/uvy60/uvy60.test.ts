import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Uvy60 } from "./uvy60.js";

// A chromaticity near 0 with Y ≠ 0 is an astronomically large XYZ, so the sweep stays in the reference ranges.
describeModel(Uvy60, models, { realistic: 1 });

// colour-science @ 248121e3 (BSD-3, secondary), 8 decimals, D65 from xy (0.3127, 0.3290) like ours.
const close = (actual: readonly number[], expected: readonly number[]) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(5e-9 + 1e-12));
const INPUTS: [number, number, number][] = [
  [0.20654008, 0.12197225, 0.05136952],
  [0.1422201, 0.23042768, 0.10495772],
  [0.0781878, 0.06157201, 0.28099326],
];

describe("Uvy60 references", () => {
  // `colour/models/tests/test_cie_ucs.py:466` (`XYZ_to_CIE1960UCS`).
  it.each([
    [INPUTS[0], [0.37720213, 0.33413509, 0.12197225]],
    [INPUTS[1], [0.14536327, 0.35328046, 0.23042768]],
    [INPUTS[2], [0.16953603, 0.20026156, 0.06157201]],
  ] as const)("XYZ %j → uvY %j", (xyz, expected) =>
    close(new Xyz65(xyz![0], xyz![1], xyz![2]).to(Uvy60).coords, expected)
  );
});
