/**
 * @param red - [0, 1]
 * @param green - [0, 1]
 * @param blue - [0, 1]
 */
export function rgbToHueChroma(
  red: number,
  green: number,
  blue: number
): Record<"min" | "max" | "chroma" | "hue", number> {
  // Find the minimum and maximum values of R, G and B.
  const min = Math.min(red, green, blue);
  const max = Math.max(red, green, blue);
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
    case red:
      // because, depending on the RGB values and which component is the maximum,
      // the initial calculation of hue could be negative, and the (g < b ? 6 : 0)
      // adjustment is a way to ensure the hue starts from the correct segment of the color wheel
      // before any final adjustments.
      hue = (green - blue) / chroma + (green < blue ? 6 : 0);
      break;
    case green:
      hue = (blue - red) / chroma + 2;
      break;
    case blue:
      hue = (red - green) / chroma + 4;
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
