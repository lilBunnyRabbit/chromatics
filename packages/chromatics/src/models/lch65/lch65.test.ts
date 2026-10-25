import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Lab65 } from "../lab65/lab65.js";
import fixtures from "./lch65.fixtures.json" with { type: "json" };
import { Lch65 } from "./lch65.js";

describeModel(Lch65, models, {
  fixtures: fixtures as Fixtures,
  strings: [["lch-d65(50 30 0.5turn)", [50, 30, 180], 1]],
});

describe("Lch65 extras", () => {
  it("isAchromatic is c ≤ 0.0015, and conversion zeroes the hue there", () => {
    expect(new Lch65(50, 0.0015, 90).isAchromatic()).toBe(true);
    expect(new Lab65(50, 0, -0.0015).to(Lch65).h).toBe(0);
    expect(new Lab65(50, 0, -0.00150001).to(Lch65).h).toBe(270);
  });
});
