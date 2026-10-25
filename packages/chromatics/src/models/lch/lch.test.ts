import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Lab } from "../lab/lab.js";
import fixtures from "./lch.fixtures.json" with { type: "json" };
import { Lch } from "./lch.js";

describeModel(Lch, models, {
  fixtures: fixtures as Fixtures,
  // CSS Color 4 #specifying-lab-lch: L clamps to [0%, 100%], a negative C to 0, at parsed-value time.
  strings: [
    ["lch(50 -10 30)", [50, 0, 30], 1],
    ["lch(150 10 30)", [100, 10, 30], 1],
    ["lch(50% 100% 400grad)", [50, 150, 0], 1],
  ],
  // CSS Color 4 #serializing-lab-lch examples (css4-parse-0033, -0034).
  formats: [
    ["lch(37% 105.0 305.00)", "lch(37 105 305)"],
    ["lch(56.2% 83.6 357.4 /93%)", "lch(56.2 83.6 357.4 / 0.93)"],
  ],
});

describe("Lch achromatic threshold (CSS Color 4 `Lab_to_LCH`: 0.0015)", () => {
  it("isAchromatic is ≤ 0.0015", () => {
    expect(new Lch(50, 0.0015, 0).isAchromatic()).toBe(true);
    expect(new Lch(50, 0.00150001, 0).isAchromatic()).toBe(false);
  });

  it("conversion zeroes the hue at the threshold and keeps it above", () => {
    expect(new Lab(50, 0, -0.0015).to(Lch).h).toBe(0);
    expect(new Lab(50, 0, -0.00150001).to(Lch).h).toBe(270);
  });
});
