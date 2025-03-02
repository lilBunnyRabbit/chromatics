#### **HSLuv**

- **Name:** HSLuv  
- **Description:** A variant of HSL designed for perceptual uniformity, ensuring that changes in saturation and lightness are consistent across all hues.

- **Parameters:**

  | Parameter | Description                      | Range | Effect                                                                  |
  | --------- | -------------------------------- | ----- | ----------------------------------------------------------------------- |
  | `h`       | Hue angle                        | 0–360 | Rotates the color; changes the base color.                              |
  | `s`       | Saturation (perceptual scale)    | 0–100 | Higher values result in more vivid colors on a perceptual scale.        |
  | `l`       | Lightness (perceptually uniform) | 0–100 | Adjusting `l` consistently alters brightness in line with human vision. |

- **Typed Array:** Float32Array  
- **Usage:** Excellent for UI theming and design systems where perceptual uniformity is desired.  
- **Modifications:**  
  • **Hue Rotation:** Adjust `h` for different color bases.  
  • **Saturation/Lightness Adjustments:** Modify `s` and `l` to fine-tune vividness and brightness perceptually.

- **CSS / String Representations:**  
  • String: Typically converted to HSL or RGB for CSS as CSS does not natively support HSLuv.

- **Direct Conversion Targets:**  
  - To/from HSL and RGB.

- **References:**  
  - [HSLuv Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/)

## HSLuv

| Parameter | Name       | Range | Description                                          |
| --------- | ---------- | ----- | ---------------------------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel                          |
| `s`       | Saturation | 0-100 | Perceptually uniform colorfulness in Luv color space |
| `l`       | Lightness  | 0-100 | Perceptually uniform lightness in Luv color space    |

| Manipulation               | Description                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Perceptual Lightness**   | Adjusting Lightness in HSLuv aims for perceptual uniformity across hues.                                                                                     |
| **Saturation Consistency** | Saturation adjustments are made to preserve the perceived colorfulness uniformly.                                                                            |
| **Color Shifting**         | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

HSLuv and HPLuv are color spaces designed as a human friendly alternative to HSL.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/