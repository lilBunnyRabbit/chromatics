import { isArray, isNumber, isObject } from "@lilbunnyrabbit/utils";
import { clamp, round } from "../../../utils";

// TODO: alpha? temp?
export type RGB255Like = RGB255 | [r: number, g: number, b: number] | Record<"r" | "g" | "b", number> | string | number;

class RGB255Base extends Uint8ClampedArray {
  public get r() {
    return this[0];
  }

  public set r(r: number) {
    this[0] = r;
  }

  public get g() {
    return this[1];
  }

  public set g(g: number) {
    this[1] = g;
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = b;
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = a;
  }

  /**
   * @param r - [0, 255]
   * @param g - [0, 255]
   * @param b - [0, 255]
   * @param a - [0, 255]
   */
  constructor(r: number, g: number, b: number, a: number = 255) {
    super(4);

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static fromRGB(rgb: RGB255Like) {
    if (rgb instanceof RGB255Base) {
      return new RGB255(rgb.r, rgb.g, rgb.b);
    }

    if (isArray(rgb)) {
      return new RGB255(...rgb);
    }

    if (isObject(rgb)) {
      return new RGB255(rgb.r, rgb.g, rgb.b);
    }

    if (isNumber(rgb)) {
      const [r, g, b] = [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];

      return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
    }

    const regex = /\(\s*(?<r>\d*\.?\d*)\s*,\s*(?<g>\d*\.?\d*)\s*,\s*(?<b>\d*\.?\d*)\s*\)/;

    const groups = regex.exec(rgb)?.groups ?? {};

    const [r, g, b] = [Number.parseFloat(groups.r), Number.parseFloat(groups.g), Number.parseFloat(groups.b)];

    return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }

  static fromHex(hex: string) {
    let raw = hex.replace(/^#/, "");

    // Check if the hex color is in the short form (e.g., #FFF) and convert it to the long form (e.g., #FFFFFF)
    if (raw.length === 3) {
      raw = raw
        .split("")
        .map((char) => char + char)
        .join("");
    }

    // Parse the r, g, b values
    const [r, g, b] = [
      Number.parseInt(raw.substring(0, 2), 16),
      Number.parseInt(raw.substring(2, 4), 16),
      Number.parseInt(raw.substring(4, 6), 16),
    ];

    return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof RGB255Base>) => this)(
      this.r,
      this.g,
      this.b,
      this.a
    );
  }

  public equals(comparator: typeof this): boolean {
    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    if (this.a === 255) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    return `rgba(${this.r}, ${this.g}, ${this.b}, ${round(this.a, 2)})`;
  }

  public toHex() {
    const [r, g, b, a] = [
      this.r.toString(16).toUpperCase().padStart(2, "0"),
      this.g.toString(16).toUpperCase().padStart(2, "0"),
      this.b.toString(16).toUpperCase().padStart(2, "0"),
      this.a.toString(16).toUpperCase().padStart(2, "0"),
    ];

    if (a === "FF") {
      return `#${r}${g}${b}`;
    }

    return `#${r}${g}${b}${a}`;
  }

  public toNumeric() {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  // TODO: Temporary
  public toArray() {
    return [this.r, this.g, this.b, this.a];
  }
}

export class RGB255 extends RGB255Base {
  static sum(...rgbs: RGB255[]): RGB255 {
    const per = 1 / rgbs.length;

    let [r, g, b] = [0, 0, 0];

    for (const rgb of rgbs) {
      r += rgb.r * per;
      g += rgb.g * per;
      b += rgb.b * per;
    }

    return new RGB255(r, g, b);
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
