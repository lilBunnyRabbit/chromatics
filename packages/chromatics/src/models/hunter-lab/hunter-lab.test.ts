import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { fromXyz } from "../../core/hunter.js";
import { D65_WHITE } from "../../core/matrices.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { describeModel } from "../../testing/harness.js";
import { HunterLab } from "./hunter-lab.js";

describeModel(HunterLab, models);

const close = (actual: readonly number[], expected: readonly number[], tol = 5e-9) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol + 1e-12));

describe("HunterLab references", () => {
  // colour-science `colour/models/tests/test_hunter_lab.py:179` @ 248121e3 (secondary): HunterLab's tabulated D65
  // white (95.02, 100, 108.82) with Ka / Kb from the 1966 formula (`K_ab=None`), the form this class uses.
  it("XYZ (0.20654008, 0.12197225, 0.05136952), HunterLab D65 white → (34.92452577, 47.05669614, 14.38385238)", () => {
    close(fromXyz(0.20654008, 0.12197225, 0.05136952, [0.9502, 1, 1.0882]), [34.92452577, 47.05669614, 14.38385238]);
  });

  it("keeps a and b just above the 1e-12 luminance floor", () => {
    const c = new Xyz65(2e-10, 1e-10, 0.5e-10).to(HunterLab).to(Xyz65);
    expect(c.x).toBeCloseTo(2e-10, 20);
    expect(c.z).toBeCloseTo(0.5e-10, 20);
  });

  it("the white is L 100, a 0, b 0", () => {
    close(new Xyz65(...D65_WHITE).to(HunterLab).coords, [100, 0, 0]);
  });
});
