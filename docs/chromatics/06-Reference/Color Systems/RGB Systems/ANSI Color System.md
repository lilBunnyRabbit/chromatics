---
tags: [color-system, rgb-system]
status: reference
updated: 2026-06-24
---

# ANSI Color System

> Standard color codes for terminal emulators — 4-bit (16 colors) and 8-bit (256 colors) palettes for CLI interfaces, set via ANSI escape codes.

## Overview
The ANSI Color System defines a set of colors used in computer terminals and command-line interfaces via ANSI escape codes. It is based on the VGA color palette, with models for 4-bit (16-color) and 8-bit (256-color) codes. It is best suited for CLI applications, terminal UIs, and shell scripts.

**Palette tiers:**
- **ANSI 16:** 8 standard + 8 bright (VGA palette)
- **ANSI 256:** 16 + 216 cube (6×6×6) + 24 grayscale
- **True color:** 24-bit RGB via escape sequences

## Notation & Structure
Colors are selected by integer code identifiers. ANSI defines color codes typically available in 16-color and 256-color palettes.

| Parameter | Description                | Range  | Effect                                                          |
| --------- | -------------------------- | ------ | -------------------------------------------------------------- |
| `code`    | ANSI color code identifier | Varies | Changing `code` selects a different pre-defined terminal color. |
| `alpha`   | Opacity                    | 0–1    | Controls transparency if applicable.                           |

- **Typed Array:** `Uint8ClampedArray` (suitable for discrete integer codes)
- **String / CSS representation:** Represented via escape sequences (e.g. `\x1b[31m` for red).
- **Color selection modification:** Adjust the `code` value to switch between available ANSI colors.
- **Direct conversion targets:** Typically mapped to RGB for digital display purposes.

## Usage
Useful in terminal and console applications for defining text and background colors in command-line interfaces — CLI applications, terminal UIs, and shell scripts.

## Chromatics API

**Type:** `CatalogSystem`

**Static methods:**
- `ANSI.lookup(code)` -> `Color` (default VGA palette or current terminal theme)
- `ANSI.nearest(color)` -> closest ANSI 256 code
- `ANSI.toEscapeCode(color, layer?)` -> `\x1b[38;2;r;g;bm` (true color) or `\x1b[38;5;Nm` (256)

**DSL:** `ANSI(196)` -> `Color`

## Resources
- [ANSI escape code (Wikipedia)](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [ANSI16 — colormath documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi16/)
- [ANSI256 — colormath documentation](https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi256/)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*
