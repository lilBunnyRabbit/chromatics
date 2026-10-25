import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./lchuv50.fixtures.json" with { type: "json" };
import { Lchuv50 } from "./lchuv50.js";

describeModel(Lchuv50, models, {
  fixtures: fixtures as Fixtures,
  strings: [["lchuv-d50(53.2 179 12.2)", [53.2, 179, 12.2], 1]],
  invalid: ["lchuv-d50(50% 30 0)"],
});
