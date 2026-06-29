export const name = 'Showcase';

export const source = `// Chromatics showcase — one seed, the whole engine.
// Each line manipulates a DIFFERENT color model. Edit the seed
// and everything below cascades. Open the API docs (top bar) or
// the 3D Explore tab to see every model.
seed = OKLCH(0.62, 0.16, 264)

// ── Core theme — perceptual lightness, kept in sRGB gamut ──
background = seed.atLightness(0.15).gamutMap()
surface    = seed.atLightness(0.21).gamutMap()
foreground = seed.atLightness(0.95).gamutMap()
muted      = foreground.atChroma(0.02).darken(0.22)
border     = surface.lighten(0.12)

// ── Brand harmony on the OKLCH hue wheel (correct hues) ──
primary   = seed.gamutMap()
secondary = seed.rotateHue(150).gamutMap()
tertiary  = seed.rotateHue(-90).gamutMap()

// Most vivid in-gamut accent at the same lightness (maxChroma → a number)
vivid  = seed.rotateHue(60)
accent = OKLCH(vivid.ok_l, vivid.maxChroma(), vivid.ok_h)

// Readable button text, auto-chosen by WCAG contrast (via sRGB)
primary_fg = primary.srgb.contrastWCAG(foreground) >= 4.5 ? foreground : background

// ── Semantic colors via HCT — fixed hue, brand chroma, set tone ──
success = HCT(150, primary.hct_c, 58).hct.atTone(58)
warning = HCT(85,  primary.hct_c, 72).hct.atTone(72)
error   = HCT(25,  primary.hct_c, 55).hct.atTone(55)
info    = HCT(250, primary.hct_c, 62).hct.atTone(62)

// ── Material tonal ramp from the brand (HCT tones) ──
brand_20 = primary.hct.atTone(20)
brand_50 = primary.hct.atTone(50)
brand_90 = primary.hct.atTone(90)

// ── The mixing SPACE matters — same blend, three models ──
mix_oklab  = primary.oklab.mix(accent, 0.5)
mix_linear = primary.lin.blend(accent, 0.5)
mix_ryb    = RYB(0, 0, 1).ryb.mix(RYB(0, 1, 0))   // blue + yellow → green!

// ── Tints & shades in HSL / HWB ──
tint  = primary.hsl.tint(0.4)
shade = primary.hsl.shade(0.4)
soft  = primary.hwb.addWhite(0.25)

// ── Perceptually-uniform hue shift (HSLuv) ──
hsluv_shift = primary.hsluv.rotateHue(40)

// ── Print preview — CMYK, ink-limited for newsprint ──
press = primary.cmyk.limitInk(240)

// ── Color-vision-deficiency simulation (deuteranopia) ──
cvd = accent.srgb.simulateCVD("deuteranopia")

// ── Nearest physical paint chip (RAL Classic) ──
ral = primary.ral.nearest()

// White balance — a near-neutral "paper" tinted by the brand hue
paper = OKLCH(0.94, 0.02, primary.ok_h)

// ── Live metrics the engine computes (numbers / booleans) ──
ink_pct  = primary.cmyk.totalInk            // total area coverage %
temp_k   = paper.ucs60.cct                  // correlated colour temp (K)
delta_e  = primary.cam16ucs.deltaE(accent)  // CAM16-UCS ΔE′
aa_pass  = foreground.srgb.meetsAA(background)
in_p3    = accent.p3.isInGamut
ral_code = primary.ral.code()`;
