#### **DCI P3**

- **Name:** DCI P3  
- **Description:** A color space developed for digital cinema, offering a wider gamut than sRGB and used in high-end display systems and digital projectors.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                       |
  | --------- | ------------- | ----- | ------------------------------------------------------------ |
  | `r`       | Red channel   | 0–255 | Adjusting `r` intensifies the red component in a wide gamut. |
  | `g`       | Green channel | 0–255 | Adjusting `g` increases the green intensity.                 |
  | `b`       | Blue channel  | 0–255 | Adjusting `b` increases the blue intensity.                  |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                       |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Predominantly used in digital cinema and increasingly in high-end monitors and mobile devices for accurate, wide gamut color reproduction.  
- **Modifications:**  
  • **Gamut Tuning:** Adjust channel values to maintain consistency across different devices.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for standard web display.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and Display P3.  
- **References:**  
  - [DCI P3 on Wikipedia](https://en.wikipedia.org/wiki/DCI-P3)

## DCI P3

| Parameter | Name  | Range | Description                                        |
| --------- | ----- | ----- | -------------------------------------------------- |
| `r`       | Red   | 0-255 | DCI P3 red color channel, used in digital cinema   |
| `g`       | Green | 0-255 | DCI P3 green color channel, used in digital cinema |
| `b`       | Blue  | 0-255 | DCI P3 blue color channel, used in digital cinema  |

| Manipulation                      | Description                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Cinema Color Grading**          | Adjusting colors for digital cinema within the DCI P3 color space.                             |
| **Wide Gamut Display Adjustment** | Tailoring colors for displays supporting the P3 color space, offering a wider gamut than sRGB. |

A color space created by Digital Cinema Initiatives that offers a wider gamut than sRGB, used in digital cinema and has been adopted for use in high-end mobile devices, laptops, and monitors.

For applications targeting Apple devices or modern displays that support a wider color gamut, implementing P3 can enhance the visual experience by making use of a broader range of colors.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-d-c-i_-p3.html
