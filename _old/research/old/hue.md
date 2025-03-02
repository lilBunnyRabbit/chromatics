# Hue Models

## [HSI](./HSI.ts)

| Parameter | Name       | Range | Description                             |
| --------- | ---------- | ----- | --------------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel             |
| `s`       | Saturation | 0-1   | Colorfulness relative to its brightness |
| `i`       | Intensity  | 0-1   | Brightness level of the color           |

| Manipulation              | Description                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brightness Adjustment** | Altering the Intensity value affects the overall brightness of the color.                                                                                    |
| **Saturation Boost**      | Increasing Saturation makes colors more vivid, whereas decreasing it fades the color.                                                                        |
| **Color Shifting**        | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

Similar to HSL and HSV, HSI is another cylindrical-coordinate representation of points in an RGB color model. It's often used in computer vision and image processing applications.

This model is useful for applications that need intuitive color adjustments, as it separates the color (hue) from the grayscale information (intensity), making it easier to adjust colors without affecting the brightness.

- https://www.imageeprocessing.com/2013/05/converting-rgb-image-to-hsi.html
- https://www.had2know.org/technology/hsi-rgb-color-converter-equations.html
- https://en.wikipedia.org/wiki/HSL_and_HSV

## [HSL](./HSL.ts)

| Parameter | Name       | Range | Description                                   |
| --------- | ---------- | ----- | --------------------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel                   |
| `s`       | Saturation | 0-1   | Colorfulness relative to its lightness        |
| `l`       | Lightness  | 0-1   | Amount of light emitted or reflected by color |

| Manipulation              | Description                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lightness Control**     | Adjusting Lightness can make the color lighter or darker.                                                                                                    |
| **Saturation Adjustment** | Modifying Saturation changes the intensity of the color without affecting lightness.                                                                         |
| **Color Shifting**        | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

A cylindrical representation of sRGB using Hue, Saturation, and Lightness.

Both are intuitive for human understanding and manipulation of color, making them suitable for user interfaces that allow users to adjust colors based on hue, saturation, and brightness/lightness.

- https://en.wikipedia.org/wiki/HSL_and_HSV
- https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
- https://en.wikipedia.org/wiki/HSL_and_HSV#Color_conversion_formulae
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-l/

## [HSV](./HSV.ts)

| Parameter | Name       | Range | Description                        |
| --------- | ---------- | ----- | ---------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel        |
| `s`       | Saturation | 0-1   | Colorfulness relative to its value |
| `v`       | Value      | 0-1   | Brightness of the color            |

| Manipulation              | Description                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brightness Adjustment** | Changing the Value influences the brightness, making colors brighter or darker.                                                                              |
| **Color Saturation**      | Adjusting Saturation controls the depth of the color, from vibrant to gray.                                                                                  |
| **Color Shifting**        | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

A cylindrical representation of sRGB using Hue, Saturation, and Value / brightness.

Both are intuitive for human understanding and manipulation of color, making them suitable for user interfaces that allow users to adjust colors based on hue, saturation, and brightness/lightness.

- https://en.wikipedia.org/wiki/HSL_and_HSV
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-v/

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


## HSLuv

| Parameter | Name       | Range | Description                                          |
| --------- | ---------- | ----- | ---------------------------------------------------- |
| `h`       | Hue        | 0-360 | Position on the color wheel                          |
| `s`       | Saturation | 0-100 | Perceptually uniform colorfulness in Luv color space |
| `l`       | Lightness  | 0-100 | Perceptually uniform lightness in Luv color space    |

| Manipulation               | Description                                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Perceptual Lightness**   | Adjusting Lightness in HSLuv aims for perceptual uniformity across hues.                                                                                     |
| **Saturation Consistency** | Saturation adjustments are made to preserve the perceived colorfulness uniformly.                                                                            |
| **Color Shifting**         | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

HSLuv and HPLuv are color spaces designed as a human friendly alternative to HSL.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-s-luv/

## HPLuv

| Parameter | Name      | Range | Description                                       |
| --------- | --------- | ----- | ------------------------------------------------- |
| `h`       | Hue       | 0-360 | Position on the color wheel                       |
| `p`       | Pastel    | 0-100 | Saturation reduced to pastel range in Luv space   |
| `l`       | Lightness | 0-100 | Perceptually uniform lightness in Luv color space |

| Manipulation          | Description                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pastel Effect**     | Adjusting the Pastel parameter softens the color to achieve pastel tones.                                                                                    |
| **Uniform Lightness** | Lightness control in HPLuv also focuses on maintaining perceptual uniformity.                                                                                |
| **Color Shifting**    | By adjusting the Hue component, you can shift all colors in an image around the color wheel, which is useful for creating different color themes or effects. |

HSLuv and HPLuv are color spaces designed as a human friendly alternative to HSL.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-h-p-luv/
