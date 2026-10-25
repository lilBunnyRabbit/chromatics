import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./display-p3.fixtures.json" with { type: "json" };
import { DisplayP3 } from "./display-p3.js";

describeModel(DisplayP3, models, { fixtures: fixtures as Fixtures });
