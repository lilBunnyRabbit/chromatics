import fc from "fast-check";
import { describe, expect, it } from "vitest";
import fixtures from "./ciede2000.fixtures.json" with { type: "json" };
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
