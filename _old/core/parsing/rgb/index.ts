import { ParserRegistry__OLD } from "../../../lib";
import registerRgb from "./rgb.parser";
import registerRgb255 from "./rgb255.parser";

export default function (instance: ParserRegistry__OLD) {
  registerRgb(instance);
  registerRgb255(instance);
}
