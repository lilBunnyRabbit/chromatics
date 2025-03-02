## Color Models

### Hue Models  
*These are models whose coordinates are expressed in cylindrical form with a hue (angle) as a primary component.*  
- **HCL (Hue–Chroma–Luminance)**  
  A model derived from CIELCh that organizes color by hue, chroma (saturation), and luminance, used to create perceptually uniform palettes.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)
- **HCT (Hue–Chroma–Tone)**  
  Developed for modern design (e.g., Material You), this model emphasizes tone (brightness) alongside hue and chroma for more uniform appearance.  
  [Reference](https://material.io/blog/introducing-material-you)
- **HPLuv (Hue–Pastel–Luv)**  
  A variant of HSLuv that produces softer, pastel colors while maintaining perceptual uniformity.  
  [Reference](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)
- **HSI (Hue–Saturation–Intensity)**  
  Uses the average of the RGB components as intensity, separating chromatic content from brightness; popular in image analysis.  
  [Reference](https://en.wikipedia.org/wiki/HSI_color_space)
- **HSL (Hue–Saturation–Lightness)**  
  Widely used in digital design (e.g., CSS), it describes colors by a hue angle, a saturation value, and lightness ranging from black to white.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **HSLuv**  
  A reparameterization of HSL designed for perceptual uniformity so that equal steps produce similar visual changes.  
  [Reference](https://www.hsluv.org/)
- **HSV (Hue–Saturation–Value)**  
  Also known as HSB, it uses “value” (brightness) instead of lightness and is common in computer graphics and color pickers.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **HWB (Hue–Whiteness–Blackness)**  
  Replaces saturation with explicit measures of white and black mix, making it easier to generate tints and shades.  
  [Reference](https://en.wikipedia.org/wiki/HWB_color_model)

### RGB Models  
*These models describe colors as combinations of red, green, and blue light and serve as the basis for many digital color spaces.*  
- **sRGB**  
  The standard RGB model for the web and consumer devices; it defines specific primaries, a D65 white point, and a gamma curve.  
  [Reference](https://en.wikipedia.org/wiki/SRGB)
- **RGB255**  
  An 8‑bit version of the RGB model where each channel is an integer from 0 to 255.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)
- **Normalized RGB**  
  Represents RGB values normalized between 0 and 1, used for internal calculations and conversions.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)
- **Linear sRGB**  
  The gamma‑linearized version of sRGB, used for accurate color arithmetic in image processing.  
  [Reference](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)
- **Adobe RGB**  
  A wide‑gamut RGB model developed by Adobe, offering a broader range of colors for professional applications.  
  [Reference](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)
- **ROMM RGB / ProPhoto RGB**  
  A very wide‑gamut RGB model intended for high‑resolution photography and advanced image editing.  
  [Reference](https://en.wikipedia.org/wiki/ProPhoto_RGB)
- **ACES, ACEScc, ACEScg**  
  A family of RGB models developed for motion picture production—with ACEScg optimized for CGI and compositing, and ACEScc for grading.  
  [Reference](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)
- **BT.709 / REC.709**  
  The standard RGB model for HDTV, defining primaries and transfer functions for broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)
- **BT.2020 / REC.2020**  
  A color model for Ultra‑HD and HDR television with an extended gamut compared to REC.2020.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)
- **DCI P3**  
  Developed for digital cinema, this RGB model offers a wider gamut than sRGB and is used in high‑end displays.  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)
- **Display P3**  
  A variant of DCI P3 optimized for modern displays such as those on Apple devices.  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)
- **rg Chromaticity**  
  A representation of RGB that isolates chromaticity by normalizing out intensity.  
  [Reference](https://en.wikipedia.org/wiki/Rg_chromaticity)

### Device-Independent and Perceptual Models  
*These models are designed to be independent of specific devices and, often through nonlinear transformations, approximate perceptual uniformity.*  
- **CIE XYZ**  
  The foundational, linear, device‑independent model based on human color matching experiments.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space)
- **CIE xyY**  
  A transformation of CIE XYZ that separates chromaticity (x, y) from luminance (Y); used in lighting and calibration.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram)
- **CIE Lab (CIELAB)**  
  A perceptually uniform color model derived from XYZ via a nonlinear transformation, widely used for color difference calculations.  
  [Reference](https://en.wikipedia.org/wiki/CIELAB_color_space)
- **CIE Lch (CIELCh)**  
  The cylindrical version of CIELAB, expressing color in terms of lightness, chroma, and hue.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)
