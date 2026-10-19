import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { D50_WHITE } from "../../core/matrices.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Xyz50 } from "../xyz50/xyz50.js";
import fixtures from "./lab.fixtures.json" with { type: "json" };
import { Lab } from "./lab.js";

describeModel(Lab, models, {
  fixtures: fixtures as Fixtures,
  // CSS Color 4 #specifying-lab-lch: L clamps to [0%, 100%] at parsed-value time; a / b never clamp.
  strings: [
    ["lab(120 0 0)", [100, 0, 0], 1],
    ["lab(-5 200 -200)", [0, 200, -200], 1],
    ["lab(50% 100% -100%)", [50, 125, -125], 1],
  ],
  // CSS Color 4 #serializing-lab-lch examples (css4-parse-0022, -0031, -0032).
  formats: [
    ["lab(29% 39 20)", "lab(29 39 20)"],
    ["lab(56.200% 0.000 83.600)", "lab(56.2 0 83.6)"],
    ["lab(56.200% 0.000 66.88%)", "lab(56.2 0 83.6)"],
  ],
});

describe("Lab extras", () => {
  // The CIE constants are fixed by their junction: 116·∛ε − 16 = κ·ε = 8, so L is continuous where the
  // cube-root and linear pieces meet. A wrong κ or ε leaves a step there that round trips can't see.
  it("is continuous at the CIE junction (ε = 216/24389, κ = 24389/27)", () => {
    const epsilon = 216 / 24389;
    const at = (t: number) => new Xyz50(D50_WHITE[0] * t, D50_WHITE[1] * t, D50_WHITE[2] * t).to(Lab).l;
    expect(Math.abs(at(epsilon * (1 + 1e-12)) - at(epsilon * (1 - 1e-12)))).toBeLessThan(1e-9);
    expect(at(epsilon)).toBeCloseTo(8, 12);
  });

  it("D50 white is exactly L 100, a 0, b 0", () => {
    const white = new Xyz50(...D50_WHITE).to(Lab);
    expect([...white.coords]).toEqual([100, 0, 0]);
  });
});
