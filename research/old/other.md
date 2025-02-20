# Other Models

## ANSI (16 and 256)
(refers to color codes used in terminal emulators)

Based on the VGA color palette, there are models for 4-bit, 16 color codes and 8-bit, 256 color codes

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi256/

##  GL
(not a standard color space, might refer to OpenGL colors)
Not a standard color model with defined parameters. Might refer to color usage in OpenGL or other graphics libraries, where colors are typically defined in RGB or RGBA formats.

##  TSL
(Tint, Saturation, Lightness - less common)

| Parameter | Name       | Range | Description                |
| --------- | ---------- | ----- | -------------------------- |
| `t`       | Tint       | 0-360 | Hue or color tint.         |
| `s`       | Saturation | 0-1   | Color intensity or purity. |
| `l`       | Lightness  | 0-1   | Brightness of the color.   |

| Manipulation              | Description                                         |
| ------------------------- | --------------------------------------------------- |
| **Color Adjustment**      | Modifying `t` to change the color hue.              |
| **Saturation Control**    | Increasing or decreasing `s` to alter color purity. |
| **Brightness Modulation** | Adjusting `l` to make colors lighter or darker.     |


- https://en.wikipedia.org/wiki/TSL_color_space

## ISO-CIE Color Encodings
Specifically for industrial color measurement and production.
Refers to various color encodings under the International Organization for Standardization (ISO) and the International Commission on Illumination (CIE), such as CIE XYZ, CIE Lab, etc.

## SCOTDIC 
SCOTDIC is a color system used in the textile industry, particularly for dyeing and color matching.

## Coloroid 
The Coloroid system is designed to cover aspects of color vision and aesthetics, including hue, saturation, and brightness, but tailored for architectural use.