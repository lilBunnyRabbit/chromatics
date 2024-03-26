import { clamp, round } from "../../utils";
import { HSL } from "./HSL";
import { HSV } from "./HSV";
import { HWB } from "./HWB";
import { RGB } from "../rgb/RGB";
import { HueModel } from "./HueModel";

class HSIBase extends Float32Array {
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

  public get i() {
    return this[2];
  }

  public set i(i: number) {
    this[2] = clamp(i, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param i - [0, 1]
   */
  constructor(h: number, s: number, i: number) {
    super(3);

    this.h = h;
    this.s = s;
    this.i = i;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof HSIBase>) => this)(
      this.h,
      this.s,
      this.i
    );
  }

  public toString() {
    const [h, s, i] = [round(this.h, 2), round(this.s * 100, 2), round(this.i * 100, 2)];

    return `hsi(${h}deg ${s}% ${i}%)`;
  }
}

class HSIConversions extends HSIBase {
  public toRGB(): RGB {
    const hue = this.h / 60;

    const z = 1 - Math.abs((hue % 2) - 1);
    const chroma = (3 * this.i * this.s) / (1 + z);
    const interChroma = chroma * z;
    const offset = this.i * (1 - this.s);

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  }

  public toHSL(): HSL {
    return this.toRGB().toHSL();
  }

  public toHSV(): HSV {
    return this.toRGB().toHSV();
  }

  public toHWB(): HWB {
    return this.toRGB().toHWB();
  }
}

export class HSI extends HSIConversions {}
