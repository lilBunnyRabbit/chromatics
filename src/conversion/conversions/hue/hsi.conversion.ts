import { HSI, RGB } from "../../../models";
import { ConversionRegistry } from "../../conversion-registry";
import { HueHelper } from "../../helpers/hue.helper";

ConversionRegistry.register(HSI, RGB, (hsi) => {
  const hue = hsi.h / 60;

  const z = 1 - Math.abs((hue % 2) - 1);
  const chroma = (3 * hsi.i * hsi.s) / (1 + z);
  const interChroma = chroma * z;
  const offset = hsi.i * (1 - hsi.s);

  return HueHelper.chromaToRGB(hue, chroma, interChroma, offset);
});
