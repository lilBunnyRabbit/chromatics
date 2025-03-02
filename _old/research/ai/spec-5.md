# Color TypeScript Library Research

This documentation covers the following three primary areas of the project:

1. **Models:** The core color representations.  
   • Each model extends a typed array for performance and safety:  
  – Models with integer ranges (like 0–255) extend `Uint8ClampedArray`.  
  – Models with fractional ranges (like 0–1 or 0–360) extend `Float32Array`.  
   • All models include an optional alpha channel (0–1) for opacity.

2. **Conversions:** Functions to convert between color models.  
   • Conversions must account for differences in gamut, gamma correction, and perceptual uniformity.

3. **Parsing:** Functions to parse colors from CSS strings, numbers, or other representations.  
   • Support for formats such as `rgb()`, `rgba()`, `hsl()`, `hsla()`, hex codes, etc.


## 1. Models

### Hue Models

#### **HSI**

- **Name:** HSI  
- **Description:** Represents colors using Hue, Saturation, and Intensity. It separates chromatic information (hue) from brightness (intensity), making it valuable for image processing and computer vision tasks.

- **Parameters:**

  | Parameter | Description               | Range | Effect                                                                 |
  | --------- | ------------------------- | ----- | ---------------------------------------------------------------------- |
  | `h`       | Hue angle                 | 0–360 | Rotates the color around the wheel.                                    |
  | `s`       | Saturation (color purity) | 0–1   | Lower values yield grayish colors; higher values produce vivid colors. |
  | `i`       | Intensity (brightness)    | 0–1   | Lower values darken the color; higher values brighten it.              |

- **Typed Array:** Float32Array (chosen for fractional precision)  
- **Usage:** Good for image analysis and computer vision where separating brightness from chromatic information is beneficial.  
- **Modifications:**  
  • **Brightness Adjustment:** Modify `i` to control overall brightness without affecting color hue.  
  • **Hue Rotation:** Change `h` to cycle through the color spectrum.  
  • **Saturation Control:** Adjust `s` to increase or decrease color vividness.

- **CSS / String Representations:**  
  • String: Not directly supported in CSS; typically converted to RGB or HSL for web usage.

- **Direct Conversion Targets:**  
  - To/from RGB, HSL, and HSV.

- **References:**  
  - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)

---

#### **HSL**

- **Name:** HSL  
- **Description:** Represents colors using Hue, Saturation, and Lightness. Widely used for UI design and web applications due to its intuitive control over color tone and brightness.

- **Parameters:**

  | Parameter | Description                  | Range | Effect                                                    |
  | --------- | ---------------------------- | ----- | --------------------------------------------------------- |
  | `h`       | Hue angle                    | 0–360 | Rotating `h` shifts the color around the spectrum.        |
  | `s`       | Saturation (color intensity) | 0–1   | 0 gives grayscale; 1 provides full color intensity.       |
  | `l`       | Lightness (brightness)       | 0–1   | 0 is black, 1 is white; intermediate values show the hue. |

- **Typed Array:** Float32Array  
- **Usage:** Commonly used in CSS (via `hsl()`/`hsla()`) and design tools for intuitive color adjustments.  
- **Modifications:**  
  • **Hue Spin:** Adjust `h` to change the base color.  
  • **Saturation & Lightness:** Modify `s` and `l` to control color vividness and brightness.

- **CSS / String Representations:**  
  • CSS: `hsl(h, s%, l%)` or `hsla(h, s%, l%, a)`

- **Direct Conversion Targets:**  
  - To/from RGB, HSV, and HSI.

- **References:**  
  - [NIWA: Math Behind Colorspace Conversions](https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/)

---

#### **HSV**

- **Name:** HSV  
- **Description:** Represents colors using Hue, Saturation, and Value (brightness). Often preferred in applications requiring intuitive brightness control.

- **Parameters:**

  | Parameter | Description            | Range | Effect                                                 |
  | --------- | ---------------------- | ----- | ------------------------------------------------------ |
  | `h`       | Hue angle              | 0–360 | Adjusting `h` rotates the color around the spectrum.   |
  | `s`       | Saturation (intensity) | 0–1   | 0 yields gray; 1 yields fully saturated color.         |
  | `v`       | Value (brightness)     | 0–1   | Lower values darken; higher values brighten the color. |

- **Typed Array:** Float32Array  
- **Usage:** Utilized in color pickers and image processing where controlling brightness (value) is key.  
- **Modifications:**  
  • **Value Adjustment:** Change `v` to lighten or darken the color.  
  • **Hue and Saturation:** Modify `h` and `s` to affect the color tone and intensity.

- **CSS / String Representations:**  
  • String: Not directly available in CSS; usually converted to RGB or HSL for display.

- **Direct Conversion Targets:**  
  - To/from RGB, HSL, and HSI.

- **References:**  
  - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)

---

#### **HWB**

- **Name:** HWB  
- **Description:** Represents colors by specifying Hue, Whiteness, and Blackness. This model focuses on describing colors in terms of their tint (whiteness) and shade (blackness) in addition to the hue.

- **Parameters:**

  | Parameter | Description                 | Range | Effect                                              |
  | --------- | --------------------------- | ----- | --------------------------------------------------- |
  | `h`       | Hue angle                   | 0–360 | Changing `h` determines the base color tone.        |
  | `w`       | Whiteness (amount of white) | 0–1   | Increasing `w` lightens the color by adding a tint. |
  | `b`       | Blackness (amount of black) | 0–1   | Increasing `b` darkens the color by adding a shade. |

- **Typed Array:** Float32Array  
- **Usage:** Particularly useful in design and digital art for controlling tints and shades more intuitively than traditional models.  
- **Modifications:**  
  • **Tint/Shade Control:** Increase `w` to lighten (tint) or `b` to darken (shade) the color.  
  • **Hue Shift:** Adjust `h` to change the underlying color.

- **CSS / String Representations:**  
  • String: Typically converted to RGB or HSL for CSS display.

- **Direct Conversion Targets:**  
  - To/from RGB and HSL.

