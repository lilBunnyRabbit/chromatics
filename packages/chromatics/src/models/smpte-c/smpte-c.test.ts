import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { LINEAR_SMPTE_C_TO_XYZ_D65 } from "../../core/matrices.js";
import { linearToSmpte170m, smpte170mToLinear } from "../../core/transfer.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { SmpteC } from "./smpte-c.js";

describeModel(SmpteC, models, {
  strings: [["smpte-c(1 0.5 0)", [1, 0.5, 0], 1]],
});

describe("SmpteC references", () => {
  // colour-science `transfer_functions/tests/test_itur_bt_601.py:52-68, 133-152` @ 248121e3: BT.601's OETF
  // is SMPTE 170M §5.1's (same constants).
  it.each([
    [0, 0],
    [0.015, 0.0675],
    [0.18, 0.40900772886415],
    [1, 1],
  ])("170M OETF %s → %s", (lin, v) => {
    expect(Math.abs(linearToSmpte170m(lin) - v)).toBeLessThan(1e-14);
    expect(Math.abs(smpte170mToLinear(v) - lin)).toBeLessThan(1e-14);
  });

  // Bruce Lindbloom, "RGB Working Space Information" (SMPTE-C row, Y): 0.212395 0.701049 0.086556. His D65
  // white is (0.95047, 1, 1.08883), not CSS's 4-figure x, y, so it agrees to about 1e-4 only.
  it("luminance row matches Lindbloom to his white's precision", () => {
    [0.212395, 0.701049, 0.086556].forEach((e, i) =>
      expect(Math.abs(LINEAR_SMPTE_C_TO_XYZ_D65[1][i]! - e)).toBeLessThan(2e-4)
    );
  });

  it("white is white and negatives keep their sign", () => {
    new Srgb(1, 1, 1).to(SmpteC).coords.forEach((v) => expect(v).toBeCloseTo(1, 12));
    expect(linearToSmpte170m(-0.18)).toBe(-linearToSmpte170m(0.18));
  });
});
