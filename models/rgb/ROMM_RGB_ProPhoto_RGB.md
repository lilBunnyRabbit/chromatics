#### **ROMM RGB / ProPhoto RGB**

- **Name:** ROMM RGB / ProPhoto RGB  
- **Description:** A very wide gamut color space designed for professional photography and high-end image editing, preserving maximum color information from RAW sensor data.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                              |
  | --------- | ------------- | ----- | ------------------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Increasing `r` enriches the red component across an extended gamut. |
  | `g`       | Green channel | 0–255 | Increasing `g` enriches the green component.                        |
  | `b`       | Blue channel  | 0–255 | Increasing `b` enriches the blue component.                         |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                              |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Preferred for advanced photo editing, high-resolution image storage, and situations requiring maximum color fidelity.  
- **Modifications:**  
  • **High-Fidelity Adjustments:** Fine control over channel values to preserve detail in extreme highlights and shadows.  
- **CSS / String Representations:**  
  • String: Converted to sRGB for standard display, as CSS does not support ProPhoto RGB directly.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and through ICC profiles to perceptual spaces like CIE Lab.  
- **References:**  
  - [ProPhoto RGB Overview](https://en.wikipedia.org/wiki/ProPhoto_RGB)

## ROMM RGB / ProPhoto RGB

| Parameter | Name  | Range | Description                                       |
| --------- | ----- | ----- | ------------------------------------------------- |
| `r`       | Red   | 0-255 | ProPhoto RGB red color channel, very wide gamut   |
| `g`       | Green | 0-255 | ProPhoto RGB green color channel, very wide gamut |
| `b`       | Blue  | 0-255 | ProPhoto RGB blue color channel, very wide gamut  |

| Manipulation                    | Description                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **High Fidelity Color Editing** | Adjusting colors in a space designed for professional photography with an extremely wide gamut. |


Also known as ROMM RGB, it's a color space developed by Kodak. It offers an even larger gamut than Adobe RGB, designed for advanced image editing and storage.

For high-end image editing, especially in professional photography where preserving as much color information as possible is crucial, ProPhoto RGB's wide gamut is invaluable. It's suited for editing RAW images from cameras before converting them to a more standard color space for distribution.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-r-o-m-m_-r-g-b.html