- **References:**  
  - [Wikipedia: HWB Color Model](https://en.wikipedia.org/wiki/HWB_color_model)

---

#### **HSLuv**

- **Name:** HSLuv  
- **Description:** A variant of HSL designed for perceptual uniformity, ensuring that changes in saturation and lightness are consistent across all hues.

- **Parameters:**

  | Parameter | Description                      | Range | Effect                                                                  |
  | --------- | -------------------------------- | ----- | ----------------------------------------------------------------------- |
  | `h`       | Hue angle                        | 0–360 | Rotates the color; changes the base color.                              |
  | `s`       | Saturation (perceptual scale)    | 0–100 | Higher values result in more vivid colors on a perceptual scale.        |
  | `l`       | Lightness (perceptually uniform) | 0–100 | Adjusting `l` consistently alters brightness in line with human vision. |

- **Typed Array:** Float32Array  
- **Usage:** Excellent for UI theming and design systems where perceptual uniformity is desired.  
- **Modifications:**  
  • **Hue Rotation:** Adjust `h` for different color bases.  
  • **Saturation/Lightness Adjustments:** Modify `s` and `l` to fine-tune vividness and brightness perceptually.

- **CSS / String Representations:**  
  • String: Typically converted to HSL or RGB for CSS as CSS does not natively support HSLuv.

- **Direct Conversion Targets:**  
  - To/from HSL and RGB.

- **References:**  
  - [HSLuv Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/)

---

#### **HPLuv**

- **Name:** HPLuv  
- **Description:** A variant of HSLuv focused on generating pastel colors by adjusting the saturation curve to produce softer hues while maintaining perceptual uniformity.

- **Parameters:**

  | Parameter | Description                            | Range | Effect                                                                           |
  | --------- | -------------------------------------- | ----- | -------------------------------------------------------------------------------- |
  | `h`       | Hue angle                              | 0–360 | Rotating `h` changes the base color.                                             |
  | `p`       | Pastel parameter (modified saturation) | 0–100 | Lower values yield softer, more pastel colors; higher values increase intensity. |
  | `l`       | Lightness (perceptually uniform)       | 0–100 | Adjusting `l` changes brightness while preserving color balance.                 |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for design systems requiring soft, pastel palettes such as in modern UI themes.  
- **Modifications:**  
  • **Pastel Control:** Tweak `p` to modulate the softness of the color.  
  • **Hue & Lightness:** Adjust `h` and `l` for overall color tone and brightness.

- **CSS / String Representations:**  
  • String: Converted to HSL or RGB for CSS output.

- **Direct Conversion Targets:**  
  - To/from HSL, HSLuv, and RGB.

- **References:**  
  - [HSLuv Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)

---

#### **HCT**

- **Name:** HCT  
- **Description:** Represents colors using Hue, Chroma, and Tone. HCT is designed for dynamic theming and modern design systems by emphasizing perceptual uniformity with an intuitive focus on tone (brightness) alongside hue and chroma (intensity).

- **Parameters:**

  | Parameter | Description                 | Range        | Effect                                                                         |
  | --------- | --------------------------- | ------------ | ------------------------------------------------------------------------------ |
  | `h`       | Hue angle                   | 0–360        | Adjusting `h` rotates the color and changes its base tone.                     |
  | `c`       | Chroma (color intensity)    | 0–(variable) | Increasing `c` results in a more vivid color; lower values yield muted colors. |
  | `t`       | Tone (perceived brightness) | 0–100        | Lower values yield a darker color; higher values brighten it.                  |

- **Typed Array:** Float32Array (chosen for handling fractional values and non-integer ranges)  
- **Usage:** Useful for modern theming, dynamic UI design, and systems like Material You where perceptual uniformity is key.  
- **Modifications:**  
  • **Hue Adjustment:** Modify `h` to change the base color.  
  • **Chroma Modification:** Adjust `c` to control color vividness.  
  • **Tone Adjustment:** Change `t` to lighten or darken the color perceptually.

- **CSS / String Representations:**  
  • String: Generally converted to HSL or RGB for CSS output; alternatively, a custom `hct()` string format may be provided for debugging.

- **Direct Conversion Targets:**  
  - To/from HSL, RGB, and other perceptual models.

- **References:**  
  - [Material You and HCT Research](https://material.io/blog/introducing-material-you)  
  - [Additional Research on HCT](https://medium.com/android-news/material-you-what-its-all-about-f8e8b42331f)

### Device-Independent and Perceptual Models

#### **CIE Lab**

- **Name:** CIE Lab  
- **Description:** A perceptually uniform color model designed to approximate human vision. It is widely used in image processing, printing, and color-difference calculations.  
- **Parameters:**

  | Parameter | Description                                          | Range        | Effect                                                       |
  | --------- | ---------------------------------------------------- | ------------ | ------------------------------------------------------------ |
  | `L`       | Lightness; represents brightness                     | 0–100        | Increasing `L` makes the color lighter.                      |
  | `a`       | Green–red axis; negative = green, positive = red     | -128 to +127 | Adjusting `a` shifts the color along the green-red spectrum. |
  | `b`       | Blue–yellow axis; negative = blue, positive = yellow | -128 to +127 | Adjusting `b` shifts the color along the blue-yellow axis.   |
  | `alpha`   | Opacity                                              | 0–1          | 0 is fully transparent; 1 is fully opaque.                   |

- **Typed Array:** Float32Array (for high precision and to handle fractional values)  
- **Usage:** Good for accurate color matching, image editing, and ΔE (color difference) calculations.  
- **Modifications:**  
  • **Brightness Adjustment:** Modify `L` to control overall luminance.  
  • **Color Balancing:** Adjust `a` and `b` to correct or shift color bias.  
- **CSS / String Representations:**  
  • String: No native CSS format; typically converted to RGB or hex for display.  
- **Direct Conversion Targets:**  
  - To/from CIE XYZ, LCHab, and RGB.  
- **References:**  
  - [Wikipedia: CIELAB Color Space](https://en.wikipedia.org/wiki/CIELAB_color_space)

---

#### **LCHab**

- **Name:** LCHab  
- **Description:** A cylindrical representation of CIE Lab using Lightness, Chroma, and Hue. It provides a more intuitive manipulation of color by separating chroma and hue.  
- **Parameters:**

  | Parameter | Description                         | Range | Effect                                    |
  | --------- | ----------------------------------- | ----- | ----------------------------------------- |
  | `L`       | Lightness; same as in CIE Lab       | 0–100 | Increasing `L` lightens the color.        |
  | `C`       | Chroma; represents color saturation | 0–∞   | Increasing `C` increases color vividness. |
  | `h`       | Hue angle                           | 0–360 | Rotating `h` changes the perceived hue.   |
  | `alpha`   | Opacity                             | 0–1   | Controls transparency.                    |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for applications needing intuitive hue and saturation adjustments, such as graphic design and advanced color editing.  
- **Modifications:**  
  • **Hue Rotation:** Adjust `h` to cycle through color variants.  
  • **Chroma Adjustment:** Modify `C` to control the intensity of the color.  
- **CSS / String Representations:**  
  • String: Usually converted to RGB for web display.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab, CIE XYZ, and RGB.  
- **References:**  
  - [Colormath: LCHab](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/)

---

#### **CIE LCh**

- **Name:** CIE LCh  
- **Description:** Essentially equivalent to LCHab, this model also expresses CIE Lab in cylindrical coordinates (Lightness, Chroma, Hue) and is often used interchangeably with LCHab.  
- **Parameters:**

  | Parameter | Description         | Range | Effect                                 |
  | --------- | ------------------- | ----- | -------------------------------------- |
  | `L`       | Lightness           | 0–100 | Increasing `L` yields a lighter color. |
  | `C`       | Chroma (saturation) | 0–∞   | Increasing `C` intensifies the color.  |
  | `h`       | Hue angle           | 0–360 | Changing `h` alters the hue.           |
  | `alpha`   | Opacity             | 0–1   | Controls transparency.                 |

- **Typed Array:** Float32Array  
- **Usage:** Used similarly to LCHab; the choice between LCHab and CIE LCh often comes down to naming conventions.  
- **Modifications:**  
  • **Adjust `L`, `C`, and `h`** for brightness, saturation, and hue control respectively.  
- **CSS / String Representations:**  
  • String: Converted to RGB for CSS use.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab, CIE XYZ, and RGB.  
- **References:**  
  - [Colormath: LCHab](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/)

---

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

#### **LUV**

- **Name:** LUV  
- **Description:** A perceptually uniform color space that, like Lab, is designed to ensure consistent color differences. It is particularly useful for calculating color differences (ΔE).  
- **Parameters:**

  | Parameter | Description                    | Range                      | Effect                                                         |
  | --------- | ------------------------------ | -------------------------- | -------------------------------------------------------------- |
  | `L`       | Lightness                      | 0–100                      | Increasing `L` makes the color lighter.                        |
  | `u`       | u component (red-green axis)   | Approximately -100 to +100 | Adjusting `u` shifts the color along the red-green spectrum.   |
  | `v`       | v component (blue-yellow axis) | Approximately -100 to +100 | Adjusting `v` shifts the color along the blue-yellow spectrum. |
  | `alpha`   | Opacity                        | 0–1                        | Controls transparency.                                         |

- **Typed Array:** Float32Array  
- **Usage:** Common in color difference evaluations and applications requiring perceptual uniformity.  
- **Modifications:**  
  • **Brightness Adjustment:** Modify `L` for overall lightness.  
  • **Chromatic Adjustments:** Change `u` and `v` for fine-tuning the color tone.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB or Lab for display purposes.  
- **Direct Conversion Targets:**  
  - To/from CIE XYZ, LCHuv, and RGB.  
- **References:**  
  - [Colormath: LUV](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-u-v/)

---

#### **LCHuv**

- **Name:** LCHuv  
- **Description:** The cylindrical (hue-based) representation of the LUV color space, expressing colors in terms of Lightness, Chroma, and Hue.  
- **Parameters:**

  | Parameter | Description         | Range | Effect                                    |
  | --------- | ------------------- | ----- | ----------------------------------------- |
  | `L`       | Lightness           | 0–100 | Increasing `L` yields a lighter color.    |
  | `C`       | Chroma (saturation) | 0–∞   | Increasing `C` increases color vividness. |
  | `h`       | Hue angle           | 0–360 | Rotating `h` changes the perceived hue.   |
  | `alpha`   | Opacity             | 0–1   | Controls transparency.                    |

- **Typed Array:** Float32Array  
- **Usage:** Useful for intuitive color editing where perceptual uniformity is important, such as in professional photo editing.  
- **Modifications:**  
  • **Hue Rotation:** Adjust `h` to change the base color.  
  • **Chroma Adjustment:** Modify `C` for saturation control.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web display.  
- **Direct Conversion Targets:**  
  - To/from LUV, CIE XYZ, and RGB.  
- **References:**  
  - [Colormath: LCHuv](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv/)

---

#### **Oklab**

- **Name:** Oklab  
- **Description:** A modern perceptual color space designed to provide improved uniformity and ease of manipulation compared to traditional models.  
- **Parameters:**

  | Parameter | Description               | Range                     | Effect                                                 |
  | --------- | ------------------------- | ------------------------- | ------------------------------------------------------ |
  | `L`       | Perceptual lightness      | 0–1                       | Increasing `L` makes the color brighter.               |
  | `a`       | a component (green–red)   | Approximately -0.5 to 0.5 | Shifting `a` alters the balance between green and red. |
  | `b`       | b component (blue–yellow) | Approximately -0.5 to 0.5 | Adjusting `b` changes the blue-yellow balance.         |
  | `alpha`   | Opacity                   | 0–1                       | Controls transparency.                                 |

- **Typed Array:** Float32Array  
- **Usage:** Excellent for modern image processing, UI theming, and applications needing perceptually uniform adjustments.  
- **Modifications:**  
  • **Lightness Tuning:** Adjust `L` to change brightness.  
  • **Color Balance:** Modify `a` and `b` for fine-tuning chromaticity.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for display.  
- **Direct Conversion Targets:**  
  - To/from Oklch, CIE XYZ, and RGB.  
- **References:**  
  - [Oklab on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklab/)

---

#### **Oklch**

- **Name:** Oklch  
- **Description:** The cylindrical representation of Oklab, expressing color in terms of Lightness, Chroma, and Hue for intuitive manipulation.  
- **Parameters:**

  | Parameter | Description              | Range | Effect                                                         |
  | --------- | ------------------------ | ----- | -------------------------------------------------------------- |
  | `L`       | Perceptual lightness     | 0–1   | Higher `L` yields a brighter color.                            |
  | `C`       | Chroma (color intensity) | 0–∞   | Increasing `C` intensifies the color's saturation.             |
  | `h`       | Hue angle                | 0–360 | Changing `h` rotates the color within the perceptual spectrum. |
  | `alpha`   | Opacity                  | 0–1   | Controls transparency.                                         |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for tasks requiring direct hue manipulation in a perceptually uniform space, such as advanced photo editing and dynamic theming.  
- **Modifications:**  
  • **Hue Spin:** Adjust `h` to change the color tone.  
  • **Saturation and Brightness:** Modify `C` and `L` for vividness and lightness control.  
- **CSS / String Representations:**  
  • String: Usually converted to RGB for CSS output.  
- **Direct Conversion Targets:**  
  - To/from Oklab, CIE XYZ, and RGB.  
- **References:**  
  - [Oklch Documentation](https://oklch.com)

---

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

---

#### **JzCzHz**

- **Name:** JzCzHz  
- **Description:** The cylindrical version of JzAzBz, expressing color with lightness, chroma, and hue components to allow intuitive hue manipulation within a perceptually uniform space.  
- **Parameters:**

  | Parameter | Description              | Range | Effect                                           |
  | --------- | ------------------------ | ----- | ------------------------------------------------ |
  | `Jz`      | Lightness-like component | 0–1   | Controls perceived brightness.                   |
  | `Cz`      | Chroma component         | 0–∞   | Increasing `Cz` enhances color saturation.       |
  | `hz`      | Hue angle                | 0–360 | Rotating `hz` changes the color's perceived hue. |
  | `alpha`   | Opacity                  | 0–1   | Controls transparency.                           |

- **Typed Array:** Float32Array  
- **Usage:** Useful for applications needing intuitive hue-based adjustments in a highly uniform perceptual space.  
- **Modifications:**  
  • **Hue Adjustment:** Modify `hz` to change the color tone.  
  • **Saturation and Lightness:** Adjust `Cz` and `Jz` to control vividness and brightness.  
- **CSS / String Representations:**  
  • String: Converted to RGB for CSS display.  
- **Direct Conversion Targets:**  
  - To/from JzAzBz and indirectly to/from RGB.  
- **References:**  
  - [JzCzHz on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-cz-hz/)

---

#### **CIECAM02**

- **Name:** CIECAM02  
- **Description:** A comprehensive color appearance model that factors in viewing conditions, offering a more holistic approach to color perception and appearance.  
- **Parameters:**

  | Parameter | Description            | Range | Effect                                         |
  | --------- | ---------------------- | ----- | ---------------------------------------------- |
  | `J`       | Lightness (brightness) | 0–100 | Higher `J` increases perceived brightness.     |
  | `C`       | Colorfulness (chroma)  | 0–∞   | Increasing `C` results in more intense colors. |
  | `h`       | Hue angle              | 0–360 | Changing `h` alters the perceived hue.         |
  | `alpha`   | Opacity                | 0–1   | Controls transparency.                         |

- **Typed Array:** Float32Array  
- **Usage:** Employed in advanced imaging and color correction, especially where viewing conditions significantly impact color appearance.  
- **Modifications:**  
  • **Brightness & Colorfulness:** Adjust `J` and `C` for appearance adjustments.  
  • **Hue:** Modify `h` to shift the color tone.  
- **CSS / String Representations:**  
  • String: Typically converted to CIE Lab or RGB for display.  
- **Direct Conversion Targets:**  
  - To/from CAM16 and indirectly to/from CIE Lab.  
- **References:**  
  - [Wikipedia: CIECAM02](https://en.wikipedia.org/wiki/CIECAM02)

---

#### **CAM16**

- **Name:** CAM16  
- **Description:** An updated color appearance model derived from CIECAM02, designed for improved performance and better predictions under modern viewing conditions.  
- **Parameters:**

  | Parameter | Description         | Range | Effect                               |
  | --------- | ------------------- | ----- | ------------------------------------ |
  | `J`       | Lightness component | 0–100 | Controls overall brightness.         |
  | `C`       | Chroma component    | 0–∞   | Higher `C` yields more vivid colors. |
  | `h`       | Hue angle           | 0–360 | Modifying `h` changes the base hue.  |
  | `alpha`   | Opacity             | 0–1   | Controls transparency.               |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for HDR imaging, digital photography, and applications where accurate color appearance is critical.  
- **Modifications:**  
  • **Brightness and Chroma:** Adjust `J` and `C` for appearance tuning.  
  • **Hue:** Change `h` to alter the perceived hue.  
- **CSS / String Representations:**  
  • String: Typically converted to more common color spaces (e.g., CIE Lab or RGB) for output.  
- **Direct Conversion Targets:**  
  - To/from CIECAM02 and indirectly to/from CIE Lab.  
- **References:**  
  - [CAM16 Research](https://www.researchgate.net/publication/319139749_CAM16_Color_Appearance_Model)

---

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


#### **Osa-UCS**

- **Name:** Osa-UCS  
- **Description:** A color space developed by the Optical Society of America to provide a uniform scale for color differences, making it useful for industrial color matching.  
- **Parameters:**

  | Parameter | Description      | Range                    | Effect                                                       |
  | --------- | ---------------- | ------------------------ | ------------------------------------------------------------ |
  | `L`       | Lightness        | 0–100                    | Higher `L` yields a lighter color.                           |
  | `a`       | Red-green axis   | (Typically -100 to +100) | Adjusting `a` shifts the color along the red-green spectrum. |
  | `b`       | Blue-yellow axis | (Typically -100 to +100) | Changing `b` adjusts the color along the blue-yellow axis.   |
  | `alpha`   | Opacity          | 0–1                      | Controls transparency.                                       |

- **Typed Array:** Float32Array  
- **Usage:** Useful for applications requiring precise color matching and quality control, especially in industrial design.  
- **Modifications:**  
  • **Lightness and Color Balance:** Modify `L`, `a`, and `b` to fine-tune color appearance.  
- **CSS / String Representations:**  
  • String: Generally converted to RGB or Lab for display.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab and other uniform color spaces.  
- **References:**  
  - [Osa-UCS Reference](https://www.osapublishing.org/abstract.cfm?uri=JOSAA-3-12-2050)

---

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

### Print and Color Difference Models

#### **CMY**

- **Name:** CMY  
- **Description:** Represents colors using Cyan, Magenta, and Yellow ink percentages. It is a subtractive model primarily used in printing to simulate the mixing of inks.  
- **Parameters:**

  | Parameter | Description            | Range | Effect                                   |
  | --------- | ---------------------- | ----- | ---------------------------------------- |
  | `c`       | Cyan ink percentage    | 0–100 | Increasing `c` deepens the cyan tone.    |
  | `m`       | Magenta ink percentage | 0–100 | Increasing `m` deepens the magenta tone. |
  | `y`       | Yellow ink percentage  | 0–100 | Increasing `y` deepens the yellow tone.  |
  | `alpha`   | Opacity                | 0–1   | Controls transparency.                   |

- **Typed Array:** Float32Array (provides fractional precision for percentage values)  
- **Usage:** Good for simulating subtractive color mixing in printing processes and color reproduction analysis.  
- **Modifications:**  
  • **Color Mixing:** Adjust any channel to simulate different ink proportions and achieve desired tints.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for web display, as CSS does not directly support CMY.  
- **Direct Conversion Targets:**  
  - To/from CMYK, RGB.  
- **References:**  
  - [BlackIce CMY/CMYK](https://www.blackice.com/colorspaceCYMK.htm)

---

#### **CMYK**

- **Name:** CMYK  
- **Description:** Extends the CMY model by including a Key (black) component, which is essential for practical color printing.  
- **Parameters:**

  | Parameter | Description                | Range | Effect                                                            |
  | --------- | -------------------------- | ----- | ----------------------------------------------------------------- |
  | `c`       | Cyan ink percentage        | 0–100 | Increasing `c` adds cyan, altering the overall color balance.     |
  | `m`       | Magenta ink percentage     | 0–100 | Increasing `m` adds magenta, shifting the color toward red tones. |
  | `y`       | Yellow ink percentage      | 0–100 | Increasing `y` adds yellow, affecting the warmth of the color.    |
  | `k`       | Key (black) ink percentage | 0–100 | Increasing `k` darkens the overall color by adding black.         |
  | `alpha`   | Opacity                    | 0–1   | Controls transparency.                                            |

- **Typed Array:** Float32Array  
- **Usage:** Standard in commercial printing, used to model how inks mix on paper to produce a wide range of colors.  
- **Modifications:**  
  • **Tint/Shade Adjustment:** Changing `k` shifts the overall darkness, while `c`, `m`, and `y` adjust the hue and saturation.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB since CSS does not natively support CMYK.  
- **Direct Conversion Targets:**  
  - To/from CMY, RGB.  
- **References:**  
  - [Wikipedia: CMYK Color Model](https://en.wikipedia.org/wiki/CMYK_color_model)

---

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

---

#### **ICC-based Color Profiles**

- **Name:** ICC-based Color Profiles  
- **Description:** Not a color model in the traditional sense, but a standardized set of data describing the color characteristics of devices. They are essential for ensuring consistent color reproduction across different hardware.  
- **Parameters:**

  | Parameter | Description                    | Range | Effect                                                       |
  | --------- | ------------------------------ | ----- | ------------------------------------------------------------ |
  | `profile` | ICC Profile identifier or data | N/A   | Determines how device-specific color values are interpreted. |
  | `alpha`   | Opacity (if applicable)        | 0–1   | Controls transparency when applied in conversions.           |

- **Typed Array:** Not applicable (typically stored as binary data or structured objects)  
- **Usage:** Useful for converting device-dependent color values to a device-independent color space; critical in professional printing and photography.  
- **Modifications:**  
  • **Profile Mapping:** Changing the profile adjusts the color conversion behavior between devices.  
- **CSS / String Representations:**  
  • String: Not directly representable; used internally in color management workflows.  
- **Direct Conversion Targets:**  
  - Intermediary for converting device-specific colors to standard models (e.g., RGB, CIE Lab).  
- **References:**  
  - [ICC Profiles Overview](https://www.color.org/iccprofiles.xalter)

---

#### **Munsell Color System**

- **Name:** Munsell Color System  
- **Description:** Represents colors based on three dimensions: hue, value (lightness), and chroma (intensity). It is widely used for standardized color communication in various industries.  
- **Parameters:**

  | Parameter | Description              | Range | Effect                                                |
  | --------- | ------------------------ | ----- | ----------------------------------------------------- |
  | `H`       | Hue (color type)         | 0–100 | Changing `H` cycles through different color families. |
  | `V`       | Value (lightness)        | 0–10  | Increasing `V` makes the color brighter.              |
  | `C`       | Chroma (color intensity) | 0–∞   | Higher `C` yields more saturated, vivid colors.       |
  | `alpha`   | Opacity                  | 0–1   | Controls transparency.                                |

- **Typed Array:** Float32Array  
- **Usage:** Useful for industries like design, geology, and manufacturing where standardized color communication is crucial.  
- **Modifications:**  
  • **Color Matching:** Adjust `H`, `V`, and `C` to fine-tune color specifications for quality control.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB or CIE Lab for web display.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab and RGB.  
- **References:**  
  - [Munsell Color System](https://en.wikipedia.org/wiki/Munsell_color_system)

---

#### **NCS (Natural Color System)**

- **Name:** NCS (Natural Color System)  
- **Description:** A perceptual color system based on human vision, primarily used in Europe for design and architecture. It describes colors through perceptual attributes rather than strict numerical values.  
- **Parameters:**

  | Parameter | Description               | Range | Effect                                                    |
  | --------- | ------------------------- | ----- | --------------------------------------------------------- |
  | `H`       | Hue (perceived color)     | N/A   | Describes the basic hue; more categorical than numerical. |
  | `S`       | Saturation (colorfulness) | N/A   | Indicates the intensity or purity of the color.           |
  | `L`       | Lightness (brightness)    | N/A   | Describes how light or dark the color appears.            |
  | `alpha`   | Opacity                   | 0–1   | Controls transparency.                                    |

- **Typed Array:** Float32Array (if numerical representations are standardized; otherwise values may be treated categorically)  
- **Usage:** Widely used in interior design, architecture, and product design where a perceptual description of color is preferred.  
- **Modifications:**  
  • **Perceptual Adjustments:** Altering the values (once numerically mapped) changes the perceived hue, saturation, and brightness.  
- **CSS / String Representations:**  
  • String: Not directly representable in CSS; requires conversion to a standard model like RGB.  
- **Direct Conversion Targets:**  
  - To/from CIE Lab and RGB (using specialized conversion formulas).  
- **References:**  
  - [NCS Color System](https://en.wikipedia.org/wiki/Natural_Color_System)

---

#### **RAL Color Space**

- **Name:** RAL Color Space  
- **Description:** A standardized color system used primarily in Europe for specifying colors in paints, coatings, and plastics. It assigns unique codes to predefined colors for industrial consistency.  
- **Parameters:**

  | Parameter | Description    | Range | Effect                                                 |
  | --------- | -------------- | ----- | ------------------------------------------------------ |
  | `RAL`     | RAL color code | N/A   | Changing the code selects a predefined color standard. |
  | `alpha`   | Opacity        | 0–1   | Controls transparency (if applicable).                 |

- **Typed Array:** Not applicable (RAL codes are categorical identifiers)  
- **Usage:** Essential for industries where precise, standardized color references are required for quality control and manufacturing.  
- **Modifications:**  
  • **Color Selection:** The model is predefined; modifications typically involve selecting a different RAL code rather than adjusting parameters.  
- **CSS / String Representations:**  
  • String: Custom string representations may be provided; conversion to RGB is necessary for web display.  
- **Direct Conversion Targets:**  
  - Typically mapped to RGB for digital representation.  
- **References:**  
  - [RAL Color Standard](https://www.ral-farben.de)

### RGB Models

#### **RGB255**

- **Name:** RGB255  
- **Description:** Represents colors using red, green, and blue channels as integers from 0 to 255. It’s the de facto digital standard for color representation on screens.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                          |
  | --------- | ------------- | ----- | ----------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Increasing `r` intensifies the red component.   |
  | `g`       | Green channel | 0–255 | Increasing `g` intensifies the green component. |
  | `b`       | Blue channel  | 0–255 | Increasing `b` intensifies the blue component.  |
  | `alpha`   | Opacity       | 0–1   | 0 is fully transparent; 1 is fully opaque.      |

- **Typed Array:** Uint8ClampedArray (ensures values are clamped within 0–255)  
- **Usage:** Ideal for web development and UI applications where colors are defined in integer-based formats.  
- **Modifications:**  
  • **Inversion:** Compute `255 - value` for each channel.  
  • **Brightness Adjustment:** Add/subtract a constant from all channels (with clamping).  
- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` or `rgba(r, g, b, a)`  
- **Direct Conversion Targets:**  
  - Normalized RGB, sRGB, Linear sRGB, and via those to perceptual models like CIE Lab.  
- **References:**  
  - [Wikipedia: RGB Color Model](https://en.wikipedia.org/wiki/RGB_color_model)

---

#### **Normalized RGB**

- **Name:** Normalized RGB  
- **Description:** Represents colors with channels normalized to a range of 0 to 1. It’s useful for internal calculations and conversions where floating-point precision is needed.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                  |
  | --------- | ------------- | ----- | ------------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` increases the red component intensity.   |
  | `g`       | Green channel | 0–1   | Increasing `g` increases the green component intensity. |
  | `b`       | Blue channel  | 0–1   | Increasing `b` increases the blue component intensity.  |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                  |

- **Typed Array:** Float32Array (for fractional values and smooth calculations)  
- **Usage:** Good for mathematical operations and conversions between color spaces.  
- **Modifications:**  
  • **Scaling:** Multiply each channel to adjust overall brightness.  
  • **Mixing:** Interpolate between two normalized colors for blending.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB255 (or sRGB) for CSS display.  
- **Direct Conversion Targets:**  
  - sRGB, Linear sRGB, and subsequently other perceptual models.  
- **References:**  
  - [Colormath: Normalized RGB Conversions](https://ajalt.github.io/colormath/)

---

#### **sRGB**

- **Name:** sRGB  
- **Description:** The standard RGB color space for web and consumer devices, defined with a gamma curve to approximate human vision.  
- **Parameters:**

  | Parameter | Description                   | Range | Effect                                                            |
  | --------- | ----------------------------- | ----- | ----------------------------------------------------------------- |
  | `r`       | Red channel (gamma-corrected) | 0–255 | Adjusting `r` alters the red intensity on a gamma-adjusted scale. |
  | `g`       | Green channel                 | 0–255 | Adjusting `g` alters the green intensity.                         |
  | `b`       | Blue channel                  | 0–255 | Adjusting `b` alters the blue intensity.                          |
  | `alpha`   | Opacity                       | 0–1   | Controls transparency.                                            |

- **Typed Array:** Uint8ClampedArray (for consistency with web color specifications)  
- **Usage:** Widely used in web design, image display, and standard digital graphics.  
- **Modifications:**  
  • **Gamma Correction Adjustments:** Minor tweaks in channel values while preserving the gamma curve.  
  • **Brightness and Contrast Adjustments:** Modify channels uniformly to affect overall appearance.  
- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` and `rgba(r, g, b, a)`  
- **Direct Conversion Targets:**  
  - RGB255, Normalized RGB, Linear sRGB, and perceptual models via intermediate conversions.  
- **References:**  
  - [Wikipedia: sRGB](https://en.wikipedia.org/wiki/SRGB)

---

#### **Linear sRGB**

- **Name:** Linear sRGB  
- **Description:** A linearized version of sRGB where the gamma correction is removed. It is ideal for accurate color computations and blending before re-applying gamma correction for display.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                             |
  | --------- | ------------- | ----- | -------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` linearly increases red intensity.   |
  | `g`       | Green channel | 0–1   | Increasing `g` linearly increases green intensity. |
  | `b`       | Blue channel  | 0–1   | Increasing `b` linearly increases blue intensity.  |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                             |

- **Typed Array:** Float32Array (for precise linear calculations)  
- **Usage:** Used in image processing and compositing where linear color arithmetic is required.  
- **Modifications:**  
  • **Linear Blending:** Straightforward arithmetic operations for mixing and scaling.  
- **CSS / String Representations:**  
  • String: Typically converted back to sRGB for CSS output.  
- **Direct Conversion Targets:**  
  - sRGB (via gamma correction), Normalized RGB, and other color spaces through linear transformations.  
- **References:**  
  - [Linear sRGB Overview](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

---

#### **ACES**

- **Name:** ACES  
- **Description:** The Academy Color Encoding System is designed for high-fidelity color in cinema and visual effects, providing a wide color gamut and high dynamic range.  
- **Parameters:**

  | Parameter | Description                 | Range | Effect                                                    |
  | --------- | --------------------------- | ----- | --------------------------------------------------------- |
  | `r`       | Red channel (ACES encoding) | 0–1   | Increasing `r` intensifies the red in a wide gamut space. |
  | `g`       | Green channel               | 0–1   | Adjusting `g` changes the green intensity.                |
  | `b`       | Blue channel                | 0–1   | Adjusting `b` changes the blue intensity.                 |
  | `alpha`   | Opacity                     | 0–1   | Controls transparency.                                    |

- **Typed Array:** Float32Array (for handling high precision in wide gamut calculations)  
- **Usage:** Common in film production, high-end visual effects, and scenarios demanding a wide dynamic range.  
- **Modifications:**  
  • **Wide Gamut Adjustments:** Scale channels to work within the ACES gamut.  
- **CSS / String Representations:**  
  • String: Converted to sRGB or RGB255 for display on standard devices.  
- **Direct Conversion Targets:**  
  - ACEScc, ACEScct, ACEScg, and, via conversion chains, to RGB and perceptual models.  
- **References:**  
  - [ACES Overview](https://www.oscars.org/science-technology/aces)

---

#### **ACEScc**

- **Name:** ACEScc  
- **Description:** A logarithmic encoding of the ACES color space optimized for grading, providing finer control over midtones.  
- **Parameters:**

  | Parameter | Description               | Range | Effect                                              |
  | --------- | ------------------------- | ----- | --------------------------------------------------- |
  | `r`       | Red channel (logarithmic) | 0–1   | Increasing `r` increases the logarithmic red value. |
  | `g`       | Green channel             | 0–1   | Adjusting `g` modifies the logarithmic green value. |
  | `b`       | Blue channel              | 0–1   | Adjusting `b` modifies the logarithmic blue value.  |
  | `alpha`   | Opacity                   | 0–1   | Controls transparency.                              |

- **Typed Array:** Float32Array  
- **Usage:** Particularly useful in post-production workflows where logarithmic grading offers more precise control over image tonal ranges.  
- **Modifications:**  
  • **Logarithmic Adjustments:** Fine-tune channel values for nuanced grading.  
- **CSS / String Representations:**  
  • String: Typically converted to ACES or sRGB for display purposes.  
- **Direct Conversion Targets:**  
  - ACES, ACEScct, and via additional transforms, to RGB.  
- **References:**  
  - [ACEScc on ACES Central](https://acescentral.com)

---

#### **ACEScct**

- **Name:** ACEScct  
- **Description:** Similar to ACEScc but with a slightly different toe region to better preserve shadow detail, making it more forgiving in low-light areas.  
- **Parameters:**

  | Parameter | Description                        | Range | Effect                                                                |
  | --------- | ---------------------------------- | ----- | --------------------------------------------------------------------- |
  | `r`       | Red channel (logarithmic with toe) | 0–1   | Adjusting `r` increases red intensity while preserving shadow detail. |
  | `g`       | Green channel                      | 0–1   | Modifying `g` affects the green tone with a toe function.             |
  | `b`       | Blue channel                       | 0–1   | Adjusting `b` changes blue intensity with enhanced low-light detail.  |
  | `alpha`   | Opacity                            | 0–1   | Controls transparency.                                                |

- **Typed Array:** Float32Array  
- **Usage:** Favoured in digital grading pipelines where preserving detail in darker regions is crucial.  
- **Modifications:**  
  • **Logarithmic and Toe Adjustments:** Fine control over midtones and shadows.  
- **CSS / String Representations:**  
  • String: Typically converted to ACES or sRGB for display.  
- **Direct Conversion Targets:**  
  - ACES, ACEScc, and further to standard RGB spaces.  
- **References:**  
  - [ACEScct Overview](https://acescentral.com)

---

#### **ACEScg**

- **Name:** ACEScg  
- **Description:** A linear variant of ACES designed for computer graphics and visual effects, optimized for compositing and CGI workflows.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                      |
  | --------- | ------------- | ----- | ----------------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` intensifies the red color in a linear space. |
  | `g`       | Green channel | 0–1   | Adjusting `g` modifies the green intensity linearly.        |
  | `b`       | Blue channel  | 0–1   | Adjusting `b` modifies the blue intensity linearly.         |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                      |

- **Typed Array:** Float32Array  
- **Usage:** Widely used in CGI and visual effects production for its linear behavior, facilitating realistic compositing.  
- **Modifications:**  
  • **Linear Adjustments:** Straightforward arithmetic for color blending and corrections.  
- **CSS / String Representations:**  
  • String: Converted to ACES or sRGB for display on standard monitors.  
- **Direct Conversion Targets:**  
  - To/from ACES, sRGB, and other linear color spaces.  
- **References:**  
  - [ACEScg Documentation](https://acescentral.com)

---

#### **Adobe RGB**

- **Name:** Adobe RGB  
- **Description:** A wide-gamut RGB color space developed by Adobe, offering a broader range of colors than sRGB, which is particularly beneficial for professional photography and print.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                    |
  | --------- | ------------- | ----- | --------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Increasing `r` boosts red intensity within a wider gamut. |
  | `g`       | Green channel | 0–255 | Adjusting `g` enhances the green component.               |
  | `b`       | Blue channel  | 0–255 | Increasing `b` enhances the blue component.               |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                    |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Ideal for print and professional photo editing where color accuracy and gamut are critical.  
- **Modifications:**  
  • **Gamut Adjustments:** Tweak channels to maintain color fidelity across devices.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for web display.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and through color profiles to CIE Lab.  
- **References:**  
  - [Adobe RGB on Wikipedia](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)

---

#### **BT.2020 / REC.2020**

- **Name:** BT.2020 / REC.2020  
- **Description:** An RGB color space standard for Ultra High Definition (UHD) television, offering a wider gamut suitable for HDR content.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                        |
  | --------- | ------------- | ----- | ------------------------------------------------------------- |
  | `r`       | Red channel   | 0–1   | Increasing `r` intensifies the red component in a wide gamut. |
  | `g`       | Green channel | 0–1   | Adjusting `g` increases the green intensity.                  |
  | `b`       | Blue channel  | 0–1   | Increasing `b` intensifies the blue component.                |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                        |

- **Typed Array:** Float32Array  
- **Usage:** Used in UHD TVs and HDR displays, critical for video workflows with extended color ranges.  
- **Modifications:**  
  • **HDR Adjustments:** Fine-tune channel values to optimize for high dynamic range content.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for standard web display.  
- **Direct Conversion Targets:**  
  - To/from sRGB and other broadcast standards.  
- **References:**  
  - [BT.2020 on Wikipedia](https://en.wikipedia.org/wiki/Rec._2020)

---

#### **BT.709 / REC.709**

- **Name:** BT.709 / REC.709  
- **Description:** The standard RGB color space for HDTV, defining the color gamut for most broadcast and streaming content.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                           |
  | --------- | ------------- | ----- | ---------------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Adjusting `r` alters the red intensity in a standard HDTV range. |
  | `g`       | Green channel | 0–255 | Modifying `g` adjusts the green intensity.                       |
  | `b`       | Blue channel  | 0–255 | Adjusting `b` alters the blue intensity.                         |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                           |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Widely used in television broadcasting and streaming, ensuring consistent color reproduction in HDTV.  
- **Modifications:**  
  • **Brightness/Contrast Adjustments:** Uniform changes to all channels affect overall luminance and contrast.  
- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` and `rgba(r, g, b, a)`  
- **Direct Conversion Targets:**  
  - To/from sRGB, RGB255, and through conversion to perceptual models.  
- **References:**  
  - [BT.709 on Wikipedia](https://en.wikipedia.org/wiki/Rec._709)

---

#### **DCI P3**

- **Name:** DCI P3  
- **Description:** A color space developed for digital cinema, offering a wider gamut than sRGB and used in high-end display systems and digital projectors.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                       |
  | --------- | ------------- | ----- | ------------------------------------------------------------ |
  | `r`       | Red channel   | 0–255 | Adjusting `r` intensifies the red component in a wide gamut. |
  | `g`       | Green channel | 0–255 | Adjusting `g` increases the green intensity.                 |
  | `b`       | Blue channel  | 0–255 | Adjusting `b` increases the blue intensity.                  |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                       |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Predominantly used in digital cinema and increasingly in high-end monitors and mobile devices for accurate, wide gamut color reproduction.  
- **Modifications:**  
  • **Gamut Tuning:** Adjust channel values to maintain consistency across different devices.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for standard web display.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and Display P3.  
- **References:**  
  - [DCI P3 on Wikipedia](https://en.wikipedia.org/wiki/DCI-P3)

---

#### **Display P3**

- **Name:** Display P3  
- **Description:** Similar to DCI P3 but optimized for display devices, offering a wide gamut and better color accuracy on modern monitors and mobile screens.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                         |
  | --------- | ------------- | ----- | -------------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Adjusting `r` enhances the red intensity for vibrant displays. |
  | `g`       | Green channel | 0–255 | Adjusting `g` enhances the green intensity.                    |
  | `b`       | Blue channel  | 0–255 | Adjusting `b` enhances the blue intensity.                     |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                         |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Common in modern devices (Apple devices, high-end monitors) where a wider gamut is desired for richer color reproduction.  
- **Modifications:**  
  • **Color Calibration:** Adjust channels to match display characteristics.  
- **CSS / String Representations:**  
  • String: Typically converted to sRGB for web usage.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and DCI P3.  
- **References:**  
  - [Display P3 Overview](https://en.wikipedia.org/wiki/Display_P3)

---

#### **ROMM RGB / ProPhoto RGB**

- **Name:** ROMM RGB / ProPhoto RGB  
- **Description:** A very wide gamut color space designed for professional photography and high-end image editing, preserving maximum color information from RAW sensor data.  
- **Parameters:**

  | Parameter | Description   | Range | Effect                                                              |
  | --------- | ------------- | ----- | ------------------------------------------------------------------- |
  | `r`       | Red channel   | 0–255 | Increasing `r` enriches the red component across an extended gamut. |
  | `g`       | Green channel | 0–255 | Increasing `g` enriches the green component.                        |
  | `b`       | Blue channel  | 0–255 | Increasing `b` enriches the blue component.                         |
  | `alpha`   | Opacity       | 0–1   | Controls transparency.                                              |

- **Typed Array:** Uint8ClampedArray  
- **Usage:** Preferred for advanced photo editing, high-resolution image storage, and situations requiring maximum color fidelity.  
- **Modifications:**  
  • **High-Fidelity Adjustments:** Fine control over channel values to preserve detail in extreme highlights and shadows.  
- **CSS / String Representations:**  
  • String: Converted to sRGB for standard display, as CSS does not support ProPhoto RGB directly.  
- **Direct Conversion Targets:**  
  - To/from RGB255, sRGB, and through ICC profiles to perceptual spaces like CIE Lab.  
- **References:**  
  - [ProPhoto RGB Overview](https://en.wikipedia.org/wiki/ProPhoto_RGB)

### Video and Broadcast Standards Models

#### **xvYCC**

- **Name:** xvYCC  
- **Description:** A video color space that extends the standard YCC gamut, allowing for a wider range of colors—particularly useful for high-dynamic-range (HDR) content.  
- **Parameters:**

  | Parameter | Description                                   | Range        | Effect                                             |
  | --------- | --------------------------------------------- | ------------ | -------------------------------------------------- |
  | `Y`       | Luminance component                           | 0–255        | Increasing `Y` brightens the image.                |
  | `C1`      | First chrominance component (blue projection) | -128 to +127 | Adjusting `C1` alters the blue-related color bias. |
  | `C2`      | Second chrominance component (red projection) | -128 to +127 | Adjusting `C2` alters the red-related color bias.  |
  | `alpha`   | Opacity                                       | 0–1          | Controls transparency.                             |

- **Typed Array:** Float32Array (Chosen to accommodate negative chroma values and fractional precision)  
- **Usage:** Useful in video encoding, HDR broadcast, and applications requiring an extended color gamut.  
- **Modifications:**  
  • **Dynamic Range Adjustment:** Modify `Y` to change overall brightness while preserving chroma information.  
  • **Chroma Balancing:** Adjust `C1` and `C2` to fine-tune color differences.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for CSS display.  
- **Direct Conversion Targets:**  
  - To/from RGB and YCbCr.  
- **References:**  
  - [Wikipedia: xvYCC](https://en.wikipedia.org/wiki/XvYCC)

---

#### **YCbCr**

- **Name:** YCbCr  
- **Description:** A widely used color model in digital video that separates the luminance (Y) from the chrominance (Cb and Cr) components, facilitating efficient compression and transmission.  
- **Parameters:**

  | Parameter | Description                 | Range  | Effect                                             |
  | --------- | --------------------------- | ------ | -------------------------------------------------- |
  | `Y`       | Luminance component         | Varies | Modifying `Y` affects image brightness.            |
  | `Cb`      | Blue-difference chrominance | Varies | Adjusting `Cb` modifies the blue color difference. |
  | `Cr`      | Red-difference chrominance  | Varies | Adjusting `Cr` modifies the red color difference.  |
  | `alpha`   | Opacity                     | 0–1    | Controls transparency.                             |

- **Typed Array:** Float32Array (Provides flexibility for various scaling conventions)  
- **Usage:** Essential for digital video compression, broadcasting, and camera imaging systems.  
- **Modifications:**  
  • **Chroma Correction:** Tweak `Cb` and `Cr` to balance colors while using `Y` for brightness control.  
- **CSS / String Representations:**  
  • String: Generally converted to RGB for display purposes.  
- **Direct Conversion Targets:**  
  - To/from RGB, YPbPr, and component video formats.  
- **References:**  
  - [Wikipedia: YCbCr](https://en.wikipedia.org/wiki/YCbCr)

---

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

---

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

---

#### **ICtCp**

- **Name:** ICtCp  
- **Description:** A modern color space designed for HDR and wide color gamut content. It separates intensity (I) from two chroma components (Ct and Cp) optimized for perceptual uniformity, enabling precise color adjustments in advanced video workflows.  
- **Parameters:**

  | Parameter | Description                                  | Range  | Effect                                             |
  | --------- | -------------------------------------------- | ------ | -------------------------------------------------- |
  | `I`       | Intensity component                          | Varies | Changing `I` alters overall brightness.            |
  | `Ct`      | Chroma component for red-green differences   | Varies | Adjusting `Ct` fine-tunes the red-green balance.   |
  | `Cp`      | Chroma component for blue-yellow differences | Varies | Adjusting `Cp` fine-tunes the blue-yellow balance. |
  | `alpha`   | Opacity                                      | 0–1    | Controls transparency.                             |

- **Typed Array:** Float32Array  
- **Usage:** Ideal for HDR video and modern broadcasting where extended dynamic range and color fidelity are required.  
- **Modifications:**  
  • **HDR Adjustments:** Alter `I` to adjust luminance and modify `Ct` and `Cp` for precise color balancing.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for display purposes.  
- **Direct Conversion Targets:**  
  - To/from RGB, YCbCr, and other HDR-friendly formats.  
- **References:**  
  - [Wikipedia: ICtCp](https://en.wikipedia.org/wiki/ICtCp)

---

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

---

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

---

#### **YCgCo** (Optional Inclusion)

- **Name:** YCgCo  
- **Description:** A color model often used in video compression and computer graphics that separates luminance (Y) from chrominance components representing green (Cg) and an orange-blue difference (Co). It provides an efficient transform for color compression.  
- **Parameters:**

  | Parameter | Description             | Range                     | Effect                                           |
  | --------- | ----------------------- | ------------------------- | ------------------------------------------------ |
  | `Y`       | Luminance component     | 0–1 (normalized)          | Increasing `Y` brightens the image overall.      |
  | `Cg`      | Green-difference chroma | Approximately -0.5 to 0.5 | Adjusting `Cg` alters the green-magenta balance. |
  | `Co`      | Orange-blue chroma      | Approximately -0.5 to 0.5 | Adjusting `Co` shifts the red-blue balance.      |
  | `alpha`   | Opacity                 | 0–1                       | Controls transparency.                           |

- **Typed Array:** Float32Array (to handle fractional and negative values)  
- **Usage:** Useful in scenarios involving video compression or GPU-based graphics where efficient separation of luminance and chroma is beneficial.  
- **Modifications:**  
  • **Chroma Adjustments:** Modify `Cg` and `Co` to fine-tune color balance; adjust `Y` for overall brightness.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for final display.  
- **Direct Conversion Targets:**  
  - To/from RGB and other chroma-luminance formats.  
- **References:**  
  - [YCgCo on Wikipedia](https://en.wikipedia.org/wiki/YCgCo)

### Other Models

#### **ANSI**

- **Name:** ANSI  
- **Description:** Represents terminal color codes defined by ANSI standards, typically available in 16‑color and 256‑color palettes.  
- **Parameters:**

  | Parameter | Description                                  | Range  | Effect                                                     |
  | --------- | -------------------------------------------- | ------ | ---------------------------------------------------------- |
  | `code`    | ANSI color code identifier                   | Varies | Changing `code` selects a different pre-defined terminal color. |
  | `alpha`   | Opacity                                      | 0–1    | Controls transparency if applicable.                     |

- **Typed Array:** Uint8ClampedArray (suitable for discrete integer codes)  
- **Usage:** Useful in terminal and console applications for defining text and background colors in command-line interfaces.  
- **Modifications:**  
  • **Color Selection:** Adjust the `code` value to switch between available ANSI colors.  
- **CSS / String Representations:**  
  • String: Represented via escape sequences (e.g., `\x1b[31m` for red).  
- **Direct Conversion Targets:**  
  - Typically mapped to RGB for digital display purposes.  
- **References:**  
  - [ANSI16 Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/)

---

#### **GL**

- **Name:** GL  
- **Description:** Refers to the color representation used in OpenGL and similar graphics libraries, typically expressed as normalized RGB values.  
- **Parameters:**

  | Parameter | Description              | Range  | Effect                                            |
  | --------- | ------------------------ | ------ | ------------------------------------------------- |
  | `r`       | Red channel              | 0–1    | Increasing `r` boosts the red component.          |
  | `g`       | Green channel            | 0–1    | Increasing `g` boosts the green component.        |
  | `b`       | Blue channel             | 0–1    | Increasing `b` boosts the blue component.         |
  | `alpha`   | Opacity                  | 0–1    | Controls transparency.                            |

- **Typed Array:** Float32Array (chosen for precision and GPU compatibility)  
- **Usage:** Ideal for graphics programming, shaders, and any application requiring colors in a normalized, linear space.  
- **Modifications:**  
  • **Channel Adjustment:** Change individual channels for basic color transformations.  
- **CSS / String Representations:**  
  • String: Typically converted to RGB for use in CSS.  
- **Direct Conversion Targets:**  
  - To/from Normalized RGB and sRGB.  
- **References:**  
  - [OpenGL Color Basics](https://www.khronos.org/opengl/wiki/Colors)

---

#### **TSL**

- **Name:** TSL  
- **Description:** A color model using Tint, Saturation, and Lightness. It is similar to HSL but emphasizes a "tint" parameter as an alternative to traditional hue, offering a different approach to color representation.  
- **Parameters:**

  | Parameter | Description                                  | Range  | Effect                                                     |
  | --------- | -------------------------------------------- | ------ | ---------------------------------------------------------- |
  | `t`       | Tint (a variant of hue)                      | 0–360  | Changing `t` rotates the perceived color tone.           |
  | `s`       | Saturation (color intensity)                | 0–1    | 0 yields gray; 1 gives full saturation.                  |
  | `l`       | Lightness (brightness)                       | 0–1    | 0 is black, 1 is white; intermediate values mix the tone.|
  | `alpha`   | Opacity                                      | 0–1    | Controls transparency.                                   |

- **Typed Array:** Float32Array  
- **Usage:** May be used in niche applications where a tint-based model is preferred over traditional hue-based models.  
- **Modifications:**  
  • **Tint Rotation:** Adjust `t` to change the base color tone.  
  • **Saturation & Lightness:** Modify `s` and `l` to affect color intensity and brightness.  
- **CSS / String Representations:**  
  • String: Not directly supported in CSS; typically converted to HSL or RGB for display.  
- **Direct Conversion Targets:**  
  - To/from HSL and RGB.  
- **References:**  
  - [Wikipedia: TSL Color Space](https://en.wikipedia.org/wiki/TSL_color_space)

---

#### **ISO-CIE Color Encodings**

- **Name:** ISO-CIE Color Encodings  
- **Description:** A collection of standardized color encoding methods defined by ISO and CIE. These include models such as CIE XYZ, CIE Lab, and CIE Luv, which serve as foundational references for accurate color reproduction and conversion.  
- **Parameters:**  
  This category comprises multiple models, each with its own set of parameters (e.g., CIE XYZ has `X`, `Y`, `Z`; CIE Lab has `L`, `a`, `b`).  
- **Typed Array:** Varies by model (typically Float32Array for perceptual models)  
- **Usage:** Fundamental in device calibration, scientific color analysis, and inter-model conversions in industrial and research settings.  
- **Modifications:**  
  • **Model-Specific Adjustments:** Each encoding offers unique modifications specific to its representation.  
- **CSS / String Representations:**  
  • String: Not directly represented in CSS; usually converted to RGB or HSL for display.  
- **Direct Conversion Targets:**  
  - Standard conversions exist between CIE XYZ, CIE Lab, CIE Luv, etc.  
- **References:**  
  - [Wikipedia: Color Space](https://en.wikipedia.org/wiki/Color_space)

---

#### **SCOTDIC**

- **Name:** SCOTDIC  
- **Description:** A color system used primarily in the textile industry for dyeing and color matching. It provides a systematic method to represent and communicate colors in industrial processes.  
- **Parameters:**

  | Parameter | Description                             | Range | Effect                                                    |
  | --------- | --------------------------------------- | ----- | --------------------------------------------------------- |
  | `code`    | SCOTDIC color code                      | N/A   | Changing `code` selects a specific predefined color.      |
  | `alpha`   | Opacity                                 | 0–1   | Controls transparency.                                    |

- **Typed Array:** Not applicable (color codes are categorical identifiers)  
- **Usage:** Useful in textile manufacturing and quality control where standardized color references are essential.  
- **Modifications:**  
  • **Color Selection:** Typically, the model is selected rather than modified, based on industry standards.  
- **CSS / String Representations:**  
  • String: Custom representations can be defined; often mapped to RGB for digital display.  
- **Direct Conversion Targets:**  
  - Typically mapped to RGB via lookup tables.  
- **References:**  
  - Industry-specific documentation (no universal link available).

---

#### **Coloroid**

- **Name:** Coloroid  
- **Description:** A color system developed for architectural and design applications. It represents colors in terms of hue, saturation, and brightness with an emphasis on aesthetics and human perception.  
- **Parameters:**

  | Parameter | Description                                | Range  | Effect                                                      |
  | --------- | ------------------------------------------ | ------ | ----------------------------------------------------------- |
  | `h`       | Hue angle                                  | 0–360  | Adjusting `h` changes the base color tone.                  |
  | `s`       | Saturation (color intensity)               | 0–1    | Increasing `s` makes the color more vivid.                  |
  | `b`       | Brightness (lightness)                     | 0–1    | Higher `b` yields a brighter color.                         |
  | `alpha`   | Opacity                                    | 0–1    | Controls transparency.                                      |

- **Typed Array:** Float32Array  
- **Usage:** Primarily used in architectural and interior design for generating and communicating aesthetic color palettes.  
- **Modifications:**  
  • **Hue, Saturation, Brightness Adjustments:** Modify `h`, `s`, and `b` to achieve the desired aesthetic effect.  
- **CSS / String Representations:**  
  • String: Typically converted to HSL or RGB for digital display.  
- **Direct Conversion Targets:**  
  - To/from RGB and HSL.  
- **References:**  
  - [Coloroid on Wikipedia](https://en.wikipedia.org/wiki/Coloroid)


## 2. Conversions

Implement conversion functions to translate between models. Key considerations include:
- **Gamma Correction:** Conversions between sRGB and linear spaces require gamma adjustments.
- **White Point Adjustments:** For perceptual models (e.g., Lab, XYZ), conversions must account for the reference white.
- **Clamping and Precision:** Ensure values remain within defined ranges post-conversion.
  
Examples:
- **RGB ↔ HSL / HSV:** Based on well-known formulas.
- **RGB ↔ CIE XYZ:** Using linearization and matrix transformations.
- **Lab ΔE Calculations:** Use formulas like ΔE 2000 to quantify color differences.

---

## 3. Parsing

Provide robust parsing routines to interpret:
- **CSS Color Strings:** e.g., hex codes (`#RRGGBB` or `#RGB`), `rgb()`, `rgba()`, `hsl()`, `hsla()`.
- **Numerical Representations:** Raw numbers for each channel.
- **Named Colors:** Optionally map CSS color names to model values.

Parsing should output the proper model instance (e.g., an `RGB255` instance) with clamped values.

---

## 4. Calculations

Beyond conversions, consider implementing:
- **Color Difference (ΔE) Calculations:**  
  • ΔE76, ΔE94, ΔE2000, etc., to compare perceptual differences between colors.
- **Color Mixing & Blending:**  
  • Interpolation between two color models.
  • Different blend modes (multiply, overlay, etc.).
- **Color Temperature Conversions:**  
  • Convert between Kelvin temperature and chromaticity coordinates.
- **Dynamic Adjustments:**  
  • Brightening/darkening, saturation/desaturation, tint/shade adjustments.

---

## 5. Brainstorming and Additional Ideas

- **Modular Architecture:**  
  Separate core models, conversion utilities, and parsers into independent modules. Allow users to import only what they need.

- **Extensibility:**  
  Provide an API for developers to define and register new color models, along with their conversion routines.

- **Performance Considerations:**  
  Optimize conversion and parsing routines using typed arrays and avoid unnecessary object creation.

- **User-Friendly API:**  
  Offer both low-level functions for granular control and high-level functions for common tasks like theme generation, color scheme creation (complementary, analogous, triadic), and dynamic site-wide customization.

- **Integration with CSS and Web Standards:**  
  Support new CSS color functions (e.g., `color-mix()`) and maintain compatibility with web color specifications.

- **Advanced Color Appearance Models:**  
  Optionally include models such as CIECAM02 or CAM16 for applications requiring color appearance adjustments under different viewing conditions.

- **Documentation and Examples:**  
  Provide clear documentation, interactive examples, and a suite of tests to validate conversions and color manipulations.

---

## 6. References

- [Wikipedia: Color Space](https://en.wikipedia.org/wiki/Color_space)
- [EasyRGB Color Math](http://www.easyrgb.com/en/math.php#text2)
- [Colormath Colorspaces Documentation](https://ajalt.github.io/colormath/colorspaces/)
- [Hue Tools](https://hue.tools/)
- [Colormath GitHub Repository](https://github.com/ajalt/colormath/blob/master)
- [Aspose SVG Color Converter](https://products.aspose.com/svg/net/color-converter/rgb-to-hwb/)
- [Coloraide Documentation](https://facelessuser.github.io/coloraide/manipulation/)
- [Little CMS GitHub](https://github.com/mm2/Little-CMS)
- [CuloriJS](https://culorijs.org/)
- [Codrops: Coloring with Code](https://tympanus.net/codrops/2021/12/07/coloring-with-code-a-programmatic-approach-to-design/)