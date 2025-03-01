import { ColorModel, Constructor } from "../../../types";
import { clamp01, randomFloat, round2 } from "../../../utils";
import { LinearRGBConversion } from "./linear-rgb.conversion";

class LinearRGBBase extends Float32Array implements ColorModel {
  public get r() {
    return this[0];
  }

  public set r(r: number) {
    this[0] = clamp01(r);
  }

  public get g() {
    return this[1];
  }

  public set g(g: number) {
    this[1] = clamp01(g);
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = clamp01(b);
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = clamp01(a);
  }

  /**
   * @param r - [0, 1]
   * @param g - [0, 1]
   * @param b - [0, 1]
   * @param a - [0, 1]
   */
  constructor(r: number, g: number, b: number, a: number = 1) {
    super(4);

    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.r, this.g, this.b, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof LinearRGBBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString() {
    const [r, g, b] = [round2(this.r), round2(this.g), round2(this.b)];

    if (this.a === 1) {
      return `color(srgb-linear ${r} ${g} ${b})`;
    }

    return `color(srgb-linear ${r} ${g} ${b} / ${round2(this.a)})`;
  }

  public toCSS() {
    return this.toString();
  }

  public toArray() {
    return [this.r, this.g, this.b, this.a];
  }
}

export class LinearRGB extends LinearRGBBase {
  private _toProxy?: LinearRGBConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new LinearRGBConversion(this);
    }

    return this._toProxy;
  }
}
