
#### **Adobe RGB**

- **Name:** Adobe RGB  
- **Description:** A wide-gamut RGB color space developed by Adobe, offering a broader range of colors than sRGB, which is particularly beneficial for professional photography and print.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                    |
  | --------- | ------------- | ----- | --------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Increasing `r` boosts red intensity within a wider gamut. |
  | `g`       | Green channel | 0–255 | Adjusting `g` enhances the green component.               |
  | `b`       | Blue channel  | 0–255 | Increasing `b` enhances the blue component.               |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                    |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Ideal for print and professional photo editing where color accuracy and gamut are critical.  
- **Modifications:**  
  • **Gamut Adjustments:** Tweak channels to maintain color fidelity across devices.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for web display.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and through color profiles to CIE Lab.  
- **References:**  
  - [Adobe RGB on Wikipedia](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)

## Adobe RGB

| Parameter | Name  | Range | Description                                |
| --------- | ----- | ----- | ------------------------------------------ |
| `r`       | Red   | 0-255 | Adobe RGB red color channel, wider gamut   |
| `g`       | Green | 0-255 | Adobe RGB green color channel, wider gamut |
| `b`       | Blue  | 0-255 | Adobe RGB blue color channel, wider gamut  |

| Manipulation         | Description                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Gamut Adjustment** | Adjusting colors within the Adobe RGB gamut, suitable for printing and digital art requiring a wide color gamut. |

A color space developed by Adobe Systems, Inc. that provides a wider gamut of colors than sRGB, making it suitable for high-quality print graphics.

For applications that involve high-quality print graphics or need a wider color gamut than sRGB, Adobe RGB can be beneficial. It's particularly useful for projects that will be printed on high-quality printers or need to match colors across different media types.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-adobe-r-g-b.html