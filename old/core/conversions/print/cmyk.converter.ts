import { ConversionRegistry__OLD } from "../../../lib";
import { CMY, CMYK, RGB } from "../../models";

export default ConversionRegistry__OLD.registrator(CMYK, (register) => {
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
  register(RGB, (cmyk) => {
    return new RGB((1 - cmyk.c) * (1 - cmyk.k), (1 - cmyk.m) * (1 - cmyk.k), (1 - cmyk.y) * (1 - cmyk.k));
  });

  register(CMY, (cmyk) => {
    return new CMY(cmyk.c + cmyk.k, cmyk.m + cmyk.k, cmyk.y + cmyk.k);
  });
});
