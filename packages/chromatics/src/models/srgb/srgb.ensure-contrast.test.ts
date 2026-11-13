import { describe, expect, it } from "vitest";
import { parse } from "../../all.js";
import { Oklch } from "../oklch/oklch.js";
import fixtures from "./wcag.fixtures.json" with { type: "json" };
import { Srgb } from "./srgb.js";

// Definition-based: the search has no published reference (see the JSDoc), so each test checks a property
// the method promises, measured with `contrast()`, which wcag.fixtures.json pins to WCAG's own examples.
const srgb = (text: string) => parse(text).to(Srgb);
const hueDistance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe("Srgb.ensureContrast", () => {
  it("mutates and returns this", () => {
    const fg = new Srgb(0.5, 0.52, 0.55);
    expect(fg.ensureContrast(new Srgb(1, 1, 1), 4.5)).toBe(fg);
  });

  it("leaves a passing in-gamut color unchanged (WCAG's own passing examples)", () => {
    const passing = fixtures.examples.filter(
      (e) => !("knownDiscrepancy" in e) && Number(e.published_ratio.split(":")[0]) >= 4.5
    );
    expect(passing.length).toBeGreaterThan(0);
    for (const e of passing) {
      const fg = srgb(e.fg);
      const before = fg.coords;
      fg.ensureContrast(srgb(e.bg), 4.5);
      expect(fg.coords).toEqual(before);
    }
  });

  it.each([
    [new Oklch(0.58, 0.05, 250), new Oklch(0.62, 0.05, 250), 4.5],
    [new Oklch(0.85, 0.05, 250), new Oklch(0.95, 0.02, 250), 7],
    [new Oklch(0.7, 0.15, 30), new Oklch(0.3, 0.05, 260), 4.5],
    [new Oklch(0.5, 0.2, 140), new Oklch(0.5, 0.02, 140), 3],
  ])("reaches the ratio when it can, in gamut, with the hue kept: %s on %s at %d", (fgOklch, bgOklch, ratio) => {
    const bg = bgOklch.to(Srgb);
    const fg = fgOklch.to(Srgb).ensureContrast(bg, ratio);
    expect(fg.contrast(bg.clone().gamutMap())).toBeGreaterThanOrEqual(ratio);
    expect(fg.inGamut(0)).toBe(true);
    const out = fg.to(Oklch);
    if (out.c > 0.01) expect(hueDistance(out.h, fgOklch.h)).toBeLessThan(1);
  });

  it("with keepChroma, searches lightness only (chroma within gamut mapping of the original)", () => {
    const bg = new Oklch(0.62, 0.05, 250).to(Srgb);
    const fg = new Oklch(0.58, 0.05, 250).to(Srgb).ensureContrast(bg, 4.5, { keepChroma: true });
    expect(fg.contrast(bg)).toBeGreaterThanOrEqual(4.5);
    expect(fg.to(Oklch).c).toBeCloseTo(0.05, 2);
  });

  it("without keepChroma, lands at least as close to the original as keepChroma does", () => {
    const fgOklch = new Oklch(0.6, 0.12, 200);
    const bg = new Oklch(0.55, 0.02, 200).to(Srgb);
    const dist = (c: Srgb) => {
      const o = c.to(Oklch);
      return Math.hypot(o.l - fgOklch.l, o.c - fgOklch.c);
    };
    const free = fgOklch.to(Srgb).ensureContrast(bg, 4.5);
    const kept = fgOklch.to(Srgb).ensureContrast(bg, 4.5, { keepChroma: true });
    expect(free.contrast(bg)).toBeGreaterThanOrEqual(4.5);
    expect(dist(free)).toBeLessThanOrEqual(dist(kept) + 1e-9);
  });

  it("falls back to black or white, whichever contrasts more, when the ratio is unreachable", () => {
    for (const bg of [srgb("#777777"), srgb("#7a7a7a"), srgb("#757575")]) {
      const white = new Srgb(1, 1, 1);
      const black = new Srgb(0, 0, 0);
      expect(Math.max(white.contrast(bg), black.contrast(bg))).toBeLessThan(7);
      const better = white.contrast(bg) >= black.contrast(bg) ? white : black;
      expect(new Srgb(0.4, 0.45, 0.5).ensureContrast(bg, 7).coords).toEqual(better.coords);
    }
  });

  it("handles an achromatic seed (powerless hue) by searching lightness", () => {
    const bg = new Srgb(1, 1, 1);
    const grey = new Srgb(0.7, 0.7, 0.7).ensureContrast(bg, 4.5);
    expect(grey.contrast(bg)).toBeGreaterThanOrEqual(4.5);
    expect(grey.to(Oklch).c).toBeLessThan(1e-6);
  });

  it("gamut-maps an out-of-gamut input and measures what is shown", () => {
    const bg = new Srgb(0, 0, 0);
    const fg = new Srgb(1.3, -0.2, 0.4).ensureContrast(bg, 3);
    expect(fg.inGamut(0)).toBe(true);
    expect(fg.contrast(bg)).toBeGreaterThanOrEqual(3);
  });

  it("keeps alpha and never touches bg", () => {
    const bg = new Srgb(0.9, 0.9, 0.9);
    const fg = new Srgb(0.8, 0.8, 0.8, 0.5).ensureContrast(bg, 4.5);
    expect(fg.alpha).toBe(0.5);
    expect(bg.coords).toEqual([0.9, 0.9, 0.9]);
  });

  it("accepts the ends of the ratio range, 1 and 21 (#dfn-contrast-ratio Note 1)", () => {
    const fg = new Srgb(0.3, 0.6, 0.2);
    expect(fg.clone().ensureContrast(new Srgb(1, 1, 1), 1).coords).toEqual(fg.coords);
    expect(new Srgb(0.5, 0.5, 0.5).ensureContrast(new Srgb(1, 1, 1), 21).coords).toEqual([0, 0, 0]);
  });

  it.each([0.99, 21.01, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])("throws a RangeError on ratio %d", (ratio) => {
    expect(() => new Srgb(0.5, 0.5, 0.5).ensureContrast(new Srgb(1, 1, 1), ratio)).toThrow(RangeError);
  });
});
