
#### **sRGB**

- **Name:** sRGB  
- **Description:** The standard RGB color space for web and consumer devices, defined with a gamma curve to approximate human vision.  
- **Parameters:**

  | Parameter | Description                   | Range | Effect                                                            |
  | --------- | ----------------------------- | ----- | ----------------------------------------------------------------- |
  | `r`       | Red channel (gamma-corrected) | 0–255 | Adjusting `r` alters the red intensity on a gamma-adjusted scale. |
  | `g`       | Green channel                 | 0–255 | Adjusting `g` alters the green intensity.                         |
  | `b`       | Blue channel                  | 0–255 | Adjusting `b` alters the blue intensity.                          |
  | `alpha`   | Opacity                       | 0–1   | Controls transparency.                                            |

- **Typed Array:** Uint8ClampedArray (for consistency with web color specifications)  
- **Usage:** Widely used in web design, image display, and standard digital graphics.  
- **Modifications:**  
  • **Gamma Correction Adjustments:** Minor tweaks in channel values while preserving the gamma curve.  
  • **Brightness and Contrast Adjustments:** Modify channels uniformly to affect overall appearance.  
- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` and `rgba(r, g, b, a)`  
- **Direct Conversion Targets:**  
  - RGB255, Normalized RGB, Linear sRGB, and perceptual models via intermediate conversions.  
- **References:**  
  - [Wikipedia: sRGB](https://en.wikipedia.org/wiki/SRGB)

## sRGB

| Parameter | Name  | Range | Description                                       |
| --------- | ----- | ----- | ------------------------------------------------- |
| `r`       | Red   | 0-255 | Standard RGB red color channel, gamma-corrected   |
| `g`       | Green | 0-255 | Standard RGB green color channel, gamma-corrected |
| `b`       | Blue  | 0-255 | Standard RGB blue color channel, gamma-corrected  |

| Manipulation         | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| **Gamma Correction** | Adjusting the gamma to modify the luminance or brightness of the image.        |
| **Color Correction** | Applying color profiles for consistent color display across different devices. |

A standard RGB color space created cooperatively by HP and Microsoft for use on monitors, printers, and the Internet. It's a specific implementation of RGB designed to match typical home and office viewing conditions.

- https://en.wikipedia.org/wiki/SRGB
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-s-r-g-b.html