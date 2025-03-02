#### **TSL**

- **Name:** TSL  
- **Description:** A color model using Tint, Saturation, and Lightness. It is similar to HSL but emphasizes a "tint" parameter as an alternative to traditional hue, offering a different approach to color representation.  
- **Parameters:**

  | Parameter | Description                                  | Range  | Effect                                                     |
  | --------- | -------------------------------------------- | ------ | ---------------------------------------------------------- |
  | `t`       | Tint (a variant of hue)                      | 0–360  | Changing `t` rotates the perceived color tone.           |
  | `s`       | Saturation (color intensity)                | 0–1    | 0 yields gray; 1 gives full saturation.                  |
  | `l`       | Lightness (brightness)                       | 0–1    | 0 is black, 1 is white; intermediate values mix the tone.|
  | `alpha`   | Opacity                                      | 0–1    | Controls transparency.                                   |

- **Typed Array:** Float32Array  
- **Usage:** May be used in niche applications where a tint-based model is preferred over traditional hue-based models.  
- **Modifications:**  
  • **Tint Rotation:** Adjust `t` to change the base color tone.  
  • **Saturation & Lightness:** Modify `s` and `l` to affect color intensity and brightness.  
- **CSS / String Representations:**  
  • String: Not directly supported in CSS; typically converted to HSL or RGB for display.  
- **Direct Conversion Targets:**  
  - To/from HSL and RGB.  
- **References:**  
  - [Wikipedia: TSL Color Space](https://en.wikipedia.org/wiki/TSL_color_space)

##  TSL
(Tint, Saturation, Lightness - less common)

| Parameter | Name       | Range | Description                |
| --------- | ---------- | ----- | -------------------------- |
| `t`       | Tint       | 0-360 | Hue or color tint.         |
| `s`       | Saturation | 0-1   | Color intensity or purity. |
| `l`       | Lightness  | 0-1   | Brightness of the color.   |

| Manipulation              | Description                                         |
| ------------------------- | --------------------------------------------------- |
| **Color Adjustment**      | Modifying `t` to change the color hue.              |
| **Saturation Control**    | Increasing or decreasing `s` to alter color purity. |
| **Brightness Modulation** | Adjusting `l` to make colors lighter or darker.     |


- https://en.wikipedia.org/wiki/TSL_color_space