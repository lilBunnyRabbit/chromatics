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

// Sass `color.scale` in HSL is the same operation: sass-site @ 5701c5d1
// source/documentation/modules/color.md examples. Hex is the reference's precision, so ±0.5 per byte.
describe("tint / shade / tone", () => {
  const bytes = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const near = (color: Hsl, hex: string) =>
    color.to(Srgb).coords.forEach((v, i) => expect(Math.abs(v * 255 - bytes(hex)[i]!)).toBeLessThanOrEqual(0.5 + 1e-9));
  const fromHex = (hex: string) => new Srgb(...(bytes(hex).map((b) => b / 255) as [number, number, number])).to(Hsl);

  it("shade(0.3) of #003366 is #002447 ($lightness: -30%)", () => near(fromHex("#003366").shade(0.3), "#002447"));
  it("tone(0.3) of #6b717f is #6e727c ($saturation: -30%)", () => near(fromHex("#6b717f").tone(0.3), "#6e727c"));
  it("tint(0.3) of #e1d7d2 is #eae3e0 ($lightness: 30%)", () => near(fromHex("#e1d7d2").tint(0.3), "#eae3e0"));

  it("mutates, keeps the other channels and doesn't clamp (ADR-003)", () => {
    const c = new Hsl(30, 0.5, 0.4);
    expect(c.tint(0.5)).toBe(c);
    expect(c.coords).toEqual([30, 0.5, 0.7]);
    expect(new Hsl(30, 0.5, 0.4).tint(2).l).toBeCloseTo(1.6, 15);
    expect(new Hsl(30, 0.5, 0.4).shade(-1).l).toBeCloseTo(0.8, 15);
    expect(new Hsl(30, 0.5, 0.4).tone(1).s).toBe(0);
  });
});
