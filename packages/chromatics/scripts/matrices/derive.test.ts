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
  // `lin_a98rgb_to_XYZ` / `XYZ_to_lin_a98rgb`
  LINEAR_A98_RGB_TO_XYZ_D65: [
    [q(573536, 994567), q(263643, 1420810), q(187206, 994567)],
    [q(591459, 1989134), q(6239551, 9945670), q(374412, 4972835)],
    [q(53769, 1989134), q(351524, 4972835), q(4929758, 4972835)],
  ],
  XYZ_D65_TO_LINEAR_A98_RGB: [
    [q(1829569, 896150), q(-506331, 896150), q(-308931, 896150)],
    [q(-851781, 878810), q(1648619, 878810), q(36519, 878810)],
    [q(16779, 1248040), q(-147721, 1248040), q(1266979, 1248040)],
  ],
  // `lin_2020_to_XYZ` / `XYZ_to_lin_2020`; the source notes its 0 "is actually calculated as 4.994106574466076e-17".
  LINEAR_REC2020_TO_XYZ_D65: [
    [q(63426534, 99577255), q(20160776, 139408157), q(47086771, 278816314)],
    [q(26158966, 99577255), q(472592308, 697040785), q(8267143, 139408157)],
    [q(0, 1), q(19567812, 697040785), q(295819943, 278816314)],
  ],
  XYZ_D65_TO_LINEAR_REC2020: [
    [q(30757411, 17917100), q(-6372589, 17917100), q(-4539589, 17917100)],
    [q(-19765991, 29648200), q(47925759, 29648200), q(467509, 29648200)],
    [q(792561, 44930125), q(-1921689, 44930125), q(42328811, 44930125)],
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
  // `lin_ProPhoto_to_XYZ` / `XYZ_to_lin_ProPhoto`: "cannot be expressed in rational form, but is calculated
  // to 64 bit accuracy" (csswg-drafts #7675).
  LINEAR_PROPHOTO_RGB_TO_XYZ_D50: [
    [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
    [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
    [0, 0, 0.8251046025104602],
  ],
  XYZ_D50_TO_LINEAR_PROPHOTO_RGB: [
    [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
    [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
    [0, 0, 1.2119675456389452],
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
