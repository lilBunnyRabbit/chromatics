import { ColorModel, Constructor } from "../../../types";
import { clamp01, randomFloat, round2 } from "../../../utils";
import { RGBConversion } from "./rgb.conversion";

class RGBBase extends Float32Array implements ColorModel {
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

    // Handling RGB values above 1:
    // -----------------------------
    // Avoiding weird colours - see the comment of Giacomo Catenazzi.
    // Find the maximum between R, G, B, and if the value is above 1, divide the 3 channels with such numbers.
    // normalizing the RGB values if any of them fall outside the [0, 1] range
    const max = Math.max(r, g, b);

    if (max > 1) {
      this.r = r / max;
      this.g = g / max;
      this.b = b / max;

      // TODO: Temporary Message
      // console.warn("Normalized RGB!", { r, g, b }, "to", { r: this.r, g: this.g, b: this.b });
    } else {
      this.r = r;
      this.g = g;
      this.b = b;
    }

    this.a = a;
  }

  public clone(): this {
    return new (this.constructor as Constructor<this>)(this.r, this.g, this.b, this.a);
  }

  public equals(comparator: unknown): boolean {
    if (!comparator || !(comparator instanceof RGBBase)) {
      return false;
    }

    return this.every((v, i) => comparator[i] === v);
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

  public toCSS() {
    return this.toString();
  }

  public toArray() {
    return [this.r, this.g, this.b, this.a];
  }
}

export class RGB extends RGBBase {
  private _toProxy?: RGBConversion;
  public get to() {
    if (!this._toProxy) {
      this._toProxy = new RGBConversion(this);
    }

    return this._toProxy;
  }

  // Invert the color (normalized, so each channel becomes 1 - channel)
  public invert(): RGB {
    return new RGB(1 - this.r, 1 - this.g, 1 - this.b, this.a);
  }

  static random() {
    return new RGB(randomFloat(0, 1), randomFloat(0, 1), randomFloat(0, 1));
  }
}

/*
export class RGB extends RGBBase implements ColorModel {
  // Invert the color (normalized, so each channel becomes 1 - channel)
  public invert(): RGB {
    return new RGB(1 - this.r, 1 - this.g, 1 - this.b, this.a);
  }

  // Multiply each channel by a factor (brighten if factor > 1, darken if factor < 1)
  public adjustBrightness(factor: number): RGB {
    const adjust = (v: number) => clamp01(v * factor);
    return new RGB(adjust(this.r), adjust(this.g), adjust(this.b), this.a);
  }

  // Adjust contrast using a midpoint of 0.5:
  // For each channel, new value = (value - 0.5) * factor + 0.5
  public adjustContrast(factor: number): RGB {
    const adjust = (v: number) => clamp01((v - 0.5) * factor + 0.5);
    return new RGB(adjust(this.r), adjust(this.g), adjust(this.b), this.a);
  }

  // Convert to grayscale using a weighted luminance formula.
  // Common weights: 0.299, 0.587, 0.114
  public grayscale(): RGB {
    const lum = clamp01(0.299 * this.r + 0.587 * this.g + 0.114 * this.b);
    return new RGB(lum, lum, lum, this.a);
  }

  // Blend this color with another RGB by a given ratio.
  // Ratio 0 returns this color; 1 returns the other color.
  public blend(other: RGB, ratio: number): RGB {
    const inv = 1 - ratio;
    const mix = (a: number, b: number) => clamp01(a * inv + b * ratio);
    return new RGB(mix(this.r, other.r), mix(this.g, other.g), mix(this.b, other.b), mix(this.a, other.a));
  }

  // Convert to a CSS rgba() string.
  // The RGB channels are converted to 0–255 and alpha is preserved as a decimal.
  public toCssString(): string {
    const r255 = Math.round(this.r * 255);
    const g255 = Math.round(this.g * 255);
    const b255 = Math.round(this.b * 255);
    // If alpha is 1 (fully opaque), we can output an "rgb(...)" string.
    if (this.a === 1) {
      return `rgb(${r255}, ${g255}, ${b255})`;
    }
    return `rgba(${r255}, ${g255}, ${b255}, ${this.a.toFixed(2)})`;
  }

  // Convert to a hex string.
  // Convert each channel to 0–255, then to a two-digit hex.
  // Alpha is included only if not 1.
  public toHexString(): string {
    const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
    const hex = `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    return this.a === 1 ? hex : hex + toHex(this.a);
  }
}

*/
