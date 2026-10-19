import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./hsl.fixtures.json" with { type: "json" };
import { Hsl } from "./hsl.js";

describeModel(Hsl, models, {
  fixtures: fixtures as Fixtures,
  // CSS Color 4 #the-hsl-notation: negative saturation clamps to 0% at parse time; numbers are 0–100.
  strings: [
    ["hsl(30 -50% 50%)", [30, 0, 0.5], 1],
    ["hsl(30 100 50)", [30, 1, 0.5], 1],
    ["hsla(30, 100%, 50%, 0.5)", [30, 1, 0.5], 0.5],
    ["hsl(0.5turn 10% 20%)", [180, 0.1, 0.2], 1],
  ],
  // Comma syntax needs percentages for s and l (CSS Color 4 <legacy-hsl-syntax>).
  invalid: ["hsl(30, 100, 50)", "hsl(30, 100%, 50%, none)", "hsl(30 100% 50%, 1)"],
});

describe("Hsl extras", () => {
  it("never yields negative saturation: out-of-gamut sRGB rotates the hue instead (csswg-drafts #9222)", () => {
    const wide = fc.double({ min: -3, max: 3, noNaN: true });
    fc.assert(
      fc.property(wide, wide, wide, (r, g, b) => {
        expect(new Srgb(r, g, b).to(Hsl).s).toBeGreaterThanOrEqual(0);
      })
    );
  });

  it("isAchromatic is s ≤ 0.00001 (CSS Color 4 `rgbToHsl`), and conversion zeroes the hue there", () => {
    expect(new Hsl(120, 0.00001, 0.5).isAchromatic()).toBe(true);
    expect(new Hsl(120, 0.0000100001, 0.5).isAchromatic()).toBe(false);
    expect(new Srgb(0.5, 0.5, 0.500004).to(Hsl).h).toBe(0);
    expect(new Srgb(0.5, 0.5, 0.5001).to(Hsl).h).toBe(240);
  });
});
