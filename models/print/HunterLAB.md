#### **HunterLAB**

- **Name:** HunterLAB  
- **Description:** A color model developed for industrial color measurement. It offers an alternative to CIE Lab with parameters based on reflectance and is used for quality control and precise color difference calculations.  
- **Parameters:**

  | Parameter | Description                   | Range  | Effect                                                          |
  | --------- | ----------------------------- | ------ | --------------------------------------------------------------- |
  | `L`       | Lightness (reflectance-based) | 0–100  | Increasing `L` makes the color appear lighter.                  |
  | `a`       | Red–green coordinate          | Varies | Adjusting `a` shifts the color along the red-green axis.        |
  | `b`       | Blue–yellow coordinate        | Varies | Changing `b` adjusts the color balance between blue and yellow. |
  | `alpha`   | Opacity                       | 0–1    | Controls transparency.                                          |

- **Typed Array:** Float32Array  
- **Usage:** Good for industrial applications and color quality control where precise color matching is critical.  
- **Modifications:**  
  • **Color Correction:** Adjust `a` and `b` to correct color casts and ensure consistency.  
- **CSS / String Representations:**  
  • String: Not directly used in CSS; typically converted to a more common model for display.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab and other perceptual models.  
- **References:**  
  - [Wikipedia: Hunter Lab](https://en.wikipedia.org/wiki/Hunter_Lab)

## HunterLAB

| Parameter | Name        | Range  | Description                       |
| --------- | ----------- | ------ | --------------------------------- |
| `L`       | Lightness   | 0-100  | Reflectance or lightness of color |
| `a`       | Red/Green   | Varies | Red vs. green coordinate          |
| `b`       | Yellow/Blue | Varies | Yellow vs. blue coordinate        |

| Manipulation           | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **Color Correction**   | Adjusting `a` and `b` to correct or alter color balance towards or away from green, red, blue, or yellow. |
| **Brightness Control** | Modifying `L` to make the color appear lighter or darker.                                                 |

- https://en.wikipedia.org/wiki/Hunter_Lab