import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./a98-rgb.fixtures.json" with { type: "json" };
import { A98Rgb } from "./a98-rgb.js";

describeModel(A98Rgb, models, { fixtures: fixtures as Fixtures });
