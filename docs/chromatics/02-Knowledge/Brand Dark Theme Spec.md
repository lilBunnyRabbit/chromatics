---
tags: [knowledge, brand, spec]
status: living
updated: 2026-08-01
---

# Brand Dark — Theme Spec

The finished two-mode theme for **lilBunnyRabbit**, derived from one seed. Supersedes the
hand-derived palette in [[Brand Color Design]] (same seed, hand-tuned instead of solved).
Theory in [[Color Theory]], contrast rules in [[Accessibility]], model in [[Oklch]].

> [!info] Scope
> **Dark is the brand.** The logo, the marketing and the identity all live there, and it is
> frozen. **Light exists so the product can render a light UI** — defined to the same
> standard, not intended as identity. Light is fitted to its own ground rather than
> inheriting dark's hues; see *Light is not a hue swap* below.

## The one rule

**Chroma tracks the gamut.** Hold chroma at a constant fraction of the sRGB boundary at each
lightness: `C = k · maxChroma(L, hue)`, `k = seed.C / maxChroma(seed.L, seed.H)` = **0.456**.

Below the cusp this is exactly `C = seed.C · L / seed.L`, which is the form the dark ladder
uses. It replaced an 18-variant `sat`/`flat`/`desat` study: those columns were two halves of
this one curve, matching `k · maxChroma` to four decimals, and `bg_darkest_sat` was the only
colour in the old file outside sRGB.

## The palette — 17 tokens, each with a `light_` twin

| dark | | light | |
|---|---|---|---|
| `background` | `#17252c` | `light_background` | `#f5ecdc` |
| `background_lightest` | `#2a3f4a` | `light_background_lightest` | `#fff5e6` |
| `background_lighter` | `#233640` | `light_background_lighter` | `#fcf2e2` |
| `background_light` | `#1d2d36` | `light_background_light` | `#f8efdf` |
| `background_dark` | `#111d23` | `light_background_dark` | `#e8decf` |
| `background_darker` | `#0b151a` | `light_background_darker` | `#dbd1c2` |
| `background_darkest` | `#060d11` | `light_background_darkest` | `#cec4b5` |
| `foreground` | `#b1aba8` | `light_foreground` | `#474f5c` |
| `primary` | `#a4b483` | `light_primary` | `#6a442f` |
| `secondary` | `#b2a6c5` | `light_secondary` | `#335653` |
| `tertiary` | `#9eb1ac` | `light_tertiary` | `#4e4d59` |
| `accent` | `#dc9b76` | `light_accent` | `#6b3c5e` |
| `success` | `#7ac26a` | `light_success` | `#225e12` |
| `warning` | `#e49b39` | `light_warning` | `#535200` |
| `error` | `#f88876` | `light_error` | `#852d22` |
| `info` | `#49b7fb` | `light_info` | `#00548a` |
| `cottontail` | `#e0f9ab` | `light_cottontail` | `#af5100` |

Plus `mark_ears` = `#e0f9ab`, fixed in both modes. There is **no `border` token** — borders
are `fg/67`, the lowest alpha clearing 3:1 on every shade.

## Dark — what is derived, and why it is not a choice

| quantity | rule | why |
|---|---|---|
| ladder reach `span` = 0.100 | `ensureContrast(background.atLightness(0.50), error, 4.55).ok_l - bl` | the lightest shade is the lightest colour the hardest text still clears. `error` is hardest on a dark ground. 4.55 not 4.5 is headroom for the chroma each rung gains from the curve. The hand-tuned 0.11 was six thousandths over. |
| rung chroma | `c · L / bl` | the one rule |
| brand chroma | integer multiples of the seed chroma — 1c 2c 3c 4c, states 6c | the scheme already said `primary = 3c` and `states = 6c`, so `c` was already the quantum. With primary pinned at 3 there are exactly two rungs beneath it, and exactly two quieter siblings. 5c is empty so the brand band and the state band stay apart. |
| brand hue | ≥45° from the neutral, ≥45° from other brand hues, ≥25° from state hues | leaves two legal arcs, 167.5–185 and 347.5–365 |
| `tertiary` = `primary + 54` | the midpoint of the 167.5–185 arc, i.e. of `primary` and the neutral | the arc's edges ARE the two 45° constraints, so its centre is the point furthest from both. Was `primary − 120`, the only legal triad partner (`+120` lands 12° off the neutral axis and 2.5° off `info`) — but at 1c that put rank 1 only 7.2 ΔE from `foreground`, against `secondary`'s 14.7. Now 11.9. |
| `cottontail` | `foreground.ok_l + span·2`, chroma 60% of the ceiling | must clear L 0.94 or the logo ears stop reading on the disc |

