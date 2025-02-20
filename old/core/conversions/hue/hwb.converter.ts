import { ConversionRegistry__OLD } from "../../../lib";
import { HSV, HWB } from "../../models";

export default ConversionRegistry__OLD.registrator(HWB, (register) => {
  register(HSV, (hwb) => {
    const s = hwb.b === 1 ? 0 : 1 - hwb.w / (1 - hwb.b);
    return new HSV(hwb.h, s, 1 - hwb.b);
  });
});

// TODO: Indirect conversions are currently not supported
// ConversionRegistry.register(HWB, RGB, (hwb) => {
//   return this.toHSV().toRGB();
// });

// ConversionRegistry.register(HWB, HSL, (hwb) => {
//   return this.toHSV().toHSL();
// });
