import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
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
