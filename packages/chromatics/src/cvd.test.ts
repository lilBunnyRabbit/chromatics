import { describe, expect, it } from "vitest";
import { parse } from "./all.js";
import { simulateCvd, type Deficiency } from "./cvd.js";
import { Srgb } from "./models/srgb/srgb.js";

// coloraide prints 5 significant digits of 0–255 channels: half a unit of the last one.
function close255(actual: number, printed: number): void {
  const unit = printed === 0 ? 1e-4 : 10 ** (Math.floor(Math.log10(Math.abs(printed))) - 4);
  expect(Math.abs(actual * 255 - printed)).toBeLessThanOrEqual(unit / 2 + 1e-9);
}

const run = (color: string, d: Deficiency, severity?: number) => simulateCvd(parse(color).to(Srgb), d, severity);

// coloraide @4888fc2d tests/test_cvd.py test_cvd, method "machado" (coloraide also applies it in linear sRGB).
describe("simulateCvd (Machado et al. 2009)", () => {
  it.each([
    ["red", "protan", [108.79, 95.027, -12.596]],
    ["orange", "protan", [195.42, 171.59, -40.805]],
    ["yellow", "protan", [276.72, 243.54, -64.46]],
    ["green", "protan", [131.07, 114.46, -26.091]],
    ["blue", "protan", [-124.94, 88.706, 260.74]],
    ["indigo", "protan", [-52.54, 48.562, 133]],
    ["violet", "protan", [120.65, 161.38, 241.7]],
    ["red", "deutan", [163.22, 144.28, -28.312]],
    ["orange", "deutan", [216.62, 192.97, 13.854]],
    ["yellow", "deutan", [279.03, 249.61, 49.346]],
    ["green", "deutan", [119.39, 106.36, 24.233]],
    ["blue", "deutan", [-131.27, 61.499, 251.48]],
    ["indigo", "deutan", [-43.863, 48.637, 127.89]],
    ["violet", "deutan", [151.4, 175.26, 234.64]],
    ["red", "tritan", [281.76, -79.111, 14.888]],
    ["orange", "tritan", [278.9, 142.32, 140.64]],
    ["yellow", "tritan", [274.08, 237.68, 217.31]],
    ["green", "tritan", [-34.707, 123.82, 107.76]],
    ["blue", "tritan", [-117.27, 107.2, 149.76]],
    ["indigo", "tritan", [62.17, 46.101, 73.836]],
    ["violet", "tritan", [243.86, 141.14, 173.06]],
  ] as const)("coloraide %s %s (severity 1)", (color, d, expected) => {
    const c = run(color, d);
    expected.forEach((v, i) => close255(c.coords[i]!, v));
  });

  it.each([
    [0.1, [238.14, 47.812, -9.4884]],
    [0.2, [222.58, 64.361, -15.379]],
    [0.3, [207.94, 74.375, -18.565]],
    [0.4, [193.92, 81.127, -20.283]],
    [0.42, [191.3, 82.103, -20.426]],
    [0.45, [187.27, 83.542, -20.639]],
    [0.47, [184.52, 84.486, -20.78]],
    [0.49, [181.72, 85.416, -20.92]],
    [0.5, [180.29, 85.877, -20.99]],
    [0.6, [166.81, 89.269, -20.889]],
    [0.7, [153.24, 91.676, -20.06]],
    [0.8, [139.3, 93.339, -18.496]],
    [0.9, [124.66, 94.418, -16.098]],
  ] as const)("coloraide red protan severity %d, interpolated between the 0.1 steps", (severity, expected) => {
    const c = run("red", "protan", severity);
    expected.forEach((v, i) => close255(c.coords[i]!, v));
  });

  it("severity 0 is normal vision", () => {
    for (const d of ["protan", "deutan", "tritan"] as const) {
      const c = simulateCvd(new Srgb(0.8, 0.3, 0.1), d, 0);
      c.coords.forEach((v, i) => expect(v).toBeCloseTo([0.8, 0.3, 0.1][i]!, 12));
    }
  });

  it("greys stay grey (every matrix row sums to 1)", () => {
    for (const d of ["protan", "deutan", "tritan"] as const) {
      for (const s of [0.3, 1]) {
        const c = simulateCvd(new Srgb(0.5, 0.5, 0.5), d, s);
        c.coords.forEach((v) => expect(v).toBeCloseTo(0.5, 5));
      }
    }
  });

  it("mutates and returns its argument, keeps alpha", () => {
    const c = new Srgb(1, 0, 0, 0.4);
    expect(simulateCvd(c, "deutan")).toBe(c);
    expect(c.alpha).toBe(0.4);
  });

  it("throws on a severity outside [0, 1] or NaN", () => {
    expect(() => simulateCvd(new Srgb(1, 0, 0), "protan", 1.1)).toThrow(RangeError);
    expect(() => simulateCvd(new Srgb(1, 0, 0), "protan", -0.1)).toThrow(RangeError);
    expect(() => simulateCvd(new Srgb(1, 0, 0), "protan", Number.NaN)).toThrow(RangeError);
  });
});
