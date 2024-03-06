// https://en.wikipedia.org/wiki/HSL_and_HSV

import { clamp, round } from "../utils";
import { HSI } from "./HSI";
import { HSL } from "./HSL";
import { HWB } from "./HWB";
import { NormalizedRGB } from "./NormalizedRGB";
import { HueModel } from "./helpers/HueModel";

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
  public toRGB(): NormalizedRGB {
    const hue = this.h / 60;

    const chroma = this.v * this.s;
    const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = this.v - chroma;

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSL() {
    const l = this.v * (1 - this.s / 2);
    const s = l === 0 || l === 1 ? 0 : (this.v - l) / Math.min(l, 1 - l);

    return new HSL(this.h, s, l);
  }

  public toHWB(): HWB {
    return new HWB(this.h, (1 - this.s) * this.v, 1 - this.v);
  }
}

export class HSV extends HSVConversions {}

// Other conversions
/*
  public toRGB__OLD(): NormalizedRGB {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (!this.s) {
      return new NormalizedRGB(this.v, this.v, this.v);
    }

    const [h, s, v] = [this.h / 60, this.s, this.v];

    const i = Math.floor(h);
    const factorial = h - i;

    const p = v * (1 - s);
    const q = v * (1 - s * factorial);
    const t = v * (1 - s * (1 - factorial));

    const rgb: [r: number, g: number, b: number] = (() => {
      switch (i) {
        case 6:
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

    return new NormalizedRGB(...rgb);
  }
*/