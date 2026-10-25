import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { checkSnapshot } from "../../testing/snapshot.js";
import { Srgb } from "../srgb/srgb.js";
import { Hpluv } from "./hpluv.js";

describeModel(Hpluv, models, {
  strings: [
    ["hpluv(250 100% 60%)", [250, 1, 0.6], 1],
    ["hpluv(250 308 60)", [250, 3.08, 0.6], 1],
  ],
  invalid: ["hpluv(250, 100%, 60%)"],
});

describe("Hpluv extras", () => {
  it("matches the HSLuv snapshot's hpluv column (4096 sRGB colors, secondary)", () => {
    checkSnapshot(
      Hpluv,
      "hpluv",
      (c) => {
        const [h, s, l] = c.coords as readonly [number, number, number];
        return [h, s * 100, l * 100];
      },
      {
        index: 0,
        chroma: (e) => e[1]! / 100,
      }
    );
  });

  // hsluv.org: HPLuv "is a variation on HSLuv that ... contains only pastel colors" at p ≤ 100%.
  it("p ≤ 1 stays inside sRGB for every hue", () => {
    for (let h = 0; h < 360; h += 15) {
      for (const l of [0.1, 0.5, 0.9]) expect(new Hpluv(h, 1, l).to(Srgb).inGamut(1e-12)).toBe(true);
    }
  });
});
