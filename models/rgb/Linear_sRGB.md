
#### **Linear sRGB**

- **Name:** Linear sRGB  
- **Description:** A linearized version of sRGB where the gamma correction is removed. It is ideal for accurate color computations and blending before re-applying gamma correction for display.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                             |
  | --------- | ------------- | ----- | -------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` linearly increases red intensity.   |
  | `g`       | Green channel | 0–1   | Increasing `g` linearly increases green intensity. |
  | `b`       | Blue channel  | 0–1   | Increasing `b` linearly increases blue intensity.  |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                             |

- **Typed Array:** Float32Array (for precise linear calculations)  
- **Usage:** Used in image processing and compositing where linear color arithmetic is required.  
- **Modifications:**  
  • **Linear Blending:** Straightforward arithmetic operations for mixing and scaling.  
- **CSS / String Representations:**  
  • String: Typically converted back to sRGB for CSS output.  
- **Direct Conversion Targets:**  
  - sRGB (via gamma correction), Normalized RGB, and other color spaces through linear transformations.  
- **References:**  
  - [Linear sRGB Overview](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

## Linear sRGB

| Parameter | Name  | Range | Description                                 |
| --------- | ----- | ----- | ------------------------------------------- |
| `r`       | Red   | 0-1   | Linear space red without gamma correction   |
| `g`       | Green | 0-1   | Linear space green without gamma correction |
| `b`       | Blue  | 0-1   | Linear space blue without gamma correction  |

| Manipulation                   | Description                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| **Linear Contrast Adjustment** | Direct contrast adjustments in the linear space before applying gamma correction for display. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-linear-s-r-g-b.html