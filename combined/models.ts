// \src\models\hue\HSI.ts
import { clamp, round } from "../../utils";
import { HSL } from "./HSL";
import { HSV } from "./HSV";
import { HWB } from "./HWB";
import { RGB } from "../rgb/RGB";
import { HueModel } from "./HueModel";

class HSIBase extends Float32Array {
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
    this[1] = clamp(s, 0, 1);
  }

  public get i() {
    return this[2];
  }

  public set i(i: number) {
    this[2] = clamp(i, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param i - [0, 1]
   */
  constructor(h: number, s: number, i: number) {
    super(3);

    this.h = h;
    this.s = s;
    this.i = i;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof HSIBase>) => this)(
      this.h,
      this.s,
      this.i
    );
  }

  public toString() {
    const [h, s, i] = [round(this.h, 2), round(this.s * 100, 2), round(this.i * 100, 2)];

    return `hsi(${h}deg ${s}% ${i}%)`;
  }
}

class HSIConversions extends HSIBase {
  public toRGB(): RGB {
    const hue = this.h / 60;

    const z = 1 - Math.abs((hue % 2) - 1);
    const chroma = (3 * this.i * this.s) / (1 + z);
    const interChroma = chroma * z;
    const offset = this.i * (1 - this.s);

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  }

  public toHSL(): HSL {
    return this.toRGB().toHSL();
  }

  public toHSV(): HSV {
    return this.toRGB().toHSV();
  }

  public toHWB(): HWB {
    return this.toRGB().toHWB();
  }
}

export class HSI extends HSIConversions {}


// \src\models\hue\HSL.ts
import { clamp, round } from "../../utils";
import { RGB } from "../rgb/RGB";
import { HSI } from "./HSI";
import { HSV } from "./HSV";
import { HWB } from "./HWB";
import { HueModel } from "./HueModel";

class HSLBase extends Float32Array {
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
    this[1] = clamp(s, 0, 1);
  }

  public get l() {
    return this[2];
  }

  public set l(l: number) {
    this[2] = clamp(l, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param l - [0, 1]
   */
  constructor(h: number, s: number, l: number) {
    super(3);

    this.h = h;
    this.s = s;
    this.l = l;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof HSLBase>) => this)(
      this.h,
      this.s,
      this.l
    );
  }

  public toString() {
    const [h, s, l] = [round(this.h, 2), round(this.s * 100, 2), round(this.l * 100, 2)];

    return `hsl(${h}deg ${s}% ${l}%)`;
  }
}

class HSLConversions extends HSLBase {
  public toRGB(): RGB {
    const hue = this.h / 60;

    const chroma = (1 - Math.abs(2 * this.l - 1)) * this.s;
    const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = this.l - chroma / 2;

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSV() {
    const v = this.l + this.s * Math.min(this.l, 1 - this.l);

    return new HSV(this.h, !v ? 0 : 2 * (1 - this.l / v), v);
  }

  public toHWB(): HWB {
    return this.toHSV().toHWB();
  }
}

export class HSL extends HSLConversions {
  static sum(...hsls: HSL[]): HSL {
    const per = 1 / hsls.length;

    let [h, s, l] = [0, 0, 0];

    for (const hsl of hsls) {
      h += hsl.h * per;
      s += hsl.s * per;
      l += hsl.l * per;
    }

    return new HSL(h, s, l);
  }
}

// Other conversions
/*
  // https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
  public toRGB__Nikolai(): NormalizedRGB {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (!this.s) {
      return new NormalizedRGB(this.l, this.l, this.l);
    }

    const p = this.l < 0.5 ? this.l * (1 + this.s) : this.l + this.s - this.l * this.s;
    const q = 2 * this.l - p;

    const hueToRgb = (hue: number) => {
      if (hue < 0) hue += 1;
      else if (hue > 1) hue -= 1;

      // test 1 – If 6 x hue is smaller then 1, Red = q + (p – q) x 6 x hue
      if (6 * hue < 1) {
        return q + (p - q) * 6 * hue;
      }

      // test 2 – If 2 x hue is smaller then 1, Red = p
      if (2 * hue < 1) {
        return p;
      }

      // test 3 – If 3 x hue is smaller then 2, Red = q + (p – q) x (0.666 – hue) x 6
      if (3 * hue < 2) {
        return q + (p - q) * (2 / 3 - hue) * 6;
      }

      return q;
    };

    // The next step is to convert the 360 degrees in a circle to 1 by dividing the angle by 360.
    const h = this.h / 360;

    return new NormalizedRGB(hueToRgb(h + 1 / 3), hueToRgb(h), hueToRgb(h - 1 / 3));
  }

  // https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
  public toRGB__Short(): NormalizedRGB {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (!this.s) {
      return new NormalizedRGB(this.l, this.l, this.l);
    }

    const hueToRgb = (n: number): number => {
      const k = (n + this.h / 30) % 12;
      const a = this.s * Math.min(this.l, 1 - this.l);

      return this.l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };

    return new NormalizedRGB(hueToRgb(0), hueToRgb(8), hueToRgb(4));
  }
*/


// \src\models\hue\HSV.ts
import { clamp, round } from "../../utils";
import { HSI } from "./HSI";
import { HSL } from "./HSL";
import { HWB } from "./HWB";
import { RGB } from "../rgb/RGB";
import { HueModel } from "./HueModel";

class HSVBase extends Float32Array {
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
    this[1] = clamp(s, 0, 1);
  }

