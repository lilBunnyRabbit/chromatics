import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { checkColorjs } from "../../testing/colorjs.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Oklab } from "../oklab/oklab.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./okhsv.fixtures.json" with { type: "json" };
import { Okhsv } from "./okhsv.js";

const PRIMARIES: [number, number, number][] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
];

describeModel(Okhsv, models, {
  fixtures: fixtures as Fixtures,
  strings: [
    ["okhsv(30 100% 60%)", [30, 1, 0.6], 1],
    ["okhsv(30 100 60 / 0.5)", [30, 1, 0.6], 0.5],
  ],
  invalid: ["okhsv(30, 100%, 60%)"],
});

describe("Okhsv extras", () => {
  it("matches color.js's Okhsv conversion tests (secondary, epsilon 1e-4)", () => checkColorjs(Okhsv, "okhsv"));

  // Ottosson, colorpicker post: Okhsv puts the most saturated color of each hue at s = 1, v = 1.
  it("every sRGB primary and secondary has s = 1, v = 1", () => {
    for (const rgb of PRIMARIES) {
      const c = new Srgb(...rgb).to(Okhsv);
      expect(c.s).toBeCloseTo(1, 9);
      expect(c.v).toBeCloseTo(1, 9);
    }
  });

  // Grill 59: defined for Oklab L in [0, 1]; outside, white / black.
  it("clamps outside Oklab L [0, 1] to white / black, both ways", () => {
    expect([...new Oklab(1.2, 0.1, 0).to(Okhsv).coords]).toEqual([0, 0, 1]);
    expect([...new Oklab(-0.1, 0.1, 0).to(Okhsv).coords]).toEqual([0, 0, 0]);
    expect([...new Okhsv(30, 0.5, 3).to(Oklab).coords]).toEqual([1, 0, 0]);
    expect([...new Okhsv(30, 0.5, -0.2).to(Oklab).coords]).toEqual([0, 0, 0]);
  });

  // Ottosson: (h, s 1, v 1) is the cusp, the most saturated sRGB color of each hue: one channel at 0, one at 1.
  it("(h, 1, 1) is the sRGB cusp for every hue", () => {
    for (let h = 0; h < 360; h += 0.5) {
      const rgb = new Okhsv(h, 1, 1).to(Srgb).coords;
      expect(
        rgb.every((v) => v > -1e-9 && v < 1 + 1e-9),
        `h ${h}: ${rgb}`
      ).toBe(true);
      expect(Math.min(...rgb), `h ${h}`).toBeCloseTo(0, 9);
      expect(Math.max(...rgb), `h ${h}`).toBeCloseTo(1, 9);
    }
  });

  it("keeps out-of-gamut chroma as v > 1", () => {
    const c = new Oklab(0.5, -0.4, -0.4);
    const back = c.to(Okhsv).to(Oklab);
    back.coords.forEach((x, i) => expect(x).toBeCloseTo(c.coords[i]!, 12));
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Okhsv(0, 0, 0)).toBe(false);
  });
});
