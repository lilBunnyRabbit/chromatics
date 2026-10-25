import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./rec2020.fixtures.json" with { type: "json" };
import { Rec2020 } from "./rec2020.js";

describeModel(Rec2020, models, { fixtures: fixtures as Fixtures });
