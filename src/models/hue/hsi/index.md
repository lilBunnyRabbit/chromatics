#### **HSI**

- **Name:** HSI  
- **Description:** Represents colors using Hue, Saturation, and Intensity. It separates chromatic information (hue) from brightness (intensity), making it valuable for image processing and computer vision tasks.

- **Parameters:**

  | Parameter | Description               | Range | Effect                                                                 |
  | --------- | ------------------------- | ----- | ---------------------------------------------------------------------- |
  | `h`       | Hue angle                 | 0–360 | Rotates the color around the wheel.                                    |
  | `s`       | Saturation (color purity) | 0–1   | Lower values yield grayish colors; higher values produce vivid colors. |
  | `i`       | Intensity (brightness)    | 0–1   | Lower values darken the color; higher values brighten it.              |

- **Typed Array:** Float32Array (chosen for fractional precision)  
- **Usage:** Good for image analysis and computer vision where separating brightness from chromatic information is beneficial.  
- **Modifications:**  
  • **Brightness Adjustment:** Modify `i` to control overall brightness without affecting color hue.  
  • **Hue Rotation:** Change `h` to cycle through the color spectrum.  
  • **Saturation Control:** Adjust `s` to increase or decrease color vividness.

- **CSS / String Representations:**  
  • String: Not directly supported in CSS; typically converted to RGB or HSL for web usage.

- **Direct Conversion Targets:**  
  - To/from RGB, HSL, and HSV.

- **References:**  
  - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)

## [HSI](./HSI.ts)

| Parameter | Name       | Range | Description                             |
| --------- | ---------- | ----- | --------------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel             |
| `s`       | Saturation | 0-1   | Colorfulness relative to its brightness |
| `i`       | Intensity  | 0-1   | Brightness level of the color           |

| Manipulation              | Description                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brightness Adjustment** | Altering the Intensity value affects the overall brightness of the color.                                                                                    |
| **Saturation Boost**      | Increasing Saturation makes colors more vivid, whereas decreasing it fades the color.                                                                        |
| **Color Shifting**        | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

Similar to HSL and HSV, HSI is another cylindrical-coordinate representation of points in an RGB color model. It's often used in computer vision and image processing applications.

This model is useful for applications that need intuitive color adjustments, as it separates the color (hue) from the grayscale information (intensity), making it easier to adjust colors without affecting the brightness.

- https://www.imageeprocessing.com/2013/05/converting-rgb-image-to-hsi.html
- https://www.had2know.org/technology/hsi-rgb-color-converter-equations.html
- https://en.wikipedia.org/wiki/HSL_and_HSV
