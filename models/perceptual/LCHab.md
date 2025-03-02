#### **LCHab**

- **Name:** LCHab  
- **Description:** A cylindrical representation of CIE Lab using Lightness, Chroma, and Hue. It provides a more intuitive manipulation of color by separating chroma and hue.  
- **Parameters:**

  | Parameter | Description                         | Range | Effect                                    |
  | --------- | ----------------------------------- | ----- | ----------------------------------------- |
  | `L`       | Lightness; same as in CIE Lab       | 0–100 | Increasing `L` lightens the color.        |
  | `C`       | Chroma; represents color saturation | 0–∞   | Increasing `C` increases color vividness. |
  | `h`       | Hue angle                           | 0–360 | Rotating `h` changes the perceived hue.   |
  | `alpha`   | Opacity                             | 0–1   | Controls transparency.                    |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for applications needing intuitive hue and saturation adjustments, such as graphic design and advanced color editing.  
- **Modifications:**  
  • **Hue Rotation:** Adjust `h` to cycle through color variants.  
  • **Chroma Adjustment:** Modify `C` to control the intensity of the color.  
- **CSS / String Representations:**  
  • String: Usually converted to RGB for web display.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab, CIE XYZ, and RGB.  
- **References:**  
  - [Colormath: LCHab](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/)

## LCHab

| Parameter | Name      | Range | Description                                  |
| --------- | --------- | ----- | -------------------------------------------- |
| `L`       | Lightness | 0-100 | The lightness of the color.                  |
| `C`       | Chroma    | 0-∞   | The colorfulness relative to the brightness. |
| `H`       | Hue Angle | 0-360 | The angle of the hue in the color wheel.     |

| Manipulation          | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| **Hue Rotation**      | Rotating `H` to change the hue.                                   |
| **Chroma Adjustment** | Adjusting `C` to modify the saturation or vividness of the color. |
| **Lightness Control** | Modifying `L` to change the brightness.                           |

LAB is a color model intended to be perceptually uniform. Its cylindrical representation is LCHab.
LAB and LCHab models each have multiple color spaces that are defined relative to a white point. The default white point is D65.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab-color-spaces/