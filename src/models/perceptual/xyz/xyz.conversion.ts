import { LinearRGB } from "../../rgb";
import { XYZ } from "./xyz.model";

export class XYZConversion {
  constructor(private xyz: XYZ) {}

  // // TODO: maybe?
  // // X, Y and Z output refer to a D65/2° standard illuminant.
  // public LinearRGB(): LinearRGB {
  //   const [x, y, z] = [this.xyz.x / 100, this.xyz.y / 100, this.xyz.z / 100];

  //   const rgb = [
  //     x * 3.2406 + y * -1.5372 + z * -0.4986,
  //     x * -0.9689 + y * 1.8758 + z * 0.0415,
  //     x * 0.0557 + y * -0.204 + z * 1.057,
  //   ].map((value) => {
  //     if (value > 0.0031308) {
  //       return 1.055 * value ** (1 / 2.4) - 0.055;
  //     }

  //     return 12.92 * value;
  //   }) as [r: number, g: number, b: number];

  //   return new LinearRGB(...rgb, this.xyz.a);
  // }

  // Inverse matrix to convert from CIE XYZ to linear sRGB
  static M_xyz_to_lin = [
    [3.2404542, -1.5371385, -0.4985314],
    [-0.969266, 1.8760108, 0.041556],
    [0.0556434, -0.2040259, 1.0572252],
  ];

  /**
   * Converts a CIE XYZ color to linear sRGB.
   *
   * @param {number[]} xyz - An array [X, Y, Z] in the CIE XYZ color space.
   * @returns {number[]} - An array [R, G, B] in linear sRGB (each in 0–1 range).
   */
  public LinearRGB(): LinearRGB {
    const [X, Y, Z] = this.xyz;
    const M_xyz_to_lin = XYZConversion.M_xyz_to_lin;
    const r = M_xyz_to_lin[0][0] * X + M_xyz_to_lin[0][1] * Y + M_xyz_to_lin[0][2] * Z;
    const g = M_xyz_to_lin[1][0] * X + M_xyz_to_lin[1][1] * Y + M_xyz_to_lin[1][2] * Z;
    const b = M_xyz_to_lin[2][0] * X + M_xyz_to_lin[2][1] * Y + M_xyz_to_lin[2][2] * Z;
    return new LinearRGB(r, g, b, this.xyz.a);
  }
}

// /**
//  * @deprecated
//  */
// class XYZConversions extends XYZBase {
//   public toRGB(): RGB {
//     const [x, y, z] = [this.x / 100, this.y / 100, this.z / 100];

//     const rgb = [
//       x * 3.2406 + y * -1.5372 + z * -0.4986,
//       x * -0.9689 + y * 1.8758 + z * 0.0415,
//       x * 0.0557 + y * -0.204 + z * 1.057,
//     ].map((value) => {
//       if (value > 0.0031308) {
//         return 1.055 * value ** (1 / 2.4) - 0.055;
//       }

//       return 12.92 * value;
//     }) as [r: number, g: number, b: number];

//     return new RGB(...rgb);
//   }

//   public toLAB(illuminant: keyof typeof XYZ.Illuminants = "D65"): Lab {
//     const references = XYZ.getReferences(illuminant);

//     const [x, y, z] = [this.x / references[0], this.y / references[1], this.z / references[2]].map((value) => {
//       if (value > 0.008856) {
//         return value ** (1 / 3);
//       }

//       return 7.787 * value + 16 / 116;
//     });

//     const l = 116 * y - 16;
//     const a = 500 * (x - y);
//     const b = 200 * (y - z);

//     return new Lab(l, a, b, illuminant);
//   }
// }
