import { Matrix } from "../../utils";
import { RGB255 } from "../rgb";

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

  /**
   * @param y - [0, 255]
   * @param cb - [0, 255]
   * @param cr - [0, 255]
   */
  constructor(y: number, cb: number, cr: number) {
    super(3);

    this.y = y;
    this.cb = cb;
    this.cr = cr;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof YCbCr255Base>) => this)(
      this.y,
      this.cb,
      this.cr
    );
  }
}

class YCbCr255Conversions extends YCbCr255Base {
  private matRGB255 = new Matrix([1, 0, 1.402525], [1, -0.34373, -0.714401], [1, 1.769905, 0.000013]);

  public toRGB255(): RGB255 {
    const rgb = this.matRGB255.dot([this.y, this.cb - 128, this.cr - 128]);
    return new RGB255(rgb[0], rgb[1], rgb[2]);
  }
}

export class YCbCr255 extends YCbCr255Conversions {}
