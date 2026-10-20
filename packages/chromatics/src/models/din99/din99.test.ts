import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { DIN99, fromLab } from "../../core/din99.js";
import { Lab65 } from "../lab65/lab65.js";
import { describeModel } from "../../testing/harness.js";
import { Din99 } from "./din99.js";

// DIN99 compresses with logarithms, so the inverse is exponential: values far past the range overflow.
describeModel(Din99, models, { realistic: 1 });

const close = (actual: readonly number[], expected: readonly number[], tol = 5e-9) =>
  expected.forEach((e, i) => expect(Math.abs(actual[i]! - e), `${i}: ${actual[i]} vs ${e}`).toBeLessThan(tol + 1e-12));

// colour-science `colour/models/tests/test_din99.py:50-90` @ 248121e3 (secondary), Lab → DIN99, 8 decimals.
describe("Din99 references", () => {
  it.each([
    [
      [41.52787529, 52.63858304, 26.92317922],
      [53.22821988, 28.41634656, 3.89839552],
    ],
    [
      [55.11636304, -41.08791787, 30.91825778],
      [66.08943912, -17.35290106, 16.09690691],
    ],
    [
      [29.8056552, 20.01830466, -48.34913874],
      [40.71533366, 3.48714163, -21.45321411],
    ],
  ] as const)("Lab %j → DIN99 %j", (lab, expected) =>
    close(new Lab65(lab[0], lab[1], lab[2]).to(Din99).coords, expected)
  );

  // DIN99b's vector (same file) exercises the 26° rotation and ln path DIN99o shares (grill 67): only c1 and c5
  // differ from DIN99o.
  it("the shared core reproduces colour-science's DIN99b vector", () => {
    const din99b = { ...DIN99, c1: 303.67, c2: 0.0039, c3: 26, c4: 0.83, c5: 23, c6: 0.075, c7: 26, c8: 1 };
    close(fromLab(din99b, 41.52787529, 52.63858304, 26.92317922), [45.58303137, 34.71824493, 17.61622149]);
  });
});
