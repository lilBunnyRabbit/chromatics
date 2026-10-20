import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Ydbdr } from "./ydbdr.js";

describeModel(Ydbdr, models, {
  strings: [["ydbdr(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

// No independent Y′DbDr vectors are published (colour-science, culori and color.js lack it; BT.470-6 has no
// worked example). These check the definition against BT.601-7 Table 1's B′ − Y′ and R′ − Y′.
describe("Ydbdr definition", () => {
  it.each([
    ["red", [1, 0, 0], 0.299, 0.701, -0.299],
    ["yellow", [1, 1, 0], 0.886, 0.114, -0.886],
    ["blue", [0, 0, 1], 0.114, -0.114, 0.886],
  ] as const)("%s: D′B = 1.505·(B′ − Y′), D′R = −1.902·(R′ − Y′) (BT.470-6 Table 2)", (_, rgb, y, ry, by) => {
    const c = new Srgb(rgb[0], rgb[1], rgb[2]).to(Ydbdr);
    expect(c.y).toBeCloseTo(y, 14);
    expect(c.db).toBeCloseTo(1.505 * by, 14);
    expect(c.dr).toBeCloseTo(-1.902 * ry, 14);
  });
});
