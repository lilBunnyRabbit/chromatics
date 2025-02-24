import { RGB } from "../rgb";
import { RGB255 } from "./rgb255.model";

// export type ConversionInstance<ConversionMap> = {
//   [K in keyof ConversionMap]: () => ConversionMap[K];
// }

// interface RGB255Conversions {
//   RGB: RGB;
// }

// implements ConversionInstance<RGB255Conversions>

export class RGB255Conversion {
  constructor(private rgb: RGB255) {}

  public RGB(): RGB {
    return new RGB(this.rgb.r / 255, this.rgb.g / 255, this.rgb.b / 255, this.rgb.a / 255);
  }
}

// /**
//  * @deprecated
//  */
// class RGB255Conversions extends RGB255Base {
//   public toRGB(): RGB {
//     return new RGB(this.r / 255, this.g / 255, this.b / 255);
//   }

//   public toCMY(): CMY {
//     return this.toRGB().toCMY();
//   }

//   public toCMYK(): CMYK {
//     return this.toRGB().toCMYK();
//   }

//   public toHSI(): HSI {
//     return this.toRGB().toHSI();
//   }

//   public toHSL(): HSL {
//     return this.toRGB().toHSL();
//   }

//   public toHSV(): HSV {
//     return this.toRGB().toHSV();
//   }

//   public toHWB(): HWB {
//     return this.toRGB().toHWB();
//   }

//   public toXYZ(): XYZ {
//     return this.toRGB().toXYZ();
//   }

//   public toLAB(illuminant?: keyof typeof XYZ.Illuminants): Lab {
//     return this.toXYZ().toLAB(illuminant);
//   }

//   private matYCbCr = new Matrix(
//     [0.299, 0.587, 0.114],
//     [-0.168935, -0.331665, 0.50059],
//     [0.499813, -0.418531, -0.081282]
//   );

//   public toYCbCr255(): YCbCr255 {
//     const yCbCr = this.matYCbCr.dot([this.r, this.g, this.b]).sum([0, 128, 128]);
//     return new YCbCr255(yCbCr[0], yCbCr[1], yCbCr[2]);
//   }
// }