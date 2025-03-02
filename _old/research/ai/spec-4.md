Below are detailed specifications for the three additional models—YCgCo, IPT, and HCT—formatted in the same style as your existing entries. I've also included recommendations on where to place them within your documentation structure.

---

### Additional Models

#### **YCgCo**

- **Name:** YCgCo  
- **Description:**  
  A color model used mainly in image and video compression. It separates luminance (Y) from chrominance components (Cg and Co) and offers an efficient, reversible transform that can improve compression efficiency.

- **Parameters:**

  | Parameter | Description                                   | Range (approx.) | Typed Array      | Effect When Modified                                                     |
  | --------- | --------------------------------------------- | --------------- | ---------------- | ------------------------------------------------------------------------ |
  | `Y`       | Luminance: Overall brightness               | 0–1             | Float32Array     | Increasing `Y` makes the color appear brighter.                        |
  | `Cg`      | Green chrominance: Represents green content | ~ -0.5–0.5      | Float32Array     | Modifying `Cg` shifts the green-magenta balance.                         |
  | `Co`      | Orange chrominance: Represents red-blue info  | ~ -0.5–0.5      | Float32Array     | Changing `Co` adjusts the red-blue balance.                              |
  | `a`       | Alpha (opacity)                               | 0–1             | Float32Array     | Controls transparency; 0 is fully transparent, 1 is opaque.              |

- **Usage:**  
  Primarily used in video coding and image compression workflows where separating luma from chroma can reduce redundancy. Can be converted to/from RGB for display purposes.

- **Modifications:**  
  • **Luminance Adjustments:** Change `Y` to alter brightness.  
  • **Chrominance Shifts:** Adjust `Cg` and `Co` to modify color balance.  
  • **Alpha Handling:** Modify `a` to control opacity.

- **CSS / String Representations:**  
  Typically not used directly in CSS; conversion to RGB (and then to a CSS string) is recommended.

- **References:**  
  - Articles and research on reversible color transforms in video compression.  
  - Standard video coding documentation.

- **Direct Conversion Targets:**  
  Can be directly converted to/from RGB and potentially serve as an intermediary for other video-related color spaces.

> **Placement in Documentation:**  
> Include YCgCo in the **"Other Models"** section. Alternatively, if you wish to emphasize its video compression utility, you could create a sub-section under **"Video and Broadcast Standards Models"** for transform-based models.

---

#### **IPT**

- **Name:** IPT  
- **Description:**  
  A perceptually uniform color space derived from transforming LMS cone responses. IPT stands for Intensity, Protan, and Tritan. It aims to match human vision more closely and is useful for accurate color difference and appearance modeling.

- **Parameters:**

  | Parameter | Description                                 | Range (approx.) | Typed Array      | Effect When Modified                                                        |
  | --------- | ------------------------------------------- | --------------- | ---------------- | --------------------------------------------------------------------------- |
  | `I`       | Intensity: Overall brightness             | 0–1             | Float32Array     | Increasing `I` brightens the color overall.                               |
  | `P`       | Protan: Encodes red-green differences       | ~ -0.5–0.5      | Float32Array     | Adjusting `P` shifts the balance between red and green perceptions.         |
  | `T`       | Tritan: Encodes blue-yellow differences     | ~ -0.5–0.5      | Float32Array     | Modifying `T` changes the blue-yellow balance.                             |
  | `a`       | Alpha (opacity)                             | 0–1             | Float32Array     | Controls transparency.                                                     |

- **Usage:**  
  Particularly useful in image processing, color difference evaluations, and advanced appearance modeling. It provides a perceptual basis for comparing colors with higher accuracy than some traditional models.

- **Modifications:**  
  • **Brightness:** Modify `I` to adjust overall luminance.  
  • **Color Balance:** Tweak `P` and `T` for red-green and blue-yellow corrections respectively.  
  • **Alpha Changes:** Adjust `a` as needed for opacity effects.

- **CSS / String Representations:**  
  Since IPT isn’t standard in CSS, conversion to a display-friendly model (such as RGB or HSL) is recommended for string output.

- **References:**  
  - Research articles on perceptual uniformity and color appearance models.  
  - Publications discussing LMS transformations and IPT derivation.

- **Direct Conversion Targets:**  
  Can be converted to/from other perceptual models such as CIE Lab or directly to RGB via appropriate transformations.

> **Placement in Documentation:**  
> Place IPT in the **"Device-Independent and Perceptual Models"** section, as it aligns with models like CIE Lab, LUV, and others that aim to match human perception.

---

#### **HCT (Hue, Chroma, Tone)**

- **Name:** HCT  
- **Description:**  
  A modern color model popularized in design systems (e.g., Google’s Material You) that represents colors in terms of Hue, Chroma, and Tone. HCT provides an intuitive framework for theme generation and dynamic customization by aligning with perceptual attributes.

- **Parameters:**

  | Parameter | Description                                          | Range           | Typed Array      | Effect When Modified                                                       |
  | --------- | ---------------------------------------------------- | --------------- | ---------------- | -------------------------------------------------------------------------- |
  | `h`       | Hue: The basic color angle                         | 0–360           | Float32Array     | Rotating `h` cycles through the color spectrum.                          |
  | `c`       | Chroma: The color’s saturation/intensity           | 0–max (variable)| Float32Array     | Increasing `c` yields more vivid, saturated colors; lower values soften the color. |
  | `t`       | Tone: Represents lightness/brightness in a perceptual way | 0–100        | Float32Array     | Adjusting `t` makes the color appear lighter or darker.                    |
  | `a`       | Alpha (opacity)                                      | 0–1             | Float32Array     | Controls transparency.                                                     |

- **Usage:**  
  Ideal for dynamic theming and design systems where perceptual consistency is key. HCT enables designers to tweak color palettes intuitively and generate harmonized schemes.

- **Modifications:**  
  • **Hue Shifting:** Adjust `h` to change the base color.  
  • **Chroma Control:** Increase or decrease `c` to alter color intensity.  
  • **Tone Adjustments:** Modify `t` to fine-tune brightness while preserving hue and chroma balance.  
  • **Alpha Adjustment:** Change `a` to set opacity.

- **CSS / String Representations:**  
  Not directly represented in CSS. A conversion to HSL or RGB is recommended for CSS output, though you may also provide a custom `hct()` string format for debugging.

- **References:**  
  - Design articles and documentation from Material You and other modern design systems.  
  - Research on perceptual color models that emphasize tone and chroma.

- **Direct Conversion Targets:**  
  Can be converted to/from HSL and RGB with proper transformations that account for perceptual tone and chroma adjustments.

> **Placement in Documentation:**  
> Create a new section titled **"Emerging and Advanced Models"** (or add it under **"Other Models"** if preferred) to showcase HCT. This distinguishes it from the more established color spaces while highlighting its innovative role in dynamic theming.

---

### Final Thoughts

Including YCgCo, IPT, and HCT in your library adds depth and modern applicability—especially for applications in video compression, perceptual color correction, and dynamic design systems. By positioning:

- **YCgCo** in **"Other Models"** (or a dedicated video sub-section),
- **IPT** in **"Device-Independent and Perceptual Models"**, and
- **HCT** in a new **"Emerging and Advanced Models"** section,

you ensure that your documentation clearly communicates their roles and usage scenarios to developers. This not only enriches the feature set of your library but also offers users more precise tools for specialized color processing tasks.