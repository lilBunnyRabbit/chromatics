import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Ycgco } from "./ycgco.js";

describeModel(Ycgco, models, {
  strings: [["ycgco(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

describe("Ycgco references", () => {
  // colour-science `colour/models/rgb/tests/test_ycocg.py:48-59` @ 248121e3, exact (`xp_assert_equal`). It
  // orders the channels Y, Co, Cg; H.273's order (here) is Y, Cg, Co.
  it.each([
    [
      [0.75, 0.75, 0],
      [0.5625, 0.375, 0.1875],
    ],
    [
      [0.25, 0.5, 0.75],
      [0.5, -0.25, 0],
    ],
    [
      [0, 0.75, 0.75],
      [0.5625, -0.375, 0.1875],
    ],
  ] as const)("%j → Y Co Cg %j", (rgb, [y, co, cg]) => {
    const c = new Srgb(rgb[0], rgb[1], rgb[2]).to(Ycgco);
    expect([c.y, c.co, c.cg]).toEqual([y, co, cg]);
  });
});
