#### **CIECAM02**

- **Name:** CIECAM02  
- **Description:** A comprehensive color appearance model that factors in viewing conditions, offering a more holistic approach to color perception and appearance.  
- **Parameters:**

  | Parameter | Description            | Range | Effect                                         |
  | --------- | ---------------------- | ----- | ---------------------------------------------- |
  | `J`       | Lightness (brightness) | 0–100 | Higher `J` increases perceived brightness.     |
  | `C`       | Colorfulness (chroma)  | 0–∞   | Increasing `C` results in more intense colors. |
  | `h`       | Hue angle              | 0–360 | Changing `h` alters the perceived hue.         |
  | `alpha`   | Opacity                | 0–1   | Controls transparency.                         |

- **Typed Array:** Float32Array  
- **Usage:** Employed in advanced imaging and color correction, especially where viewing conditions significantly impact color appearance.  
- **Modifications:**  
  • **Brightness & Colorfulness:** Adjust `J` and `C` for appearance adjustments.  
  • **Hue:** Modify `h` to shift the color tone.  
- **CSS / String Representations:**  
  • String: Typically converted to CIE Lab or RGB for display.  
- **Direct Conversion Targets:**  
  - To/from CAM16 and indirectly to/from CIE Lab.  
- **References:**  
  - [Wikipedia: CIECAM02](https://en.wikipedia.org/wiki/CIECAM02)