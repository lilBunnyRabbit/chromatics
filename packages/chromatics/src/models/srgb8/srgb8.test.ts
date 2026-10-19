import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./srgb8.fixtures.json" with { type: "json" };
import { Srgb8 } from "./srgb8.js";

describeModel(Srgb8, models, { fixtures: fixtures as Fixtures });
