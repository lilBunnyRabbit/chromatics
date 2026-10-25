export const name = 'Brand Dark';

export const source = `// ── Brand Dark — one seed, two modes, one contract ──
//
// 17 colors per mode: 7 background shades, 1 foreground, 4 brand, 4 states,
// 1 identity. A background is a SHADE, not a role.
//
// The contract: the text is legible on every shade; brand and state colors are
// legible on the page and the surface, and clear WCAG's 3:1 non-text floor on
// every shade below. Dark meets the stronger form for free — every color sits
// at the text's lightness and the ladder is solved against the dimmest of them.
// Paper cannot (see the light half), so there the text, the brand and the
// ladder are each solved for their own part. Every reach is solved, never
// chosen: dark's above the seed (\`span\`), light's below the page
// (\`light_span\`), by the same arithmetic. Light's other direction meets a wall
// before it meets the contract — the ladder runs out at white.
// Everything else is a relationship to the seed.
//
// Channels read off the color itself — \`background.l\` is OKLCH lightness
// because the color IS OKLCH — so every line names the color it depends on.
//
// Verified on the shipped 8-bit hexes. Dark: all 63 color × shade pairs clear
// AA, worst 4.54. Light: text on all 7 shades, worst 4.56; brand on page and
// surface, worst 4.54; every colored cell above 3:1, worst 3.09.

// ── Seed — the only literal color ──
background = Oklch(0.255, 0.0233, 230.47)
foreground = Oklch(1 - background.l, background.c / 3, (background.h + 180) % 360)

// ── Brand — hue is identity, chroma is rank ──
// Hue law: every brand hue sits ≥45° from the neutral and from every other
// brand hue, or it reads as a lit shade of its neighbour. With the neutral at
// 230 that leaves two legal arcs, 167.5–185 and 347.5–5.5. States are
// conventions and sit where culture put them; the nearest brand/state pair is
// 17.5° (primary/success), kept apart by chroma rank — 3c against 6c — not
// by angle.
//
// tertiary is the midpoint of the wide empty arc, the point furthest from both
// of its 45° walls, so it is derived, not picked. It used to be primary − 120:
// a dusty rose 7.2 ΔE from the body text, too close to read as a color, too
// odd not to catch the eye. The midpoint reads 11.9.
//
// Chroma: the seed's chroma is the quantum. primary is rank 3, which forces two
// quieter siblings and one louder. 5c stays empty so the brand band (1–4c) and
// the state band (6c) never touch.
primary   = Oklch(foreground.l, background.c * 3, (foreground.h + 72) % 360)
secondary = Oklch(foreground.l, background.c * 2, (primary.h + 180) % 360)
tertiary  = Oklch(foreground.l, background.c,     (primary.h + background.h) / 2)
accent    = Oklch(foreground.l, background.c * 4, foreground.h)

// ── States — cultural hues at the top of the chroma ladder ──
// The one place a hue is a convention rather than a relationship, so they are
// named: both modes reference them, and light derives two more hues from them.
h_success = 140
h_warning = 70
h_error   = 30
h_info    = 240

success = Oklch(foreground.l, background.c * 6, h_success)
warning = Oklch(foreground.l, background.c * 6, h_warning)
error   = Oklch(foreground.l, background.c * 6, h_error)
info    = Oklch(foreground.l, background.c * 6, h_info)

// ── The contract, as a number ──
// AA is 4.5. The 0.05 on top covers what the rungs' own chroma and the 8-bit
// rounding of the shipped hexes cost between the solve and the screen —
// measured, at most 0.02 in either mode. Every solve in the file targets it.
legible = 4.55

// Every luminance below is WCAG's own, read back from its contrast against
// black: ratio = (Y + 0.05) / 0.05. The package's \`luminance()\` is the exact Y,
// which differs from WCAG's rounded 0.2126 / 0.7152 / 0.0722 in the 5th decimal —
// enough to tip cottontail's blue off a rounding edge. The contract is WCAG's.

// ── Dark ladder reach — SOLVED ──
// WCAG contrast is a ratio of relative luminances, (Yl + 0.05) / (Yd + 0.05),
// so a contrast target inverts into a luminance target with one division, and
// \`set({ Y })\` on an Xyy puts a color on that luminance exactly — Y in xyY IS
// the WCAG luminance. The hardest text is whichever color carries the least
// luminance (error, as it happens, but asked for, not assumed); the lightest
// rung is the seed lifted to where that text still reads \`legible\`. Move the
// seed and this re-solves.
dimmest = min(
  (foreground.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05), (primary.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),   (secondary.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),
  (tertiary.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),   (accent.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),    (success.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),
  (warning.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),    (error.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05),     (info.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05)
)
span = background.to(Xyy).set({ Y: (dimmest + 0.05) / legible - 0.05 }).to(Oklch).l - background.l

// ── Dark ladder — chroma moves in proportion to lightness ──
// Below the gamut cusp that is identical to holding chroma at a fixed fraction
// of the sRGB boundary (they agree to 4 decimals). Lighter shades gain color,
// darker ones lose it, nothing leaves gamut. The seed is the middle rung.
span_c = background.c * span / background.l

background_lightest = background.clone().shift({ l:  span,       c:  span_c })
background_lighter  = background.clone().shift({ l:  span * 2/3, c:  span_c * 2/3 })
background_light    = background.clone().shift({ l:  span / 3,   c:  span_c / 3 })
background_dark     = background.clone().shift({ l: -span / 3,   c: -span_c / 3 })
background_darker   = background.clone().shift({ l: -span * 2/3, c: -span_c * 2/3 })
background_darkest  = background.clone().shift({ l: -span,       c: -span_c })

// ── Identity — the logo, and the brightest color in the system ──
// No single brand mark color: a mid-lightness mark that clears both grounds
// scores ~4.30 / ~3.65, worse on BOTH than picking per ground (primary 7.06 on
// dark, background 13.5 on light). Ship two logos, like everyone else.
//
// cottontail is the one genuinely new identity color: the flash of a rabbit's
// tail and the light half of the lockup. Two spans above the text, or the ears
// stop reading on the disc. Chroma at 60% of the ceiling — contrast is flat
// from 60% to 92% (13.7–13.8 on the page), so the fraction is a look decision
// and 60% keeps headroom if the seed moves. Its 1.96 against primary is a LOGO
// allowance; WCAG exempts logotypes. Never set small text in it. The inline
// Oklch is a ceiling probe, not a color: chroma 0.5 is past every sRGB edge,
// and Okhsl saturation 1 is the edge itself at that lightness and hue.
top        = foreground.l + span * 2
cottontail = primary.clone().set({
  l: top,
  c: Oklch(top, 0.5, primary.h).to(Okhsl).set({ s: 1 }).to(Oklch).c * 0.60
})

// ── Proof ──
d_body     = foreground.to(Srgb).contrast(background.to(Srgb))
d_worst    = min(
  foreground.to(Srgb).contrast(background_lightest.to(Srgb)), tertiary.to(Srgb).contrast(background_lightest.to(Srgb)),
  secondary.to(Srgb).contrast(background_lightest.to(Srgb)),  primary.to(Srgb).contrast(background_lightest.to(Srgb)),
  accent.to(Srgb).contrast(background_lightest.to(Srgb)),     success.to(Srgb).contrast(background_lightest.to(Srgb)),
  warning.to(Srgb).contrast(background_lightest.to(Srgb)),    error.to(Srgb).contrast(background_lightest.to(Srgb)),
  info.to(Srgb).contrast(background_lightest.to(Srgb))
)
d_contract = d_worst >= 4.5

// ═══════════════════════════════════════════════════════════════════════════
//  LIGHT MODE — same pattern, own hues
// ═══════════════════════════════════════════════════════════════════════════
//
// Derived from dark: the page sits at \`top\`, the top of the dark system, at the
// seed's own gamut fraction \`tint\`; the text carries the luminance an 8:1 body
// demands. Both reaches of the ladder use dark's inversion, mirrored — the page
// is the lighter side, so the target multiplies where dark's divides.
//
// What paper cannot mirror is "everything at the text's lightness". At L 0.40
// the sRGB gamut is about half as wide as at dark's 0.745: every brand color
// came out brown, grey or olive, and the contract that costs dark nothing cost
// light every color. So on paper the contract splits by role — the text is
// legible on every shade; brand and states on the page and the surface, with
// WCAG's 3:1 non-text floor below — and the brand sits at its own solved
// lightness, above the text.
//
// The page hue is the midpoint of the two hues dark is built around, the
// text's (also accent's) and the primary's — the only two candidates for a
// light primary on a warm ground. The page used to have to choose: a green
// reads as paper below hue 82, an orange above it. At the midpoint the page is
// 36° from each, the furthest a hue between them can be from both, so neither
// reads as paper (12.8 ΔE for the orange against the page's darkened form,
// 11.8 for the green) and the relationship decides. The complement wins, and
// the complement is orange.
light_bh         = (foreground.h + primary.h) / 2
tint             = background.c / Oklch(background.l, 0.5, background.h).to(Okhsl).set({ s: 1 }).to(Oklch).c
light_background = Oklch(top, Oklch(top, 0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)

// The text sits on the page's complement at exactly the luminance an 8:1 body
// demands — past AAA with margin, and darker than dark's inherited 6.92 on
// purpose: the text alone sizes the ladder, so its body ratio is also the
// depth. Setting Y moves along the page's chromaticity, so the probe
// answers only "which lightness carries that luminance on this hue"; the
// chroma is then stated, the seed's, as in dark.
light_foreground = Oklch(
  light_background.clone().complement().to(Xyy).set({
    Y: ((light_background.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05) + 0.05) / 8 - 0.05
  }).to(Oklch).l,
  background.c,
  (light_bh + 180) % 360
)

// ── Light ladder — one chroma rule, two reaches, the page in the middle ──
// Dark's rule is "chroma in proportion to lightness"; below the cusp that is
// the same as holding a fixed fraction of the sRGB boundary. Above the cusp —
// where the page is — only the second reading survives: proportional chroma
// stays nearly flat (the shades blended) while the boundary collapses to
// nothing at white. So every rung holds the seed's gamut fraction \`tint\` of the
// chroma available at ITS lightness, and the page is that formula's middle
// rung, as the seed is in dark.
//
// Two reaches, neither chosen. Up, the limit is a wall: white, where the ceiling
// is zero and the top rung comes out tintless on its own. Down, the limit is
// the contract: the ladder descends until the text reads \`legible\`, the mirror
// of dark's \`span\`. Steps 3.2 · 2.9 · 2.7 above, 8.3 · 6.1 · 4.9 below — the
// page sits near white, so the only depth a light ladder can have is below it.
light_span = top - light_background.to(Xyy).set({ Y: legible * ((light_foreground.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05) + 0.05) - 0.05 }).to(Oklch).l
light_up   = 1 - top

light_background_lightest = Oklch(top + light_up,         Oklch(top + light_up,         0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)
light_background_lighter  = Oklch(top + light_up * 2/3,   Oklch(top + light_up * 2/3,   0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)
light_background_light    = Oklch(top + light_up / 3,     Oklch(top + light_up / 3,     0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)
light_background_dark     = Oklch(top - light_span / 3,   Oklch(top - light_span / 3,   0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)
light_background_darker   = Oklch(top - light_span * 2/3, Oklch(top - light_span * 2/3, 0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)
light_background_darkest  = Oklch(top - light_span,       Oklch(top - light_span,       0.5, light_bh).to(Okhsl).set({ s: 1 }).to(Oklch).c * tint, light_bh)

// ── Light brand — the same rank ladder, refitted to paper ──
// Dark's quantum is its seed's chroma. Light's seed is the page, so its quantum
// is the page's chroma; the ranks are dark's. Not one hue is a literal: primary
// sits on foreground.h — the seed's complement, the angle dark's accent takes —
// accent keeps dark's 72° from primary on the other side, and the rest are
// midpoints.
//
// Lightness is SOLVED, against the surface: the brand sits where its loudest
// color still reads \`legible\` on \`light_background_dark\`. Two solves, because
// luminance depends on hue. \`light_nl\` is where a color on the page's own
// chromaticity reads legible — where a neutral would sit. Green carries more
// luminance per unit of lightness than any hue (h_success is the sRGB green
// primary's own angle), so a rank-6 green is the loudest thing in the set;
// \`light_bl\` reruns the solve on that probe, placed at the neutral's answer so
// its chroma survives the rescale. Everything colorful shares that lightness.
//
// tertiary is rank 1 on the midpoint of the text and accent hues — 36° from
// each, dark's "furthest from both walls" rule, in the one arc a warm page
// leaves open. 9.5 ΔE from the text; at the text's own lightness it read 3.7.
light_u  = light_background.c
light_y  = ((light_background_dark.to(Srgb).contrast(Srgb(0, 0, 0)) * 0.05 - 0.05) + 0.05) / legible - 0.05
light_nl = light_background_dark.to(Xyy).set({ Y: light_y }).to(Oklch).l
light_bl = Oklch(light_nl, light_u * 6, h_success).to(Xyy).set({ Y: light_y }).to(Oklch).l

light_primary   = Oklch(light_bl, light_u * 3, foreground.h).to(Srgb).gamutMap().to(Oklch)
light_accent    = Oklch(light_bl, light_u * 4, (foreground.h - 72 + 360) % 360).to(Srgb).gamutMap().to(Oklch)
// primary + 180 would land on info, so secondary takes the centre of the legal
// teal arc — the midpoint of success and info, 50° clear of both.
light_secondary = Oklch(light_bl, light_u * 2, (h_success + h_info) / 2).to(Srgb).gamutMap().to(Oklch)
light_tertiary  = Oklch(light_bl, light_u,     (light_foreground.h + light_accent.h) / 2).to(Srgb).gamutMap().to(Oklch)

// warning cannot keep dark's 70: it sits 16° off the page. The midpoint of the
// page and success clears both by 26.8° — a green-gold, forced not chosen.
// Rank 6 sits above the sRGB ceiling on that hue and on info's, so for those
// two rank 6 means the ceiling: gamutMap holds lightness and hue and gives up
// the chroma that does not fit.
light_success = Oklch(light_bl, light_u * 6, h_success).to(Srgb).gamutMap().to(Oklch)
light_warning = Oklch(light_bl, light_u * 6, (light_bh + h_success) / 2).to(Srgb).gamutMap().to(Oklch)
light_error   = Oklch(light_bl, light_u * 6, h_error).to(Srgb).gamutMap().to(Oklch)
light_info    = Oklch(light_bl, light_u * 6, h_info).to(Srgb).gamutMap().to(Oklch)

// ── Light identity ──
// Dark cottontail pops by being brighter than everything; on paper that route
// is closed, so the light twin pops by CHROMA — full ceiling, two up-strides
// above the text, the offset dark's \`top\` takes from its own text. The up
// stride, not the solved one: two of those would lift it past the page's
// non-text floor. Here it clears 3:1 on every rung (3.08 on the darkest) and
// AA on the page (5.43). Boxed in: the brand sits 0.03 below it, the darkest
// rung's floor just above — primary's louder twin, not a color of its own.
// UI only: focus rings, markers, chart highlights. The mark's pale ears stay
// \`cottontail\` in both modes; only the disc themes.
light_cottontail = light_primary.clone().set({
  l: light_foreground.l + light_up * 2,
  c: Oklch(light_foreground.l + light_up * 2, 0.5, foreground.h).to(Okhsl).set({ s: 1 }).to(Oklch).c
})

// ── Proof — the contract, one line per part ──
l_body     = light_foreground.to(Srgb).contrast(light_background.to(Srgb))
l_text     = light_foreground.to(Srgb).contrast(light_background_darkest.to(Srgb))
l_brand    = min(
  light_primary.to(Srgb).contrast(light_background_dark.to(Srgb)), light_tertiary.to(Srgb).contrast(light_background_dark.to(Srgb)),
  light_accent.to(Srgb).contrast(light_background_dark.to(Srgb)),  light_secondary.to(Srgb).contrast(light_background_dark.to(Srgb)),
  light_success.to(Srgb).contrast(light_background_dark.to(Srgb)), light_warning.to(Srgb).contrast(light_background_dark.to(Srgb)),
  light_error.to(Srgb).contrast(light_background_dark.to(Srgb)),   light_info.to(Srgb).contrast(light_background_dark.to(Srgb))
)
l_floor    = min(
  light_primary.to(Srgb).contrast(light_background_darkest.to(Srgb)), light_tertiary.to(Srgb).contrast(light_background_darkest.to(Srgb)),
  light_accent.to(Srgb).contrast(light_background_darkest.to(Srgb)),  light_secondary.to(Srgb).contrast(light_background_darkest.to(Srgb)),
  light_success.to(Srgb).contrast(light_background_darkest.to(Srgb)), light_warning.to(Srgb).contrast(light_background_darkest.to(Srgb)),
  light_error.to(Srgb).contrast(light_background_darkest.to(Srgb)),   light_info.to(Srgb).contrast(light_background_darkest.to(Srgb))
)
l_contract = l_text >= 4.5 && l_brand >= 4.5 && l_floor >= 3
// Widest step over narrowest. The down strides are about three times the up
// ones — the depth trade — so this sits near 3.0 while each side on its own
// tapers monotonically.
l_step1 = light_background_lightest.to(Lab65).deltaE2000(light_background_lighter.to(Lab65))
l_step2 = light_background_lighter.to(Lab65).deltaE2000(light_background_light.to(Lab65))
l_step3 = light_background_light.to(Lab65).deltaE2000(light_background.to(Lab65))
l_step4 = light_background.to(Lab65).deltaE2000(light_background_dark.to(Lab65))
l_step5 = light_background_dark.to(Lab65).deltaE2000(light_background_darker.to(Lab65))
l_step6 = light_background_darker.to(Lab65).deltaE2000(light_background_darkest.to(Lab65))
l_even  = max(l_step1, l_step2, l_step3, l_step4, l_step5, l_step6) /
          min(l_step1, l_step2, l_step3, l_step4, l_step5, l_step6)

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
  ui_d      = ui(background, foreground, primary)
  ui_l      = ui(light_background, light_foreground, light_primary)
  logo_d    = pair(cottontail, primary)
  logo_l    = pair(cottontail, light_primary)
  shades_d  = palette(background_lightest, background_lighter, background_light, background, background_dark, background_darker, background_darkest)
  shades_l  = palette(light_background_lightest, light_background_lighter, light_background_light, light_background, light_background_dark, light_background_darker, light_background_darkest)
  brand_d   = palette(tertiary, secondary, primary, accent)
  brand_l   = palette(light_tertiary, light_secondary, light_primary, light_accent)
  states_d  = palette(success, warning, error, info)
  states_l  = palette(light_success, light_warning, light_error, light_info)
  text_d    = pair(foreground, background)
  text_l    = pair(light_foreground, light_background)
  pop_d     = pair(cottontail, background)
  pop_l     = pair(light_cottontail, light_background)
  surface_l = pair(light_primary, light_background_dark)
  deepest_l = pair(light_primary, light_background_darkest)
}`;
