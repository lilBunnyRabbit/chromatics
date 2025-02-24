import { ColorModel, Constructor } from "../../../types";
import { clamp, clamp01, round2 } from "../../../utils";
import { HSLConversion } from "./hsl.conversion";

class HSLBase extends Float32Array implements ColorModel {
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

  public get l() {
    return this[2];
  }

  public set l(l: number) {
    this[2] = clamp01(l);
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
   * @param l - [0, 1]
   * @param a - [0, 1]
   */
  constructor(h: number, s: number, l: number, a: number = 1) {
    super(4);

    this.h = h;
    this.s = s;
    this.l = l;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.h, this.s, this.l, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof HSLBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    const [h, s, l] = [round2(this.h), round2(this.s * 100), round2(this.l * 100)];

    if (this.a === 1) {
      return `hsl(${h}deg ${s}% ${l}%)`;
    }

    return `hsl(${h}deg ${s}% ${l}% / ${round2(this.a * 100)}%)`;
  }

  public toCSS() {
    return this.toString();
  }

  public toArray() {
    return [this.h, this.s, this.l, this.a];
  }
}

export class HSL extends HSLBase implements ColorModel {
  private _toProxy?: HSLConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new HSLConversion(this);
    }

    return this._toProxy;
  }
}
