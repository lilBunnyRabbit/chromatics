import { ColorModel, Constructor } from "../../../types";
import { round2 } from "../../../utils";
import { YCbCr255Conversion } from "./ycbcr255.conversion";

class YCbCr255Base extends Uint8ClampedArray {
  public get y() {
    return this[0];
  }

  public set y(y: number) {
    this[0] = y;
  }

  public get cb() {
    return this[1];
  }

  public set cb(cb: number) {
    this[1] = cb;
  }

  public get cr() {
    return this[2];
  }

  public set cr(cr: number) {
    this[2] = cr;
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = a;
  }

  /**
   * @param y - [0, 255]
   * @param cb - [0, 255]
   * @param cr - [0, 255]
   * @param a - [0, 255]
   */
  constructor(y: number, cb: number, cr: number, a: number = 255) {
    super(4);

    this.y = y;
    this.cb = cb;
    this.cr = cr;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.y, this.cb, this.cr, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof YCbCr255Base)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  public toString() {
    if (this.a === 255) {
      return `ycbcr(${this.y}, ${this.cb}, ${this.cr})`;
    }

    return `ycbcr(${this.y}, ${this.cb}, ${this.cr}, ${round2(this.a / 255)})`;
  }
}

export class YCbCr255 extends YCbCr255Base implements ColorModel {
  private _toProxy?: YCbCr255Conversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new YCbCr255Conversion(this);
    }

    return this._toProxy;
  }

  public toCSS() {
    return this.to.RGB255().toCSS();
  }
}