  public get v() {
    return this[2];
  }

  public set v(v: number) {
    this[2] = clamp(v, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param s - [0, 1]
   * @param v - [0, 1]
   */
  constructor(h: number, s: number, v: number) {
    super(3);

    this.h = h;
    this.s = s;
    this.v = v;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof HSVBase>) => this)(
      this.h,
      this.s,
      this.v
    );
  }

  public toString() {
    const [h, s, v] = [round(this.h, 2), round(this.s * 100, 2), round(this.v * 100, 2)];

    return `hsv(${h}deg ${s}% ${v}%)`;
  }
}

class HSVConversions extends HSVBase {
  public toRGB(): RGB {
    const hue = this.h / 60;

    const chroma = this.v * this.s;
    const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = this.v - chroma;

    return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSL() {
    const l = this.v * (1 - this.s / 2);
    const s = l === 0 || l === 1 ? 0 : (this.v - l) / Math.min(l, 1 - l);

    return new HSL(this.h, s, l);
  }

  public toHWB(): HWB {
    return new HWB(this.h, (1 - this.s) * this.v, 1 - this.v);
  }
}

export class HSV extends HSVConversions {}

// Other conversions
/*
  public toRGB__OLD(): NormalizedRGB {
    // If there is no Saturation it means that it’s a shade of grey. So in that case we just need to convert the Luminance and set R,G and B to that level.F
    if (!this.s) {
      return new NormalizedRGB(this.v, this.v, this.v);
    }

    const [h, s, v] = [this.h / 60, this.s, this.v];

    const i = Math.floor(h);
    const factorial = h - i;

    const p = v * (1 - s);
    const q = v * (1 - s * factorial);
    const t = v * (1 - s * (1 - factorial));

    const rgb: [r: number, g: number, b: number] = (() => {
      switch (i) {
        case 6:
        case 0:
          return [v, t, p];

        case 1:
          return [q, v, p];

        case 2:
          return [p, v, t];

        case 3:
          return [p, q, v];

        case 4:
          return [t, p, v];

        default:
          return [v, p, q];
      }
    })();

    return new NormalizedRGB(...rgb);
  }
*/


// \src\models\hue\HueModel.ts
import { RGB } from "../rgb/RGB";

export class HueModel {
  static rgbToChroma(rgb: RGB) {
    // Find the minimum and maximum values of R, G and B.
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const chroma = max - min;

    let hue = 0;

    // Achromatic
    if (!chroma) {
      return { min, max, chroma, hue };
    }

    /**
     * The Hue formula is depending on what RGB color channel is the max value. The three different formulas are:
     * If Red is max, then Hue = (G - B) / chroma
     * If Green is max, then Hue = 2.0 + (B - R) / chroma
     * If Blue is max, then Hue = 4.0 + (R - G) / chroma
     */
    switch (max) {
      case rgb.r:
        // because, depending on the RGB values and which component is the maximum,
        // the initial calculation of hue could be negative, and the (g < b ? 6 : 0)
        // adjustment is a way to ensure the hue starts from the correct segment of the color wheel
        // before any final adjustments.
        hue = (rgb.g - rgb.b) / chroma + (rgb.g < rgb.b ? 6 : 0);
        break;
      case rgb.g:
        hue = (rgb.b - rgb.r) / chroma + 2;
        break;
      case rgb.b:
        hue = (rgb.r - rgb.g) / chroma + 4;
        break;
    }

    /**
     * The Hue value you get needs to be multiplied by 60 to convert it to degrees on the color circle
     * If Hue becomes negative you need to add 360 to, because a circle has 360 degrees.
     */
    hue *= 60;
    // if (hue < 0) hue += 360; // Redundant since we already do (g < b ? 6 : 0)

    return { min, max, chroma, hue };
  }

