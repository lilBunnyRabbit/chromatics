export const name = 'Simple';

export const source = `// Dark mode — change the brand color, the rest follows.
brand = hex("#6c5ce7")

bg      = OKLCH(0.17, brand.ok_c * 0.3, brand.ok_h)
surface = bg.lighten(0.05)
fg      = OKLCH(0.96, 0.012, brand.ok_h)
muted   = fg.darken(0.32)

// brand is hex, so reach OKLCH explicitly to operate there:
primary = brand.oklch.gamutMap()
accent  = brand.oklch.rotate(150)

success = HSL(155, 0.5, 0.55)
error   = hex("#e74c3c")`;
