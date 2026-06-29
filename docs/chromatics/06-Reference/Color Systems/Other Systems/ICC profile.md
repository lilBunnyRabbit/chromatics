---
tags: [color-system, other-system]
status: reference
updated: 2026-06-24
---

# ICC profile

> The ICC standard for device color characterization — a data file describing how a device reproduces color, enabling cross-device consistency.

## Overview
An ICC profile is not a color model in the traditional sense, but a standardized set of data (defined by the International Color Consortium) describing the color characteristics of a device. Profiles are essential for ensuring consistent color reproduction across different hardware in print and digital media. They are built into every major OS (macOS ColorSync, Windows ICM/WCS).

**Profile types:** Input (scanners), Display (monitors), Output (printers), Abstract, DeviceLink.

**Key strengths:**
- The Profile Connection Space (PCS) uses CIE Lab or CIE XYZ as the device-independent interchange.
- Built into every OS (macOS ColorSync, Windows ICM/WCS).
- Rendering intents: perceptual, relative colorimetric, saturation, absolute colorimetric.

**Best for:** Print color management, display calibration, cross-device consistency. Critical in professional printing and photography.

## Notation & Structure
A profile is identified or supplied as profile data; it is typically stored as binary data or structured objects rather than as a string.

| Parameter | Description | Range | Effect |
| --------- | ------------------------------ | ----- | ------------------------------------------------------------ |
| `profile` | ICC Profile identifier or data | N/A | Determines how device-specific color values are interpreted / selects the specific color profile. |
| `alpha` | Opacity (if applicable) | 0–1 | Controls transparency when applied in conversions. |

- **Typed Array:** Not applicable (typically stored as binary data or structured objects).
- **CSS / String Representation:** Not directly representable in CSS; used internally in color management workflows.
- **Direct Conversion Targets:** Intermediary for converting device-specific colors to standard models (e.g., RGB, CIE Lab). Typically mapped to RGB for digital display.

**Color Management:** Applying ICC profiles to ensure consistent color appearance across different devices and media. Changing the profile adjusts the color conversion behavior between devices.

## Usage
Useful for converting device-dependent color values to a device-independent color space; critical in professional printing and photography. Implementing support for ICC profiles allows accurate color management across different devices by using standardized profiles to describe their color attributes.

## Chromatics API
**Note:** Not a color model/system but a data format. Relevant API:
- `Color.fromICCProfile(profile, deviceValues)` -> `Color`
- `color.toICCProfile(profile)` -> device values
- Internally uses PCS (CIE Lab D50 or CIE XYZ D50) for conversions.

## Resources
- [ICC profile — Wikipedia](https://en.wikipedia.org/wiki/ICC_profile)
- [ICC Profiles Overview (color.org)](https://www.color.org/iccprofiles.xalter)
- [International Color Consortium — official site](https://www.color.org)

---
*Part of [[Color Knowledge Hub]] · see [[Color Models]].*
