#### **CAM16**

- **Name:** CAM16  
- **Description:** An updated color appearance model derived from CIECAM02, designed for improved performance and better predictions under modern viewing conditions.  
- **Parameters:**

  | Parameter | Description         | Range | Effect                               |
  | --------- | ------------------- | ----- | ------------------------------------ |
  | `J`       | Lightness component | 0–100 | Controls overall brightness.         |
  | `C`       | Chroma component    | 0–∞   | Higher `C` yields more vivid colors. |
  | `h`       | Hue angle           | 0–360 | Modifying `h` changes the base hue.  |
  | `alpha`   | Opacity             | 0–1   | Controls transparency.               |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for HDR imaging, digital photography, and applications where accurate color appearance is critical.  
- **Modifications:**  
  • **Brightness and Chroma:** Adjust `J` and `C` for appearance tuning.  
  • **Hue:** Change `h` to alter the perceived hue.  
- **CSS / String Representations:**  
  • String: Typically converted to more common color spaces (e.g., CIE Lab or RGB) for output.  
- **Direct Conversion Targets:**  
  - To/from CIECAM02 and indirectly to/from CIE Lab.  
- **References:**  
  - [CAM16 Research](https://www.researchgate.net/publication/319139749_CAM16_Color_Appearance_Model)
