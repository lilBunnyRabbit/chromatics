import { HSV, RGB } from "../..";
import { HueHelper } from "../helpers/hue.helper";
import { HSL } from "./hsl.model";

export class HSLConversion {
  constructor(private hsl: HSL) {}

  public RGB(): RGB {
    const hue = this.hsl.h / 60;

    const chroma = (1 - Math.abs(2 * this.hsl.l - 1)) * this.hsl.s;
    const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = this.hsl.l - chroma / 2;

    return HueHelper.chromaToRGB(hue, chroma, interChroma, offset, this.hsl.a);
  }

  public HSV() {
    const v = this.hsl.l + this.hsl.s * Math.min(this.hsl.l, 1 - this.hsl.l);

    return new HSV(this.hsl.h, !v ? 0 : 2 * (1 - this.hsl.l / v), v);
  }
}

// export default ConversionRegistry__OLD.registrator(HSL, (register) => {
//   register(RGB, (hsl) => {
//     const hue = hsl.h / 60;

//     const chroma = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
//     const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
//     const offset = hsl.l - chroma / 2;

//     return HueHelper.chromaToRGB(hue, chroma, interChroma, offset);
//   });

//   register(HSV, (hsl) => {
//     const v = hsl.l + hsl.s * Math.min(hsl.l, 1 - hsl.l);

//     return new HSV(hsl.h, !v ? 0 : 2 * (1 - hsl.l / v), v);
//   });
// });

/*

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

*/

// TODO: Indirect conversions are currently not supported
// ConversionRegistry.register(HSL, HWB, (hsl) => {
//   return this.toHSV().toHWB();
// });

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
