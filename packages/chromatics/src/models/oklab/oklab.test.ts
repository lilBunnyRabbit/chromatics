import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./oklab.fixtures.json" with { type: "json" };
import { Oklab } from "./oklab.js";

describeModel(Oklab, models, { fixtures: fixtures as Fixtures });
