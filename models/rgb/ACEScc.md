#### **ACEScc**

- **Name:** ACEScc  
- **Description:** A logarithmic encoding of the ACES color space optimized for grading, providing finer control over midtones.  
- **Parameters:**

  | Parameter | Description               | Range | Effect                                              |
  | --------- | ------------------------- | ----- | --------------------------------------------------- |
  | `r`       | Red channel (logarithmic) | 0–1   | Increasing `r` increases the logarithmic red value. |
  | `g`       | Green channel             | 0–1   | Adjusting `g` modifies the logarithmic green value. |
  | `b`       | Blue channel              | 0–1   | Adjusting `b` modifies the logarithmic blue value.  |
  | `alpha`   | Opacity                   | 0–1   | Controls transparency.                              |

- **Typed Array:** Float32Array  
- **Usage:** Particularly useful in post-production workflows where logarithmic grading offers more precise control over image tonal ranges.  
- **Modifications:**  
  • **Logarithmic Adjustments:** Fine-tune channel values for nuanced grading.  
- **CSS / String Representations:**  
  • String: Typically converted to ACES or sRGB for display purposes.  
- **Direct Conversion Targets:**  
  - ACES, ACEScct, and via additional transforms, to RGB.  
- **References:**  
  - [ACEScc on ACES Central](https://acescentral.com)


## ACEScc

| Parameter | Name  | Range | Description                                      |
| --------- | ----- | ----- | ------------------------------------------------ |
| `r`       | Red   | 0-1   | ACEScc red color channel, logarithmic encoding   |
| `g`       | Green | 0-1   | ACEScc green color channel, logarithmic encoding |
| `b`       | Blue  | 0-1   | ACEScc blue color channel, logarithmic encoding  |

| Manipulation            | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Logarithmic Grading** | Applying color grading in a logarithmic curve to offer fine control over midtones. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scc.html