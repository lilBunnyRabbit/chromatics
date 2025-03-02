#### **YUV**

- **Name:** YUV  
- **Description:** A color model used in analog television and some digital video formats that separates luminance (Y) from chrominance (U and V), historically important for backward compatibility with black-and-white TV.  
- **Parameters:**

  | Parameter | Description                             | Range  | Effect                                       |
  | --------- | --------------------------------------- | ------ | -------------------------------------------- |
  | `Y`       | Luminance component                     | Varies | Adjusting `Y` alters the overall brightness. |
  | `U`       | Chrominance component (blue projection) | Varies | Modifying `U` influences the blue chroma.    |
  | `V`       | Chrominance component (red projection)  | Varies | Modifying `V` influences the red chroma.     |
  | `alpha`   | Opacity                                 | 0–1    | Controls transparency.                       |

- **Typed Array:** Float32Array  
- **Usage:** Historically used in analog TV systems; still relevant in some digital video processing contexts.  
- **Modifications:**  
  • **Color Tuning:** Adjust `U` and `V` for fine chroma adjustments while `Y` controls brightness.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web display.  
- **Direct Conversion Targets:**  
  - To/from RGB and similar YCbCr systems.  
- **References:**  
  - [BlackIce: YUV Colorspace](https://www.blackice.com/colorspaceYUV.htm)

##  YUV

| Parameter | Name        | Range  | Description                             |
| --------- | ----------- | ------ | --------------------------------------- |
| `Y`       | Luminance   | Varies | Represents the brightness of the color. |
| `U`       | Chrominance | Varies | Chrominance component related to blue.  |
| `V`       | Chrominance | Varies | Chrominance component related to red.   |

| Manipulation               | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| **Color Space Conversion** | Often converted to and from RGB for processing and display. |

Similar to YCbCr, it's used in video systems to separate the luminance from the chrominance components. YUV is commonly used in European color television broadcasting.

- https://www.blackice.com/colorspaceYUV.htm