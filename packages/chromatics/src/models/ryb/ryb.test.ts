import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { halfDigit } from "../../testing/printed.js";
import { Srgb } from "../srgb/srgb.js";
import { Ryb } from "./ryb.js";

describeModel(Ryb, models, {
  strings: [
    ["ryb(1 0.5 0.25)", [1, 0.5, 0.25], 1],
    ["ryb(100% 50% 25% / 0.5)", [1, 0.5, 0.25], 0.5],
  ],
  invalid: ["ryb(1, 0.5, 0.25)", "ryb(1 0.5)"],
});

describe("Ryb references", () => {
  // Gossett & Chen 2004 §2.2: RYB (1.0, 0.5, 0.25) "yields" (0.8375, 0.19925, 0.0625).
  it("ryb(1 0.5 0.25) → rgb(0.8375 0.19925 0.0625)", () => {
    const rgb = new Ryb(1, 0.5, 0.25).to(Srgb);
    ["0.8375", "0.19925", "0.0625"].forEach((v, i) =>
      expect(Math.abs(rgb.coords[i]! - Number(v))).toBeLessThanOrEqual(halfDigit(v))
    );
  });

  // Fig. 3 corners, purple read as (0.5, 0, 0.5) (the §2.2 example only holds with it), both directions.
  it.each([
    [
      [0, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 0, 0],
      [1, 0, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
    ],
    [
      [1, 1, 0],
      [1, 0.5, 0],
    ],
    [
      [0, 0, 1],
      [0.163, 0.373, 0.6],
    ],
    [
      [1, 0, 1],
      [0.5, 0, 0.5],
    ],
    [
      [0, 1, 1],
      [0, 0.66, 0.2],
    ],
    [
      [1, 1, 1],
      [0.2, 0.094, 0],
    ],
  ] as const)("corner ryb %j ↔ rgb %j", (ryb, rgb) => {
    new Ryb(ryb[0], ryb[1], ryb[2]).to(Srgb).coords.forEach((v, i) => expect(v).toBeCloseTo(rgb[i]!, 15));
    new Srgb(rgb[0], rgb[1], rgb[2]).to(Ryb).coords.forEach((v, i) => expect(v).toBeCloseTo(ryb[i]!, 10));
  });
});

describe("Ryb extras", () => {
  it("throws a RangeError for sRGB the cube can't reach (ADR-015)", () => {
    expect(() => new Srgb(0, 0, 0.75).to(Ryb)).toThrow(RangeError);
  });

  // The trilinear polynomial extends past the cube: (1 − b)·red + b·purple at b = 2 is (0, 0, 1).
  it("reaches pure blue outside the cube, at ryb(1 0 2)", () => {
    new Srgb(0, 0, 1).to(Ryb).coords.forEach((v, i) => expect(v).toBeCloseTo([1, 0, 2][i]!, 12));
  });

  it("mixes like paint: red + yellow is orange", () => {
    const orange = new Ryb(1, 0, 0).mix(new Ryb(0, 1, 0), 0.5).to(Srgb);
    expect(orange.r).toBeGreaterThan(orange.g);
    expect(orange.g).toBeGreaterThan(orange.b);
  });

  it("has no toCss: convert first", () => {
    expect("toCss" in new Ryb(0, 0, 0)).toBe(false);
  });
});
