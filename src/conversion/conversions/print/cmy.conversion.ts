import { CMY, CMYK, RGB } from "../../../models";
import { ConversionRegistry } from "../../conversion-registry";

ConversionRegistry.register(CMY, RGB, (cmy) => {
  return new RGB(1 - cmy.c, 1 - cmy.m, 1 - cmy.y);
});

ConversionRegistry.register(CMY, CMYK, (cmy) => {
  const k = Math.min(cmy.c, cmy.m, cmy.y);
  return new CMYK(cmy.c - k, cmy.m - k, cmy.y - k, k);
});
