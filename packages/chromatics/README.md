# @lilbunnyrabbit/chromatics

Every non-proprietary color model, typed, with cited math and exhaustive tests. One class per model, conversions through a graph of exact matrices, CSS parse and format.

Pre-release (`0.0.0`): the API is still being decided ([ADRs](../../docs/adrs/README.md)).

## Quick start

```ts
import { Oklch, Srgb, Srgb8 } from "@lilbunnyrabbit/chromatics";

const brand = Oklch.parse("oklch(70% 0.15 30)");
brand.h += 180; // channels are plain properties, validated on write
brand.to(Srgb).gamutMap().to(Srgb8).toHex(); // CSS Color 4 gamut mapping, then 8-bit hex

new Srgb(1, 0, 0).to(Oklch).toCss(); // 'oklch(0.62796 0.25768 29.23)'
```

- **Classes, mutable, chainable.** `new Model(...channels, alpha?)` or `Model.of({ l, c, h })`. Methods that edit return `this`; `clone()` copies. Operations that make new colors (`steps`, `ramp`, harmonies) return new instances.
- **`to(Model)` converts**, routing through the conversion graph. `Model.from(color)` is the same from the other side. A result past the number range throws a `RangeError`.
- **Parsing:** `Model.parse(string)` throws a `SyntaxError`; `Model.tryParse(string)` returns an `Optional`. `parse()` from `/all` reads any supported syntax.
- **Formatting:** `toString()` writes the shortest exact numbers and parses back bit for bit. `toCss({ precision })` rounds, and exists only on models CSS defines.
- **Imports:** `@lilbunnyrabbit/chromatics` exports every class; `@lilbunnyrabbit/chromatics/oklch` (one path per model) bundles only what that model reaches. `/all` adds `parse`, `models`, `path` and `reachable`.

## Models

Channels are the spec's letters. Percentages are 0–1 fractions (`new Hsl(30, 1, 0.5)`); hue is degrees, wrapped into [0, 360). Ranges are reference ranges; values outside them are stored as given, never clamped, except where a row says otherwise. Import path = the folder in `src/models/`.

### Core

| Class        | `toString()` / CSS        | Channels                 | Source                      |
| ------------ | ------------------------- | ------------------------ | --------------------------- |
| `Xyz65`      | `color(xyz-d65 …)`        | x y z, white Y = 1       | CSS Color 4 (the graph hub) |
| `Xyz50`      | `color(xyz-d50 …)`        | x y z                    | CSS Color 4, Bradford       |
| `LinearSrgb` | `color(srgb-linear …)`    | r g b 0–1                | CSS Color 4                 |
| `Srgb`       | `rgb()` / `color(srgb …)` | r g b 0–1                | CSS Color 4                 |
| `Srgb8`      | hex, named colors         | r g b 0–255, alpha 0–255 | CSS Color 4; rounds, clamps |
| `DisplayP3`  | `color(display-p3 …)`     | r g b 0–1                | CSS Color 4                 |
| `Oklab`      | `oklab()`                 | l 0–1, a b ±0.4          | Ottosson 2020, CSS matrices |
| `Oklch`      | `oklch()`                 | l 0–1, c 0–0.4, h        | CSS Color 4                 |
| `Lab`        | `lab()`                   | l 0–100, a b ±125 (D50)  | CIE, CSS Color 4            |
| `Lch`        | `lch()`                   | l 0–100, c 0–150, h      | CIE, CSS Color 4            |
| `Hsl`        | `hsl()`                   | h, s l 0–1               | CSS Color 4                 |
| `Hsv`        | `hsv(…)` (not CSS)        | h, s v 0–1               | Smith 1978 via Wikipedia    |
| `Hwb`        | `hwb()`                   | h, w b 0–1               | CSS Color 4                 |

### More hue models

All over encoded sRGB, like `Hsl`.

