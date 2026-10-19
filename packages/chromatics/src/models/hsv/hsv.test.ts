import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./hsv.fixtures.json" with { type: "json" };
import { Hsv } from "./hsv.js";

describeModel(Hsv, models, {
  fixtures: fixtures as Fixtures,
  strings: [
    ["hsv(30 100% 100%)", [30, 1, 1], 1],
    ["hsv(30 100 100 / 0.5)", [30, 1, 1], 0.5],
  ],
  invalid: ["hsv(30, 100%, 100%)", "hsb(30 100% 100%)"],
});

describe("Hsv extras", () => {
  it("isAchromatic is s ≤ 0.00001 (the HSL rule, ADR-003), and conversion zeroes the hue there", () => {
    expect(new Hsv(120, 0.00001, 0.5).isAchromatic()).toBe(true);
    expect(new Hsv(120, 0.0000100001, 0.5).isAchromatic()).toBe(false);
    expect(new Srgb(0.5, 0.5, 0.500005).to(Hsv).h).toBe(0);
    expect(new Srgb(0.5, 0.5, 0.5001).to(Hsv).h).toBe(240);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Hsv(0, 0, 0)).toBe(false);
  });
});
