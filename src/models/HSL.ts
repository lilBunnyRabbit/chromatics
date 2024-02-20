// https://en.wikipedia.org/wiki/HSL_and_HSV

import { clamp, round } from "../utils";
import type { CMYK } from "./CMYK";
import { RGB } from "./RGB";
import type { XYZ, illuminants } from "./XYZ";

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

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}

class HSLConversions extends HSLBase {
  public toRGB() {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (this.s === 0) {
      const v = this.l * 255;
      return new RGB(v, v, v);
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

    // Convert them to 8-bit by multiply them with 255 and we are done
    return new RGB(hueToRgb(h + 1 / 3) * 255, hueToRgb(h) * 255, hueToRgb(h - 1 / 3) * 255);
  }

  // TODO
  public toHex() {
    return this.toRGB().toHex();
  }

  // TODO
  public toCMYK(): CMYK {
    return this.toRGB().toCMYK();
  }

  // TODO
  public toXYZ(illuminant: keyof typeof illuminants = "D65"): XYZ {
    return this.toRGB().toXYZ(illuminant);
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