  static chromaToRGB(hue: number, chroma: number, interChroma: number, offset: number): RGB {
    const hueInt = Math.floor(hue);

    const c = chroma + offset;
    const x = interChroma + offset;

    // Then we can, again, find a point (R1, G1, B1) along the bottom three faces of the RGB cube,
    // with the same hue and chroma as our color (using the intermediate value X
    // for the second largest component of this color):
    const hueToRgb = (): [r: number, g: number, b: number] => {
      switch (hueInt) {
        case 6:
        case 0:
          return [c, x, offset];

        case 1:
          return [x, c, offset];

        case 2:
          return [offset, c, x];

        case 3:
          return [offset, x, c];

        case 4:
          return [x, offset, c];

        default:
          return [c, offset, x];
      }
    };

    // Finally, we can find R, G, and B by adding the same amount to each component, to match lightness:
    return new RGB(...hueToRgb());
  }
}


// \src\models\hue\HWB.ts
import { clamp, round } from "../../utils";
import { RGB } from "../rgb/RGB";
import { HSI } from "./HSI";
import { HSL } from "./HSL";
import { HSV } from "./HSV";

class HWBBase extends Float32Array {
  public get h() {
    return this[0];
  }

  public set h(h: number) {
    this[0] = clamp(h, 0, 360);
  }

  public get w() {
    return this[1];
  }

  public set w(w: number) {
    this[1] = clamp(w, 0, 1);
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = clamp(b, 0, 1);
  }

  /**
   * @param h - [0, 360]
   * @param w - [0, 1]
   * @param b - [0, 1]
   */
  constructor(h: number, w: number, b: number) {
    super(3);

    this.h = h;
    this.w = w;
    this.b = b;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof HWBBase>) => this)(
      this.h,
      this.w,
      this.b
    );
  }

  public toString() {
    const [h, w, b] = [round(this.h, 2), round(this.w * 100, 2), round(this.b * 100, 2)];

    return `hwb(${h}deg ${w}% ${b}%)`;
  }
}

class HWBConversions extends HWBBase {
  public toRGB(): RGB {
    return this.toHSV().toRGB();
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSL(): HSL {
    return this.toHSV().toHSL();
  }

  public toHSV(): HSV {
    const s = this.b === 1 ? 0 : 1 - this.w / (1 - this.b);
    return new HSV(this.h, s, 1 - this.b);
  }
}

export class HWB extends HWBConversions {}


// \src\models\hue\index.ts
export * from "./HSI";
export * from "./HSL";
export * from "./HSV";
export * from "./HWB";


// \src\models\index.ts
export * from "./hue";
export * from "./perceptual";
export * from "./print";
export * from "./rgb";
export * from "./video";


// \src\models\perceptual\index.ts
export * from "./Lab";
export * from "./XYZ";


// \src\models\perceptual\Lab.ts
import { clamp, round } from "../../utils";
import { XYZ } from "./XYZ";

// TODO: Not perfect?
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

  /**
   * @param l - [0, 100]
   * @param a
   * @param b
   */
  constructor(l: number, a: number, b: number, readonly illuminant: keyof typeof XYZ.Illuminants) {
    super(3);

    this.l = l;
    this.a = a;
    this.b = b;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof LabBase>) => this)(
      this.l,
      this.a,
      this.b,
      this.illuminant
    );
  }

  public toString(): string {
    return `lab(${round(this.l, 4)} ${round(this.a, 4)} ${round(this.b, 4)})`;
  }
}

