#### **Oklch**

- **Name:** Oklch  
- **Description:** The cylindrical representation of Oklab, expressing color in terms of Lightness, Chroma, and Hue for intuitive manipulation.  
- **Parameters:**

  | Parameter | Description              | Range | Effect                                                         |
  | --------- | ------------------------ | ----- | -------------------------------------------------------------- |
  | `L`       | Perceptual lightness     | 0–1   | Higher `L` yields a brighter color.                            |
  | `C`       | Chroma (color intensity) | 0–∞   | Increasing `C` intensifies the color's saturation.             |
  | `h`       | Hue angle                | 0–360 | Changing `h` rotates the color within the perceptual spectrum. |
  | `alpha`   | Opacity                  | 0–1   | Controls transparency.                                         |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for tasks requiring direct hue manipulation in a perceptually uniform space, such as advanced photo editing and dynamic theming.  
- **Modifications:**  
  • **Hue Spin:** Adjust `h` to change the color tone.  
  • **Saturation and Brightness:** Modify `C` and `L` for vividness and lightness control.  
- **CSS / String Representations:**  
  • String: Usually converted to RGB for CSS output.  
- **Direct Conversion Targets:**  
  - To/from Oklab, CIE XYZ, and RGB.  
- **References:**  
  - [Oklch Documentation](https://oklch.com)

## Oklch
Oklab is a perceptual color space for image processing. Its cylindrical representation is Oklch.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklch/
- https://oklch.com