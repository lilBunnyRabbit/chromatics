# Extended Documentation for Color TypeScript Library

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

---

## 1. Models

Each color model’s documentation follows this template:

- **Name:**  
  The official name of the color model (e.g., RGB255, HSL, CIE Lab).

- **Description:**  
  A brief overview of the model, its purpose, and typical applications.

- **Parameters:**  
  For each parameter, specify:
  - **Name:** (e.g., `r`, `h`, `L`)
  - **Description:** What the parameter represents.
  - **Range:** For example, 0–255, 0–1, or 0–360.
  - **Typed Array:** The underlying array type the model extends (e.g., `Uint8ClampedArray` or `Float32Array`).
  - **Effect:** How modifying this parameter affects the resulting color (e.g., increasing hue rotates the color; setting saturation to 0 yields a grayscale).
  - **Alpha Channel:** Note that if supported, an alpha value (range 0–1) is included.

- **Usage:**  
  Where and how the model is used. For example, HSL is common in UI color pickers, while CIE Lab is popular in image editing for color correction.

- **Modifications:**  
  Typical manipulations you can perform on the model. For instance:
  - **RGB:** Inversion (`1 - value` for normalized values or `255 - value` for RGB255), brightness adjustment (adding or subtracting from all channels), contrast adjustment, etc.
  - **HSL:** Hue spin, saturation adjustment, lightness modification.
  
- **CSS and General String Representations:**  
  How the model can be expressed as a string or in CSS (e.g., `rgb(…)`, `hsl(…)`, hex codes, etc.).

- **References:**  
  URLs or documentation sources for further details, parsing methods, and conversion formulas.

- **Direct Conversion Targets:**  
  Which other models can be converted directly from this model. For example, RGB can be converted to HSL, HSV, Lab, etc.

---

Below are sample entries for several model groups. (A similar structure should be applied to all models in your library.)

---

### 1.1 Hue-Based Models

#### **HSL**

- **Name:** HSL  
- **Description:**  
  Represents colors using Hue, Saturation, and Lightness in a cylindrical coordinate system. Widely used in design tools and CSS for intuitive color adjustments.

- **Parameters:**

  | Parameter | Description                           | Range | Typed Array  | Effect When Modified                                      |
  | --------- | ------------------------------------- | ----- | ------------ | --------------------------------------------------------- |
  | `h`       | Hue: position on the color wheel      | 0–360 | Float32Array | Changing `h` rotates the color around the wheel.          |
  | `s`       | Saturation: color intensity or purity | 0–1   | Float32Array | 0 yields grayscale; 1 gives full color saturation.        |
  | `l`       | Lightness: perceived brightness       | 0–1   | Float32Array | 0 is black, 1 is white, intermediate values yield shades. |
  | `a`       | Alpha (opacity)                       | 0–1   | Float32Array | 0 is fully transparent; 1 is fully opaque.                |

- **Usage:**  
  Ideal for user interfaces and design applications. Supports CSS representations such as `hsl(120, 50%, 50%)` and extended `hsla(…)` for alpha.

- **Modifications:**  
  • **Hue Spin:** Adjust `h` to rotate color.  
  • **Saturation & Lightness Adjustment:** Increase or decrease `s` and `l` to modify vividness and brightness.  
  • **Alpha Manipulation:** Change `a` to set transparency.

- **CSS / String Representations:**  
  • CSS: `hsl(h, s%, l%)` or `hsla(h, s%, l%, a)`  
  • JavaScript: `HSL.toString()` could return a string in the above format.

- **References:**  
  - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **Direct Conversion Targets:**  
  Can be converted directly to/from HSV, HSI, RGB, and other perceptual models (e.g., CIE Lab via intermediary conversions).

---

#### **HSV**

- **Name:** HSV  
- **Description:**  
  Uses Hue, Saturation, and Value to represent colors, focusing on brightness (value) rather than lightness. Common in image processing and color selection tools.

- **Parameters:**

  | Parameter | Description                        | Range | Typed Array  | Effect When Modified                                |
  | --------- | ---------------------------------- | ----- | ------------ | --------------------------------------------------- |
  | `h`       | Hue                                | 0–360 | Float32Array | Rotates the color on the wheel.                     |
  | `s`       | Saturation: degree of colorfulness | 0–1   | Float32Array | 0 results in a shade of gray; 1 is fully saturated. |
  | `v`       | Value: brightness of the color     | 0–1   | Float32Array | Lower values darken the color; 1 is the brightest.  |
  | `a`       | Alpha (opacity)                    | 0–1   | Float32Array | Controls transparency.                              |