**Verified: all 63 colour × shade pairs clear AA.** Worst 4.59.

## Light is not a hue swap

Reusing dark's hues fails, and it is measurable. On the warm page, dark's **green primary sits
13.1 ΔE** from the page's own darkened form — it reads as a shade of the paper rather than a
colour on it. **Orange measures 15.2** in the same position. That is the entire reason the
light primary is orange, and it is a measurement, not a preference.

The cause is derivational: `paper_h` started as `(foreground.ok_h + primary.ok_h) / 2`, i.e.
*halfway to the primary*, which guarantees the primary lands near the page. The crossover
where green and orange swap places sits at page hue ≈82; the page is at 80.

### Derived from dark

| quantity | rule |
|---|---|
| `light_bl` = 0.945 | `foreground.ok_l + span · 2` — the top of the dark system |
| page chroma | the same 45.6% gamut fraction the dark seed sits at |
| `light_foreground` | solved to the **same body ratio as dark** — 7.04 against dark's 6.92 |
| `light_l` = 0.425 | `light_foreground.ok_l` — mirrors `primary = OKLCH(foreground.ok_l, …)` |
| `accent` | `primary − 72` — dark's own offset, still legal |
| `tertiary` | `primary − 120` — dark's **old** offset, and light keeps it. Dark has moved to `+54`; on a warm h80 page the same law leaves one legal arc, 271.5–293°, which is where `−120` already lands. Nor would moving help: at `u · 1` = 0.0205 against `light_foreground`'s 0.0233 on the same lightness, the best legal hue scores 5.3 ΔE from the text against this 4.8. The light twin is chroma-bound, not angle-bound. |

### Chosen, with the reason it had to be

| quantity | value | why |
|---|---|---|
| page hue | 80 | the derived midpoint 86.47 read too yellow. 80 is also 0.7° off the old Speed Reader ground `#FFF6E7`. |
| primary hue | 50.47 | orange, per the ΔE measurement above |
| secondary hue | 190 | `primary + 180` lands on `info` — the complement of orange **is** blue. 190 is the centre of the legal teal arc, 50° clear of both `success` and `info`. |
| warning hue | 110 | hue 70 sits 10° from an h80 page. Nothing between 105 and 115 was free for an amber, so warning is green-gold. Unconventional, chosen deliberately. |

### The ladder inverts its shape

Dark runs ±span around a mid-range page. The light page sits near the ceiling, so each side
divides the room it actually has — **0.0294 above and 0.120 below**. Down is a contrast solve.
Up is a *gamut* solve, because on paper the binding limit going up is not legibility, it is
whether the tint still exists.

| quantity | rule |
|---|---|
| `light_span` = 0.120 | `light_bl - ensureContrast(page@0.75, light_success, 4.55).ok_l` |
| `light_up` = 0.0294 | `1 - light_c / light_slope - light_bl` — reach the **tint ceiling** |
| `light_slope` | `maxChroma(0.99, light_bh) / (1 - 0.99)` — one probe, see below |

Chroma is held constant in **both** directions and nothing needs gamut mapping: all seven
light shades are `OKLCH(L, light_c, 80)`, one chroma, one hue, only lightness moving.

ΔE from the page: **2.08 · 1.38 · 0.63 · 0 · 3.08 · 6.02 · 9.17**. Asymmetric, and honestly
so — there is only 0.0294 of lightness above the page before the tint leaves sRGB, against
0.120 below. Light contract worst cell **4.55** (`light_success` on `light_background_darkest`),
measured on the shipped 8-bit hexes; the same cell reads 4.59 on continuous values.

### Why the up side is a division and not a solver

Near white the sRGB boundary in OKLCH converges on a straight line into (L 1, C 0). One probe
fixes its slope, and the ceiling — the lightest L at which `light_c` still fits — falls out as
`1 - light_c / slope`. Probes from 0.96 to 0.995 land within **0.0004** of each other and give
the identical hex, which is the linearity claim verified rather than assumed.

