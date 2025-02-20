Below is a consolidated Markdown document that not only organizes your research notes into a single file but also offers some analysis and suggestions. I’ve integrated your sections, added a few extra ideas, and noted where further clarification might be helpful.

---

# Color TypeScript Library Research

This document compiles the research, models, calculations, and ideas for your color TypeScript npm library. It’s intended as both a reference and a working outline. Note that while the list is extensive, some models are niche or have overlapping scopes. You may want to focus on a core set for your library and consider using or interfacing with established conversion libraries for the more advanced or less-common models.

---

## 1. Color Models

### 1.1 Hue Models

These are primarily cylindrical representations for intuitive manipulation of color:
- **[HSI](./hue/HSI.ts)**
  - **Parameters:** `h` (Hue: 0–360), `s` (Saturation: 0–1), `i` (Intensity: 0–1)
  - **Manipulations:** Brightness adjustment, saturation boost, color shifting
  - **Usage:** Separates color (hue) from intensity, useful in computer vision and image processing  
  - *References:*
    - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV) citeturn0search0

- **[HSL](./hue/HSL.ts)**
  - **Parameters:** `h` (Hue: 0–360), `s` (Saturation: 0–1), `l` (Lightness: 0–1)
  - **Manipulations:** Lightness control, saturation adjustment, color shifting
  - **Usage:** Ideal for UI controls where lightness and saturation are manipulated independently  
  - *References:*
    - [NIWA: Math Behind Colorspace Conversions](https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/) citeturn0search0

- **[HSV](./hue/HSV.ts)**
  - **Parameters:** `h` (Hue: 0–360), `s` (Saturation: 0–1), `v` (Value: 0–1)
  - **Manipulations:** Brightness adjustment, saturation control, hue shifting
  - **Usage:** Common in image processing and applications needing brightness control  
  - *References:*
    - [Wikipedia: HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV) citeturn0search0

