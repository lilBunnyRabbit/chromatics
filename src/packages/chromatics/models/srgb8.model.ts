import { type ColorModel, type ColorModelConstructor, type Constructor } from "../utils/types";
import { round2 } from "../utils/math";
import registry from "../conversions";

export class Srgb8 implements ColorModel {
  static ref = Symbol("srgb8");

  private channels: Uint8ClampedArray;

  public get r() {
    return this.channels[0];
  }

  public set r(r: number) {
    this.channels[0] = r;
  }

  public get g() {
    return this.channels[1];
  }

  public set g(g: number) {
    this.channels[1] = g;
  }

  public get b() {
    return this.channels[2];
  }

  public set b(b: number) {
    this.channels[2] = b;
  }

  public get a() {
    return this.channels[3];
  }

  public set a(a: number) {
    this.channels[3] = a;
  }

  /**
   * @param r - [0, 255]
   * @param g - [0, 255]
   * @param b - [0, 255]
   * @param a - [0, 255]
   */
  constructor(r: number, g: number, b: number, a: number = 255) {
    this.channels = new Uint8ClampedArray([r, g, b, a]);
  }

  static from(model: ColorModel) {
    return registry.get(this, model)(model);
  }

  public to(model: ColorModelConstructor) {
    return registry.get(this, model)(this);
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.r, this.g, this.b, this.a);
  }

  public toString() {
    if (this.a === 255) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    return `rgba(${this.r}, ${this.g}, ${this.b}, ${round2(this.a / 255)})`;
  }
}
