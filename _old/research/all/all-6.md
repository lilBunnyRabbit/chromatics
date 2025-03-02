
## Color Models

### Hue Models  
*These are models whose coordinates are expressed in cylindrical form with a hue (angle) as a primary component.*  

- **HCL (Hue–Chroma–Luminance)**  
  A model derived from CIELCh that organizes color by hue, chroma (saturation), and luminance, used to create perceptually uniform palettes.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **HCT (Hue–Chroma–Tone)**  
  Developed for modern design (e.g., Material You), this model emphasizes tone (brightness) alongside hue and chroma for a more uniform appearance.  
  [Reference](https://material.io/blog/introducing-material-you)

- **HPLuv (Hue–Pastel–Luv)**  
  A variant of HSLuv that produces softer, pastel colors while preserving perceptual uniformity.  
  [Reference](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)

- **HSI (Hue–Saturation–Intensity)**  
  Uses the average of the RGB components as intensity, effectively separating chromatic content from brightness; popular in image analysis.  
  [Reference](https://en.wikipedia.org/wiki/HSI_color_space)

- **HSL (Hue–Saturation–Lightness)**  
  Widely used in digital design (e.g., CSS), it describes color by a hue angle, a saturation value, and lightness that varies from black to white.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HSLuv**  
  A reparameterization of HSL designed for perceptual uniformity so that equal numeric steps yield similar visual differences.  
  [Reference](https://www.hsluv.org/)

- **HSV (Hue–Saturation–Value)**  
  Also known as HSB, this model uses “value” (brightness) instead of lightness and is common in computer graphics and color pickers.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HWB (Hue–Whiteness–Blackness)**  
  Replaces saturation with explicit measures of white and black mix, making it easier to generate tints and shades intuitively.  
  [Reference](https://en.wikipedia.org/wiki/HWB_color_model)

---

### RGB Models  
*These models describe colors as combinations of red, green, and blue light and form the basis of many digital color spaces.*  

- **sRGB**  
  The standard RGB model for web and consumer devices; it defines specific primaries, a D65 white point, and a gamma curve.  
  [Reference](https://en.wikipedia.org/wiki/SRGB)

- **RGB255**  
  An 8‑bit version of the RGB model where each channel is an integer from 0 to 255.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)

- **Normalized RGB**  
  Represents RGB values normalized between 0 and 1, making it ideal for internal calculations and conversions.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)

- **Linear sRGB**  
  The gamma‑linearized version of sRGB, used for accurate color arithmetic in image processing and graphics.  
  [Reference](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

- **Adobe RGB**  
  A wide‑gamut RGB model developed by Adobe, offering a broader range of colors for professional imaging and printing.  
  [Reference](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)

- **ROMM RGB / ProPhoto RGB**  
  A very wide‑gamut RGB model designed for high‑resolution photography and advanced image editing.  
  [Reference](https://en.wikipedia.org/wiki/ProPhoto_RGB)

- **ACES, ACEScc, ACEScg**  
  A family of RGB models developed for motion picture production—with ACEScg optimized for CGI and compositing, and ACEScc for grading.  
  [Reference](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)

- **BT.709 / REC.709**  
  The standard RGB model for HDTV, which defines primaries and transfer functions for broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)

- **BT.2020 / REC.2020**  
  A color model for Ultra‑HD and HDR television with an extended gamut compared to REC.2020.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)

- **DCI P3**  
  Developed for digital cinema, this RGB model offers a wider gamut than sRGB and is used in high‑end projection and displays.  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)

- **Display P3**  
  A variant of DCI P3 optimized for modern displays such as those found in Apple devices.  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)

- **rg Chromaticity**  
  A representation of RGB that isolates chromaticity (color information) by normalizing out intensity.  
  [Reference](https://en.wikipedia.org/wiki/Rg_chromaticity)

---

### Device-Independent and Perceptual Models  
*These models are designed to be independent of specific devices and—often through nonlinear transformations—approximate perceptual uniformity.*  

- **CIE XYZ**  
  The foundational, linear, device‑independent model based on human color matching experiments; it serves as the basis for many other spaces.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space)

- **CIE xyY**  
  A transformation of CIE XYZ that separates chromaticity (x, y) from luminance (Y), widely used for lighting design and calibration.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram)

