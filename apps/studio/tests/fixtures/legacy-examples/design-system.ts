export const name = 'Design System';

export const source = `// ── Design System — colors, tokens and components from one brand color ──
// Change \`brand\`; the palette, the type scale and every component follow.
// Open the Design System tab — toggle Light / Dark in its toolbar.

brand = hex("#6c5ce7")

// Light theme — surfaces & text from the brand's hue (perceptual lightness)
background   = OKLCH(0.99, 0.006, brand.ok_h)
surface      = OKLCH(0.965, 0.012, brand.ok_h)
foreground   = OKLCH(0.24, 0.03, brand.ok_h)
border       = OKLCH(0.90, 0.012, brand.ok_h)

primary      = OKLCH(0.55, 0.18, brand.ok_h)
primary_fg   = OKLCH(0.99, 0.01, brand.ok_h)
secondary    = OKLCH(0.58, 0.15, (brand.ok_h + 150) % 360)
secondary_fg = OKLCH(0.99, 0.01, (brand.ok_h + 150) % 360)
accent       = OKLCH(0.60, 0.17, (brand.ok_h - 45 + 360) % 360)
accent_fg    = OKLCH(0.99, 0.01, brand.ok_h)

// Dark surfaces & text — same hues, inverted lightness (primary/accent stay shared)
background_d = OKLCH(0.18, 0.02, brand.ok_h)
surface_d    = background_d.lighten(0.06)
foreground_d = OKLCH(0.96, 0.012, brand.ok_h)
border_d     = surface_d.lighten(0.14)

// Bind theme roles to named colors, with a nested \`dark { }\` re-binding.
// Dark mode is pure role re-binding — both modes share one palette & audit.
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

// Design tokens — one \`tokens { }\` block; generators expand each scale (no loops).
tokens {
  text   = text(16, 1.25)
  space  = space(4)
  radius = radius(10)
  shadow = shadow(brand)
  font   = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })
}

// Components — one \`component { }\` block, called bare (no \`component.\` prefix).
// Use ROLE names (bg, fg, surface, primary…) so components re-theme in dark mode.
component {
  button = button({
    variants: [
      { name: "primary",   bg: "primary",     fg: "primary-fg" },
      { name: "secondary", bg: "secondary",   fg: "secondary-fg" },
      { name: "soft",      bg: "primary/15",  fg: "primary" },
      { name: "ghost",     bg: "bg",          fg: "fg", border: "border" }
    ],
    sizes: [
      { name: "sm", padY: "1", padX: "3", text: "sm" },
      { name: "md", padY: "2", padX: "4", text: "base" },
      { name: "lg", padY: "3", padX: "5", text: "lg" }
    ],
    states: ["default", "hover", "active", "disabled"]
  })

  card = card({
    bg: "surface", fg: "fg", border: "border",
    radius: "lg", pad: "6", shadow: "md",
    title: "Card title"
  })

  headings = type([
    { text: "3xl", weight: "bold",     sample: "Display heading" },
    { text: "xl",  weight: "semibold", sample: "Section heading" },
    { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." }
  ])
}`;
