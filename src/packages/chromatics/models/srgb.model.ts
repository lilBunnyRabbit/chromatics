import { type ColorModel, type Constructor, type ColorModelConstructor } from "../utils/types";
import { clamp01, round2 } from "../utils/math";
import registry from "../conversion-registry";
import { ColorModelBase } from "../utils/base";

export class Srgb extends ColorModelBase {
  static ref = Symbol("srgb");

  private channels: Float32Array;

  public get r() {
    return this.channels[0];
  }

  public set r(r: number) {
    this.channels[0] = clamp01(r);
  }

  public get g() {
    return this.channels[1];
  }

  public set g(g: number) {
    this.channels[1] = clamp01(g);
  }

  public get b() {
    return this.channels[2];
  }

  public set b(b: number) {
    this.channels[2] = clamp01(b);
  }

  public get a() {
    return this.channels[3];
  }

  public set a(a: number) {
    this.channels[3] = clamp01(a);
  }

  /**
   * @param r - [0, 1]
   * @param g - [0, 1]
   * @param b - [0, 1]
   * @param a - [0, 1]
   */
  constructor(r: number, g: number, b: number, a: number = 1) {
    super();

    // Handling RGB values above 1:
    // -----------------------------
    // Avoiding weird colours - see the comment of Giacomo Catenazzi.
    // Find the maximum between R, G, B, and if the value is above 1, divide the 3 channels with such numbers.
    // normalizing the RGB values if any of them fall outside the [0, 1] range
    const max = Math.max(r, g, b);

    if (max > 1) {
      this.channels = new Float32Array([r / max, g / max, b / max, a]);

      // TODO: Temporary Message
      // console.warn("Normalized RGB!", { r, g, b }, "to", { r: this.r, g: this.g, b: this.b });
    } else {
      this.channels = new Float32Array([r, g, b, a]);
    }
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.r, this.g, this.b, this.a);
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString() {
    const [r, g, b] = [round2(this.r * 100), round2(this.g * 100), round2(this.b * 100)];

    if (this.a === 1) {
      return `rgb(${r}%, ${g}%, ${b}%)`;
    }

    return `rgba(${r}%, ${g}%, ${b}%, ${round2(this.a * 100)}%)`;
  }
}
