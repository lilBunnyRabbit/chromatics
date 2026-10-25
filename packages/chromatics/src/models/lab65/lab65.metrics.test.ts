import { describe, expect, it } from "vitest";
import { parse } from "../../all.js";
import { Lab65 } from "./lab65.js";

// coloraide @4888fc2d tests/test_distance.py test_delta_e_94 and test_delta_e_cmc (its default space,
// lab-d65), 4 decimals. Both are asymmetric, so the reversed pairs differ.
describe("deltaE94 on Lab65", () => {
  it.each([
    ["red", "red", 0],
    ["red", "orange", 30.1848],
    ["red", "yellow", 59.9971],
    ["red", "green", 50.9748],
    ["red", "blue", 70.577],
    ["red", "indigo", 57.3326],
    ["red", "violet", 42.7662],
    ["red", "black", 56.3033],
    ["red", "white", 50.2259],
    ["red", "gray", 18.3301],
    ["orange", "red", 32.4524],
    ["yellow", "red", 61.315],
    ["green", "red", 62.8766],
    ["blue", "red", 61.2377],
    ["indigo", "red", 65.939],
    ["violet", "red", 53.2084],
    ["black", "red", 117.3239],
    ["white", "red", 114.5315],
    ["gray", "red", 104.5506],
  ] as const)("%s → %s = %d", (x, y, de) => {
    expect(Math.abs(parse(x).to(Lab65).deltaE94(parse(y).to(Lab65)) - de)).toBeLessThanOrEqual(5e-5);
  });
});

describe("deltaECmc on Lab65", () => {
  it.each([
    ["red", "red", 0],
    ["red", "orange", 35.0602],
    ["red", "yellow", 68.462],
    ["red", "green", 81.1088],
    ["red", "blue", 108.5693],
    ["red", "indigo", 76.9117],
    ["red", "violet", 63.8109],
    ["red", "black", 38.4316],
    ["red", "white", 36.729],
    ["red", "gray", 30.279],
    ["orange", "red", 36.1519],
    ["yellow", "red", 49.9011],
    ["green", "red", 58.0162],
    ["blue", "red", 73.3546],
    ["indigo", "red", 65.7278],
    ["violet", "red", 50.8812],
    ["black", "red", 171.9516],
    ["white", "red", 164.6293],
    ["gray", "red", 163.8716],
  ] as const)("%s → %s = %d", (x, y, de) => {
    expect(Math.abs(parse(x).to(Lab65).deltaECmc(parse(y).to(Lab65)) - de)).toBeLessThanOrEqual(5e-5);
  });

  it("the 3-4-5 triangle = 19.4894", () => {
    expect(new Lab65(50, 30, 40).deltaECmc(new Lab65(50, 0, 0))).toBeCloseTo(19.4894, 4);
  });
});