class LabConversions extends LabBase {
  public toXYZ(): XYZ {
    const references = XYZ.getReferences(this.illuminant);

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

    return new XYZ(calibrate(x) * references[0], calibrate(y) * references[1], calibrate(z) * references[2]);
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


// \src\models\perceptual\XYZ.ts
import { round } from "../../utils";
import { RGB } from "../rgb/RGB";
import { Lab } from "./Lab";

export type XYZReferences = [x2: number, y2: number, z2: number, x10: number, y10: number, z10: number];

// TODO: Not perfect?
class XYZBase extends Float32Array {
  /**
   * Observer	2° (CIE 1931) - x2, y2, z2
   * Observer 10° (CIE 1964) - x10, y10, z10
   */
  static Illuminants = {
    A: [109.85, 100.0, 35.585, 111.144, 100.0, 35.2], // Incandescent/tungsten
    B: [99.0927, 100.0, 85.313, 99.178, 100.0, 84.3493], // Old direct sunlight at noon
    C: [98.074, 100.0, 118.232, 97.285, 100.0, 116.145], // Old daylight
    D50: [96.422, 100.0, 82.521, 96.72, 100.0, 81.427], // ICC profile PCS
    D55: [95.682, 100.0, 92.149, 95.799, 100.0, 90.926], // Mid-morning daylight
    D65: [95.047, 100.0, 108.883, 94.811, 100.0, 107.304], // Daylight, sRGB, Adobe-RGB
    D75: [94.972, 100.0, 122.638, 94.416, 100.0, 120.641], // North sky daylight
    E: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0], // Equal energy
    F1: [92.834, 100.0, 103.665, 94.791, 100.0, 103.191], // Daylight Fluorescent
    F2: [99.187, 100.0, 67.395, 103.28, 100.0, 69.026], // Cool fluorescent
    F3: [103.754, 100.0, 49.861, 108.968, 100.0, 51.965], // White Fluorescent
    F4: [109.147, 100.0, 38.813, 114.961, 100.0, 40.963], // Warm White Fluorescent
    F5: [90.872, 100.0, 98.723, 93.369, 100.0, 98.636], // Daylight Fluorescent
    F6: [97.309, 100.0, 60.191, 102.148, 100.0, 62.074], // Lite White Fluorescent
    F7: [95.044, 100.0, 108.755, 95.792, 100.0, 107.687], // Daylight fluorescent, D65 simulator
    F8: [96.413, 100.0, 82.333, 97.115, 100.0, 81.135], // Sylvania F40, D50 simulator
    F9: [100.365, 100.0, 67.868, 102.116, 100.0, 67.826], // Cool White Fluorescent
    F10: [96.174, 100.0, 81.712, 99.001, 100.0, 83.134], // Ultralume 50, Philips TL85
    F11: [100.966, 100.0, 64.37, 103.866, 100.0, 65.627], // Ultralume 40, Philips TL84
    F12: [108.046, 100.0, 39.228, 111.428, 100.0, 40.353], // Ultralume 30, Philips TL83
  } satisfies Record<string, XYZReferences>;

  static getReferences(illuminant: keyof typeof XYZ.Illuminants = "D65") {
    return XYZ.Illuminants[illuminant] ?? XYZ.Illuminants.D65;
  }

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

  /**
   * @param x - [0, 1]
   * @param y - [0, 1]
   * @param z - [0, 1]
   */
  constructor(x: number, y: number, z: number) {
    super(3);

    this.x = x;
    this.y = y;
    this.z = z;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof XYZBase>) => this)(
      this.x,
      this.y,
      this.z
    );
  }

  public toString(illuminant?: keyof typeof XYZ.Illuminants) {
    if (!illuminant) {
      return `color(xyz ${round(this.x, 4)} ${round(this.y, 4)} ${round(this.z, 4)})`;
    }

    // Observer= 2°, Illuminant= D65
    const references = XYZ.getReferences(illuminant);

    const [x, y, z] = [
      round(this.x / references[0], 4),
      round(this.y / references[1], 4),
      round(this.z / references[2], 4),
    ];

    let type = "xyz";
    if (illuminant === "D50") type += "-d50";
    else if (illuminant === "D65") type += "-d65";

    return `color(${type} ${x} ${y} ${z})`;
  }
}

class XYZConversions extends XYZBase {
  public toRGB(): RGB {
    const [x, y, z] = [this.x / 100, this.y / 100, this.z / 100];

    const rgb = [
      x * 3.2406 + y * -1.5372 + z * -0.4986,
      x * -0.9689 + y * 1.8758 + z * 0.0415,
      x * 0.0557 + y * -0.204 + z * 1.057,
    ].map((value) => {
      if (value > 0.0031308) {
        return 1.055 * value ** (1 / 2.4) - 0.055;
      }

      return 12.92 * value;
    }) as [r: number, g: number, b: number];

    return new RGB(...rgb);
  }

