import { describe, expect, it } from "vitest";
import { models } from "../../all.js";
import { D50_WHITE } from "../../core/matrices.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import { Xyz50 } from "../xyz50/xyz50.js";
import fixtures from "./luv50.fixtures.json" with { type: "json" };
import { Luv50 } from "./luv50.js";

describeModel(Luv50, models, {
  fixtures: fixtures as Fixtures,
  strings: [["luv-d50(53.2 175 37.8)", [53.2, 175, 37.8], 1]],
  invalid: ["luv-d50(50% 0 0)", "luv-d50(50, 0, 0)"],
});

describe("Luv50 extras", () => {
  it("D50 white is exactly L 100, u 0, v 0", () => {
    expect([...new Xyz50(...D50_WHITE).to(Luv50).coords]).toEqual([100, 0, 0]);
  });
});
