# RGB Models

## [RGB](./RGB255.ts)

| Parameter | Name  | Range | Description         |
| --------- | ----- | ----- | ------------------- |
| `r`       | Red   | 0-255 | Red color channel   |
| `g`       | Green | 0-255 | Green color channel |
| `b`       | Blue  | 0-255 | Blue color channel  |

| Manipulation              | Description                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contrast Adjustment**   | By scaling the differences between the RGB values and a midpoint, you can adjust the contrast of an image.                                          |
| **Color Inversion**       | Inverting colors can be easily done by subtracting each channel value from the maximum possible value (e.g., 255 - R, 255 - G, 255 - B).            |
| **Brightness Adjustment** | Adjusting the brightness involves increasing or decreasing all three RGB values equally.                                                            |
| **Color Tinting**         | Adding a specific amount to one or two of the RGB channels can tint the image towards a certain color.                                              |
| **Grayscale Conversion**  | Converting an image to grayscale can be done by setting all three channels to the same value, often the average of the original RGB values.         |
| **Saturation Adjustment** | Increasing saturation involves amplifying the difference from each RGB channel to the grayscale level, while decreasing it reduces this difference. |
| **Color Balancing**       | Adjusting the intensity of the individual red, green, and blue channels to correct or change color casts.                                           |

The RGB model is fundamental for any digital color manipulation, as it directly corresponds to the way colors are displayed on screens. sRGB is a specific RGB color space that defines a specific set of colors to be consistent across different devices, making it essential for web development and applications intended for consumer displays.

- https://en.wikipedia.org/wiki/RGB_color_spaces
- https://en.wikipedia.org/wiki/RGB_color_model

## [Normalized RGB](./RGB.ts)

| Parameter | Name  | Range | Description                    |
| --------- | ----- | ----- | ------------------------------ |
| `r`       | Red   | 0-1   | Normalized red color channel   |
| `g`       | Green | 0-1   | Normalized green color channel |
| `b`       | Blue  | 0-1   | Normalized blue color channel  |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b/

## sRGB

| Parameter | Name  | Range | Description                                       |
| --------- | ----- | ----- | ------------------------------------------------- |
| `r`       | Red   | 0-255 | Standard RGB red color channel, gamma-corrected   |
| `g`       | Green | 0-255 | Standard RGB green color channel, gamma-corrected |
| `b`       | Blue  | 0-255 | Standard RGB blue color channel, gamma-corrected  |

| Manipulation         | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| **Gamma Correction** | Adjusting the gamma to modify the luminance or brightness of the image.        |
| **Color Correction** | Applying color profiles for consistent color display across different devices. |

A standard RGB color space created cooperatively by HP and Microsoft for use on monitors, printers, and the Internet. It's a specific implementation of RGB designed to match typical home and office viewing conditions.

- https://en.wikipedia.org/wiki/SRGB
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-s-r-g-b.html

## Linear sRGB

| Parameter | Name  | Range | Description                                 |
| --------- | ----- | ----- | ------------------------------------------- |
| `r`       | Red   | 0-1   | Linear space red without gamma correction   |
| `g`       | Green | 0-1   | Linear space green without gamma correction |
| `b`       | Blue  | 0-1   | Linear space blue without gamma correction  |

| Manipulation                   | Description                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| **Linear Contrast Adjustment** | Direct contrast adjustments in the linear space before applying gamma correction for display. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-linear-s-r-g-b.html

## ACES (Academy Color Encoding System)

| Parameter | Name  | Range | Description              |
| --------- | ----- | ----- | ------------------------ |
| `r`       | Red   | 0-1   | ACES red color channel   |
| `g`       | Green | 0-1   | ACES green color channel |
| `b`       | Blue  | 0-1   | ACES blue color channel  |

| Manipulation               | Description                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Wide Gamut Adjustments** | Adjusting colors within a wider color gamut for high-fidelity color grading in film and video production. |

A color space and set of related workflows for cinema and visual effects industries, developed by the Academy of Motion Picture Arts and Sciences. It's designed to facilitate color interchange and digital image preservation.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-s.html

## ACEScc

| Parameter | Name  | Range | Description                                      |
| --------- | ----- | ----- | ------------------------------------------------ |
| `r`       | Red   | 0-1   | ACEScc red color channel, logarithmic encoding   |
| `g`       | Green | 0-1   | ACEScc green color channel, logarithmic encoding |
| `b`       | Blue  | 0-1   | ACEScc blue color channel, logarithmic encoding  |

| Manipulation            | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Logarithmic Grading** | Applying color grading in a logarithmic curve to offer fine control over midtones. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scc.html

## ACEScct

| Parameter | Name  | Range | Description                                                   |
| --------- | ----- | ----- | ------------------------------------------------------------- |
| `r`       | Red   | 0-1   | ACEScct red color channel, similar to ACEScc but with a toe   |
| `g`       | Green | 0-1   | ACEScct green color channel, similar to ACEScc but with a toe |
| `b`       | Blue  | 0-1   | ACEScct blue color channel, similar to ACEScc but with a toe  |

| Manipulation            | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Logarithmic Grading** | Applying color grading in a logarithmic curve to offer fine control over midtones. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scct.html

## ACEScg

