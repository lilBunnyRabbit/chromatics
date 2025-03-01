import { XYZ } from "../../perceptual/xyz";
import { RGB } from "../rgb";
import { LinearRGB } from "./linear-rgb.model";

export class LinearRGBConversion {
  constructor(private rgb: LinearRGB) {}

  // TODO: Check AI
  public RGB(): RGB {
    const delinearizeChannel = (c: number): number => {
      return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    };

    return new RGB(
      delinearizeChannel(this.rgb.r),
      delinearizeChannel(this.rgb.g),
      delinearizeChannel(this.rgb.b),
      this.rgb.a
    );
  }

  // // TODO: maybe?
  // // X, Y and Z output refer to a D65/2° standard illuminant.
  // public XYZ(): XYZ {
  //   const rgb = this.rgb.map((value) => {
  //     if (value > 0.04045) {
  //       value = ((value + 0.055) / 1.055) ** 2.4;
  //     } else {
  //       value /= 12.92;
  //     }

  //     return value * 100;
  //   });

  //   return new XYZ(
  //     rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805,
  //     rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722,
  //     rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505
  //   );
  // }

  // Conversion matrices (D65)
  // Matrix to convert from linear sRGB to CIE XYZ
  static M_lin_to_xyz = [
    [0.4124564, 0.3575761, 0.1804375],
    [0.2126729, 0.7151522, 0.072175],
    [0.0193339, 0.119192, 0.9503041],
  ];

  /**
   * Converts a linear sRGB color to CIE XYZ.
   *
   * @param {number[]} rgb - An array [R, G, B] in linear sRGB (each in 0–1 range).
   * @returns {number[]} - An array [X, Y, Z] in the CIE XYZ color space.
   */
  public XYZ(): XYZ {
    const [r, g, b] = this.rgb;
    const M_lin_to_xyz = LinearRGBConversion.M_lin_to_xyz;
    const X = M_lin_to_xyz[0][0] * r + M_lin_to_xyz[0][1] * g + M_lin_to_xyz[0][2] * b;
    const Y = M_lin_to_xyz[1][0] * r + M_lin_to_xyz[1][1] * g + M_lin_to_xyz[1][2] * b;
    const Z = M_lin_to_xyz[2][0] * r + M_lin_to_xyz[2][1] * g + M_lin_to_xyz[2][2] * b;
    return new XYZ(X, Y, Z, this.rgb.a);
  }
}
