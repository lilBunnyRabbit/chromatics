## Color Models

### Hue Models  
*These models express colors in a cylindrical format, where a hue (angle) is a primary component along with one or more measures of chroma/saturation and brightness/lightness.*

- **HCL (Hue–Chroma–Luminance)**  
  A model derived from the cylindrical representation of CIELAB (CIELCh), used for generating perceptually uniform palettes.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **HCT (Hue–Chroma–Tone)**  
  Developed for modern design systems (e.g., Material You), this model emphasizes perceptually uniform tone alongside hue and chroma.  
  [Reference](https://material.io/blog/introducing-material-you)

- **HPLuv (Hue–Pastel–Luv)**  
  A variant of HSLuv that produces softer, pastel colors while preserving perceptual uniformity.  
  [Reference](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/)

- **HSI (Hue–Saturation–Intensity)**  
  Uses the average of the RGB components for intensity, separating chromatic content from brightness; common in image analysis.  
  [Reference](https://en.wikipedia.org/wiki/HSI_color_space)

- **HSL (Hue–Saturation–Lightness)**  
  Widely used in digital design and CSS, this model describes color by hue, saturation, and a lightness value that interpolates between black and white.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HSLuv**  
  A reparameterized version of HSL that aims to be perceptually uniform so that equal steps in its components yield similar visual differences.  
  [Reference](https://www.hsluv.org/)

- **HSV (Hue–Saturation–Value)**  
  Also known as HSB, this model uses “value” (brightness) instead of lightness and is popular in computer graphics and color pickers.  
  [Reference](https://en.wikipedia.org/wiki/HSL_and_HSV)

- **HWB (Hue–Whiteness–Blackness)**  
  Replaces the saturation axis with explicit measures of whiteness and blackness, providing an intuitive way to create tints and shades.  
  [Reference](https://en.wikipedia.org/wiki/HWB_color_model)

---

### RGB Models  
*These models represent colors as combinations of red, green, and blue light and are fundamental to digital imaging.*

- **sRGB**  
  The standard RGB color space for web and consumer devices, defined with a gamma curve that approximates human vision.  
  [Reference](https://en.wikipedia.org/wiki/SRGB)

- **RGB255**  
  An 8‑bit RGB model where each channel is expressed as an integer between 0 and 255; the most common digital representation.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)

- **Normalized RGB**  
  An RGB representation with channel values normalized between 0 and 1, useful for internal calculations and conversions.  
  [Reference](https://en.wikipedia.org/wiki/RGB_color_model)

- **Linear sRGB**  
  The linearized form of sRGB (gamma correction removed) used for accurate color arithmetic in imaging and graphics.  
  [Reference](https://en.wikipedia.org/wiki/SRGB#The_sRGB_transfer_function)

- **Adobe RGB**  
  A wide‑gamut RGB color space developed by Adobe, offering a broader range of colors for professional photography and print.  
  [Reference](https://en.wikipedia.org/wiki/Adobe_RGB_color_space)

- **ROMM RGB / ProPhoto RGB**  
  A very wide‑gamut RGB space designed for preserving maximum color information in high‑resolution photography and advanced editing.  
  [Reference](https://en.wikipedia.org/wiki/ProPhoto_RGB)

- **ACES, ACEScc, ACEScg**  
  A family of RGB models developed for the motion picture industry. ACES provides a wide gamut and high dynamic range; ACEScc is optimized for grading; ACEScg is designed for CGI and compositing.  
  [Reference](https://en.wikipedia.org/wiki/Academy_Color_Encoding_System)

- **BT.709 / REC.709**  
  The standard RGB color space for HDTV, defining primaries and transfer functions for broadcast television.  
  [Reference](https://en.wikipedia.org/wiki/Rec._709)

- **BT.2020 / REC.2020**  
  A color space for Ultra‑HD and HDR television that provides a wider gamut than REC.2020.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2020)

- **DCI P3**  
  A color space developed for digital cinema, with a wider gamut than sRGB and used in high‑end projection and displays.  
  [Reference](https://en.wikipedia.org/wiki/DCI-P3)

- **Display P3**  
  A variant of DCI P3 optimized for modern displays, particularly on mobile devices and high‑resolution monitors.  
  [Reference](https://en.wikipedia.org/wiki/Display_P3)

- **rg Chromaticity**  
  A representation that isolates chromaticity information from RGB by normalizing out intensity.  
  [Reference](https://en.wikipedia.org/wiki/Rg_chromaticity)

---

## Color Spaces  
*These are device‑independent or perceptual spaces that aim to represent colors in a way that is either standardized or more aligned with human vision.*

- **CIE XYZ**  
  The foundational, linear, and device‑independent color space based on human color matching experiments.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space)

- **CIE xyY**  
  A transformation of CIE XYZ that separates chromaticity (x, y) from luminance (Y); widely used in lighting and calibration.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram)

- **CIE Lab (CIELAB)**  
  A perceptually uniform color space derived from XYZ via a nonlinear transformation; widely used for measuring color differences.  
  [Reference](https://en.wikipedia.org/wiki/CIELAB_color_space)

- **CIE Lch (CIELCh)**  
  The cylindrical (polar) version of CIELAB, expressing color via lightness, chroma, and hue angle.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)

- **CIE Luv (CIELUV)**  
  A perceptually based color space derived from XYZ, particularly suited for additive color mixing.  
  [Reference](https://en.wikipedia.org/wiki/CIELUV_color_space)

- **LCHab and LCHuv**  
  The cylindrical representations of CIELAB and CIELUV, respectively; they express colors as lightness, chroma, and hue.  
  [Reference](https://en.wikipedia.org/wiki/CIELCh_ab)  
  *(For LCHuv, see also CIELUV discussion.)*

- **OSA-UCS**  
  A uniform color space developed by the Optical Society of America for precise color comparison.  
  [Reference](https://en.wikipedia.org/wiki/OSA-UCS)

- **Oklab / Oklch**  
  A modern perceptual color space designed for improved uniformity on digital devices; Oklch is its cylindrical form.  
  [Reference](https://en.wikipedia.org/wiki/Oklab) *(or visit [oklch.com](https://oklch.com))*

- **CAM16, CAM16-UCS, CIECAM02**  
  Color appearance models that predict how colors appear under different viewing conditions. CAM16 and CAM16-UCS are newer and improved variants.  
  [Reference](https://en.wikipedia.org/wiki/CAM16_color_appearance_model)

- **IPT**  
  A color space based on intensity and opponent channels (Protan and Tritan), used primarily for image quality and color difference assessments.  
  [Reference](https://en.wikipedia.org/wiki/IPT_color_space)

- **JzAzBz and JzCzHz**  
  Recent perceptually uniform color spaces in which Euclidean distances correlate closely with perceived differences; JzCzHz is the cylindrical version.  
  [Reference](https://en.wikipedia.org/wiki/JzAzBz) *(if not on Wikipedia, refer to specialized sources)*

- **LMS**  
  A physiological model representing the responses of the three types of cone photoreceptors. It is used as a basis for many perceptual transformations but is not perceptually uniform on its own.  
  [Reference](https://en.wikipedia.org/wiki/LMS_color_space)

- **UVW (1964)**  
  A historical CIE color space from 1964 that extends the CIE system; it’s sometimes discussed alongside other perceptual spaces.  
  [Reference](https://en.wikipedia.org/wiki/CIE_1964_color_space)

---

## Color Systems  
*These are comprehensive frameworks or proprietary systems used for color communication, matching, or specification in industry and design.*

- **Federal Standard 595C**  
  A U.S. government standard that specifies a palette of approved colors for military and industrial applications.  
  [Reference](https://en.wikipedia.org/wiki/Federal_Standard_595)

- **Pantone Matching System (PMS)**  
  A proprietary system widely used in printing and design for ensuring consistent color reproduction.  
  [Reference](https://en.wikipedia.org/wiki/Pantone)

- **Coloroid**  
  A system developed for architectural and interior design applications, focusing on aesthetic color organization.  
  [Reference](https://en.wikipedia.org/wiki/Coloroid)

- **HKS**  
  A set of spot color standards commonly used in European graphic design and printing.  
  [Reference](https://en.wikipedia.org/wiki/HKS_(color_system))

- **Munsell Color System**  
  A system that defines color based on hue, value, and chroma for standardized color communication in various industries.  
  [Reference](https://en.wikipedia.org/wiki/Munsell_color_system)

- **NCS (Natural Color System)**  
  A perceptual color system based on human vision, used extensively in Europe for design and architecture.  
  [Reference](https://en.wikipedia.org/wiki/Natural_Color_System)

- **RAL**  
  A standardized color matching system used primarily in Europe for paints and coatings.  
  [Reference](https://en.wikipedia.org/wiki/RAL)

- **CcMmYK**  
  A variant of the traditional CMYK system that includes additional channels for specialized printing.  
  [Reference](https://en.wikipedia.org/wiki/CcMmYK_color_model)

- **Hexachrome**  
  A six‑color printing process developed to extend the color gamut beyond what is possible with CMYK.  
  [Reference](https://en.wikipedia.org/wiki/Hexachrome)

- **ColorADD**  
  A color identification system designed to help color-blind individuals by assigning simple codes to colors.  
  [Reference](https://en.wikipedia.org/wiki/ColorADD)

- **PCCS (Practical Color Coordinate System)**  
  A system used for representing and communicating color coordinates in practical design contexts.  
  [Reference](https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System)

- **ANPA**  
  A color system originally developed by the American Newspaper Publishers Association for print color reproduction.  
  [Reference](https://en.wikipedia.org/wiki/News_Media_Alliance)

- **Colour Index International**  
  A reference system for pigments and dyes, used in various industries for color standardization.  
  [Reference](https://en.wikipedia.org/wiki/Colour_Index_International)

- **DIC**  
  A proprietary color system developed by DIC Corporation for design and packaging applications.  
  [Reference](https://en.wikipedia.org/wiki/DIC_Corporation)

- **ISCC-NBS**  
  A collaborative system for naming and classifying colors, developed by the Inter-Society Color Council and the National Bureau of Standards.  
  [Reference](https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system)

- **Ostwald Color System**  
  A historical system developed by Wilhelm Ostwald for systematically classifying colors.  
  [Reference](https://en.wikipedia.org/wiki/Ostwald_color_system)

- **JIS Z8102**  
  A Japanese Industrial Standard for color specification, ensuring consistency in color reproduction.  
  [Reference](https://en.wikipedia.org/wiki/JIS_Z8102)

---

## Color Standards  
*These include specifications and guidelines for color representation and reproduction across devices and industries.*

- **ICC-based Color Profiles**  
  Standardized profiles (based on ICC specifications) used to ensure consistent color reproduction across different devices.  
  [Reference](https://en.wikipedia.org/wiki/ICC_profile)

- **REC. 601**  
  A standard for standard‑definition television color encoding (Y‑Cb‑Cr) used in broadcast video.  
  [Reference](https://en.wikipedia.org/wiki/Rec._601)

- **SMPTE 240M/"C"**  
  A standard defining high‑definition television color encoding and other video parameters, commonly associated with NTSC systems.  
  [Reference](https://en.wikipedia.org/wiki/NTSC#SMPTE_C)

- **Rec. 2100**  
  The ITU‑R recommendation for HDR and Ultra‑HD television, specifying color spaces and transfer functions for modern video.  
  [Reference](https://en.wikipedia.org/wiki/Rec._2100)

- **NTSC, PAL, SECAM**  
  Analog television color encoding standards used in various regions (NTSC in North America, PAL in many European and Asian countries, SECAM primarily in France and parts of Eastern Europe).  
  [NTSC Reference](https://en.wikipedia.org/wiki/NTSC) | [PAL Reference](https://en.wikipedia.org/wiki/PAL) | [SECAM Reference](https://en.wikipedia.org/wiki/SECAM)

- **MAC (Multiplexed Analogue Components)**  
  A broadcast standard that transmits component signals in a multiplexed analog format.  
  [Reference](https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components)

- **YJK**  
  A color model used in some older analog video systems, particularly in Japanese computing, falling within the YUV family.  
  [Reference](https://en.wikipedia.org/wiki/YJK)

- **REC. 2100** (also listed under Video)  
  As above, a modern standard for HDR video.

- **Rec. 601, SMPTE 240M, NTSC, PAL, SECAM, MAC, YJK** are often grouped together as part of the video and broadcast standards but can also be considered color standards for television.

- **Other video-specific models** such as **YCbCr, YUV, YIQ, YPbPr, sYCC, xvYCC, ICtCp, YCgCo** (see Video & Broadcast section above) have their own standardized definitions and are integral to color encoding in broadcast and digital video.
  
  *(They are included above in the “Video and Broadcast Standards” section.)*
