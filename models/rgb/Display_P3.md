#### **Display P3**

- **Name:** Display P3  
- **Description:** Similar to DCI P3 but optimized for display devices, offering a wide gamut and better color accuracy on modern monitors and mobile screens.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                         |
  | --------- | ------------- | ----- | -------------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Adjusting `r` enhances the red intensity for vibrant displays. |
  | `g`       | Green channel | 0–255 | Adjusting `g` enhances the green intensity.                    |
  | `b`       | Blue channel  | 0–255 | Adjusting `b` enhances the blue intensity.                     |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                         |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Common in modern devices (Apple devices, high-end monitors) where a wider gamut is desired for richer color reproduction.  
- **Modifications:**  
  • **Color Calibration:** Adjust channels to match display characteristics.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for web usage.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and DCI P3.  
- **References:**  
  - [Display P3 Overview](https://en.wikipedia.org/wiki/Display_P3)

## Display P3

| Parameter | Name  | Range | Description                                                                |
| --------- | ----- | ----- | -------------------------------------------------------------------------- |
| `r`       | Red   | 0-255 | Display P3 red color channel, similar to DCI P3 but for personal devices   |
| `g`       | Green | 0-255 | Display P3 green color channel, similar to DCI P3 but for personal devices |
| `b`       | Blue  | 0-255 | Display P3 blue color channel, similar to DCI P3 but for personal devices  |

| Manipulation                      | Description                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Cinema Color Grading**          | Adjusting colors for digital cinema within the DCI P3 color space.                             |
| **Wide Gamut Display Adjustment** | Tailoring colors for displays supporting the P3 color space, offering a wider gamut than sRGB. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-display-p3.html