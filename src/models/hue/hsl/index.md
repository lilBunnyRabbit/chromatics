#### **HSL**

- **Name:** HSL  
- **Description:** Represents colors using Hue, Saturation, and Lightness. Widely used for UI design and web applications due to its intuitive control over color tone and brightness.

- **Parameters:**

  | Parameter | Description                  | Range | Effect                                                    |
  | --------- | ---------------------------- | ----- | --------------------------------------------------------- |
  | `h`       | Hue angle                    | 0–360 | Rotating `h` shifts the color around the spectrum.        |
  | `s`       | Saturation (color intensity) | 0–1   | 0 gives grayscale; 1 provides full color intensity.       |
  | `l`       | Lightness (brightness)       | 0–1   | 0 is black, 1 is white; intermediate values show the hue. |

- **Typed Array:** Float32Array  
- **Usage:** Commonly used in CSS (via `hsl()`/`hsla()`) and design tools for intuitive color adjustments.  
- **Modifications:**  
  • **Hue Spin:** Adjust `h` to change the base color.  
  • **Saturation & Lightness:** Modify `s` and `l` to control color vividness and brightness.

- **CSS / String Representations:**  
  • CSS: `hsl(h, s%, l%)` or `hsla(h, s%, l%, a)`

- **Direct Conversion Targets:**  
  - To/from RGB, HSV, and HSI.

- **References:**  
  - [NIWA: Math Behind Colorspace Conversions](https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/)


## [HSL](./HSL.ts)

| Parameter | Name       | Range | Description                                   |
| --------- | ---------- | ----- | --------------------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel                   |
| `s`       | Saturation | 0-1   | Colorfulness relative to its lightness        |
| `l`       | Lightness  | 0-1   | Amount of light emitted or reflected by color |

| Manipulation              | Description                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lightness Control**     | Adjusting Lightness can make the color lighter or darker.                                                                                                    |
| **Saturation Adjustment** | Modifying Saturation changes the intensity of the color without affecting lightness.                                                                         |
| **Color Shifting**        | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

A cylindrical representation of sRGB using Hue, Saturation, and Lightness.

Both are intuitive for human understanding and manipulation of color, making them suitable for user interfaces that allow users to adjust colors based on hue, saturation, and brightness/lightness.

- https://en.wikipedia.org/wiki/HSL_and_HSV
- https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
- https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-l/