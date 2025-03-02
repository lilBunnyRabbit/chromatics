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
