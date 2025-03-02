#### **ACEScct**

- **Name:** ACEScct  
- **Description:** Similar to ACEScc but with a slightly different toe region to better preserve shadow detail, making it more forgiving in low-light areas.  
- **Parameters:**

  | Parameter | Description                        | Range | Effect                                                                |
  | --------- | ---------------------------------- | ----- | --------------------------------------------------------------------- |
  | `r`       | Red channel (logarithmic with toe) | 0–1   | Adjusting `r` increases red intensity while preserving shadow detail. |
  | `g`       | Green channel                      | 0–1   | Modifying `g` affects the green tone with a toe function.             |
  | `b`       | Blue channel                       | 0–1   | Adjusting `b` changes blue intensity with enhanced low-light detail.  |
  | `alpha`   | Opacity                            | 0–1   | Controls transparency.                                                |

- **Typed Array:** Float32Array  
- **Usage:** Favoured in digital grading pipelines where preserving detail in darker regions is crucial.  
- **Modifications:**  
  • **Logarithmic and Toe Adjustments:** Fine control over midtones and shadows.  
- **CSS / String Representations:**  
  • String: Typically converted to ACES or sRGB for display.  
- **Direct Conversion Targets:**  
  - ACES, ACEScc, and further to standard RGB spaces.  
- **References:**  
  - [ACEScct Overview](https://acescentral.com)


## ACEScct

| Parameter | Name  | Range | Description                                                   |
| --------- | ----- | ----- | ------------------------------------------------------------- |
| `r`       | Red   | 0-1   | ACEScct red color channel, similar to ACEScc but with a toe   |
| `g`       | Green | 0-1   | ACEScct green color channel, similar to ACEScc but with a toe |
| `b`       | Blue  | 0-1   | ACEScct blue color channel, similar to ACEScc but with a toe  |

| Manipulation            | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Logarithmic Grading** | Applying color grading in a logarithmic curve to offer fine control over midtones. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scct.html