import { ColorModel, Constructor } from "../../../types";
import { clamp, clamp01, round2 } from "../../../utils";
import { HSIConversion } from "./hsi.conversion";

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
    this[1] = clamp01(s);
  }

  public get i() {
    return this[2];
  }

  public set i(i: number) {
    this[2] = clamp01(i);
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = clamp01(a);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param i - [0, 1]
   * @param a - [0, 1]
   */
  constructor(h: number, s: number, i: number, a: number = 1) {
    super(4);

    this.h = h;
    this.s = s;
    this.i = i;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.h, this.s, this.i, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof HSIBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    const [h, s, i] = [round2(this.h), round2(this.s * 100), round2(this.i * 100)];

    if (this.a === 1) {
      return `hsi(${h}deg ${s}% ${i}%)`;
    }

    return `hsi(${h}deg ${s}% ${i}% / ${round2(this.a * 100)}%)`;
  }

  public toArray() {
    return [this.h, this.s, this.i, this.a];
  }
}

export class HSI extends HSIBase implements ColorModel {
  private _toProxy?: HSIConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new HSIConversion(this);
    }

    return this._toProxy;
  }

  public toCSS() {
    return this.to.RGB().toCSS();
  }
}
