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

/**
 * @deprecated
 */
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
