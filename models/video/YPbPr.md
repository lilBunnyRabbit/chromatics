
#### **YPbPr**

- **Name:** YPbPr  
- **Description:** An analog component video format that separates the video signal into a luminance component and two color-difference signals (Pb and Pr), used in both analog and digital broadcast systems.  
- **Parameters:**

  | Parameter | Description            | Range  | Effect                                           |
  | --------- | ---------------------- | ------ | ------------------------------------------------ |
  | `Y`       | Luminance component    | Varies | Adjusting `Y` controls overall brightness.       |
  | `Pb`      | Blue-difference signal | Varies | Changing `Pb` affects the blue color difference. |
  | `Pr`      | Red-difference signal  | Varies | Changing `Pr` affects the red color difference.  |
  | `alpha`   | Opacity                | 0–1    | Controls transparency.                           |

- **Typed Array:** Float32Array  
- **Usage:** Common in component video transmission and analog/digital TV systems.  
- **Modifications:**  
  • **Signal Adjustment:** Alter `Pb` and `Pr` to correct color balance while controlling brightness with `Y`.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web usage.  
- **Direct Conversion Targets:**  
  - To/from RGB and YCbCr.  
- **References:**  
  - [Wikipedia: YPbPr](https://en.wikipedia.org/wiki/YPbPr)


##  YPbPr

| Parameter | Name            | Range  | Description                                                   |
| --------- | --------------- | ------ | ------------------------------------------------------------- |
| `Y`       | Luminance       | Varies | Represents the brightness of the color.                       |
| `Pb`      | Blue-difference | Varies | Represents the difference between the blue component and `Y`. |
| `Pr`      | Red-difference  | Varies | Represents the difference between the red component and `Y`.  |

| Manipulation             | Description                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Component Adjustment** | Adjusting `Pb` and `Pr` for color correction specific to component video signals. |

- https://en.wikipedia.org/wiki/YPbPr