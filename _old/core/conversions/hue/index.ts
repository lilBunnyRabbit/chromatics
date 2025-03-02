import registerHsi from "./hsi.converter";
import registerHsl from "./hsl.converter";
import registerHsv from "./hsv.converter";
import registerHwb from "./hwb.converter";

export default function () {
  registerHsi();
  registerHsl();
  registerHsv();
  registerHwb();
}
