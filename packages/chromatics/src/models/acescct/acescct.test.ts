import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { acesccToLinear, acescctToLinear, linearToAcescc, linearToAcescct } from "../../core/transfer.js";
import { describeModel } from "../../testing/harness.js";
import { Aces2065 } from "../aces2065-1/aces2065-1.js";
import { Acescg } from "../acescg/acescg.js";
import { Acescct } from "./acescct.js";

describeModel(Acescct, models, {
  // The log2 decode is exponential: ACEScc 58 is already 2^1016 linear.
  realistic: 1,
  strings: [["acescct(0.4136 0.4136 0.4136)", [0.4136, 0.4136, 0.4136], 1]],
});

const close = (actual: readonly number[], expected: readonly number[], tol: number) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol));

describe("Acescct references", () => {
  // colour-science `transfer_functions/tests/test_aces.py:444-467, 551-574` @ 248121e3.
  it.each([
    [0, 0.072905534195835495],
    [0.18, 0.413588402492442],
    [1, 0.554794520547945],
  ])("encodes %s as colour-science does", (lin, v) => {
    expect(Math.abs(linearToAcescct(lin) - v)).toBeLessThan(1e-15);
    expect(Math.abs(acescctToLinear(v) - lin)).toBeLessThan(1e-14);
  });

  // colour-science `test_aces.py:519-535`: ACEScct equals ACEScc above the toe, from 0.0078125 up.
  it.each([0.0078125, 0.18, 1, 222.86094420380761])("equals ACEScc at lin %s", (lin) => {
    expect(linearToAcescct(lin)).toBeCloseTo(linearToAcescc(lin), 14);
    expect(acescctToLinear(linearToAcescc(lin))).toBeCloseTo(acesccToLinear(linearToAcescc(lin)), 10);
  });

  // OpenColorIO `tests/cpu/transforms/BuiltinTransform_tests.cpp:386-391` @ 22dd9c4f.
  it("decodes as OCIO's ACEScct curve", () => {
    close(new Acescct(0.5, 0.4, 0.3).to(Acescg).coords, [0.514056913328, 0.152618314084, 0.045310838527], 1e-9);
  });

  it("ACEScct → ACES2065-1 matches OCIO", () => {
    close(new Acescct(0.5, 0.4, 0.3).to(Aces2065).coords, [0.386397222658, 0.158557251811, 0.043152537925], 1e-9);
  });

  it("the linear toe covers negatives; no 65504 cap (grill 70)", () => {
    close(new Acescg(-0.05, 0, 3e5).to(Acescct).to(Acescg).coords, [-0.05, 0, 3e5], 1e-9);
  });
});
