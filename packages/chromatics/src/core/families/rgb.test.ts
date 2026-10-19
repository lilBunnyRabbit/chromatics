import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { DisplayP3 } from "../../models/display-p3/display-p3.js";
import { LinearSrgb } from "../../models/linear-srgb/linear-srgb.js";
import { Oklch } from "../../models/oklch/oklch.js";
import { Srgb } from "../../models/srgb/srgb.js";
import { parse } from "../../all.js";
import fixtures from "./gamut.fixtures.json" with { type: "json" };

describe("gamutMap, CSS Color 4 examples", () => {
  // #ex-p3-oog-display: color(display-p3 1.1 0.4 0.2) maps to "such as" color(display-p3 1 0.473 0.314).
  // #ex-p3-oog-canvas: oklch(76% 0.27 60) in Display P3 maps to "such as" color(display-p3 1 0.546 0).
  // Three published decimals: half a unit of the last is 5e-4.
  it.each([
    [DisplayP3.parse("color(display-p3 1.1 0.4 0.2)"), [1, 0.473, 0.314]],
    [Oklch.parse("oklch(76% 0.27 60)").to(DisplayP3), [1, 0.546, 0]],
  ])("%s", (color, expected) => {
    color.gamutMap().coords.forEach((v, i) => expect(Math.abs(v - expected[i]!)).toBeLessThanOrEqual(5e-4));
  });
});

describe("gamutMap invariants", () => {
  const wide = fc.double({ min: -2, max: 3, noNaN: true });
  const models = [Srgb, LinearSrgb, DisplayP3] as unknown as (typeof Srgb)[];

  it.each(models)("%o: every result is within [0, 1], and mapping again changes nothing", (Model) => {
    fc.assert(
      fc.property(wide, wide, wide, (r, g, b) => {
        const once = new Model(r, g, b, 0.5).gamutMap();
        expect(once.coords.every((v) => v >= 0 && v <= 1)).toBe(true);
        expect(once.alpha).toBe(0.5);
        expect(once.clone().gamutMap().equals(once)).toBe(true);
      }),
      { numRuns: 300 }
    );
  });

  it.each(models)("%o: in-gamut colors are unchanged (relative colorimetric)", (Model) => {
    const unit = fc.double({ min: 0, max: 1, noNaN: true });
    fc.assert(
      fc.property(unit, unit, unit, (r, g, b) => {
        const c = new Model(r, g, b);
        expect(c.clone().gamutMap().equals(c)).toBe(true);
      })
    );
  });

  it("lightness at or beyond the ends gives white or black (CSS Color 4 #pseudo-binsearch)", () => {
    expect([...new Oklch(1.2, 0.3, 30).to(Srgb).gamutMap().coords]).toEqual([1, 1, 1]);
    expect([...new Oklch(-0.1, 0.3, 30).to(Srgb).gamutMap().coords]).toEqual([0, 0, 0]);
  });

  it("keeps hue and lightness close: the result is within one JND of a pure chroma reduction", () => {
    const origin = new Oklch(0.7, 0.35, 140);
    const mapped = origin.to(Srgb).gamutMap().to(Oklch);
    expect(Math.abs(mapped.l - origin.l)).toBeLessThan(0.02);
    expect(Math.abs(mapped.h - origin.h)).toBeLessThan(5);
    expect(mapped.c).toBeLessThan(origin.c);
  });

  it("clip is clamp; inGamut honours its tolerance", () => {
    const c = new Srgb(1.00005, -0.2, 0.5);
    expect(c.inGamut()).toBe(false);
    expect(new Srgb(1.00005, 0, 0.5).inGamut()).toBe(true);
    expect(new Srgb(1.00005, 0, 0.5).inGamut(0)).toBe(false);
    expect([...c.clone().gamutMap({ method: "clip" }).coords]).toEqual([1, 0, 0.5]);
    expect([...c.clone().clamp().coords]).toEqual([1, 0, 0.5]);
  });
});

// web-platform-tests canvas gamut-mapping cases list each CSS algorithm's 8-bit result to 2 decimals,
// generated with colorjs.io: an implementation, so a cross-check of the Binary Search with Local MINDE
// path, not a reference. Half a unit of the second decimal is 0.005.
describe("gamutMap cross-check: colorjs.io MINDE values from WPT canvas tests", () => {
  it.each(
    fixtures.canvas.map((c) => [`${c.input} → ${c.file.includes("display-p3") ? "display-p3" : "srgb"}`, c] as const)
  )("%s", (_, c) => {
    const model = c.file.includes("display-p3") ? DisplayP3 : Srgb;
    const mapped = (parse(c.input).to(model) as Srgb).gamutMap();
    mapped.coords.forEach((v, i) =>
      expect(Math.abs(v * 255 - c.per_algorithm_8bit_2dp.MINDE[i]!)).toBeLessThanOrEqual(0.005 + 1e-9)
    );
  });
});
