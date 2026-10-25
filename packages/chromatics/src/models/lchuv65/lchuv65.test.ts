import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { checkSnapshot } from "../../testing/snapshot.js";
import { Luv65 } from "../luv65/luv65.js";
import { Lchuv65 } from "./lchuv65.js";

describeModel(Lchuv65, models, {
  strings: [
    ["lchuv-d65(53.2 179 12.2)", [53.2, 179, 12.2], 1],
    ["lchuv-d65(50 30 0.5turn / 50%)", [50, 30, 180], 0.5],
  ],
  invalid: ["lchuv-d65(50% 30 0)", "lchuv(50 30 0)"],
});

describe("Lchuv65 extras", () => {
  it("matches the HSLuv snapshot's lch column (4096 sRGB colors, secondary; hue weighted by chroma)", () => {
    checkSnapshot(Lchuv65, "lch", (c) => c.coords, { index: 2, chroma: (e) => e[1]! });
  });

  it("isAchromatic is c ≤ 0.0015, and conversion zeroes the hue there", () => {
    expect(new Lchuv65(50, 0.0015, 90).isAchromatic()).toBe(true);
    expect(new Lchuv65(50, 0.00150001, 90).isAchromatic()).toBe(false);
    expect(new Luv65(50, 0, -0.0015).to(Lchuv65).h).toBe(0);
    expect(new Luv65(50, 0, -0.00150001).to(Lchuv65).h).toBe(270);
  });
});
