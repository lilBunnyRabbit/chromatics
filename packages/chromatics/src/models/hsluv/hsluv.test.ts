import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { checkSnapshot } from "../../testing/snapshot.js";
import { Lchuv65 } from "../lchuv65/lchuv65.js";
import { Srgb } from "../srgb/srgb.js";
import { Hsluv } from "./hsluv.js";

describeModel(Hsluv, models, {
  strings: [
    ["hsluv(250 100% 60%)", [250, 1, 0.6], 1],
    ["hsluv(250 100 60 / 0.5)", [250, 1, 0.6], 0.5],
  ],
  invalid: ["hsluv(250, 100%, 60%)", "hsl-uv(250 100% 60%)"],
});

describe("Hsluv extras", () => {
  // The snapshot writes s and l as 0–100.
  it("matches the HSLuv snapshot's hsluv column (4096 sRGB colors, secondary)", () => {
    checkSnapshot(
      Hsluv,
      "hsluv",
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

  // hsluv.org: "saturation ... 100% is the most saturated color possible" for that hue and lightness.
  it("s = 1 lies on the sRGB boundary: in gamut, with one channel at 0 or 1", () => {
    for (const h of [0, 45, 90, 135, 180, 225, 270, 315]) {
      for (const l of [0.2, 0.5, 0.8]) {
        const rgb = new Hsluv(h, 1, l).to(Srgb);
        expect(rgb.inGamut(1e-12)).toBe(true);
        expect(rgb.coords.some((v) => Math.abs(v) < 1e-9 || Math.abs(v - 1) < 1e-9)).toBe(true);
      }
    }
  });

  it("black and white: l 0 / 1 are black / white for any s; beyond them the geometry carries on", () => {
    expect([...new Hsluv(120, 0.7, 1).to(Srgb).coords].map((v) => +v.toFixed(12))).toEqual([1, 1, 1]);
    expect([...new Hsluv(120, 0.7, 0).to(Srgb).coords]).toEqual([0, 0, 0]);
    const over = new Hsluv(120, 0.5, 1.2);
    expect(over.to(Srgb).to(Hsluv).s).toBeCloseTo(0.5, 9);
  });

  // The bands are the reference's cut-offs: L* 1e-8 and 100 − 1e-7. Just outside them, s survives.
  it("keeps s just outside the black / white bands", () => {
    for (const l of [0.9999999, 2e-10]) {
      expect(new Hsluv(120, 0.5, l).to(Lchuv65).to(Hsluv).s).toBeCloseTo(0.5, 9);
    }
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Hsluv(0, 0, 0)).toBe(false);
  });
});
