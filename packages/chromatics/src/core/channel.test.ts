import { describe, expect, it } from "vitest";
import { byte, finite, wrapHue } from "./channel.js";

describe("finite", () => {
  it.each([0, -0, 1, -1e300, 1e300, Number.MIN_VALUE])("accepts %s", (v) => {
    expect(finite(v, "m", "c")).toBe(v);
  });

  it.each([Number.NaN, Infinity, -Infinity])("throws TypeError on %s", (v) => {
    expect(() => finite(v, "oklch", "l")).toThrow(TypeError);
    expect(() => finite(v, "oklch", "l")).toThrow(`oklch.l must be a finite number, got ${v}`);
  });
});

describe("wrapHue", () => {
  it.each([
    [0, 0],
    [30, 30],
    [359.5, 359.5],
    [360, 0],
    [370, 10],
    [720, 0],
    [-30, 330],
    [-360, 0],
    [-720.5, 359.5],
    [1e6, 1e6 % 360],
  ])("%s → %s", (input, expected) => {
    expect(wrapHue(input, "m")).toBe(expected);
  });

  it("maps -0 to +0", () => {
    expect(Object.is(wrapHue(-0, "m"), 0)).toBe(true);
  });

  it("maps a negative hue whose + 360 rounds to 360 onto 0", () => {
    expect(-1e-14 + 360).toBe(360);
    expect(wrapHue(-1e-14, "m")).toBe(0);
  });

  it("always lands in [0, 360)", () => {
    for (const h of [-1e-300, -Number.EPSILON, 360 - Number.EPSILON * 256, 359.99999999999994]) {
      const w = wrapHue(h, "m");
      expect(w).toBeGreaterThanOrEqual(0);
      expect(w).toBeLessThan(360);
    }
  });

  it("throws on non-finite hue", () => {
    expect(() => wrapHue(Number.NaN, "oklch")).toThrow("oklch.h must be a finite number");
  });
});

describe("byte", () => {
  it.each([
    [0, 0],
    [255, 255],
    [127.4, 127],
    [127.5, 128],
    [127.6, 128],
    [300, 255],
    [255.5, 255],
    [-4, 0],
    [-0.4, 0],
    [-0.5, 0],
  ])("%s → %s", (input, expected) => {
    expect(Object.is(byte(input, "srgb8", "r"), expected)).toBe(true);
  });

  it("throws on non-finite", () => {
    expect(() => byte(Number.NaN, "srgb8", "r")).toThrow(TypeError);
  });
});