| Class       | String (not CSS)   | Channels                          | Source                                         |
| ----------- | ------------------ | --------------------------------- | ---------------------------------------------- |
| `Hsi`       | `hsi(h s% i%)`     | h, s 0–1, i = (R + G + B)/3       | Kender 1976; Wikipedia "HSL and HSV"           |
| `Hsp`       | `hsp(h s% p%)`     | h, s 0–1, p = √(Σ w·RGB²)         | Finley 2006 (no independent vectors for p)     |
| `Cubehelix` | `cubehelix(h s l)` | h, s 0–4.6144, l 0–1              | Green 2011, d3-color's reading as a space      |
| `Tsl`       | `tsl(t s l)`       | t° tint, s 0–1, l = Rec. 601 luma | Terrillon et al. 2000 (no independent vectors) |

- `Hsi` uses the hexagonal hue (HSV's), as culori and coloraide do; Gonzalez & Woods's arccos hue differs by up to about 1°.
- `Tsl`'s tint is a hue in degrees (Terrillon's turns × 360), so it rotates and mixes like `h`; the atan2 form keeps g′ = 0 invertible.
- `Hsp` and `Hsi` can leave sRGB from in-range channels (`new Hsp(0, 1, 1)` is r 1.83).
- Green's colormap is a line through `Cubehelix`: h = 120·start − 120 + 360·rotations·λ, s = hue / 2, l = λ^γ.

### Subtractive

Device-free inks over encoded sRGB, not print profiles.

| Class  | String                               | Channels        | Source                               |
| ------ | ------------------------------------ | --------------- | ------------------------------------ |
| `Cmy`  | `cmy(c m y)` (not CSS)               | c m y 0–1       | colour-science (EasyRGB)             |
| `Cmyk` | `device-cmyk(c m y k)` (CSS Color 5) | c m y k 0–1     | CSS Color 5 §6.1 naive conversion    |
| `Ryb`  | `ryb(r y b)` (not CSS)               | r y b paint 0–1 | Gossett & Chen 2004 (trilinear cube) |

- `Ryb` → sRGB is the paper's; the inverse is a Newton solve, exact where it converges. About 0.4% of sRGB (dark blues such as `rgb(0 0 0.75)`) throws a RangeError when converted to `Ryb`.
- `Cmyk` names each color many ways; converting from sRGB puts the shared part of the inks in k. Out-of-range inks are stored, not clamped as CSS clamps them.

### Wide-gamut RGB

| Class             | CSS                          | Transfer                          | Source                               |
| ----------------- | ---------------------------- | --------------------------------- | ------------------------------------ |
| `LinearDisplayP3` | `color(display-p3-linear …)` | linear                            | CSS Color 4                          |
| `A98Rgb`          | `color(a98-rgb …)`           | power 563/256                     | CSS Color 4                          |
| `ProphotoRgb`     | `color(prophoto-rgb …)`      | gamma 1.8 + linear toe, D50       | CSS Color 4                          |
| `Rec2020`         | `color(rec2020 …)`           | BT.1886 gamma 2.4                 | CSS Color 4                          |
| `Rec2100Pq`       | `color(rec2100-pq …)`        | PQ, white 203 cd/m²               | ITU-R BT.2100-3, CSS Color HDR draft |
| `Rec2100Hlg`      | `color(rec2100-hlg …)`       | HLG, white 0.75                   | ITU-R BT.2100-3, CSS Color HDR draft |
| `SmpteC`          | `smpte-c(r g b)` (not CSS)   | SMPTE 170M (1.099·L^0.45 − 0.099) | SMPTE 170M-2004                      |

### ACES

| Class      | String (not CSS)    | Encoding                    | Source             |
| ---------- | ------------------- | --------------------------- | ------------------ |
| `Aces2065` | `aces2065-1(r g b)` | AP0, scene-linear           | Academy S-2008-001 |
| `Acescg`   | `acescg(r g b)`     | AP1, scene-linear           | Academy S-2014-004 |
| `Acescc`   | `acescc(r g b)`     | AP1, log2                   | Academy S-2014-003 |
| `Acescct`  | `acescct(r g b)`    | AP1, log2 with a linear toe | Academy S-2016-001 |

- The ACES white (x 0.32168, y 0.33767) is adapted to D65 with Bradford, as the ACES CTL and OCIO do.
- ACEScc / ACEScct aren't clamped: negatives mirror and nothing caps at 65504, so every value round-trips.
- **scRGB** is linear sRGB with an extended range: use `LinearSrgb`.

