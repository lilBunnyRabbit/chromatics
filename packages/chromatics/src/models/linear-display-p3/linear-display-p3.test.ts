import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./linear-display-p3.fixtures.json" with { type: "json" };
import { LinearDisplayP3 } from "./linear-display-p3.js";

describeModel(LinearDisplayP3, models, { fixtures: fixtures as Fixtures });
