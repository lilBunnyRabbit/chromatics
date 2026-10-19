import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { fixHues, segment } from "./interpolate.js";

const hue = fc.double({ min: 0, max: 360, maxExcluded: true, noNaN: true });

// CSS Color 4 #hue-interpolation states each strategy's invariant on θ₂ − θ₁ after the fixup.
describe("fixHues invariants (CSS Color 4 #hue-interpolation)", () => {
  it("shorter: θ₂ − θ₁ ∈ [−180, 180]", () => {
    fc.assert(
      fc.property(hue, hue, (a, b) => {
        const [h1, h2] = fixHues(a, b, "shorter");
        expect(Math.abs(h2 - h1)).toBeLessThanOrEqual(180);
      })
    );
  });

  // The spec's pseudo-code gives a full turn (360) for equal hues, which its stated range [180, 360)
  // leaves out; the pseudo-code is what implementations run.
  it("longer: θ₂ − θ₁ ∈ [−360, −180] ∪ [180, 360] (ends reached by equal hues or float rounding)", () => {
    fc.assert(
      fc.property(hue, hue, (a, b) => {
        const [h1, h2] = fixHues(a, b, "longer");
        const d = h2 - h1;
        expect((d >= -360 && d <= -180) || (d >= 180 && d <= 360)).toBe(true);
      })
    );
  });

  it("increasing: θ₂ − θ₁ ∈ [0, 360)", () => {
    fc.assert(
      fc.property(hue, hue, (a, b) => {
        const [h1, h2] = fixHues(a, b, "increasing");
        expect(h2 - h1).toBeGreaterThanOrEqual(0);
        // ≤, not <: a near-full turn such as 0 → 1e-14 rounds to exactly 360.
        expect(h2 - h1).toBeLessThanOrEqual(360);
      })
    );
  });

  it("decreasing: θ₂ − θ₁ ∈ (−360, 0]", () => {
    fc.assert(
      fc.property(hue, hue, (a, b) => {
        const [h1, h2] = fixHues(a, b, "decreasing");
        expect(h2 - h1).toBeLessThanOrEqual(0);
        expect(h2 - h1).toBeGreaterThanOrEqual(-360);
      })
    );
  });

  it.each([
    [0, 180.5, "shorter", [360, 180.5]],
    [0, 180, "shorter", [0, 180]],
    [10, 200, "longer", [10, 200]],
    [10, 10, "longer", [10, 370]],
    [10, 175, "longer", [370, 175]],
  ] as const)("edge %s → %s (%s)", (a, b, strategy, expected) => {
    expect(fixHues(a, b, strategy)).toEqual(expected);
  });
});

describe("segment", () => {
  it("places n points over the stops, each stop at an equal share", () => {
    const points = [0, 1, 2, 3].map((i) => segment(i, 4, 3));
    expect(points.map(([index]) => index)).toEqual([0, 0, 1, 1]);
    [0, 2 / 3, 1 / 3, 1].forEach((t, i) => expect(points[i]![1]).toBeCloseTo(t, 15));
  });
});
