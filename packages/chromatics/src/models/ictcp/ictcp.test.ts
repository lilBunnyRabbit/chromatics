import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { multiply } from "../../core/linear.js";
import { LINEAR_REC2020_TO_XYZ_D65 } from "../../core/matrices.js";
import { pqDecode } from "../../core/transfer.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Srgb } from "../srgb/srgb.js";
import { Xyz65 } from "../xyz65/xyz65.js";
import fixtures from "./ictcp.fixtures.json" with { type: "json" };
import { Ictcp } from "./ictcp.js";

describeModel(Ictcp, models, {
  fixtures: fixtures as Fixtures,
  realistic: 1,
  strings: [
    ["ictcp(0.5 0.1 -0.1)", [0.5, 0.1, -0.1], 1],
    ["ictcp(50% 100% -100% / 0.5)", [0.5, 0.5, -0.5], 0.5],
  ],
});

const close = (actual: readonly number[], expected: readonly number[], tolerance: number) =>
  expected.forEach((e, i) =>
    expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThanOrEqual(tolerance)
  );

describe("Ictcp references", () => {
  // CSS Color HDR 1 ED (2026-10-08): §6.3 sRGB white "ictcp(0.58069 0 0)"; §3 "red /* ictcp(42.8% -0.116
  // 0.279) */" and "color(rec2020 1 0 0) /* ictcp(44.7% -0.130 0.399) */" (half a digit each).
  it("sRGB white is ictcp(0.58069 0 0) (CSS Color HDR 1 §6.3)", () => {
    close(new Srgb(1, 1, 1).to(Ictcp).coords, [0.58069, 0, 0], 5e-6);
  });

  it("sRGB red is ictcp(42.8% -0.116 0.279) (CSS Color HDR 1 comment example)", () => {
    close(new Srgb(1, 0, 0).to(Ictcp).coords, [0.428, -0.116, 0.279], 5e-4);
  });

  it("rec2020 red is ictcp(44.7% -0.130 0.399) (CSS Color HDR 1 comment example)", () => {
    const xyz = multiply(LINEAR_REC2020_TO_XYZ_D65, 1, 0, 0);
    close(new Xyz65(...xyz).to(Ictcp).coords, [0.447, -0.13, 0.399], 5e-4);
  });

  // ITU-R BT.2124-0 Annex 4 §1 steps 2–3: PQ codes [0.2893, 0.1964, 0.5689] → [8.753, 2.291, 181.3] cd/m².
  it("PQ EOTF: BT.2124 Annex 4 step 2 → step 3", () => {
    close(
      [0.2893, 0.1964, 0.5689].map((v) => pqDecode(v) * 10000),
      [8.753, 2.291, 181.3],
      0.05
    );
    close(
      [0.2893, 0.1964].map((v) => pqDecode(v) * 10000),
      [8.753, 2.291],
      5e-4
    );
  });

  // BT.2124-0 Annex 4 §2: XYZ [36, 15, 190] cd/m² → ITP [0.3568, 0.1321, −0.1629], ITP = (I, Ct / 2, Cp).
  it("BT.2124 Annex 4: XYZ [36, 15, 190] cd/m² → ITP [0.3568, 0.1321, −0.1629]", () => {
    const c = new Xyz65(36 / 203, 15 / 203, 190 / 203).to(Ictcp);
    close([c.i, c.ct / 2, c.cp], [0.3568, 0.1321, -0.1629], 5e-5);
  });

  // BT.2124-0 Annex 4 §2: ΔE_ITP between the published ITP pairs is 2.363.
  it("deltaEItp of BT.2124's published ITP pair is 2.363", () => {
    const a = new Ictcp(0.3554, 2 * 0.1346, -0.1613);
    const b = new Ictcp(0.3568, 2 * 0.1321, -0.1629);
    expect(a.deltaEItp(b)).toBeCloseTo(2.363, 3);
    expect(b.deltaEItp(a)).toBe(a.deltaEItp(b));
  });

  it("negative light round-trips (grill 60)", () => {
    const c = new Srgb(-0.2, 1, 0).to(Ictcp).to(Srgb);
    [-0.2, 1, 0].forEach((e, i) => expect(c.coords[i]!).toBeCloseTo(e, 10));
  });
});
