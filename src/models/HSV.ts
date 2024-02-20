// https://en.wikipedia.org/wiki/HSL_and_HSV

import { clamp, round } from "../utils";
import { HWB } from "./HWB";
import { RGB } from "./RGB";

class HSVBase extends Float32Array {
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

  public get v() {
    return this[2];
  }

  public set v(v: number) {
    this[2] = clamp(v, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param v - [0, 1]
   */
  constructor(h: number, s: number, v: number) {
    super(3);

    this[0] = h;
    this[1] = s;
    this[2] = v;
  }

  public toString() {
    const [h, s, v] = [round(this.h, 2), round(this.s * 100, 2), round(this.v * 100, 2)];

    return `hsv(${h}deg ${s}% ${v}%)`;
  }
}

class HSVConversions extends HSVBase {
  /**
   * @param r - [0, 1]
   * @param g - [0, 1]
   * @param b - [0, 1]
   */
  static fromRGB(r: number, g: number, b: number): HSV {
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

  public toRGB() {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (this.s === 0) {
      return RGB.fromNormalized(this.v, this.v, this.v);
    }

    let [h, s, v] = [this.h / 60, this.s, this.v];

    if (h === 6) h = 0;

    const i = Math.floor(h);
    const factorial = h - i;

    const p = v * (1 - s);
    const q = v * (1 - s * factorial);
    const t = v * (1 - s * (1 - factorial));

    const rgb: [r: number, g: number, b: number] = (() => {
      switch (i) {
        case 0:
          return [v, t, p];

        case 1:
          return [q, v, p];

        case 2:
          return [p, v, t];

        case 3:
          return [p, q, v];

        case 4:
          return [t, p, v];

        default:
          return [v, p, q];
      }
    })();

    return RGB.fromNormalized(...rgb);
  }

  public toHWB(): HWB {
    return new HWB(this.h, (1 - this.s) * this.v, 1 - this.v);
  }
}

export class HSV extends HSVConversions {}
