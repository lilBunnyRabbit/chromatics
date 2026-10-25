import { describe, expect, it } from "vitest";
import { Hsl } from "../models/hsl/hsl.js";
import { Hsv } from "../models/hsv/hsv.js";
import { Lab } from "../models/lab/lab.js";
import { Lch } from "../models/lch/lch.js";
import { Oklab } from "../models/oklab/oklab.js";
import { Oklch } from "../models/oklch/oklch.js";

// Grill 33: amounts are fractions of the channel's reference range.
describe("lighten / darken / saturate / desaturate", () => {
  it.each([
    ["Oklch l", new Oklch(0.5, 0.1, 30).lighten(0.1).l, 0.6],
    ["Lab l", new Lab(50, 0, 0).lighten(0.1).l, 60],
    ["Oklab l", new Oklab(0.5, 0, 0).darken(0.25).l, 0.25],
    ["Lch c", new Lch(50, 40, 30).saturate(0.1).c, 55],
    ["Oklch c", new Oklch(0.5, 0.1, 30).desaturate(0.25).c, 0],
    ["Hsl s", new Hsl(30, 0.5, 0.5).saturate(0.2).s, 0.7],
    ["Hsv v", new Hsv(30, 0.5, 0.5).lighten(0.2).v, 0.7],
  ])("%s", (_, actual, expected) => {
    expect(actual).toBeCloseTo(expected, 14);
  });

  it("mutates, chains and doesn't clamp (ADR-003)", () => {
    const c = new Oklch(0.9, 0.1, 30);
    expect(c.lighten(0.2).rotateHue(10)).toBe(c);
    expect(c.l).toBeCloseTo(1.1, 15);
    expect(new Oklch(0.5, 0.05, 30).desaturate(0.25).c).toBeCloseTo(-0.05, 15);
  });
});

describe("ramp", () => {
  it("spaces lightness evenly from 5% to 95% of the range and keeps the other channels", () => {
    const r = new Oklch(0.6, 0.15, 250).ramp(5);
    expect(r.map((c) => c.l)).toEqual([0.05, 0.275, 0.5, expect.closeTo(0.725, 15), 0.95]);
    expect(r.every((c) => c.c === 0.15 && c.h === 250)).toBe(true);
    expect(new Lab(30, 10, -10).ramp(3, { from: 0, to: 1 }).map((c) => c.l)).toEqual([0, 50, 100]);
  });

  it("returns new colors and throws RangeError for n < 2", () => {
    const c = new Hsl(30, 1, 0.5);
    const r = c.ramp(3);
    expect(r.includes(c)).toBe(false);
    expect(() => c.ramp(1)).toThrow(RangeError);
  });
});