  public toLAB(illuminant: keyof typeof XYZ.Illuminants = "D65"): Lab {
    const references = XYZ.getReferences(illuminant);

    const [x, y, z] = [this.x / references[0], this.y / references[1], this.z / references[2]].map((value) => {
      if (value > 0.008856) {
        return value ** (1 / 3);
      }

      return 7.787 * value + 16 / 116;
    });

    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);

    return new Lab(l, a, b, illuminant);
  }
}

export class XYZ extends XYZConversions {
  static sum(...xyzs: XYZ[]): XYZ {
    const per = 1 / xyzs.length;

    let [x, y, z] = [0, 0, 0];

    for (const xyz of xyzs) {
      x += xyz.x * per;
      y += xyz.y * per;
      z += xyz.z * per;
    }

    return new XYZ(x, y, z);
  }
}


// \src\models\print\CMY.ts
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


// \src\models\print\CMYK.ts
import { clamp, round } from "../../utils";
import { RGB } from "../rgb/RGB";
import { CMY } from "./CMY";

class CMYKBase extends Float32Array {
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

  public get k() {
    return this[3];
  }

  public set k(k: number) {
    this[3] = clamp(k, 0, 1);
  }

  /**
   * @param c - [0, 1]
   * @param m - [0, 1]
   * @param y - [0, 1]
   * @param k - [0, 1]
   */
  constructor(c: number, m: number, y: number, k: number) {
    super(4);

    this.c = c;
    this.m = m;
    this.y = y;
    this.k = k;
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof CMYKBase>) => this)(
      this.c,
      this.m,
      this.y,
      this.k
    );
  }

  public toString() {
    const [c, m, y, k] = [
      round(this.c * 100, 2),
      round(this.m * 100, 2),
      round(this.y * 100, 2),
      round(this.k * 100, 2),
    ];

    return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
  }
}

class CMYConversions extends CMYKBase {
  /**
   * Converts the current CMYK color instance to an RGB color format.
   *
   * Steps:
   * 1. Calculate the Red (R), Green (G), and Blue (B) components from the CMYK values.
   *    - The conversion formulas take into account the CMYK color model's subtractive properties and the RGB color model's additive properties.
   *
   * 2. Calculate the Red (R) component:
   *    - Formula for R: R = 255 * (1 - C) * (1 - K)
   *    - This formula adjusts the cyan (C) and black (K) components to determine the amount of red light present. The calculation involves inverting the subtractive effects of cyan and black on red light, then scaling the result by the maximum RGB value (255).
   *
   * 3. Calculate the Green (G) component:
   *    - Formula for G: G = 255 * (1 - M) * (1 - K)
   *    - Similar to the red component, this formula adjusts the magenta (M) and black (K) components to find the green light's presence, reflecting the subtractive impact of magenta and black on green light.
   *
   * 4. Calculate the Blue (B) component:
   *    - Formula for B: B = 255 * (1 - Y) * (1 - K)
   *    - This formula calculates the blue light's presence by adjusting for the yellow (Y) and black (K) components' subtractive effects on blue light.
   *
   * 5. Return a new RGB object with the calculated R, G, and B values.
   *    - This step creates a new RGB color object with the derived red, green, and blue components, suitable for use in digital media that utilizes the RGB color model.
   */
  public toRGB(): RGB {
    return new RGB((1 - this.c) * (1 - this.k), (1 - this.m) * (1 - this.k), (1 - this.y) * (1 - this.k));
  }

  public toCMY(): CMY {
    return new CMY(this.c + this.k, this.m + this.k, this.y + this.k);
  }
}

export class CMYK extends CMYConversions {
  static sum(...cmyks: CMYK[]): CMYK {
    const per = 1 / cmyks.length;

    let [c, m, y, k] = [0, 0, 0, 0];

    for (const cmyk of cmyks) {
      c += cmyk.c * per;
      m += cmyk.m * per;
      y += cmyk.y * per;
      k += cmyk.k * per;
    }

    return new CMYK(c, m, y, k);
  }
}


// \src\models\print\index.ts
export * from "./CMY";
export * from "./CMYK";


// \src\models\rgb\index.ts
export * from "./RGB";
export * from "./RGB255";


