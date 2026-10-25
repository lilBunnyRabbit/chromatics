export const name = 'microSaaS Dashboard';

export const source = `// ── microSaaS Dashboard — light + dark from ONE brand color ──
// Change "brand" and the whole system re-derives. The brand triad, semantics and
// tokens are shared; dark mode re-binds only the neutrals. Toggle Light / Dark in
// the Styleguide toolbar.
//
//   Inspector — watch the cascade      Validate — WCAG/APCA audit (passes AA)
//   Styleguide — toggle Light / Dark   Export   — CSS variables & Tailwind

brand = parse("#4f46e5")        // the one knob. Try #0ea5e9 / #16a34a / #db2777

// Brand triad — one anchor, vary ONLY the hue; shared by both themes. OKLCH keeps
// both lightness and chroma equal (no gamutMap); culori maps each hue at display.
primary   = Oklch(0.55, brand.to(Oklch).c, brand.to(Oklch).h)
secondary = primary.clone().rotateHue(150)
accent    = primary.clone().rotateHue(-60)

// Semantic states — hue carries the meaning, lightness tuned per hue; shared.
success = Oklch(0.62, 0.15, 150)
warning = Oklch(0.78, 0.15, 85)
danger  = Oklch(0.55, 0.19, 27)
info    = Oklch(0.58, 0.15, 250)

// Auto-pick each filled button's label from its fill (same in both themes).
ink   = Oklch(0.20, 0.02, brand.to(Oklch).h)
paper = Oklch(0.99, 0.004, brand.to(Oklch).h)
primary_fg   = paper.to(Srgb).contrast(primary.to(Srgb))   >= 4.5 ? paper : ink
secondary_fg = paper.to(Srgb).contrast(secondary.to(Srgb)) >= 4.5 ? paper : ink
accent_fg    = paper.to(Srgb).contrast(accent.to(Srgb))    >= 4.5 ? paper : ink
success_fg   = paper.to(Srgb).contrast(success.to(Srgb))   >= 4.5 ? paper : ink
danger_fg    = paper.to(Srgb).contrast(danger.to(Srgb))    >= 4.5 ? paper : ink

// Light neutrals (the base mapping) — brand-tinted, page < cards < ink.
background = Oklch(0.965, 0.005, brand.to(Oklch).h)
surface    = Oklch(0.999, 0.002, brand.to(Oklch).h)
border     = Oklch(0.90, 0.008, brand.to(Oklch).h)
foreground = Oklch(0.27, 0.02, brand.to(Oklch).h)

// Dark neutrals — same hue, lightness ladder inverted.
background_d = Oklch(0.17, 0.012, brand.to(Oklch).h)
surface_d    = Oklch(0.21, 0.016, brand.to(Oklch).h)
border_d     = Oklch(0.32, 0.016, brand.to(Oklch).h)
foreground_d = Oklch(0.96, 0.012, brand.to(Oklch).h)

// Live a11y checks for both themes (booleans in the Inspector).
text_aa_light = foreground.to(Srgb).contrast(background.to(Srgb)) >= 4.5
text_aa_dark  = foreground_d.to(Srgb).contrast(background_d.to(Srgb)) >= 4.5

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
  tones  = ramp(primary, Oklch)
  cta    = pair(primary_fg, primary)
  body   = pair(foreground, background)
  app    = ui(background, foreground, primary)
}`;