- **CIE Lab (CIELAB)**  
  A perceptually uniform color model derived from XYZ via a nonlinear transformation, extensively used for color difference measurements.  
  [Reference](https://en.wikipedia.org/wiki/CIELAB_color_space)

- **CIE Lch (CIELCh)**  
  The cylindrical (polar) version of CIELAB, expressing color in terms of lightness, chroma, and hue angle.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **CIE Luv (CIELUV)**  
  A perceptually based model derived from XYZ that is well-suited for additive color mixing and certain color difference calculations.  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space)

- **LCHab / LCHuv**  
  Cylindrical representations of CIELAB and CIELUV, respectively; they express color in terms of lightness, chroma, and hue angle for easier intuitive manipulation.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **OSA-UCS**  
  A uniform color space developed by the Optical Society of America for precise color comparisons in industrial applications.  
  [Reference](https://en.wikipedia.org/wiki/OSA-UCS)

- **CAM16 and CAM16-UCS**  
  Color appearance models that incorporate viewing conditions; CAM16-UCS is tuned for perceptual uniformity across different environments.  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)

- **CIECAM02**  
  A comprehensive color appearance model that factors in ambient light and other viewing conditions to predict how colors appear.  
  [Reference](https://en.wikipedia.org/wiki/CIECAM02)

- **IPT**  
  A model based on intensity and opponent channels (protan and tritan) that is used for image quality and color difference assessments.  
  [Reference](https://en.wikipedia.org/wiki/IPT_color_space)

- **JzAzBz / JzCzHz**  
  Recent color spaces designed so that Euclidean distances better correlate with perceived differences; JzCzHz is the cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/JzAzBz)  
  *(If not available on Wikipedia, consult specialized literature.)*

- **Oklab / Oklch**  
  Modern perceptual models optimized for digital media, offering improved uniformity over older spaces; Oklch is the cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/Oklab)
- **LMS**  
  A physiological model representing the responses of the three cone types in the human eye; it forms the basis for many perceptual spaces, though it is not uniform on its own.  
  [Reference](https://en.wikipedia.org/wiki/LMS_color_space)
- **UVW (1964)**  
  A historical CIE color space that extends the CIE system; it’s of historical interest and sometimes compared with modern perceptual spaces.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1964_color_space)

---

### Print and Color Difference Models  
*These models are primarily used in printing and for quantifying color differences.*  

