// https://en.wikipedia.org/wiki/CIE_1931_color_space

import { round } from "../utils";
import { Lab } from "./Lab";
import { RGB } from "./RGB";

export type XYZReferences = [x2: number, y2: number, z2: number, x10: number, y10: number, z10: number];

// TODO: Not perfect
class XYZBase extends Float32Array {
  /**
   * Observer	2° (CIE 1931) - x2, y2, z2
   * Observer 10° (CIE 1964) - x10, y10, z10
   */
  static Illuminants = {
    A: [109.85, 100.0, 35.585, 111.144, 100.0, 35.2], // Incandescent/tungsten
    B: [99.0927, 100.0, 85.313, 99.178, 100.0, 84.3493], // Old direct sunlight at noon
    C: [98.074, 100.0, 118.232, 97.285, 100.0, 116.145], // Old daylight
    D50: [96.422, 100.0, 82.521, 96.72, 100.0, 81.427], // ICC profile PCS
    D55: [95.682, 100.0, 92.149, 95.799, 100.0, 90.926], // Mid-morning daylight
    D65: [95.047, 100.0, 108.883, 94.811, 100.0, 107.304], // Daylight, sRGB, Adobe-RGB
    D75: [94.972, 100.0, 122.638, 94.416, 100.0, 120.641], // North sky daylight
    E: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0], // Equal energy
    F1: [92.834, 100.0, 103.665, 94.791, 100.0, 103.191], // Daylight Fluorescent
    F2: [99.187, 100.0, 67.395, 103.28, 100.0, 69.026], // Cool fluorescent
    F3: [103.754, 100.0, 49.861, 108.968, 100.0, 51.965], // White Fluorescent
    F4: [109.147, 100.0, 38.813, 114.961, 100.0, 40.963], // Warm White Fluorescent
    F5: [90.872, 100.0, 98.723, 93.369, 100.0, 98.636], // Daylight Fluorescent
    F6: [97.309, 100.0, 60.191, 102.148, 100.0, 62.074], // Lite White Fluorescent
    F7: [95.044, 100.0, 108.755, 95.792, 100.0, 107.687], // Daylight fluorescent, D65 simulator
    F8: [96.413, 100.0, 82.333, 97.115, 100.0, 81.135], // Sylvania F40, D50 simulator
    F9: [100.365, 100.0, 67.868, 102.116, 100.0, 67.826], // Cool White Fluorescent
    F10: [96.174, 100.0, 81.712, 99.001, 100.0, 83.134], // Ultralume 50, Philips TL85
    F11: [100.966, 100.0, 64.37, 103.866, 100.0, 65.627], // Ultralume 40, Philips TL84
    F12: [108.046, 100.0, 39.228, 111.428, 100.0, 40.353], // Ultralume 30, Philips TL83
  } satisfies Record<string, XYZReferences>;

  static getReferences(illuminant: keyof typeof XYZ.Illuminants = "D65") {
    return XYZ.Illuminants[illuminant] ?? XYZ.Illuminants.D65;
  }

  public get x() {
    return this[0];
  }

  public set x(x: number) {
    this[0] = x;
  }

  public get y() {
    return this[1];
  }

  public set y(y: number) {
    this[1] = y;
  }

  public get z() {
    return this[2];
  }

  public set z(z: number) {
    this[2] = z;
  }

  /**
   * @param x - [0, 1]
   * @param y - [0, 1]
   * @param z - [0, 1]
   */
  constructor(x: number, y: number, z: number) {
    super(3);

    this[0] = x;
    this[1] = y;
    this[2] = z;
  }

  public toString(illuminant?: keyof typeof XYZ.Illuminants) {
    if (!illuminant) {
      return `color(xyz ${round(this.x, 4)} ${round(this.y, 4)} ${round(this.z, 4)})`;
    }

    // Observer= 2°, Illuminant= D65
    const references = XYZ.getReferences(illuminant);

    const [x, y, z] = [
      round(this.x / references[0], 4),
      round(this.y / references[1], 4),
      round(this.z / references[2], 4),
    ];

    let type = "xyz";
    if (illuminant === "D50") type += "-d50";
    else if (illuminant === "D65") type += "-d65";

    return `color(${type} ${x} ${y} ${z})`;
  }
}

class XYZConversions extends XYZBase {
  // X, Y and Z output refer to a D65/2° standard illuminant.
  /**
   * @param r - [0, 1]
   * @param g - [0, 1]
   * @param b - [0, 1]
   */
  static fromRGB(r: number, g: number, b: number) {
    const rgb = [r, g, b].map((value) => {
      if (value > 0.04045) {
        value = ((value + 0.055) / 1.055) ** 2.4;
      } else {
        value /= 12.92;
      }

      return value * 100;
    }) as [r: number, g: number, b: number];

    return new XYZ(
      rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805,
      rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722,
      rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505
    );
  }

  public toRGB(): RGB {
    const [x, y, z] = [this.x / 100, this.y / 100, this.z / 100];

    const rgb = [
      x * 3.2406 + y * -1.5372 + z * -0.4986,
      x * -0.9689 + y * 1.8758 + z * 0.0415,
      x * 0.0557 + y * -0.204 + z * 1.057,
    ].map((value) => {
      if (value > 0.0031308) {
        return 1.055 * value ** (1 / 2.4) - 0.055;
      }

      return 12.92 * value;
    }) as [r: number, g: number, b: number];

    return RGB.fromNormalized(...rgb);
  }

  public toLAB(illuminant: keyof typeof XYZ.Illuminants = "D65"): Lab {
    const references = XYZ.getReferences(illuminant);

    const [x, y, z] = [this.x / references[0], this.y / references[1], this.z / references[2]].map((value) => {
      if (value > 0.008856) {
        return value ** (1 / 3);
      }

      return 7.787 * value + 16 / 116;
    });

    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);

    return new Lab(l, a, b, illuminant);
  }
}

export class XYZ extends XYZConversions {
  static sum(...xyzs: XYZ[]): XYZ {
    const per = 1 / xyzs.length;

    let [x, y, z] = [0, 0, 0];

    for (const xyz of xyzs) {
      x += xyz.x * per;
      y += xyz.y * per;
      z += xyz.z * per;
    }

    return new XYZ(x, y, z);
  }
}
