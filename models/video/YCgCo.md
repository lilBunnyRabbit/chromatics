#### **YCgCo** (Optional Inclusion)

- **Name:** YCgCo  
- **Description:** A color model often used in video compression and computer graphics that separates luminance (Y) from chrominance components representing green (Cg) and an orange-blue difference (Co). It provides an efficient transform for color compression.  
- **Parameters:**

  | Parameter | Description             | Range                     | Effect                                           |
  | --------- | ----------------------- | ------------------------- | ------------------------------------------------ |
  | `Y`       | Luminance component     | 0–1 (normalized)          | Increasing `Y` brightens the image overall.      |
  | `Cg`      | Green-difference chroma | Approximately -0.5 to 0.5 | Adjusting `Cg` alters the green-magenta balance. |
  | `Co`      | Orange-blue chroma      | Approximately -0.5 to 0.5 | Adjusting `Co` shifts the red-blue balance.      |
  | `alpha`   | Opacity                 | 0–1                       | Controls transparency.                           |

- **Typed Array:** Float32Array (to handle fractional and negative values)  
- **Usage:** Useful in scenarios involving video compression or GPU-based graphics where efficient separation of luminance and chroma is beneficial.  
- **Modifications:**  
  • **Chroma Adjustments:** Modify `Cg` and `Co` to fine-tune color balance; adjust `Y` for overall brightness.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for final display.  
- **Direct Conversion Targets:**  
  - To/from RGB and other chroma-luminance formats.  
- **References:**  
  - [YCgCo on Wikipedia](https://en.wikipedia.org/wiki/YCgCo)
  - https://en.wikipedia.org/wiki/YCoCg