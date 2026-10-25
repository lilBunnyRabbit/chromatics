// Test fixture: the former "Brand Dark" template, kept as the parity oracle for
// the role-mapping and golden-hex acceptance tests after the brand templates
// were removed from the editor examples. Upgraded to the package DSL by dsl/migrate.ts
// (ADR-017); the old-DSL original is tests/fixtures/legacy-examples/brand-dark-template.ts.
export const source = `// ── Brand Dark — dark teal, with the background chroma study ──
// Each background step is rendered in 3 chroma modes:
//   sat  (+chroma)  · flat (no chroma) · desat (-chroma)
// Lighter surfaces gain color (elevated), darker ones lose it (receding).

// ── Source ──
background = Oklch(0.255, 0.0233, 230.47)

// ── Core (each defined by a relationship) ──
foreground = Oklch(1 - background.l, background.c / 3, (background.h + 180) % 360)
primary    = Oklch(foreground.l, background.c * 3, (foreground.h + 72) % 360)
secondary  = primary.clone().set({ h: (primary.h + 180) % 360 })
accent     = primary.clone().set({ h: foreground.h })

// ── Background scale: lightness step × chroma mode ──
lStep = 0.11
cStep = 0.01

bg_lightest_sat   = background.clone().shift({ l:  lStep,       c:  cStep })
bg_lightest_flat  = background.clone().shift({ l:  lStep })
bg_lightest_desat = background.clone().shift({ l:  lStep,       c: -cStep })
bg_lighter_sat    = background.clone().shift({ l:  lStep * 2/3, c:  cStep * 2/3 })
bg_lighter_flat   = background.clone().shift({ l:  lStep * 2/3 })
bg_lighter_desat  = background.clone().shift({ l:  lStep * 2/3, c: -cStep * 2/3 })
bg_light_sat      = background.clone().shift({ l:  lStep / 3,   c:  cStep / 3 })
bg_light_flat     = background.clone().shift({ l:  lStep / 3 })
bg_light_desat    = background.clone().shift({ l:  lStep / 3,   c: -cStep / 3 })
bg_dark_sat       = background.clone().shift({ l: -lStep / 3,   c:  cStep / 3 })
bg_dark_flat      = background.clone().shift({ l: -lStep / 3 })
bg_dark_desat     = background.clone().shift({ l: -lStep / 3,   c: -cStep / 3 })
bg_darker_sat     = background.clone().shift({ l: -lStep * 2/3, c:  cStep * 2/3 })
bg_darker_flat    = background.clone().shift({ l: -lStep * 2/3 })
bg_darker_desat   = background.clone().shift({ l: -lStep * 2/3, c: -cStep * 2/3 })
bg_darkest_sat    = background.clone().shift({ l: -lStep,       c:  cStep })
bg_darkest_flat   = background.clone().shift({ l: -lStep })
bg_darkest_desat  = background.clone().shift({ l: -lStep,       c: -cStep })

// ── Semantic (primary lightness, double chroma, fixed hues) ──
success = Oklch(primary.l, primary.c * 2, 140)
warning = Oklch(primary.l, primary.c * 2, 70)
error   = Oklch(primary.l, primary.c * 2, 30)
info    = Oklch(primary.l, primary.c * 2, 240)

// ── Harmony ──
triad_a = primary.clone().shift({ h: -120 })
triad_b = primary.clone().shift({ h:  120 })
split_a = primary.clone().shift({ h:  150 })
split_b = primary.clone().shift({ h:  210 })

// ── Hue rotation ring ──
hue_45  = Oklch(primary.l, primary.c, (primary.h + 45) % 360)
hue_90  = Oklch(primary.l, primary.c, (primary.h + 90) % 360)
hue_135 = Oklch(primary.l, primary.c, (primary.h + 135) % 360)
hue_225 = Oklch(primary.l, primary.c, (primary.h + 225) % 360)
hue_270 = Oklch(primary.l, primary.c, (primary.h + 270) % 360)
hue_315 = Oklch(primary.l, primary.c, (primary.h + 315) % 360)`;
