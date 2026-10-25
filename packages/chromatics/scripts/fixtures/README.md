# Fixtures

Each `src/models/<model>/<model>.fixtures.json` holds the model's published reference vectors. Tests read these files only.

## Sources (retrieved 2026-10-19)

| Key         | Source                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `css4`      | CSS Color 4 Editor's Draft, bikeshed source `css-color-4/Overview.bs`, csswg-drafts @ `3cfa13e88561688b47392ab3ee171fbb8d76d949` |
| `wpt`       | web-platform-tests `css/css-color/parsing/*.html` (24 files) @ `38690cce87929f184a529234eff84eaa426609c3`                        |
| `ottosson`  | Björn Ottosson, _A perceptual color space for image processing_, table "example XYZ and Oklab pairs"                             |
| `wikipedia` | Wikipedia "HSL and HSV", oldid 1378989624, Examples table. **Secondary**: the only HSV source found                              |

Every case records where it came from:

- `src` and `at` give the source and its line, so a reviewer can open the pinned file there.
- Spec cases also carry the exact quoted text in `quote`.

How the vectors were collected:

- **No value was computed, recalled, or produced by a color library.**
- Spec examples were copied from the pinned source. A case was kept only if its input and expected strings both appear verbatim in the quoted lines.
- WPT expectations were collected by running the test files against stub harness functions. The stubs only record the `(input, expected)` arguments and the line.

## Case fields

| Field       | Meaning                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`      | What the source asserts: `explicit-statement`, `example-table`, `named-color-table`, `reference-table`, `wpt-computed-value`, `wpt-specified-value`, `wpt-invalid`, `wpt-relative-color-identity`, … |
| `precision` | Half of the last published digit of each expected token, in the units as written. A scalar, or one value per token.                                                                                  |
| `epsilon`   | WPT's asserted tolerance for fuzzy helpers (in the written units). The test uses `max(precision, epsilon)`.                                                                                          |
| `exact`     | WPT exact-string helper: the browser printed these digits.                                                                                                                                           |
| `expected`  | `null` for `wpt-invalid`: the input must throw a `SyntaxError`.                                                                                                                                      |

The harness (`src/testing/harness.ts`, ADR-008) does two things before comparing:

- **Converts each tolerance into model units.** A percentage token is converted through the channel's `percent`, a legacy `rgb()` number from the 0–255 scale.
- **Adds the spread of the input's own rounding.** A published input is rounded too, so every corner of its half-digit box is converted. WPT inputs are test definitions, so they get no spread.

## Excluded, and why

| Excluded                                                         |    Count | Reason                                                                                                                                          |
| ---------------------------------------------------------------- | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `swatch-equivalence`                                             |       54 | The spec fills an inline swatch with an `rgb()` value but doesn't state the equality in prose; WPT's exact conversion differs by ~0.03 points   |
| colorjs.io provenance                                            |       20 | The spec's source comment shows these numbers were generated with colorjs.io: not independent                                                   |
| HWB table cells flagged by the collector                         |       23 | They contradict the spec's own rule (W + B ≥ 100% must be grey; the cells have unequal channels)                                                |
| `explicit-statement-partial`                                     |       10 | Only one channel published                                                                                                                      |
| `hidden-comment`                                                 |        6 | HTML comments in the source, not rendered spec text                                                                                             |
| `none` across models                                             |      326 | CSS Color 4 carries a `none` channel across spaces ("analogous components"); this package parses `none` as 0 (ADR-006, grill 22)                |
| Gamut-mapping examples (`#GM-*`)                                 |       10 | Results of gamut mapping, not of conversion                                                                                                     |
| `#ex-xyz` hex / `rgb()` ↔ XYZ pairs                              |        8 | The example's XYZ values come from its rounded `lab()` member, not from `#7654CD`. The hex → `xyz-d50` z is 0.44708, but the spec prints 0.4472 |
| `oklab(54.0% -0.10 -0.02)`, `oklab(54.0 -25% -5%)`               |        2 | Spec typos: inconsistent with the stated result and with WPT, which clamps a bare 54 to 1                                                       |
| Wikipedia rows for models other than HSV                         |       19 | Secondary source; primary sources exist for those models                                                                                        |
| Other spaces (rec2020, a98-rgb, prophoto-rgb, display-p3-linear) | 36 + 395 | Excluded at first collection; restored 2026-10-19 with their models (`732cd87`), so they now live in those fixture files                        |
| `calc()`, relative color, `color-mix()`, `currentcolor`          |      344 | Syntax this package doesn't parse                                                                                                               |

These numbers come from the 2026-10-19 collection run. The scripts that collected and reshaped the vectors were one-off transcription tools, not committed. The JSON here is the committed source of truth, and every case can be audited against its pinned source line.

