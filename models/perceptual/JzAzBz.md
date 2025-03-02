
#### **JzAzBz**

- **Name:** JzAzBz  
- **Description:** A perceptually uniform color space designed so that Euclidean distances correlate with perceived color differences, making it ideal for precise color difference (ΔE) calculations.  
- **Parameters:**

  | Parameter | Description                    | Range                         | Effect                                          |
  | --------- | ------------------------------ | ----------------------------- | ----------------------------------------------- |
  | `Jz`      | Lightness-like component       | 0–1 (or scaled appropriately) | Adjusting `Jz` affects perceived brightness.    |
  | `Az`      | Red-green opponent component   | Approximately -0.5 to 0.5     | Shifting `Az` adjusts the red-green balance.    |
  | `Bz`      | Blue-yellow opponent component | Approximately -0.5 to 0.5     | Modifying `Bz` affects the blue-yellow balance. |
  | `alpha`   | Opacity                        | 0–1                           | Controls transparency.                          |

- **Typed Array:** Float32Array  
- **Usage:** Particularly useful in advanced image analysis and color difference assessments due to its high perceptual uniformity.  
- **Modifications:**  
  • **Brightness:** Adjust `Jz` to affect lightness.  
  • **Color Shifts:** Modify `Az` and `Bz` for fine-tuning color nuances.  
- **CSS / String Representations:**  
  • String: Not directly representable in CSS; conversion to RGB is common.  
- **Direct Conversion Targets:**  
  - To/from JzCzHz and indirectly to/from RGB.  
- **References:**  
  - [JzAzBz on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-az-bz/)

## JzAzBz
JzAzBz is a perceptually uniform space where euclidean distance predicts perceptual difference.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-az-bz/