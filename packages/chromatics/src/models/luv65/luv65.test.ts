import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { D65_WHITE } from "../../core/matrices.js";
import { describeModel } from "../../testing/harness.js";
import { checkSnapshot } from "../../testing/snapshot.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Luv65 } from "./luv65.js";

describeModel(Luv65, models, {
  strings: [
    ["luv-d65(53.2 175 37.8)", [53.2, 175, 37.8], 1],
    ["luv-d65(120 -300 300 / 0.5)", [120, -300, 300], 0.5],
  ],
  invalid: ["luv-d65(50% 0 0)", "luv(50 0 0)", "luv-d65(50, 0, 0)"],
});

describe("Luv65 extras", () => {
  it("matches the HSLuv snapshot's luv column (4096 sRGB colors, secondary)", () => {
    checkSnapshot(Luv65, "luv", (c) => c.coords);
  });

  it("D65 white is exactly L 100, u 0, v 0", () => {
    expect([...new Xyz65(...D65_WHITE).to(Luv65).coords]).toEqual([100, 0, 0]);
  });

  // CIE 015:2018 eqs. 8.26 / 8.27: 116·∛ε − 16 = κ·ε = 8 where the cube-root and linear pieces meet.
  it("is continuous at the CIE junction (ε = 216/24389, κ = 24389/27)", () => {
    const epsilon = 216 / 24389;
    const at = (t: number) => new Xyz65(D65_WHITE[0] * t, D65_WHITE[1] * t, D65_WHITE[2] * t).to(Luv65).l;
    expect(Math.abs(at(epsilon * (1 + 1e-12)) - at(epsilon * (1 - 1e-12)))).toBeLessThan(1e-9);
    expect(at(epsilon)).toBeCloseTo(8, 12);
  });

  // The pieces meet with equal slope, so random samples rarely see a misplaced inverse junction.
  it("round-trips exactly on both sides of the junction (L* 8 ± 0.04)", () => {
    for (const l of [7.96, 8, 8.04]) {
      const back = new Luv65(l, 10, -10).to(Xyz65).to(Luv65);
      back.coords.forEach((x, i) => expect(x).toBeCloseTo([l, 10, -10][i]!, 12));
    }
  });

  it("black: L 0 converts to XYZ 0 whatever u, v say, and XYZ 0 to Luv 0", () => {
    expect([...new Luv65(0, 50, -50).to(Xyz65).coords]).toEqual([0, 0, 0]);
    expect([...new Xyz65(0, 0, 0).to(Luv65).coords]).toEqual([0, 0, 0]);
  });

  // fast-check counterexample: v′ ≈ 3Y/Z is far below vn's precision, so the inverse sees v′ = 0.
  it("XYZ with Y far below Z round-trips through Luv to the same Luv (finite, no RangeError)", () => {
    const xyz = new Xyz65(0, 4.597042650074421e-293, 1.656259165270515e-276);
    const luv = xyz.to(Luv65);
    const back = luv.to(Xyz65);
    expect(back.coords.every(Number.isFinite)).toBe(true);
    expect([...back.to(Luv65).coords]).toEqual([...luv.coords]);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Luv65(0, 0, 0)).toBe(false);
  });
});
