import { describe, expect, it } from "vitest";
import { parse } from "../../all.js";
import { applyFilter, type FilterName } from "../../core/filter.js";
import { LinearSrgb } from "../linear-srgb/linear-srgb.js";
import { Srgb } from "./srgb.js";

// coloraide prints 5 significant digits of 0–255 channels: half a unit of the last one.
function close255(actual: number, printed: number): void {
  const unit = printed === 0 ? 1e-4 : 10 ** (Math.floor(Math.log10(Math.abs(printed))) - 4);
  expect(Math.abs(actual * 255 - printed)).toBeLessThanOrEqual(unit / 2 + 1e-9);
}

describe("Srgb.filter (CSS Filter Effects 1)", () => {
  it("coloraide @4888fc2d test_filters.py test_srgb: red, sepia, in sRGB = rgb(100.22 88.995 69.36)", () => {
    const c = parse("red").to(Srgb).filter("sepia", 1);
    [100.22, 88.995, 69.36].forEach((v, i) => close255(c.coords[i]!, v));
  });

  // coloraide @4888fc2d tests/test_filters.py test_filter. coloraide filters in linear sRGB by default, so
  // these check the §13.1 matrices and transfer functions on linear channels; Srgb.filter applies the same
  // functions to gamma-encoded ones (§5).
  it.each([
    ["red", "sepia", 1, [168.28, 159.48, 142.36]],
    ["red", "sepia", 0.5, [217.36, 115.95, 103.13]],
    ["red", "sepia", 2, [168.28, 159.48, 142.36]],
    ["orange", "grayscale", 1, [184.41, 184.41, 184.41]],
    ["orange", "grayscale", 0.5, [223.39, 175.05, 134.63]],
    ["orange", "grayscale", 2, [184.41, 184.41, 184.41]],
    ["yellow", "saturate", 0.5, [250.92, 250.92, 181.34]],
    ["yellow", "saturate", 0, [246.75, 246.75, 246.75]],
    ["yellow", "saturate", 2, [262.91, 262.91, -246.75]],
    ["green", "invert", 1, [255, 229.08, 255]],
    ["green", "invert", 0.5, [187.52, 187.52, 187.52]],
    ["green", "invert", 2, [255, 229.08, 255]],
    ["blue", "brightness", 0.5, [0, 0, 187.52]],
    ["blue", "brightness", 2, [0, 0, 345.08]],
    ["indigo", "contrast", 0.5, [145.47, 136.96, 162.06]],
    ["indigo", "contrast", 0, [187.52, 187.52, 187.52]],
    ["indigo", "contrast", 2, [-161.59, -187.52, -65.424]],
    ["violet", "hue-rotate", 90, [238, 152.19, -62.17]],
    ["violet", "hue-rotate", 180, [-62.17, 200.89, -62.17]],
    ["violet", "hue-rotate", 270, [-62.17, 186.12, 238]],
    ["violet", "hue-rotate", 450, [238, 152.19, -62.17]],
    ["violet", "hue-rotate", -90, [-62.17, 186.12, 238]],
  ] as const)("coloraide (linear) %s %s(%d)", (color, name, amount, expected) => {
    const lin = parse(color).to(LinearSrgb);
    const out = new LinearSrgb(...applyFilter(name as FilterName, amount, [lin.r, lin.g, lin.b])).to(Srgb);
    expected.forEach((v, i) => close255(out.coords[i]!, v));
  });

  it("amount 1 (0 for hue-rotate) leaves saturate, brightness, contrast and hue-rotate unchanged; 0 grayscale / sepia / invert too", () => {
    const base = new Srgb(0.8, 0.3, 0.1);
    for (const [name, amount] of [
      ["saturate", 1],
      ["brightness", 1],
      ["contrast", 1],
      ["hue-rotate", 0],
      ["grayscale", 0],
      ["sepia", 0],
      ["invert", 0],
    ] as const) {
      const c = base.clone().filter(name, amount);
      c.coords.forEach((v, i) => expect(v).toBeCloseTo(base.coords[i]!, 12));
    }
  });

  it("runs on the gamma-encoded channels: grayscale(1) of sRGB orange is 0.2126 r + 0.7152 g + 0.0722 b", () => {
    const c = new Srgb(1, 165 / 255, 0).filter("grayscale", 1);
    const y = 0.2126 + 0.7152 * (165 / 255);
    c.coords.forEach((v) => expect(v).toBeCloseTo(y, 12));
  });

  it("mutates, returns this, keeps alpha", () => {
    const c = new Srgb(0.2, 0.4, 0.6, 0.5);
    expect(c.filter("invert", 1)).toBe(c);
    expect(c.coords.map((v) => +v.toFixed(12))).toEqual([0.8, 0.6, 0.4]);
    expect(c.alpha).toBe(0.5);
  });

  it("throws on a negative amount (§6.1) and on non-finite amounts", () => {
    expect(() => new Srgb(1, 0, 0).filter("brightness", -1)).toThrow(RangeError);
    expect(() => new Srgb(1, 0, 0).filter("sepia", -0.1)).toThrow(RangeError);
    expect(() => new Srgb(1, 0, 0).filter("contrast", Number.NaN)).toThrow(RangeError);
    expect(new Srgb(1, 0, 0).filter("hue-rotate", -90).coords.every(Number.isFinite)).toBe(true);
  });
});