### Video

Y′ plus two color differences, as matrices over encoded RGB (`Srgb`, or `Rec2020` for 2020). Float forms: Y′ 0–1, no digital offsets or code values.

| Class                               | String (not CSS)     | Channels              | Source                                 |
| ----------------------------------- | -------------------- | --------------------- | -------------------------------------- |
| `Ycbcr601`, `Ycbcr709`, `Ycbcr2020` | `ycbcr-601(y cb cr)` | y, cb cr ±0.5         | BT.601-7 / BT.709-6 / BT.2020-2, H.273 |
| `Yiq`                               | `yiq(y i q)`         | y, i ±0.596, q ±0.523 | SMPTE 170M-2004 Annex A                |
| `Yuv`                               | `yuv(y u v)`         | y, u ±0.436, v ±0.615 | SMPTE 170M-2004 Annex A                |
| `Ydbdr`                             | `ydbdr(y db dr)`     | y, db dr ±1.333       | ITU-R BT.470-6 (SECAM)                 |
| `Ycgco`                             | `ycgco(y cg co)`     | y, cg co ±0.5         | ITU-T H.273                            |

- Same math, other names: sYCC, JPEG Y′CbCr, YPbPr and Rec. 601 are `Ycbcr601` over `Srgb`; xvYCC is `Ycbcr709`; SECAM is `Ydbdr`.
- Integer code values (16–235 legal range, YCgCo-R's lifting) aren't modelled yet.

### Perceptual

| Class                | String                     | Channels                  | Source                          |
| -------------------- | -------------------------- | ------------------------- | ------------------------------- |
| `Luv65`, `Luv50`     | `luv-d65(…)` (not CSS)     | l 0–100, u v              | CIE 015:2018 §8.2.2             |
| `Lchuv65`, `Lchuv50` | `lchuv-d65(…)` (not CSS)   | l, c, h                   | CIE 015:2018                    |
| `Hsluv`, `Hpluv`     | `hsluv(…)` (not CSS)       | h, s / p 0–1, l = L\*/100 | hsluv.org (MIT)                 |
| `Okhsl`, `Okhsv`     | `okhsl(…)` (not CSS)       | h, s 0–1, l / v 0–1       | Ottosson 2021, ok_color.h (MIT) |
| `Jzazbz`             | `jzazbz()` (CSS HDR draft) | j, a b ±0.21              | Safdar et al. 2017              |
| `Jzczhz`             | `jzczhz()` (CSS HDR draft) | j, c 0–0.26, h            | Safdar et al. 2017              |
| `Ictcp`              | `ictcp()` (CSS HDR draft)  | i 0–1, ct cp ±0.5         | ITU-R BT.2100-3 (PQ)            |
| `IctcpHlg`           | `ictcp-hlg(…)` (not CSS)   | i 0–1 (white 0.75), ct cp | ITU-R BT.2100-3 (HLG)           |

- **HDR models** take absolute light: relative Y = 1 is 203 cd/m² (BT.2408-8). Negative light passes through PQ mirrored around PQ(0), so it round-trips.
- **Okhsl / Okhsv** exist only for Oklab L in [0, 1]: brighter than white converts to white, darker than black to black. This is the one deliberate data loss outside byte models.
- **Hsluv / Hpluv / Okhsl / Okhsv** describe sRGB only: `s` = 1 is the sRGB edge.

### Tristimulus and Lab-like

| Class                 | String (not CSS)    | Channels                                | Source                                   |
| --------------------- | ------------------- | --------------------------------------- | ---------------------------------------- |
| `Lab65`, `Lch65`      | `lab-d65(l a b)`    | as Lab / Lch, D65 white                 | CIE 015:2018 §8.2.1                      |
| `Xyy`                 | `xyy(x y Y)`        | chromaticity x y, luminance Y           | CIE 015:2018 §7.3                        |
| `Uvy76`               | `uvy-1976(u v Y)`   | CIE 1976 u′ v′, Y                       | CIE 015:2018 §8.1                        |
| `Uvy60`               | `uvy-1960(u v Y)`   | CIE 1960 u v, Y                         | CIE 015:2018 Annex A.4                   |
| `Uvw64`               | `uvw-1964(U V W)`   | CIE 1964 U\* V\* W\* (W\* −17 is black) | CIE 015:2018 Annex A.4                   |
| `Lms`                 | `lms(l m s)`        | Hunt-Pointer-Estevez cone responses     | Hunt, equal-energy normalised            |
| `Ipt`                 | `ipt(i p t)`        | i 0–1, p t                              | Ebner & Fairchild 1998                   |
| `HunterLab`           | `hunter-lab(l a b)` | L 0–100, a b                            | Hunter 1958, 1966 Ka / Kb                |
| `Din99`, `Din99Lch`   | `din99(l a b)`      | DIN 6176 (D65)                          | DIN 6176:2001                            |
| `Din99o`, `Din99oLch` | `din99o(l a b)`     | the studio's `dlab` / `dlch`            | Cui et al. 2002 (no independent vectors) |
| `Xyb`                 | `xyb(x y b)`        | JPEG XL; B = S′ (libjxl)                | libjxl (BSD-3)                           |

### Appearance

| Class                              | String (not CSS)   | Channels                               | Source                                |
| ---------------------------------- | ------------------ | -------------------------------------- | ------------------------------------- |
| `Cam16`                            | `cam16(J M h)`     | J 0–100, M 0–105, h; read-only C Q s H | Li et al. 2017                        |
| `Ciecam02`                         | `ciecam02(J M h)`  | as Cam16                               | CIE 159:2004                          |
| `Cam16Ucs`, `Cam16Lcd`, `Cam16Scd` | `cam16-ucs(J a b)` | J′ a′ b′; `deltaE`                     | Luo et al. 2006 / Li et al. 2017      |
| `Hct`                              | `hct(h c t)`       | h, c 0–145, t = L\* 0–100              | material-color-utilities (Apache-2.0) |

- Viewing conditions are fixed per class (Material's: D65, L_A ≈ 11.72 cd/m², Y_b ≈ 18.42, average surround). `Cam16.viewedIn({ adaptingLuminance, backgroundLuminance, surround, white, discounting }, id)` makes a class for other conditions that round-trips under them.
- `Hct` is unbounded: out-of-sRGB values are kept; `hct.to(Srgb).gamutMap()` gives Material's in-gamut color.

## Operations

| What                                                                                          | Where                                                                                                                       |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `mix(other, t)`, `steps(other, n)`, `interpolator(other)`, `Model.gradient(stops, n)`         | every model except the byte model `Srgb8`; hue models take `{ hue: "shorter" \| "longer" \| "increasing" \| "decreasing" }` |
| `rotateHue`, `complement`, `triadic`, `tetradic`, `square`, `splitComplementary`, `analogous` | hue models                                                                                                                  |
| `lighten`, `darken`, `saturate`, `desaturate`, `ramp(n)`                                      | perceptual and HSL-family models (see each class)                                                                           |
| `inGamut()`, `clamp()`, `gamutMap()` (CSS Color 4 MINDE)                                      | RGB models                                                                                                                  |
| `contrast(other)` (WCAG 2), `luminance()`                                                     | `Srgb`                                                                                                                      |
| `deltaE76`, `deltaE2000` · `deltaEOk`, `looksSame` · `deltaEuv` · `deltaEItp`                 | `Lab` · `Oklab` · `Luv65` / `Luv50` · `Ictcp`                                                                               |

Interpolation is in premultiplied alpha, like CSS `color-mix()`. A grey's hue is 0 and `isAchromatic()` says when it's meaningless; mixing treats it as missing, so white → blue doesn't pass through red.

## Numbers

- Matrices are derived in exact rational arithmetic from the published primaries (`bun run matrices`).
- Every expected value in the tests comes from an independent, cited source (CSS Color 4, WPT, CIE, ITU-R, the papers). Secondary sources are marked as such. [Provenance](scripts/fixtures/README.md).
- Each model runs one shared test matrix: boundaries, degenerate input, round trips with every neighbour, totality, strings, references and a culori cross-check. Every suite runs on V8 and JavaScriptCore.

## License

MIT. Ported code from HSLuv, ok_color.h, material-color-utilities and color.js keeps its notices in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
