import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Oklab } from "../oklab/oklab.js";
import fixtures from "./oklch.fixtures.json" with { type: "json" };
import { Oklch } from "./oklch.js";

describeModel(Oklch, models, {
  fixtures: fixtures as Fixtures,
  // CSS Color 4 #specifying-oklab-oklch: L clamps to [0%, 100%], a negative C to 0, at parsed-value time.
  strings: [
    ["oklch(0.5 -0.1 30)", [0.5, 0, 30], 1],
    ["oklch(1.5 0.1 30)", [1, 0.1, 30], 1],
    ["oklch(50% 100% 0.25turn / 50%)", [0.5, 0.4, 90], 0.5],
    ["oklch(0.5 0.1 none)", [0.5, 0.1, 0], 1],
  ],
  invalid: ["oklch(0.5, 0.1, 30)", "oklch(0.5 0.1)", "oklch(0.5 0.1 30deg 1)", "lch(50 10 30)"],
  // CSS Color 4 #serializing-oklab-oklch examples (css4-parse-0037, -0038).
  formats: [
    ["oklch(56.43% 0.0900 123.40)", "oklch(0.5643 0.09 123.4)"],
    ["oklch(53.85% 0.1725 320.67 / 70%)", "oklch(0.5385 0.1725 320.67 / 0.7)"],
  ],
});

describe("Oklch achromatic threshold (CSS Color 4 `OKLab_to_OKLCH`: 0.000004)", () => {
  it("isAchromatic is ≤ 0.000004", () => {
    expect(new Oklch(0.5, 0.000004, 0).isAchromatic()).toBe(true);
    expect(new Oklch(0.5, 0.0000040001, 0).isAchromatic()).toBe(false);
  });

  it("conversion zeroes the hue at the threshold and keeps it above", () => {
    expect(new Oklab(0.5, 0, -0.000004).to(Oklch).h).toBe(0);
    expect(new Oklab(0.5, 0, -0.0000040001).to(Oklch).h).toBe(270);
  });
});
