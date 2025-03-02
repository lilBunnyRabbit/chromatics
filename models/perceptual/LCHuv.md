#### **LCHuv**

- **Name:** LCHuv  
- **Description:** The cylindrical (hue-based) representation of the LUV color space, expressing colors in terms of Lightness, Chroma, and Hue.  
- **Parameters:**

  | Parameter | Description         | Range | Effect                                    |
  | --------- | ------------------- | ----- | ----------------------------------------- |
  | `L`       | Lightness           | 0–100 | Increasing `L` yields a lighter color.    |
  | `C`       | Chroma (saturation) | 0–∞   | Increasing `C` increases color vividness. |
  | `h`       | Hue angle           | 0–360 | Rotating `h` changes the perceived hue.   |
  | `alpha`   | Opacity             | 0–1   | Controls transparency.                    |

- **Typed Array:** Float32Array  
- **Usage:** Useful for intuitive color editing where perceptual uniformity is important, such as in professional photo editing.  
- **Modifications:**  
  • **Hue Rotation:** Adjust `h` to change the base color.  
  • **Chroma Adjustment:** Modify `C` for saturation control.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web display.  
- **Direct Conversion Targets:**  
  - To/from LUV, CIE XYZ, and RGB.  
- **References:**  
  - [Colormath: LCHuv](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv/)

## LCHuv

| Parameter | Name      | Range | Description                                  |
| --------- | --------- | ----- | -------------------------------------------- |
| `L`       | Lightness | 0-100 | The lightness of the color.                  |
| `C`       | Chroma    | 0-∞   | The colorfulness relative to the brightness. |
| `H`       | Hue Angle | 0-360 | The angle of the hue in the color wheel.     |

| Manipulation             | Description                                     |
| ------------------------ | ----------------------------------------------- |
| **Hue Adjustment**       | Rotating `H` to change the color's hue.         |
| **Saturation Scaling**   | Adjusting `C` to modify the color's saturation. |
| **Lightness Modulation** | Modifying `L` to adjust the brightness level.   |

LUV is a color model intended to be perceptually uniform. Its cylindrical representation is LCHuv.
LUV and LCHuv models each have multiple color spaces that are defined relative to a white point. The default white point is D65.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv-color-spaces/