// https://en.wikipedia.org/wiki/RGB_color_spaces
// https://en.wikipedia.org/wiki/RGB_color_model

import type { Color, ColorBase, ColorConversions } from "../types";
import { clamp, isArray, isNumber, isObject } from "../utils";
import { CMYK } from "./CMYK";
import { HSL } from "./HSL";
import { XYZ, illuminants } from "./XYZ";
import { HSV } from "./HSV";

export type RGBLike = [r: number, g: number, b: number] | Record<"r" | "g" | "b", number> | string | number;

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

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof RGBBase>) => this)(
      this.r,
      this.g,
      this.b
    );
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

class RGBConversions extends RGBBase implements ColorConversions {
  public toRGB(): RGB {
    return this;
  }

  /**
   * Converts the current RGB color instance to a CMYK color format.
   *
   * Steps:
   * 1. Normalize the RGB values (r, g, b) to the range of 0 to 1 by dividing each by 255.
   *    - This is done to convert the typical color representation from a 0-255 range to a 0-1 range, making it easier to work with in calculations.
   *
   * 2. Calculate the black (K) component of the CMYK color model.
   *    - Formula for K: K = 1 - max(R, G, B)
   *    - The value of K is the inverse of the maximum normalized RGB value. This represents the black component necessary to accurately reproduce the color without using pure black.
   *
   * 3. Calculate the cyan (C), magenta (M), and yellow (Y) components.
   *    - Formula for C: C = (1 - R - K) / (1 - K)
   *    - Formula for M: M = (1 - G - K) / (1 - K)
   *    - Formula for Y: Y = (1 - B - K) / (1 - K)
   *    - These formulas calculate each color component's contribution to the final color, adjusted for the amount of black (K) calculated in the previous step. The formulas account for the subtractive color model used in CMYK, where colors are created by subtracting light from white.
   *
   * 4. Return a new CMYK object with the calculated C, M, Y, and K values.
   *    - This step creates a new CMYK color object, which can be used in contexts where the CMYK color model is required, such as printing.
   */
  public toCMYK(): CMYK {
    const [r, g, b] = [this.r / 255, this.g / 255, this.b / 255];

    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
      return new CMYK(0, 0, 0, k);
    }

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return new CMYK(c, m, y, k);
  }

  // https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
  public toHSL(): HSL {
    // Convert the RGB values to the range 0-1, this can be done by dividing the value by 255 for 8-bit color depth
    const [r, g, b] = [this.r / 255, this.g / 255, this.b / 255];

    // Find the minimum and maximum values of R, G and B.
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;

    // Now calculate the Luminace value by adding the max and min values and divide by 2.
    const l = (min + max) / 2;

    /**
     * The next step is to find the Saturation.
     * If the min and max value are the same, it means that there is no saturation. If all RGB values are equal you have a shade of grey. Depending on how bright it’s somewhere between black and white. If there is no Saturation, we don’t need to calculate the Hue. So we set it to 0 degrees.
     * But in our case min and max are not equal which means there is Saturation.
     */
    // Achromatic
    if (delta === 0) {
      return new HSL(0, 0, l);
    }

    /**
     * Now we know that there is Saturation we need to do check the level of the Luminance in order to select the correct formula.
     * If Luminance is less or equal to 0.5, then Saturation = (max-min)/(max+min)
     * If Luminance is bigger then 0.5. then Saturation = ( max-min)/(2.0-max-min)
     */
    const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    /**
     * The Hue formula is depending on what RGB color channel is the max value. The three different formulas are:
     * If Red is max, then Hue = (G-B)/(max-min)
     * If Green is max, then Hue = 2.0 + (B-R)/(max-min)
     * If Blue is max, then Hue = 4.0 + (R-G)/(max-min)
     */
    let h = 0;
    switch (max) {
      case r:
        h = (g - b) / delta;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    /**
     * The Hue value you get needs to be multiplied by 60 to convert it to degrees on the color circle
     * If Hue becomes negative you need to add 360 to, because a circle has 360 degrees.
     */
    h *= 60;
    if (h < 0) h += 360;

    return new HSL(h, s, l);
  }

  // X, Y and Z output refer to a D65/2° standard illuminant.
  public toXYZ(illuminant: keyof typeof illuminants = "D65") {
    const [r, g, b] = this.map((channel) => {
      let value = channel / 255;

      if (value > 0.04045) {
        value = ((value + 0.055) / 1.055) ** 2.4;
      } else {
        value /= 12.92;
      }

      return value * 100;
    });

    return new XYZ(
      r * 0.4124 + g * 0.3576 + b * 0.1805,
      r * 0.2126 + g * 0.7152 + b * 0.0722,
      r * 0.0193 + g * 0.1192 + b * 0.9505,
      illuminant
    );
  }

  public toLAB(illuminant: keyof typeof illuminants = "D65") {
    return this.toXYZ(illuminant).toLAB();
  }

  public toHSV(): HSV {
    // Convert RGB to the range 0-1
    const [r, g, b] = [this.r / 255, this.g / 255, this.b / 255];

    // Find the minimum and maximum values of R, G and B.
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;

    // Value is the maximum of R, G, B
    const v = max;

    if (delta === 0) {
      return new HSV(0, 0, v);
    }

    const s = delta / max;

    let h = 0;
    switch (max) {
      case r:
        // because, depending on the RGB values and which component is the maximum, the initial calculation of hue could be negative, and the (g < b ? 6 : 0) adjustment is a way to ensure the hue starts from the correct segment of the color wheel before any final adjustments.
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    /**
     * The Hue value you get needs to be multiplied by 60 to convert it to degrees on the color circle
     * If Hue becomes negative you need to add 360 to, because a circle has 360 degrees.
     */
    h *= 60;
    if (h < 0) h += 360;

    return new HSV(h, s, v);
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
