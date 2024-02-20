// https://en.wikipedia.org/wiki/HSL_and_HSV

import { clamp, round } from "../utils";
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

    return `hsv(${h}, ${s}%, ${v}%)`;
  }
}

class HSVConversions extends HSVBase {
  public toRGB() {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (this.s === 0) {
      const v = this.v * 255;
      return new RGB(v, v, v);
    }

    let [h, s, v] = [this.h / 60, this.s, this.v];

    if (h === 6) h = 0;

    const i = Math.floor(h);
    const factorial = h - i;

    const p = v * (1 - s);
    const q = v * (1 - s * factorial);
    const t = v * (1 - s * (1 - factorial));

    const [r, g, b] = (() => {
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

    return new RGB(r * 255, g * 255, b * 255);
  }
}

export class HSV extends HSVConversions {}