- **CIE Luv (CIELUV)**  
  A perceptually based model derived from XYZ, especially suited for additive color mixing.  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space)
- **LCHab / LCHuv**  
  Cylindrical representations of CIELAB and CIELUV respectively; they express color as lightness, chroma, and hue angle.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)
- **OSA-UCS**  
  A uniform color model developed by the Optical Society of America for precise color comparison.  
  [Reference](https://en.wikipedia.org/wiki/OSA-UCS)
- **CAM16 and CAM16-UCS**  
  Color appearance models that account for viewing conditions; CAM16-UCS is a uniform version for better perceptual predictions.  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)
- **CIECAM02**  
  A comprehensive color appearance model that factors in viewing conditions like ambient light.  
  [Reference](https://en.wikipedia.org/wiki/CIECAM02)
- **IPT**  
  A model based on intensity and opponent channels (protan and tritan), used for image quality assessments.  
  [Reference](https://en.wikipedia.org/wiki/IPT_color_space)
- **JzAzBz / JzCzHz**  
  Recent perceptually uniform models where Euclidean distances better correlate with perceived differences; JzCzHz is the cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/JzAzBz) *(if unavailable on Wikipedia, refer to specialized literature)*
- **Oklab / Oklch**  
  Modern perceptual models optimized for digital displays, with Oklch being the cylindrical form.  
  [Reference](https://en.wikipedia.org/wiki/Oklab)
- **LMS**  
  A physiological model representing the responses of the three cone types in the human eye; it underpins many perceptual models but isn’t uniform on its own.  
  [Reference](https://en.wikipedia.org/wiki/LMS_color_space)
- **UVW (1964)**  
  A historical CIE model extending the CIE system, often mentioned alongside other perceptual spaces.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1964_color_space)

### Print and Color Difference Models  
*These models are primarily used in printing and for precise color difference measurements.*  
- **CMY**  
  A subtractive color model based on cyan, magenta, and yellow inks, forming the basis for many printing processes.  
  [Reference](https://en.wikipedia.org/wiki/CMY_color_model)
- **CMYK**  
  An extension of CMY that includes a key (black) component for improved reproduction of dark tones.  
  [Reference](https://en.wikipedia.org/wiki/CMYK_color_model)
- **HunterLAB**  
  A model developed for industrial color measurement, similar to CIELAB but based on reflectance.  
  [Reference](https://en.wikipedia.org/wiki/Hunter_Lab)
- **ICC-based Color Profiles**  
  Standardized profiles used to ensure consistent color reproduction across different devices.  
  [Reference](https://en.wikipedia.org/wiki/ICC_profile)
- **Munsell Color System**  
  A system that defines color based on hue, value, and chroma, widely used for standardized color communication.  
  [Reference](https://en.wikipedia.org/wiki/Munsell_color_system)
- **NCS (Natural Color System)**  
  A perceptual system based on human vision, used extensively in design and architecture.  
  [Reference](https://en.wikipedia.org/wiki/Natural_Color_System)
- **RAL**  
  A standardized color matching system widely used in Europe for paints and coatings.  
  [Reference](https://en.wikipedia.org/wiki/RAL)
- **CcMmYK**  
  A variant of the CMYK model that includes additional channels for more precise color reproduction in specialized printing.  
  [Reference](https://en.wikipedia.org/wiki/CcMmYK_color_model)
- **Hexachrome**  
  A six‑color printing process designed to extend the color gamut beyond CMYK.  
  [Reference](https://en.wikipedia.org/wiki/Hexachrome)

### Video and Broadcast Models  
*These models are designed for video encoding and broadcast, often separating luma and chroma components.*  
- **ICtCp**  
  A modern color model for HDR video that separates intensity from two chroma components in a perceptually uniform manner.  
  [Reference](https://en.wikipedia.org/wiki/ICtCp)
- **sYCC**  
  A model used in digital cameras that extends beyond sRGB for enhanced color reproduction.  
  [Reference](https://en.wikipedia.org/wiki/SYCC)
- **xvYCC**  
  An extended‑gamut video model supporting a broader range of colors, particularly for HDR content.  
  [Reference](https://en.wikipedia.org/wiki/XvYCC)
- **YCbCr**  
  Separates luminance from chrominance for efficient video compression; widely used in digital video.  
  [Reference](https://en.wikipedia.org/wiki/YCbCr)
- **YCgCo**  
  A video model that decomposes color into luminance and a green‑difference and an orange‑blue component, used in compression.  
  [Reference](https://en.wikipedia.org/wiki/YCgCo)
- **YIQ**  
  Used in NTSC television, this model separates luminance from two chrominance components.  
  [Reference](https://en.wikipedia.org/wiki/YIQ)
- **YPbPr**  
  An analog component video format separating luminance and two chrominance signals.  
  [Reference](https://en.wikipedia.org/wiki/YPbPr)
- **YUV**  
  A traditional color model for analog and digital video that separates luminance from chrominance.  
  [Reference](https://en.wikipedia.org/wiki/YUV)
- **Rec. 601**  
  A standard definition video model (Y‑Cb‑Cr) used in broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)

### Other Models  
*This catch‑all category includes models that don’t fit neatly elsewhere.*  
- **TSL (Tint–Saturation–Lightness)**  
  A variant emphasizing tint along with saturation and lightness; used in some niche applications.  
  [Reference](https://en.wikipedia.org/wiki/TSL_color_space)
- **HLC (Hue–Lightness–Chroma)**  
  Similar to HCL, this model organizes color by hue, lightness, and chroma.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab) *(see related HCL)*
- **iCAM**  
  A color appearance model for advanced imaging applications.  
  [Reference](https://en.wikipedia.org/wiki/ICAM_(color_appearance_model))
- **RYB (Red–Yellow–Blue)**  
  The traditional pigment‑mixing model used by artists, distinct from additive RGB.  
  [Reference](https://en.wikipedia.org/wiki/RYB_color_model)
- **RG Color Models**  
  Simplified models using only red and green channels; of historical/academic interest.  
  [Reference](https://en.wikipedia.org/wiki/RG_color_models)
- **Imaginary Color**  
  A theoretical concept for colors that cannot be produced by real lights or pigments.  
  [Reference](https://en.wikipedia.org/wiki/Impossible_color)
- **YJK**  
  A color model used in some older analog video systems (notably in Japanese computers).  
  [Reference](https://en.wikipedia.org/wiki/YJK)
- **GL (OpenGL Color Representation)**  
  A model that expresses color in normalized floating‑point values for use in OpenGL and similar graphics libraries.  
  [Reference](https://en.wikipedia.org/wiki/Colors)  

---

## Color Spaces

*While many color models provide the conceptual framework, color spaces are their defined implementations (with specified primaries, white points, and transfer functions).*

### Hue Spaces  
*Defined instantiations of hue‑based models.*  
- **HSL Space** (as implemented in CSS)  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **HSV Space**  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)
- **HCL Space**  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)
- **HCT Space**  
  [Reference](https://material.io/blog/introducing-material-you)
- **HWB Space**  
  [Reference](https://en.wikipedia.org/wiki/HWB_color_model)

### RGB Spaces  
*Defined RGB color spaces with specific primaries and transfer functions.*  
- **sRGB Space**  
  [Reference](https://en.wikipedia.org/wiki/SRGB)
- **Adobe RGB Space**  
  [Reference](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)
- **ROMM RGB / ProPhoto RGB**  
  [Reference](https://en.wikipedia.org/wiki/ProPhoto_RGB)
- **ACEScg**  
  [Reference](https://acescentral.com)
- **BT.709 / REC.709**  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)
- **BT.2020 / REC.2020**  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)
- **DCI P3**  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)
- **Display P3**  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)
- **Linear sRGB**  
  [Reference](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

### Device-Independent and Perceptual Spaces  
*Spaces derived from the perceptually uniform models (or that are device‑independent by design).*  
- **CIE XYZ Space**  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space)
- **CIE Lab / CIELCh Space**  
  [Reference](https://en.wikipedia.org/wiki/CIELAB_color_space)
- **CIE Luv / LCHuv Space**  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space)
- **OSA-UCS**  
  [Reference](https://en.wikipedia.org/wiki/OSA-UCS)
- **Oklab / Oklch Space**  
  [Reference](https://en.wikipedia.org/wiki/Oklab)
- **CAM16/UCS Space**  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)
- **IPT Space**  
  [Reference](https://en.wikipedia.org/wiki/IPT_color_space)
- **JzAzBz / JzCzHz Space**  
  [Reference](https://en.wikipedia.org/wiki/JzAzBz)

### Video Color Spaces  
*Spaces defined specifically for video and broadcast, with specialized transfer functions and gamuts.*  
- **YCbCr Space**  
  [Reference](https://en.wikipedia.org/wiki/YCbCr)
- **YUV Space**  
  [Reference](https://en.wikipedia.org/wiki/YUV)
- **Rec. 601 Space**  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)
- **Rec. 2100 Space**  
  [Reference](https://en.wikipedia.org/wiki/Rec._2100)

---

## Color Systems

*These are comprehensive frameworks used for color communication, matching, and specification across industries.*

### Hue Systems  
*Systems that organize colors primarily by hue and are popular in artistic and design contexts.*  
- **Pantone Matching System (PMS)**  
  [Reference](https://en.wikipedia.org/wiki/Pantone)
- **Munsell Color System**  
  [Reference](https://en.wikipedia.org/wiki/Munsell_color_system)
- **NCS (Natural Color System)**  
  [Reference](https://en.wikipedia.org/wiki/Natural_Color_System)
- **RYB Color System**  
  [Reference](https://en.wikipedia.org/wiki/RYB_color_model)

### RGB Systems  
*Systems based on RGB definitions used in various industries and applications.*  
- **Federal Standard 595C**  
  [Reference](https://en.wikipedia.org/wiki/Federal_Standard_595)
- **ANSI Color System**  
  [Reference](https://en.wikipedia.org/wiki/ANSI_escape_code)
- **British Standard Colour (BS)**  
  [Reference](https://en.wikipedia.org/wiki/British_Standard_Colour)
- **Coloroid**  
  [Reference](https://en.wikipedia.org/wiki/Coloroid)
- **HKS**  
  [Reference](https://en.wikipedia.org/wiki/HKS_(color_system))
- **DIC Color System**  
  [Reference](https://en.wikipedia.org/wiki/DIC_Corporation)

### Other Systems  
*Additional frameworks for color communication and matching.*  
- **SCOTDIC**  
  A color system used primarily in the textile industry for dye matching and quality control, offering a standardized method for color communication.  
  [Reference](https://en.wikipedia.org/wiki/SCOTDIC)  
- **ANPA**  
  [Reference](https://en.wikipedia.org/wiki/News_Media_Alliance)
- **Colour Index International**  
  [Reference](https://en.wikipedia.org/wiki/Colour_Index_International)
- **ISCC-NBS**  
  [Reference](https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system)
- **Ostwald Color System**  
  [Reference](https://en.wikipedia.org/wiki/Ostwald_color_system)
- **PCCS (Practical Color Coordinate System)**  
  [Reference](https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System)
- **ColorADD**  
  [Reference](https://en.wikipedia.org/wiki/ColorADD)

---

## Color Standards

*These are the official specifications and guidelines that govern color reproduction and encoding across devices and media.*

### RGB Standards  
*Standards that define specific RGB color spaces and their parameters.*  
- **sRGB Standard**  
  [Reference](https://en.wikipedia.org/wiki/SRGB)
- **BT.709 / REC.709**  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)
- **BT.2020 / REC.2020**  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)
- **DCI P3**  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)
- **Display P3**  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)

### Video Standards  
*Standards governing color encoding and transfer for video and broadcast.*  
- **Rec. 601**  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)
- **Rec. 2100**  
  [Reference](https://en.wikipedia.org/wiki/Rec._2100)
- **NTSC**  
  [Reference](https://en.wikipedia.org/wiki/NTSC)
- **PAL**  
  [Reference](https://en.wikipedia.org/wiki/PAL)
- **SECAM**  
  [Reference](https://en.wikipedia.org/wiki/SECAM)
- **SMPTE 240M/"C"**  
  [Reference](https://en.wikipedia.org/wiki/NTSC#SMPTE_C)
- **MAC (Multiplexed Analogue Components)**  
  [Reference](https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components)
- **YDbDr**  
  [Reference](https://en.wikipedia.org/wiki/YDbDr)
- **YJK**  
  [Reference](https://en.wikipedia.org/wiki/YJK)

### Other Standards  
*Additional official specifications and profiles for color reproduction.*  
- **ICC-based Color Profiles**  
  [Reference](https://en.wikipedia.org/wiki/ICC_profile)
- **ISO-CIE Color Encodings**  
  A collection of standardized color encoding methods defined by ISO and the CIE (such as CIE XYZ, CIELAB, and CIELUV), providing device‑independent frameworks.  
  [Reference](https://en.wikipedia.org/wiki/Color_space) 
- **JIS Z8102**  
  [Reference](https://en.wikipedia.org/wiki/JIS_Z8102)
- **Federal Standard 595C**  
  *(Also listed under RGB Systems, as it defines a specific palette for military/industrial use.)*  
  [Reference](https://en.wikipedia.org/wiki/Federal_Standard_595)
