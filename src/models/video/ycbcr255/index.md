#### **YCbCr**

- **Name:** YCbCr  
- **Description:** A widely used color model in digital video that separates the luminance (Y) from the chrominance (Cb and Cr) components, facilitating efficient compression and transmission.  
- **Parameters:**

  | Parameter | Description                 | Range  | Effect                                             |
  | --------- | --------------------------- | ------ | -------------------------------------------------- |
  | `Y`       | Luminance component         | Varies | Modifying `Y` affects image brightness.            |
  | `Cb`      | Blue-difference chrominance | Varies | Adjusting `Cb` modifies the blue color difference. |
  | `Cr`      | Red-difference chrominance  | Varies | Adjusting `Cr` modifies the red color difference.  |
  | `alpha`   | Opacity                     | 0–1    | Controls transparency.                             |

- **Typed Array:** Float32Array (Provides flexibility for various scaling conventions)  
- **Usage:** Essential for digital video compression, broadcasting, and camera imaging systems.  
- **Modifications:**  
  • **Chroma Correction:** Tweak `Cb` and `Cr` to balance colors while using `Y` for brightness control.  
- **CSS / String Representations:**  
  • String: Generally converted to RGB for display purposes.  
- **Direct Conversion Targets:**  
  - To/from RGB, YPbPr, and component video formats.  
- **References:**  
  - [Wikipedia: YCbCr](https://en.wikipedia.org/wiki/YCbCr)

---

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
