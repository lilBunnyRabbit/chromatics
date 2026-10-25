import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Ycbcr601 } from "./ycbcr-601.js";

describeModel(Ycbcr601, models, {
  strings: [["ycbcr-601(0.5 -0.1 0.2)", [0.5, -0.1, 0.2], 1]],
});

describe("Ycbcr601 references", () => {
  // ITU-R BT.601-7 Table 1 (E′Y, E′R − E′Y, E′B − E′Y for the bars), re-normalized by §2.5.2:
  // E′CR = (E′R − E′Y)/1.402, E′CB = (E′B − E′Y)/1.772.
  it.each([
    ["white", [1, 1, 1], 1, 0, 0],
    ["black", [0, 0, 0], 0, 0, 0],
    ["red", [1, 0, 0], 0.299, 0.701, -0.299],
    ["green", [0, 1, 0], 0.587, -0.587, -0.587],
    ["blue", [0, 0, 1], 0.114, -0.114, 0.886],
    ["yellow", [1, 1, 0], 0.886, 0.114, -0.886],
    ["cyan", [0, 1, 1], 0.701, -0.701, 0.299],
    ["magenta", [1, 0, 1], 0.413, 0.587, 0.587],
  ] as const)("%s matches BT.601 Table 1", (_, rgb, y, ry, by) => {
    const c = new Srgb(rgb[0], rgb[1], rgb[2]).to(Ycbcr601);
    expect(c.y).toBeCloseTo(y, 14);
    expect(c.cr).toBeCloseTo(ry / 1.402, 14);
    expect(c.cb).toBeCloseTo(by / 1.772, 14);
  });

  // colour-science `colour/models/rgb/ycbcr.py:531-553` @ 248121e3 (ITU-T T.871 §7, JFIF full range):
  // 8-bit R′G′B′ (102, 0, 51) → Y′CbCr (36, 136, 175), i.e. round(255·Y′), round(255·C + 128).
  it("gives JFIF's 8-bit codes", () => {
    const c = new Srgb(102 / 255, 0, 51 / 255).to(Ycbcr601);
    expect([Math.round(255 * c.y), Math.round(255 * c.cb + 128), Math.round(255 * c.cr + 128)]).toEqual([36, 136, 175]);
  });
});
