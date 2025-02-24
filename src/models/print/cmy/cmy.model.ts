import { ColorModel, Constructor } from "../../../types";
import { clamp, clamp01, round2 } from "../../../utils";
import { CMYConversion } from "./cmy.conversion";

class CMYBase extends Float32Array {
  public get c() {
    return this[0];
  }

  public set c(c: number) {
    this[0] = clamp01(c);
  }

  public get m() {
    return this[1];
  }

  public set m(m: number) {
    this[1] = clamp01(m);
  }

  public get y() {
    return this[2];
  }

  public set y(y: number) {
    this[2] = clamp01(y);
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = a;
  }

  /**
   * @param c - [0, 1]
   * @param m - [0, 1]
   * @param y - [0, 1]
   * @param a - [0, 1]
   */
  constructor(c: number, m: number, y: number, a: number = 1) {
    super(4);

    this.c = c;
    this.m = m;
    this.y = y;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.c, this.m, this.y, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof CMYBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    const [c, m, y] = [round2(this.c * 100), round2(this.m * 100), round2(this.y * 100)];

    if (this.a === 1) {
      return `cmy(${c}%, ${m}%, ${y}%)`;
    }

    return `cmy(${c}% ${m}% ${y}% / ${round2(this.a * 100)}%)`;
  }

  public toArray() {
    return [this.c, this.m, this.y, this.a];
  }
}

export class CMY extends CMYBase implements ColorModel {
  private _toProxy?: CMYConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new CMYConversion(this);
    }

    return this._toProxy;
  }

  public toCSS() {
    return this.to.RGB().toCSS();
  }
}
