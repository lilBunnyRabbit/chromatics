#### **CAM16-UCS**

- **Name:** CAM16-UCS  
- **Description:** A uniform color space derived from the CAM16 color appearance model that offers improved perceptual uniformity. It is especially useful for computing color differences and making precise color adjustments in advanced imaging workflows.  
- **Parameters:**

  | Parameter | Description                            | Range                      | Effect                                                                             |
  | --------- | -------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
  | `J'`      | Uniform lightness                      | 0–100                      | Increasing `J'` results in a brighter, perceptually uniform color.                 |
  | `a'`      | Uniform red-green opponent dimension   | Approximately -100 to +100 | Adjusting `a'` shifts the color balance along the red-green axis in a uniform way. |
  | `b'`      | Uniform blue-yellow opponent dimension | Approximately -100 to +100 | Adjusting `b'` uniformly alters the blue-yellow balance.                           |
  | `alpha`   | Opacity                                | 0–1                        | Controls transparency.                                                             |

- **Typed Array:** Float32Array  
- **Usage:** Particularly valuable in professional imaging, color grading, and applications requiring precise color difference calculations and perceptual uniformity.  
- **Modifications:**  
  • **Uniform Lightness Control:** Adjust `J'` for consistent brightness changes.  
  • **Chromatic Balancing:** Modify `a'` and `b'` for perceptually uniform color corrections.  
- **CSS / String Representations:**  
  • String: Typically converted to more common spaces (such as CIE Lab or RGB) for display; direct CSS representation is not available.  
- **Direct Conversion Targets:**  
  - To/from CAM16, CIE Lab, and RGB via appropriate transformation formulas.  
- **References:**  
  - [CAM16-UCS Research Article](https://www.researchgate.net/publication/317268979_CAM16-UCS)