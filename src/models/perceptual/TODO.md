# Device-Independent and Perceptual Models

## [CIE Lab](./Lab.ts)

| Parameter | Name        | Range        | Description                                                                                       |
| --------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `L`       | Lightness   | 0-100        | The lightness of the color, where 0 is black and 100 is white.                                    |
| `a`       | Green-Red   | -128 to +127 | The green-red axis, with negative values indicating green and positive values indicating red.     |
| `b`       | Blue-Yellow | -128 to +127 | The blue-yellow axis, with negative values indicating blue and positive values indicating yellow. |

| Manipulation                    | Description                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Color Adjustment**            | Altering `a` and `b` values to shift the color balance.                                                                                                                                                                                                                                                       |
| **Lightness Scaling**           | Adjusting `L` to make the color lighter or darker.                                                                                                                                                                                                                                                            |
| **Perceptual Color Correction** | Manipulating the L* component allows for brightness adjustments, while a* and b* components control the color axes, offering a way to adjust colors based on human vision's perceptual uniformity. This makes Lab excellent for color correction that aims to maintain or adjust perceived color differences. |
| **Color Grading**               | Given its perceptual uniformity, Lab is ideal for sophisticated color grading, where subtle shifts in color and lightness are required.                                                                                                                                                                       |

LAB is a color model intended to be perceptually uniform. Its cylindrical representation is LCHab.
LAB and LCHab models each have multiple color spaces that are defined relative to a white point. The default white point is D65.

Due to its ability to model all visible colors and its perceptual uniformity (where a given numerical change corresponds to a similar visual change in color), Lab is excellent for color correction and manipulation tasks. It's especially useful in scenarios where maintaining color fidelity across different devices is critical.

-  https://en.wikipedia.org/wiki/CIELAB_color_space
-  https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-a-b/
-  https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-a-b-color-spaces/
-  https://www.easyrgb.com/en/math.php#text2


## LCHab

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

LAB is a color model intended to be perceptually uniform. Its cylindrical representation is LCHab.
LAB and LCHab models each have multiple color spaces that are defined relative to a white point. The default white point is D65.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-hab-color-spaces/

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

## LUV

| Parameter | Name      | Range    | Description                             |
| --------- | --------- | -------- | --------------------------------------- |
| `L`       | Lightness | 0-100    | The lightness of the color.             |
| `u`       | u* Axis   | -∞ to +∞ | Position between red/magenta and green. |
| `v`       | v* Axis   | -∞ to +∞ | Position between yellow and blue.       |

| Manipulation              | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| **Chroma Enhancement**    | Adjusting `u` and `v` to change the color saturation. |
| **Brightness Adjustment** | Modifying `L` to alter lightness.                     |

LUV is a color model intended to be perceptually uniform. Its cylindrical representation is LCHuv.
LUV and LCHuv models each have multiple color spaces that are defined relative to a white point. The default white point is D65.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-u-v/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-u-v-color-spaces/

## LCHuv

| Parameter | Name      | Range | Description                                  |
| --------- | --------- | ----- | -------------------------------------------- |
| `L`       | Lightness | 0-100 | The lightness of the color.                  |
| `C`       | Chroma    | 0-∞   | The colorfulness relative to the brightness. |
| `H`       | Hue Angle | 0-360 | The angle of the hue in the color wheel.     |

| Manipulation             | Description                                     |
| ------------------------ | ----------------------------------------------- |
| **Hue Adjustment**       | Rotating `H` to change the color's hue.         |
| **Saturation Scaling**   | Adjusting `C` to modify the color's saturation. |
| **Lightness Modulation** | Modifying `L` to adjust the brightness level.   |

LUV is a color model intended to be perceptually uniform. Its cylindrical representation is LCHuv.
LUV and LCHuv models each have multiple color spaces that are defined relative to a white point. The default white point is D65.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv/
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv-color-spaces/

## [CIE XYZ](./XYZ.ts)

| Parameter | Name        | Range | Description                                                            |
| --------- | ----------- | ----- | ---------------------------------------------------------------------- |
| `X`       | X Component | 0-∞   | A mix of response curves from cones that correlates to color matching. |
| `Y`       | Y Component | 0-∞   | The luminance component, which correlates to brightness.               |
| `Z`       | Z Component | 0-∞   | Somewhat equal to blue, or the S cone response from the human eye.     |

| Manipulation          | Description                                                                         |
| --------------------- | ----------------------------------------------------------------------------------- |
| **Color Matching**    | Adjusting `X`, `Y`, `Z` to match colors under different lighting.                   |
| **Luminance Control** | Modifying `Y` to change brightness while keeping color hue and saturation constant. |

The XYZ color model is common used as a profile connection space when converting between other models.
The XYZ model has multiple color spaces that are defined relative to a white point. The default white point is D65.

The first mathematically defined color space that includes all perceivable colors. It's the basis for many other color spaces. While you mentioned XYZ, delving deeper into its applications or implementing variations for different illuminants could be beneficial.

Serving as a foundation for many other color spaces, understanding and possibly converting colors to and from XYZ can be useful for achieving precise color matching and for scientific applications of color.

- https://en.wikipedia.org/wiki/CIE_1931_color_space
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-x-y-z-color-spaces/
- https://www.easyrgb.com/en/math.php#text2

## Oklab
Oklab is a perceptual color space for image processing. Its cylindrical representation is Oklch.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklab/

## Oklch
Oklab is a perceptual color space for image processing. Its cylindrical representation is Oklch.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-oklch/

## JzAzBz
JzAzBz is a perceptually uniform space where euclidean distance predicts perceptual difference.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-az-bz/

## JzCzHz
JzCzHz is its cylindrical representation of JzAzBz.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-cz-hz/

## CIECAM02

## CAM16

## Osa-UCS (Optical Society of America Uniform Color Scale)