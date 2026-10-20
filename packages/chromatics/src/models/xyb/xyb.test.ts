import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { LinearSrgb } from "../linear-srgb/linear-srgb.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./xyb.fixtures.json" with { type: "json" };
import { Xyb } from "./xyb.js";

describeModel(Xyb, models, { fixtures: fixtures as Fixtures });

const close = (actual: readonly number[], expected: readonly number[], tol = 5e-9) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol + 1e-12));

// libjxl `lib/jxl/opsin_image_test.cc:111-131` @ f23e813b checks invariants, not values: black → 0 (1e-7),
// grey → x = 0 (1e-6) and b = y (kYToBRatio 1, 3e-5). No numeric XYB vectors are published.
describe("Xyb invariants (libjxl)", () => {
  it("black is (0, 0, 0)", () => close(new LinearSrgb(0, 0, 0).to(Xyb).coords, [0, 0, 0], 1e-7));

  it.each([0.01, 0.18, 0.5, 1])("grey %s has x = 0 and b = y", (v) => {
    const c = new LinearSrgb(v, v, v).to(Xyb);
    expect(Math.abs(c.x)).toBeLessThan(1e-6);
    expect(Math.abs(c.b - c.y)).toBeLessThan(3e-5);
  });

  it("negative light keeps its sign and round-trips (no clamp, ADR-003)", () => {
    const c = new LinearSrgb(-0.1, 0.5, 0.2).to(Xyb).to(LinearSrgb);
    [-0.1, 0.5, 0.2].forEach((v, i) => expect(c.coords[i]!).toBeCloseTo(v, 12));
  });
});