- **Usage:**  
  Used extensively in scenarios where brightness control is key, such as in color pickers and video processing.  
  • Can be represented in CSS-like formats if needed or converted to RGB for display.

- **Modifications:**  
  • **Brightness Adjustment:** Modify `v` for lightening or darkening.  
  • **Color Shifting:** Adjust `h` to change the hue.

- **CSS / String Representations:**  
  Although CSS typically uses HSL, HSV can be converted to/from HSL or RGB for presentation.

- **References:**  
  - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **Direct Conversion Targets:**  
  Direct conversions to RGB, HSL, and HSI are common.

---

#### **HSI**

- **Name:** HSI  
- **Description:**  
  Represents colors with Hue, Saturation, and Intensity. Separates chromatic information from brightness, making it useful for image processing.

- **Parameters:**

  | Parameter | Description                                  | Range | Typed Array  | Effect When Modified                                      |
  | --------- | -------------------------------------------- | ----- | ------------ | --------------------------------------------------------- |
  | `h`       | Hue: angle on the color wheel                | 0–360 | Float32Array | Adjusting `h` rotates the color.                          |
  | `s`       | Saturation: purity or vividness of the color | 0–1   | Float32Array | 0 is grayscale; 1 is fully saturated.                     |
  | `i`       | Intensity: overall brightness                | 0–1   | Float32Array | 0 is dark, 1 is bright; controls the perceived lightness. |
  | `a`       | Alpha (opacity)                              | 0–1   | Float32Array | Controls transparency.                                    |

- **Usage:**  
  Frequently used in computer vision and image processing applications where decoupling intensity from hue aids in analysis.

- **Modifications:**  
  • **Intensity Control:** Adjust `i` to modify brightness without affecting hue or saturation.  
  • **Hue Rotation & Saturation Changes:** Similar to HSL and HSV.

- **CSS / String Representations:**  
  Custom string representations may be provided since HSI isn’t a standard CSS format. Conversions to HSL or RGB for CSS output are recommended.

