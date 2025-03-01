import { ColorModel, Constructor } from "../../../types";
import { clamp01, round2 } from "../../../utils";
import { XYZConversion } from "./xyz.conversion";

// TODO: Not perfect?
class XYZBase extends Float32Array implements ColorModel {
  public get x() {
    return this[0];
  }

  public set x(x: number) {
    this[0] = x;
  }

  public get y() {
    return this[1];
  }

  public set y(y: number) {
    this[1] = y;
  }

  public get z() {
    return this[2];
  }

  public set z(z: number) {
    this[2] = z;
  }

  public get a() {
    return this[3];
  }

  public set a(a: number) {
    this[3] = clamp01(a);
  }

  /**
   * @param x - [0, 1]
   * @param y - [0, 1]
   * @param z - [0, 1]
   * @param a - [0, 1]
   */
  constructor(x: number, y: number, z: number, a: number = 1) {
    super(4);

    this.x = x;
    this.y = y;
    this.z = z;
    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.x, this.y, this.z, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof XYZBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString() {
    const [x, y, z] = [round2(this.x), round2(this.y), round2(this.z)];

    if (this.a === 1) {
      return `color(xyz-d65 ${x} ${y} ${z})`;
    }

    return `color(xyz-d65 ${x} ${y} ${z} / ${round2(this.a)})`;
  }

  public toCSS() {
    return this.toString();
  }

  public toArray() {
    return [this.x, this.y, this.z, this.a];
  }

  // public toString(illuminant?: keyof typeof XYZ.Illuminants) {
  //   if (!illuminant) {
  //     return `color(xyz ${round(this.x, 4)} ${round(this.y, 4)} ${round(this.z, 4)})`;
  //   }

  //   // Observer= 2°, Illuminant= D65
  //   const references = XYZ.getReferences(illuminant);

  //   const [x, y, z] = [
  //     round(this.x / references[0], 4),
  //     round(this.y / references[1], 4),
  //     round(this.z / references[2], 4),
  //   ];

  //   let type = "xyz";
  //   if (illuminant === "D50") type += "-d50";
  //   else if (illuminant === "D65") type += "-d65";

  //   return `color(${type} ${x} ${y} ${z})`;
  // }
}

export class XYZ extends XYZBase {
  private _toProxy?: XYZConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new XYZConversion(this);
    }

    return this._toProxy;
  }
}