## Operation fixtures (2026-10-19)

| File                                            | Source                                                                                                                                                                                       | Notes                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/models/lab/ciede2000.fixtures.json`        | Sharma, Wu & Dalal, Color Res. Appl. 30(1), 2005, Table 1 (author's site: txt, PDF, XLS)                                                                                                     | Inputs are the author's XLS full-precision values; pairs 21–24 publish rounded inputs whose exact values are needed for ΔE00 = 1.0000. ΔE00 is the published 4-decimal value. Site terms: "Personal or research use … permitted with proper citation"                                                    |
| `src/models/srgb/wcag.fixtures.json`            | WAI Understanding 1.4.11, Techniques G183 / G207                                                                                                                                             | Ratios to 1 decimal. `#E5E5E5` on `#6221EA` is published as 5.6, but WCAG's formula gives 5.6994; it's marked `knownDiscrepancy` and tested only for the claim it supports (≥ 3:1)                                                                                                                       |
| `src/core/families/mix.fixtures.json`           | CSS Color 4 interpolation examples (csswg-drafts `40527902`); WPT `color-computed-color-mix-function.html` and `color-mix-missing-components.html` (wpt `4ad507b2`)                          | Excluded: cases with `none`, `calc()` and nested color-mix; N-color `color-mix()`; and in-space greys with an explicit hue (CSS keeps their hue, ADR-003 treats it as missing)                                                                                                                           |
| `src/models/luv65/hsluv-snapshot.fixtures.json` | hsluv/hsluv `snapshots/snapshot-rev4.json` (MIT, unchanged since 2016-12-16): 4096 sRGB hexes stepping 0x11                                                                                  | **Secondary.** Columns luv, lch, hsluv, hpluv kept, rgb / xyz dropped. The reference uses its own truncated κ / ε and sRGB matrix, so it is checked at 1e-8; measured max 2.83e-9 (2026-10-19, at dark colors)                                                                                           |
| `src/models/okhsl/colorjs.fixtures.json`        | color.js `test/conversions.js` @ `4d3ab457` (MIT), the Okhsl and Okhsv sections (sRGB primaries, secondaries, white, black)                                                                  | **Secondary**: no primary vectors exist. Checked at colorjs's own asserted epsilon, 1e-4 (its line 18)                                                                                                                                                                                                   |
| HDR group, inline in the test files             | CSS Color HDR 1 ED (2026-10-08) §6.3–6.5 examples; ITU-R BT.2124-0 Annex 4; ITU-R BT.2408-8 Table 1; colour-science `colour/models/tests/test_jzazbz.py` @ `248121e3` (BSD-3, **secondary**) | Excluded: CSS HDR's "lime" examples (its `jzazbz` a / b give C 0.1607 / h 137°, not its own `jzczhz` 0.1614 / 132.5°; Jz and the ICtCp lime disagree with culori and with this package, which agree to every printed digit); BT.2124's expected blue (step 4 disagrees with its own step 3 by 3e-4 in I) |
| `src/core/families/gamut.fixtures.json`         | CSS Color 4 `#ex-p3-oog-*` examples ("such as", 3 decimals); WPT `canvas-*-gamut-mapping.html`                                                                                               | The canvas values were generated by apps.colorjs.io: cross-check only. The `#ex-gamutmap-p3-yellow-to-srgb` example illustrates plain chroma reduction, not the CSS algorithm, so it isn't used                                                                                                          |

## Luv and culori

culori's `luv` / `lchuv` convert from xyz50, so only `Luv50` / `Lchuv50` get the grid. `Luv65` / `Lchuv65` are checked against the HSLuv snapshot instead.

## Okhsl / Okhsv and culori

Okhsl and Okhsv are defined inside sRGB only, so their culori edges compare in-gamut grid colors only. culori takes ok_color.h's single Halley step while this package iterates to convergence; the measured gap (6.1e-5 into Oklab, 1.2e-7 out of it) sets the per-edge tolerances in `culori.ts`.

## HDR models and culori

culori's `jab` / `jch` / `itp` clamp negative light before PQ, while this package mirrors it (grill 60), so those edges compare in-gamut colors only. culori's `itp` keys are `i t p` holding unscaled Ct / Cp; `culori.ts` maps them. Jzazbz → XYZ differs by 1.7e-8, from culori's float inverse matrices; ours are exact.

## Rec2020 and culori

Rec2020 has no culori cross-check. culori 4.0.2 decodes it with the inverse BT.2020 OETF (α 1.0993, β 0.0181), CSS Color 4's earlier definition. The current spec uses the BT.1886 gamma 2.4, and the WPT Rec2020 cases (wpt `38690cce`) pass against that.
