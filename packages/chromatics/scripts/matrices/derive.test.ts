import { describe, expect, it } from "vitest";
import * as generated from "../../src/core/matrices.js";
import { exactMatrices, exactWhites, toNumbers } from "./derive.js";
import { Rational, type Matrix3 } from "./rational.js";

const q = (num: number, den: number) => Rational.of(num, den);

// CSS Color 4 Editor's Draft 2026-10-09, "Sample code for color conversions" (exact rationals).
const CSS_RATIONAL: Record<string, Matrix3> = {
  LINEAR_SRGB_TO_XYZ_D65: [
    [q(506752, 1228815), q(87881, 245763), q(12673, 70218)],
    [q(87098, 409605), q(175762, 245763), q(12673, 175545)],
    [q(7918, 409605), q(87881, 737289), q(1001167, 1053270)],
  ],
  XYZ_D65_TO_LINEAR_SRGB: [
    [q(12831, 3959), q(-329, 214), q(-1974, 3959)],
    [q(-851781, 878810), q(1648619, 878810), q(36519, 878810)],
    [q(705, 12673), q(-2585, 12673), q(705, 667)],
  ],
  LINEAR_DISPLAY_P3_TO_XYZ_D65: [
    [q(608311, 1250200), q(189793, 714400), q(198249, 1000160)],
    [q(35783, 156275), q(247089, 357200), q(198249, 2500400)],
    [q(0, 1), q(32229, 714400), q(5220557, 5000800)],
  ],
  XYZ_D65_TO_LINEAR_DISPLAY_P3: [
    [q(446124, 178915), q(-333277, 357830), q(-72051, 178915)],
    [q(-14852, 17905), q(63121, 35810), q(423, 17905)],
    [q(11844, 330415), q(-50337, 660830), q(316169, 330415)],
  ],
};

// Same source, published as 64-bit decimals (`D65_to_D50`, `D50_to_D65`).
const CSS_DECIMAL: Record<string, number[][]> = {
  XYZ_D65_TO_XYZ_D50: [
    [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
    [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
    [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
  ],
  XYZ_D50_TO_XYZ_D65: [
    [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
    [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
    [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
  ],
};

const exact = exactMatrices();

describe("derived matrices", () => {
  it.each(Object.keys(CSS_RATIONAL))("%s equals the CSS Color 4 rationals exactly", (name) => {
    const derived = exact[name];
    const expected = CSS_RATIONAL[name];
    expect(derived).toBeDefined();
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) expect(derived![i]![j]!.toString()).toBe(expected![i]![j]!.toString());
  });

  // The CSS decimals were computed in float arithmetic and differ from the exact result by up to 3.2e-16;
  // a wrong cone matrix would differ by ~1e-5, so this bound still proves the Bradford inputs.
  it.each(Object.keys(CSS_DECIMAL))("%s is within 4e-16 of the CSS Color 4 64-bit decimals", (name) => {
    const derived = toNumbers(exact[name]!);
    const expected = CSS_DECIMAL[name]!;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) expect(Math.abs(derived[i]![j]! - expected[i]![j]!)).toBeLessThanOrEqual(4e-16);
  });

  it("src/core/matrices.ts is up to date", () => {
    for (const [name, m] of Object.entries(exact)) {
      expect((generated as Record<string, unknown>)[name]).toEqual(toNumbers(m));
    }
    const whites = exactWhites();
    for (const [name, v] of Object.entries(whites)) {
      expect((generated as Record<string, unknown>)[name]).toEqual(v.map((c) => c.toNumber()));
    }
    expect(Object.keys(generated).sort()).toEqual([...Object.keys(exact), ...Object.keys(whites)].sort());
  });
});

describe("Rational.toNumber", () => {
  it("rounds to the nearest double", () => {
    expect(q(1, 3).toNumber()).toBe(1 / 3);
    expect(q(-2, 3).toNumber()).toBe(-2 / 3);
    expect(q(506752, 1228815).toNumber()).toBe(506752 / 1228815);
    expect(Rational.decimal("0.3127").toNumber()).toBe(0.3127);
    expect(Rational.of(1, 10n ** 30n).toNumber()).toBe(1e-30);
  });
});
