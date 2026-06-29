---
tags: [color-model, other]
status: reference
updated: 2026-06-24
---

# GL

> OpenGL/WebGL's color representation -- normalized floating-point RGBA values (0.0-1.0) for GPU shaders and graphics pipelines.

## Overview
GL (OpenGL Color Representation) refers to the color representation used in OpenGL, WebGL, and similar graphics libraries, typically expressed as normalized RGB(A) values in the 0.0-1.0 range. It is **not technically a distinct color model** -- it is normalized RGB as used in graphics APIs, suited to a linear, normalized space for GPU work. Colors are usually defined in RGB or RGBA formats for shaders and graphics pipelines.

## Channels

| Channel | Full name | Range | Controls |
|---------|-----------|-------|----------|
| `r`     | Red channel | 0-1 | Increasing `r` boosts the red component. |
| `g`     | Green channel | 0-1 | Increasing `g` boosts the green component. |
| `b`     | Blue channel | 0-1 | Increasing `b` boosts the blue component. |
| `alpha` | Opacity | 0-1 | Controls transparency. |

## Characteristics
- Not a distinct color model -- normalized RGB / sRGB (0-1) as used in graphics APIs.
- **Typed array:** Float32Array (chosen for precision and GPU compatibility).
- **Best for:** Shader programming, GPU rendering, WebGL/OpenGL.
- **Usage:** Ideal for graphics programming, shaders, and any application requiring colors in a normalized, linear space.
- **Modifications:** Channel adjustment -- change individual channels for basic color transformations.
- **CSS / string:** Typically converted to RGB for use in CSS.

## Conversions
- **Converts to:** RGB255, sRGB (if gamma-corrected).
- **Direct conversion targets:** To/from Normalized RGB and sRGB.

## Chromatics API
**Note:** Not a distinct model -- normalized sRGB (0-1). Use `Srgb` with normalized values. Provide `.toGLSL()` -> `vec4(r, g, b, a)` string output format.

## Resources
- [Wikipedia: Colors](https://en.wikipedia.org/wiki/Colors)
- [OpenGL Color Basics (Khronos)](https://www.khronos.org/opengl/wiki/Colors)
- [WebGL Specification (Khronos)](https://www.khronos.org/registry/webgl/specs/latest/)
- [The Book of Shaders -- Color](https://thebookofshaders.com/06/)

---
*Part of [[Color Knowledge Hub]] · taxonomy in [[Color Models]].*  Related: [[sRGB]], [[RGB]], [[Linear sRGB]].
