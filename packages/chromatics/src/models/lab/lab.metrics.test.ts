import fc from "fast-check";
import { describe, expect, it } from "vitest";
import fixtures from "./ciede2000.fixtures.json" with { type: "json" };
import { parse } from "../../all.js";
import { Lab } from "./lab.js";

describe("CIEDE2000, Sharma, Wu & Dalal (2005) Table 1", () => {
  it.each(fixtures.pairs.map((p) => [p.pair, p] as const))("pair %s", (_, p) => {
    const { L1, a1, b1, L2, a2, b2 } = p.input;
    const de = new Lab(L1, a1, b1).deltaE2000(new Lab(L2, a2, b2));
    // Published to 4 decimals: half a unit of the last.
    expect(Math.abs(de - p.published.dE00)).toBeLessThanOrEqual(5e-5);
    expect(Math.abs(new Lab(L2, a2, b2).deltaE2000(new Lab(L1, a1, b1)) - de)).toBeLessThan(1e-12);
  });
});

describe("deltaE76 (CIE 15:2004 Eq. 8.21: Euclidean distance in L*a*b*)", () => {
  const lab = fc
    .tuple(
      fc.double({ min: 0, max: 100, noNaN: true }),
      fc.double({ min: -125, max: 125, noNaN: true }),
      fc.double({ min: -125, max: 125, noNaN: true })
    )
    .map(([l, a, b]) => new Lab(l, a, b));

  it("is a metric: zero on itself, symmetric, triangle inequality", () => {
    fc.assert(
      fc.property(lab, lab, lab, (x, y, z) => {
        expect(x.deltaE76(x)).toBe(0);
        expect(x.deltaE76(y)).toBe(y.deltaE76(x));
        expect(x.deltaE76(z)).toBeLessThanOrEqual(x.deltaE76(y) + y.deltaE76(z) + 1e-9);
      })
    );
  });

  it("is the 3-4-12 triangle", () => {
    expect(new Lab(50, 0, 0).deltaE76(new Lab(53, 4, 12))).toBe(13);
  });
});

// colour-science @248121e3 colour/difference/delta_e.py docstrings. Their doctest ellipsis truncates after
// 7 decimals, so the value must start with the printed digits.
function truncatesTo(value: number, printed: number): void {
  expect(value).toBeGreaterThanOrEqual(printed);
  expect(value).toBeLessThan(printed + 1e-7);
}
const CS_1 = new Lab(48.99183622, -0.10561667, 400.65619925);
const CS_2 = new Lab(50.65907324, -0.1167191, 402.82235718);

describe("deltaE94 (CIE 116-1995)", () => {
  it("colour-science delta_E_CIE1994: graphic arts 1.6711191, textiles 0.8404677", () => {
    truncatesTo(CS_1.deltaE94(CS_2), 1.6711191);
    truncatesTo(CS_1.deltaE94(CS_2, { application: "textiles" }), 0.8404677);
  });

  // coloraide @4888fc2d tests/test_distance.py test_delta_e_94_d50 (CIE Lab D50), 4 decimals.
  it.each([
    ["red", "red", 0],
    ["red", "orange", 28.6827],
    ["red", "yellow", 57.5928],
    ["red", "green", 48.8419],
    ["red", "blue", 73.8268],
    ["red", "indigo", 59.1223],
    ["red", "violet", 42.5283],
    ["red", "black", 57.3225],
    ["red", "white", 49.2723],
    ["red", "gray", 18.4094],
  ] as const)("coloraide %s → %s = %d", (x, y, de) => {
    expect(Math.abs(parse(x).to(Lab).deltaE94(parse(y).to(Lab)) - de)).toBeLessThanOrEqual(5e-5);
  });

  it("coloraide: the 3-4-5 triangle lab(50 30 40) → lab(50 0 0) = 15.3846", () => {
    expect(new Lab(50, 30, 40).deltaE94(new Lab(50, 0, 0))).toBeCloseTo(15.3846, 4);
  });
});

describe("deltaECmc (Clarke, McDonald & Rigg 1984)", () => {
  it("colour-science delta_E_CMC: 2:1 is 0.8996999", () => {
    truncatesTo(CS_1.deltaECmc(CS_2), 0.8996999);
  });

  it("1:1 from colour-science's published 2:1 terms: √((2·dL)² + dC² + dH²)", () => {
    // dL = ΔL / (l·SL) with l = 2, so l = 1 doubles it; dC and dH don't depend on l (c stays 1).
    const [dL, dC, dH] = [-0.7743459, -0.4580766, 0.0037676];
    expect(CS_1.deltaECmc(CS_2, { l: 1 })).toBeCloseTo(Math.hypot(2 * dL, dC, dH), 6);
  });

  // coloraide @4888fc2d tests/test_distance.py test_delta_e_cmc_d50, 4 decimals.
  it.each([
    ["red", "red", 0],
    ["red", "orange", 32.7965],
    ["red", "yellow", 64.9048],
    ["red", "green", 78.8614],
    ["red", "blue", 114.2301],
    ["red", "indigo", 79.8767],
    ["red", "violet", 65.2371],
    ["red", "black", 38.9135],
    ["red", "white", 36.7155],
    ["red", "gray", 30.7143],
  ] as const)("coloraide %s → %s = %d", (x, y, de) => {
    expect(Math.abs(parse(x).to(Lab).deltaECmc(parse(y).to(Lab)) - de)).toBeLessThanOrEqual(5e-5);
  });

  it("coloraide: the 3-4-5 triangle = 19.4894", () => {
    expect(new Lab(50, 30, 40).deltaECmc(new Lab(50, 0, 0))).toBeCloseTo(19.4894, 4);
  });

  it("is not symmetric: the reference sets the weights", () => {
    const [a, b] = [new Lab(50, 30, 40), new Lab(50, 0, 0)];
    expect(a.deltaECmc(b)).not.toBeCloseTo(b.deltaECmc(a), 3);
    expect(a.deltaE94(b)).not.toBeCloseTo(b.deltaE94(a), 3);
  });
});