- **CMY**  
  A subtractive color model based on cyan, magenta, and yellow inks, forming the basis for many printing processes.  
  [Reference](https://en.wikipedia.org/wiki/CMY_color_model)

- **CMYK**  
  An extension of CMY that adds black (K) to improve the reproduction of dark tones in printing.  
  [Reference](https://en.wikipedia.org/wiki/CMYK_color_model)

- **HunterLAB**  
  A model developed for industrial color measurement, similar in purpose to CIELAB but based on reflectance data.  
  [Reference](https://en.wikipedia.org/wiki/Hunter_Lab)

- **ICC-based Color Profiles**  
  Standardized profiles that define how colors are rendered across different devices to ensure consistency in print and digital media.  
  [Reference](https://en.wikipedia.org/wiki/ICC_profile)

- **Munsell Color System**  
  A system that specifies colors based on hue, value (lightness), and chroma, used widely for standardized color communication.  
  [Reference](https://en.wikipedia.org/wiki/Munsell_color_system)

- **NCS (Natural Color System)**  
  A perceptual color system based on how humans view colors, used extensively in design and architecture.  
  [Reference](https://en.wikipedia.org/wiki/Natural_Color_System)

- **RAL**  
  A standardized color matching system widely used in Europe for paints and coatings.  
  [Reference](https://en.wikipedia.org/wiki/RAL)

- **CcMmYK**  
  A variant of the CMYK model that includes extra channels for enhanced color reproduction in specialized printing.  
  [Reference](https://en.wikipedia.org/wiki/CcMmYK_color_model)

- **Hexachrome**  
  A six‑color printing process developed to extend the gamut of traditional CMYK printing.  
  [Reference](https://en.wikipedia.org/wiki/Hexachrome)

---

### Video and Broadcast Models  
*These models are tailored for video encoding and broadcast, often separating luminance and chrominance for efficient compression.*  

- **ICtCp**  
  A modern color model for HDR video that separates intensity from two chrominance components in a perceptually uniform manner.  
  [Reference](https://en.wikipedia.org/wiki/ICtCp)

- **sYCC**  
  A color model used in digital cameras that extends beyond sRGB for enhanced color reproduction in video capture.  
  [Reference](https://en.wikipedia.org/wiki/SYCC)

- **xvYCC**  
  An extended‑gamut video model supporting a broader range of colors, particularly beneficial for HDR content.  
  [Reference](https://en.wikipedia.org/wiki/XvYCC)

- **YCbCr**  
  A color model that separates luminance (Y) from chrominance (Cb and Cr), widely used in digital video compression and broadcast.  
  [Reference](https://en.wikipedia.org/wiki/YCbCr)

- **YCgCo**  
  A video model that decomposes color into luminance and two chrominance components (green‑difference and orange‑blue), used in compression algorithms.  
  [Reference](https://en.wikipedia.org/wiki/YCgCo)

- **YIQ**  
  The color model used in NTSC television that separates luminance from two chrominance components.  
  [Reference](https://en.wikipedia.org/wiki/YIQ)

- **YPbPr**  
  An analog component video format that separates a signal into luminance and two chrominance components, used in component video connections.  
  [Reference](https://en.wikipedia.org/wiki/YPbPr)

- **YUV**  
  A traditional color model used in both analog and digital video that separates luminance from chrominance.  
  [Reference](https://en.wikipedia.org/wiki/YUV)

- **Rec. 601**  
  The standard definition video color model (Y‑Cb‑Cr) used in broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)

---

### Other Models  
*This catch‑all category includes models that don’t fit neatly into the above groups.*  

- **TSL (Tint–Saturation–Lightness)**  
  A variant that emphasizes tint alongside saturation and lightness; it is used in some niche applications for color representation.  
  [Reference](https://en.wikipedia.org/wiki/TSL_color_space)

- **HLC (Hue–Lightness–Chroma)**  
  Similar to HCL, this model organizes color by hue, lightness, and chroma; it is essentially a variant of cylindrical representations of perceptual color.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab) *(see related HCL)*

- **iCAM**  
  A color appearance model designed for advanced imaging applications, incorporating complex adaptations to viewing conditions.  
  [Reference](https://en.wikipedia.org/wiki/ICAM_(color_appearance_model))

- **RYB (Red–Yellow–Blue)**  
  The traditional pigment‑mixing model used by artists, distinct from the additive RGB model.  
  [Reference](https://en.wikipedia.org/wiki/RYB_color_model)

- **RG Color Models**  
  Simplified models using only red and green channels; these are primarily of historical or academic interest.  
  [Reference](https://en.wikipedia.org/wiki/RG_color_models)

- **Imaginary Color**  
  A theoretical concept referring to colors that cannot be produced by real lights or pigments (often termed “impossible colors”).  
  [Reference](https://en.wikipedia.org/wiki/Impossible_color)

- **YJK**  
  A color model used in some older analog video systems, particularly in Japanese computers, falling within the broader YUV family.  
  [Reference](https://en.wikipedia.org/wiki/YJK)

- **GL (OpenGL Color Representation)**  
  A model that expresses color in normalized floating‑point values for use in OpenGL and similar graphics libraries.  
  [Reference](https://en.wikipedia.org/wiki/Colors)

---

## Color Spaces

*While many color models provide the conceptual framework, color spaces are their defined implementations—with specified primaries, white points, and transfer functions—for consistent color reproduction.*

### Hue Spaces  
*Defined instantiations of hue‑based models used especially in design and web applications.*  
- **HSL Space (as implemented in CSS)**  
  A defined implementation of the HSL model that specifies precise hue, saturation, and lightness values for web colors.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **HSV Space**  
  The standard implementation of the HSV model used in many graphics applications, specifying a particular value curve.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **HCL Space**  
  A space based on the HCL model, providing perceptually uniform color selections based on hue, chroma, and luminance.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)
- **HCT Space**  
  A defined version of the HCT model used in modern design systems with fixed tone and chroma parameters.  
  [Reference](https://material.io/blog/introducing-material-you)
- **HWB Space**  
  An implementation of the HWB model that specifies colors by hue, whiteness, and blackness, making tint/shade adjustments intuitive.  
  [Reference](https://en.wikipedia.org/wiki/HWB_color_model)

### RGB Spaces  
*Defined RGB color spaces that set specific primaries, white points, and transfer functions.*  
- **sRGB Space**  
  The most widely used RGB color space for digital displays, with standardized primaries and D65 white point.  
  [Reference](https://en.wikipedia.org/wiki/SRGB)
- **Adobe RGB Space**  
  An RGB space with a wider gamut than sRGB, used primarily in professional photography and print.  
  [Reference](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)
- **ROMM RGB / ProPhoto RGB**  
  A very wide‑gamut RGB space designed to capture maximum color information for high‑resolution imaging.  
  [Reference](https://en.wikipedia.org/wiki/ProPhoto_RGB)
- **ACEScg**  
  A defined RGB space from the ACES family, optimized for computer graphics and compositing.  
  [Reference](https://acescentral.com)
- **BT.709 / REC.709**  
  The standard RGB space for HDTV, with defined primaries and transfer functions for broadcast.  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)
- **BT.2020 / REC.2020**  
  An RGB space for UHD and HDR television featuring an extended gamut over REC.2020.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)
- **DCI P3**  
  A color space designed for digital cinema that covers a wider gamut than sRGB.  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)
- **Display P3**  
  A variant of DCI P3 optimized for modern wide‑gamut displays such as those on Apple devices.  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)
- **Linear sRGB**  
  The linear (gamma‑corrected) form of sRGB used for accurate color processing.  
  [Reference](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

### Device‑Independent and Perceptual Spaces  
*Spaces that are defined to be independent of any specific device and aim for perceptual uniformity.*  
- **CIE XYZ Space**  
  The foundational color space derived from human color matching experiments; it underpins many other spaces.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space)
- **CIE Lab / CIELCh Space**  
  A perceptually uniform space derived from XYZ using nonlinear transforms; CIELCh is its cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/CIELAB_color_space)
- **CIE Luv / LCHuv Space**  
  Another device‑independent space derived from XYZ, well‑suited for additive color mixing; LCHuv is its polar form.  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space)
- **OSA-UCS**  
  A uniform color space developed by the Optical Society of America for precise color comparisons across devices.  
  [Reference](https://en.wikipedia.org/wiki/OSA-UCS)
- **Oklab / Oklch Space**  
  A modern perceptual space optimized for digital displays, offering improved uniformity over older models; Oklch is its cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/Oklab)
- **CAM16/UCS Space**  
  A color space derived from the CAM16 appearance model, refined for uniformity in different viewing conditions.  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)
- **IPT Space**  
  A space that separates intensity from chromatic opponent channels, used for image quality and color difference evaluations.  
  [Reference](https://en.wikipedia.org/wiki/IPT_color_space)
- **JzAzBz / JzCzHz Space**  
  Recent perceptually uniform spaces in which Euclidean distances align well with perceived differences; JzCzHz is the cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/JzAzBz)
- **LMS Space**  
  A space based on the responses of the three cone types in the human eye; it serves as a basis for many perceptual transforms.  
  [Reference](https://en.wikipedia.org/wiki/LMS_color_space)
- **UVW (1964) Space**  
  A historical color space extending the CIE system, of interest for comparing older and modern perceptual spaces.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1964_color_space)

### Video Color Spaces  
*Defined specifically for video and broadcast applications, these spaces incorporate transfer functions and gamuts tailored to moving images.*  
- **YCbCr Space**  
  A color space that separates luminance from chrominance, used extensively in digital video compression.  
  [Reference](https://en.wikipedia.org/wiki/YCbCr)
- **YUV Space**  
  A traditional color space used in both analog and digital video that separates brightness from color information.  
  [Reference](https://en.wikipedia.org/wiki/YUV)
- **Rec. 601 Space**  
  The standard color space for standard‑definition television, defining YCbCr parameters for broadcast.  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)
- **Rec. 2100 Space**  
  A color space specified for HDR and Ultra‑HD television, featuring extended dynamic range and gamut.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2100)

---

## Color Systems

*These are comprehensive frameworks used for color communication, matching, and specification across industries.*

### Hue Systems  
*Systems that organize and classify colors primarily based on hue, often used in art and design.*  
- **Pantone Matching System (PMS)**  
  A proprietary system that standardizes colors for printing and product design, ensuring consistent reproduction.  
  [Reference](https://en.wikipedia.org/wiki/Pantone)
- **Munsell Color System**  
  Defines color by hue, value, and chroma to create a systematic, perceptually based method for color communication.  
  [Reference](https://en.wikipedia.org/wiki/Munsell_color_system)
- **NCS (Natural Color System)**  
  A perceptual color system based on how humans perceive color, widely used in Europe for architecture and design.  
  [Reference](https://en.wikipedia.org/wiki/Natural_Color_System)
- **RYB Color System**  
  The traditional subtractive color system used by artists, based on red, yellow, and blue pigments.  
  [Reference](https://en.wikipedia.org/wiki/RYB_color_model)

### RGB Systems  
*Systems based on RGB definitions used primarily in digital and broadcast contexts.*  
- **Federal Standard 595C**  
  A U.S. government standard that specifies a fixed palette for military and industrial applications.  
  [Reference](https://en.wikipedia.org/wiki/Federal_Standard_595)
- **ANSI Color System**  
  Defines a set of colors used in computer terminals and command-line interfaces via ANSI escape codes.  
  [Reference](https://en.wikipedia.org/wiki/ANSI_escape_code)
- **British Standard Colour (BS)**  
  A standardized color system used in the UK for industrial and design applications.  
  [Reference](https://en.wikipedia.org/wiki/British_Standard_Colour)
- **Coloroid**  
  A system developed for architectural and interior design applications that organizes colors based on aesthetic principles.  
  [Reference](https://en.wikipedia.org/wiki/Coloroid)
- **HKS**  
  A set of spot color standards used predominantly in European printing and graphic design.  
  [Reference](https://en.wikipedia.org/wiki/HKS_(color_system))
- **DIC Color System**  
  A proprietary color system developed by DIC Corporation for packaging, design, and printing applications.  
  [Reference](https://en.wikipedia.org/wiki/DIC_Corporation)

### Other Systems  
*Additional frameworks for color communication and matching.*  
- **SCOTDIC**  
  A color system used primarily in the textile industry for standardized dye matching and quality control.  
  [Reference](https://en.wikipedia.org/wiki/SCOTDIC)
- **ANPA**  
  Originally developed by the American Newspaper Publishers Association to standardize color reproduction in print media.  
  [Reference](https://en.wikipedia.org/wiki/News_Media_Alliance)
- **Colour Index International**  
  A global reference system for pigments and dyes used in various industries to ensure consistent color reproduction.  
  [Reference](https://en.wikipedia.org/wiki/Colour_Index_International)
- **ISCC-NBS**  
  A color naming and classification system developed by the Inter‑Society Color Council and the National Bureau of Standards.  
  [Reference](https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system)
- **Ostwald Color System**  
  A historical system developed by Wilhelm Ostwald for systematically classifying and comparing colors.  
  [Reference](https://en.wikipedia.org/wiki/Ostwald_color_system)
- **PCCS (Practical Color Coordinate System)**  
  A system used to represent and communicate color coordinates for practical design and manufacturing applications.  
  [Reference](https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System)
- **ColorADD**  
  A color identification system designed to assist people with color blindness by assigning simple, intuitive color codes.  
  [Reference](https://en.wikipedia.org/wiki/ColorADD)

---

## Color Standards

*These are the official specifications and guidelines that govern how colors are reproduced, encoded, and communicated across devices and media.*

### RGB Standards  
*Standards that define specific RGB color spaces and their parameters for consistent reproduction on digital devices.*  
- **sRGB Standard**  
  The most widely used RGB color standard for digital imaging and the web, defining primaries, a white point, and gamma characteristics.  
  [Reference](https://en.wikipedia.org/wiki/SRGB)
- **BT.709 / REC.709**  
  The standard for HDTV, defining the RGB color space used in broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)
- **BT.2020 / REC.2020**  
  A standard for Ultra‑HD and HDR television, specifying an extended RGB color space with a wider gamut.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)
- **DCI P3**  
  A standard RGB color space used in digital cinema, offering a wider gamut than sRGB for high‑quality projection.  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)
- **Display P3**  
  A variant of DCI P3 optimized for modern wide‑gamut displays, commonly used in consumer electronics.  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)

### Video Standards  
*Standards governing color encoding, transfer functions, and signal formats for video and broadcast.*  
- **Rec. 601**  
  The standard definition video color space that defines Y‑Cb‑Cr encoding for broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)
- **Rec. 2100**  
  The ITU‑R standard for HDR and Ultra‑HD television, detailing color spaces and transfer functions for modern video formats.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2100)
- **NTSC**  
  The analog television standard primarily used in North America and parts of Asia, defining color encoding and resolution.  
  [Reference](https://en.wikipedia.org/wiki/NTSC)
- **PAL**  
  An analog television standard widely used in Europe and other regions, with its own method of color encoding.  
  [Reference](https://en.wikipedia.org/wiki/PAL)
- **SECAM**  
  An analog television standard used mainly in France and parts of Eastern Europe, differing in its color encoding approach.  
  [Reference](https://en.wikipedia.org/wiki/SECAM)
- **SMPTE 240M/"C"**  
  A standard that defines color encoding and other parameters for high‑definition television, often associated with NTSC variants.  
  [Reference](https://en.wikipedia.org/wiki/NTSC#SMPTE_C)
- **MAC (Multiplexed Analogue Components)**  
  A broadcast standard for transmitting component video signals in a multiplexed analog format.  
  [Reference](https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components)
- **YDbDr**  
  A color standard used in some analog video systems (particularly in Europe) that represents color differences.  
  [Reference](https://en.wikipedia.org/wiki/YDbDr)
- **YJK**  
  A color model/standard used in certain older analog video systems, notably in Japanese computers.  
  [Reference](https://en.wikipedia.org/wiki/YJK)

### Other Standards  
*Additional official specifications and profiles for color reproduction and device calibration.*  
- **ICC-based Color Profiles**  
  Profiles based on ICC standards that define how colors are rendered across different devices for accurate reproduction.  
  [Reference](https://en.wikipedia.org/wiki/ICC_profile)
- **ISO-CIE Color Encodings**  
  A collection of standardized color encoding methods defined by ISO and the CIE (such as CIE XYZ, CIELAB, and CIELUV) to provide device‑independent frameworks.  
  [Reference](https://en.wikipedia.org/wiki/Color_space)
- **JIS Z8102**  
  A Japanese standard for color specification that ensures consistent color reproduction in various industries.  
  [Reference](https://en.wikipedia.org/wiki/JIS_Z8102)
- **Federal Standard 595C**  
  An official U.S. government standard defining a fixed palette of colors for military and industrial applications.  
  [Reference](https://en.wikipedia.org/wiki/Federal_Standard_595)
