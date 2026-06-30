export const name = 'microSaaS Dashboard';

export const source = `// ── microSaaS Dashboard — light + dark from ONE brand color ──
// Change "brand" and the whole system re-derives. The brand triad, semantics and
// tokens are shared; dark mode re-binds only the neutrals. Toggle Light / Dark in
// the Styleguide toolbar.
//
//   Inspector — watch the cascade      Validate — WCAG/APCA audit (passes AA)
//   Styleguide — toggle Light / Dark   Export   — CSS variables & Tailwind

brand = hex("#4f46e5")        // the one knob. Try #0ea5e9 / #16a34a / #db2777

// Brand triad — one anchor, vary ONLY the hue; shared by both themes. OKLCH keeps
// both lightness and chroma equal (no gamutMap); culori maps each hue at display.
primary   = OKLCH(0.55, brand.ok_c, brand.ok_h)
secondary = primary.rotateHue(150)
accent    = primary.rotateHue(-60)

// Semantic states — hue carries the meaning, lightness tuned per hue; shared.
success = OKLCH(0.62, 0.15, 150)
warning = OKLCH(0.78, 0.15, 85)
danger  = OKLCH(0.55, 0.19, 27)
info    = OKLCH(0.58, 0.15, 250)

// Auto-pick each filled button's label from its fill (same in both themes).
ink   = OKLCH(0.20, 0.02, brand.ok_h)
paper = OKLCH(0.99, 0.004, brand.ok_h)
primary_fg   = paper.srgb.contrastWCAG(primary)   >= 4.5 ? paper : ink
secondary_fg = paper.srgb.contrastWCAG(secondary) >= 4.5 ? paper : ink
accent_fg    = paper.srgb.contrastWCAG(accent)    >= 4.5 ? paper : ink
success_fg   = paper.srgb.contrastWCAG(success)   >= 4.5 ? paper : ink
danger_fg    = paper.srgb.contrastWCAG(danger)    >= 4.5 ? paper : ink

// Light neutrals (the base mapping) — brand-tinted, page < cards < ink.
background = OKLCH(0.965, 0.005, brand.ok_h)
surface    = OKLCH(0.999, 0.002, brand.ok_h)
border     = OKLCH(0.90,  0.008, brand.ok_h)
foreground = OKLCH(0.27,  0.02,  brand.ok_h)

// Dark neutrals — same hue, lightness ladder inverted.
background_d = OKLCH(0.17, 0.012, brand.ok_h)
surface_d    = OKLCH(0.21, 0.016, brand.ok_h)
border_d     = OKLCH(0.32, 0.016, brand.ok_h)
foreground_d = OKLCH(0.96, 0.012, brand.ok_h)

// Live a11y checks for both themes (booleans in the Inspector).
text_aa_light = foreground.srgb.contrastWCAG(background) >= 4.5
text_aa_dark  = foreground_d.srgb.contrastWCAG(background_d) >= 4.5

// Roles: base = light; the nested dark { } re-binds only the neutrals. The brand
// triad + semantics are shared, so both modes ride one palette and one audit.
roles {
  bg          = background
  fg          = foreground
  surface     = surface
  border      = border
  primary     = primary
  primaryFg   = primary_fg
  secondary   = secondary
  secondaryFg = secondary_fg
  accent      = accent
  accentFg    = accent_fg

  dark {
    bg      = background_d
    fg      = foreground_d
    surface = surface_d
    border  = border_d
  }
}

// Non-color tokens — shared across both themes.
tokens {
  text   = text(15, 1.25)
  space  = space(4)
  radius = radius(8)
  shadow = shadow(brand)
  font   = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })
}

// Components use ROLE names (bg, fg, surface, primary…) so they re-theme in dark.
component {
  button = button({
    variants: [
      { name: "primary",   bg: "primary",   fg: "primary-fg" },
      { name: "secondary", bg: "secondary", fg: "secondary-fg" },
      { name: "success",   bg: "success",   fg: "success_fg" },
      { name: "danger",    bg: "danger",    fg: "danger_fg" },
      { name: "ghost",     bg: "surface",   fg: "fg" }
    ],
    sizes: [
      { name: "sm", padY: "1", padX: "3", text: "sm" },
      { name: "md", padY: "2", padX: "4", text: "base" },
      { name: "lg", padY: "3", padX: "5", text: "lg" }
    ],
    states: ["default", "hover", "active"]
  })

  card = card({
    bg: "surface", fg: "fg",
    radius: "lg", pad: "6", shadow: "sm",
    title: "Revenue"
  })

  headings = type([
    { text: "2xl", weight: "bold",     sample: "Dashboard" },
    { text: "lg",  weight: "semibold", sample: "This month" },
    { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." },
    { text: "sm",  sample: "Muted caption / table cell" }
  ])
}

// Relationships, visualized (Preview tab).
preview {
  states = palette(primary, success, warning, danger, info)
  tones  = ramp(primary, "oklch")
  cta    = pair(primary_fg, primary)
  body   = pair(foreground, background)
  app    = ui(background, foreground, primary)
}`;
