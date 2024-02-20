// https://en.wikipedia.org/wiki/RGB_color_spaces
// https://en.wikipedia.org/wiki/RGB_color_model

import type { Color, ColorBase } from "../types";
import { clamp, isArray, isNumber, isObject } from "../utils";
import { CMYK } from "./CMYK";
import { HSL } from "./HSL";
import { HSV } from "./HSV";
import { HWB } from "./HWB";
import { Lab } from "./Lab";
import { XYZ } from "./XYZ";

export type RGBLike = RGB | [r: number, g: number, b: number] | Record<"r" | "g" | "b", number> | string | number;

class RGBBase extends Uint8ClampedArray implements ColorBase {
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

  /**
   * @param r - [0, 255]
   * @param g - [0, 255]
   * @param b - [0, 255]
   */
  constructor(r: number, g: number, b: number) {
    super(3);

    this[0] = r;
    this[1] = g;
    this[2] = b;
  }

  static fromRGB(rgb: RGBLike) {
    if (rgb instanceof RGBBase) {
      return new RGB(rgb.r, rgb.g, rgb.b);
    }

    if (isArray(rgb)) {
      return new RGB(...rgb);
    }

    if (isObject(rgb)) {
      return new RGB(rgb.r, rgb.g, rgb.b);
    }

    if (isNumber(rgb)) {
      const [r, g, b] = [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];

      return new RGB(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
    }

    const regex = /\(\s*(?<r>\d*\.?\d*)\s*,\s*(?<g>\d*\.?\d*)\s*,\s*(?<b>\d*\.?\d*)\s*\)/;

    const groups = regex.exec(rgb)?.groups ?? {};

    const [r, g, b] = [Number.parseFloat(groups.r), Number.parseFloat(groups.g), Number.parseFloat(groups.b)];

    return new RGB(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
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

    return new RGB(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }

  static fromNormalized(r: number, g: number, b: number) {
    return new RGB(r * 255, g * 255, b * 255);
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof RGBBase>) => this)(
      this.r,
      this.g,
      this.b
    );
  }

  public normalize(): [r: number, g: number, b: number] {
    return [this.r / 255, this.g / 255, this.b / 255];
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString(alpha?: number) {
    if (alpha === undefined) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    return `rgba(${this.r}, ${this.g}, ${this.b}, ${clamp(alpha, 0, 1)})`;
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toHex(alpha?: number) {
    const [r, g, b] = [
      this.r.toString(16).toUpperCase().padStart(2, "0"),
      this.g.toString(16).toUpperCase().padStart(2, "0"),
      this.b.toString(16).toUpperCase().padStart(2, "0"),
    ];

    if (alpha === undefined) {
      return `#${r}${g}${b}`;
    }

    const a = Math.round(clamp(alpha, 0, 1) * 255)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    return `#${r}${g}${b}${a}`;
  }

  public toNumeric() {
    return (this.r << 16) + (this.g << 8) + this.b;
  }
}

class RGBConversions extends RGBBase {
  public toCMYK(): CMYK {
    return CMYK.fromRGB(...this.normalize());
  }

  public toHSL(): HSL {
    return HSL.fromRGB(...this.normalize());
  }

  public toHSV(): HSV {
    return HSV.fromRGB(...this.normalize());
  }

  public toHWB(): HWB {
    return HWB.fromRGB(...this.normalize());
  }

  public toXYZ(): XYZ {
    return XYZ.fromRGB(...this.normalize());
  }

  public toLAB(illuminant?: keyof typeof XYZ.Illuminants): Lab {
    return this.toXYZ().toLAB(illuminant);
  }
}

export class RGB extends RGBConversions implements Color {
  static sum(...rgbs: RGB[]): RGB {
    const per = 1 / rgbs.length;

    let [r, g, b] = [0, 0, 0];

    for (const rgb of rgbs) {
      r += rgb.r * per;
      g += rgb.g * per;
      b += rgb.b * per;
    }

    return new RGB(r, g, b);
  }
}