describe("over (CSS Compositing 1 source-over)", () => {
  it("coloraide @4888fc2d test_compositing.py test_compose: blue at 0.5 over yellow = srgb(0.5 0.5 0.5)", () => {
    const c = new Srgb(0, 0, 1, 0.5).over(new Srgb(1, 1, 0));
    expect(c.coords).toEqual([0.5, 0.5, 0.5]);
    expect(c.alpha).toBe(1);
  });

  it("coloraide test_compose_alpha_multi: three 0.5 layers over white = rgb(129 173 190.75)", () => {
    const layer = (hex: string) => Object.assign(parse(hex).to(Srgb), { alpha: 0.5 });
    const c = layer("#07c7ed").over(layer("#fc3d99").over(layer("#f5d311").over(parse("white").to(Srgb))));
    [129, 173, 190.75].forEach((v, i) => expect(c.coords[i]! * 255).toBeCloseTo(v, 6));
    expect(c.alpha).toBe(1);
  });

  it("coloraide test_compose_no_alpha: an opaque source hides the backdrop", () => {
    expect(new Srgb(0, 0, 1).over(new Srgb(1, 1, 0)).coords).toEqual([0, 0, 1]);
  });

  it("a transparent source shows the backdrop; transparent on transparent is transparent with no color", () => {
    const shown = new Srgb(1, 0, 0, 0).over(new Srgb(0.2, 0.4, 0.6, 0.8));
    expect(shown.coords.map((v) => +v.toFixed(12))).toEqual([0.2, 0.4, 0.6]);
    expect(shown.alpha).toBeCloseTo(0.8, 12);
    const none = new Srgb(1, 0, 0, 0).over(new Srgb(0, 1, 0, 0));
    expect([...none.coords, none.alpha]).toEqual([0, 0, 0, 0]);
  });

  it("LinearSrgb composites the linear channels: the same 0/1 example holds", () => {
    const c = new LinearSrgb(0, 0, 1, 0.5).over(new LinearSrgb(1, 1, 0));
    expect([...c.coords, c.alpha]).toEqual([0.5, 0.5, 0.5, 1]);
  });

  it("gamma and linear compositing differ for mid tones", () => {
    const s = new Srgb(1, 1, 1, 0.5).over(new Srgb(0, 0, 0)).r;
    const l = new LinearSrgb(1, 1, 1, 0.5).over(new LinearSrgb(0, 0, 0)).to(Srgb).r;
    expect(s).toBe(0.5);
    expect(l).toBeGreaterThan(0.7);
  });
});
