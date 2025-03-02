import { ConversionRegistry__OLD } from "../../../lib";
import { CMY, CMYK, RGB } from "../../models";

export default ConversionRegistry__OLD.registrator(CMY, (register) => {
  register(RGB, (cmy) => {
    return new RGB(1 - cmy.c, 1 - cmy.m, 1 - cmy.y);
  });

  register(CMYK, (cmy) => {
    const k = Math.min(cmy.c, cmy.m, cmy.y);
    return new CMYK(cmy.c - k, cmy.m - k, cmy.y - k, k);
  });
});
