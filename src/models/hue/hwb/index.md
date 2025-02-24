#### **HWB**

- **Name:** HWB  
- **Description:** Represents colors by specifying Hue, Whiteness, and Blackness. This model focuses on describing colors in terms of their tint (whiteness) and shade (blackness) in addition to the hue.

- **Parameters:**

  | Parameter | Description                 | Range | Effect                                              |
  | --------- | --------------------------- | ----- | --------------------------------------------------- |
  | `h`       | Hue angle                   | 0–360 | Changing `h` determines the base color tone.        |
  | `w`       | Whiteness (amount of white) | 0–1   | Increasing `w` lightens the color by adding a tint. |
  | `b`       | Blackness (amount of black) | 0–1   | Increasing `b` darkens the color by adding a shade. |

- **Typed Array:** Float32Array  
- **Usage:** Particularly useful in design and digital art for controlling tints and shades more intuitively than traditional models.  
- **Modifications:**  
  • **Tint/Shade Control:** Increase `w` to lighten (tint) or `b` to darken (shade) the color.  
  • **Hue Shift:** Adjust `h` to change the underlying color.

- **CSS / String Representations:**  
  • String: Typically converted to RGB or HSL for CSS display.

- **Direct Conversion Targets:**  
  - To/from RGB and HSL.

- **References:**  
  - [Wikipedia: HWB Color Model](https://en.wikipedia.org/wiki/HWB_color_model)


## [HWB](./HWB.ts)

| Parameter | Name      | Range | Description                        |
| --------- | --------- | ----- | ---------------------------------- |
| `h`       | Hue       | 0-360 | Position on the color wheel        |
| `w`       | Whiteness | 0-1   | Amount of white mixed in the color |
| `b`       | Blackness | 0-1   | Amount of black mixed in the color |

| Manipulation           | Description                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tint and Shade**     | Whiteness adds tint (lighter), whereas Blackness adds shade (darker) to the color.                                                                           |
| **Neutral Adjustment** | Balancing Whiteness and Blackness can neutralize the color towards a more gray scale.                                                                        |
| **Color Shifting**     | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

A cylindrical representation of sRGB using Hue, Whiteness, and Blackness.

- https://dirask.com/snippets/JavaScript-convert-RGB-to-HWB-color-model-1XB6rp
- https://en.wikipedia.org/wiki/HWB_color_model
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-w-b/
- https://en.wikipedia.org/wiki/HSL_and_HSV
- http://alvyray.com/Papers/CG/hwb2rgb.htm

