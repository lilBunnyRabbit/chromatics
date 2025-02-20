# **RGB255**

- **Name:** RGB255  
- **Description:** Represents colors using red, green, and blue channels as integers from 0 to 255. It’s the de facto digital standard for color representation on screens.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                          |
  | --------- | ------------- | ----- | ----------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Increasing `r` intensifies the red component.   |
  | `g`       | Green channel | 0–255 | Increasing `g` intensifies the green component. |
  | `b`       | Blue channel  | 0–255 | Increasing `b` intensifies the blue component.  |
  | `alpha`   | Opacity       | 0–1   | 0 is fully transparent; 1 is fully opaque.      |

- **Typed Array:** Uint8ClampedArray (ensures values are clamped within 0–255)  
- **Usage:** Ideal for web development and UI applications where colors are defined in integer-based formats.  
- **Modifications:**  
  • **Inversion:** Compute `255 - value` for each channel.  
  • **Brightness Adjustment:** Add/subtract a constant from all channels (with clamping).  
- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` or `rgba(r, g, b, a)`  
- **Direct Conversion Targets:**  
  - Normalized RGB, sRGB, Linear sRGB, and via those to perceptual models like CIE Lab.  
- **References:**  
  - [Wikipedia: RGB Color Model](https://en.wikipedia.org/wiki/RGB_color_model)


--- OLD ---

## [RGB](./RGB255.ts)

| Parameter | Name  | Range | Description         |
| --------- | ----- | ----- | ------------------- |
| `r`       | Red   | 0-255 | Red color channel   |
| `g`       | Green | 0-255 | Green color channel |
| `b`       | Blue  | 0-255 | Blue color channel  |

| Manipulation              | Description                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contrast Adjustment**   | By scaling the differences between the RGB values and a midpoint, you can adjust the contrast of an image.                                          |
| **Color Inversion**       | Inverting colors can be easily done by subtracting each channel value from the maximum possible value (e.g., 255 - R, 255 - G, 255 - B).            |
| **Brightness Adjustment** | Adjusting the brightness involves increasing or decreasing all three RGB values equally.                                                            |
| **Color Tinting**         | Adding a specific amount to one or two of the RGB channels can tint the image towards a certain color.                                              |
| **Grayscale Conversion**  | Converting an image to grayscale can be done by setting all three channels to the same value, often the average of the original RGB values.         |
| **Saturation Adjustment** | Increasing saturation involves amplifying the difference from each RGB channel to the grayscale level, while decreasing it reduces this difference. |
| **Color Balancing**       | Adjusting the intensity of the individual red, green, and blue channels to correct or change color casts.                                           |

The RGB model is fundamental for any digital color manipulation, as it directly corresponds to the way colors are displayed on screens. sRGB is a specific RGB color space that defines a specific set of colors to be consistent across different devices, making it essential for web development and applications intended for consumer displays.

- https://en.wikipedia.org/wiki/RGB_color_spaces
- https://en.wikipedia.org/wiki/RGB_color_model