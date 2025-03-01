#### **CIE XYZ**

- **Name:** CIE XYZ  
- **Description:** The foundational color space defined by the CIE that models human color vision. It serves as a reference for many color conversions and is essential for device-independent color management.  
- **Parameters:**

  | Parameter | Description                                       | Range            | Effect                                                     |
  | --------- | ------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
  | `X`       | X component (related to red/green cone responses) | 0–∞ (normalized) | Adjusting `X` influences the balance of red-green stimuli. |
  | `Y`       | Y component; corresponds to luminance             | 0–∞              | Modifying `Y` changes perceived brightness.                |
  | `Z`       | Z component (related to blue cone response)       | 0–∞              | Adjusting `Z` affects the blue perception.                 |
  | `alpha`   | Opacity                                           | 0–1              | Controls transparency.                                     |

- **Typed Array:** Float32Array  
- **Usage:** Essential for converting between different color spaces; serves as an intermediate space for many conversions.  
- **Modifications:**  
  • **Luminance Control:** Modify `Y` to change brightness.  
  • **Color Balancing:** Adjust `X` and `Z` to influence chromatic balance.  
- **CSS / String Representations:**  
  • String: No native CSS representation; typically converted to RGB.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab, LCHab, and RGB.  
- **References:**  
  - [Wikipedia: CIE 1931 Color Space](https://en.wikipedia.org/wiki/CIE_1931_color_space)

---

## [CIE XYZ](./XYZ.ts)

| Parameter | Name        | Range | Description                                                            |
| --------- | ----------- | ----- | ---------------------------------------------------------------------- |
| `X`       | X Component | 0-∞   | A mix of response curves from cones that correlates to color matching. |
| `Y`       | Y Component | 0-∞   | The luminance component, which correlates to brightness.               |
| `Z`       | Z Component | 0-∞   | Somewhat equal to blue, or the S cone response from the human eye.     |

| Manipulation          | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Color Matching**    | Adjusting `X`, `Y`, `Z` to match colors under different lighting.                   |
| **Luminance Control** | Modifying `Y` to change brightness while keeping color hue and saturation constant. |

The XYZ color model is common used as a profile connection space when converting between other models.
The XYZ model has multiple color spaces that are defined relative to a white point. The default white point is D65.

The first mathematically defined color space that includes all perceivable colors. It's the basis for many other color spaces. While you mentioned XYZ, delving deeper into its applications or implementing variations for different illuminants could be beneficial.

Serving as a foundation for many other color spaces, understanding and possibly converting colors to and from XYZ can be useful for achieving precise color matching and for scientific applications of color.

- https://en.wikipedia.org/wiki/CIE_1931_color_space
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-x-y-z-color-spaces/
- https://www.easyrgb.com/en/math.php#text2