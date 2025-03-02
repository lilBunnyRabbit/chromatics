#### **ANSI**

- **Name:** ANSI  
- **Description:** Represents terminal color codes defined by ANSI standards, typically available in 16‑color and 256‑color palettes.  
- **Parameters:**

  | Parameter | Description                                  | Range  | Effect                                                     |
  | --------- | -------------------------------------------- | ------ | ---------------------------------------------------------- |
  | `code`    | ANSI color code identifier                   | Varies | Changing `code` selects a different pre-defined terminal color. |
  | `alpha`   | Opacity                                      | 0–1    | Controls transparency if applicable.                     |

- **Typed Array:** Uint8ClampedArray (suitable for discrete integer codes)  
- **Usage:** Useful in terminal and console applications for defining text and background colors in command-line interfaces.  
- **Modifications:**  
  • **Color Selection:** Adjust the `code` value to switch between available ANSI colors.  
- **CSS / String Representations:**  
  • String: Represented via escape sequences (e.g., `\x1b[31m` for red).  
- **Direct Conversion Targets:**  
  - Typically mapped to RGB for digital display purposes.  
- **References:**  
  - [ANSI16 Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/)

## ANSI (16 and 256)
(refers to color codes used in terminal emulators)

Based on the VGA color palette, there are models for 4-bit, 16 color codes and 8-bit, 256 color codes

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi256/