| Parameter | Name  | Range | Description                                                     |
| --------- | ----- | ----- | --------------------------------------------------------------- |
| `r`       | Red   | 0-1   | ACEScg red color channel, designed for CGI and visual effects   |
| `g`       | Green | 0-1   | ACEScg green color channel, designed for CGI and visual effects |
| `b`       | Blue  | 0-1   | ACEScg blue color channel, designed for CGI and visual effects  |

| Manipulation            | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Logarithmic Grading** | Applying color grading in a logarithmic curve to offer fine control over midtones. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-a-c-e-scg.html

## Adobe RGB

| Parameter | Name  | Range | Description                                |
| --------- | ----- | ----- | ------------------------------------------ |
| `r`       | Red   | 0-255 | Adobe RGB red color channel, wider gamut   |
| `g`       | Green | 0-255 | Adobe RGB green color channel, wider gamut |
| `b`       | Blue  | 0-255 | Adobe RGB blue color channel, wider gamut  |

| Manipulation         | Description                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Gamut Adjustment** | Adjusting colors within the Adobe RGB gamut, suitable for printing and digital art requiring a wide color gamut. |

A color space developed by Adobe Systems, Inc. that provides a wider gamut of colors than sRGB, making it suitable for high-quality print graphics.

For applications that involve high-quality print graphics or need a wider color gamut than sRGB, Adobe RGB can be beneficial. It's particularly useful for projects that will be printed on high-quality printers or need to match colors across different media types.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-adobe-r-g-b.html

## BT.2020 / REC.2020

| Parameter | Name  | Range | Description                                               |
| --------- | ----- | ----- | --------------------------------------------------------- |
| `r`       | Red   | 0-1   | BT.2020 red color channel, wider color gamut for UHD TV   |
| `g`       | Green | 0-1   | BT.2020 green color channel, wider color gamut for UHD TV |
| `b`       | Blue  | 0-1   | BT.2020 blue color channel, wider color gamut for UHD TV  |
 
| Manipulation          | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| **HDR Color Grading** | Adjusting colors and brightness for High Dynamic Range content. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-b-t2020.html

## BT.709 / REC.709

| Parameter | Name  | Range | Description                                   |
| --------- | ----- | ----- | --------------------------------------------- |
| `r`       | Red   | 0-255 | BT.709 red color channel, standard for HDTV   |
| `g`       | Green | 0-255 | BT.709 green color channel, standard for HDTV |
| `b`       | Blue  | 0-255 | BT.709 blue color channel, standard for HDTV  |

| Manipulation                      | Description                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **Broadcast Standard Correction** | Adjusting colors to comply with standard HDTV broadcast color specifications. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-b-t709.html

## DCI P3

| Parameter | Name  | Range | Description                                        |
| --------- | ----- | ----- | -------------------------------------------------- |
| `r`       | Red   | 0-255 | DCI P3 red color channel, used in digital cinema   |
| `g`       | Green | 0-255 | DCI P3 green color channel, used in digital cinema |
| `b`       | Blue  | 0-255 | DCI P3 blue color channel, used in digital cinema  |

| Manipulation                      | Description                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Cinema Color Grading**          | Adjusting colors for digital cinema within the DCI P3 color space.                             |
| **Wide Gamut Display Adjustment** | Tailoring colors for displays supporting the P3 color space, offering a wider gamut than sRGB. |

A color space created by Digital Cinema Initiatives that offers a wider gamut than sRGB, used in digital cinema and has been adopted for use in high-end mobile devices, laptops, and monitors.

For applications targeting Apple devices or modern displays that support a wider color gamut, implementing P3 can enhance the visual experience by making use of a broader range of colors.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-d-c-i_-p3.html

## Display P3

| Parameter | Name  | Range | Description                                                                |
| --------- | ----- | ----- | -------------------------------------------------------------------------- |
| `r`       | Red   | 0-255 | Display P3 red color channel, similar to DCI P3 but for personal devices   |
| `g`       | Green | 0-255 | Display P3 green color channel, similar to DCI P3 but for personal devices |
| `b`       | Blue  | 0-255 | Display P3 blue color channel, similar to DCI P3 but for personal devices  |

| Manipulation                      | Description                                                                                    |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Cinema Color Grading**          | Adjusting colors for digital cinema within the DCI P3 color space.                             |
| **Wide Gamut Display Adjustment** | Tailoring colors for displays supporting the P3 color space, offering a wider gamut than sRGB. |

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-display-p3.html

## ROMM RGB / ProPhoto RGB

| Parameter | Name  | Range | Description                                       |
| --------- | ----- | ----- | ------------------------------------------------- |
| `r`       | Red   | 0-255 | ProPhoto RGB red color channel, very wide gamut   |
| `g`       | Green | 0-255 | ProPhoto RGB green color channel, very wide gamut |
| `b`       | Blue  | 0-255 | ProPhoto RGB blue color channel, very wide gamut  |

| Manipulation                    | Description                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **High Fidelity Color Editing** | Adjusting colors in a space designed for professional photography with an extremely wide gamut. |


Also known as ROMM RGB, it's a color space developed by Kodak. It offers an even larger gamut than Adobe RGB, designed for advanced image editing and storage.

For high-end image editing, especially in professional photography where preserving as much color information as possible is crucial, ProPhoto RGB's wide gamut is invaluable. It's suited for editing RAW images from cameras before converting them to a more standard color space for distribution.

- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-r-g-b-color-spaces/-r-o-m-m_-r-g-b.html

