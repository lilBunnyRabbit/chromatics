// https://en.wikipedia.org/wiki/RGB_color_spaces
// https://en.wikipedia.org/wiki/RGB_color_model

import { clamp, round } from "../utils";
import { CMYK } from "./CMYK";
import { HSI } from "./HSI";
import { HSL } from "./HSL";
import { HSV } from "./HSV";
import { HWB } from "./HWB";
import { Lab } from "./Lab";
import { RGB } from "./RGB";
import { XYZ } from "./XYZ";

class NormalizedRGBBase extends Float32Array {
  public get r() {
    return this[0];
  }

  public set r(r: number) {
    this[0] = clamp(r, 0, 1);
  }

  public get g() {
    return this[1];
  }

  public set g(g: number) {
    this[1] = clamp(g, 0, 1);
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = clamp(b, 0, 1);
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

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof NormalizedRGBBase>) => this)(
      this.r,
      this.g,
      this.b
    );
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString(alpha?: number) {
    const [r, g, b] = [round(this.r * 100, 2), round(this.g * 100, 2), round(this.b * 100, 2)];

    if (alpha === undefined) {
      return `rgb(${r}%, ${g}%, ${b}%)`;
    }

    return `rgba(${r}%, ${g}%, ${b}%, ${clamp(alpha, 0, 1)})`;
  }
}

class NormalizedRGBConversions extends NormalizedRGBBase {
  public toUint8(): RGB {
    return new RGB(this.r * 255, this.g * 255, this.b * 255);
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
   *
   */
  public toCMYK(): CMYK {
    const k = 1 - Math.max(this.r, this.g, this.b);
    if (k === 1) {
      return new CMYK(0, 0, 0, k);
    }

    const c = (1 - this.r - k) / (1 - k);
    const m = (1 - this.g - k) / (1 - k);
    const y = (1 - this.b - k) / (1 - k);

    return new CMYK(c, m, y, k);
  }

  private toHueChroma() {
    // Find the minimum and maximum values of R, G and B.
    const min = Math.min(this.r, this.g, this.b);
    const max = Math.max(this.r, this.g, this.b);
    const chroma = max - min;

    let hue = 0;

    // Achromatic
    if (!chroma) {
      return { min, max, chroma, hue };
    }

    /**
     * The Hue formula is depending on what RGB color channel is the max value. The three different formulas are:
     * If Red is max, then Hue = (G - B) / chroma
     * If Green is max, then Hue = 2.0 + (B - R) / chroma
     * If Blue is max, then Hue = 4.0 + (R - G) / chroma
     */
    switch (max) {
      case this.r:
        // because, depending on the RGB values and which component is the maximum,
        // the initial calculation of hue could be negative, and the (g < b ? 6 : 0)
        // adjustment is a way to ensure the hue starts from the correct segment of the color wheel
        // before any final adjustments.
        hue = (this.g - this.b) / chroma + (this.g < this.b ? 6 : 0);
        break;
      case this.g:
        hue = (this.b - this.r) / chroma + 2;
        break;
      case this.b:
        hue = (this.r - this.g) / chroma + 4;
        break;
    }

    /**
     * The Hue value you get needs to be multiplied by 60 to convert it to degrees on the color circle
     * If Hue becomes negative you need to add 360 to, because a circle has 360 degrees.
     */
    hue *= 60;
    // if (hue < 0) hue += 360; // Redundant since we already do (g < b ? 6 : 0)

    return { min, max, chroma, hue };
  }

  public toHSI(): HSI {
    const { hue, chroma, min } = this.toHueChroma();

    // The simplest definition is just the arithmetic mean, i.e. average, of the three components, in the HSI model called intensity (fig. 12a). This is simply the projection of a point onto the neutral axis – the vertical height of a point in our tilted cube. The advantage is that, together with Euclidean-distance calculations of hue and chroma, this representation preserves distances and angles from the geometry of the RGB cube.[23][25]
    const intensity = (this.r + this.g + this.b) / 3;

    // Achromatic
    if (!chroma) {
      return new HSI(0, 0, intensity);
    }

    // The HSI model commonly used for computer vision, which takes H2 as a hue dimension and the component average I ("intensity") as a lightness dimension, does not attempt to "fill" a cylinder by its definition of saturation. Instead of presenting color choice or modification interfaces to end users, the goal of HSI is to facilitate separation of shapes in an image. Saturation is therefore defined in line with the psychometric definition: chroma relative to lightness
    const saturation = !intensity ? 0 : 1 - min / intensity;

    return new HSI(hue, saturation, intensity);
  }

  public toHSL(): HSL {
    const { hue, chroma, min, max } = this.toHueChroma();

    // Now calculate the Luminace value by adding the max and min values and divide by 2.
    const lightness = (min + max) / 2;

    /**
     * The next step is to find the Saturation.
     * If the min and max value are the same, it means that there is no saturation. If all RGB values are equal you have a shade of grey. Depending on how bright it’s somewhere between black and white. If there is no Saturation, we don’t need to calculate the Hue. So we set it to 0 degrees.
     * But in our case min and max are not equal which means there is Saturation.
     */
    // Achromatic
    if (!chroma) {
      return new HSL(0, 0, lightness);
    }

    /**
     * Now we know that there is Saturation we need to do check the level of the Luminance in order to select the correct formula.
     */
    let saturation = 0;
    if (lightness !== 0 && lightness !== 1) {
      saturation = (max - lightness) / Math.min(lightness, 1 - lightness);
    }

    return new HSL(hue, saturation, lightness);
  }

  public toHSV(): HSV {
    const { hue, chroma, max } = this.toHueChroma();

    // Value is the maximum of R, G, B
    const value = max;

    // Achromatic
    if (!chroma) {
      return new HSV(0, 0, value);
    }

    const saturation = chroma / max;

    return new HSV(hue, saturation, value);
  }

  public toHWB(): HWB {
    const { hue, chroma, min, max } = this.toHueChroma();

    const whiteness = min;
    const blackness = 1 - max;

    if (!chroma) {
      return new HWB(0, whiteness, blackness);
    }

    return new HWB(hue, whiteness, blackness);
  }

  // X, Y and Z output refer to a D65/2° standard illuminant.
  public toXYZ(): XYZ {
    const rgb = this.map((value) => {
      if (value > 0.04045) {
        value = ((value + 0.055) / 1.055) ** 2.4;
      } else {
        value /= 12.92;
      }

      return value * 100;
    });

    return new XYZ(
      rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805,
      rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722,
      rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505
    );
  }

  public toLAB(illuminant?: keyof typeof XYZ.Illuminants): Lab {
    return this.toXYZ().toLAB(illuminant);
  }
}

export class NormalizedRGB extends NormalizedRGBConversions {}
