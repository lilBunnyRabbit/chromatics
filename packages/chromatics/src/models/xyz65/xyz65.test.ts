import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./xyz65.fixtures.json" with { type: "json" };
import { Xyz65 } from "./xyz65.js";

describeModel(Xyz65, models, { fixtures: fixtures as Fixtures });
