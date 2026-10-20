import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { AP0_TO_AP1, AP1_TO_AP0 } from "../../core/matrices.js";
import { describeModel } from "../../testing/harness.js";
import { Aces2065 } from "../aces2065-1/aces2065-1.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Acescg } from "./acescg.js";

describeModel(Acescg, models, {
  strings: [["acescg(0.18 0.18 0.18)", [0.18, 0.18, 0.18], 1]],
});

const close = (actual: readonly number[], expected: readonly number[], tol: number) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol));

describe("Acescg references", () => {
  // Academy S-2014-004 §4.5 as aces-docs `acescg.md:119-121, 162-164` @ 7c34c210 prints them (10 decimals).
  it.each([
    [
      AP0_TO_AP1,
      [
        [1.4514393161, -0.2365107469, -0.2149285693],
        [-0.0765537734, 1.1762296998, -0.0996759264],
        [0.0083161484, -0.0060324498, 0.9977163014],
      ],
    ],
    [
      AP1_TO_AP0,
      [
        [0.6954522414, 0.1406786965, 0.1638690622],
        [0.0447945634, 0.8596711185, 0.0955343182],
        [-0.0055258826, 0.0040252103, 1.0015006723],
      ],
    ],
  ] as const)("derived TRA matches the spec to its 10 decimals (%#)", (actual, expected) => {
    expected.forEach((row, i) => close(actual[i]!, row, 5e-11));
  });

  // OpenColorIO `tests/cpu/transforms/BuiltinTransform_tests.cpp:380-382, 397-399` @ 22dd9c4f.
  it("AP1 → XYZ D65 (Bradford) matches OCIO", () => {
    close(new Acescg(0.5, 0.4, 0.3).to(Xyz65).coords, [0.428407900093, 0.420968434905, 0.325777868096], 1e-9);
  });

  it("ACEScg → ACES2065-1 matches OCIO", () => {
    close(new Acescg(0.5, 0.4, 0.3).to(Aces2065).coords, [0.453158317919, 0.39492602452, 0.299297344519], 1e-9);
  });
});
