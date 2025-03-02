#### **ACEScg**

- **Name:** ACEScg  
- **Description:** A linear variant of ACES designed for computer graphics and visual effects, optimized for compositing and CGI workflows.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                      |
  | --------- | ------------- | ----- | ----------------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` intensifies the red color in a linear space. |
  | `g`       | Green channel | 0–1   | Adjusting `g` modifies the green intensity linearly.        |
  | `b`       | Blue channel  | 0–1   | Adjusting `b` modifies the blue intensity linearly.         |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                      |

- **Typed Array:** Float32Array  
- **Usage:** Widely used in CGI and visual effects production for its linear behavior, facilitating realistic compositing.  
- **Modifications:**  
  • **Linear Adjustments:** Straightforward arithmetic for color blending and corrections.  
- **CSS / String Representations:**  
  • String: Converted to ACES or sRGB for display on standard monitors.  
- **Direct Conversion Targets:**  
  - To/from ACES, sRGB, and other linear color spaces.  
- **References:**  
  - [ACEScg Documentation](https://acescentral.com)


## ACEScg

| Parameter | Name  | Range | Description                                                     |
| --------- | ----- | ----- | --------------------------------------------------------------- |
| `r`       | Red   | 0-1   | ACEScg red color channel, designed for CGI and visual effects   |
| `g`       | Green | 0-1   | ACEScg green color channel, designed for CGI and visual effects |
| `b`       | Blue  | 0-1   | ACEScg blue color channel, designed for CGI and visual effects  |

| Manipulation            | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Logarithmic Grading** | Applying color grading in a logarithmic curve to offer fine control over midtones. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scg.html