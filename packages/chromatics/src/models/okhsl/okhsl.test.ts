import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { checkColorjs } from "../../testing/colorjs.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Oklab } from "../oklab/oklab.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./okhsl.fixtures.json" with { type: "json" };
import { Okhsl } from "./okhsl.js";

const PRIMARIES: [number, number, number][] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
];

describeModel(Okhsl, models, {
  fixtures: fixtures as Fixtures,
  strings: [
    ["okhsl(30 100% 60%)", [30, 1, 0.6], 1],
    ["okhsl(30 100 60 / 0.5)", [30, 1, 0.6], 0.5],
  ],
  invalid: ["okhsl(30, 100%, 60%)"],
});

describe("Okhsl extras", () => {
  it("matches color.js's Okhsl conversion tests (secondary, epsilon 1e-4)", () => checkColorjs(Okhsl, "okhsl"));

  // Ottosson, colorpicker post: Okhsl's saturation "s = 1 ... the edge of the sRGB gamut".
  it("every sRGB primary and secondary has s = 1", () => {
    for (const rgb of PRIMARIES) {
      expect(new Srgb(...rgb).to(Okhsl).s).toBeCloseTo(1, 9);
    }
  });

  // Grill 59: defined for Oklab L in [0, 1]; outside, white / black.
  it("clamps outside Oklab L [0, 1] to white / black, both ways", () => {
    expect([...new Oklab(1.2, 0.1, 0).to(Okhsl).coords]).toEqual([0, 0, 1]);
    expect([...new Oklab(-0.1, 0.1, 0).to(Okhsl).coords]).toEqual([0, 0, 0]);
    expect([...new Okhsl(30, 0.5, 1.4).to(Oklab).coords]).toEqual([1, 0, 0]);
    expect([...new Okhsl(30, 0.5, -0.2).to(Oklab).coords]).toEqual([0, 0, 0]);
  });

  it("l = 1 is exactly white, and chroma survives just above the 1e-12 floor", () => {
    expect([...new Okhsl(30, 0.5, 1).to(Oklab).coords]).toEqual([1, 0, 0]);
    const dark = new Oklab(1e-9, 0, -1e-5);
    dark
      .to(Okhsl)
      .to(Oklab)
      .coords.forEach((x, i) => expect(x).toBeCloseTo(dark.coords[i]!, 16));
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Okhsl(0, 0, 0)).toBe(false);
  });
});