// \src\models\rgb\RGB.ts
import { clamp, round } from "../../utils";
import { CMYK } from "../print/CMYK";
import { HSI } from "../hue/HSI";
import { HSL } from "../hue/HSL";
import { HSV } from "../hue/HSV";
import { HWB } from "../hue/HWB";
import { Lab } from "../perceptual/Lab";
import { RGB255 } from "./RGB255";
import { XYZ } from "../perceptual/XYZ";
import { HueModel } from "../hue/HueModel";
import { CMY } from "../print/CMY";

class RGBBase extends Float32Array {
  public get r() {
    return this[0];
  }

  public set r(r: number) {
    this[0] = clamp(r, 0, 1);
  }

  public get g() {
    return this[1];
  }

  public set g(g: number) {
    this[1] = clamp(g, 0, 1);
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = clamp(b, 0, 1);
  }

  /**
   * @param r - [0, 255]
   * @param g - [0, 255]
   * @param b - [0, 255]
   */
  constructor(r: number, g: number, b: number) {
    super(3);

    // Handling RGB values above 1:
    // -----------------------------
    // Avoiding weird colours - see the comment of Giacomo Catenazzi.
    // Find the maximum between R, G, B, and if the value is above 1, divide the 3 channels with such numbers.
    // normalizing the RGB values if any of them fall outside the [0, 1] range
    const max = Math.max(r, g, b);

    if (max > 1) {
      // TODO: Temporary Message
      console.warn("Normalized RGB!");

      this.r = r / max;
      this.g = g / max;
      this.b = b / max;
    } else {
      this.r = r;
      this.g = g;
      this.b = b;
    }
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof RGBBase>) => this)(
      this.r,
      this.g,
      this.b
    );
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString(alpha?: number) {
    const [r, g, b] = [round(this.r * 100, 2), round(this.g * 100, 2), round(this.b * 100, 2)];

    if (alpha === undefined) {
      return `rgb(${r}%, ${g}%, ${b}%)`;
    }

    return `rgba(${r}%, ${g}%, ${b}%, ${clamp(alpha, 0, 1)})`;
  }
}

class RGBConversions extends RGBBase {
  public toRGB255(): RGB255 {
    return new RGB255(this.r * 255, this.g * 255, this.b * 255);
  }

  public toCMY(): CMY {
    return new CMY(1 - this.r, 1 - this.g, 1 - this.b);
  }

  /**
   * Converts the current RGB color instance to a CMYK color format.
   *
   * Steps:
   * 1. Normalize the RGB values (r, g, b) to the range of 0 to 1 by dividing each by 255.
   *    - This is done to convert the typical color representation from a 0-255 range to a 0-1 range, making it easier to work with in calculations.
   *
   * 2. Calculate the black (K) component of the CMYK color model.
   *    - Formula for K: K = 1 - max(R, G, B)
   *    - The value of K is the inverse of the maximum normalized RGB value. This represents the black component necessary to accurately reproduce the color without using pure black.
   *
   * 3. Calculate the cyan (C), magenta (M), and yellow (Y) components.
   *    - Formula for C: C = (1 - R - K) / (1 - K)
   *    - Formula for M: M = (1 - G - K) / (1 - K)
   *    - Formula for Y: Y = (1 - B - K) / (1 - K)
   *    - These formulas calculate each color component's contribution to the final color, adjusted for the amount of black (K) calculated in the previous step. The formulas account for the subtractive color model used in CMYK, where colors are created by subtracting light from white.
   *
   * 4. Return a new CMYK object with the calculated C, M, Y, and K values.
   *    - This step creates a new CMYK color object, which can be used in contexts where the CMYK color model is required, such as printing.
   *
   */
  public toCMYK(): CMYK {
    const k = 1 - Math.max(this.r, this.g, this.b);
    if (k === 1) {
      return new CMYK(0, 0, 0, k);
    }

    const c = (1 - this.r - k) / (1 - k);
    const m = (1 - this.g - k) / (1 - k);
    const y = (1 - this.b - k) / (1 - k);

    return new CMYK(c, m, y, k);
  }

  public toHSI(): HSI {
    const { hue, chroma, min } = HueModel.rgbToChroma(this);

    // The simplest definition is just the arithmetic mean, i.e. average, of the three components, in the HSI model called intensity (fig. 12a). This is simply the projection of a point onto the neutral axis – the vertical height of a point in our tilted cube. The advantage is that, together with Euclidean-distance calculations of hue and chroma, this representation preserves distances and angles from the geometry of the RGB cube.[23][25]
    const intensity = (this.r + this.g + this.b) / 3;

    // Achromatic
    if (!chroma) {
      return new HSI(0, 0, intensity);
    }

    // The HSI model commonly used for computer vision, which takes H2 as a hue dimension and the component average I ("intensity") as a lightness dimension, does not attempt to "fill" a cylinder by its definition of saturation. Instead of presenting color choice or modification interfaces to end users, the goal of HSI is to facilitate separation of shapes in an image. Saturation is therefore defined in line with the psychometric definition: chroma relative to lightness
    const saturation = !intensity ? 0 : 1 - min / intensity;

    return new HSI(hue, saturation, intensity);
  }

