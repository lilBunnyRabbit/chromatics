import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./srgb.fixtures.json" with { type: "json" };
import { Srgb } from "./srgb.js";

describeModel(Srgb, models, { fixtures: fixtures as Fixtures });
