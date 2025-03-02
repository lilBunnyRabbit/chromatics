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

## CIE LCh

| Parameter | Name      | Range | Description                                  |
| --------- | --------- | ----- | -------------------------------------------- |
| `L`       | Lightness | 0-100 | The lightness of the color.                  |
| `C`       | Chroma    | 0-∞   | The colorfulness relative to the brightness. |
| `H`       | Hue Angle | 0-360 | The angle of the hue in the color wheel.     |

| Manipulation          | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| **Hue Rotation**      | Rotating `H` to change the hue.                                   |
| **Chroma Adjustment** | Adjusting `C` to modify the saturation or vividness of the color. |
| **Lightness Control** | Modifying `L` to change the brightness.                           |

(general term, often refers to LCHab or LCHuv)

A color model based on CIE Lab, designed to be more perceptually relevant. The model represents color with three components: L* for lightness, C* for chroma, and h* for hue angle.

## CIE LCH (L\*C\*h°, cylindrical Lab/Luv) Color Model  
**Refined Description:** **CIE LCH** is not a new color space but a **cylindrical representation** of either CIELAB or CIELUV. It expresses colors in terms of **L\*** (lightness), **C\*** (chroma), and **h°** (hue angle) ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=LCh%3A%20uniform%20color%20space)). Essentially, LCH coordinates are derived by converting the (a*, b*) or (u*, v*) coordinates to polar form: $C^* = \sqrt{a^{*2} + b^{*2}}$ and $h^* = \arctan2(b^*, a^*)$ (for Lab), commonly denoted as L*C*_ab*h_ab, or using u*,v* for Luv (notated L*C*_uv*h_uv). Most often, “LCH” refers to L*C*h from Lab, as that’s widely used in design and now in CSS Color 4 (written as `lch()`), but one should clarify which base. LCH’s **hue angle (h°)** runs 0° to 360° (0 = +a* axis = red in Lab’s case, 90 = +b* = yellow, 180 = -a* = green, 270 = -b* = blue). **Chroma (C*)** is the radial distance from the neutral axis – it quantifies color saturation/intensity. **Lightness (L*)** is the same as in the base space. The benefit of LCH is that it explicitly separates the perceptual dimensions of hue, chroma, and lightness (similar to HSL but on a perceptually uniform base). This makes it easier to manipulate colors: e.g., one can increase C* to make a color more vivid without changing its hue or lightness. LCH differs from HSL/HSV in that it’s based on Lab’s nonlinearity and opponent axes, so a given change in C* or h corresponds more closely to a uniform change in perception than a change in S in HSL would ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=value%20should%20produce%20a%20change,2)).

**Usages:** LCH (Lab) is used in **color pickers and palettes** that aim for perceptual uniformity. For instance, some modern design tools and libraries allow selecting colors in LCH to ensure consistent contrast changes. The W3C has included LCH in CSS Color Module Level 4, meaning web designers can specify colors in LCH for more predictable adjustments across hues ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=4.%20%5E%20Ottosson%2C%20Bj%C3%B6rn%20%282020,Retrieved%2011%20January%202023)). LCH is also used in color difference formulas indirectly – e.g., CIEDE2000 uses LCH coordinates to apply corrections in the hue dimension. The **strength** of LCH is giving intuitive control (especially hue angle) in a space that’s more uniform than HSV. For example, if you take LCH colors with fixed L and C but varying h, you get a set of colors that are roughly equally bright and equally saturated as perceived (though note that Lab’s uniformity isn’t perfect, so some hues might appear a bit different in lightness at the same L, but far less variation than in RGB or HSV). Also, designers often use LCH to create harmonious color schemes: by keeping L constant and choosing hues separated by certain angles, or by smoothly interpolating in LCH for gradients (which avoids muddy middle colors that might occur if interpolating in RGB). LCH (Luv) is less commonly used explicitly, but HSLuv (an open-source color system) is essentially LCH_uv reparameterized to 0–100 scales, aiming for a user-friendly uniform color picker ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=)). Limitations: Because Lab itself isn’t perfectly perceptual, LCH will still have some issues (particularly, at high chroma some hue rotations are not uniform). Also not all LCH coordinates map to real colors – if C* is too large for a given L*, the color is out of gamut (imaginary), which can happen especially for blue hues beyond what sRGB can display. Tools often clamp or indicate out-of-gamut LCH colors.

