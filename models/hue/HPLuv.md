#### **HPLuv**

- **Name:** HPLuv  
- **Description:** A variant of HSLuv focused on generating pastel colors by adjusting the saturation curve to produce softer hues while maintaining perceptual uniformity.

- **Parameters:**

  | Parameter | Description                            | Range | Effect                                                                           |
  | --------- | -------------------------------------- | ----- | -------------------------------------------------------------------------------- |
  | `h`       | Hue angle                              | 0–360 | Rotating `h` changes the base color.                                             |
  | `p`       | Pastel parameter (modified saturation) | 0–100 | Lower values yield softer, more pastel colors; higher values increase intensity. |
  | `l`       | Lightness (perceptually uniform)       | 0–100 | Adjusting `l` changes brightness while preserving color balance.                 |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for design systems requiring soft, pastel palettes such as in modern UI themes.  
- **Modifications:**  
  • **Pastel Control:** Tweak `p` to modulate the softness of the color.  
  • **Hue & Lightness:** Adjust `h` and `l` for overall color tone and brightness.

- **CSS / String Representations:**  
  • String: Converted to HSL or RGB for CSS output.

- **Direct Conversion Targets:**  
  - To/from HSL, HSLuv, and RGB.

- **References:**  
  - [HSLuv Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)


## HPLuv

| Parameter | Name      | Range | Description                                       |
| --------- | --------- | ----- | ------------------------------------------------- |
| `h`       | Hue       | 0-360 | Position on the color wheel                       |
| `p`       | Pastel    | 0-100 | Saturation reduced to pastel range in Luv space   |
| `l`       | Lightness | 0-100 | Perceptually uniform lightness in Luv color space |

| Manipulation          | Description                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pastel Effect**     | Adjusting the Pastel parameter softens the color to achieve pastel tones.                                                                                    |
| **Uniform Lightness** | Lightness control in HPLuv also focuses on maintaining perceptual uniformity.                                                                                |
| **Color Shifting**    | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

HSLuv and HPLuv are color spaces designed as a human friendly alternative to HSL.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/