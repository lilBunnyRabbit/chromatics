export const name = 'Design System';

export const source = `// ── Design System — colors, tokens and components from one brand color ──
// Change \`brand\`; the palette, the type scale and every component follow.
// Open the Styleguide tab to see it rendered and auto-audited.

brand = hex("#6c5ce7")

// Core colors
background   = OKLCH(0.18, 0.02, brand.ok_h)
surface      = background.lighten(0.06)
foreground   = OKLCH(0.96, 0.012, brand.ok_h)
border       = surface.lighten(0.14)

primary      = OKLCH(0.62, 0.17, brand.ok_h)
primary_fg   = OKLCH(0.99, 0.01, brand.ok_h)
secondary    = OKLCH(0.70, 0.15, (brand.ok_h + 150) % 360)
secondary_fg = OKLCH(0.20, 0.02, (brand.ok_h + 150) % 360)
accent       = OKLCH(0.72, 0.16, (brand.ok_h - 45 + 360) % 360)
accent_fg    = OKLCH(0.20, 0.02, brand.ok_h)

// Map named colors to roles — shareable, and the editor is the source of truth.
roles = theme({
  bg: "background", fg: "foreground", surface: "surface", border: "border",
  primary: "primary", primaryFg: "primary_fg",
  secondary: "secondary", secondaryFg: "secondary_fg",
  accent: "accent", accentFg: "accent_fg"
})

// Design tokens — generators expand the scales (no loops needed).
text   = scale.text(16, 1.25)
space  = scale.space(4)
radius = scale.radius(10)
shadow = scale.shadow(brand)
font   = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })

// Components — color fields take a role/named color (with an optional /opacity);
// size fields take a bare token step ("lg" → radius.lg, "4" → space.4).
button = component.button({
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

card = component.card({
  bg: "surface", fg: "foreground", border: "border",
  radius: "lg", pad: "6", shadow: "md",
  title: "Card title"
})

headings = component.type([
  { text: "3xl", weight: "bold",     sample: "Display heading" },
  { text: "xl",  weight: "semibold", sample: "Section heading" },
  { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." }
])`;
