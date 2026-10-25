import { describe, expect, expectTypeOf, it } from "vitest";
import { Hct } from "../models/hct/hct.js";
import { Hwb } from "../models/hwb/hwb.js";
import { Lab } from "../models/lab/lab.js";
import { Oklch } from "../models/oklch/oklch.js";
import { Srgb8 } from "../models/srgb8/srgb8.js";
import type { ChannelPatch } from "./model.js";

// Exact writes: expected values are the inputs, hues wrapped per CSS Color 4 §4.3.
describe("set", () => {
  it("replaces the given channels and alpha, keeps the rest, mutates and chains", () => {
    const c = new Oklch(0.5, 0.1, 30, 1);
    expect(c.set({ l: 0.95, alpha: 0.5 })).toBe(c);
    expect([...c.coords, c.alpha]).toEqual([0.95, 0.1, 30, 0.5]);
  });

  it("wraps hues and stores out-of-range values unclamped (ADR-003)", () => {
    expect(new Oklch(0.5, 0.1, 30).set({ h: 370, c: -0.1, l: 1.2 }).coords).toEqual([1.2, -0.1, 10]);
  });

  it("works on any class: Hct tone, Hwb whiteness, Srgb8 rounding", () => {
    expect(new Hct(250, 40, 50).set({ t: 90 }).coords).toEqual([250, 40, 90]);
    expect(new Hwb(30, 0.2, 0.3).set({ w: 0, b: 0 }).coords).toEqual([30, 0, 0]);
    expect(new Srgb8(0, 0, 0).set({ r: 127.6 }).r).toBe(new Srgb8(127.6, 0, 0).r);
  });

  it("throws a TypeError on an unknown key and writes nothing", () => {
    const c = new Oklch(0.5, 0.1, 30);
    expect(() => c.set({ l: 0.9, L: 1 } as ChannelPatch<Oklch>)).toThrow(TypeError);
    expect(() => c.set({ coords: 1 } as ChannelPatch<Oklch>)).toThrow(TypeError);
    expect(c.coords).toEqual([0.5, 0.1, 30]);
  });

  it.each([NaN, Infinity, "0.5"])("throws a TypeError on %s and writes nothing", (bad) => {
    const c = new Oklch(0.5, 0.1, 30);
    expect(() => c.set({ l: 0.9, h: bad as number })).toThrow(TypeError);
    expect(c.coords).toEqual([0.5, 0.1, 30]);
  });

  it("types keys from the instance's writable number properties", () => {
    expectTypeOf<ChannelPatch<Oklch>>().toEqualTypeOf<{ l?: number; c?: number; h?: number; alpha?: number }>();
    expectTypeOf<ChannelPatch<Lab>>().toEqualTypeOf<{ l?: number; a?: number; b?: number; alpha?: number }>();
    const typeOnly = (c: Oklch) => {
      // @ts-expect-error Oklch has no `t`
      c.set({ t: 1 });
      // @ts-expect-error `coords` is read-only
      c.set({ coords: [1, 0, 0] });
    };
    expect(typeOnly).toBeTypeOf("function");
  });
});

describe("shift", () => {
  it("adds raw units, not range fractions (unlike saturate)", () => {
    const c = new Oklch(0.5, 0.1, 30);
    expect(c.shift({ l: -0.25, c: 0.25 })).toBe(c);
    expect(c.coords).toEqual([0.25, 0.35, 30]);
    expect(new Oklch(0.5, 0.1, 30).saturate(0.25).c).toBeCloseTo(0.2, 15);
  });

  it("wraps hues both ways and adds to alpha", () => {
    expect(new Oklch(0.5, 0.1, 300).shift({ h: 120 }).h).toBe(60);
    expect(new Oklch(0.5, 0.1, 30).shift({ h: -120 }).h).toBe(270);
    expect(new Oklch(0.5, 0.1, 30, 0.5).shift({ alpha: 0.25 }).alpha).toBe(0.75);
  });

  it("throws a TypeError on an unknown key or a non-finite result and writes nothing", () => {
    const c = new Oklch(0.5, 0.1, 30);
    expect(() => c.shift({ l: 0.1, x: 1 } as ChannelPatch<Oklch>)).toThrow(TypeError);
    expect(() => c.shift({ l: 0.1, c: Infinity })).toThrow(TypeError);
    expect(c.coords).toEqual([0.5, 0.1, 30]);
  });
});
