#### **xvYCC**

- **Name:** xvYCC  
- **Description:** A video color space that extends the standard YCC gamut, allowing for a wider range of colors—particularly useful for high-dynamic-range (HDR) content.  
- **Parameters:**

  | Parameter | Description                                   | Range        | Effect                                             |
  | --------- | --------------------------------------------- | ------------ | -------------------------------------------------- |
  | `Y`       | Luminance component                           | 0–255        | Increasing `Y` brightens the image.                |
  | `C1`      | First chrominance component (blue projection) | -128 to +127 | Adjusting `C1` alters the blue-related color bias. |
  | `C2`      | Second chrominance component (red projection) | -128 to +127 | Adjusting `C2` alters the red-related color bias.  |
  | `alpha`   | Opacity                                       | 0–1          | Controls transparency.                             |

- **Typed Array:** Float32Array (Chosen to accommodate negative chroma values and fractional precision)  
- **Usage:** Useful in video encoding, HDR broadcast, and applications requiring an extended color gamut.  
- **Modifications:**  
  • **Dynamic Range Adjustment:** Modify `Y` to change overall brightness while preserving chroma information.  
  • **Chroma Balancing:** Adjust `C1` and `C2` to fine-tune color differences.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for CSS display.  
- **Direct Conversion Targets:**  
  - To/from RGB and YCbCr.  
- **References:**  
  - [Wikipedia: xvYCC](https://en.wikipedia.org/wiki/XvYCC)

##  xvYCC

| Parameter | Name        | Range        | Description                                      |
| --------- | ----------- | ------------ | ------------------------------------------------ |
| `Y`       | Luminance   | 0-255        | Represents the brightness of the color.          |
| `C1`      | Chrominance | -128 to +127 | Color information, representing blue projection. |
| `C2`      | Chrominance | -128 to +127 | Color information, representing red projection.  |

| Manipulation                | Description                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Dynamic Range Expansion** | xvYCC allows for a wider color space than YCbCr, enabling more vibrant colors suitable for HDR content. |

- https://en.wikipedia.org/wiki/XvYCC
