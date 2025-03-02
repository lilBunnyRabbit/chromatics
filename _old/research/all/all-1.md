## Hue Models  
*These are models whose coordinates are expressed in cylindrical form with a hue (angle) as a primary component.*

- **HCL (Hue–Chroma–Luminance)**  
  A color model derived from CIELCh that organizes color by a hue angle, chroma (saturation), and luminance. It is used for generating perceptually uniform palettes.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **HCT (Hue–Chroma–Tone)**  
  Developed for modern design systems (notably in Google’s Material You), HCT is intended to offer perceptually uniform tone adjustments with intuitive hue and chroma controls.  
  [Reference](https://material.io/blog/introducing-material-you)

- **HPLuv (Hue–Pastel–Luv)**  
  A variant of HSLuv that emphasizes softer, pastel colors while retaining perceptual uniformity.  
  [Reference](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)

- **HSI (Hue–Saturation–Intensity)**  
  A cylindrical model where intensity is the average of the RGB components; it separates chromatic content from brightness and is used in image analysis.  
  [Reference](https://en.wikipedia.org/wiki/HSI_color_space)

- **HSL (Hue–Saturation–Lightness)**  
  A popular model used in digital design and CSS; it represents colors with a hue angle, a measure of color purity, and a lightness value that moves between black and white.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HSLuv (Hue–Saturation–Lightness, perceptually uniform variant)**  
  A reparameterization of HSL that aims for perceptual uniformity—meaning that equal steps in each component produce roughly equal perceptual changes.  
  [Reference](https://www.hsluv.org/)

- **HSV (Hue–Saturation–Value)**  
  Also known as HSB, this model uses “value” (brightness) instead of lightness; it’s widely used in color pickers and computer graphics.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HWB (Hue–Whiteness–Blackness)**  
  An alternative to HSL/HSV that replaces the saturation axis with direct measures of how much white and black are mixed with a hue, offering an intuitive way to generate tints and shades.  
  [Reference](https://en.wikipedia.org/wiki/HWB_color_model)

---

## Other Models  
*These include color systems and models that don’t primarily revolve around a hue angle or belong to more specialized domains (e.g. standards or systems used in industry).*

- **Federal Standard 595C**  
  A U.S. government color standard used for military and industrial applications, specifying a palette of approved colors.  
  [Reference](https://en.wikipedia.org/wiki/Federal_Standard_595)

- **ANSI**  
  Refers to the color set defined in ANSI escape codes (typically 16- or 256-color palettes) used in terminal and console applications.  
  [Reference](https://en.wikipedia.org/wiki/ANSI_escape_code)

- **BS (British Standard Colour)**  
  A color standard (such as BS 381C) used in the United Kingdom for specifying colors in industries like packaging and design.  
  [Reference](https://en.wikipedia.org/wiki/British_Standard_Colour)

- **Coloroid**  
  A color system developed for architectural and design applications that represents colors with an emphasis on aesthetics and human perception.  
  [Reference](https://en.wikipedia.org/wiki/Coloroid)

- **GL (OpenGL Color Representation)**  
  The normalized RGB color model used in OpenGL graphics programming, where colors are expressed as floating‐point values between 0 and 1.  
  [Reference](https://www.khronos.org/opengl/wiki/Colors)

- **HKS**  
  A set of standardized spot colors used primarily in European printing and graphic design.  
  [Reference](https://en.wikipedia.org/wiki/HKS_(color_system))

- **HLC (Hue–Lightness–Chroma)**  
  A model similar to HCL that organizes color based on hue, perceived lightness, and chroma; sometimes used in design software.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab) *(Note: HLC is closely related to the HCL/CIE LCh model.)*

- **ISO-CIE Color Encodings**  
  A collection of color spaces (like CIE XYZ, Lab, and Luv) standardized by the International Commission on Illumination (CIE) and ISO for device‐independent color measurement.  
  [Reference](https://en.wikipedia.org/wiki/Color_space)

- **LMS (Long–Medium–Short Cone Responses)**  
  A physiological model representing the responses of the three types of cone cells in the human eye; it forms the basis for many color appearance models but is not perceptually uniform on its own.  
  [Reference](https://en.wikipedia.org/wiki/LMS_color_space)

- **PMS (Pantone Matching System)**  
  A proprietary standardized color reproduction system widely used in printing, graphic design, and fashion.  
  [Reference](https://en.wikipedia.org/wiki/Pantone)

- **SCOTDIC**  
  A color system developed primarily for the textile industry to standardize dye colors and ensure quality control.  
  [Reference](https://en.wikipedia.org/wiki/SCOTDIC)

- **TSL (Tint–Saturation–Lightness)**  
  A variant of the hue–based models that emphasizes a “tint” parameter (similar to hue) along with saturation and lightness; it is less common but appears in some niche applications.  
  [Reference](https://en.wikipedia.org/wiki/TSL_color_space)

---

## Device-Independent and Perceptual Models  
*These spaces are designed to be independent of any particular device and—often through non‑linear transformations—approximate perceptual uniformity.*

- **CAM16-UCS**  
  A uniform color space derived from the CAM16 color appearance model, optimized for perceptual uniformity in modern viewing conditions.  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)

- **CAM16**  
  A color appearance model that improves upon CIECAM02, used for modeling color appearance under varying viewing conditions.  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)

- **CIE Lab (CIELAB)**  
  A color space designed to be perceptually uniform by applying a non‑linear transformation to XYZ; widely used for measuring color differences.  
  [Reference](https://en.wikipedia.org/wiki/CIELAB_color_space)

- **CIE Lch (CIELCh)**  
  The cylindrical (polar) representation of CIELAB, where colors are expressed in terms of lightness, chroma, and hue angle.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **CIE Luv (CIELUV)**  
  Another perceptually based color space derived from XYZ; it is particularly suited to additive color mixing and is used in some color difference calculations.  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space)

- **CIE xyY**  
  A transformation of CIE XYZ that separates chromaticity (x, y) from luminance (Y), used in many applications such as lighting design and device calibration.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram)

- **CIE XYZ**  
  The foundational color space defined by the CIE based on human color matching experiments; it is linear and device‑independent.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space)

- **CIECAM02**  
  A comprehensive color appearance model that accounts for viewing conditions such as ambient light and background; it provides predictions of how colors appear under different conditions.  
  [Reference](https://en.wikipedia.org/wiki/CIECAM02)

- **IPT**  
  A color space based on cone responses (Intensity, Protan, Tritan) used for image quality assessment and color difference evaluations.  
  [Reference](https://en.wikipedia.org/wiki/IPT_color_space)

- **JzAzBz**  
  A perceptually uniform color space designed so that Euclidean distances correlate with perceived color differences; useful for advanced color difference calculations.  
  [Reference](https://en.wikipedia.org/wiki/JzAzBz) *(if not on Wikipedia, see colormath resources)*

- **JzCzHz**  
  The cylindrical version of JzAzBz, representing color with a lightness-like, chroma-like, and hue angle component.  
  [Reference](https://en.wikipedia.org/wiki/JzCzHz) *(or consult specialized color literature)*

- **LCHab**  
  Essentially the same as CIE Lch (cylindrical representation of CIELAB), emphasizing lightness, chroma, and hue; sometimes distinguished by notation.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **LCHuv**  
  The cylindrical representation of CIELUV; it expresses color in terms of lightness, chroma, and hue based on the CIELUV model.  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space) *(see discussion of cylindrical transformation)*

- **Oklab**  
  A modern perceptual color space designed for improved uniformity in both lightness and chroma, optimized for digital displays and web use.  
  [Reference](https://en.wikipedia.org/wiki/Oklab) *(if not available, refer to https://oklch.com)*

- **Oklch**  
  The cylindrical version of Oklab, which expresses colors in terms of lightness, chroma, and hue angle in a perceptually uniform manner.  
  [Reference](https://oklch.com) *(official documentation)*

- **OSA-UCS**  
  A uniform color space developed by the Optical Society of America for precisely comparing colors, particularly in industrial applications.  
  [Reference](https://en.wikipedia.org/wiki/OSA-UCS)

---

## Print and Color Difference Models  
*These models are used in printing, color reproduction, and quality control, often emphasizing subtractive color mixing and precise color difference measurements.*

- **CMY**  
  A subtractive color model based on cyan, magenta, and yellow inks; it forms the basis for many printing processes.  
  [Reference](https://en.wikipedia.org/wiki/CMY_color_model)

- **CMYK**  
  An extension of CMY that adds a key (black) component to better reproduce dark tones in printing.  
  [Reference](https://en.wikipedia.org/wiki/CMYK_color_model)

- **HunterLAB**  
  An alternative color space to CIELAB, developed for industrial color measurement with an emphasis on reflectance-based lightness.  
  [Reference](https://en.wikipedia.org/wiki/Hunter_Lab)

- **ICC-based Color Profiles**  
  Standards that define how colors are represented and converted across devices; they ensure consistent color reproduction in digital workflows.  
  [Reference](https://en.wikipedia.org/wiki/ICC_profile)

- **Munsell Color System**  
  A system that describes colors based on three dimensions—hue, value (lightness), and chroma—designed for standardized color communication.  
  [Reference](https://en.wikipedia.org/wiki/Munsell_color_system)

- **NCS (Natural Color System)**  
  A perceptual color system based on human vision, primarily used in Europe for design, architecture, and interior design.  
  [Reference](https://en.wikipedia.org/wiki/Natural_Color_System)

- **RAL**  
  A standardized color matching system used predominantly in Europe for specifying paints and coatings in industries.  
  [Reference](https://en.wikipedia.org/wiki/RAL)

---

## RGB Models  
*These models define colors in terms of red, green, and blue light; they are foundational for digital displays and imaging.*

- **ACES (Academy Color Encoding System)**  
  A color encoding system designed for high-fidelity motion picture production, offering a wide color gamut and high dynamic range.  
  [Reference](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)

- **ACEScc**  
  A logarithmic variant of ACES optimized for grading, providing finer control over midtones in digital cinema.  
  [Reference](https://acescentral.com)

- **ACEScg**  
  A linear variant of ACES used in computer graphics and visual effects, optimized for compositing and CGI workflows.  
  [Reference](https://acescentral.com)

- **Adobe RGB**  
  A wide-gamut RGB color space developed by Adobe, offering a broader range of colors than sRGB, especially for professional photography and print.  
  [Reference](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)

- **BT.709 / REC.709**  
  The standard RGB color space for HDTV, defining primaries and transfer functions for broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)

- **BT.2020 / REC.2020**  
  A color space standard for Ultra High Definition (UHD) television that provides a wider gamut and supports HDR content.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)

- **DCI P3**  
  A color space developed for digital cinema that covers a wider gamut than sRGB and is used in high-end projection and display systems.  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)

- **Display P3**  
  A variant of DCI P3 optimized for modern displays (such as those in Apple devices) with enhanced color accuracy and gamut.  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)

- **Linear sRGB**  
  A linearized version of sRGB where gamma correction is removed; used for accurate color arithmetic in image processing.  
  [Reference](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

- **Normalized RGB**  
  An RGB representation where the values are normalized (typically between 0 and 1), useful for internal calculations.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)

- **RGB255**  
  The standard 8‑bit RGB model where color channel values range from 0 to 255, ubiquitous in digital imaging.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)

- **ROMM RGB / ProPhoto RGB**  
  A very wide-gamut RGB color space designed for professional photography and high-end image editing to preserve maximum color information.  
  [Reference](https://en.wikipedia.org/wiki/ProPhoto_RGB)

- **sRGB**  
  The standard RGB color space for the web and consumer devices, with a defined gamma curve to match human vision.  
  [Reference](https://en.wikipedia.org/wiki/SRGB)

---

## Video and Broadcast Standards Models  
*These are color models and standards specifically used in video production, broadcasting, and digital television.*

- **ICtCp**  
  A modern color space designed for HDR video that separates intensity from chroma components in a perceptually uniform way.  
  [Reference](https://en.wikipedia.org/wiki/ICtCp)

- **sYCC**  
  A color space used in digital cameras that provides an alternative to sRGB by offering extended color reproduction capabilities.  
  [Reference](https://en.wikipedia.org/wiki/SYCC)

- **xvYCC**  
  An extended-gamut video color space that allows a broader range of colors than standard YCC, especially for HDR content.  
  [Reference](https://en.wikipedia.org/wiki/XvYCC)

- **YCbCr**  
  A color space used in video compression and broadcasting that separates luminance from chrominance for efficient coding.  
  [Reference](https://en.wikipedia.org/wiki/YCbCr)

- **YCgCo**  
  A color model used in video compression that separates luminance from chrominance (green-difference and orange-blue difference) for efficient processing.  
  [Reference](https://en.wikipedia.org/wiki/YCgCo)

- **YIQ**  
  A color space used in NTSC television that separates luminance from two chrominance components; it was used historically for analog broadcasting.  
  [Reference](https://en.wikipedia.org/wiki/YIQ)

- **YPbPr**  
  An analog component video format that splits a video signal into luminance and two chrominance signals; common in component video connections.  
  [Reference](https://en.wikipedia.org/wiki/YPbPr)

- **YUV**  
  A color space used in analog and digital video that separates luminance (Y) from chrominance (U and V) and is a predecessor to many modern video encodings.  
  [Reference](https://en.wikipedia.org/wiki/YUV)

---

## Unorganized Items (Reassigned)  

### CAM / CIE-Based  
- **iCAM**  
  A color appearance model (ICAM) designed for advanced imaging; it belongs with the perceptual models.  
  [Reference](https://en.wikipedia.org/wiki/ICAM_(color_appearance_model))
- **UVW (1964)**  
  A CIE color space developed in 1964 that extends the CIE system; it is a perceptual model from the CIE family.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1964_color_space)

### Additional RGB/Video Related  
- **rg Chromaticity**  
  A representation of RGB colors using the rg chromaticity coordinates; it isolates hue information from brightness.  
  [Reference](https://en.wikipedia.org/wiki/Rg_chromaticity)
- **REC. 601**  
  A standard for standard-definition television (SDTV) color encoding using YCbCr; it is widely used in broadcast video.  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)
- **SMPTE 240M/"C"**  
  A video standard for high-definition television that specifies color encoding and other parameters; often referred to as SMPTE-C.  
  [Reference](https://en.wikipedia.org/wiki/NTSC#SMPTE_C)
- **Rec. 2100**  
  The ITU standard for HDR and Ultra HD television, defining color spaces and transfer functions for modern video.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2100)

### YUV/Analog Video  
- **PAL**  
  A broadcast television standard used in many countries that defines color encoding and resolution; it’s one of the major analog systems.  
  [Reference](https://en.wikipedia.org/wiki/PAL)
- **YDbDr**  
  A color model used in analog video, similar to YUV, that represents color differences; common in some European broadcasting systems.  
  [Reference](https://en.wikipedia.org/wiki/YDbDr)
- **SECAM**  
  A color television standard used in France and some other regions; it uses a different method of color encoding compared to PAL and NTSC.  
  [Reference](https://en.wikipedia.org/wiki/SECAM)
- **NTSC**  
  The analog color television standard used primarily in North America and parts of Asia; it defines specific encoding and resolution.  
  [Reference](https://en.wikipedia.org/wiki/NTSC)
- **MAC (Multiplexed Analogue Components)**  
  A video standard used in certain broadcast applications that multiplexes component signals.  
  [Reference](https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components)
- **YJK**  
  A color model used in some analog video systems (notably in older Japanese computer systems) that is part of the YUV family.  
  [Reference](https://en.wikipedia.org/wiki/YJK)

### Other Color Systems  
- **CcMmYK**  
  A variant of the CMYK system that may include additional channels for more accurate reproduction; used in some specialized printing contexts.  
  [Reference](https://en.wikipedia.org/wiki/CcMmYK_color_model)
- **ColorADD**  
  A color identification system designed to help color-blind individuals; it assigns simple codes to colors.  
  [Reference](https://en.wikipedia.org/wiki/ColorADD)
- **Hexachrome**  
  A six-color printing process developed to extend the gamut of CMYK printing; it uses additional inks to reproduce a wider range of colors.  
  [Reference](https://en.wikipedia.org/wiki/Hexachrome)
- **Imaginary Color**  
  A theoretical concept referring to colors that cannot be produced by real lights or pigments (often called “impossible colors”).  
  [Reference](https://en.wikipedia.org/wiki/Impossible_color)
- **PCCS (Practical Color Coordinate System)**  
  A color system used for practical color communication and design, specifying colors by coordinates.  
  [Reference](https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System)
- **RG Color Models**  
  A simplified color model that uses only red and green channels; typically of academic or historical interest.  
  [Reference](https://en.wikipedia.org/wiki/RG_color_models)
- **RYB (Red–Yellow–Blue) Color Model**  
  The traditional pigment-based color model used in art and design for mixing paints; it differs significantly from additive RGB.  
  [Reference](https://en.wikipedia.org/wiki/RYB_color_model)

### Color Systems / Standards (Non‑Model)  
- **ANPA**  
  A color system originally developed by the American Newspaper Publishers Association for consistent color reproduction in printing.  
  [Reference](https://en.wikipedia.org/wiki/News_Media_Alliance)  
  *(Note: ANPA is sometimes subsumed under broader media color standards.)*
- **Colour Index International**  
  A reference system for pigments and dyes used globally in industries such as printing and manufacturing.  
  [Reference](https://en.wikipedia.org/wiki/Colour_Index_International)
- **DIC**  
  A proprietary color system developed by DIC Corporation used for design and packaging; it specifies a range of standardized colors.  
  [Reference](https://en.wikipedia.org/wiki/DIC_Corporation)
- **ISCC-NBS**  
  A color naming and classification system developed jointly by the Inter-Society Color Council and the National Bureau of Standards.  
  [Reference](https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system)
- **Ostwald Color System**  
  A historical color system proposed by Wilhelm Ostwald for classifying colors in a systematic way.  
  [Reference](https://en.wikipedia.org/wiki/Ostwald_color_system)
- **JIS Z8102**  
  A Japanese Industrial Standard for color specification used in various applications; it sets criteria for color reproduction.  
  [Reference](https://en.wikipedia.org/wiki/JIS_Z8102)
