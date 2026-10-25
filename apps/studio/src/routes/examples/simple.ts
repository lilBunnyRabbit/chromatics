export const name = 'Simple';

export const source = `// Dark mode — change the brand color, the rest follows.
brand = parse("#6c5ce7")

bg      = Oklch(0.17, brand.to(Oklch).c * 0.3, brand.to(Oklch).h)
surface = bg.clone().lighten(0.05)
fg      = Oklch(0.96, 0.012, brand.to(Oklch).h)
muted   = fg.clone().darken(0.32)

// brand is hex, so reach OKLCH explicitly to operate there:
primary = brand.to(Oklch).to(Srgb).gamutMap().to(Oklch)
accent  = brand.to(Oklch).rotateHue(150)

success = Hsl(155, 0.5, 0.55)
error   = parse("#e74c3c")`;
