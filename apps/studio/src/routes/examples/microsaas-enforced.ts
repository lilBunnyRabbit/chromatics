export const name = 'microSaaS — Enforced';

export const source = `// ── microSaaS Dashboard — ENFORCED legibility ──────────────────────────
// The same one-brand-color system, but no foreground is hand-tuned-and-hoped:
// each is DEFINED by ensureContrast(seed, bg, target) — the nearest color that
// meets WCAG on its background, re-solved on every edit. Drag "brand" anywhere
// and body text stays AAA, every button label stays AA, in BOTH themes.
// A "paper ? : ink" ternary only picks the better of two fixed options — which
// can still ship an illegible label. This can't.
//
//   Inspector — the *_AA / *_AAA proofs stay TRUE   Validate — WCAG/APCA audit
//   Styleguide — toggle Light / Dark                Export — CSS vars & Tailwind

brand = parse("#4f46e5")        // the one knob. Try #0ea5e9 / #16a34a / #db2777

// Brand triad — vary ONLY the hue; shared by both themes.
primary   = Oklch(0.55, brand.to(Oklch).c, brand.to(Oklch).h)
secondary = primary.clone().rotateHue(150)
accent    = primary.clone().rotateHue(-60)

// Semantic fills — hue carries meaning, lightness tuned per hue; shared.
success = Oklch(0.62, 0.15, 150)
warning = Oklch(0.78, 0.15, 85)
danger  = Oklch(0.55, 0.19, 27)
info    = Oklch(0.58, 0.15, 250)

// Button labels: seed from paper; ensureContrast keeps it light where the fill
// is dark and flips it dark where the fill is light — always clearing AA.
paper = Oklch(0.99, 0.004, brand.to(Oklch).h)
ink   = Oklch(0.20, 0.02, brand.to(Oklch).h)
primary_fg   = ensureContrast(paper, primary,   "AA")
secondary_fg = ensureContrast(paper, secondary, "AA")
accent_fg    = ensureContrast(paper, accent,    "AA")
success_fg   = ensureContrast(paper, success,   "AA")
danger_fg    = ensureContrast(paper, danger,    "AA")

// Neutrals: the page & cards are free design choices; the TEXT on them is
// enforced. Body clears AAA, muted clears AA — hue preserved either way.
background = Oklch(0.965, 0.005, brand.to(Oklch).h)
surface    = Oklch(0.999, 0.002, brand.to(Oklch).h)
border     = Oklch(0.90, 0.008, brand.to(Oklch).h)
foreground = ensureContrast(ink, background, "AAA")
muted      = ensureContrast(Oklch(0.55, 0.02, brand.to(Oklch).h), surface, "AA")

// Dark neutrals — same hue; the body text re-solves light against the dark page.
background_d = Oklch(0.17, 0.012, brand.to(Oklch).h)
surface_d    = Oklch(0.21, 0.016, brand.to(Oklch).h)
border_d     = Oklch(0.32, 0.016, brand.to(Oklch).h)
foreground_d = ensureContrast(paper, background_d, "AAA")

// Proof — these stay TRUE wherever you drag the brand (booleans in the Inspector).
body_AAA_light = foreground.to(Srgb).contrast(background.to(Srgb)) >= 7
body_AAA_dark  = foreground_d.to(Srgb).contrast(background_d.to(Srgb)) >= 7
cta_AA         = primary_fg.to(Srgb).contrast(primary.to(Srgb)) >= 4.5
danger_AA      = danger_fg.to(Srgb).contrast(danger.to(Srgb)) >= 4.5

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

// Components use ROLE names so they re-theme in dark mode.
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
  states  = palette(primary, success, warning, danger, info)
  tones   = ramp(primary, Oklch)
  cta     = pair(primary_fg, primary)
  body    = pair(foreground, background)
  caption = pair(muted, surface)
  app     = ui(background, foreground, primary)
}`;
