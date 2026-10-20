import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./din99o.fixtures.json" with { type: "json" };
import { Din99o } from "./din99o.js";

// DIN99 compresses with logarithms, so the inverse is exponential: values far past the range overflow.
describeModel(Din99o, models, { fixtures: fixtures as Fixtures, realistic: 1 });
