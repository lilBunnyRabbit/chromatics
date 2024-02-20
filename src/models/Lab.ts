// https://en.wikipedia.org/wiki/CIELAB_color_space

import { clamp, round } from "../utils";
import type { CMYK } from "./CMYK";
import type { HSL } from "./HSL";
import type { RGB } from "./RGB";
import { XYZ, illuminants, type XYZIlluminant } from "./XYZ";

class LabBase extends Float32Array {
  public get l() {
    return this[0];
  }

  public set l(l: number) {
    this[0] = clamp(l, 0, 100);
  }

  public get a() {
    return this[1];
  }

  public set a(a: number) {
    this[1] = a;
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = b;
  }

  public get references(): XYZIlluminant {
    return illuminants[this.illuminant] ?? illuminants.D65;
  }

  /**
   * @param l - [0, 100]
   * @param a
   * @param b
   */
  constructor(l: number, a: number, b: number, readonly illuminant: keyof typeof illuminants) {
    super(3);

    this[0] = l;
    this[1] = a;
    this[2] = b;
  }

  public toString(): string {
    return `lab(${round(this.l, 4)} ${round(this.a, 4)} ${round(this.b, 4)})`;
  }
}

class LabConversions extends LabBase {
  public toXYZ(): XYZ {
    const references = this.references;

    const y = (this.l + 16) / 116;
    const x = this.a / 500 + y;
    const z = y - this.b / 200;

    const calibrate = (value: number) => {
      const value3 = value ** 3;
      if (value3 > 0.008856) {
        return value3;
      }

      return (value - 16 / 116) / 7.787;
    };

    return new XYZ(
      calibrate(x) * references[0],
      calibrate(y) * references[1],
      calibrate(z) * references[2],
      this.illuminant
    );
  }

  public toRGB(): RGB {
    return this.toXYZ().toRGB();
  }

  // TODO
  public toHex() {
    return this.toRGB().toHex();
  }

  // TODO
  public toHSL(): HSL {
    return this.toRGB().toHSL();
  }

  // TODO
  public toCMYK(): CMYK {
    return this.toRGB().toCMYK();
  }
}

export class Lab extends LabConversions {
  static sum(...labs: Lab[]): Lab {
    const per = 1 / labs.length;

    let [l, a, b] = [0, 0, 0];

    for (const lab of labs) {
      l += lab.l * per;
      a += lab.a * per;
      b += lab.b * per;
    }

    return new Lab(l, a, b, labs[0].illuminant);
  }
}
