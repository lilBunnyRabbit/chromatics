import { HSL, RGB } from "../..";
import { HueHelper } from "../helpers/hue.helper";
import { HSV } from "./hsv.model";

export class HSVConversion {
  constructor(private hsv: HSV) {}

  public RGB(): RGB {
    const hue = this.hsv.h / 60;

    const chroma = this.hsv.v * this.hsv.s;
    const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
    const offset = this.hsv.v - chroma;

    return HueHelper.chromaToRGB(hue, chroma, interChroma, offset, this.hsv.a);
  }

  public HSL() {
    const l = this.hsv.v * (1 - this.hsv.s / 2);
    const s = l === 0 || l === 1 ? 0 : (this.hsv.v - l) / Math.min(l, 1 - l);

    return new HSL(this.hsv.h, s, l, this.hsv.a);
  }
}

// export default ConversionRegistry__OLD.registrator(HSV, (register) => {
//   register(RGB, (hsv) => {
//     const hue = hsv.h / 60;

//     const chroma = hsv.v * hsv.s;
//     const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
//     const offset = hsv.v - chroma;

//     return HueHelper.chromaToRGB(hue, chroma, interChroma, offset);
//   });

//   register(HSL, (hsv) => {
//     const l = hsv.v * (1 - hsv.s / 2);
//     const s = l === 0 || l === 1 ? 0 : (hsv.v - l) / Math.min(l, 1 - l);

//     return new HSL(hsv.h, s, l);
//   });

//   register(HWB, (hsv) => {
//     return new HWB(hsv.h, (1 - hsv.s) * hsv.v, 1 - hsv.v);
//   });
// });

// /**
//  * @deprecated
//  */
// class HSVConversions extends HSVBase {
//   public toRGB(): RGB {
//     const hue = this.h / 60;

//     const chroma = this.v * this.s;
//     const interChroma = chroma * (1 - Math.abs((hue % 2) - 1));
//     const offset = this.v - chroma;

//     return HueModel.chromaToRGB(hue, chroma, interChroma, offset);
//   }

//   public toHSI(): HSI {
//     return this.toRGB().toHSI();
//   }

//   public toHSL() {
//     const l = this.v * (1 - this.s / 2);
//     const s = l === 0 || l === 1 ? 0 : (this.v - l) / Math.min(l, 1 - l);

//     return new HSL(this.h, s, l);
//   }

//   public toHWB(): HWB {
//     return new HWB(this.h, (1 - this.s) * this.v, 1 - this.v);
//   }
// }

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
