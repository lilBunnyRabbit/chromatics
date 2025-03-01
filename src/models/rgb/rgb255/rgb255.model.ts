import { ColorModel, Constructor } from "../../../types";
import { randomInt, round2 } from "../../../utils";
import { RGB255Conversion } from "./rgb255.conversion";

class RGB255Base extends Uint8ClampedArray implements ColorModel {
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

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.r, this.g, this.b, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof RGB255Base)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    if (this.a === 255) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    return `rgba(${this.r}, ${this.g}, ${this.b}, ${round2(this.a / 255)})`;
  }

  public toCSS() {
    return this.toString();
  }

  /**
   * Convert the color to a hexadecimal string.
   * If alpha is 255, the alpha channel is omitted.
   */
  public toHex(): string {
    const hex = (value: number) => value.toString(16).padStart(2, "0");

    if (this.a === 255) {
      return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
    }

    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex(this.a)}`;
  }

  static fromNumeric(value: number) {
    const [r, g, b] = [
      (value >> 16) & 0xff,
      (value >> 8) & 0xff,
      value & 0xff
    ];
    // Use 255 for full opacity
    return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b, 255);
  }
  
  public toNumeric() {
    // Bitwise OR is equivalent to addition here, but more idiomatic.
    return (this.r << 16) | (this.g << 8) | this.b;
  }

  public toArray() {
    return [this.r, this.g, this.b, this.a];
  }
}

export class RGB255 extends RGB255Base {
  private _toProxy?: RGB255Conversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new RGB255Conversion(this);
    }

    return this._toProxy;
  }

  /**
   * Inverts the color.
   */
  public invert() {
    this.r = 255 - this.r;
    this.g = 255 - this.g;
    this.b = 255 - this.b;

    return this;
  }

  static random() {
    return new RGB255(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255));
  }

  // AI
  public grayscale(): RGB255 {
    const gray = Math.round(0.299 * this.r + 0.587 * this.g + 0.114 * this.b);
    this.r = gray;
    this.g = gray;
    this.b = gray;

    return this;
  }

  // Adjust brightness by a scaling factor (e.g. factor > 1 brightens, < 1 darkens)
  public brighten(value: number): RGB255 {
    this.r += value;
    this.g += value;
    this.b += value;

    return this;
  }
}

// // Adjust brightness by a scaling factor (e.g. factor > 1 brightens, < 1 darkens)
// public scaleBrightness(factor: number): RGB255 {
//   const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
//   return new RGB255(clamp(this.r * factor), clamp(this.g * factor), clamp(this.b * factor), this.a);
// }

// // Adjust contrast using a given factor.
// // Factor > 1 increases contrast; factor < 1 reduces contrast.
// public adjustContrast(factor: number): RGB255 {
//   const adjust = (v: number) => Math.min(255, Math.max(0, Math.round((v - 128) * factor + 128)));
//   return new RGB255(adjust(this.r), adjust(this.g), adjust(this.b), this.a);
// }

// // Convert the color to grayscale using a standard luminance formula.
// public grayscale(): RGB255 {
//   const gray = Math.round(0.299 * this.r + 0.587 * this.g + 0.114 * this.b);
//   return new RGB255(gray, gray, gray, this.a);
// }

// // Blend this color with another RGB255 color using a given ratio.
// // ratio = 0 returns this color; ratio = 1 returns the other color.
// public blend(other: RGB255, ratio: number): RGB255 {
//   const invRatio = 1 - ratio;
//   return new RGB255(
//     Math.round(this.r * invRatio + other.r * ratio),
//     Math.round(this.g * invRatio + other.g * ratio),
//     Math.round(this.b * invRatio + other.b * ratio),
//     Math.round(this.a * invRatio + other.a * ratio)
//   );
// }
