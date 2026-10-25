import { models } from "../../all.js";
import { describeModel } from "../../testing/harness.js";
import { Cam16Lcd } from "./cam16-lcd.js";

describeModel(Cam16Lcd, models, { realistic: 0 });
