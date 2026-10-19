import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./prophoto-rgb.fixtures.json" with { type: "json" };
import { ProphotoRgb } from "./prophoto-rgb.js";

describeModel(ProphotoRgb, models, { fixtures: fixtures as Fixtures });
