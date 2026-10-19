import { describe, expect, it } from "vitest";
import { LMS_TO_OKLAB, LMS_TO_XYZ, OKLAB_TO_LMS, XYZ_TO_LMS } from "./oklab.js";

type M = readonly (readonly number[])[];

function deviation(a: M, b: M): number {
  let worst = 0;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      const p = a[i]![0]! * b[0]![j]! + a[i]![1]! * b[1]![j]! + a[i]![2]! * b[2]![j]!;
      worst = Math.max(worst, Math.abs(p - (i === j ? 1 : 0)));
    }
  return worst;
}

// The CSS Color 4 literals were each rounded to 16 digits on their own; measured |M·M⁻¹ − I| ≤ 5e-16
// (scratchpad okinv.ts). A transcription slip anywhere past the 14th digit shows up here, where no
// published reference vector is precise enough to see it.
describe("Oklab matrices (CSS Color 4 sample code)", () => {
  it("XYZ ↔ LMS pair is consistent to 1e-15", () => {
    expect(deviation(XYZ_TO_LMS, LMS_TO_XYZ)).toBeLessThanOrEqual(1e-15);
    expect(deviation(LMS_TO_XYZ, XYZ_TO_LMS)).toBeLessThanOrEqual(1e-15);
  });

  it("LMS′ ↔ Oklab pair is consistent to 1e-15", () => {
    expect(deviation(LMS_TO_OKLAB, OKLAB_TO_LMS)).toBeLessThanOrEqual(1e-15);
    expect(deviation(OKLAB_TO_LMS, LMS_TO_OKLAB)).toBeLessThanOrEqual(1e-15);
  });
});
