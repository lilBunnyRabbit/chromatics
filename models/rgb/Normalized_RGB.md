#### **Normalized RGB**

- **Name:** Normalized RGB  
- **Description:** Represents colors with channels normalized to a range of 0 to 1. It’s useful for internal calculations and conversions where floating-point precision is needed.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                  |
  | --------- | ------------- | ----- | ------------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` increases the red component intensity.   |
  | `g`       | Green channel | 0–1   | Increasing `g` increases the green component intensity. |
  | `b`       | Blue channel  | 0–1   | Increasing `b` increases the blue component intensity.  |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                  |

- **Typed Array:** Float32Array (for fractional values and smooth calculations)  
- **Usage:** Good for mathematical operations and conversions between color spaces.  
- **Modifications:**  
  • **Scaling:** Multiply each channel to adjust overall brightness.  
  • **Mixing:** Interpolate between two normalized colors for blending.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB255 (or sRGB) for CSS display.  
- **Direct Conversion Targets:**  
  - sRGB, Linear sRGB, and subsequently other perceptual models.  
- **References:**  
  - [Colormath: Normalized RGB Conversions](https://ajalt.github.io/colormath/)

## [Normalized RGB](./RGB.ts)

| Parameter | Name  | Range | Description                    |
| --------- | ----- | ----- | ------------------------------ |
| `r`       | Red   | 0-1   | Normalized red color channel   |
| `g`       | Green | 0-1   | Normalized green color channel |
| `b`       | Blue  | 0-1   | Normalized blue color channel  |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b/