**Parameters:**  
- **L\*** – Lightness (same as in Lab or Luv base). [0–100]. *Effect:* Controls perceived light/dark. At L*=50 in LCH(ab), you have mid-lightness colors; raise to L*=80 and you approach pastel/near-white if chroma is moderate; lower to 20 you get deep dark colors. Holding C* and h constant and changing L will create a tint or shade of that chroma/hue (becoming more pastel as L increases toward 100, or more “rich dark” as L decreases toward 0).  
- **C\*** – Chroma (0 to theoretically high values). *Effect:* Controls colorfulness/saturation. C*=0 means the color is gray (no hue, just a shade of gray at that L). Increasing C* makes the color more vivid. For instance, L=70, h=0 (red hue), C=0 is a neutral light gray, C=50 might be a pinkish red, C=100 a very strong red (if within gamut). Different hues have different maximum C achievable for real colors (e.g., around h=120° green, very high chroma is possible for surface colors, whereas in blue (~270°) the max chroma is lower due to human vision and gamut limits ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=CIELAB%20and%20CIELUV%20are%20soon,required%20and%20overall%20algorithmic%20complexity))). In usage, adjusting C* lets you fine-tune saturation while preserving hue and lightness – helpful for accessibility (e.g. ensuring enough chroma contrast).  
- **h°** – Hue angle (0–360°). *Effect:* Determines the hue family. It behaves like the hue in HSL but mapped onto Lab’s color wheel. For LCH(ab): 0° = red, 90° = yellow, 180° = green, 270° = blue (and intermediate angles for intermediate colors, e.g., 210° might be cyan). Rotating h changes the perceived hue continuously. Because Lab’s gamut is more uniform, a 90° change (say from 0 to 90) from red to yellow is a fairly uniform big change in hue, similarly 90 to 180 (yellow to green) and so on. However, note that at low chroma (C* near 0), h becomes meaningless (just like hue in HSV is undefined for gray). Changing h while keeping L and C fixed will shift the color around the color wheel at that brightness and saturation.  

One must specify whether using LCH_ab or LCH_uv, but generally in design contexts LCH_ab is meant. LCH_ab and LCH_uv have slightly different numeric values for the same color but conceptually similar parameters.

**Direct Conversion Paths:** **LCH ↔ Lab (or Luv)**: Direct and lossless by polar->cartesian conversion ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=LCh%3A%20uniform%20color%20space)). Given (L,C,h), convert to (L, a, b) by a* = C * cos(h), b* = C * sin(h) ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=For%20uniform%20color%20spaces%20that,h)). And similarly from Lab to LCH by computing C and h as above. **LCH ↔ RGB**: This goes through Lab and XYZ (LCH→Lab→XYZ→RGB). There’s no single-step formula linking LCH directly to device RGB. **LCH ↔ HSL/HSV**: Also not direct; they’re fundamentally different (one perceptual, one device-dependent). Typically one would convert HSL to RGB to Lab to LCH if needed. So the key “direct” nature is that LCH is just Lab in different coordinates, so it directly interconverts with Lab (or Luv).

**References:** The idea of LCH is mentioned in CIE documentation as simply the cylindrical version of 1976 spaces ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=LCh%3A%20uniform%20color%20space)). The Wikipedia snippet explains that “CIELCh_ab and CIELCh_uv are cylindrical transformations of CIELAB and CIELUV” ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=For%20uniform%20color%20spaces%20that,h)). In standards, you might see “CIE L* C* h°” notation in specifications for color tolerances, etc., as it’s convenient to describe a color’s hue and chroma. The W3C CSS Color 4 draft explicitly includes Lab and LCH with examples, citing that they are device-independent and using D65 as white by default ([hsl() - CSS: Cascading Style Sheets - MDN Web Docs - Mozilla](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl#:~:text=The%20hsl,hue%2C%20saturation%2C%20and%20lightness%20components)). Ongoing work by the color science community like **Oklch** (see below) also mirrors this cylindrical approach. For practical guidance, articles like *“A Guide To Modern CSS Colors With RGB, HSL, HWB, Lab and LCH”* ([A Guide To Modern CSS Colors With RGB, HSL, HWB, LAB And LCH](https://www.smashingmagazine.com/2021/11/guide-modern-css-colors/#:~:text=A%20Guide%20To%20Modern%20CSS,in%20software%20like%20Photoshop)) show how LCH is used to get consistent lightness adjustments. Academic references for using LCH include studies on color harmony and palettes (since working in LCH can produce smoother gradients). Also, as mentioned, an implementation called HSLuv (formerly HSLuv = HSL in Luv space) uses LCH_uv to create a uniform HSL-like interface, referencing its math on its site ([List of color spaces and their uses - Wikipedia](https://en.wikipedia.org/wiki/List_of_color_spaces_and_their_uses#:~:text=)). 

---