- **[HWB](./hue/HWB.ts)**
  - **Parameters:** `h` (Hue: 0–360), `w` (Whiteness: 0–1), `b` (Blackness: 0–1)
  - **Manipulations:** Tint (whiteness) and shade (blackness) adjustments, neutral color balancing
  - **Usage:** A simpler alternative to HSL/HSV that separates white and black components  
  - *References:*
    - [Wikipedia: HWB Color Model](https://en.wikipedia.org/wiki/HWB_color_model) citeturn0search0

- **HSLuv & HPLuv**
  - **HSLuv:** Uses `h` (Hue: 0–360), `s` (Saturation: 0–100), `l` (Lightness: 0–100) with perceptual uniformity.
  - **HPLuv:** Similar to HSLuv but with a "pastel" parameter (`p`) to reduce saturation.
  - **Usage:** Designed as human-friendly alternatives to traditional HSL  
  - *References:*
    - [HSLuv Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/) citeturn0search0

---

### 1.2 Other Models

- **ANSI (16 and 256)**
  - **Usage:** Terminal color codes based on VGA palettes.
  - *References:*
    - [ANSI16 Model](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/) citeturn0search0

- **GL**
  - **Notes:** Not a formal color model. Likely refers to OpenGL’s color handling (typically RGB/RGBA).

- **TSL (Tint, Saturation, Lightness)**
  - **Parameters:** `t` (Tint: 0–360), `s` (Saturation: 0–1), `l` (Lightness: 0–1)
  - **Usage:** A less-common alternative for color manipulation. Clarify its intended differences from HSL if used.
  - *References:*
    - [Wikipedia: TSL Color Space](https://en.wikipedia.org/wiki/TSL_color_space) citeturn0search0

- **ISO-CIE Color Encodings**
  - **Usage:** Industrial standards for color measurement (includes models like CIE XYZ, Lab, etc.).

- **SCOTDIC & Coloroid**
  - **Usage:** Systems used respectively in textile dyeing and architectural color matching.

- **Additional Consideration: YCgCo**
  - **Suggestion:** For video and image compression, you might want to consider adding the YCgCo color model, which isn’t currently in your list.

---

### 1.3 Device-Independent and Perceptual Models

These models aim for perceptual uniformity and are ideal for color correction and device-independent representations:

- **[CIE Lab](./perceptual/Lab.ts)**
  - **Parameters:** `L` (0–100), `a` (–128 to +127), `b` (–128 to +127)
  - **Usage:** Widely used in image editing and color correction.
  - *References:*
    - [Wikipedia: CIELAB Color Space](https://en.wikipedia.org/wiki/CIELAB_color_space) citeturn0search0

- **LCHab / CIE LCh**
  - **Parameters:** `L` (Lightness: 0–100), `C` (Chroma: 0–∞), `H` (Hue angle: 0–360)
  - **Usage:** Cylindrical representation of Lab, very intuitive for adjusting hue and saturation.
  - *References:*
    - [LCHab Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/) citeturn0search0

- **LUV & LCHuv**
  - **Parameters:** LUV uses `L`, `u`, and `v` (with unbounded u/v); LCHuv converts these to `L`, `C`, `H`.
  - **Usage:** Similar benefits to Lab but different scaling; check which fits your needs better.
  - *References:*
    - [LUV Model](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-u-v/) citeturn0search0

- **[CIE XYZ](./perceptual/XYZ.ts)**
  - **Parameters:** `X`, `Y` (luminance), `Z`
  - **Usage:** The foundational color space for many conversions; crucial for device-independent operations.
  - *References:*
    - [Easyrgb Color Math](https://www.easyrgb.com/en/math.php#text2) citeturn0search0

- **Oklab & Oklch**
  - **Usage:** Modern perceptual color spaces offering improvements in uniformity for image processing.
  - *References:*
    - [Oklab on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklab/) citeturn0search0

- **JzAzBz & JzCzHz**
  - **Usage:** Designed for a perceptually uniform metric where Euclidean distances correlate to perceived differences.
  - *References:*
    - [JzAzBz Documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-az-bz/) citeturn0search0

- **CIECAM02 & CAM16**
  - **Notes:** These are advanced models for color appearance under varying viewing conditions. Their parameters and manipulations are more complex; you might need further detail if you plan to support full appearance modeling.

- **Osa-UCS**
  - **Usage:** Based on the Optical Society of America’s uniform color scale for accurate color matching.

---

### 1.4 Print and Color Difference Models

These models address color mixing in printing and quantify differences:

- **[CMY](./print/CMY.ts) & [CMYK](./print/CMYK.ts)**
  - **Parameters:** CMY (Cyan, Magenta, Yellow – 0–100); CMYK adds `k` (Key/Black – 0–100)
  - **Usage:** Essential for print workflows and understanding subtractive color mixing.
  - *References:*
    - [CMYK on Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model) citeturn0search0

- **HunterLAB**
  - **Usage:** Used for color measurement in industrial applications.
  - *References:*
    - [Wikipedia: Hunter Lab](https://en.wikipedia.org/wiki/Hunter_Lab) citeturn0search0

- **ICC-based Color Profiles**
  - **Usage:** For managing and converting between device-specific color representations.
  
- **Munsell Color System, NCS, RAL Color Space**
  - **Usage:** Standardized systems for color communication in various industries.
  - **Additional Note:** Consider including Delta E calculations for quantifying color differences across these models.

---

### 1.5 RGB Models

These models are at the core of digital color representation:

- **[RGB (0–255)](./rgb/RGB255.ts)**
  - **Parameters:** `r`, `g`, `b` (each 0–255)
  - **Usage:** Basic digital color representation.
  - *References:*
    - [Wikipedia: RGB Color Model](https://en.wikipedia.org/wiki/RGB_color_model) citeturn0search0

- **[Normalized RGB](./rgb/RGB.ts)**
  - **Parameters:** `r`, `g`, `b` (each 0–1)

- **sRGB & Linear sRGB**
  - **Usage:** sRGB is gamma-corrected; Linear sRGB is used for linear color operations before gamma correction.
  - *References:*
    - [sRGB on Wikipedia](https://en.wikipedia.org/wiki/SRGB) citeturn0search0

- **ACES Family (ACES, ACEScc, ACEScct, ACEScg)**
  - **Usage:** Used in cinema and high-fidelity image workflows; note the logarithmic encodings in ACEScc/ACEScct.
  - *References:*
    - [ACES on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-s.html) citeturn0search0

- **Adobe RGB**
  - **Usage:** Offers a wider gamut than sRGB, ideal for print and professional photography.
  - *References:*
    - [Adobe RGB on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-adobe-r-g-b.html) citeturn0search0

- **BT.2020 / REC.2020, BT.709 / REC.709**
  - **Usage:** Standards for UHD TV and HDTV respectively.
  - *References:*
    - [BT.709 on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-b-t709.html) citeturn0search0

- **DCI P3 & Display P3**
  - **Usage:** Digital cinema and wider gamut displays.
  - *References:*
    - [Display P3 on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-display-p3.html) citeturn0search0

- **ROMM RGB / ProPhoto RGB**
  - **Usage:** Extremely wide gamut, popular in professional photography.
  - *References:*
    - [ROMM RGB on colormath](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-o-m-m_-r-g-b.html) citeturn0search0

---

### 1.6 Video and Broadcast Standards Models

These are specialized for video processing and broadcast standards:

- **xvYCC**
  - **Parameters:** `Y` (Luminance: 0–255), `C1` and `C2` (Chrominance: –128 to +127)
  - **Usage:** Supports a wider color space for HDR content.
  - *References:*
    - [Wikipedia: xvYCC](https://en.wikipedia.org/wiki/XvYCC) citeturn0search0

- **[YCbCr](./video/YCbCr255.ts)**
  - **Usage:** Widely used in video compression; separates luminance from chrominance.
  - *References:*
    - [Wikipedia: YCbCr](https://en.wikipedia.org/wiki/YCbCr) citeturn0search0

- **YPbPr**
  - **Usage:** Often used for component video; similar in concept to YCbCr.
  - *References:*
    - [Wikipedia: YPbPr](https://en.wikipedia.org/wiki/YPbPr) citeturn0search0

- **YUV**
  - **Usage:** Common in analog and some digital video systems.
  - *References:*
    - [BlackIce: YUV Colorspace](https://www.blackice.com/colorspaceYUV.htm) citeturn0search0

- **ICtCp**
  - **Usage:** Designed for HDR and wide color gamut workflows.
  - *References:*
    - [ICtCp on Wikipedia](https://en.wikipedia.org/wiki/ICtCp) citeturn0search0

- **YIQ**
  - **Usage:** Used in the NTSC broadcasting system.
  - *References:*
    - [Wikipedia: YIQ](https://en.wikipedia.org/wiki/YIQ) citeturn0search0

- **sYCC**
  - **Notes:** Listed but not yet detailed. Clarify its parameters and conversion formulas if you plan to support it.

---

## 2. Calculations

- **Temperature:**  
  - *Note:* You have a placeholder for temperature calculations. Consider incorporating formulas for correlated color temperature (CCT) or conversions between color temperature (in Kelvin) and perceptual brightness.
  
- **Color Difference:**  
  - *Suggestion:* In the print and color difference section, include methods for calculating ΔE (Delta E) to quantify perceptual differences between colors.

---

## 3. Actions / Manipulations

Your library should support a range of color manipulations, including:

- **Mixing:** Combining colors in various ratios.
- **Color Combinations:** Generating complementary, analogous, or triadic color schemes.
- **Blending Modes:** Supporting different blend algorithms (e.g., multiply, overlay).
- **Modifications:**
  - Brighten / Darken
  - Tint / Shade
  - Desaturate / Saturate
  - Lighten
  - Spin (adjust hue rotation)

---

## 4. Brainstorming and Additional Ideas

- **Dynamic Color Customization:**  
  Implement a site-wide color customization mode (e.g., a "Chromata" model) where colors can be globally adjusted for a personalized theme beyond the traditional light/dark modes.

- **Prioritizing Models:**  
  Although the list is extensive, consider which models are most critical for your target audience. For instance, sRGB, HSL/HSV, and CIE Lab cover most common use cases; more niche models like SCOTDIC or certain video standards might be optional.

- **Inter-Model Conversions:**  
  Conversions between models (e.g., from RGB to Lab or XYZ) can be nontrivial. Ensure that any assumptions about linearity, gamma correction, or perceptual uniformity are validated against authoritative references.

- **Documentation & Testing:**  
  Given the breadth of models, clear documentation and comprehensive test cases will be essential to avoid errors—especially in conversion formulas and range definitions.

---

## 5. References

- [Wikipedia: Color Space](https://en.wikipedia.org/wiki/Color_space) citeturn0search0
- [EasyRGB Color Math](http://www.easyrgb.com/en/math.php#text2) citeturn0search0
- [Colormath Colorspaces](https://ajalt.github.io/colormath/colorspaces/) citeturn0search0
- [Hue Tools](https://hue.tools/) citeturn0search0
- [Colormath GitHub Repository](https://github.com/ajalt/colormath/blob/master) citeturn0search0
- [Aspose SVG Color Converter](https://products.aspose.com/svg/net/color-converter/rgb-to-hwb/) citeturn0search0
- [Coloraide Documentation](https://facelessuser.github.io/coloraide/manipulation/) citeturn0search0
- [Little CMS GitHub](https://github.com/mm2/Little-CMS) citeturn0search0
- [CuloriJS](https://culorijs.org/) citeturn0search0
- [Codrops: Coloring with Code](https://tympanus.net/codrops/2021/12/07/coloring-with-code-a-programmatic-approach-to-design/) citeturn0search0

---

## 6. Analysis & Considerations

### Assumptions and Their Implications

1. **Breadth vs. Focus:**  
   *Assumption:* Every color model ever defined should be part of your library.  
   *Counterpoint:* Many models are niche; implementing too many might overwhelm users or complicate maintenance. Prioritize based on common usage and clear benefit.

2. **Conversion Accuracy:**  
   *Assumption:* Simple formulas can easily convert between models.  
   *Counterpoint:* Color conversions (especially involving perceptual models) are mathematically intensive and require careful handling of white points, gamma correction, and nonlinear relationships.

3. **Uniformity Across Models:**  
   *Assumption:* All models are mutually exclusive in application.  
   *Counterpoint:* There is considerable overlap (e.g., HSL vs. HSV vs. HSI). Document their differences clearly to help users select the correct one.

4. **Industry Standards:**  
   *Assumption:* Including models like SCOTDIC and Coloroid is beneficial.  
   *Counterpoint:* Verify their real-world applicability and usage; if they serve a very niche market, consider making them optional or part of an “advanced” module.

5. **Implementation Complexity:**  
   *Assumption:* More models equate to a more complete library.  
   *Counterpoint:* Increased complexity can introduce bugs. It might be more effective to implement robust support for a core subset and allow for community extensions.

### Alternative Perspectives

- **Modular Design:**  
  Consider a modular architecture where core color manipulation (e.g., sRGB, HSL, Lab) is built-in, with additional models available as plugins.

- **Interfacing with Established Libraries:**  
  Instead of reinventing the wheel, you might provide wrappers or adapters for established color conversion libraries to handle some of the more complex models.

---

## Conclusion

Your research is impressively comprehensive. While no major “errors” jump out, the list could benefit from:
- Clarifying and possibly reducing redundancy in hue-based models.
- Adding models like YCgCo for video encoding and expanding details on sYCC.
- Further detailing complex models (CIECAM02, CAM16) if you intend to support full color appearance modeling.
- Including methods for color difference calculations (ΔE) and temperature conversions.

This document should serve as a solid foundation for your library. Be sure to balance completeness with maintainability and user needs.

---

Feel free to iterate on this outline as you refine your library’s scope and implementation details.