import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { cornerSpread, halfDigit, hueDistance } from "../../testing/printed.js";
import { Srgb } from "../srgb/srgb.js";
import { Hsp } from "./hsp.js";

describeModel(Hsp, models, {
  strings: [
    ["hsp(30 100% 60%)", [30, 1, 0.6], 1],
    ["hsp(30 100 60 / 0.5)", [30, 1, 0.6], 0.5],
  ],
  invalid: ["hsp(30, 100%, 60%)", "hsb(30 100% 60%)"],
});

const toHsp = (r: number, g: number, b: number) => new Srgb(r, g, b).to(Hsp).coords;

// No independent published vector exists for P: Finley's page prints one example, HSP(0, 1, 1) →
// RGB(2.037, 0, 0), and it comes from his earlier .241 weights, not the published .299 (ADR-015).
describe("Hsp references", () => {
  // Finley: hue and saturation "work the same way as in the HSV/B and HSL systems", so Wikipedia "HSL and
  // HSV" oldid 1378989624's Examples table (secondary) gives them: R G B, H, S_HSV.
  it.each([
    ["#FF0000", "1.000", "0.000", "0.000", "0.0", "1.000"],
    ["#BFBF00", "0.750", "0.750", "0.000", "60.0", "1.000"],
    ["#80FFFF", "0.500", "1.000", "1.000", "180.0", "0.500"],
    ["#BF40BF", "0.750", "0.250", "0.750", "300.0", "0.667"],
    ["#A0A424", "0.628", "0.643", "0.142", "61.8", "0.779"],
    ["#411BEA", "0.255", "0.104", "0.918", "251.1", "0.887"],
    ["#F0C80E", "0.941", "0.785", "0.053", "49.5", "0.944"],
    ["#ED7651", "0.931", "0.463", "0.316", "14.3", "0.661"],
    ["#362698", "0.211", "0.149", "0.597", "248.3", "0.750"],
    ["#7E7EB8", "0.495", "0.493", "0.721", "240.5", "0.316"],
  ])("%s", (_, r, g, b, h, s) => {
    const input = [Number(r), Number(g), Number(b)];
    const c = new Srgb(input[0]!, input[1]!, input[2]!).to(Hsp);
    const spread = cornerSpread(input, halfDigit(r), toHsp, [true]);
    expect(Math.abs(c.s - Number(s))).toBeLessThanOrEqual(halfDigit(s) + spread[1]! + 1e-12);
    expect(hueDistance(c.h, Number(h))).toBeLessThanOrEqual(halfDigit(h) + spread[0]! + 1e-12);
  });

  // color-space `test/index.js:642,647` @1952e63c, an implementation cross-check (a transcription of
  // Finley's C, not a published table): H in degrees, S and P in %, rounded to 1 decimal.
  it.each([
    [
      [98, 115, 255],
      ["233.5", "61.6", "52.7"],
    ],
    [
      [110, 110, 110],
      ["0", "0", "43.1"],
    ],
  ] as const)("rgb(%j) → hsp(%j)", (rgb, [h, s, p]) => {
    const c = new Srgb(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).to(Hsp);
    expect(hueDistance(c.h, Number(h))).toBeLessThanOrEqual(halfDigit(h) + 1e-12);
    expect(Math.abs(c.s * 100 - Number(s))).toBeLessThanOrEqual(halfDigit(s) + 1e-12);
    expect(Math.abs(c.p * 100 - Number(p))).toBeLessThanOrEqual(halfDigit(p) + 1e-12);
  });
});

describe("Hsp extras", () => {
  it("a grey's P is its value, and white's is 1 (Finley's weights sum to 1)", () => {
    expect(new Srgb(0.25, 0.25, 0.25).to(Hsp).p).toBeCloseTo(0.25, 15);
    expect(new Srgb(1, 1, 1).to(Hsp).p).toBeCloseTo(1, 15);
  });

  it("s > 1 extrapolates past Finley's S = 1 branch instead of clamping to it (ADR-003)", () => {
    const rgb = new Hsp(30, 1.2, 0.5).to(Srgb);
    expect(rgb.b).toBeLessThan(0);
    expect(rgb.to(Hsp).s).toBeCloseTo(1.2, 12);
  });

  it("isAchromatic is s ≤ 0.00001 (ADR-003), and conversion zeroes the hue there", () => {
    expect(new Hsp(120, 0.00001, 0.5).isAchromatic()).toBe(true);
    expect(new Hsp(120, 0.0000100001, 0.5).isAchromatic()).toBe(false);
    expect(new Srgb(0.5, 0.5, 0.500005).to(Hsp).h).toBe(0);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Hsp(0, 0, 0)).toBe(false);
  });
});
