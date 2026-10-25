import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import fixtures from "./jzazbz.fixtures.json" with { type: "json" };
import { Jzazbz } from "./jzazbz.js";

describeModel(Jzazbz, models, {
  fixtures: fixtures as Fixtures,
  realistic: 0.4,
  strings: [
    ["jzazbz(0.5 0.1 -0.1)", [0.5, 0.1, -0.1], 1],
    ["jzazbz(50% 100% -100% / 0.5)", [0.5, 0.21, -0.21], 0.5],
  ],
});

describe("Jzazbz references", () => {
  // CSS Color HDR 1 ED (2026-10-08) §6.4: sRGB white "jzazbz(0.22207 -0.00016 -0.00012)" (half a digit).
  it("sRGB white is jzazbz(0.22207 -0.00016 -0.00012) (CSS Color HDR 1 §6.4)", () => {
    const c = new Srgb(1, 1, 1).to(Jzazbz);
    [0.22207, -0.00016, -0.00012].forEach((e, i) => expect(Math.abs(c.coords[i]! - e)).toBeLessThanOrEqual(5e-6));
  });

  // colour-science `colour/models/tests/test_jzazbz.py` @ 248121e3 (BSD-3, secondary): absolute XYZ in
  // cd/m², 8 decimals. This package takes relative XYZ with Y = 1 at 203 cd/m², hence / 203.
  it.each([
    [
      [0.20654008, 0.12197225, 0.05136952],
      [0.00535048, 0.00924302, 0.00526007],
    ],
    [
      [0.1422201, 0.23042768, 0.10495772],
      [0.00619681, -0.00608426, 0.00534077],
    ],
    [
      [0.96907232, 1, 1.12179215],
      [0.01766826, 0.00064174, -0.00052906],
    ],
  ])("colour-science: XYZ %j cd/m² → %j (secondary)", (xyz, expected) => {
    const c = new Xyz65(...(xyz.map((v) => v / 203) as [number, number, number])).to(Jzazbz);
    expected.forEach((e, i) => expect(Math.abs(c.coords[i]! - e)).toBeLessThanOrEqual(5e-9 + 1e-12));
  });

  // Safdar 2017 eq. 12: d0 makes black Jz = 0.
  it("black is Jz 0 within d0's 17 digits", () => {
    expect(Math.abs(new Xyz65(0, 0, 0).to(Jzazbz).j)).toBeLessThan(1e-15);
  });

  it("negative light round-trips (grill 60)", () => {
    const c = new Srgb(-0.2, 1, 0).to(Jzazbz).to(Srgb);
    [-0.2, 1, 0].forEach((e, i) => expect(c.coords[i]!).toBeCloseTo(e, 10));
  });
});
