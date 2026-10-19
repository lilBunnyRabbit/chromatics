import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./linear-srgb.fixtures.json" with { type: "json" };
import { LinearSrgb } from "./linear-srgb.js";

describeModel(LinearSrgb, models, { fixtures: fixtures as Fixtures });
