import { describe, expect, it } from "vitest";
import { models, parse } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { cornerSpread, halfDigit, hueDistance } from "../../testing/printed.js";
import { Srgb } from "../srgb/srgb.js";
import fixtures from "./hsi.fixtures.json" with { type: "json" };
import { Hsi } from "./hsi.js";

describeModel(Hsi, models, {
  fixtures: fixtures as Fixtures,
  strings: [
    ["hsi(30 100% 50%)", [30, 1, 0.5], 1],
    ["hsi(30 100 50 / 0.5)", [30, 1, 0.5], 0.5],
  ],
  invalid: ["hsi(30, 100%, 50%)", "hsi(30 100%)"],
});

const toHsi = (r: number, g: number, b: number) => new Srgb(r, g, b).to(Hsi).coords;

describe("Hsi references", () => {
  // Wikipedia "HSL and HSV" oldid 1378989624, Examples table (secondary): R G B, H (hexagonal), I, S_HSI.
  // The printed RGB is itself rounded to 3 decimals; its spread joins the half-digit tolerance.
  it.each([
    ["#FFFFFF", "1.000", "1.000", "1.000", "n/a", "1.000", "0.000"],
    ["#808080", "0.500", "0.500", "0.500", "n/a", "0.500", "0.000"],
    ["#000000", "0.000", "0.000", "0.000", "n/a", "0.000", "0.000"],
    ["#FF0000", "1.000", "0.000", "0.000", "0.0", "0.333", "1.000"],
    ["#BFBF00", "0.750", "0.750", "0.000", "60.0", "0.500", "1.000"],
    ["#008000", "0.000", "0.500", "0.000", "120.0", "0.167", "1.000"],
    ["#80FFFF", "0.500", "1.000", "1.000", "180.0", "0.833", "0.400"],
    ["#8080FF", "0.500", "0.500", "1.000", "240.0", "0.667", "0.250"],
    ["#BF40BF", "0.750", "0.250", "0.750", "300.0", "0.583", "0.571"],
    ["#A0A424", "0.628", "0.643", "0.142", "61.8", "0.471", "0.699"],
    ["#411BEA", "0.255", "0.104", "0.918", "251.1", "0.426", "0.756"],
    ["#1EAC41", "0.116", "0.675", "0.255", "134.9", "0.349", "0.667"],
    ["#F0C80E", "0.941", "0.785", "0.053", "49.5", "0.593", "0.911"],
    ["#B430E5", "0.704", "0.187", "0.897", "283.7", "0.596", "0.686"],
    ["#ED7651", "0.931", "0.463", "0.316", "14.3", "0.570", "0.446"],
    ["#FEF888", "0.998", "0.974", "0.532", "56.9", "0.835", "0.363"],
    ["#19CB97", "0.099", "0.795", "0.591", "162.4", "0.495", "0.800"],
    ["#362698", "0.211", "0.149", "0.597", "248.3", "0.319", "0.533"],
    ["#7E7EB8", "0.495", "0.493", "0.721", "240.5", "0.570", "0.135"],
  ])("%s", (_, r, g, b, h, i, s) => {
    const input = [Number(r), Number(g), Number(b)];
    const c = new Srgb(input[0]!, input[1]!, input[2]!).to(Hsi);
    const spread = cornerSpread(input, halfDigit(r), toHsi, [true]);
    expect(Math.abs(c.i - Number(i))).toBeLessThanOrEqual(halfDigit(i) + spread[2]! + 1e-12);
    expect(Math.abs(c.s - Number(s))).toBeLessThanOrEqual(halfDigit(s) + spread[1]! + 1e-12);
    if (h === "n/a") expect(c.isAchromatic()).toBe(true);
    else expect(hueDistance(c.h, Number(h))).toBeLessThanOrEqual(halfDigit(h) + spread[0]! + 1e-12);
  });

  // coloraide `tests/test_hsi.py:13-22` @4888fc2d: CSS named colors, 5 significant figures.
  it.each([
    ["red", "0", "1", "0.33333"],
    ["orange", "38.824", "1", "0.54902"],
    ["yellow", "60", "1", "0.66667"],
    ["green", "120", "1", "0.16732"],
    ["blue", "240", "1", "0.33333"],
    ["indigo", "274.62", "1", "0.26797"],
    ["violet", "300", "0.35644", "0.79216"],
    ["white", "0", "0", "1"],
    ["gray", "0", "0", "0.50196"],
    ["black", "0", "0", "0"],
  ])("%s → hsi(%s %s %s)", (name, h, s, i) => {
    const c = parse(name).to(Hsi);
    expect(hueDistance(c.h, Number(h))).toBeLessThanOrEqual(halfDigit(h) + 1e-12);
    expect(Math.abs(c.s - Number(s))).toBeLessThanOrEqual(halfDigit(s) + 1e-12);
    expect(Math.abs(c.i - Number(i))).toBeLessThanOrEqual(halfDigit(i) + 1e-12);
  });

  // color-space `test/index.js:654` @1952e63c: hsi(210, 33.3%, 58.8%) → rgb(100 150 200), rounded to
  // whole bytes. At 210° the hexagonal and circular hues agree.
  it("hsi(210 33.3% 58.8%) → rgb(100 150 200)", () => {
    const input = [210, 0.333, 0.588];
    const toRgb = (h: number, s: number, i: number) => new Hsi(h, s, i).to(Srgb).coords.map((v) => v * 255);
    const spread = cornerSpread(input, 0.0005, toRgb);
    toRgb(210, 0.333, 0.588).forEach((v, k) =>
      expect(Math.abs(v - [100, 150, 200][k]!)).toBeLessThanOrEqual(0.5 + spread[k]! + 1e-9)
    );
  });
});

describe("Hsi extras", () => {
  it("isAchromatic is s ≤ 0.00001 (ADR-003), and conversion zeroes the hue there", () => {
    expect(new Hsi(120, 0.00001, 0.5).isAchromatic()).toBe(true);
    expect(new Hsi(120, 0.0000100001, 0.5).isAchromatic()).toBe(false);
    expect(new Srgb(0.5, 0.5, 0.500005).to(Hsi).h).toBe(0);
  });

  it("in-range channels can leave sRGB (Wikipedia §HSI to RGB: C = 3·I·S / (1 + Z))", () => {
    expect(new Hsi(0, 1, 0.5).to(Srgb).r).toBeCloseTo(1.5, 12);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Hsi(0, 0, 0)).toBe(false);
  });
});
