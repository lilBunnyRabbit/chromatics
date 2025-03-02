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


## [CMYK](./CMYK.ts)

| Parameter | Name    | Range | Description            |
| --------- | ------- | ----- | ---------------------- |
| `c`       | Cyan    | 0-100 | Cyan ink percentage    |
| `m`       | Magenta | 0-100 | Magenta ink percentage |
| `y`       | Yellow  | 0-100 | Yellow ink percentage  |
| `k`       | Key     | 0-100 | Black ink percentage   |

| Manipulation                  | Description                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **Tint and Shade Adjustment** | Adding or reducing the amount of key (black) ink to adjust the tint or shade of the color.    |
| **Color Separation**          | Preparing images for printing by separating into individual color components including black. |


Essential for applications targeting printed materials, as it corresponds to the color mixing process of printers. Implementing CMYK allows for accurate color representation in print design workflows.

- https://en.wikipedia.org/wiki/CMYK_color_model
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-c-m-y-k/


## CMYK (Cyan, Magenta, Yellow, Black) Color Model  
**Refined Description:** CMYK is a **subtractive color model** used in color printing, based on absorbing (masking) light using pigments ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=subtractive%20%20%20112%2C%20based,most%20often%20black)). It extends the CMY model (cyan, magenta, yellow – the complements of RGB primaries) by adding **K (black)** ink. In CMY, ideal cyan absorbs red, magenta absorbs green, and yellow absorbs blue, so combining them subtracts various wavelengths from white light ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=The%20CMYK%20model%20works%20by,light%20minus%20blue%20leaves%20yellow)). The “K” component accounts for black ink usage, since mixing 100% C, M, Y in real inks often produces a muddy dark brown rather than a true black ([Why is the color Black designated by the letter K in CMYK?](https://www.colorvisionprinting.com/blog/why-is-the-color-black-designated-by-the-letter-k-in-cmyk#:~:text=CMYK%3F%20www,prints%20as%20a%20truer%20black)) ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=In%20additive%20color%20%20models%2C,of%20cyan%2C%20magenta%2C%20and%20yellow)). Mathematically, the ideal CMYK can be seen as an inverted RGB: C = 1–R, M = 1–G, Y = 1–B under an assumption of normalized [0,1] values, and K is an additional component usually defined as K = min(C,M,Y) in one common formulation (to remove the minimum cyan/magenta/yellow and put it into black). This model differs from RGB in that it describes how inks or dyes on a white substrate produce color by *subtracting* light; thus, white is the absence of inks (paper color) and black is achieved by full ink coverage ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=In%20additive%20color%20%20models%2C,of%20cyan%2C%20magenta%2C%20and%20yellow)).

**Usages:** CMYK is the standard for **printing** (books, magazines, packaging) and any process that lays pigments on paper. It is beneficial because it aligns with how inks mix and allows a wider tonal range with the black ink: using black (K) improves shadow depth and contrast, and is more economical (since using all three C, M, Y to achieve dark tones is inefficient) ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=In%20additive%20color%20%20models%2C,of%20cyan%2C%20magenta%2C%20and%20yellow)). In industry, colors are often specified in CMYK for press – e.g., a certain corporate logo color might be given as a CMYK percentage. Compared to RGB, CMYK’s strength is in representing reflective color on white media and in matching the printing process; however, it is device-dependent (the exact results vary with printer profiles, ink formulations, paper) and not intuitive for picking specific hues (designers often use Pantone or Lab to select colors, then convert to CMYK for print). It also has a smaller gamut than typical RGB spaces – many vivid RGB colors cannot be reproduced exactly in CMYK. ICC profiles for printers define mappings from device-independent spaces (like CIE Lab) to CMYK for accurate color reproduction ([ICC Profiles - IBM](https://www.ibm.com/docs/en/i/7.4?topic=management-icc-profiles#:~:text=ICC%20Profiles%20,to%20include%20all%20the)).

**Parameters:** CMYK has four parameters corresponding to ink percentages:  
- **Cyan (C)** – Amount of cyan ink (0–100%). *Effect:* Higher cyan yields more absorption of red light (the print looks more greenish-blue). 0% cyan means no red is absorbed (full red reflectance passes through that layer).  
- **Magenta (M)** – Amount of magenta ink (0–100%). *Effect:* Higher magenta absorbs more green light (print gains a purplish/red cast). 0% magenta yields no green absorption (full green reflectance).  
- **Yellow (Y)** – Amount of yellow ink (0–100%). *Effect:* Higher yellow absorbs more blue light (color appears more yellow/orange). 0% yields full blue reflectance.  
- **Black (K)** – Amount of black ink (0–100%). *Effect:* Adds neutral black density. Increasing K darkens the color and reduces its saturation by overlaying black; 0% means no black ink (shadows must be achieved by C+M+Y alone).  

In practice, when K is added, the C, M, Y values may be reduced to compensate (“GCR” – gray component replacement). For example, a medium gray might be specified as 0% C, 0% M, 0% Y, 50% K rather than 50% of each C,M,Y. Adjusting each parameter changes the print color nonlinearly: e.g., raising K makes colors duller (since black absorbs all wavelengths) and is typically used to deepen shadows and text.

**Direct Conversion Paths:** **CMY ↔ RGB** conversions are direct by inversion (assuming idealized inks and no gamma correction: C=1–R, M=1–G, Y=1–B) ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=The%20analogue%20YUV%20%20and,signals%20instead)). **CMYK ↔ RGB** also has formula-based conversions if a strategy for K is defined (one common formula: K = 1−max(R,G,B); then C=(1−R−K)/(1−K), etc., when 1−K > 0) ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=The%20analogue%20YUV%20%20and,signals%20instead)). **CMY ↔ CMYK** is straightforward: given C, M, Y, one can compute a K (typically the minimum or a desired black level) and subtract it out to get CMYK, and vice versa by adding K back to C, M, Y. However, exact conversions depend on print calibration – in professional workflows, conversions involve lookup tables or profiles rather than a single formula. There are no *direct* conversions between CMYK and models like HSL/HSV or CIE Lab without going through RGB or an intermediary colorimetric space, because CMYK is inherently device-specific. (Color management systems convert CMYK ⇄ Lab/XYZ using printer profiles ([ICC Profiles - IBM](https://www.ibm.com/docs/en/i/7.4?topic=management-icc-profiles#:~:text=ICC%20Profiles%20,to%20include%20all%20the)), but that is an ICC profile pipeline, not a simple analytic conversion.)

**References:** The subtractive model theory is covered in color science texts (e.g., **Billmeyer & Saltzman’s Principles of Color Technology** for how pigments mix). The Wikipedia summary concisely explains the CMYK mechanism and rationale for the black component ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=In%20additive%20color%20%20models%2C,of%20cyan%2C%20magenta%2C%20and%20yellow)). X-Rite’s color guides and printing industry specs discuss practical usage of CMYK and how black (“K”) improves print quality ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=In%20additive%20color%20%20models%2C,of%20cyan%2C%20magenta%2C%20and%20yellow)). ICC specification (ISO 15076) defines how CMYK values map via the Profile Connection Space (usually CIE Lab D50) for consistent reproduction ([Profile connection space (PCS) – Part 2 of ICC profile series – Color Sherlock's Journal](https://printcolormanagement.wordpress.com/2012/09/24/profile-connection-space-pcs-part-2-of-icc-profile-series/#:~:text=The%20profile%20connection%20space%20is,those%20defined%20for%20the%20colorimetry)) ([Profile connection space (PCS) – Part 2 of ICC profile series – Color Sherlock's Journal](https://printcolormanagement.wordpress.com/2012/09/24/profile-connection-space-pcs-part-2-of-icc-profile-series/#:~:text=The%20default%20measurement%20parameters%20for,illumination%20level%20of%20500%20lux)). For a historical perspective, printing journals from the late 19th century document the introduction of the four-color process (CMYK) in color comics (c. 1890s) ([CMYK color model - Wikipedia](https://en.wikipedia.org/wiki/CMYK_color_model#:~:text=The%20CMYK%20printing%20process%20was,to%20publish%20color%20comic%20strips)).

---
