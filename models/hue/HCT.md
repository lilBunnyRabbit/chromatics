#### **HCT**

- **Name:** HCT  
- **Description:** Represents colors using Hue, Chroma, and Tone. HCT is designed for dynamic theming and modern design systems by emphasizing perceptual uniformity with an intuitive focus on tone (brightness) alongside hue and chroma (intensity).

- **Parameters:**

  | Parameter | Description                 | Range        | Effect                                                                         |
  | --------- | --------------------------- | ------------ | ------------------------------------------------------------------------------ |
  | `h`       | Hue angle                   | 0–360        | Adjusting `h` rotates the color and changes its base tone.                     |
  | `c`       | Chroma (color intensity)    | 0–(variable) | Increasing `c` results in a more vivid color; lower values yield muted colors. |
  | `t`       | Tone (perceived brightness) | 0–100        | Lower values yield a darker color; higher values brighten it.                  |

- **Typed Array:** Float32Array (chosen for handling fractional values and non-integer ranges)  
- **Usage:** Useful for modern theming, dynamic UI design, and systems like Material You where perceptual uniformity is key.  
- **Modifications:**  
  • **Hue Adjustment:** Modify `h` to change the base color.  
  • **Chroma Modification:** Adjust `c` to control color vividness.  
  • **Tone Adjustment:** Change `t` to lighten or darken the color perceptually.

- **CSS / String Representations:**  
  • String: Generally converted to HSL or RGB for CSS output; alternatively, a custom `hct()` string format may be provided for debugging.

- **Direct Conversion Targets:**  
  - To/from HSL, RGB, and other perceptual models.

- **References:**  
  - [Material You and HCT Research](https://material.io/blog/introducing-material-you)  
  - [Additional Research on HCT](https://medium.com/android-news/material-you-what-its-all-about-f8e8b42331f)