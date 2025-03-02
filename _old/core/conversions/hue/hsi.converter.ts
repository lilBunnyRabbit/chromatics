import { ConversionRegistry__OLD } from "../../../lib";
import { HSI, RGB } from "../../models";
import { HueHelper } from "./helpers/hue.helper";

export default ConversionRegistry__OLD.registrator(HSI, (register) => {
  register(RGB, (hsi) => {
    const hue = hsi.h / 60;

    const z = 1 - Math.abs((hue % 2) - 1);
    const chroma = (3 * hsi.i * hsi.s) / (1 + z);
    const interChroma = chroma * z;
    const offset = hsi.i * (1 - hsi.s);

    return HueHelper.chromaToRGB(hue, chroma, interChroma, offset);
  });
});