> [!warning] `light_up = 1 - light_bl` was the bug
> The original rule reached for L 1.0, which is a coordinate, not a colour. At L 1.0 the sRGB
> chroma ceiling is **zero**, so `gamutMap()` stripped the whole page tint and the top shade
> came out `#ffffff` — the only token in the light half with no chroma at all. Its ΔE from the
> page was 8.26 against the next rung's 2.59: a chroma **cliff**, not a lightness step, and it
> read as a hole in the ladder. Removing it necessarily costs reach, because that cliff *was*
> the reach. See *Paper themes* below — the finding was already in this note, unapplied.

## Findings worth keeping

**The hardest hue flips with polarity.** On the dark page `error` has the least room; on a
light page it is `success` — 4.04 against error's 4.61 at the same rung. Solving the light
span against dark's worst case left seven of nine light colours under AA.

**Paper themes hold chroma constant and put the page at the top.** Solarized `#fdf6e3`→`#eee8d5`
is .0261→.0260; Gruvbox `#fbf1c7`→`#ebdbb2` is .0555→.0566. Neither palette contains white.
The dark ladder's proportional rule inverts up here — near white the gamut collapses so fast
that scaling washes the tint out.

This finding sat in the note for a release while the ladder still climbed to L 1.0 and emitted
`#ffffff` — a contradiction nobody read, because a finding written in prose does not constrain
a formula written in code. **Now applied:** chroma is constant in both directions and the top
rung stops at the tint ceiling. The general lesson is the cheaper half: a constant like
`1 - light_bl` that reaches for a *coordinate* rather than for a *colour* will keep producing
this class of bug, and it is invisible in a contrast audit because the lightest rung is never
the binding cell.

**Comfort tracks chroma, not contrast.** Across a chroma row at fixed lightness the contrast
moves 0.08 (5.21 → 5.27) while the colour goes from muted to harsh. Every "hard to look at"
reaction in testing was saturation, and every "muddy" one was a colour sitting at a low
fraction of its own ceiling — 14% for `tertiary` at `primary − 120`, 40% for the first light
primary. Moving `tertiary` to the arc midpoint takes it to 17% of a lower ceiling, which is a
nudge, not a cure: at 1c the whole rank is near the muddy end by construction, and that is the
reason the light twin cannot be fixed by hue at all.

**A "green dead zone" I claimed does not exist.** An earlier pass concluded green could not
hold chroma on a light ground. That was `ensureContrast` walking lightness before chroma and
returning the nearest match — an analytic scan shows green reaches C 0.1122 at 4.5:1, 1.6×
what it needs. The fix was dropping the solver, not the hue.

**Brand lightness trades against ladder depth.** With the full contract, a brand at L 0.50
caps the deepest rung at L 0.925 — ΔE 0.35 from the page, no visible panels. L 0.425 buys a
0.125 span. Chosen: keep the contract, darken the brand.

## The mark

Pale ears on a green disc. The **ears are a fixed asset colour** (`mark_ears`) in both modes;
only the disc themes.

```
dark    #e0f9ab on #a4b483    1.94   greyscale 1.93
light   #e0f9ab on #6a442f    7.36   greyscale 7.55
```

1.94 is a logo allowance — WCAG exempts logotypes — and it holds because the difference is
*lightness*, not hue, so the mark survives greyscale and all three CVD types within 0.1 of the
normal-vision value.

**Do not derive the light ears from `light_primary`.** Dark's "+2 spans above the disc" is an
accident of `primary` sitting at L 0.745; two spans up from `light_primary` reaches only 0.700
and the ears go muddy — 2.28 on the disc against 7.36 for the fixed colour.

## `cottontail` and its light twin do different jobs

`cottontail` is the brightest thing in the dark system: logo detail, display text, focus
rings, 13.66 on the page.

`light_cottontail` **pops by chroma, not lightness**. On a light page the "further from the
page" route lands beside the foreground, where it reads as ordinary dark text no matter what
ΔE says. So the twin goes to the full gamut ceiling instead — 4.45 on the page, which is a
focus ring, a marker, a chart highlight. **Not display text**; use `light_primary` for that.
Not an identity colour either.

Same name, same slot, narrower job — because on a light page nothing can be both the loudest
colour and a readable text colour.

