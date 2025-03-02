#### **IPT**

- **Name:** IPT  
- **Description:** A perceptual color model based on LMS cone responses, representing colors in terms of Intensity, Protan (red-green), and Tritan (blue-yellow) components. It is designed for high-fidelity color difference evaluations.  
- **Parameters:**

  | Parameter | Description                            | Range                     | Effect                                              |
  | --------- | -------------------------------------- | ------------------------- | --------------------------------------------------- |
  | `I`       | Intensity; overall brightness          | 0–1                       | Increasing `I` increases the brightness.            |
  | `P`       | Protan; red-green opponent component   | Approximately -0.5 to 0.5 | Adjusting `P` shifts the color toward red or green. |
  | `T`       | Tritan; blue-yellow opponent component | Approximately -0.5 to 0.5 | Modifying `T` alters the blue-yellow balance.       |
  | `alpha`   | Opacity                                | 0–1                       | Controls transparency.                              |

- **Typed Array:** Float32Array  
- **Usage:** Suitable for advanced image processing and precise color difference assessments where perceptual uniformity is critical.  
- **Modifications:**  
  • **Brightness Adjustment:** Change `I` for overall luminance control.  
  • **Color Opponency:** Adjust `P` and `T` for fine-tuning of color balance.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for display, as no direct CSS representation exists.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab, LCHuv, and other perceptual models.  
- **References:**  
  - [IPT Color Model Reference](https://www.researchgate.net/publication/228652837_IPT_A_Perceptual_Color_Space_for_Image_Quality_Assessment)