- **References:**  
  - [Imagee Processing on HSI](https://www.imageeprocessing.com/2013/05/converting-rgb-image-to-hsi.html)

- **Direct Conversion Targets:**  
  Can be converted to/from RGB, HSL, and HSV.

---

#### **HWB**

- **Name:** HWB  
- **Description:**  
  Uses Hue, Whiteness, and Blackness to represent colors. Separates the color’s pure hue from the amounts of white (tint) and black (shade) added.

- **Parameters:**

  | Parameter | Description                         | Range | Typed Array  | Effect When Modified                         |
  | --------- | ----------------------------------- | ----- | ------------ | -------------------------------------------- |
  | `h`       | Hue: color angle                    | 0–360 | Float32Array | Adjusting `h` changes the basic color tone.  |
  | `w`       | Whiteness: amount of white mixed in | 0–1   | Float32Array | Higher values yield lighter (tinted) colors. |
  | `b`       | Blackness: amount of black mixed in | 0–1   | Float32Array | Higher values yield darker (shaded) colors.  |
  | `a`       | Alpha (opacity)                     | 0–1   | Float32Array | Controls transparency.                       |

- **Usage:**  
  Useful for scenarios where simple tint and shade manipulations are desired. Can be converted to RGB for display.

- **Modifications:**  
  • **Tint/Shade Adjustments:** Increase `w` or `b` to lighten or darken the color respectively.  
  • **Hue Shift:** Adjust `h` to modify the underlying color.

- **CSS / String Representations:**  
  Not standard in CSS; conversion to HSL or RGB is recommended for CSS output.

- **References:**  
  - [Wikipedia: HWB Color Model](https://en.wikipedia.org/wiki/HWB_color_model)

- **Direct Conversion Targets:**  
  Typically converted to/from RGB or HSL.

---

#### **HSLuv / HPLuv**

- **Name:** HSLuv & HPLuv  
- **Description:**  
  Designed as human-friendly alternatives to HSL, these models adjust saturation and lightness to achieve perceptual uniformity. HPLuv adds a pastel parameter for softer colors.

- **Parameters (HSLuv):**

  | Parameter | Description                       | Range | Typed Array  | Effect When Modified                                       |
  | --------- | --------------------------------- | ----- | ------------ | ---------------------------------------------------------- |
  | `h`       | Hue                               | 0–360 | Float32Array | Rotates the color.                                         |
  | `s`       | Saturation (perceptually uniform) | 0–100 | Float32Array | Controls vividness on a perceptual scale.                  |
  | `l`       | Lightness (perceptually uniform)  | 0–100 | Float32Array | Adjusts brightness in a way that aligns with human vision. |
  | `a`       | Alpha (opacity)                   | 0–1   | Float32Array | Controls transparency.                                     |

- **Usage:**  
  Excellent for applications where a perceptually uniform adjustment is key (e.g., design tools that need consistent brightness steps).

- **Modifications:**  
  Similar to HSL: hue rotation, saturation and lightness adjustments. HPLuv introduces an extra step to soften saturation for pastel effects.

- **CSS / String Representations:**  
  Custom functions may be needed; conversion to HSL for CSS is common.

- **References:**  
  - [HSLuv Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/)

- **Direct Conversion Targets:**  
  Can be converted to/from HSL, RGB, and other perceptual models.

---

### 1.2 Other Models

_(For brevity, here is an example template for a non-hue model.)_

#### **ANSI (16 & 256)**

- **Name:** ANSI  
- **Description:**  
  Represents terminal colors using standardized color codes. The 16-color (4-bit) and 256-color (8-bit) palettes are used in command-line interfaces.

- **Parameters:**

  | Parameter | Description                | Range  | Typed Array       | Effect When Modified                                  |
  | --------- | -------------------------- | ------ | ----------------- | ----------------------------------------------------- |
  | `code`    | ANSI color code identifier | Varies | Uint8ClampedArray | Changing the code selects a different terminal color. |
  | `a`       | Alpha (if supported)       | 0–1    | Uint8ClampedArray | Controls transparency (if applied).                   |

- **Usage:**  
  Used in terminal and console applications. Parsing might involve string codes like `\x1b[31m` for red.

- **Modifications:**  
  Limited modifications; typically, one selects a different code rather than manipulating individual components.

- **CSS / String Representations:**  
  Custom representations may be implemented to mimic terminal colors in web environments.

- **References:**  
  - [ANSI16 Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/)

- **Direct Conversion Targets:**  
  Can often be mapped to RGB for display purposes.

_(A similar detailed template should be written for models such as TSL, SCOTDIC, Coloroid, etc.)_

---

### 1.3 Device-Independent and Perceptual Models

#### **CIE Lab**

- **Name:** CIE Lab  
- **Description:**  
  A perceptually uniform color model designed to approximate human vision. It is used extensively in image processing, printing, and color correction.

- **Parameters:**

  | Parameter   | Description                         | Range        | Typed Array  | Effect When Modified                                       |
  | ----------- | ----------------------------------- | ------------ | ------------ | ---------------------------------------------------------- |
  | `L`         | Lightness: 0 (black) to 100 (white) | 0–100        | Float32Array | Increasing `L` makes the color lighter.                    |
  | `a`         | Green–Red component                 | –128 to +127 | Float32Array | Negative values shift toward green; positive toward red.   |
  | `b`         | Blue–Yellow component               | –128 to +127 | Float32Array | Negative values shift toward blue; positive toward yellow. |
  | `a` (alpha) | Alpha (opacity)                     | 0–1          | Float32Array | Controls transparency.                                     |

- **Usage:**  
  Fundamental for high-accuracy color matching, color difference calculations (ΔE), and conversion between various color spaces.

- **Modifications:**  
  • Adjust `L` for brightness changes.  
  • Modify `a`/`b` to correct color casts.

- **CSS / String Representations:**  
  Not directly supported in CSS; typically converted to RGB or HSL for display.

- **References:**  
  - [Wikipedia: CIELAB Color Space](https://en.wikipedia.org/wiki/CIELAB_color_space)

- **Direct Conversion Targets:**  
  Can be converted directly to/from XYZ, LCHab, and (indirectly) RGB.

_(Other perceptual models like LCHab, LUV, LCHuv, XYZ, Oklab, Oklch, and JzAzBz follow a similar template.)_

---

### 1.4 Print and Color Difference Models

#### **CMYK**

- **Name:** CMYK  
- **Description:**  
  A subtractive color model used in color printing. It represents Cyan, Magenta, Yellow, and Key (black).

- **Parameters:**

  | Parameter | Description                | Range | Typed Array  | Effect When Modified                      |
  | --------- | -------------------------- | ----- | ------------ | ----------------------------------------- |
  | `c`       | Cyan ink percentage        | 0–100 | Float32Array | Increasing `c` deepens the cyan tint.     |
  | `m`       | Magenta ink percentage     | 0–100 | Float32Array | Increasing `m` deepens the magenta tint.  |
  | `y`       | Yellow ink percentage      | 0–100 | Float32Array | Increasing `y` deepens the yellow tint.   |
  | `k`       | Key (black) ink percentage | 0–100 | Float32Array | Increasing `k` darkens the color overall. |
  | `a`       | Alpha (if applicable)      | 0–1   | Float32Array | Controls transparency.                    |

- **Usage:**  
  Essential for print design workflows. Conversions between CMYK and RGB must account for subtractive mixing.

- **Modifications:**  
  • Adjusting any channel modifies the overall printed output.  
  • Often used in tandem with color-difference calculations (e.g., ΔE) for quality control.

- **CSS / String Representations:**  
  Typically not used in CSS directly, but conversion to RGB is standard for on-screen display.

- **References:**  
  - [Wikipedia: CMYK Color Model](https://en.wikipedia.org/wiki/CMYK_color_model)

- **Direct Conversion Targets:**  
  Direct conversion to/from RGB and CMY is common.

---

### 1.5 RGB-Based Models

#### **RGB255**

- **Name:** RGB255  
- **Description:**  
  Represents colors using Red, Green, and Blue channels with integer values (0–255). Fundamental for digital displays.

- **Parameters:**

  | Parameter | Description         | Range | Typed Array        | Effect When Modified                             |
  | --------- | ------------------- | ----- | ------------------ | ------------------------------------------------ |
  | `r`       | Red color channel   | 0–255 | Uint8ClampedArray  | Increasing `r` intensifies the red component.    |
  | `g`       | Green color channel | 0–255 | Uint8ClampedArray  | Increasing `g` intensifies the green component.  |
  | `b`       | Blue color channel  | 0–255 | Uint8ClampedArray  | Increasing `b` intensifies the blue component.   |
  | `a`       | Alpha (opacity)     | 0–1   | Uint8ClampedArray* | Controls transparency (often stored as a float). |

  *Note: Even though RGB255 uses clamped integers for color channels, alpha is typically represented as a float.

- **Usage:**  
  The de facto standard for digital color representation in web and UI contexts.  
  • Directly corresponds to CSS `rgb()` and hex notations.

- **Modifications:**  
  • **Inversion:** Compute `255 - value` for each channel.  
  • **Brightness:** Shift all channels equally up or down (with clamping).  
  • **Contrast/Color Balancing:** Adjust channels relative to one another.

- **CSS / String Representations:**  
  • CSS: `rgb(r, g, b)` and `rgba(r, g, b, a)`  
  • Hex: `#rrggbb` or `#rrggbbaa`

- **References:**  
  - [Wikipedia: RGB Color Model](https://en.wikipedia.org/wiki/RGB_color_model)

- **Direct Conversion Targets:**  
  Can be converted directly to/from Normalized RGB, sRGB, Linear sRGB, and through those to perceptual models.

_(Additional RGB-based models such as Normalized RGB, sRGB, Linear sRGB, ACES variants, Adobe RGB, etc. follow a similar template.)_

---

### 1.6 Video and Broadcast Standards Models

#### **YCbCr**

- **Name:** YCbCr  
- **Description:**  
  Used in video compression and broadcasting, separating luminance (Y) from chrominance (Cb and Cr).

- **Parameters:**

  | Parameter | Description                 | Range  | Typed Array                                                | Effect When Modified                                            |
  | --------- | --------------------------- | ------ | ---------------------------------------------------------- | --------------------------------------------------------------- |
  | `Y`       | Luminance                   | Varies | Float32Array or Uint8ClampedArray (depending on precision) | Increasing `Y` brightens the overall image.                     |
  | `Cb`      | Blue-difference chrominance | Varies | Float32Array                                               | Adjusting `Cb` alters the blue component relative to luminance. |
  | `Cr`      | Red-difference chrominance  | Varies | Float32Array                                               | Adjusting `Cr` alters the red component relative to luminance.  |
  | `a`       | Alpha (if applicable)       | 0–1    | Float32Array                                               | Controls transparency.                                          |

- **Usage:**  
  Essential for video encoding/decoding and broadcast standards.  
  • Often converted to RGB for display.

- **Modifications:**  
  • **Brightness/Contrast:** Adjust `Y` independently.  
  • **Color Correction:** Modify `Cb` and `Cr` to balance color tones.

- **CSS / String Representations:**  
  Not directly supported in CSS; conversion to RGB is standard for web display.

- **References:**  
  - [Wikipedia: YCbCr](https://en.wikipedia.org/wiki/YCbCr)

- **Direct Conversion Targets:**  
  Direct conversion to/from RGB, YUV, and component video spaces.

---

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
