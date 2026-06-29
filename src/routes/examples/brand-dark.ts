export const name = 'Brand Dark';

export const source = `// ── Brand Dark — dark teal, with the background chroma study ──
// Each background step is rendered in 3 chroma modes:
//   sat  (+chroma)  · flat (no chroma) · desat (-chroma)
// Lighter surfaces gain color (elevated), darker ones lose it (receding).

// ── Source ──
background = OKLCH(0.255, 0.0233, 230.47)

// ── Core (each defined by a relationship) ──
foreground = OKLCH(1 - background.ok_l, background.ok_c / 3, (background.ok_h + 180) % 360)
primary    = OKLCH(foreground.ok_l, background.ok_c * 3, (foreground.ok_h + 72) % 360)
secondary  = primary.derive({ h: (primary.ok_h + 180) % 360 })
accent     = primary.derive({ h: foreground.ok_h })

// ── Background scale: lightness step × chroma mode ──
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

// ── Semantic (primary lightness, double chroma, fixed hues) ──
success = OKLCH(primary.ok_l, primary.ok_c * 2, 140)
warning = OKLCH(primary.ok_l, primary.ok_c * 2, 70)
error   = OKLCH(primary.ok_l, primary.ok_c * 2, 30)
info    = OKLCH(primary.ok_l, primary.ok_c * 2, 240)

// ── Harmony ──
triad_a = primary.shift({ h: -120 })
triad_b = primary.shift({ h:  120 })
split_a = primary.shift({ h:  150 })
split_b = primary.shift({ h:  210 })

// ── Hue rotation ring ──
hue_45  = OKLCH(primary.ok_l, primary.ok_c, (primary.ok_h + 45) % 360)
hue_90  = OKLCH(primary.ok_l, primary.ok_c, (primary.ok_h + 90) % 360)
hue_135 = OKLCH(primary.ok_l, primary.ok_c, (primary.ok_h + 135) % 360)
hue_225 = OKLCH(primary.ok_l, primary.ok_c, (primary.ok_h + 225) % 360)
hue_270 = OKLCH(primary.ok_l, primary.ok_c, (primary.ok_h + 270) % 360)
hue_315 = OKLCH(primary.ok_l, primary.ok_c, (primary.ok_h + 315) % 360)`;
