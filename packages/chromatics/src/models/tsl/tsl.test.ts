import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { halfDigit, hueDistance } from "../../testing/printed.js";
import { Hsl } from "../hsl/hsl.js";
import { Srgb } from "../srgb/srgb.js";
import { Tsl } from "./tsl.js";

describeModel(Tsl, models, {
  strings: [
    ["tsl(315 0.6 0.1)", [315, 0.6, 0.1], 1],
    ["tsl(0.5turn 60% 10% / 0.5)", [180, 0.6, 0.1], 0.5],
  ],
  invalid: ["tsl(315, 0.6, 0.1)", "tsl(315 0.6)"],
});

// No independent published vector exists: Terrillon et al.'s tables are detection rates (ADR-015).
describe("Tsl references", () => {
  // color-space `test/index.js:1842-1843` @1952e63c, an implementation cross-check: T in degrees, S, L in
  // 0–255, rounded to 4 decimals.
  it.each([
    [
      [255, 0, 0],
      ["206.5651", "1", "76.245"],
    ],
    [
      [0, 0, 255],
      ["315", "0.6325", "29.07"],
    ],
  ] as const)("rgb(%j) → tsl(%j)", (rgb, [t, s, l]) => {
    const c = new Srgb(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).to(Tsl);
    expect(hueDistance(c.t, Number(t))).toBeLessThanOrEqual(halfDigit(t) + 1e-12);
    expect(Math.abs(c.s - Number(s))).toBeLessThanOrEqual(halfDigit(s) + 1e-12);
    expect(Math.abs(c.l * 255 - Number(l))).toBeLessThanOrEqual(halfDigit(l) + 1e-9);
  });

  // Wikipedia "TSL color space" revid 1364394952: L is Rec. 601 luma, S is 0 for grey.
  it("l is 0.299·R + 0.587·G + 0.114·B, and grey has s 0", () => {
    expect(new Srgb(0, 1, 0).to(Tsl).l).toBeCloseTo(0.587, 15);
    const grey = new Srgb(0.4, 0.4, 0.4).to(Tsl);
    expect([grey.t, grey.s]).toEqual([0, 0]);
  });
});

describe("Tsl extras", () => {
  // color-space `test/index.js:1845`: (170, 100, 30) has g = ⅓ exactly; the studio's T = 0.25 there broke
  // its own round trip.
  it("round-trips at g′ = 0, where Terrillon's literal tint can't", () => {
    const back = new Srgb(170 / 255, 100 / 255, 30 / 255).to(Tsl).to(Srgb);
    back.coords.forEach((v, i) => expect(v * 255).toBeCloseTo([170, 100, 30][i]!, 9));
  });

  it("rotates and mixes on t like any hue (ADR-015)", () => {
    expect(new Tsl(350, 0.5, 0.5).rotateHue(20).t).toBeCloseTo(10, 12);
    expect(new Tsl(350, 0.5, 0.5).mix(new Tsl(10, 0.5, 0.5), 0.5).t).toBeCloseTo(0, 12);
    expect(new Hsl(350, 1, 0.5).rotateHue(20).h).toBeCloseTo(10, 12);
  });

  it("isAchromatic is s ≤ 0.00001 (ADR-003)", () => {
    expect(new Tsl(120, 0.00001, 0.5).isAchromatic()).toBe(true);
    expect(new Tsl(120, 0.0000100001, 0.5).isAchromatic()).toBe(false);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Tsl(0, 0, 0)).toBe(false);
  });
});