  public toHSL(): HSL {
    const { hue, chroma, min, max } = HueModel.rgbToChroma(this);

    // Now calculate the Luminace value by adding the max and min values and divide by 2.
    const lightness = (min + max) / 2;

    /**
     * The next step is to find the Saturation.
     * If the min and max value are the same, it means that there is no saturation. If all RGB values are equal you have a shade of grey. Depending on how bright it’s somewhere between black and white. If there is no Saturation, we don’t need to calculate the Hue. So we set it to 0 degrees.
     * But in our case min and max are not equal which means there is Saturation.
     */
    // Achromatic
    if (!chroma) {
      return new HSL(0, 0, lightness);
    }

    /**
     * Now we know that there is Saturation we need to do check the level of the Luminance in order to select the correct formula.
     */
    let saturation = 0;
    if (lightness !== 0 && lightness !== 1) {
      saturation = (max - lightness) / Math.min(lightness, 1 - lightness);
    }

    return new HSL(hue, saturation, lightness);
  }

  public toHSV(): HSV {
    const { hue, chroma, max } = HueModel.rgbToChroma(this);

    // Value is the maximum of R, G, B
    const value = max;

    // Achromatic
    if (!chroma) {
      return new HSV(0, 0, value);
    }

    const saturation = chroma / max;

    return new HSV(hue, saturation, value);
  }

  public toHWB(): HWB {
    const { hue, chroma, min, max } = HueModel.rgbToChroma(this);

    const whiteness = min;
    const blackness = 1 - max;

    if (!chroma) {
      return new HWB(0, whiteness, blackness);
    }

    return new HWB(hue, whiteness, blackness);
  }

  // X, Y and Z output refer to a D65/2° standard illuminant.
  public toXYZ(): XYZ {
    const rgb = this.map((value) => {
      if (value > 0.04045) {
        value = ((value + 0.055) / 1.055) ** 2.4;
      } else {
        value /= 12.92;
      }

      return value * 100;
    });

    return new XYZ(
      rgb[0] * 0.4124 + rgb[1] * 0.3576 + rgb[2] * 0.1805,
      rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722,
      rgb[0] * 0.0193 + rgb[1] * 0.1192 + rgb[2] * 0.9505
    );
  }

  public toLAB(illuminant?: keyof typeof XYZ.Illuminants): Lab {
    return this.toXYZ().toLAB(illuminant);
  }
}

export class RGB extends RGBConversions {}


// \src\models\rgb\RGB255.ts
import type { Color, ColorBase } from "../../types";
import { Matrix, clamp, isArray, isNumber, isObject } from "../../utils";
import { HSI } from "../hue/HSI";
import { HSL } from "../hue/HSL";
import { HSV } from "../hue/HSV";
import { HWB } from "../hue/HWB";
import { Lab } from "../perceptual/Lab";
import { XYZ } from "../perceptual/XYZ";
import { CMYK } from "../print/CMYK";
import { YCbCr255 } from "../video/YCbCr255";
import { RGB } from "./RGB";
import { CMY } from "../print/CMY";

export type RGB255Like = RGB255 | [r: number, g: number, b: number] | Record<"r" | "g" | "b", number> | string | number;

class RGB255Base extends Uint8ClampedArray implements ColorBase {
  public get r() {
    return this[0];
  }

  public set r(r: number) {
    this[0] = r;
  }

  public get g() {
    return this[1];
  }

  public set g(g: number) {
    this[1] = g;
  }

  public get b() {
    return this[2];
  }

  public set b(b: number) {
    this[2] = b;
  }

  /**
   * @param r - [0, 255]
   * @param g - [0, 255]
   * @param b - [0, 255]
   */
  constructor(r: number, g: number, b: number) {
    super(3);

    this.r = r;
    this.g = g;
    this.b = b;
  }

