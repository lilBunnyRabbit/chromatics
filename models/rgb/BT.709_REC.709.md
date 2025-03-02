#### **BT.709 / REC.709**

- **Name:** BT.709 / REC.709  
- **Description:** The standard RGB color space for HDTV, defining the color gamut for most broadcast and streaming content.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                           |
  | --------- | ------------- | ----- | ---------------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Adjusting `r` alters the red intensity in a standard HDTV range. |
  | `g`       | Green channel | 0–255 | Modifying `g` adjusts the green intensity.                       |
  | `b`       | Blue channel  | 0–255 | Adjusting `b` alters the blue intensity.                         |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                           |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Widely used in television broadcasting and streaming, ensuring consistent color reproduction in HDTV.  
- **Modifications:**  
  • **Brightness/Contrast Adjustments:** Uniform changes to all channels affect overall luminance and contrast.  
- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` and `rgba(r, g, b, a)`  
- **Direct Conversion Targets:**  
  - To/from sRGB, RGB255, and through conversion to perceptual models.  
- **References:**  
  - [BT.709 on Wikipedia](https://en.wikipedia.org/wiki/Rec._709)

## BT.709 / REC.709

| Parameter | Name  | Range | Description                                   |
| --------- | ----- | ----- | --------------------------------------------- |
| `r`       | Red   | 0-255 | BT.709 red color channel, standard for HDTV   |
| `g`       | Green | 0-255 | BT.709 green color channel, standard for HDTV |
| `b`       | Blue  | 0-255 | BT.709 blue color channel, standard for HDTV  |

| Manipulation                      | Description                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **Broadcast Standard Correction** | Adjusting colors to comply with standard HDTV broadcast color specifications. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-b-t709.html