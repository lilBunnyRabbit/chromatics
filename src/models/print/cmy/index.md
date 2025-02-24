#### **CMY**

- **Name:** CMY  
- **Description:** Represents colors using Cyan, Magenta, and Yellow ink percentages. It is a subtractive model primarily used in printing to simulate the mixing of inks.  
- **Parameters:**

  | Parameter | Description            | Range | Effect                                   |
  | --------- | ---------------------- | ----- | ---------------------------------------- |
  | `c`       | Cyan ink percentage    | 0–100 | Increasing `c` deepens the cyan tone.    |
  | `m`       | Magenta ink percentage | 0–100 | Increasing `m` deepens the magenta tone. |
  | `y`       | Yellow ink percentage  | 0–100 | Increasing `y` deepens the yellow tone.  |
  | `alpha`   | Opacity                | 0–1   | Controls transparency.                   |

- **Typed Array:** Float32Array (provides fractional precision for percentage values)  
- **Usage:** Good for simulating subtractive color mixing in printing processes and color reproduction analysis.  
- **Modifications:**  
  • **Color Mixing:** Adjust any channel to simulate different ink proportions and achieve desired tints.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web display, as CSS does not directly support CMY.  
- **Direct Conversion Targets:**  
  - To/from CMYK, RGB.  
- **References:**  
  - [BlackIce CMY/CMYK](https://www.blackice.com/colorspaceCYMK.htm)


---

## [CMY](./CMY.ts)

| Parameter | Name    | Range | Description            |
| --------- | ------- | ----- | ---------------------- |
| `c`       | Cyan    | 0-100 | Cyan ink percentage    |
| `m`       | Magenta | 0-100 | Magenta ink percentage |
| `y`       | Yellow  | 0-100 | Yellow ink percentage  |

| Manipulation         | Description                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Color Mixing**     | Combining varying percentages of cyan, magenta, and yellow to produce a wide range of colors. |
| **Inversion to RGB** | Converting CMY values back to RGB by inverting each percentage.                               |

- https://www.blackice.com/colorspaceCYMK.htm