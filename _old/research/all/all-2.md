# Color Spaces, Models, Systems, and Standards

This collection encompasses a wide range of color representations—from hue‑based models and device‑independent perceptual spaces to printing standards, RGB definitions, video/broadcast encodings, and various industrial color systems. The following groups help organize them by their primary focus and application.

---

## 1. Hue‑Based Models  
*These models express colors using a hue (angle) combined with one or more measures of saturation/chroma and lightness/intensity, making them popular for color selection and design.*

- **HCL (Hue–Chroma–Luminance)**  
  Expresses color in terms of a hue angle, chroma (saturation), and perceived lightness; often derived from CIELCh.  
  [Wiki](https://en.wikipedia.org/wiki/CIELCh_ab)

- **HCT (Hue–Chroma–Tone)**  
  Developed for modern design (e.g., Google’s Material You), it aims to provide perceptual uniformity by adjusting tone (brightness) alongside hue and chroma.  
  [Wiki](https://material.io/blog/introducing-material-you)

- **HPLuv (Hue–Pastel–Luv)**  
  A variant of HSLuv that emphasizes softer, pastel colors while maintaining perceptual uniformity.  
  [Wiki](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)

- **HSI (Hue–Saturation–Intensity)**  
  Uses intensity as the average of the RGB components to separate chromatic content from brightness; common in image analysis.  
  [Wiki](https://en.wikipedia.org/wiki/HSI_color_space)

- **HSL (Hue–Saturation–Lightness)**  
  A popular model (used in CSS) where lightness varies from black to white; it provides an intuitive way to adjust tints and shades.  
  [Wiki](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HSLuv**  
  A reparameterization of HSL that achieves near‑perceptual uniformity, so equal numeric steps produce similar visual changes.  
  [Official Site](https://www.hsluv.org/)

- **HSV (Hue–Saturation–Value)**  
  Also known as HSB, it uses “value” (brightness) and is widely used in digital color pickers and graphics software.  
  [Wiki](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HWB (Hue–Whiteness–Blackness)**  
  Replaces saturation with direct measures of white and black mix, making it easier to create tints and shades intuitively.  
  [Wiki](https://en.wikipedia.org/wiki/HWB_color_model)

---

## 2. Other Models  
*These are models or representations that don’t primarily use a hue‑angle structure or belong to more specialized domains (including some that relate to standards or simplified representations).*

- **Federal Standard 595C**  
  A U.S. government standard defining a palette of approved colors for military and industrial applications.  
  [Wiki](https://en.wikipedia.org/wiki/Federal_Standard_595)

- **ANSI**  
  The set of color codes defined by ANSI escape sequences, commonly used for terminal/console color schemes.  
  [Wiki](https://en.wikipedia.org/wiki/ANSI_escape_code)

- **BS (British Standard Colour)**  
  Color standards (e.g., BS 381C) used in the UK for packaging and design.  
  [Wiki](https://en.wikipedia.org/wiki/British_Standard_Colour)

- **Coloroid**  
  A system developed for architectural and design applications, emphasizing aesthetics and human perception.  
  [Wiki](https://en.wikipedia.org/wiki/Coloroid)

- **GL (OpenGL Color Representation)**  
  Colors expressed as normalized floating‑point values (0–1) for use in graphics programming with OpenGL.  
  [Wiki](https://www.khronos.org/opengl/wiki/Colors)

- **HKS**  
  A set of standardized spot colors used mainly in European printing and graphic design.  
  [Wiki](https://en.wikipedia.org/wiki/HKS_(color_system))

- **HLC (Hue–Lightness–Chroma)**  
  Similar in spirit to HCL, it organizes color based on hue, perceived lightness, and chroma.  
  [Wiki](https://en.wikipedia.org/wiki/CIELCh_ab) *(see CIELCh)*

- **ISO-CIE Color Encodings**  
  A family of device‑independent color spaces (e.g., CIE XYZ, Lab, Luv) standardized by the CIE and ISO.  
  [Wiki](https://en.wikipedia.org/wiki/Color_space)

- **LMS (Long–Medium–Short Cone Responses)**  
  A physiological model representing the responses of the three types of human cone cells; it underpins many perceptual models but isn’t uniform on its own.  
  [Wiki](https://en.wikipedia.org/wiki/LMS_color_space)

- **PMS (Pantone Matching System)**  
  A proprietary color reproduction system used across industries (e.g., printing, fashion) for consistent color communication.  
  [Wiki](https://en.wikipedia.org/wiki/Pantone)

- **SCOTDIC**  
  A color system primarily used in the textile industry for standardizing dye colors.  
  [Wiki](https://en.wikipedia.org/wiki/SCOTDIC)

- **TSL (Tint–Saturation–Lightness)**  
  A variant emphasizing “tint” along with saturation and lightness; used in some niche applications.  
  [Wiki](https://en.wikipedia.org/wiki/TSL_color_space)

- **rg Chromaticity**  
  An alternative representation that isolates hue information from brightness within the RGB model.  
  [Wiki](https://en.wikipedia.org/wiki/Rg_chromaticity)

- **RG Color Models**  
  Simplified models using only red and green channels; typically of historical or academic interest.  
  [Wiki](https://en.wikipedia.org/wiki/RG_color_models)

- **RYB (Red–Yellow–Blue)**  
  The traditional pigment‑mixing model used by artists, differing from the additive RGB model.  
  [Wiki](https://en.wikipedia.org/wiki/RYB_color_model)

- **Imaginary (Impossible) Color**  
  A theoretical concept referring to colors that cannot be produced by physical lights or pigments.  
  [Wiki](https://en.wikipedia.org/wiki/Impossible_color)

---

## 3. Device‑Independent and Perceptual Models  
*These spaces are designed to be independent of any particular device and (often through non‑linear transformations) approximate perceptual uniformity.*

- **CAM16-UCS**  
  A uniform color space derived from the CAM16 appearance model that emphasizes perceptual uniformity.  
  [Wiki](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)

- **CAM16**  
  An updated color appearance model for predicting color appearance under different viewing conditions.  
  [Wiki](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)

- **CIE Lab (CIELAB)**  
  A widely used perceptual color space that transforms XYZ non‑linearly to approximate uniform visual differences.  
  [Wiki](https://en.wikipedia.org/wiki/CIELAB_color_space)

- **CIE Lch (CIELCh)**  
  The cylindrical (polar) form of CIELAB, expressing color via lightness, chroma, and hue angle.  
  [Wiki](https://en.wikipedia.org/wiki/CIELCh_ab)

- **CIE Luv (CIELUV)**  
  A perceptual color space derived from XYZ that is particularly suited for additive color mixing.  
  [Wiki](https://en.wikipedia.org/wiki/CIELUV_color_space)

- **CIE xyY**  
  A transformation of XYZ that separates chromaticity (x, y) from luminance (Y), useful for device calibration and lighting.  
  [Wiki](https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram)

- **CIE XYZ**  
  The foundational, linear, and device‑independent color space based on human color matching experiments.  
  [Wiki](https://en.wikipedia.org/wiki/CIE_1931_color_space)

- **CIECAM02**  
  A comprehensive color appearance model that accounts for viewing conditions (e.g., ambient light, background) in predicting appearance.  
  [Wiki](https://en.wikipedia.org/wiki/CIECAM02)

- **IPT**  
  A color space based on intensity and opponent channels (protan and tritan) used for image quality assessment.  
  [Wiki](https://en.wikipedia.org/wiki/IPT_color_space)

- **JzAzBz**  
  A newer color space designed so that Euclidean distances correspond well with perceived color differences.  
  [Wiki](https://en.wikipedia.org/wiki/JzAzBz) *(or consult specialized sources)*

- **JzCzHz**  
  The cylindrical version of JzAzBz, expressing color with lightness, chroma, and hue components.  
  [Wiki](https://en.wikipedia.org/wiki/JzCzHz) *(if available)*

- **LCHab**  
  Essentially the same as CIELCh (from Lab) but sometimes distinguished in notation; it expresses color in terms of lightness, chroma, and hue.  
  [Wiki](https://en.wikipedia.org/wiki/CIELCh_ab)

- **LCHuv**  
  The cylindrical representation of CIELUV, expressing color in lightness, chroma, and hue derived from Luv.  
  [Wiki](https://en.wikipedia.org/wiki/CIELUV_color_space)

- **Oklab**  
  A modern perceptual color space designed for improved uniformity on digital devices, with simpler conversion from sRGB.  
  [Wiki](https://en.wikipedia.org/wiki/Oklab) *(or see https://oklch.com)*

- **Oklch**  
  The cylindrical version of Oklab, representing color via lightness, chroma, and hue in a perceptually uniform way.  
  [Official Site](https://oklch.com)

- **OSA-UCS**  
  A uniform color space developed by the Optical Society of America for comparing colors in industrial applications.  
  [Wiki](https://en.wikipedia.org/wiki/OSA-UCS)

- **iCAM**  
  A color appearance model (ICAM) for advanced imaging applications, falling within the perceptual model family.  
  [Wiki](https://en.wikipedia.org/wiki/ICAM_(color_appearance_model))

- **UVW (1964)**  
  A historical CIE color space that extends the CIE system; it is considered part of the perceptual family.  
  [Wiki](https://en.wikipedia.org/wiki/CIE_1964_color_space)

---

## 4. Print and Color Difference Models  
*These models are used primarily in printing, color reproduction, and quality control, with an emphasis on subtractive color mixing or precise color difference metrics.*

- **CMY**  
  A subtractive color model based on cyan, magenta, and yellow inks; it is the basis for many printing processes.  
  [Wiki](https://en.wikipedia.org/wiki/CMY_color_model)

- **CMYK**  
  An extension of CMY that adds black (K) to better reproduce dark tones in printing.  
  [Wiki](https://en.wikipedia.org/wiki/CMYK_color_model)

- **HunterLAB**  
  An industrial color space similar to CIELAB but developed for reflectance-based color measurement in quality control.  
  [Wiki](https://en.wikipedia.org/wiki/Hunter_Lab)

- **ICC-based Color Profiles**  
  Standardized profiles (ICC profiles) used to ensure consistent color reproduction across devices.  
  [Wiki](https://en.wikipedia.org/wiki/ICC_profile)

- **Munsell Color System**  
  A system that specifies color based on hue, value (lightness), and chroma; widely used for standardized color communication.  
  [Wiki](https://en.wikipedia.org/wiki/Munsell_color_system)

- **NCS (Natural Color System)**  
  A perceptual color system based on human vision, primarily used in Europe for design and architecture.  
  [Wiki](https://en.wikipedia.org/wiki/Natural_Color_System)

- **RAL**  
  A color matching system commonly used in Europe for specifying paints and coatings in industry.  
  [Wiki](https://en.wikipedia.org/wiki/RAL)

- **CcMmYK**  
  A variant of the CMYK model that includes additional channels for more accurate color reproduction in specialized printing.  
  [Wiki](https://en.wikipedia.org/wiki/CcMmYK_color_model)

- **Hexachrome**  
  A six‑color printing process developed to extend the color gamut beyond standard CMYK.  
  [Wiki](https://en.wikipedia.org/wiki/Hexachrome)

---

## 5. RGB‑Based Models  
*These models represent color in terms of red, green, and blue light; they are fundamental for digital displays and imaging.*

- **ACES**  
  A color encoding system developed for motion picture production, offering a wide gamut and high dynamic range.  
  [Wiki](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)

- **ACEScc**  
  A logarithmic variant of ACES optimized for digital grading and post‑production workflows.  
  [ACES Central](https://acescentral.com)

- **ACEScg**  
  A linear version of ACES designed for computer graphics and visual effects compositing.  
  [ACES Central](https://acescentral.com)

- **Adobe RGB**  
  A wide‑gamut RGB color space developed by Adobe for professional photography and print.  
  [Wiki](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)

- **BT.709 / REC.709**  
  The standard RGB color space for HDTV, defining primaries and transfer functions for broadcast TV.  
  [Wiki](https://en.wikipedia.org/wiki/Rec._709)

- **BT.2020 / REC.2020**  
  A color space for Ultra HD and HDR television with an extended gamut compared to REC.2020.  
  [Wiki](https://en.wikipedia.org/wiki/Rec._2020)

- **DCI P3**  
  A color space developed for digital cinema with a wider gamut than sRGB, used in high-end projection and displays.  
  [Wiki](https://en.wikipedia.org/wiki/DCI-P3)

- **Display P3**  
  A variant of DCI P3 optimized for modern monitors and mobile devices.  
  [Wiki](https://en.wikipedia.org/wiki/Display_P3)

- **Linear sRGB**  
  A version of sRGB with gamma correction removed, used for accurate linear color computations.  
  [Wiki](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

- **Normalized RGB**  
  RGB represented with values normalized (typically between 0 and 1), useful for internal calculations.  
  [Wiki](https://en.wikipedia.org/wiki/RGB_color_model)

- **RGB255**  
  The standard 8‑bit RGB representation where channels range from 0 to 255; ubiquitous in digital imaging.  
  [Wiki](https://en.wikipedia.org/wiki/RGB_color_model)

- **ROMM RGB / ProPhoto RGB**  
  A very wide‑gamut RGB space designed for preserving color information in high‑resolution photography and editing.  
  [Wiki](https://en.wikipedia.org/wiki/ProPhoto_RGB)

- **sRGB**  
  The standard RGB color space for the web and consumer devices, with a defined gamma curve to approximate human vision.  
  [Wiki](https://en.wikipedia.org/wiki/SRGB)

- **rg Chromaticity**  
  An alternative representation isolating the chromaticity information from RGB, useful for certain analyses.  
  [Wiki](https://en.wikipedia.org/wiki/Rg_chromaticity)

---

## 6. Video and Broadcast Standards  
*These models and standards are designed specifically for video production, broadcast, and digital television, often encoding luma and chroma separately.*

- **ICtCp**  
  A modern color space for HDR video that separates intensity from two chroma components in a perceptually uniform manner.  
  [Wiki](https://en.wikipedia.org/wiki/ICtCp)

- **sYCC**  
  A color space used in digital cameras that extends beyond sRGB to allow for enhanced color reproduction.  
  [Wiki](https://en.wikipedia.org/wiki/SYCC)

- **xvYCC**  
  An extended‑gamut video color space that supports a wider range of colors, especially for HDR content.  
  [Wiki](https://en.wikipedia.org/wiki/XvYCC)

- **YCbCr**  
  A color space that separates luminance (Y) from chrominance (Cb and Cr) for efficient video compression and broadcast.  
  [Wiki](https://en.wikipedia.org/wiki/YCbCr)

- **YCgCo**  
  A color model used in video compression that separates green‑difference from an orange‑blue difference.  
  [Wiki](https://en.wikipedia.org/wiki/YCgCo)

- **YIQ**  
  The color space used in NTSC television, which separates luminance from two chrominance components.  
  [Wiki](https://en.wikipedia.org/wiki/YIQ)

- **YPbPr**  
  An analog component video format that splits a video signal into luminance and two chrominance components.  
  [Wiki](https://en.wikipedia.org/wiki/YPbPr)

- **YUV**  
  A traditional color space used in analog and digital video that separates luminance from chrominance.  
  [Wiki](https://en.wikipedia.org/wiki/YUV)

- **REC. 601**  
  A standard for standard‑definition television color encoding (SDTV), specifying YCbCr parameters.  
  [Wiki](https://en.wikipedia.org/wiki/Rec._601)

- **SMPTE 240M/"C"**  
  A standard for high‑definition television color encoding, often used in NTSC‑related contexts.  
  [Wiki](https://en.wikipedia.org/wiki/NTSC#SMPTE_C)

- **Rec. 2100**  
  The ITU‑R standard for HDR and Ultra‑HD television, defining color spaces and transfer functions for modern video.  
  [Wiki](https://en.wikipedia.org/wiki/Rec._2100)

- **PAL**  
  A broadcast standard used in many regions outside North America, defining color encoding and resolution for analog TV.  
  [Wiki](https://en.wikipedia.org/wiki/PAL)

- **YDbDr**  
  A color model used in some analog video systems (especially in Europe) that represents color differences.  
  [Wiki](https://en.wikipedia.org/wiki/YDbDr)

- **SECAM**  
  An analog color television system used mainly in France and parts of Eastern Europe, with its own color encoding method.  
  [Wiki](https://en.wikipedia.org/wiki/SECAM)

- **NTSC**  
  The analog color television standard used primarily in North America and parts of Asia.  
  [Wiki](https://en.wikipedia.org/wiki/NTSC)

- **MAC (Multiplexed Analogue Components)**  
  A video standard that transmits component signals in a multiplexed analog format.  
  [Wiki](https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components)

- **YJK**  
  A color model used in some older analog video systems (notably in Japanese computing) that is part of the YUV family.  
  [Wiki](https://en.wikipedia.org/wiki/YJK)

---

## 7. Color Systems and Standards  
*These are broader color systems or standardized frameworks used for communication, matching, or categorization in various industries.*

- **ANPA**  
  A color system originally developed by the American Newspaper Publishers Association for consistent color reproduction in print.  
  [Wiki](https://en.wikipedia.org/wiki/News_Media_Alliance)

- **Colour Index International**  
  A reference system for pigments and dyes used in industrial design and manufacturing.  
  [Wiki](https://en.wikipedia.org/wiki/Colour_Index_International)

- **DIC**  
  A proprietary color system developed by DIC Corporation for standardized color references in design and packaging.  
  [Wiki](https://en.wikipedia.org/wiki/DIC_Corporation)

- **ISCC-NBS**  
  A color naming and classification system jointly developed by the Inter-Society Color Council and the National Bureau of Standards.  
  [Wiki](https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system)

- **Ostwald Color System**  
  A historical system proposed by Wilhelm Ostwald to classify and standardize colors systematically.  
  [Wiki](https://en.wikipedia.org/wiki/Ostwald_color_system)

- **JIS Z8102**  
  A Japanese industrial standard for color specification, used in various applications to ensure consistent color reproduction.  
  [Wiki](https://en.wikipedia.org/wiki/JIS_Z8102)

- **PCCS (Practical Color Coordinate System)**  
  A system for representing and communicating color coordinates in practical design and manufacturing contexts.  
  [Wiki](https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System)

- **ColorADD**  
  A color identification system designed to assist people with color blindness by assigning simple codes to colors.  
  [Wiki](https://en.wikipedia.org/wiki/ColorADD)