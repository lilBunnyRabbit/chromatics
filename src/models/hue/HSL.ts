import { clamp, round } from "../../utils";
import { RGB } from "../rgb/RGB";
import { HSI } from "./HSI";
import { HSV } from "./HSV";
import { HWB } from "./HWB";
import { HueModel } from "./HueModel";

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

    this.h = h;
    this.s = s;
    this.l = l;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof HSLBase>) => this)(
      this.h,
      this.s,
      this.l
    );
  }

  public toString() {
    const [h, s, l] = [round(this.h, 2), round(this.s * 100, 2), round(this.l * 100, 2)];

    return `hsl(${h}deg ${s}% ${l}%)`;
  }
}

class HSLConversions extends HSLBase {
  public toRGB(): RGB {
    const hue = this.h / 60;

    const chroma = (1 - Math.abs(2 * this.l - 1)) * this.s;
    const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = this.l - chroma / 2;

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSV() {
    const v = this.l + this.s * Math.min(this.l, 1 - this.l);

    return new HSV(this.h, !v ? 0 : 2 * (1 - this.l / v), v);
  }

  public toHWB(): HWB {
    return this.toHSV().toHWB();
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

// Other conversions
/*
  // https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
  public toRGB__Nikolai(): NormalizedRGB {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (!this.s) {
      return new NormalizedRGB(this.l, this.l, this.l);
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

    return new NormalizedRGB(hueToRgb(h + 1 / 3), hueToRgb(h), hueToRgb(h - 1 / 3));
  }

  // https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
  public toRGB__Short(): NormalizedRGB {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (!this.s) {
      return new NormalizedRGB(this.l, this.l, this.l);
    }

    const hueToRgb = (n: number): number => {
      const k = (n + this.h / 30) % 12;
      const a = this.s * Math.min(this.l, 1 - this.l);

      return this.l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };

    return new NormalizedRGB(hueToRgb(0), hueToRgb(8), hueToRgb(4));
  }
*/
