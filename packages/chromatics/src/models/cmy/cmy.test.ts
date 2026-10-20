import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Cmy } from "./cmy.js";

describeModel(Cmy, models, {
  strings: [
    ["cmy(0 1 1)", [0, 1, 1], 1],
    ["cmy(0% 100% 50% / 0.5)", [0, 1, 0.5], 0.5],
  ],
  invalid: ["cmy(0, 1, 1)", "cmy(0 1)"],
});

describe("Cmy references", () => {
  // colour-science `colour/models/rgb/tests/test_cmyk.py` @248121e3, atol 1e-7 (`TOLERANCE_ABSOLUTE_TESTS`).
  it.each([
    [
      [0.45620519, 0.03081071, 0.04091952],
      [0.54379481, 0.96918929, 0.95908048],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1, 1],
      [0, 0, 0],
    ],
  ] as const)("rgb %j ↔ cmy %j", (rgb, cmy) => {
    new Srgb(rgb[0], rgb[1], rgb[2])
      .to(Cmy)
      .coords.forEach((v, i) => expect(Math.abs(v - cmy[i]!)).toBeLessThanOrEqual(1e-7));
    new Cmy(cmy[0], cmy[1], cmy[2])
      .to(Srgb)
      .coords.forEach((v, i) => expect(Math.abs(v - rgb[i]!)).toBeLessThanOrEqual(1e-7));
  });
});

describe("Cmy extras", () => {
  it("has no toCss: convert first", () => {
    expect("toCss" in new Cmy(0, 0, 0)).toBe(false);
  });
});
