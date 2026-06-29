export const name = 'Brand Light';

export const source = `// ── Brand Light — warm cream, with the background chroma study ──
// A high-lightness, low-chroma base. Darker surfaces gain warmth,
// lighter ones fade toward white — same sat / flat / desat study.

// ── Source (warm cream) ──
background = OKLCH(0.96, 0.018, 85)

// ── Core ──
foreground = OKLCH(background.ok_l / 2, background.ok_c, (background.ok_h + 155) % 360)
primary    = OKLCH((background.ok_l + foreground.ok_l) / 2, foreground.ok_c * 5, (background.ok_h - 25 + 360) % 360)
secondary  = primary.derive({ h: (primary.ok_h + 180) % 360 })
accent     = primary.derive({ h: (primary.ok_h - 90 + 360) % 360 })

// ── Background scale: lightness step × chroma mode (tighter, near L=1) ──
lStep = 0.035
cStep = lStep * 0.15

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

// ── Semantic ──
success = OKLCH(primary.ok_l, primary.ok_c * 2, 145)
warning = OKLCH(primary.ok_l, primary.ok_c * 2, 75)
error   = OKLCH(primary.ok_l, primary.ok_c * 2, 25)
info    = OKLCH(primary.ok_l, primary.ok_c * 2, 230)

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
