import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Hsl } from "../../models/hsl/hsl.js";
import { Hwb } from "../../models/hwb/hwb.js";
import { Lch } from "../../models/lch/lch.js";
import { Oklch } from "../../models/oklch/oklch.js";
import { close } from "../../testing/harness.js";

const oklch = (l: number, c: number, h: number, alpha = 1) => new Oklch(l, c, h, alpha);

// CSS Color 4 #hue-interpolation examples (midpoint in OkLCh between the two colors).
describe("hue interpolation, CSS Color 4 examples", () => {
  it.each([
    ["shorter", oklch(0.6, 0.24, 30), oklch(0.8, 0.15, 90), 60], // #ex-shorter
    ["longer", oklch(0.6, 0.24, 30), oklch(0.8, 0.15, 90), 240], // #ex-longer
    ["increasing", oklch(0.5, 0.1, 30), oklch(0.7, 0.1, 190), 110], // #ex-increasing
    ["decreasing", oklch(0.5, 0.1, 30), oklch(0.7, 0.1, 190), 290], // #ex-decreasing: oklch(0.6 0.1 290)
  ] as const)("%s", (hue, a, b, h) => {
    const mid = a.clone().mix(b, 0.5, { hue });
    expect(mid.h).toBeCloseTo(h, 12);
    expect(mid.l).toBeCloseTo((a.l + b.l) / 2, 15);
  });

  it("defaults to shorter", () => {
    expect(oklch(0.5, 0.1, 350).mix(oklch(0.5, 0.1, 10), 0.5).h).toBe(0);
  });
});

describe("mix", () => {
  const color = fc
    .tuple(
      fc.double({ min: 0, max: 1, noNaN: true }),
      fc.double({ min: 0.01, max: 0.4, noNaN: true }),
      fc.double({ min: 0, max: 359, noNaN: true }),
      fc.double({ min: 0.01, max: 1, noNaN: true })
    )
    .map(([l, c, h, a]) => oklch(l, c, h, a));

  it("t = 0 keeps the receiver, t = 1 lands on the other color", () => {
    fc.assert(
      fc.property(color, color, (a, b) => {
        const start = a.clone().mix(b, 0);
        const end = a.clone().mix(b, 1);
        [0, 1].forEach((i) => {
          expect(close(start.coords[i]!, a.coords[i]!)).toBe(true);
          expect(close(end.coords[i]!, b.coords[i]!)).toBe(true);
        });
        expect(Math.min(Math.abs(end.h - b.h), 360 - Math.abs(end.h - b.h))).toBeLessThan(1e-9);
      })
    );
  });

  it("mutates and returns the receiver; the argument is untouched", () => {
    const a = oklch(0.5, 0.1, 30);
    const b = oklch(0.7, 0.1, 90);
    expect(a.mix(b, 0.5)).toBe(a);
    expect([...b.coords]).toEqual([0.7, 0.1, 90]);
  });

  it("extrapolates outside [0, 1]", () => {
    const m = oklch(0.4, 0.1, 30).mix(oklch(0.6, 0.1, 50), 2);
    expect(m.l).toBeCloseTo(0.8, 15);
    expect(m.h).toBeCloseTo(70, 12);
  });

  it("a grey end takes the other end's hue (ADR-003), so white → blue stays blue", () => {
    const mid = oklch(1, 0, 0).mix(oklch(0.5, 0.2, 250), 0.5);
    expect(mid.h).toBe(250);
    expect(new Hsl(0, 0, 1).mix(new Hsl(240, 1, 0.5), 0.5).h).toBe(240);
    expect(new Hwb(0, 0.6, 0.6).mix(new Hwb(120, 0, 0), 0.5).h).toBe(120);
  });

  it("interpolates in premultiplied alpha, hue excepted (CSS Color 4 #interpolation-alpha)", () => {
    const m = new Lch(50, 40, 30, 1).mix(new Lch(70, 0.0, 30, 0), 0.5);
    expect(m.alpha).toBe(0.5);
    expect(m.l).toBeCloseTo(50, 12);
    expect(m.c).toBeCloseTo(40, 12);
  });
});

describe("steps / interpolator / gradient", () => {
  const a = oklch(0.4, 0.1, 30);
  const b = oklch(0.8, 0.2, 90);

  it("steps(n) has n colors, both ends included, and leaves the receiver alone", () => {
    const s = a.steps(b, 5);
    expect(s).toHaveLength(5);
    expect(s[0]!.equals(a)).toBe(true);
    expect(s[4]!.l).toBeCloseTo(0.8, 15);
    expect(s[2]!.h).toBeCloseTo(60, 12);
    expect([...a.coords]).toEqual([0.4, 0.1, 30]);
  });

  it.each([1, 0, 2.5, -3])("steps(%s) throws RangeError", (n) => {
    expect(() => a.steps(b, n)).toThrow(RangeError);
  });

  it("interpolator(t) equals mix(t) and copies its ends", () => {
    const at = a.interpolator(b, { hue: "longer" });
    a.h = 200;
    const expected = oklch(0.4, 0.1, 30).mix(b, 0.3, { hue: "longer" });
    expect(at(0.3).equals(expected)).toBe(true);
    a.h = 30;
  });

  it("gradient with two stops equals steps; more stops pass through each", () => {
    const g = Oklch.gradient([a, b], 5);
    g.forEach((c, i) => expect(c.equals(a.steps(b, 5)[i]!)).toBe(true));
    const mid = oklch(0.6, 0.15, 180);
    const three = Oklch.gradient([a, mid, b], 5);
    expect(three[2]!.equals(mid)).toBe(true);
    expect(() => Oklch.gradient([a], 5)).toThrow(RangeError);
  });
});

describe("harmonies", () => {
  const c = oklch(0.7, 0.15, 30);
  const hues = (list: Oklch[]) => list.map((x) => x.h);

  it("rotateHue and complement mutate and wrap", () => {
    const x = c.clone();
    expect(x.rotateHue(350)).toBe(x);
    expect(x.h).toBe(20);
    expect(x.complement().h).toBe(200);
  });

  it("arrays start with a copy of the receiver", () => {
    const t = c.triadic();
    expect(t[0]).not.toBe(c);
    expect(t[0]!.equals(c)).toBe(true);
    expect(hues(t)).toEqual([30, 150, 270]);
    expect(hues(c.tetradic())).toEqual([30, 90, 210, 270]);
    expect(hues(c.tetradic(90))).toEqual(hues(c.square()));
    expect(hues(c.square())).toEqual([30, 120, 210, 300]);
    expect(hues(c.splitComplementary())).toEqual([30, 180, 240]);
    expect(hues(c.splitComplementary(45))).toEqual([30, 165, 255]);
  });

  it("analogous is centred on the receiver", () => {
    expect(hues(c.analogous())).toEqual([0, 30, 60]);
    expect(hues(c.analogous(30, 5))).toEqual([330, 0, 30, 60, 90]);
    expect(hues(c.analogous(10, 1))).toEqual([30]);
    expect(() => c.analogous(30, 0)).toThrow(RangeError);
  });

  it("every harmony leaves the receiver alone", () => {
    c.triadic();
    c.analogous(20, 7);
    expect([...c.coords]).toEqual([0.7, 0.15, 30]);
  });
});
