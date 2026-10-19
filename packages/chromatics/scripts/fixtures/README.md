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
| Other spaces (rec2020, a98-rgb, prophoto-rgb, display-p3-linear) | 36 + 395 | Not yet implemented; they come back with their models                                                                                           |
| `calc()`, relative color, `color-mix()`, `currentcolor`          |      344 | Syntax this package doesn't parse                                                                                                               |

These numbers come from the 2026-10-19 collection run. The scripts that collected and reshaped the vectors were one-off transcription tools, not committed. The JSON here is the committed source of truth, and every case can be audited against its pinned source line.
