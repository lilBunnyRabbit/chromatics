import { describe, expect, it } from "vitest";
import { models, parse } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Jzazbz } from "../jzazbz/jzazbz.js";
import fixtures from "./jzczhz.fixtures.json" with { type: "json" };
import { Jzczhz } from "./jzczhz.js";

describeModel(Jzczhz, models, {
  fixtures: fixtures as Fixtures,
  realistic: 0.4,
  strings: [
    ["jzczhz(0.2 0.1 30)", [0.2, 0.1, 30], 1],
    ["jzczhz(20% 50% 0.5turn)", [0.2, 0.13, 180], 1],
  ],
});

describe("Jzczhz extras", () => {
  it("isAchromatic is c ≤ 0.0000026 (CSS Color HDR 1 §6.5), and conversion zeroes the hue there", () => {
    expect(new Jzczhz(0.2, 0.0000026, 90).isAchromatic()).toBe(true);
    expect(new Jzczhz(0.2, 0.0000026001, 90).isAchromatic()).toBe(false);
    expect(new Jzazbz(0.2, 0, -0.0000026).to(Jzczhz).h).toBe(0);
    expect(new Jzazbz(0.2, 0, -0.0000026001).to(Jzczhz).h).toBe(270);
  });
});

describe("Jzczhz deltaEz (Safdar 2017 eq. 15)", () => {
  const jz = (css: string) => parse(css).to(Jzczhz);

  // coloraide `tests/test_distance.py` `test_delta_e_jz` @4888fc2d, 4 decimals.
  it.each([
    ["orange", 0.0941],
    ["yellow", 0.1663],
    ["green", 0.1996],
    ["blue", 0.3396],
    ["indigo", 0.2401],
    ["violet", 0.1786],
    ["white", 0.1848],
    ["black", 0.2109],
    ["gray", 0.1635],
    ["red", 0],
  ] as const)("red to %s is %d (coloraide)", (other, expected) => {
    expect(jz("red").deltaEz(jz(other))).toBeCloseTo(expected, 4);
    expect(jz(other).deltaEz(jz("red"))).toBe(jz("red").deltaEz(jz(other)));
  });

  // color.js `test/delta.js` "DeltaE Jz" @4d3ab45.
  it("white to black is 0.222065 and #fffffe to white 0.0007484574612543073 (color.js)", () => {
    expect(jz("white").deltaEz(jz("black"))).toBeCloseTo(0.222065, 6);
    expect(jz("#fffffe").deltaEz(jz("white"))).toBeCloseTo(0.0007484574612543073, 12);
  });

  it("is the 3-4-5 triangle on jzazbz(0.1 0.03 0.04) and jzazbz(0.1 0 0) (color.js)", () => {
    const a = new Jzazbz(0.1, 0.03, 0.04).to(Jzczhz);
    const b = new Jzazbz(0.1, 0, 0).to(Jzczhz);
    expect(a.deltaEz(b)).toBeCloseTo(0.05, 15);
  });
});