## Open items

- **APCA.** `foreground` is Lc 54.7, under the 60 body bar. WCAG says 6.92, comfortably AA —
  this is the polarity blindness WCAG 2 has for light-on-dark. L 0.78 would clear it but costs
  the clean `1 − bl` inversion.
- **`light_warning` is green-gold** `#535200`. It clears every constraint but fights
  convention. Worth checking in a real alert rather than a swatch.
- **`light_cottontail` follows the orange primary** `#af5100`, so dark and light "cottontail"
  share only a name, not a hue.

## Bugs this work surfaced in the app

- **`contrastRatioAlpha` blends in linear RGB.** Browsers composite CSS alpha in gamma sRGB,
  and `resolveRef` emits `color-mix(in srgb, …)`. Four of six alpha pairs flip WCAG band, and
  the error over-reports light-on-dark — the common case in a dark theme.
- **`tokensFromScheme` silently drops unknown `token()` families** (`if (!(fam in t)) continue`),
  so `token("opacity", …)` produces no CSS var, no ref and no error.
- **The two audits disagree** on disabled/border pairs — `roles.ts` grades at the normal band,
  `components.ts` at the large band via the `large` flag.
- **`resolveColor` strips alpha modifiers**, so a translucent *background* cannot be audited:
  `error on error/15` scores 1.00 instead of ~5.

## Source

