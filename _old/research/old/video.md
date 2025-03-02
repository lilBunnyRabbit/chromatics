# Video and Broadcast Standards Models

Also includes: BT.2020 / REC.2020, BT.709 / REC.709, DCI P3 and Display P3

##  xvYCC

| Parameter | Name        | Range        | Description                                      |
| --------- | ----------- | ------------ | ------------------------------------------------ |
| `Y`       | Luminance   | 0-255        | Represents the brightness of the color.          |
| `C1`      | Chrominance | -128 to +127 | Color information, representing blue projection. |
| `C2`      | Chrominance | -128 to +127 | Color information, representing red projection.  |

| Manipulation                | Description                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Dynamic Range Expansion** | xvYCC allows for a wider color space than YCbCr, enabling more vibrant colors suitable for HDR content. |

- https://en.wikipedia.org/wiki/XvYCC

##  [YCbCr](./YCbCr255.ts)

| Parameter | Name        | Range  | Description                                                  |
| --------- | ----------- | ------ | ------------------------------------------------------------ |
| `Y`       | Luminance   | Varies | Represents the brightness of the color.                      |
| `Cb`      | Chroma Blue | Varies | Difference between the blue component and a reference value. |
| `Cr`      | Chroma Red  | Varies | Difference between the red component and a reference value.  |

| Manipulation                       | Description                                                                                                                                                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Color Correction**               | Adjusting `Cb` and `Cr` for color balance and correction.                                                                                                                                                                                                         |
| **Brightness Control**             | Modifying `Y` to adjust the luminance of the image.                                                                                                                                                                                                               |
| **Color Keying and Video Effects** | These color models separate luminance from chrominance, making them useful for video processing tasks like color keying (e.g., green screen effects), noise reduction, and color grading in video, where maintaining brightness while adjusting color is crucial. |

Used in video compression and broadcasting. It separates image luminance from color information, which is useful for television standards and video compression algorithms.

- https://en.wikipedia.org/wiki/YCbCr
- https://www.microsemi.com/document-portal/doc_view/135317-ug0639-color-space-conversion-user-guide#:~:text=After%20scaling%2C%20the%20RGB%20to,%3D%20298.082*Y%2F256%20%2D
- https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdprfx/2e1618ed-60d6-4a64-aa5d-0608884861bb
- https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-rdprfx/b550d1b5-f7d9-4a0c-9141-b3dca9d7f525

##  YPbPr

| Parameter | Name            | Range  | Description                                                   |
| --------- | --------------- | ------ | ------------------------------------------------------------- |
| `Y`       | Luminance       | Varies | Represents the brightness of the color.                       |
| `Pb`      | Blue-difference | Varies | Represents the difference between the blue component and `Y`. |
| `Pr`      | Red-difference  | Varies | Represents the difference between the red component and `Y`.  |

| Manipulation             | Description                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Component Adjustment** | Adjusting `Pb` and `Pr` for color correction specific to component video signals. |

- https://en.wikipedia.org/wiki/YPbPr

##  YUV

| Parameter | Name        | Range  | Description                             |
| --------- | ----------- | ------ | --------------------------------------- |
| `Y`       | Luminance   | Varies | Represents the brightness of the color. |
| `U`       | Chrominance | Varies | Chrominance component related to blue.  |
| `V`       | Chrominance | Varies | Chrominance component related to red.   |

| Manipulation               | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| **Color Space Conversion** | Often converted to and from RGB for processing and display. |

Similar to YCbCr, it's used in video systems to separate the luminance from the chrominance components. YUV is commonly used in European color television broadcasting.

- https://www.blackice.com/colorspaceYUV.htm

## ICtCp

| Parameter | Name              | Range  | Description                                                   |
| --------- | ----------------- | ------ | ------------------------------------------------------------- |
| `I`       | Intensity         | Varies | Represents the intensity of the image.                        |
| `Ct`      | Chroma tritanopia | Varies | Chroma component optimized for red-green color differences.   |
| `Cp`      | Chroma protanopia | Varies | Chroma component optimized for blue-yellow color differences. |

| Manipulation               | Description                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **HDR and WCG Processing** | Designed for high dynamic range and wide color gamut content, enabling precise color and luminance adjustments. |

ICtCp is a color space designed for high dynamic range and wide color gamut imagery.

- https://en.wikipedia.org/wiki/ICtCp
- https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-i-ct-cp/

##  YIQ

| Parameter | Name       | Range  | Description                                    |
| --------- | ---------- | ------ | ---------------------------------------------- |
| `Y`       | Luminance  | Varies | Represents the brightness of the color.        |
| `I`       | In-phase   | Varies | Chrominance component related to orange-cyan.  |
| `Q`       | Quadrature | Varies | Chrominance component related to purple-green. |

| Manipulation            | Description                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Analog Broadcasting** | Primarily used in the NTSC color TV broadcasting system for separating color information. |

- https://en.wikipedia.org/wiki/YIQ
- https://www.blackice.com/colorspaceYIQ.htm

## sYCC