  static fromRGB(rgb: RGB255Like) {
    if (rgb instanceof RGB255Base) {
      return new RGB255(rgb.r, rgb.g, rgb.b);
    }

    if (isArray(rgb)) {
      return new RGB255(...rgb);
    }

    if (isObject(rgb)) {
      return new RGB255(rgb.r, rgb.g, rgb.b);
    }

    if (isNumber(rgb)) {
      const [r, g, b] = [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];

      return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
    }

    const regex = /\(\s*(?<r>\d*\.?\d*)\s*,\s*(?<g>\d*\.?\d*)\s*,\s*(?<b>\d*\.?\d*)\s*\)/;

    const groups = regex.exec(rgb)?.groups ?? {};

    const [r, g, b] = [Number.parseFloat(groups.r), Number.parseFloat(groups.g), Number.parseFloat(groups.b)];

    return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }

  static fromHex(hex: string) {
    let raw = hex.replace(/^#/, "");

    // Check if the hex color is in the short form (e.g., #FFF) and convert it to the long form (e.g., #FFFFFF)
    if (raw.length === 3) {
      raw = raw
        .split("")
        .map((char) => char + char)
        .join("");
    }

    // Parse the r, g, b values
    const [r, g, b] = [
      Number.parseInt(raw.substring(0, 2), 16),
      Number.parseInt(raw.substring(2, 4), 16),
      Number.parseInt(raw.substring(4, 6), 16),
    ];

    return new RGB255(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  }

  public clone(): this {
    return new (this.constructor as new (...args: ConstructorParameters<typeof RGB255Base>) => this)(
      this.r,
      this.g,
      this.b
    );
  }

  public equals(comparator: typeof this): boolean {
    return this.every((v, i) => comparator[i] === v);
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toString(alpha?: number) {
    if (alpha === undefined) {
      return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    return `rgba(${this.r}, ${this.g}, ${this.b}, ${clamp(alpha, 0, 1)})`;
  }

  /**
   * @param [alpha] - [0, 1]
   */
  public toHex(alpha?: number) {
    const [r, g, b] = [
      this.r.toString(16).toUpperCase().padStart(2, "0"),
      this.g.toString(16).toUpperCase().padStart(2, "0"),
      this.b.toString(16).toUpperCase().padStart(2, "0"),
    ];

    if (alpha === undefined) {
      return `#${r}${g}${b}`;
    }

    const a = Math.round(clamp(alpha, 0, 1) * 255)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    return `#${r}${g}${b}${a}`;
  }

  public toNumeric() {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  // TODO: Temporary
  public toArray() {
    return [this.r, this.g, this.b];
  }
}

class RGB255Conversions extends RGB255Base {
  public toRGB(): RGB {
    return new RGB(this.r / 255, this.g / 255, this.b / 255);
  }

  public toCMY(): CMY {
    return this.toRGB().toCMY();
  }

  public toCMYK(): CMYK {
    return this.toRGB().toCMYK();
  }

  public toHSI(): HSI {
    return this.toRGB().toHSI();
  }

  public toHSL(): HSL {
    return this.toRGB().toHSL();
  }

  public toHSV(): HSV {
    return this.toRGB().toHSV();
  }

  public toHWB(): HWB {
    return this.toRGB().toHWB();
  }

  public toXYZ(): XYZ {
    return this.toRGB().toXYZ();
  }

  public toLAB(illuminant?: keyof typeof XYZ.Illuminants): Lab {
    return this.toXYZ().toLAB(illuminant);
  }

  private matYCbCr = new Matrix(
    [0.299, 0.587, 0.114],
    [-0.168935, -0.331665, 0.50059],
    [0.499813, -0.418531, -0.081282]
  );

  public toYCbCr255(): YCbCr255 {
    const yCbCr = this.matYCbCr.dot([this.r, this.g, this.b]).sum([0, 128, 128]);
    return new YCbCr255(yCbCr[0], yCbCr[1], yCbCr[2]);
  }
}

export class RGB255 extends RGB255Conversions implements Color {
  static sum(...rgbs: RGB255[]): RGB255 {
    const per = 1 / rgbs.length;

    let [r, g, b] = [0, 0, 0];

    for (const rgb of rgbs) {
      r += rgb.r * per;
      g += rgb.g * per;
      b += rgb.b * per;
    }

    return new RGB255(r, g, b);
  }
}


// \src\models\video\index.ts
export * from "./YCbCr255";


// \src\models\video\YCbCr255.ts
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

