import { describe, expect, it } from "vitest";
import { Oklab } from "./oklab.js";

// CSS Color 4 #color-difference-OK: Euclidean distance in Oklab; one JND is 0.02 (#GMA-Binary-local-MINDE).
describe("deltaEOk / looksSame", () => {
  it("is the Euclidean distance", () => {
    expect(new Oklab(0.5, 0, 0).deltaEOk(new Oklab(0.5, 0.03, 0.04))).toBeCloseTo(0.05, 15);
  });

  it("looksSame is strictly below one JND", () => {
    expect(new Oklab(0.5, 0, 0).looksSame(new Oklab(0.5, 0.0199, 0))).toBe(true);
    expect(new Oklab(0.5, 0, 0).looksSame(new Oklab(0.5, 0.02, 0))).toBe(false);
  });
});
