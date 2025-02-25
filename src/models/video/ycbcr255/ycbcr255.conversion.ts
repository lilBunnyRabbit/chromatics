import { RGB255 } from "../..";
import { Matrix } from "../../../utils";
import { YCbCr255 } from "./ycbcr255.model";

export class YCbCr255Conversion {
  static matRGB255 = new Matrix([1, 0, 1.402525], [1, -0.34373, -0.714401], [1, 1.769905, 0.000013]);

  constructor(private ycbcr: YCbCr255) {}

  public RGB255(): RGB255 {
    const rgb = YCbCr255Conversion.matRGB255.dot([this.ycbcr.y, this.ycbcr.cb - 128, this.ycbcr.cr - 128]);
    return new RGB255(rgb[0], rgb[1], rgb[2], this.ycbcr.a);
  }
}

// class YCbCr255Conversions extends YCbCr255Base {
//   private matRGB255 = new Matrix([1, 0, 1.402525], [1, -0.34373, -0.714401], [1, 1.769905, 0.000013]);

//   public toRGB255(): RGB255 {
//     const rgb = this.matRGB255.dot([this.y, this.cb - 128, this.cr - 128]);
//     return new RGB255(rgb[0], rgb[1], rgb[2]);
//   }
// }

// export default ConversionRegistry__OLD.registrator(YCbCr255, (register) => {
//   const matRGB255 = new Matrix([1, 0, 1.402525], [1, -0.34373, -0.714401], [1, 1.769905, 0.000013]);

//   register(RGB255, (ycbcr) => {
//     const rgb = matRGB255.dot([ycbcr.y, ycbcr.cb - 128, ycbcr.cr - 128]);
//     return new RGB255(rgb[0], rgb[1], rgb[2]);
//   });
// });
