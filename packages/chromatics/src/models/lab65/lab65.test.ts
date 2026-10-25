import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { D65_WHITE } from "../../core/matrices.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import fixtures from "./lab65.fixtures.json" with { type: "json" };
import { Lab65 } from "./lab65.js";

describeModel(Lab65, models, {
  fixtures: fixtures as Fixtures,
  strings: [["lab-d65(50 20 -30)", [50, 20, -30], 1]],
  invalid: ["lab-d65(50% 20 -30)", "lab65(50 20 -30)"],
});

// colour-science `colour/models/tests/test_cie_lab.py:48-61` @ 248121e3 (BSD-3, secondary): D65 is its default
// white, from xy (0.3127, 0.3290) like ours; 8 decimals.
describe("Lab65 references", () => {
  it.each([
    [
      [0.20654008, 0.12197225, 0.05136952],
      [41.52787529, 52.63858304, 26.92317922],
    ],
    [
      [0.1422201, 0.23042768, 0.10495772],
      [55.11636304, -41.08791787, 30.91825778],
    ],
    [
      [0.0781878, 0.06157201, 0.28099326],
      [29.8056552, 20.01830466, -48.34913874],
    ],
  ] as const)("XYZ %j → Lab %j", (xyz, expected) => {
    const c = new Xyz65(xyz[0], xyz[1], xyz[2]).to(Lab65);
    expected.forEach((e, i) => expect(Math.abs(c.coords[i]! - e)).toBeLessThan(5e-9 + 1e-12));
  });
});

describe("Lab65 extras", () => {
  it("D65 white is exactly L 100, a 0, b 0", () => {
    expect([...new Xyz65(...D65_WHITE).to(Lab65).coords]).toEqual([100, 0, 0]);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Lab65(0, 0, 0)).toBe(false);
  });
});
