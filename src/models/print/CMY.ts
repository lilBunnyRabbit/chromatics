import { clamp, round } from "../../utils";
import { RGB } from "../rgb/RGB";
import { CMYK } from "./CMYK";

class CMYBase extends Float32Array {
  public get c() {
    return this[0];
  }

  public set c(c: number) {
    this[0] = clamp(c, 0, 1);
  }

  public get m() {
    return this[1];
  }

  public set m(m: number) {
    this[1] = clamp(m, 0, 1);
  }

  public get y() {
    return this[2];
  }

  public set y(y: number) {
    this[2] = clamp(y, 0, 1);
  }

  /**
   * @param c - [0, 1]
   * @param m - [0, 1]
   * @param y - [0, 1]
   */
  constructor(c: number, m: number, y: number) {
    super(3);

    this.c = c;
    this.m = m;
    this.y = y;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof CMYBase>) => this)(
      this.c,
      this.m,
      this.y
    );
  }

  public toString() {
    const [c, m, y] = [round(this.c * 100, 2), round(this.m * 100, 2), round(this.y * 100, 2)];

    return `cmy(${c}%, ${m}%, ${y}%)`;
  }
}

class CMYConversions extends CMYBase {
  public toRGB(): RGB {
    return new RGB(1 - this.c, 1 - this.m, 1 - this.y);
  }

  public toCMYK(): CMYK {
    const k = Math.min(this.c, this.m, this.y);
    return new CMYK(this.c - k, this.m - k, this.y - k, k);
  }
}

export class CMY extends CMYConversions {
  static sum(...cmyks: CMY[]): CMY {
    const per = 1 / cmyks.length;

    let [c, m, y] = [0, 0, 0];

    for (const cmyk of cmyks) {
      c += cmyk.c * per;
      m += cmyk.m * per;
      y += cmyk.y * per;
    }

    return new CMY(c, m, y);
  }
}
