#### **sYCC**

- **Name:** sYCC  
- **Description:** A color space used in digital camera systems that balances between the sRGB gamut and extended color representations, offering additional flexibility in color saturation and reproduction.  
- **Parameters:**

  | Parameter | Description                             | Range  | Effect                                           |
  | --------- | --------------------------------------- | ------ | ------------------------------------------------ |
  | `Y`       | Luminance component                     | Varies | Adjusting `Y` changes the overall brightness.    |
  | `Cb`      | Chrominance component (blue-difference) | Varies | Adjusting `Cb` affects the blue color deviation. |
  | `Cr`      | Chrominance component (red-difference)  | Varies | Adjusting `Cr` affects the red color deviation.  |
  | `alpha`   | Opacity                                 | 0–1    | Controls transparency.                           |

- **Typed Array:** Float32Array  
- **Usage:** Employed in digital imaging pipelines to achieve a balance between strict sRGB reproduction and the need for more flexible color saturation.  
- **Modifications:**  
  • **Color Fine-Tuning:** Adjust `Cb` and `Cr` for chroma correction while controlling brightness with `Y`.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web display.  
- **Direct Conversion Targets:**  
  - To/from RGB and other YCbCr-based models.  
- **References:**  
  - [sYCC on Wikipedia](https://en.wikipedia.org/wiki/SYCC)