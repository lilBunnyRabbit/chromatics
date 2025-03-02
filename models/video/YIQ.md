
#### **YIQ**

- **Name:** YIQ  
- **Description:** A color model used in the NTSC television system, separating luminance (Y) from two chrominance components (I and Q) to efficiently encode color information for analog broadcasting.  
- **Parameters:**

  | Parameter | Description                         | Range  | Effect                                                      |
  | --------- | ----------------------------------- | ------ | ----------------------------------------------------------- |
  | `Y`       | Luminance component                 | Varies | Adjusting `Y` influences overall brightness.                |
  | `I`       | In-phase component (orange-cyan)    | Varies | Adjusting `I` shifts the color balance towards orange/cyan. |
  | `Q`       | Quadrature component (purple-green) | Varies | Adjusting `Q` shifts the balance towards purple/green.      |
  | `alpha`   | Opacity                             | 0–1    | Controls transparency.                                      |

- **Typed Array:** Float32Array  
- **Usage:** Primarily used in NTSC broadcasting for analog TV systems.  
- **Modifications:**  
  • **Color Balancing:** Adjust `I` and `Q` to fine-tune chrominance while `Y` sets brightness.  
- **CSS / String Representations:**  
  • String: Not directly used in CSS; conversion to RGB is required for display.  
- **Direct Conversion Targets:**  
  - To/from RGB and indirectly to other broadcast standards.  
- **References:**  
  - [Wikipedia: YIQ](https://en.wikipedia.org/wiki/YIQ)


##  YIQ

| Parameter | Name       | Range  | Description                                    |
| --------- | ---------- | ------ | ---------------------------------------------- |
| `Y`       | Luminance  | Varies | Represents the brightness of the color.        |
| `I`       | In-phase   | Varies | Chrominance component related to orange-cyan.  |
| `Q`       | Quadrature | Varies | Chrominance component related to purple-green. |

| Manipulation            | Description                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Analog Broadcasting** | Primarily used in the NTSC color TV broadcasting system for separating color information. |

- https://en.wikipedia.org/wiki/YIQ
- https://www.blackice.com/colorspaceYIQ.htm