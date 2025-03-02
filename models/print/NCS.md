
#### **NCS (Natural Color System)**

- **Name:** NCS (Natural Color System)  
- **Description:** A perceptual color system based on human vision, primarily used in Europe for design and architecture. It describes colors through perceptual attributes rather than strict numerical values.  
- **Parameters:**

  | Parameter | Description               | Range | Effect                                                    |
  | --------- | ------------------------- | ----- | --------------------------------------------------------- |
  | `H`       | Hue (perceived color)     | N/A   | Describes the basic hue; more categorical than numerical. |
  | `S`       | Saturation (colorfulness) | N/A   | Indicates the intensity or purity of the color.           |
  | `L`       | Lightness (brightness)    | N/A   | Describes how light or dark the color appears.            |
  | `alpha`   | Opacity                   | 0–1   | Controls transparency.                                    |

- **Typed Array:** Float32Array (if numerical representations are standardized; otherwise values may be treated categorically)  
- **Usage:** Widely used in interior design, architecture, and product design where a perceptual description of color is preferred.  
- **Modifications:**  
  • **Perceptual Adjustments:** Altering the values (once numerically mapped) changes the perceived hue, saturation, and brightness.  
- **CSS / String Representations:**  
  • String: Not directly representable in CSS; requires conversion to a standard model like RGB.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab and RGB (using specialized conversion formulas).  
- **References:**  
  - [NCS Color System](https://en.wikipedia.org/wiki/Natural_Color_System)


## NCS (Natural Color System)

| Parameter | Name       | Range | Description                                    |
| --------- | ---------- | ----- | ---------------------------------------------- |
| `H`       | Hue        | N/A   | Perceived color attribute (e.g., red, yellow). |
| `S`       | Saturation | N/A   | Colorfulness of the hue.                       |
| `L`       | Lightness  | N/A   | Perceived brightness of the color.             |

| Manipulation            | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Color Specification** | Defining colors based on human perception for accurate color communication and design. |
