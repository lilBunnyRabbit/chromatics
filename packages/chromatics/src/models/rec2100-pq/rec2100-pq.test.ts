import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Rec2020 } from "../rec2020/rec2020.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Rec2100Pq } from "./rec2100-pq.js";

describeModel(Rec2100Pq, models, {
  // PQ decodes as a 1/m1 ≈ 6.3 power: inputs far outside 0–1 leave the number range.
  realistic: 1,
  strings: [
    ["color(rec2100-pq 0.5 0.4 0.3)", [0.5, 0.4, 0.3], 1],
    ["color(rec2100-pq 50% 40% 30% / 0.5)", [0.5, 0.4, 0.3], 0.5],
  ],
});

describe("Rec2100Pq references", () => {
  // colour-science `transfer_functions/tests/test_st_2084.py:53-72` @ 248121e3 (input in cd/m²) and
  // `test_itur_bt_2100.py:330-343` (10 000 → 1). Relative Y = 1 is 203 cd/m² (BT.2100-3 Table 10 note 10a).
  it.each([
    [100, 0.508078421517399],
    [400, 0.652578597563067],
    [10000, 1],
  ])("a grey of %s cd/m² encodes to %s", (nits, e) => {
    expect(new Rec2100Pq(e, e, e).to(Xyz65).y).toBeCloseTo(nits / 203, 10);
    new Xyz65(...new Rec2100Pq(e, e, e).to(Xyz65).coords)
      .to(Rec2100Pq)
      .coords.forEach((v) => expect(v).toBeCloseTo(e, 12));
  });

  it("negative light round-trips through the mirrored PQ (grill 60)", () => {
    const c = new Rec2020(-0.2, 0.5, 1.2).to(Rec2100Pq).to(Rec2020);
    [-0.2, 0.5, 1.2].forEach((v, i) => expect(c.coords[i]!).toBeCloseTo(v, 10));
  });

  it("serializes as CSS Color HDR color()", () => {
    expect(new Rec2100Pq(0.5, 0.4, 0.3).toCss()).toBe("color(rec2100-pq 0.5 0.4 0.3)");
  });
});
