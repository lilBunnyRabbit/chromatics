#### **CMYK**

- **Name:** CMYK  
- **Description:** Extends the CMY model by including a Key (black) component, which is essential for practical color printing.  
- **Parameters:**

  | Parameter | Description                | Range | Effect                                                            |
  | --------- | -------------------------- | ----- | ----------------------------------------------------------------- |
  | `c`       | Cyan ink percentage        | 0–100 | Increasing `c` adds cyan, altering the overall color balance.     |
  | `m`       | Magenta ink percentage     | 0–100 | Increasing `m` adds magenta, shifting the color toward red tones. |
  | `y`       | Yellow ink percentage      | 0–100 | Increasing `y` adds yellow, affecting the warmth of the color.    |
  | `k`       | Key (black) ink percentage | 0–100 | Increasing `k` darkens the overall color by adding black.         |
  | `alpha`   | Opacity                    | 0–1   | Controls transparency.                                            |

- **Typed Array:** Float32Array  
- **Usage:** Standard in commercial printing, used to model how inks mix on paper to produce a wide range of colors.  
- **Modifications:**  
  • **Tint/Shade Adjustment:** Changing `k` shifts the overall darkness, while `c`, `m`, and `y` adjust the hue and saturation.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB since CSS does not natively support CMYK.  
- **Direct Conversion Targets:**  
  - To/from CMY, RGB.  
- **References:**  
  - [Wikipedia: CMYK Color Model](https://en.wikipedia.org/wiki/CMYK_color_model)

---

## [CMYK](./CMYK.ts)

| Parameter | Name    | Range | Description            |
| --------- | ------- | ----- | ---------------------- |
| `c`       | Cyan    | 0-100 | Cyan ink percentage    |
| `m`       | Magenta | 0-100 | Magenta ink percentage |
| `y`       | Yellow  | 0-100 | Yellow ink percentage  |
| `k`       | Key     | 0-100 | Black ink percentage   |

| Manipulation                  | Description                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **Tint and Shade Adjustment** | Adding or reducing the amount of key (black) ink to adjust the tint or shade of the color.    |
| **Color Separation**          | Preparing images for printing by separating into individual color components including black. |


Essential for applications targeting printed materials, as it corresponds to the color mixing process of printers. Implementing CMYK allows for accurate color representation in print design workflows.

- https://en.wikipedia.org/wiki/CMYK_color_model
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-c-m-y-k/