```js
// ── Brand Dark v4 — a ladder of background shades, and colors that work on all of them ──
//
// 17 colors: 7 background shades, 1 foreground, 4 brand, 4 states, 1 identity.
// No surface / surface_tint / border / ink — those were role names pretending to
// be a ladder. A background is a SHADE, and the contract is that every other
// color in the scheme is legible on every one of them.
//
// That contract is what sizes the ladder. It is not a taste decision: past a
// certain lightness the states stop clearing AA, so the ladder's reach is solved,
// not chosen (see `span`). Everything else is a relationship to the seed.
//
// Verified: all 63 color x shade pairs clear WCAG AA 4.5:1. Worst cell 4.59.

// ── 1. Seed — the only literal ──
background = OKLCH(0.255, 0.0233, 230.47)

c  = background.ok_c
bl = background.ok_l
bh = background.ok_h

// ── 2. Foreground ──
foreground = OKLCH(1 - bl, c / 3, (bh + 180) % 360)

// ── 3. Brand — hue is identity, chroma is rank ──
// Hue: >=45deg from the neutral (or it reads as a lit shade), >=45deg from every
// other brand hue, >=25deg from every state hue. With the neutral at 230 that
// leaves two legal arcs, 167.5-185 and 347.5-365.
//
// tertiary WAS primary - 120, in the second arc — the only legal one of primary's
// two triad partners (+120 lands 12deg off the neutral axis and 2.5deg off info).
// It is now in the FIRST arc, and derived rather than picked. At -120 rank 1 sat
// 7.2 dE from foreground where secondary sits at 14.7: it fell off the chroma
// ladder into body-text territory instead of tapering into it, while a dusty rose
// 28deg from error was the one warm note on a blue-grey page. Too close to the
// text to read as a colour, too odd not to catch the eye.
//
// The 167.5-185 arc is wider and empty, and its edges are set by the two 45deg
// constraints — the neutral at 230.47 above, primary at 122.47 below — so the
// point furthest from both is their midpoint, (122.47 + 230.47) / 2 = 176.47.
// That is primary + 54, and it is the arc's own centre rather than a taste call.
// dE from the nearest rail colour: 7.2 -> 11.9.
//
// A teal further up the arc scores a hair better (194 gives 12.0) but sits 36deg
// off the neutral, which is what the >=45 rule means by reading as a lit shade —
// measured, it is 5.7 dE from the page hue raised to this lightness, against 7.9
// at the midpoint. The rule was right; the old hue was simply in the wrong arc.
//
// Chroma: the seed's chroma is the quantum. The scheme already said primary = 3c
// and the states = 6c, so every rank is an integer multiple. With primary pinned
// at 3 there are exactly two rungs beneath it, and exactly two quieter siblings —
// the count is forced, not picked. 5c is left empty so the brand band (1-4c) and
// the state band (6c) stay apart.
primary   = OKLCH(foreground.ok_l, c * 3, (foreground.ok_h + 72) % 360)
secondary = primary.complement().atChroma(c * 2)
accent    = primary.derive({ h: foreground.ok_h }).atChroma(c * 4)
tertiary  = primary.shift({ h: (bh - primary.ok_h) / 2 }).atChroma(c * 1)

// ── 4. States — fixed cultural hues at the top of the chroma ladder ──
success = OKLCH(foreground.ok_l, c * 6, 140)
warning = OKLCH(foreground.ok_l, c * 6, 70)
error   = OKLCH(foreground.ok_l, c * 6, 30)
info    = OKLCH(foreground.ok_l, c * 6, 240)

// ── 5. How far the ladder may reach — SOLVED ──
// The lightest shade is the lightest color on which the hardest text still
// passes. error is the hardest (lowest luminance of everything at L 0.745), so:
// start from a deliberately-too-light probe and let ensureContrast darken it
// until error clears the target. The 4.55 rather than 4.5 is headroom for the
// chroma each rung gains from the curve below, which costs about 0.06 of ratio.
//
// Answer at this seed: span = 0.100, so the ladder runs L 0.155 to 0.355. Your
// hand-tuned 0.11 was six thousandths off the derived ceiling.
// Move the seed, or change the states, and this re-solves.
span = ensureContrast(background.atLightness(0.50), error, 4.55).ok_l - bl

// ── 6. The ladder — lightest to darkest ──
// Chroma is proportional to lightness, which below the gamut cusp is identical to
// holding chroma at a constant fraction of the sRGB boundary (measured: the two
// agree to 4 decimals). Lighter shades gain color, darker ones lose it, and
// nothing leaves gamut.
background_lightest = OKLCH(bl + span,       c * (bl + span) / bl,       bh)
background_lighter  = OKLCH(bl + span * 2/3, c * (bl + span * 2/3) / bl, bh)
background_light    = OKLCH(bl + span / 3,   c * (bl + span / 3) / bl,   bh)
// background — L 0.255, the seed, sits here
background_dark     = OKLCH(bl - span / 3,   c * (bl - span / 3) / bl,   bh)
background_darker   = OKLCH(bl - span * 2/3, c * (bl - span * 2/3) / bl, bh)
background_darkest  = OKLCH(bl - span,       c * (bl - span) / bl,       bh)

// ── 6b. IDENTITY — the logo, and the brightest color in the system ──
// A brand palette and a product palette are different objects: a brand is built
// OUTWARD from the accent, a product UPWARD from the ground. The identity needs
// no colors of its own here, because picking the right existing one per ground
// beats any single compromise color:
//
//   logo on a dark ground   primary     7.06
//   logo on a light ground  background 15.70
//
// A mid-lightness mark that clears both (the Discord Blurple position, L 0.577)
// would score about 4.30 and 3.65 — worse on BOTH than choosing per ground. So
// there is no brand_mark. Ship a dark-ground and a light-ground logo, which is
// what Slack, Stripe and GitHub all do.
//
// cottontail is the one genuinely new identity color: the brightest thing in the
// scheme, the flash of a rabbit's tail, and the light half of the logo lockup.
//
// DEFINED WITHOUT A SOLVER. Lightness is two ladder spans above the text color —
// it has to clear L 0.94 or the ears stop reading on the disc. Chroma is a
// fraction of the gamut boundary at that lightness, which is how the old lime
// primaries were built too: #B5D72B #A3E635 #B9F756 #90D627 all sat at 84-95%
// of the boundary, same hue family, average L 0.845.
//
// The chroma fraction is 0.60. Alternatives, if you ever want more lime:
//   0.60  #e0f9ab  <- current. 62% of the boundary, so it keeps real headroom
//   0.80  #dcfc91  clearly lime          (dE 4.57 from current)
//   0.92  #dafe7f  full neon, 92% of the boundary — clips if the seed moves
//                  (dE 2.59 from 0.80, i.e. barely a step for all that headroom)
//
// Contrast is flat across that whole range — 13.69 to 13.81 on the page, 1.94 to
// 1.95 on primary — so the fraction is a pure look decision, not a legibility one.
// 1.95 against primary is a logo allowance; WCAG exempts logotypes. It is not a
// text allowance: never set small text in cottontail on a primary fill.
lift       = foreground.ok_l + span * 2
cottontail = primary.atLightness(lift).atChroma(primary.atLightness(lift).maxChroma() * 0.60)

// Not the logo color, but worth knowing it exists: mirror the darkest shade and
// you land on L 0.845 — exactly the average lightness of those four old limes.
// At 92% of the boundary it is #b7df35, essentially #A3E635. Too close to primary
// for the lockup (1.44) but a real option if you ever want a loud accent.
// old_lime = primary.atLightness(1 - (bl - span)).atChroma(primary.atLightness(1 - (bl - span)).maxChroma() * 0.92)

// ── 7. Live proof ──
// The whole contract in three numbers: the hardest text on the lightest shade,
// the easiest on the darkest, and the shade range itself.
worst_on_lightest = min(
  foreground.srgb.contrastWCAG(background_lightest), tertiary.srgb.contrastWCAG(background_lightest),
  secondary.srgb.contrastWCAG(background_lightest),  primary.srgb.contrastWCAG(background_lightest),
  accent.srgb.contrastWCAG(background_lightest),     success.srgb.contrastWCAG(background_lightest),
  warning.srgb.contrastWCAG(background_lightest),    error.srgb.contrastWCAG(background_lightest),
  info.srgb.contrastWCAG(background_lightest)
)
best_on_darkest = foreground.srgb.contrastWCAG(background_darkest)
shade_range     = background_lightest.ok_l - background_darkest.ok_l
contract_holds  = worst_on_lightest >= 4.5

// ═══════════════════════════════════════════════════════════════════════════
//  LIGHT MODE. Dark above is untouched and remains the brand guide.
//  Every dark token has a `light_` twin; the contract holds in both modes.
// ═══════════════════════════════════════════════════════════════════════════
//
//  SAME PATTERN, OWN HUES. Light is fitted to its own ground instead of
//  inheriting dark's wheel. Dark's green primary on a warm page measured 13.1 dE
//  from the page's own darkened form — it read as a shade of the paper. Orange
//  measures 15.2 in the same spot. That is why the light primary is orange, and
//  it is a measurement, not a preference.
//
//  DERIVED FROM DARK
//    light_bl          foreground.ok_l + span * 2   the top of the dark system
//    page chroma       the same 45.6% gamut fraction the dark seed sits at
//    light_foreground  solved to the SAME body ratio as dark, so modes match
//    light_l           light_foreground.ok_l — mirrors primary sitting at
//                      foreground.ok_l in dark
//    accent            primary - 72     dark's own offset, still legal here
//    tertiary          primary - 120    dark's OLD offset, and light KEEPS it.
//                      Dark has moved to +54 and light cannot follow: on a warm
//                      h80 page the same law leaves exactly one legal arc,
//                      271.5-293, which is where -120 already lands. Nor would
//                      moving help — the binding constraint here is chroma, not
//                      angle. light_u * 1 is 0.0205 against light_foreground's
//                      0.0233 at the same lightness, so the best legal hue in
//                      that arc scores 5.3 dE from the text against this 4.8.
//                      Fixing the light twin means breaking the integer chroma
//                      ranks, which is a bigger decision than this token.
//
//  CHOSEN, WITH THE REASON
//    page hue 80       the derived midpoint 86.47 was too yellow. 80 is also
//                      0.7deg off the old Speed Reader ground.
//    primary 50.47     orange, per the measurement above
//    secondary 190     primary + 180 lands on info — the complement of orange
//                      IS blue. 190 is the centre of the legal teal arc, 50deg
//                      clear of both success and info.
//    warning 110       hue 70 sits 10deg from an h80 page. Nothing between 105
//                      and 115 was free for an amber, so warning is green-gold.

light_bh = 80
light_bl = foreground.ok_l + span * 2
k        = c / OKLCH(bl, 0.02, bh).maxChroma()

light_background = OKLCH(light_bl, OKLCH(light_bl, 0.02, light_bh).maxChroma() * k, light_bh)
light_c          = light_background.ok_c
light_foreground = ensureContrast(OKLCH(0.70, c, (light_bh + 180) % 360), light_background, foreground.srgb.contrastWCAG(background))
light_l          = light_foreground.ok_l

// ── Brand — rank ladder preserved, primary pinned at 55% of its ceiling ──
// TWO chosen hues, and everything else is an offset from primary — same as dark,
// where only the seed is literal. Writing 338.47 and 290.47 out as numbers made
// them look chosen when they are `primary - 72` and `primary - 120`; move the
// primary hue and they would silently stop being those offsets.
light_ph = 50.47   // CHOSEN: orange, per the dE measurement above
light_sh = 190     // CHOSEN: centre of the legal teal arc

// The rank quantum. primary is rank 3 and sits at 55% of the sRGB ceiling AT ITS
// OWN HUE, so the quantum is that fraction over 3. The 0.05 is a probe, not a
// value — maxChroma() reads the boundary at this L and H and ignores the chroma
// it is handed (dark's `k` uses 0.02 the same way).
light_fill      = 0.55
light_u         = OKLCH(light_l, 0.05, light_ph).maxChroma() * light_fill / 3
light_primary   = OKLCH(light_l, light_u * 3, light_ph).gamutMap()
light_secondary = OKLCH(light_l, light_u * 2, light_sh).gamutMap()
light_tertiary  = OKLCH(light_l, light_u * 1, (light_ph - 120 + 360) % 360).gamutMap()
light_accent    = OKLCH(light_l, light_u * 4, (light_ph -  72 + 360) % 360).gamutMap()

// ── States ──
light_success = OKLCH(light_l, light_u * 6, 140).gamutMap()
light_warning = OKLCH(light_l, light_u * 6, 110).gamutMap()
light_error   = OKLCH(light_l, light_u * 6, 30).gamutMap()
light_info    = OKLCH(light_l, light_u * 6, 240).gamutMap()

// ── Ladder — down divides the solved span, up reaches the TINT CEILING ──
// Down is a contrast solve, same shape as dark. The hardest hue flips with
// polarity: error has the least room on a dark page, success on a light one.
//
// Up used to be `1 - light_bl`, and that was the one number in the system with
// no reason behind it. It put the top rung on L 1.0, where the sRGB chroma
// ceiling is zero, so gamutMap stripped the entire page tint and the shade came
// out #FFFFFF — the only colour in the light half with no chroma, reading as a
// hole in the ladder rather than a rung of it. dE from the page went 1.26, 2.59,
// then 8.26: that top jump was a chroma cliff, not a lightness step.
//
// There is no "top of the light system" at L 1.0. The top is wherever the tint
// dies, so up reaches the lightest L at which the page chroma still fits in
// sRGB. Near white the gamut boundary converges on a straight line into
// (L 1, C 0), so one probe fixes its slope and the ceiling is a division —
// no solver needed. Probes from 0.96 to 0.995 all land within 0.0004 of each
// other and produce the identical hex, which is the linearity claim verified.
//
// Answer at this seed: ceiling L 0.9744, light_up 0.0294 against the old 0.055.
// All seven light shades are now OKLCH(L, light_c, 80) — one chroma, one hue,
// only lightness moves, and not one of them needs gamut mapping. dE from the
// page reads 0.63, 1.38, 2.08 going up and 3.08, 6.02, 9.17 going down. The up
// side is quieter than it was, because the reach it used to show WAS the cliff:
// there is only 0.0294 of lightness above the page before the tint leaves sRGB.
light_span  = light_bl - ensureContrast(light_background.atLightness(0.75), light_success, 4.55).ok_l
light_probe = 0.99
light_slope = OKLCH(light_probe, 0.02, light_bh).maxChroma() / (1 - light_probe)
light_up    = 1 - light_c / light_slope - light_bl
light_background_lightest = OKLCH(light_bl + light_up,         light_c, light_bh)
light_background_lighter  = OKLCH(light_bl + light_up * 2/3,   light_c, light_bh)
light_background_light    = OKLCH(light_bl + light_up / 3,     light_c, light_bh)
light_background_dark     = OKLCH(light_bl - light_span / 3,   light_c, light_bh)
light_background_darker   = OKLCH(light_bl - light_span * 2/3, light_c, light_bh)
light_background_darkest  = OKLCH(light_bl - light_span,       light_c, light_bh)

// ── Identity ──
// Dark cottontail pops by being brighter than everything. On paper that route
// is closed, so the light twin pops by CHROMA: one span above the text colour
// at the full ceiling. UI only — focus rings, markers, chart highlights.
light_ct_l       = light_foreground.ok_l + light_span
light_cottontail = OKLCH(light_ct_l, OKLCH(light_ct_l, 0.05, light_ph).maxChroma(), light_ph)

// The mark's pale ears are a FIXED asset colour. Only the disc themes.
mark_ears = cottontail

// ── Proof — the same contract as dark, verified in both modes ──
d_body     = foreground.srgb.contrastWCAG(background)
l_body     = light_foreground.srgb.contrastWCAG(light_background)
l_worst    = min(
  light_foreground.srgb.contrastWCAG(light_background_darkest), light_tertiary.srgb.contrastWCAG(light_background_darkest),
  light_secondary.srgb.contrastWCAG(light_background_darkest),  light_primary.srgb.contrastWCAG(light_background_darkest),
  light_accent.srgb.contrastWCAG(light_background_darkest),     light_success.srgb.contrastWCAG(light_background_darkest),
  light_warning.srgb.contrastWCAG(light_background_darkest),    light_error.srgb.contrastWCAG(light_background_darkest),
  light_info.srgb.contrastWCAG(light_background_darkest)
)
l_contract = l_worst >= 4.5
// The top rung keeps the tint: gamutMap would strip chroma if it were outside
// sRGB, so the mapped chroma coming back intact is the ceiling holding.
l_tint_holds = light_background_lightest.gamutMap().ok_c >= light_c * 0.999

roles {
  background  = light_background
  surface     = light_background_dark
  border      = light_background_darker
  fg          = light_foreground
  primary     = light_primary
  primaryFg   = light_background
  secondary   = light_secondary
  secondaryFg = light_background
  tertiary    = light_tertiary
  tertiaryFg  = light_background
  accent      = light_accent
  accentFg    = light_background

  dark {
    background  = background
    surface     = background_light
    border      = background_lightest
    fg          = foreground
    primary     = primary
    primaryFg   = background
    secondary   = secondary
    secondaryFg = background
    tertiary    = tertiary
    tertiaryFg  = background
    accent      = accent
    accentFg    = background
  }
}

tokens {
  text   = text(15, 1.25)
  space  = space(4)
  radius = radius(8)
  font   = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })
}

component {
  buttons = button({
    variants: [
      { name: "primary",   bg: "primary",   fg: "primary-fg" },
      { name: "secondary", bg: "secondary", fg: "secondary-fg" },
      { name: "accent",    bg: "accent",    fg: "accent-fg" },
      { name: "tertiary",  bg: "tertiary",  fg: "tertiary-fg" },
      { name: "ghost",     bg: "bg",        fg: "fg", border: "fg/67" }
    ],
    sizes: [
      { name: "sm", padY: "1", padX: "3", text: "sm" },
      { name: "md", padY: "2", padX: "4", text: "base" },
      { name: "lg", padY: "3", padX: "5", text: "lg" }
    ],
    states: ["default", "hover", "active", "disabled"]
  })
  panel    = card({ bg: "surface", fg: "fg", radius: "lg", pad: "6", border: "fg/67", title: "Revenue" })
  headings = type([
    { text: "2xl", weight: "bold",     sample: "lilBunnyRabbit" },
    { text: "lg",  weight: "semibold", sample: "This month" },
    { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." },
    { text: "sm",  sample: "Muted caption / table cell" }
  ])
}

preview {
  mode_dark  = ui(background, foreground, primary)
  mode_light = ui(light_background, light_foreground, light_primary)
  logo_dark  = pair(mark_ears, primary)
  logo_light = pair(mark_ears, light_primary)
  shades_d   = palette(background_lightest, background_lighter, background_light, background, background_dark, background_darker, background_darkest)
  shades_l   = palette(light_background_lightest, light_background_lighter, light_background_light, light_background, light_background_dark, light_background_darker, light_background_darkest)
  brand_d    = palette(tertiary, secondary, primary, accent)
  brand_l    = palette(light_tertiary, light_secondary, light_primary, light_accent)
  states_d   = palette(success, warning, error, info)
  states_l   = palette(light_success, light_warning, light_error, light_info)
  body_d     = pair(foreground, background)
  body_l     = pair(light_foreground, light_background)
  pop_d      = pair(cottontail, background)
  pop_l      = pair(light_cottontail, light_background)
  deepest_l  = pair(light_primary, light_background_darkest)
}
```
