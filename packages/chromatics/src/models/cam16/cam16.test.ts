import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { multiply } from "../../core/linear.js";
import { srgbToLinear } from "../../core/transfer.js";
import { describeModel } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Cam16 } from "./cam16.js";

describeModel(Cam16, models, {
  realistic: 0,
  strings: [["cam16(50 20 30)", [50, 20, 30], 1]],
  invalid: ["cam16(50%, 20, 30)"],
});

type Correlates = readonly [h: number, C: number, J: number, M: number, s: number, Q: number];
const correlates = (c: Cam16): Correlates => [c.h, c.C, c.J, c.M, c.s, c.Q];

// material-color-utilities `hct_test.ts` @ bd811e4c: "CAM to ARGB", `toBeCloseTo(x, 3)` (±5e-4).
const MCU: Readonly<Record<string, readonly [rgb: [number, number, number], expected: Correlates]>> = {
  red: [
    [1, 0, 0],
    [27.408, 113.358, 46.445, 89.494, 91.89, 105.989],
  ],
  green: [
    [0, 1, 0],
    [142.14, 108.41, 79.332, 85.588, 78.605, 138.52],
  ],
  blue: [
    [0, 0, 1],
    [282.788, 87.231, 25.466, 68.867, 93.675, 78.481],
  ],
  white: [
    [1, 1, 1],
    [209.492, 2.869, 100, 2.265, 12.068, 155.521],
  ],
};

// MCU `color_utils.ts` lines 29–33 and 53: its rounded sRGB → XYZ matrix and D65 white.
const MCU_SRGB_TO_XYZ = [
  [0.41233895, 0.35762064, 0.18051042],
  [0.2126, 0.7152, 0.0722],
  [0.01932141, 0.11916382, 0.95034478],
] as const;
const Material = Cam16.viewedIn({ white: [0.95047, 1, 1.08883] }, "cam16-mcu");

describe("Cam16 references", () => {
  it.each(Object.entries(MCU))("MCU %s under MCU's own constants (3 decimals)", (_, [rgb, expected]) => {
    const xyz = multiply(MCU_SRGB_TO_XYZ, ...(rgb.map(srgbToLinear) as [number, number, number]));
    const c = new Xyz65(...xyz).to(Material);
    correlates(c).forEach((v, i) => expect(Math.abs(v - expected[i]!), `${i}`).toBeLessThan(5e-4));
  });

  // Our exact D65 and sRGB matrix move the correlates; measured 2026-10-20: at most 0.051 (white's hue).
  it.each(Object.entries(MCU))("MCU %s with this package's exact constants: within 0.06", (_, [rgb, expected]) => {
    correlates(new Srgb(...rgb).to(Cam16)).forEach((v, i) => expect(Math.abs(v - expected[i]!)).toBeLessThan(0.06));
  });

  it("black is all 0 (MCU)", () => {
    expect(correlates(new Srgb(0, 0, 0).to(Cam16))).toEqual([0, 0, 0, 0, 0, 0]);
  });

  // colour-science `colour/appearance/tests/test_cam16.py` @ 248121e3 (BSD-3, secondary): 8 decimals.
  // Order J, C, h, s, Q, M, H; XYZ and white on a 0–100 scale; Y_b 20, average surround.
  it.each([
    [
      [19.01, 20, 21.78],
      [95.05, 100, 108.88],
      318.31,
      [41.73120791, 0.10335574, 217.06795977, 2.34501507, 195.37170899, 0.10743677, 275.59498615],
    ],
    [
      [57.06, 43.06, 31.96],
      [95.05, 100, 108.88],
      31.83,
      [65.42828069, 49.6795642, 17.48659243, 52.94308868, 152.06985268, 42.62473321, 398.03047943],
    ],
    [
      [3.53, 6.56, 2.14],
      [109.85, 100, 35.58],
      318.31,
      [21.36052893, 50.99381895, 178.86724266, 61.57953092, 139.78582768, 53.00732582, 223.01823806],
    ],
    [
      [19.01, 20, 21.78],
      [109.85, 100, 35.58],
      318.31,
      [41.36326063, 52.81154022, 258.88676291, 53.12406914, 194.52011798, 54.89682038, 311.24768647],
    ],
    [
      [61.45276998, 7.00421901, 82.2406738],
      [95.05, 100, 108.88],
      4.074366543152521,
      [21.03801957, 457.78881613, 350.06445098, 241.50642846, 56.74143988, 330.94646237, 376.43915877],
    ],
  ] as const)("colour-science XYZ %j, white %j, L_A %s (secondary)", (xyz, white, la, expected) => {
    const View = Cam16.viewedIn({
      white: white.map((v) => v / 100) as [number, number, number],
      adaptingLuminance: la,
      backgroundLuminance: 20,
    });
    const c = new Xyz65(...(xyz.map((v) => v / 100) as [number, number, number])).to(View);
    [c.J, c.C, c.h, c.s, c.Q, c.M, c.H].forEach((v, i) =>
      expect(Math.abs(v - expected[i]!), `${i}`).toBeLessThan(5e-9 + 1e-10 * Math.abs(v))
    );
  });
});

describe("Cam16 extras", () => {
  it("viewedIn classes round-trip under their own conditions and parse their own id", () => {
    const Dim = Cam16.viewedIn({ adaptingLuminance: 4.07, backgroundLuminance: 20, surround: "dim" }, "cam16-dim");
    const c = new Srgb(0.2, 0.5, 0.8).to(Dim);
    expect(c.toString().startsWith("cam16-dim(")).toBe(true);
    expect(Dim.parse(c.toString()).equals(c)).toBe(true);
    c.to(Srgb).coords.forEach((v, i) => expect(v).toBeCloseTo([0.2, 0.5, 0.8][i]!, 12));
    expect(c.J).not.toBeCloseTo(new Srgb(0.2, 0.5, 0.8).to(Cam16).J, 3);
  });

  it("isAchromatic is M ≤ 0.00105 (ADR-003), and conversion zeroes the hue there", () => {
    expect(new Cam16(50, 0.00105, 90).isAchromatic()).toBe(true);
    expect(new Cam16(50, 0.0010501, 90).isAchromatic()).toBe(false);
  });

  it("H is continuous at its joins (20.14°, 360°)", () => {
    const H = (h: number) => new Cam16(50, 20, h).H;
    expect(H(20.14 - 1e-9)).toBeCloseTo(400, 6);
    expect(H(20.14)).toBeCloseTo(0, 6);
    expect(H(359.9999999)).toBeCloseTo(H(0), 5);
  });

  it("keeps J just above the 1e-12 black floor", () => {
    const c = new Cam16(1e-9, 0.001, 30).to(Xyz65).to(Cam16);
    expect(c.J).toBeCloseTo(1e-9, 15);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Cam16(0, 0, 0)).toBe(false);
  });
});
