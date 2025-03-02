#### **JzCzHz**

- **Name:** JzCzHz  
- **Description:** The cylindrical version of JzAzBz, expressing color with lightness, chroma, and hue components to allow intuitive hue manipulation within a perceptually uniform space.  
- **Parameters:**

  | Parameter | Description              | Range | Effect                                           |
  | --------- | ------------------------ | ----- | ------------------------------------------------ |
  | `Jz`      | Lightness-like component | 0–1   | Controls perceived brightness.                   |
  | `Cz`      | Chroma component         | 0–∞   | Increasing `Cz` enhances color saturation.       |
  | `hz`      | Hue angle                | 0–360 | Rotating `hz` changes the color's perceived hue. |
  | `alpha`   | Opacity                  | 0–1   | Controls transparency.                           |

- **Typed Array:** Float32Array  
- **Usage:** Useful for applications needing intuitive hue-based adjustments in a highly uniform perceptual space.  
- **Modifications:**  
  • **Hue Adjustment:** Modify `hz` to change the color tone.  
  • **Saturation and Lightness:** Adjust `Cz` and `Jz` to control vividness and brightness.  
- **CSS / String Representations:**  
  • String: Converted to RGB for CSS display.  
- **Direct Conversion Targets:**  
  - To/from JzAzBz and indirectly to/from RGB.  
- **References:**  
  - [JzCzHz on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-cz-hz/)

## JzCzHz
JzCzHz is its cylindrical representation of JzAzBz.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-cz-hz/