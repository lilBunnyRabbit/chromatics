// https://en.wikipedia.org/wiki/CMYK_color_model

import { clamp, round } from "../utils";
import { RGB } from "./RGB";

// TODO:
// export type CMYKLike = 0;

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

    this[0] = c;
    this[1] = m;
    this[2] = y;
    this[3] = k;
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
   * @param r - [0, 1]
   * @param g - [0, 1]
   * @param b - [0, 1]
   */
  static fromRGB(r: number, g: number, b: number): CMYK {
    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
      return new CMYK(0, 0, 0, k);
    }

    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);

    return new CMYK(c, m, y, k);
  }

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
    return RGB.fromNormalized((1 - this.c) * (1 - this.k), (1 - this.m) * (1 - this.k), (1 - this.y) * (1 - this.k));
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
