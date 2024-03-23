import { clamp, round } from "../../utils";
import { HSI } from "./HSI";
import { HSL } from "./HSL";
import { HSV } from "./HSV";
import { RGB } from "../rgb/RGB";

class HWBBase extends Float32Array {
  public get h() {
    return this[0];
  }

  public set h(h: number) {
    this[0] = clamp(h, 0, 360);
  }

  public get w() {
    return this[1];
  }

  public set w(w: number) {
    this[1] = clamp(w, 0, 1);
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = clamp(b, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param w - [0, 1]
   * @param b - [0, 1]
   */
  constructor(h: number, w: number, b: number) {
    super(3);

    this.h = h;
    this.w = w;
    this.b = b;
  }

  public toString() {
    const [h, w, b] = [round(this.h, 2), round(this.w * 100, 2), round(this.b * 100, 2)];

    return `hwb(${h}deg ${w}% ${b}%)`;
  }
}

class HWBConversions extends HWBBase {
  public toRGB(): RGB {
    return this.toHSV().toRGB();
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSL(): HSL {
    return this.toHSV().toHSL();
  }

  public toHSV(): HSV {
    const s = this.b === 1 ? 0 : 1 - this.w / (1 - this.b);
    return new HSV(this.h, s, 1 - this.b);
  }
}

export class HWB extends HWBConversions {}
