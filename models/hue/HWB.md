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

## [HWB](./HWB.ts)

| Parameter | Name      | Range | Description                        |
| --------- | --------- | ----- | ---------------------------------- |
| `h`       | Hue       | 0-360 | Position on the color wheel        |
| `w`       | Whiteness | 0-1   | Amount of white mixed in the color |
| `b`       | Blackness | 0-1   | Amount of black mixed in the color |

| Manipulation           | Description                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tint and Shade**     | Whiteness adds tint (lighter), whereas Blackness adds shade (darker) to the color.                                                                           |
| **Neutral Adjustment** | Balancing Whiteness and Blackness can neutralize the color towards a more gray scale.                                                                        |
| **Color Shifting**     | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

A cylindrical representation of sRGB using Hue, Whiteness, and Blackness.

- https://dirask.com/snippets/JavaScript-convert-RGB-to-HWB-color-model-1XB6rp
- https://en.wikipedia.org/wiki/HWB_color_model
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-w-b/
- https://en.wikipedia.org/wiki/HSL_and_HSV
- http://alvyray.com/Papers/CG/hwb2rgb.htm

## HWB (Hue, Whiteness, Blackness) Color Model  
**Refined Description:** HWB stands for **Hue-Whiteness-Blackness**, a cylindrical color model introduced as an alternative to HSL/HSV to provide a more intuitive way to blend a hue with white or black ([Day 30: the hwb() color function - Manuel Matuzovic](https://www.matuzo.at/blog/2022/100daysof-day30#:~:text=HWB%2C%20which%20stands%20for%20hue,mix%20into%20that%20base%20hue)). Formally proposed by Alvy Ray Smith in 1996 ([HWB-A more intuitive hue-based color model - ResearchGate](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model#:~:text=HWB,the%20context%20of%20computer%20graphics)), HWB retains the same **hue (H)** angle as HSV/HSL but replaces the saturation/value axes with **whiteness (W)** and **blackness (B)**. The idea is that a color can be described by taking a pure hue, mixing in some amount of white, and some amount of black. Whiteness is the fraction of white mixed in, and blackness is the fraction of black. If we consider an HSL double-cone, HWB coordinates are another way to navigate it: W corresponds to moving toward the white tip, B corresponds to moving toward the black tip. Mathematically, for an HWB color (H, W, B) with all components in [0,1], the color is defined as: start with a pure hue color at full saturation and brightness corresponding to H, then mix W fraction of white and B fraction of black (with the remainder (1–W–B) being “pure hue” portion) ([Day 30: the hwb() color function - Manuel Matuzovic](https://www.matuzo.at/blog/2022/100daysof-day30#:~:text=HWB%2C%20which%20stands%20for%20hue,mix%20into%20that%20base%20hue)). If W + B >= 1, the result is a shade of gray (since adding that much white and black essentially desaturates the hue completely). HWB differs from HSL/HSV in that it’s directly additive in terms of white and black mixing, which can be conceptually simpler for users (“add x% white, y% black to this hue”). The model is still ultimately another view of the RGB color solid (and conversions to/from RGB are well-defined), but is linear in the amount of white/black dilution.

**Usages:** HWB was proposed in the context of computer graphics as a more user-friendly model for color pickers ([HWB-A more intuitive hue-based color model - ResearchGate](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model#:~:text=ResearchGate%20www,the%20context%20of%20computer%20graphics)). It’s been adopted in the **CSS Color Level 4** specification as a new way to specify colors (`hwb(hue, whiteness%, blackness%)`) ([hwb() - CSS: Cascading Style Sheets - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb#:~:text=The%20hwb,its%20hue%2C%20whiteness%2C%20and%20blackness)). This is useful for designers because it parallels the way one might describe creating a paint: e.g., “take some red, add 10% white and 20% black”. It is beneficial when one wants to quickly generate tints or shades of a given hue without worrying about the exact brightness. For example, to get a pastel blue, one could pick hue≈240° (blue) and then a high whiteness percentage, moderate blackness. Or to get a dark olive, pick hue≈60° (yellowish) and add significant blackness. The strength of HWB is its intuitive approach: many find it more straightforward to think in terms of “make this color lighter by adding white” (increase W) or “darker by adding black” (increase B) rather than adjusting both saturation and lightness in HSL. HWB also has the nice property that the sum W+B can never exceed 1 for a real color (any excess is effectively clamped to gray), which ensures all HWB values map to a valid RGB color. It’s gaining traction with web developers as browsers start supporting the `hwb()` function. One limitation is that, like HSL/HSV, it’s not perceptually uniform – it’s mainly a convenience model. Also, it’s tied to an RGB space (usually sRGB in implementations), so it’s device-dependent.

**Parameters:**  
- **Hue (H)** – [0°–360°) The hue of the color, same as in HSL/HSV. *Effect:* Determines the base hue that will be tinted or shaded. H=0 and H=360 both denote red, 120 = green, 240 = blue, etc. If either W or B is 1 (maxed out), hue becomes irrelevant (fully white or black).  
- **Whiteness (W)** – [0–1 or 0–100%] Proportion of white mixing. *Description:* Fraction of the final color that is white. *Effect:* Higher W makes the color lighter/paler, adding white. W=1 yields pure white (regardless of hue or B). W=0 means no white added. For example, W=0.3 means 30% of the mixture is white, so the color is significantly lightened. Increasing W will always move the color toward white (pastel tones if some hue remains, eventually white if W+B →1).  
- **Blackness (B)** – [0–1 or 0–100%] Proportion of black mixing. *Description:* Fraction of the final color that is black. *Effect:* Higher B makes the color darker, adding black. B=1 yields pure black. B=0 means no black added. For instance, B=0.2 means 20% black is mixed in – the color is a darker shade of the hue. Increasing B drags the color toward black (lowering its brightness and saturation).  

The constraints: typically W + B ≤ 1 for a chromatic color (when W+B = 1, the remaining hue portion is 0, so the color is a shade of gray between white and black). If W+B is less than 1, the remainder (1 – W – B) is effectively the fraction of pure hue color. So a color in HWB can be thought of as: **Color = (1−W−B)*Hue_color + W*White + B*Black**. Adjusting W and B thus linearly interpolates with white and black respectively ([HWB - ColorAide Documentation](https://facelessuser.github.io/coloraide/colors/hwb/#:~:text=The%20mental%20model%20is%20that,Channel%20Aliases)).

**Direct Conversion Paths:** **HWB ↔ RGB** is directly computed by the above mixture logic: conversion algorithms exist to go from (H, W, B) to an RGB triple without intermediate spaces. For example, one can derive it by first computing the RGB of the given hue at full saturation (like an HSV color with V=1, S=1, that’s the “Hue_color”), then linearly interpolating toward white and black according to W and B ([Day 30: the hwb() color function - Manuel Matuzovic](https://www.matuzo.at/blog/2022/100daysof-day30#:~:text=HWB%2C%20which%20stands%20for%20hue,mix%20into%20that%20base%20hue)). The inverse (RGB to HWB) is also straightforward: compute the hue of the color, then the whiteness is min(R,G,B) (fraction of white relative to 1) and blackness is 1–max(R,G,B) (fraction of black) ([HWB-A more intuitive hue-based color model - ResearchGate](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model#:~:text=ResearchGate%20www,the%20context%20of%20computer%20graphics)). These formulas come from the fact that min(R,G,B) indicates how much white light is present equally in all components (common intensity that could be taken as “white” portion), and 1–max(R,G,B) indicates how far the color is from full brightness (how much black has been added). Because of this, **HWB ↔ HSV** conversion is also easy: H is the same, and W = (1 – S)*V in terms of HSV, B = 1 – V ([HWB-A more intuitive hue-based color model - ResearchGate](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model#:~:text=ResearchGate%20www,the%20context%20of%20computer%20graphics)). HWB does not directly convert to models like Lab or YUV except through RGB (like other RGB-derived models). It is effectively a reparameterization of HSL/HSV, so it slots into the same conversion graph near RGB.

**References:** HWB was described by Alvy Ray Smith and Eric Lyons in 1996 as an improvement over HSV for choosing colors intuitively ([HWB-A more intuitive hue-based color model - ResearchGate](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model#:~:text=ResearchGate%20www,the%20context%20of%20computer%20graphics)). The W3C CSS Color Module Level 4 includes a definition of HWB and cites Smith’s work ([CSS hwb() Function - Quackit](https://www.quackit.com/css/color/values/css_hwb_function.cfm#:~:text=blackness%20components%20of%20the%20color%2C,which%20stands%20for)). Developer resources like MDN provide usage examples for the `hwb()` function ([hwb() - CSS: Cascading Style Sheets - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb#:~:text=The%20hwb,its%20hue%2C%20whiteness%2C%20and%20blackness)). A detailed introduction titled “HWB – A more intuitive hue-based color model” was published (Smith & Lyons, 1996) explaining the rationale (the researchgate reference notes it was “reinvented” by Smith in that context) ([HWB-A more intuitive hue-based color model - ResearchGate](https://www.researchgate.net/publication/240035805_HWB-A_more_intuitive_hue-based_color_model#:~:text=HWB,the%20context%20of%20computer%20graphics)). Practical guides such as *Smashing Magazine* and *CSS Tricks* have started covering HWB for designers, showing how it complements HSL ([Day 30: the hwb() color function - Manuel Matuzovic](https://www.matuzo.at/blog/2022/100daysof-day30#:~:text=HWB%2C%20which%20stands%20for%20hue,mix%20into%20that%20base%20hue)). The conversion math is relatively simple; for instance, the ColourAide library documentation provides formulas for HWB↔RGB ([HWB - ColorAide Documentation](https://facelessuser.github.io/coloraide/colors/hwb/#:~:text=HWB%20,Channel%20Aliases)). In summary, HWB stands on the shoulders of HSV/HSL, adjusting the axes to align with an artist’s mixing paradigm (white/black paint), and references from W3C and Smith’s original work detail its implementation and benefits.

---
