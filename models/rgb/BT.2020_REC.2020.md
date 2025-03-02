#### **BT.2020 / REC.2020**

- **Name:** BT.2020 / REC.2020  
- **Description:** An RGB color space standard for Ultra High Definition (UHD) television, offering a wider gamut suitable for HDR content.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                        |
  | --------- | ------------- | ----- | ------------------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` intensifies the red component in a wide gamut. |
  | `g`       | Green channel | 0–1   | Adjusting `g` increases the green intensity.                  |
  | `b`       | Blue channel  | 0–1   | Increasing `b` intensifies the blue component.                |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                        |

- **Typed Array:** Float32Array  
- **Usage:** Used in UHD TVs and HDR displays, critical for video workflows with extended color ranges.  
- **Modifications:**  
  • **HDR Adjustments:** Fine-tune channel values to optimize for high dynamic range content.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for standard web display.  
- **Direct Conversion Targets:**  
  - To/from sRGB and other broadcast standards.  
- **References:**  
  - [BT.2020 on Wikipedia](https://en.wikipedia.org/wiki/Rec._2020)


## BT.2020 / REC.2020

| Parameter | Name  | Range | Description                                               |
| --------- | ----- | ----- | --------------------------------------------------------- |
| `r`       | Red   | 0-1   | BT.2020 red color channel, wider color gamut for UHD TV   |
| `g`       | Green | 0-1   | BT.2020 green color channel, wider color gamut for UHD TV |
| `b`       | Blue  | 0-1   | BT.2020 blue color channel, wider color gamut for UHD TV  |
 
| Manipulation          | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| **HDR Color Grading** | Adjusting colors and brightness for High Dynamic Range content. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-b-t2020.html