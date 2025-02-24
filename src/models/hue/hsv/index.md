#### **HSV**

- **Name:** HSV  
- **Description:** Represents colors using Hue, Saturation, and Value (brightness). Often preferred in applications requiring intuitive brightness control.

- **Parameters:**

  | Parameter | Description            | Range | Effect                                                 |
  | --------- | ---------------------- | ----- | ------------------------------------------------------ |
  | `h`       | Hue angle              | 0–360 | Adjusting `h` rotates the color around the spectrum.   |
  | `s`       | Saturation (intensity) | 0–1   | 0 yields gray; 1 yields fully saturated color.         |
  | `v`       | Value (brightness)     | 0–1   | Lower values darken; higher values brighten the color. |

- **Typed Array:** Float32Array  
- **Usage:** Utilized in color pickers and image processing where controlling brightness (value) is key.  
- **Modifications:**  
  • **Value Adjustment:** Change `v` to lighten or darken the color.  
  • **Hue and Saturation:** Modify `h` and `s` to affect the color tone and intensity.

- **CSS / String Representations:**  
  • String: Not directly available in CSS; usually converted to RGB or HSL for display.

- **Direct Conversion Targets:**  
  - To/from RGB, HSL, and HSI.

- **References:**  
  - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)

---

## [HSV](./HSV.ts)

| Parameter | Name       | Range | Description                        |
| --------- | ---------- | ----- | ---------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel        |
| `s`       | Saturation | 0-1   | Colorfulness relative to its value |
| `v`       | Value      | 0-1   | Brightness of the color            |

| Manipulation              | Description                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brightness Adjustment** | Changing the Value influences the brightness, making colors brighter or darker.                                                                              |
| **Color Saturation**      | Adjusting Saturation controls the depth of the color, from vibrant to gray.                                                                                  |
| **Color Shifting**        | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

A cylindrical representation of sRGB using Hue, Saturation, and Value / brightness.

Both are intuitive for human understanding and manipulation of color, making them suitable for user interfaces that allow users to adjust colors based on hue, saturation, and brightness/lightness.

- https://en.wikipedia.org/wiki/HSL_and_HSV
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-v/
