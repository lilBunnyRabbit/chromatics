import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./hwb.fixtures.json" with { type: "json" };
import { Hwb } from "./hwb.js";

describeModel(Hwb, models, {
  fixtures: fixtures as Fixtures,
  strings: [
    ["hwb(30 20 30)", [30, 0.2, 0.3], 1],
    ["hwb(30 60% 60%)", [30, 0.6, 0.6], 1],
  ],
  // CSS Color 4 #the-hwb-notation: hwb() has no comma syntax.
  invalid: ["hwb(30, 20%, 30%)"],
});

describe("Hwb extras", () => {
  it("isAchromatic is w + b ≥ 0.99999 (CSS Color 4 `rgbToHwb`), and conversion zeroes the hue there", () => {
    expect(new Hwb(120, 0.5, 0.4999901).isAchromatic()).toBe(true);
    expect(new Hwb(120, 0.5, 0.49998).isAchromatic()).toBe(false);
    expect(new Srgb(0.5, 0.5, 0.500005).to(Hwb).h).toBe(0);
    expect(new Srgb(0.5, 0.5, 0.50002).to(Hwb).h).toBeCloseTo(240, 9);
  });

  it("w + b ≥ 1 is the grey w / (w + b) (CSS Color 4 `hwbToRgb`)", () => {
    expect([...new Hwb(200, 0.6, 0.6).to(Srgb).coords]).toEqual([0.5, 0.5, 0.5]);
  });
});
