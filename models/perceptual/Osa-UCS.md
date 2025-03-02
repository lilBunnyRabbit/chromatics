
#### **Osa-UCS**

- **Name:** Osa-UCS  
- **Description:** A color space developed by the Optical Society of America to provide a uniform scale for color differences, making it useful for industrial color matching.  
- **Parameters:**

  | Parameter | Description      | Range                    | Effect                                                       |
  | --------- | ---------------- | ------------------------ | ------------------------------------------------------------ |
  | `L`       | Lightness        | 0–100                    | Higher `L` yields a lighter color.                           |
  | `a`       | Red-green axis   | (Typically -100 to +100) | Adjusting `a` shifts the color along the red-green spectrum. |
  | `b`       | Blue-yellow axis | (Typically -100 to +100) | Changing `b` adjusts the color along the blue-yellow axis.   |
  | `alpha`   | Opacity          | 0–1                      | Controls transparency.                                       |

- **Typed Array:** Float32Array  
- **Usage:** Useful for applications requiring precise color matching and quality control, especially in industrial design.  
- **Modifications:**  
  • **Lightness and Color Balance:** Modify `L`, `a`, and `b` to fine-tune color appearance.  
- **CSS / String Representations:**  
  • String: Generally converted to RGB or Lab for display.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab and other uniform color spaces.  
- **References:**  
  - [Osa-UCS Reference](https://www.osapublishing.org/abstract.cfm?uri=JOSAA-3-12-2050)