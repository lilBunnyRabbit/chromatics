import { HSV, HWB } from "../../../models";
import { ConversionRegistry } from "../../conversion-registry";

ConversionRegistry.register(HWB, HSV, (hwb) => {
  const s = hwb.b === 1 ? 0 : 1 - hwb.w / (1 - hwb.b);
  return new HSV(hwb.h, s, 1 - hwb.b);
});

// TODO: Indirect conversions are currently not supported
// ConversionRegistry.register(HWB, RGB, (hwb) => {
//   return this.toHSV().toRGB();
// });

// ConversionRegistry.register(HWB, HSL, (hwb) => {
//   return this.toHSV().toHSL();
// });
