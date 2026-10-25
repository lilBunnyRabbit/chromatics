import { describe, expect, it } from "vitest";
import { models, parse } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { halfDigit, hueDistance } from "../../testing/printed.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./cubehelix.fixtures.json" with { type: "json" };
import { Cubehelix } from "./cubehelix.js";

describeModel(Cubehelix, models, {
  fixtures: fixtures as Fixtures,
  strings: [
    ["cubehelix(300 0.5 0.5)", [300, 0.5, 0.5], 1],
    ["cubehelix(300 0.5 50% / 0.5)", [300, 0.5, 0.5], 0.5],
  ],
  invalid: ["cubehelix(300, 0.5, 0.5)", "cubehelix(300 0.5)"],
});

// d3-color, culori, coloraide and color-space all descend from d3's code, so these agree by lineage;
// Green 2011 prints no table (ADR-015).
describe("Cubehelix references", () => {
  // color-space `test/index.js:2140-2147` @1952e63c: d3-color 3.1.0's output, both directions, at 1e-9 / 1e-8
  // (rgb in bytes).
  it.each([
    [
      [255, 0, 0],
      [351.8102617708, 1.948897645372, 0.2999994453152],
    ],
    [
      [0, 255, 0],
      [109.9591652188, 1.921618741732, 0.5900010051127],
    ],
    [
      [0, 0, 255],
      [236.9421716773, 4.61438686804, 0.109999549572],
    ],
    [
      [255, 255, 0],
      [56.94217167732, 4.61438686804, 0.890000450428],
    ],
    [
      [100, 150, 200],
      [206.1810216946, 0.5753933675873, 0.5509804125994],
    ],
    [
      [240, 24, 120],
      [322.5275818549, 1.326478427663, 0.3896464194],
    ],
    [
      [33, 180, 90],
      [131.2283584147, 0.8895858495469, 0.4941181257929],
    ],
  ] as const)("rgb(%j) ↔ cubehelix(%j)", (rgb, [h, s, l]) => {
    const c = new Srgb(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255).to(Cubehelix);
    expect(hueDistance(c.h, h)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(c.s - s)).toBeLessThanOrEqual(1e-9);
    expect(Math.abs(c.l - l)).toBeLessThanOrEqual(1e-9);
    new Cubehelix(h, s, l)
      .to(Srgb)
      .coords.forEach((v, k) => expect(Math.abs(v * 255 - rgb[k]!)).toBeLessThanOrEqual(1e-8));
  });

  // coloraide `tests/test_cubehelix.py:12-22` @4888fc2d: CSS named colors, 5 significant figures.
  it.each([
    ["red", "351.81", "1.9489", "0.3"],
    ["orange", "36.577", "1.7357", "0.68176"],
    ["yellow", "56.942", "4.6144", "0.89"],
    ["green", "109.96", "1.1194", "0.29616"],
    ["blue", "236.94", "4.6144", "0.11"],
    ["indigo", "268.23", "1.7028", "0.14431"],
    ["violet", "289.96", "0.90999", "0.68345"],
    ["white", "0", "0", "1"],
    ["gray", "0", "0", "0.50196"],
    ["black", "0", "0", "0"],
  ])("%s → cubehelix(%s %s %s)", (name, h, s, l) => {
    const c = parse(name).to(Cubehelix);
    expect(hueDistance(c.h, Number(h))).toBeLessThanOrEqual(halfDigit(h) + 1e-12);
    expect(Math.abs(c.s - Number(s))).toBeLessThanOrEqual(halfDigit(s) + 1e-12);
    expect(Math.abs(c.l - Number(l))).toBeLessThanOrEqual(halfDigit(l) + 1e-12);
  });
});

describe("Cubehelix extras", () => {
  it("black and white have s 0: s divides by l·(1 − l)", () => {
    expect([...new Srgb(0, 0, 0).to(Cubehelix).coords]).toEqual([0, 0, 0]);
    const white = new Srgb(1, 1, 1).to(Cubehelix);
    expect([white.h, white.s]).toEqual([0, 0]);
  });

  it("isAchromatic is |s| ≤ the s range / 100 000 (ADR-003)", () => {
    expect(new Cubehelix(120, 4.614386868039719 / 100000, 0.5).isAchromatic()).toBe(true);
    expect(new Cubehelix(120, 0.00005, 0.5).isAchromatic()).toBe(false);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Cubehelix(0, 0, 0)).toBe(false);
  });
});
