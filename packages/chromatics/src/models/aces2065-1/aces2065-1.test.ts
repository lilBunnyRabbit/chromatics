import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { LINEAR_AP0_TO_XYZ_ACES, XYZ_ACES_TO_LINEAR_AP0 } from "../../core/matrices.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Aces2065 } from "./aces2065-1.js";

describeModel(Aces2065, models, {
  strings: [["aces2065-1(0.18 0.18 0.18)", [0.18, 0.18, 0.18], 1]],
});

const close = (actual: readonly number[], expected: readonly number[], tol: number) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol));

describe("Aces2065 references", () => {
  // Academy S-2008-001 §4.1.4 / §4.1.5: the published 10-digit NPM and its inverse.
  it.each([
    [
      LINEAR_AP0_TO_XYZ_ACES,
      [
        [0.9525523959, 0, 0.0000936786],
        [0.3439664498, 0.7281660966, -0.0721325464],
        [0, 0, 1.0088251844],
      ],
    ],
    [
      XYZ_ACES_TO_LINEAR_AP0,
      [
        [1.0498110175, 0, -0.0000974845],
        [-0.4959030231, 1.3733130458, 0.0982400361],
        [0, 0, 0.9912520182],
      ],
    ],
  ] as const)("derived NPM matches S-2008-001 to its 10 decimals (%#)", (actual, expected) => {
    expected.forEach((row, i) => close(actual[i]!, row, 5e-11));
  });

  // OpenColorIO `tests/cpu/transforms/BuiltinTransform_tests.cpp:377-379` @ 22dd9c4f,
  // "UTILITY - ACES-AP0_to_CIE-XYZ-D65_BFD" (Bradford to D65).
  it("AP0 → XYZ D65 (Bradford) matches OCIO", () => {
    close(new Aces2065(0.5, 0.4, 0.3).to(Xyz65).coords, [0.47234760339, 0.440425934827, 0.326581044758], 1e-9);
  });

  it("D65 white maps to the ACES white, (1, 1, 1)", () => {
    close(new Srgb(1, 1, 1).to(Aces2065).coords, [1, 1, 1], 1e-12);
  });
});
