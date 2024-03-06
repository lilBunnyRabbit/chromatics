# Print and Color Difference Models

## CMY

| Parameter | Name    | Range | Description            |
| --------- | ------- | ----- | ---------------------- |
| `c`       | Cyan    | 0-100 | Cyan ink percentage    |
| `m`       | Magenta | 0-100 | Magenta ink percentage |
| `y`       | Yellow  | 0-100 | Yellow ink percentage  |

| Manipulation         | Description                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Color Mixing**     | Combining varying percentages of cyan, magenta, and yellow to produce a wide range of colors. |
| **Inversion to RGB** | Converting CMY values back to RGB by inverting each percentage.                               |

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

##  HunterLAB

| Parameter | Name        | Range  | Description                       |
| --------- | ----------- | ------ | --------------------------------- |
| `L`       | Lightness   | 0-100  | Reflectance or lightness of color |
| `a`       | Red/Green   | Varies | Red vs. green coordinate          |
| `b`       | Yellow/Blue | Varies | Yellow vs. blue coordinate        |

| Manipulation           | Description                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **Color Correction**   | Adjusting `a` and `b` to correct or alter color balance towards or away from green, red, blue, or yellow. |
| **Brightness Control** | Modifying `L` to make the color appear lighter or darker.                                                 |

- https://en.wikipedia.org/wiki/Hunter_Lab

##  ICC-based color profiles

| Parameter | Name       | Range | Description                              |
| --------- | ---------- | ----- | ---------------------------------------- |
| `profile` | Profile ID | N/A   | Identifier for a specific color profile. |

| Manipulation         | Description                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Color Management** | Applying ICC profiles to ensure consistent color appearance across different devices and media. |

(refers to color profiles rather than a color space)

Implementing support for ICC profiles allows for accurate color management across different devices by using standardized profiles to describe the color attributes of various devices.

## Munsell Color System

| Parameter | Name   | Range | Description            |
| --------- | ------ | ----- | ---------------------- |
| `H`       | Hue    | 0-100 | Color attribute        |
| `V`       | Value  | 0-10  | Lightness of the color |
| `C`       | Chroma | 0-∞   | Intensity of the color |

| Manipulation       | Description                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Color Matching** | Using Munsell's standardized color notations to accurately match and communicate colors. |

## NCS (Natural Color System)

| Parameter | Name       | Range | Description                                    |
| --------- | ---------- | ----- | ---------------------------------------------- |
| `H`       | Hue        | N/A   | Perceived color attribute (e.g., red, yellow). |
| `S`       | Saturation | N/A   | Colorfulness of the hue.                       |
| `L`       | Lightness  | N/A   | Perceived brightness of the color.             |

| Manipulation            | Description                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------- |
| **Color Specification** | Defining colors based on human perception for accurate color communication and design. |

## RAL Color Space

| Parameter | Name     | Range | Description                |
| --------- | -------- | ----- | -------------------------- |
| `RAL`     | RAL Code | N/A   | Identifier for RAL colors. |

| Manipulation        | Description                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Color Selection** | Choosing specific RAL colors for applications in painting, coatings, and plastics for consistent color usage. |