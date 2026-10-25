import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Rec2020 } from "../rec2020/rec2020.js";
import { Ycbcr2020 } from "./ycbcr-2020.js";

describeModel(Ycbcr2020, models, {
  strings: [["ycbcr-2020(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

describe("Ycbcr2020 references", () => {
  // colour-science `colour/models/rgb/tests/test_ycbcr.py:270-277` @ 248121e3: BT.2020 weights, full-range
  // float (no offset).
  it("matches colour-science's full-range float vector", () => {
    const c = new Rec2020(0, 0.75, 0.75).to(Ycbcr2020);
    expect(c.y).toBeCloseTo(0.552975, 8);
    expect(c.cb).toBeCloseTo(0.10472255, 8);
    expect(c.cr).toBeCloseTo(-0.375, 8);
  });
});
