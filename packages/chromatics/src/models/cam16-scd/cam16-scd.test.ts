import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Cam16Scd } from "./cam16-scd.js";

describeModel(Cam16Scd, models, { realistic: 0 });
