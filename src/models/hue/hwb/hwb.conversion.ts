import { HSV, RGB } from "../../..";
import { HWB } from "./hwb.model";

export class HWBConversion {
  constructor(private hwb: HWB) {}

  public RGB(): RGB {
    return this.HSV().to.RGB();
  }

  public HSV(): HSV {
    const s = this.hwb.b === 1 ? 0 : 1 - this.hwb.w / (1 - this.hwb.b);
    return new HSV(this.hwb.h, s, 1 - this.hwb.b, this.hwb.a);
  }
}

// /**
//  * @deprecated
//  */
// class HWBConversions extends HWBBase {
//   public toRGB(): RGB {
//     return this.toHSV().toRGB();
//   }

//   public toHSI(): HSI {
//     return this.toRGB().toHSI();
//   }

//   public toHSL(): HSL {
//     return this.toHSV().toHSL();
//   }

//   public toHSV(): HSV {
//     const s = this.b === 1 ? 0 : 1 - this.w / (1 - this.b);
//     return new HSV(this.h, s, 1 - this.b);
//   }
// }

// export default ConversionRegistry__OLD.registrator(HWB, (register) => {
//   register(HSV, (hwb) => {
//     const s = hwb.b === 1 ? 0 : 1 - hwb.w / (1 - hwb.b);
//     return new HSV(hwb.h, s, 1 - hwb.b);
//   });
// });

// // TODO: Indirect conversions are currently not supported
// // ConversionRegistry.register(HWB, RGB, (hwb) => {
// //   return this.toHSV().toRGB();
// // });

// // ConversionRegistry.register(HWB, HSL, (hwb) => {
// //   return this.toHSV().toHSL();
// // });
