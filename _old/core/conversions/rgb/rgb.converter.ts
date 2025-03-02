import { ConversionRegistry__OLD } from "../../../lib";
import { CMY, CMYK, HSI, HSL, HSV, HWB, RGB, RGB255, XYZ } from "../../models";
import { HueHelper } from "../hue/helpers/hue.helper";

export default ConversionRegistry__OLD.registrator(RGB, (register) => {
  register(RGB255, (rgb) => {
    return new RGB255(rgb.r * 255, rgb.g * 255, rgb.b * 255);
  });

  register(CMY, (rgb) => {
    return new CMY(1 - rgb.r, 1 - rgb.g, 1 - rgb.b);
  });

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
  register(CMYK, (rgb) => {
    const k = 1 - Math.max(rgb.r, rgb.g, rgb.b);
    if (k === 1) {
      return new CMYK(0, 0, 0, k);
    }

    const c = (1 - rgb.r - k) / (1 - k);
    const m = (1 - rgb.g - k) / (1 - k);
    const y = (1 - rgb.b - k) / (1 - k);

    return new CMYK(c, m, y, k);
  });

  register(HSI, (rgb) => {
    const { hue, chroma, min } = HueHelper.rgbToChroma(rgb);

    // The simplest definition is just the arithmetic mean, i.e. average, of the three components, in the HSI model called intensity (fig. 12a). This is simply the projection of a point onto the neutral axis – the vertical height of a point in our tilted cube. The advantage is that, together with Euclidean-distance calculations of hue and chroma, this representation preserves distances and angles from the geometry of the RGB cube.[23][25]
    const intensity = (rgb.r + rgb.g + rgb.b) / 3;

    // Achromatic
    if (!chroma) {
      return new HSI(0, 0, intensity);
    }

    // The HSI model commonly used for computer vision, which takes H2 as a hue dimension and the component average I ("intensity") as a lightness dimension, does not attempt to "fill" a cylinder by its definition of saturation. Instead of presenting color choice or modification interfaces to end users, the goal of HSI is to facilitate separation of shapes in an image. Saturation is therefore defined in line with the psychometric definition: chroma relative to lightness
    const saturation = !intensity ? 0 : 1 - min / intensity;

    return new HSI(hue, saturation, intensity);
  });

  register(HSL, (rgb) => {
    const { hue, chroma, min, max } = HueHelper.rgbToChroma(rgb);

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
  });

  register(HSV, (rgb) => {
    const { hue, chroma, max } = HueHelper.rgbToChroma(rgb);

    // Value is the maximum of R, G, B
    const value = max;

    // Achromatic
    if (!chroma) {
      return new HSV(0, 0, value);
    }

    const saturation = chroma / max;

    return new HSV(hue, saturation, value);
  });

  register(HWB, (rgb) => {
    const { hue, chroma, min, max } = HueHelper.rgbToChroma(rgb);

    const whiteness = min;
    const blackness = 1 - max;

    if (!chroma) {
      return new HWB(0, whiteness, blackness);
    }

    return new HWB(hue, whiteness, blackness);
  });

  // X, Y and Z output refer to a D65/2° standard illuminant.
  register(XYZ, (rgb) => {
    const mapped = rgb.map((value) => {
      if (value > 0.04045) {
        value = ((value + 0.055) / 1.055) ** 2.4;
      } else {
        value /= 12.92;
      }

      return value * 100;
    });

    return new XYZ(
      mapped[0] * 0.4124 + mapped[1] * 0.3576 + mapped[2] * 0.1805,
      mapped[0] * 0.2126 + mapped[1] * 0.7152 + mapped[2] * 0.0722,
      mapped[0] * 0.0193 + mapped[1] * 0.1192 + mapped[2] * 0.9505
    );
  });
});
