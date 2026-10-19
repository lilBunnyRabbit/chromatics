import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Lab } from "../../models/lab/lab.js";
import { Oklab } from "../../models/oklab/oklab.js";
import { Srgb } from "../../models/srgb/srgb.js";
import { close } from "../../testing/harness.js";

describe("rectangular mix", () => {
  const lab = fc
    .tuple(
      fc.double({ min: 0, max: 100, noNaN: true }),
      fc.double({ min: -125, max: 125, noNaN: true }),
      fc.double({ min: -125, max: 125, noNaN: true }),
      fc.double({ min: 0, max: 1, noNaN: true })
    )
    .map(([l, a, b, alpha]) => new Lab(l, a, b, alpha));

  it("is per channel: the midpoint of opaque colors is the channel average", () => {
    const m = new Oklab(0.2, 0.1, -0.1).mix(new Oklab(0.6, -0.1, 0.3), 0.5);
    expect(m.l).toBeCloseTo(0.4, 15);
    expect(m.a).toBeCloseTo(0, 15);
    expect(m.b).toBeCloseTo(0.1, 15);
  });

  it("t = 0 and t = 1 are the ends; extrapolation is linear", () => {
    fc.assert(
      fc.property(lab, lab, (a, b) => {
        if (a.alpha === 0 || b.alpha === 0) return;
        a.clone()
          .mix(b, 0)
          .coords.forEach((v, i) => expect(close(v, a.coords[i]!, 1e3)).toBe(true));
        a.clone()
          .mix(b, 1)
          .coords.forEach((v, i) => expect(close(v, b.coords[i]!, 1e3)).toBe(true));
      })
    );
    const m = new Srgb(0.2, 0.4, 0.6).mix(new Srgb(0.4, 0.4, 0.4), -1);
    expect([...m.coords].map((v) => Math.round(v * 1e12) / 1e12)).toEqual([0, 0.4, 0.8]);
  });

  it("premultiplies alpha (CSS Color 4 #interpolation-alpha): a transparent end only fades", () => {
    const m = new Srgb(1, 0, 0, 1).mix(new Srgb(0, 0, 1, 0), 0.5);
    expect(m.alpha).toBe(0.5);
    expect([...m.coords]).toEqual([1, 0, 0]);
  });

  it("both ends transparent: the result is the premultiplied value, 0 (CSS Color 4)", () => {
    const m = new Srgb(1, 0.5, 0, 0).mix(new Srgb(0, 0, 1, 0), 0.5);
    expect(m.alpha).toBe(0);
    expect([...m.coords]).toEqual([0, 0, 0]);
  });
});

describe("rectangular steps / interpolator / gradient", () => {
  const a = new Oklab(0.2, 0, 0);
  const b = new Oklab(0.6, 0.2, -0.2);

  it("steps(n) spans both ends evenly", () => {
    expect(a.steps(b, 5).map((c) => c.l)).toEqual([0.2, 0.30000000000000004, 0.4, expect.closeTo(0.5, 15), 0.6]);
    expect(() => a.steps(b, 1)).toThrow(RangeError);
  });

  it("interpolator matches mix", () => {
    expect(a.interpolator(b)(0.25).equals(a.clone().mix(b, 0.25))).toBe(true);
  });

  it("gradient over three stops hits each stop and mixes within segments", () => {
    const m = new Oklab(0.4, 0.1, 0.1);
    const g = Oklab.gradient([a, m, b], 4);
    expect(g[0]!.equals(a)).toBe(true);
    expect(g[1]!.l).toBeCloseTo(0.2 + (0.4 - 0.2) * (2 / 3), 15);
    expect(g[2]!.l).toBeCloseTo(0.4 + (0.6 - 0.4) * (1 / 3), 15);
    expect(g[3]!.l).toBeCloseTo(0.6, 15);
  });
});
