import { models } from "../../all.js";
import { describeModel, type Fixtures } from "../../testing/harness.js";
import fixtures from "./din99o-lch.fixtures.json" with { type: "json" };
import { Din99oLch } from "./din99o-lch.js";

// DIN99 compresses with logarithms, so the inverse is exponential: values far past the range overflow.
describeModel(Din99oLch, models, { fixtures: fixtures as Fixtures, realistic: 1 });
