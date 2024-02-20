// https://en.wikipedia.org/wiki/HSL_and_HSV
// https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/

import { clamp, round } from "../utils";
import { RGB } from "./RGB";

class HSLBase extends Float32Array {
  public get h() {
    return this[0];
  }

  public set h(h: number) {
    this[0] = clamp(h, 0, 360);
  }

  public get s() {
    return this[1];
  }

  public set s(s: number) {
    this[1] = clamp(s, 0, 1);
  }

  public get l() {
    return this[2];
  }

  public set l(l: number) {
    this[2] = clamp(l, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param l - [0, 1]
   */
  constructor(h: number, s: number, l: number) {
    super(3);

    this[0] = h;
    this[1] = s;
    this[2] = l;
  }

  public toString() {
    const [h, s, l] = [round(this.h, 2), round(this.s * 100, 2), round(this.l * 100, 2)];

    return `hsl(${h}deg ${s}% ${l}%)`;
  }
}

class HSLConversions extends HSLBase {
  // https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/

  /*
   * @param r - [0, 1]
   * @param g - [0, 1]
   * @param b - [0, 1]
   */
  static fromRGB(r: number, g: number, b: number): HSL {
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

  public toRGB() {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (this.s === 0) {
      return RGB.fromNormalized(this.l, this.l, this.l);
    }

    const p = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
    const q = 2 * this.l - p;

    const hueToRgb = (hue: number) => {
      if (hue < 0) hue += 1;
      else if (hue > 1) hue -= 1;

      // test 1 – If 6 x hue is smaller then 1, Red = q + (p – q) x 6 x hue
      if (6 * hue < 1) {
        return q + (p - q) * 6 * hue;
      }

      // test 2 – If 2 x hue is smaller then 1, Red = p
      if (2 * hue < 1) {
        return p;
      }

      // test 3 – If 3 x hue is smaller then 2, Red = q + (p – q) x (0.666 – hue) x 6
      if (3 * hue < 2) {
        return q + (p - q) * (2 / 3 - hue) * 6;
      }

      return q;
    };

    // The next step is to convert the 360 degrees in a circle to 1 by dividing the angle by 360.
    const h = this.h / 360;

    return RGB.fromNormalized(hueToRgb(h + 1 / 3), hueToRgb(h), hueToRgb(h - 1 / 3));
  }
}

export class HSL extends HSLConversions {
  static sum(...hsls: HSL[]): HSL {
    const per = 1 / hsls.length;

    let [h, s, l] = [0, 0, 0];

    for (const hsl of hsls) {
      h += hsl.h * per;
      s += hsl.s * per;
      l += hsl.l * per;
    }

    return new HSL(h, s, l);
  }
}
