export const name = 'Brand Dark';

export const source = `// ── Brand Dark — one teal seed, a 19-step surface study, a whole dark system ──
// There is exactly ONE literal color below. Everything else is a RELATIONSHIP:
// invert it, third it, triple it, rotate it. Move the seed and the neutrals,
// brand, semantics, harmony, roles and components all re-derive together.
//
//   Inspector — watch the cascade      Validate — WCAG + APCA audit
//   Design System — roles → handoff    Export — CSS variables & Tailwind
//
// Dark-only by design: the seed IS the page. There is no dark { } re-binding.

// ── 1. Source ──
background = OKLCH(0.255, 0.0233, 230.47)

// ── 2. Core — every line states a relationship, never a value ──
foreground = OKLCH(1 - background.ok_l, background.ok_c / 3, (background.ok_h + 180) % 360)
primary    = OKLCH(foreground.ok_l, background.ok_c * 3, (foreground.ok_h + 72) % 360)
secondary  = primary.complement()
accent     = primary.derive({ h: foreground.ok_h })

// ── 3. Surface ladder — lightness step × chroma mode ──
// ONE ratio couples the two axes: the chroma shift scales with the lightness
// shift, so a bigger step is also a bolder step. Three modes per step:
//
//   sat   (+chroma) — lighter surfaces are ELEVATED, they catch light
//   flat  ( chroma) — neutral, utilitarian
//   desat (-chroma) — darker surfaces RECEDE, shadows lose saturation
//
// Run sat upward and desat downward and depth comes for free. Evidence it is not
// just taste: bg_darkest_sat is the only color in this file that leaves sRGB —
// chroma you cannot see, clipped at display. Check its Inspector gamut badge.

lStep = 0.11
cStep = 0.01

bg_lightest_sat   = background.shift({ l:  lStep,       c:  cStep })
bg_lightest_flat  = background.shift({ l:  lStep })
bg_lightest_desat = background.shift({ l:  lStep,       c: -cStep })
bg_lighter_sat    = background.shift({ l:  lStep * 2/3, c:  cStep * 2/3 })
bg_lighter_flat   = background.shift({ l:  lStep * 2/3 })
bg_lighter_desat  = background.shift({ l:  lStep * 2/3, c: -cStep * 2/3 })
bg_light_sat      = background.shift({ l:  lStep / 3,   c:  cStep / 3 })
bg_light_flat     = background.shift({ l:  lStep / 3 })
bg_light_desat    = background.shift({ l:  lStep / 3,   c: -cStep / 3 })
bg_dark_sat       = background.shift({ l: -lStep / 3,   c:  cStep / 3 })
bg_dark_flat      = background.shift({ l: -lStep / 3 })
bg_dark_desat     = background.shift({ l: -lStep / 3,   c: -cStep / 3 })
bg_darker_sat     = background.shift({ l: -lStep * 2/3, c:  cStep * 2/3 })
bg_darker_flat    = background.shift({ l: -lStep * 2/3 })
bg_darker_desat   = background.shift({ l: -lStep * 2/3, c: -cStep * 2/3 })
bg_darkest_sat    = background.shift({ l: -lStep,       c:  cStep })
bg_darkest_flat   = background.shift({ l: -lStep })
bg_darkest_desat  = background.shift({ l: -lStep,       c: -cStep })

// ── 4. Semantics — primary's lightness, double chroma, meaning in the hue ──
success = OKLCH(primary.ok_l, primary.ok_c * 2, 140)
warning = OKLCH(primary.ok_l, primary.ok_c * 2, 70)
error   = OKLCH(primary.ok_l, primary.ok_c * 2, 30)
info    = OKLCH(primary.ok_l, primary.ok_c * 2, 240)

// ── 5. Harmony off primary ──
triad_a = primary.shift({ h: -120 })
triad_b = primary.shift({ h:  120 })
split_a = primary.shift({ h:  150 })
split_b = primary.shift({ h:  210 })

// ── 6. Hue ring — primary at every 45°, skipping 0 (primary) and 180 (secondary) ──
hue_45  = primary.rotate(45)
hue_90  = primary.rotate(90)
hue_135 = primary.rotate(135)
hue_225 = primary.rotate(225)
hue_270 = primary.rotate(270)
hue_315 = primary.rotate(315)

// ── 7. Ink — one label color for every filled surface ──
// Every brand and semantic color above sits at L 0.745, so anything written on
// them has to be dark. Guard the HARDEST case and the rest follow: error is the
// darkest fill in the set, so an ink that clears AAA on error clears them all.
// ensureContrast walks OKLCH lightness (then chroma), keeps the hue, and
// re-solves on every edit — the label stays legible when you move the seed.
ink = ensureContrast(bg_darkest_desat, error, "AAA")

// ...and prove it instead of trusting it — the worst label contrast across every
// filled surface, as one number to watch.
worst_label = min(
  ink.srgb.contrastWCAG(primary), ink.srgb.contrastWCAG(secondary),
  ink.srgb.contrastWCAG(accent),  ink.srgb.contrastWCAG(triad_b),
  ink.srgb.contrastWCAG(success), ink.srgb.contrastWCAG(warning),
  ink.srgb.contrastWCAG(error),   ink.srgb.contrastWCAG(info)
)
labels_aaa = worst_label >= 7

// ── 8. Body text — the ratios themselves, not just a verdict ──
// AA wants 4.5, AAA wants 7. At this seed body lands just under AAA; nudge
// foreground's lightness (it is 1 - background.ok_l) and watch both move.
body_on_bg      = foreground.srgb.contrastWCAG(background)
body_on_surface = foreground.srgb.contrastWCAG(bg_light_sat)
body_aa         = min(body_on_bg, body_on_surface) >= 4.5

// ── 9. Roles — the surface ladder does the semantic work ──
// bg is the seed, surface is one step up (sat, so cards read as elevated),
// border is three steps up flat. tertiary borrows from the harmony set.
roles {
  bg          = background
  surface     = bg_light_sat
  border      = bg_lightest_flat
  fg          = foreground
  primary     = primary
  primaryFg   = ink
  secondary   = secondary
  secondaryFg = ink
  tertiary    = triad_b
  tertiaryFg  = ink
  accent      = accent
  accentFg    = ink
}

// ── 10. Non-color tokens ──
// The opacity group mirrors the live --op-* sliders in Preview, which already
// default to exactly these four values. Reference them from any component ref
// Tailwind-style: fg/muted, fg/disabled, primary/30. The audit measures the
// muted and disabled text pairs for you.
tokens {
  text    = text(15, 1.25)
  space   = space(4)
  radius  = radius(8)
  shadow  = shadow(bg_darkest_desat)
  font    = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })
  opacity = token("opacity", { hover: 0.85, active: 0.7, muted: 0.65, disabled: 0.38 })
}

// ── 11. Components — bound to ROLE names, so they follow the roles above ──
component {
  button = button({
    variants: [
      { name: "primary",   bg: "primary",   fg: "primary-fg" },
      { name: "secondary", bg: "secondary", fg: "secondary-fg" },
      { name: "tertiary",  bg: "tertiary",  fg: "tertiary-fg" },
      { name: "accent",    bg: "accent",    fg: "accent-fg" },
      { name: "success",   bg: "success",   fg: "ink" },
      { name: "error",     bg: "error",     fg: "ink" },
      { name: "ghost",     bg: "surface",   fg: "fg", border: "border" }
    ],
    sizes: [
      { name: "sm", padY: "1", padX: "3", text: "sm" },
      { name: "md", padY: "2", padX: "4", text: "base" },
      { name: "lg", padY: "3", padX: "5", text: "lg" }
    ],
    states: ["default", "hover", "active", "disabled"]
  })

  panel = card({
    bg: "surface", fg: "fg",
    radius: "lg", pad: "6", shadow: "sm", border: "border",
    title: "Revenue"
  })

  muted_panel = card({
    bg: "bg", fg: "fg/muted",
    radius: "md", pad: "5", border: "border",
    title: "Secondary panel"
  })

  headings = type([
    { text: "2xl", weight: "bold",     sample: "Brand Dark" },
    { text: "lg",  weight: "semibold", sample: "This month" },
    { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." },
    { text: "sm",  sample: "Muted caption / table cell" }
  ])
}

// ── 12. Relationships, visualized (Preview tab) ──
preview {
  brand    = palette(primary, secondary, accent, triad_a, triad_b, split_a, split_b)
  states   = palette(success, warning, error, info)
  wheel    = harmony(primary, "split", "oklch")
  tones    = ramp(primary, "oklch")
  depth    = gradient(bg_darkest_desat, bg_lightest_sat, { space: "oklch", stops: 7 })
  body     = pair(foreground, background)
  cta      = pair(ink, primary)
  ladder   = grid(background, bg_light_sat, bg_lighter_sat, bg_lightest_sat, foreground, primary)
  app      = ui(background, foreground, primary)
}`;
