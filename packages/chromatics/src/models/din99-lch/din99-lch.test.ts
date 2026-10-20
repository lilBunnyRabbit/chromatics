import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Din99Lch } from "./din99-lch.js";

// DIN99 compresses with logarithms, so the inverse is exponential: values far past the range overflow.
describeModel(Din99Lch, models, { realistic: 1 });
