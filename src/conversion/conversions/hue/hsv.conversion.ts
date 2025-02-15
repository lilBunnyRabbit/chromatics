import { HSL, HSV, HWB, RGB } from "../../../models";
import { ConversionRegistry } from "../../conversion-registry";
import { HueHelper } from "../../helpers/hue.helper";

ConversionRegistry.register(HSV, RGB, (hsv) => {
  const hue = hsv.h / 60;

  const chroma = hsv.v * hsv.s;
  const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
  const offset = hsv.v - chroma;

  return HueHelper.chromaToRGB(hue, chroma, interChroma, offset);
});

ConversionRegistry.register(HSV, HSL, (hsv) => {
  const l = hsv.v * (1 - hsv.s / 2);
  const s = l === 0 || l === 1 ? 0 : (hsv.v - l) / Math.min(l, 1 - l);

  return new HSL(hsv.h, s, l);
});

ConversionRegistry.register(HSV, HWB, (hsv) => {
  return new HWB(hsv.h, (1 - hsv.s) * hsv.v, 1 - hsv.v);
});
