import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Uvy60 } from "../uvy60/uvy60.js";
import { Uvy76 } from "./uvy76.js";

// A chromaticity near 0 with Y ≠ 0 is an astronomically large XYZ, so the sweep stays in the reference ranges.
describeModel(Uvy76, models, { realistic: 1 });

// colour-science @ 248121e3 (BSD-3, secondary), 8 decimals, D65 from xy (0.3127, 0.3290) like ours.
const close = (actual: readonly number[], expected: readonly number[]) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(5e-9 + 1e-12));
const INPUTS: [number, number, number][] = [
  [0.20654008, 0.12197225, 0.05136952],
  [0.1422201, 0.23042768, 0.10495772],
  [0.0781878, 0.06157201, 0.28099326],
];

describe("Uvy76 references", () => {
  // No published u′v′Y vectors were found; CIE 015:2018 Annex A.4 gives u′ = u, v′ = 1.5 v exactly, so
  // colour-science's 1960 vectors (`test_cie_ucs.py:466`) carry over at 1.5× their rounding.
  it.each([
    [INPUTS[0], [0.37720213, 0.33413509]],
    [INPUTS[1], [0.14536327, 0.35328046]],
    [INPUTS[2], [0.16953603, 0.20026156]],
  ] as const)("XYZ %j → u′ v′ from 1960 u v %j", (xyz, [u, v]) => {
    const c = new Xyz65(xyz![0], xyz![1], xyz![2]).to(Uvy76);
    expect(Math.abs(c.u - u)).toBeLessThan(5e-9);
    expect(Math.abs(c.v - 1.5 * v)).toBeLessThan(7.5e-9);
    expect(c.v).toBeCloseTo(1.5 * new Xyz65(xyz![0], xyz![1], xyz![2]).to(Uvy60).v, 15);
  });
});
