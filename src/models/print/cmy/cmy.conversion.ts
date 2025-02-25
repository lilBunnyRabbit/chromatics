import { RGB } from "../..";
import { CMYK } from "../cmyk/cmyk.model";
import { CMY } from "./cmy.model";

export class CMYConversion {
  constructor(private cmy: CMY) {}

  public RGB(): RGB {
    return new RGB(1 - this.cmy.c, 1 - this.cmy.m, 1 - this.cmy.y, this.cmy.a);
  }

  public CMYK(): CMYK {
    const k = Math.min(this.cmy.c, this.cmy.m, this.cmy.y);
    return new CMYK(this.cmy.c - k, this.cmy.m - k, this.cmy.y - k, k, this.cmy.a);
  }
}

// /**
//  * @deprecated
//  */
// class CMYConversions extends CMYBase {
//   public toRGB(): RGB {
//     return new RGB(1 - this.c, 1 - this.m, 1 - this.y);
//   }

//   public toCMYK(): CMYK {
//     const k = Math.min(this.c, this.m, this.y);
//     return new CMYK(this.c - k, this.m - k, this.y - k, k);
//   }
// }

// export default ConversionRegistry__OLD.registrator(CMY, (register) => {
//   register(RGB, (cmy) => {
//     return new RGB(1 - cmy.c, 1 - cmy.m, 1 - cmy.y);
//   });

//   register(CMYK, (cmy) => {
//     const k = Math.min(cmy.c, cmy.m, cmy.y);
//     return new CMYK(cmy.c - k, cmy.m - k, cmy.y - k, k);
//   });
// });
