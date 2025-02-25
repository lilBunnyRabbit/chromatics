import { ColorModel, Constructor } from "../../../types";
import { clamp, clamp01, round2 } from "../../../utils";
import { HWBConversion } from "./hwb.conversion";

class HWBBase extends Float32Array implements ColorModel {
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
    this[1] = clamp01(w);
    this.normalize();
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = clamp01(b);
    this.normalize();
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = clamp01(a);
  }

  private normalize() {
    const total = this.w + this.b;
    if (total > 1) {
      this[1] = this.w / total;
      this[2] = this.b / total;
    }
  }

  /**
   * @param h - [0, 360]
   * @param w - [0, 1]
   * @param b - [0, 1]
   * @param a - [0, 1]
   */
  constructor(h: number, w: number, b: number, a: number = 1) {
    super(4);

    this.h = h;
    this.w = w;
    this.b = b;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.h, this.w, this.b, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof HWBBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    const [h, w, b] = [round2(this.h), round2(this.w * 100), round2(this.b * 100)];

    if (this.a === 1) {
      return `hwb(${h}deg ${w}% ${b}%)`;
    }

    return `hwb(${h}deg ${w}% ${b}% / ${round2(this.a * 100)}%)`;
  }

  public toCSS() {
    return this.toString();
  }

  public toArray() {
    return [this.h, this.w, this.b, this.a];
  }
}

export class HWB extends HWBBase {
  private _toProxy?: HWBConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new HWBConversion(this);
    }

    return this._toProxy;
  }
}
