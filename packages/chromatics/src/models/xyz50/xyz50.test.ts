import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./xyz50.fixtures.json" with { type: "json" };
import { Xyz50 } from "./xyz50.js";

describeModel(Xyz50, models, { fixtures: fixtures as Fixtures });
