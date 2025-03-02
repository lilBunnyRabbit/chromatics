#### **ACES**

- **Name:** ACES  
- **Description:** The Academy Color Encoding System is designed for high-fidelity color in cinema and visual effects, providing a wide color gamut and high dynamic range.  
- **Parameters:**

  | Parameter | Description                 | Range | Effect                                                    |
  | --------- | --------------------------- | ----- | --------------------------------------------------------- |
  | `r`       | Red channel (ACES encoding) | 0–1   | Increasing `r` intensifies the red in a wide gamut space. |
  | `g`       | Green channel               | 0–1   | Adjusting `g` changes the green intensity.                |
  | `b`       | Blue channel                | 0–1   | Adjusting `b` changes the blue intensity.                 |
  | `alpha`   | Opacity                     | 0–1   | Controls transparency.                                    |

- **Typed Array:** Float32Array (for handling high precision in wide gamut calculations)  
- **Usage:** Common in film production, high-end visual effects, and scenarios demanding a wide dynamic range.  
- **Modifications:**  
  • **Wide Gamut Adjustments:** Scale channels to work within the ACES gamut.  
- **CSS / String Representations:**  
  • String: Converted to sRGB or RGB255 for display on standard devices.  
- **Direct Conversion Targets:**  
  - ACEScc, ACEScct, ACEScg, and, via conversion chains, to RGB and perceptual models.  
- **References:**  
  - [ACES Overview](https://www.oscars.org/science-technology/aces)


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