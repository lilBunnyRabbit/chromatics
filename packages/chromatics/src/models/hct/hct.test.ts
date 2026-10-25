import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Luv65 } from "../luv65/luv65.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import { Hct } from "./hct.js";

describeModel(Hct, models, {
  realistic: 0,
  strings: [
    ["hct(282.8 87.2 32.3)", [282.8, 87.2, 32.3], 1],
    ["hct(0.5turn 10 50)", [180, 10, 50], 1],
  ],
});

describe("Hct references", () => {
  // material-color-utilities `hct_test.ts` @ bd811e4c, "ARGB to HCT", `toBeCloseTo(x, 2)` (±0.005). Tone is
  // CIE L*, independent of CAM16's constants; hue and chroma move with our exact ones (measured ≤ 0.03).
  it.each([
    [
      [0, 1, 0],
      [142.139, 108.41, 87.737],
    ],
    [
      [0, 0, 1],
      [282.788, 87.23, 32.302],
    ],
  ] as const)("MCU %j", ([r, g, b], [h, c, t]) => {
    const x = new Srgb(r, g, b).to(Hct);
    expect(Math.abs(x.t - t)).toBeLessThan(0.005);
    expect(Math.abs(x.h - h)).toBeLessThan(0.06);
    expect(Math.abs(x.c - c)).toBeLessThan(0.06);
  });

  it("tone is CIE L* of the D65 Y (the L* of Luv65)", () => {
    const samples: [number, number, number][] = [
      [0.2, 0.4, 0.6],
      [1, 0.5, 0],
      [0.9, 0.9, 0.1],
    ];
    for (const rgb of samples) expect(new Srgb(...rgb).to(Hct).t).toBeCloseTo(new Srgb(...rgb).to(Luv65).l, 12);
  });

  // At high chroma two J can reach the tone (Y(J) has a singular stretch); either maps back exactly.
  it("solves high-chroma tones exactly, both ways", () => {
    for (const [h, c, t] of [
      [270, 145, 25],
      [30, 120, 10],
      [140, 140, 90],
    ] as const) {
      const back = new Hct(h, c, t).to(Srgb).to(Hct);
      expect(back.h).toBeCloseTo(h, 9);
      expect(back.c).toBeCloseTo(c, 9);
      expect(back.t).toBeCloseTo(t, 9);
    }
  });

  // An imaginary color (no real light has Y ≈ 0 with Z > 0): CAM16 gives it negative J and M, and other
  // J reach its tone with a different chroma; only the root that converts back is kept.
  it("round-trips an imaginary color through the root that converts back", () => {
    const xyz = new Xyz65(0, 1e-6, 0.17579138307427364);
    const hct = xyz.to(Hct);
    const back = hct.to(Xyz65).to(Hct);
    expect(back.h).toBeCloseTo(hct.h, 6);
    expect(back.c).toBeCloseTo(hct.c, 6);
    expect(back.t).toBeCloseTo(hct.t, 9);
  });

  it("is unbounded: out-of-sRGB values are kept; gamutMap gives the Material-like color", () => {
    const c = new Hct(282.788, 87.23, 90);
    expect(c.to(Srgb).inGamut()).toBe(false);
    expect(c.to(Srgb).gamutMap().inGamut(0)).toBe(true);
  });
});

describe("tones", () => {
  it("returns new colors at each tone with hue, chroma and alpha kept", () => {
    const c = new Hct(250, 40, 50, 0.5);
    const out = c.tones([40, 90, 10, 100]);
    expect(out.map((t) => [...t.coords, t.alpha])).toEqual([
      [250, 40, 40, 0.5],
      [250, 40, 90, 0.5],
      [250, 40, 10, 0.5],
      [250, 40, 100, 0.5],
    ]);
    expect(out.every((t) => t !== c)).toBe(true);
    expect(c.coords).toEqual([250, 40, 50]);
  });

  it("stores tones unclamped and throws a TypeError on NaN", () => {
    expect(new Hct(250, 40, 50).tones([-5, 120]).map((t) => t.t)).toEqual([-5, 120]);
    expect(() => new Hct(250, 40, 50).tones([NaN])).toThrow(TypeError);
    expect(new Hct(250, 40, 50).tones([])).toEqual([]);
  });
});
