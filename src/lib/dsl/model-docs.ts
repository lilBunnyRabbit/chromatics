/**
 * Per-model reference copy, distilled from the docs vault (06-Reference).
 * One entry per registered model id: a plain-English description, alternative
 * names, and a one-line note on the channels/params and their ranges.
 */
export interface ModelDoc {
	about: string;
	aka?: string;
	channels?: string;
}

export const MODEL_DOCS: Record<string, ModelDoc> = {
	oklch: {
		about:
			'Cylindrical form of Oklab; the best modern choice for perceptually uniform color work. CSS-native via oklch(), with excellent hue uniformity, and unlike HSL it preserves chroma when adjusting lightness. Ideal for design palettes and gamut mapping.',
		aka: 'OKLCH, Oklab LCh',
		channels: 'L = perceptual lightness 0-1; C = chroma 0 to ~0.37; h = hue angle 0-360'
	},
	oklab: {
		about:
			"Modern perceptual space (Ottosson, 2020) fixing CIELAB's weaknesses, with better uniformity in blues and dark colors and simpler math. CSS-native and the default interpolation space for color-mix(). Best for gradients, blending and gamut mapping.",
		aka: 'OKLAB, Ottosson Lab',
		channels:
			'L = perceptual lightness 0-1; a = green(-) to red(+) ~-0.5..+0.5; b = blue(-) to yellow(+) ~-0.5..+0.5'
	},
	lab: {
		about:
			'CIELAB (1976), the industrial workhorse for color measurement. A cube-root transform of XYZ giving approximate perceptual uniformity where a delta-E of ~1 is just-noticeable. Best for color difference, ICC profiles, print QC and color correction.',
		aka: 'CIELAB, CIE L*a*b*, Lab',
		channels:
			'L* = lightness 0-100; a* = green(-) to red(+) ~-128..+127; b* = blue(-) to yellow(+) ~-128..+127'
	},
	lab65: {
		about:
			'The D65-referenced variant of CIELAB. Same cube-root transform of XYZ and approximate perceptual uniformity (delta-E ~1 = just-noticeable), but computed against the D65 white point rather than print-default D50. Best for display-referred color work.',
		aka: 'CIELAB D65, CIE L*a*b* (D65), Lab D65',
		channels:
			'L* = lightness 0-100; a* = green(-) to red(+) ~-128..+127; b* = blue(-) to yellow(+) ~-128..+127'
	},
	lch: {
		about:
			"Cylindrical form of CIELAB, expressing color as lightness, chroma and hue for intuitive editing while keeping Lab's uniformity. CSS-native via lch(). Better than rectangular Lab for palette and gradient design. D65 white point by default.",
		aka: 'CIELCh, CIELCh(ab), LCHab, L*C*h',
		channels:
			'L* = lightness 0-100; C* = chroma 0 to ~130; h = hue angle 0-360 (0=red, 90=yellow, 180=green, 270=blue)'
	},
	lch65: {
		about:
			'The D65-referenced variant of CIELCh, the cylindrical form of CIELAB. Same lightness/chroma/hue separation and Lab uniformity, but computed against the D65 white point rather than print-default D50. Best for display-referred palette design.',
		aka: 'CIELCh D65, CIELCh(ab) D65, LCHab D65',
		channels:
			'L* = lightness 0-100; C* = chroma 0 to ~130; h = hue angle 0-360 (0=red, 90=yellow, 180=green, 270=blue)'
	},
	luv: {
		about:
			'CIELUV (1976), a uniform space tuned for additive color mixing: mixing two lights mixes their coordinates proportionally to luminance, which Lab cannot do. Allocates blue more uniformly than Lab and underlies HSLuv. Best for lighting and display work.',
		aka: 'CIELUV, CIE L*u*v*, Luv',
		channels:
			'L* = lightness 0-100; u* = green/cyan(-) to red/magenta(+) ~-100..+100; v* = blue(-) to yellow(+) ~-100..+100'
	},
	lchuv: {
		about:
			'Cylindrical form of CIELUV, giving lightness, chroma and hue with lines of constant hue through the white point. Better suited than LCHab to additive mixing and the foundation for HSLuv/HPLuv. Best for additive palette design and lighting. D65 default.',
		aka: 'CIELCh(uv), LCH(uv), Luv LCh',
		channels: 'L = lightness 0-100; C = chroma 0 to ~130 (unbounded); h = hue angle 0-360'
	},
	jab: {
		about:
			'JzAzBz (2017), a perceptually uniform space built for HDR using the PQ curve, covering the full 0-10,000 cd/m2 range from starlight to sunlight. Euclidean distance tracks perceived difference across that range, beating CIELAB. Best for HDR imaging.',
		aka: 'JzAzBz, Jab',
		channels:
			'Jz = HDR lightness 0-1; Az = red-green opponent ~-0.5..+0.5; Bz = blue-yellow opponent ~-0.5..+0.5'
	},
	jch: {
		about:
			'JzCzHz, the cylindrical form of JzAzBz. Combines HDR-capable perceptual uniformity with intuitive lightness/chroma/hue editing. Well suited to high-luminance palette design and HDR grading where you want hue-based control in an HDR-ready space.',
		aka: 'JzCzHz, Jch',
		channels: 'Jz = HDR lightness 0-1; Cz = chroma 0 to infinity; hz = hue angle 0-360'
	},
	itp: {
		about:
			"ICtCp (ITU-R BT.2100), Dolby's HDR video model using Intensity plus two chroma axes with a PQ/HLG curve over 0-10,000 nits. A more uniform, constant-luminance alternative to YCbCr enabling better chroma subsampling. Best for HDR encoding and Dolby Vision.",
		aka: 'ICtCp, ITP',
		channels:
			'I = intensity/brightness 0-1 (PQ); Ct = blue-yellow (tritan) chroma ~-0.5..+0.5; Cp = red-green (protan) chroma ~-0.5..+0.5'
	},
	dlab: {
		about:
			'DIN99o Lab, a German-standard (DIN 6176) rescaling of CIELAB that logarithmically compresses chroma and rotates the axes so plain Euclidean distance approximates perceived difference (delta-E99o). Lab-like coordinates that are near-uniform.',
		aka: 'DIN99o, DIN99, DIN 6176, DIN99o L*a*b*',
		channels:
			'L99 = compressed lightness ~0-100; a99 = green-red axis (compressed, small); b99 = blue-yellow axis (compressed, small)'
	},
	dlch: {
		about:
			'DIN99o LCh, the cylindrical form of DIN99o (DIN 6176): lightness, chroma and hue from the compressed, near-Euclidean DIN99o Lab. Lets you edit hue and chroma intuitively in a space where straight-line distance closely tracks perceived difference.',
		aka: 'DIN99o LCh, DIN99 LCh, DIN 6176 LCh',
		channels:
			'L99 = compressed lightness ~0-100; C99 = compressed chroma ~0-60; h99 = hue angle 0-360'
	},
	hsl: {
		about:
			"Cylindrical transform of sRGB (Hue, Saturation, Lightness) aligned with artists' tint/shade/tone thinking. Intuitive and natively supported in CSS, ideal for web design and quick tint/shade ramps, but not perceptually uniform.",
		aka: 'HLS',
		channels:
			'H = hue angle 0-360 (0 red, 120 green, 240 blue); S = saturation 0-1 (0 gray, 1 vivid); L = lightness 0-1 (0 black, 0.5 pure color, 1 white)'
	},
	hsv: {
		about:
			'The original cylindrical RGB model (Alvy Ray Smith, 1978). Value is the brightest channel, so V=1,S=1 is the purest color. The default for color-picker UIs and graphics software; intuitive but not perceptually uniform.',
		aka: 'HSB',
		channels:
			'H = hue angle 0-360 (0 red, 120 green, 240 blue); S = saturation 0-1 (0 white/gray, 1 vivid); V = value/brightness 0-1 (0 black, 1 full brightness = max(R,G,B))'
	},
	hwb: {
		about:
			'Cylindrical model (Smith & Lyons, 1996) describing a hue mixed with amounts of white and black, matching how painters think. The most intuitive hue model, with CSS Level 4 support, good for tint/shade scales; not perceptually uniform.',
		channels:
			'H = hue angle 0-360 (0/360 red, 120 green, 240 blue); W = whiteness 0-1 (white added); B = blackness 0-1 (black added); W+B>=1 yields gray'
	},
	hsi: {
		about:
			'Cylindrical RGB model where Intensity is the plain average (R+G+B)/3, so the I channel equals the grayscale image. Hue is largely lighting-invariant, making HSI well suited to computer vision, image segmentation, and object detection; not perceptually uniform.',
		channels:
			'H = hue angle 0-360 (0 red, 120 green, 240 blue); S = saturation 0-1 (0 gray, 1 most chromatic); I = intensity 0-1, the average (R+G+B)/3 (0 black)'
	},
	okhsl: {
		about:
			"Bjorn Ottosson's perceptual reparameterization of HSL built on Oklab. Keeps HSL's familiar controls but makes lightness and saturation perceptually even across hues, so it is a near drop-in, gamut-aware HSL replacement for palette and UI work.",
		aka: 'Okhsl, OK HSL',
		channels:
			'H = hue angle 0-360; S = saturation 0-1 (0 gray, 1 most saturated in-gamut for that hue/lightness); L = perceptual lightness 0-1 (0 black, 1 white)'
	},
	okhsv: {
		about:
			"Bjorn Ottosson's perceptual version of HSV built on Oklab. Offers HSV-style hue/saturation/value controls but with perceptually even behavior and reliable sRGB gamut mapping, giving color pickers more consistent brightness and saturation than classic HSV.",
		aka: 'Okhsv, OK HSV',
		channels:
			'H = hue angle 0-360; S = saturation 0-1 (0 gray, 1 most saturated in-gamut); V = value/brightness 0-1 (0 black, 1 brightest)'
	},
	cubehelix: {
		about:
			"Dave Green's scheme that traces a helix through the RGB cube while luminance rises monotonically from black to white. Designed for scientific data and grayscale-safe imaging, it keeps correct brightness ordering even when printed or viewed in grayscale.",
		aka: "Cube Helix, Green's Cubehelix",
		channels:
			'Parameters: start hue (0-360), rotations (number of hue turns, e.g. -1.5), hue/saturation amount (0-1+), and lightness fraction 0-1 increasing monotonically black to white'
	},
	hct: {
		about:
			"Google's Material Design 3 model combining CAM16's hue and chroma with CIE Lab lightness (Tone). Tone is perceptually uniform across hues, so HCT suits dynamic theming, tonal palettes, and accessible contrast; it powers Material You from a seed color.",
		aka: 'Hue-Chroma-Tone',
		channels:
			'H = hue angle 0-360 (CAM16 hue); C = chroma 0-~120 variable (0 muted, high vivid); T = tone 0-100 perceived lightness (= CIE Lab L*; 0 dark, 100 bright)'
	},
	hsluv: {
		about:
			'A perceptually uniform HSL reparameterization mapping CIE LCh(uv) to a 0-100 saturation scale with sRGB gamut mapping. Equal numeric steps look equally different across hues, making it a drop-in HSL replacement for palettes, accessible design, and dataviz.',
		aka: 'Human-friendly HSL',
		channels:
			'H = hue angle 0-360; S = saturation 0-100 (100 = most saturated sRGB color for that hue/lightness); L = lightness 0-100, perceptually uniform'
	},
	hpluv: {
		about:
			'A constrained HSLuv variant yielding only pastel colors so every H,P,L value maps to a valid sRGB color with no gamut clipping, while staying perceptually uniform in all axes. Good for soft UI palettes and gamut-safe themes; limited to softer colors.',
		aka: 'Pastel HSLuv',
		channels:
			'H = hue angle 0-360; P = pastel saturation 0-100 (lower softer, higher more intense, capped to pastel range); L = lightness 0-100, perceptually uniform'
	},
	hsp: {
		about:
			'An HSV variant replacing Value with perceived brightness from Rec. 601 luma weights (sqrt of 0.299R^2+0.587G^2+0.114B^2). The same P looks equally bright across hues, giving a cheap contrast check far better than HSL/HSV without full Lab conversion.',
		aka: 'Hue-Saturation-Perceived brightness',
		channels:
			'H = hue angle 0-360; S = saturation 0-1 (color purity); P = perceived brightness 0-1, weighted luminance (Rec. 601 weights)'
	},
	tsl: {
		about:
			'Tint-Saturation-Lightness, a modified cylindrical model whose tint angle comes from normalized rg chromaticity. Its tint clusters skin tones more tightly than HSL/HSV hue, making it a niche but useful space for skin detection, face tracking, and segmentation.',
		aka: 'Tint-Saturation-Lightness',
		channels:
			'T = tint 0-360 (hue-like tone); S = saturation 0-1 (0 gray, 1 full); L = lightness 0-1 (0 black, 1 white); alpha = opacity 0-1'
	},
	ryb: {
		about:
			"The traditional artist's pigment model using Red, Yellow, Blue as subtractive primaries, predating CMY(K). Intuitive for art education, painting, and color-wheel theory (complements differ from RGB), but not scientifically accurate; RGB mapping is approximate.",
		aka: 'Red-Yellow-Blue',
		channels:
			'R = red 0-1; Y = yellow 0-1; B = blue 0-1 (subtractive pigment primaries; more pigment = darker)'
	},
	cam16: {
		about:
			"A full color appearance model (2016, successor to CIECAM02) predicting how a color looks given illumination, background, and surround. The most accurate model of human color perception; it powers Google's HCT and aids cross-media matching and HDR imaging.",
		aka: 'CAM16 color appearance model',
		channels:
			'J = lightness 0-100; C = chroma 0-inf (colorfulness, higher = vivid); h = hue angle 0-360; alpha = opacity 0-1 (also exposes brightness Q, colorfulness M, saturation s)'
	},
	cam16ucs: {
		about:
			'A uniform space derived from CAM16 that compresses its output so Euclidean distance approximates perceived color difference. Best for deltaE and precise corrections across viewing conditions, e.g. matching screen color to print under different lighting.',
		aka: 'CAM16-UCS, CAM16 UCS',
		channels:
			"J' = uniform lightness 0-100; a' = red-green opponent ~-100 to +100; b' = blue-yellow opponent ~-100 to +100; alpha = opacity 0-1"
	},
	ciecam02: {
		about:
			'The predecessor to CAM16, a comprehensive color appearance model (2002) accounting for ambient light, surround, and adaptation. Still widely deployed in ICC v4 profiles for perceptual rendering intent; CAM16 is preferred for new work due to better uniformity.',
		aka: 'CIE CAM02',
		channels:
			'J = lightness 0-100; C = colorfulness/chroma 0-inf (higher = more intense); h = hue angle 0-360; alpha = opacity 0-1'
	},
	srgb: {
		about:
			'The standard RGB space for the web and consumer displays (IEC 61966-2-1), co-developed by HP and Microsoft. CSS rgb() and hex are sRGB by default, making it the universal interchange format for digital color. Use for web, screens, and general image output.',
		aka: 'Standard RGB, IEC 61966-2-1',
		channels:
			'r, g, b = gamma-corrected red/green/blue intensity, 0-255 (or 0-1 normalized); optional alpha 0-1 for opacity'
	},
	lin: {
		about:
			'sRGB with the gamma curve removed, so values are proportional to physical light intensity. This is the physically correct space for color math: blending, interpolation, alpha compositing, shaders. Same primaries/white point as sRGB; never blend in gamma sRGB.',
		aka: 'Linear sRGB, linear-light RGB',
		channels: 'r, g, b = linear (no gamma) red/green/blue light intensity, 0-1; optional alpha 0-1'
	},
	p3: {
		about:
			"Apple's wide-gamut RGB space adapting DCI P3 to consumer displays: DCI P3's wide primaries with sRGB's D65 white point and ~2.2 gamma. Gamut is ~25% wider than sRGB. Default on iPhone, iPad, and Mac since ~2016 and supported in CSS via color(display-p3 ...).",
		aka: 'Display P3, P3',
		channels: 'r, g, b = red/green/blue intensity, 0-255 or 0-1; optional alpha 0-1'
	},
	a98: {
		about:
			"Adobe's wide-gamut RGB space (1998) covering ~50% of CIE Lab visible colors vs sRGB's ~35%, with the extra reach especially in cyan-green. The standard for professional photography and print prep, giving better CMYK coverage than sRGB.",
		aka: 'Adobe RGB, Adobe RGB (1998), A98 RGB',
		channels: 'r, g, b = red/green/blue intensity (gamma 2.2), 0-255; optional alpha 0-1'
	},
	prophoto: {
		about:
			'An extremely wide-gamut RGB space (also ROMM RGB) by Kodak covering ~90% of CIE Lab visible colors. Built for archival photography and RAW editing to preserve maximum color information. Caution: ~13% of its gamut is imaginary (outside human vision).',
		aka: 'ProPhoto RGB, ROMM RGB',
		channels: 'r, g, b = very-wide-gamut red/green/blue intensity, 0-255 or 0-1; optional alpha 0-1'
	},
	rec2020: {
		about:
			'The ITU standard for Ultra HD and HDR television (BT.2020), with a much wider gamut than Rec. 709/sRGB. Covers ~75.8% of CIE 1931 xy using monochromatic laser primaries (R=630nm, G=532nm, B=467nm). Required for 4K/8K UHD and HDR video.',
		aka: 'BT.2020, Rec. 2020, ITU-R BT.2020',
		channels: 'r, g, b = wide-gamut red/green/blue intensity, 0-1; optional alpha 0-1'
	},
	aces: {
		about:
			'The Academy Color Encoding System: a scene-referred, linear master/interchange space for cinema and VFX. Its AP0 primaries cover the entire CIE visible gamut, making it the archival and color-interchange standard for film (root of the ACEScg/ACEScc family).',
		aka: 'ACES2065-1, ACES AP0, Academy Color Encoding System',
		channels:
			'r, g, b = scene-linear wide-gamut red/green/blue, 0-1 (HDR can exceed 1); optional alpha 0-1'
	},
	acescg: {
		about:
			"The ACES working space for CGI and compositing: linear encoding correct for CG lighting, shading, and compositing math, using AP1 primaries that are wide enough for cinema but avoid AP0's imaginary colors. The standard working space for VFX in ACES pipelines.",
		aka: 'ACEScg, ACES AP1 linear',
		channels:
			'r, g, b = linear red/green/blue (AP1 primaries), 0-1 (HDR can exceed 1); optional alpha 0-1'
	},
	acescc: {
		about:
			'A logarithmic encoding of ACES (AP1 primaries) optimized for color grading. Its pure log curve allocates more precision to midtones, making it suited to grading tools like DaVinci Resolve and Baselight. Unlike ACEScct, it has no toe.',
		aka: 'ACEScc, ACES log',
		channels: 'r, g, b = log-encoded red/green/blue (AP1), nominally 0-1; optional alpha 0-1'
	},
	acescct: {
		about:
			"A variant of ACEScc that adds a toe region to better preserve shadow detail, preventing the 'milky blacks' of pure-log ACEScc. The most widely adopted ACES grading space in practice, favored where dark-region detail matters.",
		aka: 'ACEScct, ACES log with toe',
		channels: 'r, g, b = log+toe-encoded red/green/blue (AP1), nominally 0-1; optional alpha 0-1'
	},
	scrgb: {
		about:
			"Extended sRGB (IEC 61966-2-2) using sRGB's primaries/white point but allowing values outside 0-1: negatives mean out-of-sRGB-gamut colors, values above 1 mean HDR brightness. Linear-encoded for correct math; native to Windows color management and DirectX.",
		aka: 'scRGB, extended sRGB, IEC 61966-2-2',
		channels: 'r, g, b = linear extended-range red/green/blue, roughly -0.5 to +7.5 (or wider)'
	},
	smptec: {
		about:
			"An RGB space from SMPTE for early HDTV (SMPTE 240M / 'C'), with primaries close to NTSC but an improved transfer function and a D65 white point. A historical bridge from NTSC to modern HDTV, now superseded by Rec. 709. Use for legacy broadcast.",
		aka: 'SMPTE-C, SMPTE 240M, NTSC-C',
		channels: 'r, g, b = red/green/blue intensity, 0-255 or 0-1; optional alpha 0-1'
	},
	xyz: {
		about:
			'The foundational device-independent space of modern colorimetry (CIE 1931), from human color-matching experiments. Fictitious primaries keep all visible colors positive, with Y as luminance. The universal hub most conversions pass through. White point D65.',
		aka: 'CIE XYZ, CIE 1931 XYZ, tristimulus values',
		channels:
			'X = roughly red-leaning tristimulus 0-~0.95; Y = luminance 0-1 (or 0-100); Z = roughly blue (S-cone) tristimulus 0-~1.09; optional alpha 0-1'
	},
	xyz50: {
		about:
			'The D50-referenced variant of CIE XYZ: the same CIE 1931 tristimulus space but normalized to a D50 white point instead of D65. Used as the ICC profile connection space (PCS) for color management and print, where D50 is the reference illuminant.',
		aka: 'CIE XYZ D50, XYZ (D50), ICC PCS XYZ',
		channels:
			'X, Y, Z = tristimulus values referenced to D50 white; Y = luminance 0-1 (or 0-100), X and Z 0-~1; optional alpha 0-1'
	},
	xyb: {
		about:
			"JPEG XL's internal perceptual color transform, a modified LMS space (X=L-M, Y=(L+M)/2, B=S-Y) with an asymmetric blue channel. Built for efficient lossy compression, it decorrelates natural images better than YCbCr and exploits low sensitivity to blue noise.",
		aka: 'XYB, JPEG XL color transform',
		channels:
			'X = red-green opponent signal (L-M); Y = luma/brightness ((L+M)/2); B = blue-yellow opponent signal (S-Y, asymmetric); ranges vary'
	},
	xyy: {
		about:
			'A repacking of CIE XYZ into chromaticity (x, y) plus luminance (Y), separating hue/saturation from brightness. The (x, y) pair plots on the CIE 1931 horseshoe diagram, the standard way to define gamut primaries and white points. Not perceptually uniform.',
		aka: 'CIE xyY, CIE 1931 chromaticity',
		channels:
			'x = chromaticity horizontal 0-~0.74; y = chromaticity vertical 0-~0.83; Y = luminance 0-1 (or 0-100)'
	},
	ucs: {
		about:
			"The CIE 1976 uniform chromaticity scale: a projective transform of XYZ into (u', v') coordinates ~4x more uniform than CIE xy, the most uniform 2D chromaticity diagram in standard use. Direct basis for CIELUV and the standard for LED/display spec and binning.",
		aka: "CIE 1976 UCS, u'v', CIE 1976 UCS diagram",
		channels:
			"u' = uniform chromaticity horizontal 0-~0.62; v' = uniform chromaticity vertical 0-~0.59"
	},
	ucs60: {
		about:
			"MacAdam's CIE 1960 uniform chromaticity scale: a projective transform of XYZ into (u, v) where equal distances better match perceived differences (~4x more uniform than CIE xy). The basis for correlated color temperature (CCT); superseded by the 1976 UCS.",
		aka: 'CIE 1960 UCS, MacAdam (u, v), CIE 1960 color space',
		channels:
			'u = uniform chromaticity horizontal 0-~0.62; v = uniform chromaticity vertical 0-~0.60'
	},
	uvw: {
		about:
			'A historical CIE space (CIE 1964 U*V*W*), the first attempt at perceptual uniformity and a precursor to CIELUV. Largely obsolete, of interest mainly for historical reference and comparing old vs modern perceptual spaces. Superseded by CIE Luv in 1976.',
		aka: 'CIE 1964 U*V*W*, CIEUVW, U*V*W*',
		channels:
			'U*, V* = chromaticity-derived opponent coordinates; W* = lightness; values vary, historical scaling'
	},
	hlab: {
		about:
			"The predecessor to CIE Lab (1948), an opponent Lab-style space built for industrial color measurement and quality control. It applies a square-root compression of XYZ (rather than CIE Lab's cube-root) and is still found in some older industrial instruments.",
		aka: 'Hunter Lab, HunterLAB, Hunter L,a,b',
		channels:
			'L = reflectance-based lightness 0-100; a = red(+)/green(-) axis; b = yellow(+)/blue(-) axis (a,b ranges vary); optional alpha 0-1'
	},
	ipt: {
		about:
			'A perceptual space on LMS cone responses with Intensity (I) and two opponent channels, P (red-green) and T (blue-yellow). Its standout trait is excellent hue linearity (constant-hue lines are straight), ideal for hue-preserving gamut mapping. Inspired Oklab.',
		aka: 'IPT, Ebner-Fairchild IPT',
		channels:
			'I = intensity/brightness 0-1; P = red-green opponent ~-0.5 to 0.5; T = blue-yellow opponent ~-0.5 to 0.5; optional alpha 0-1'
	},
	lms: {
		about:
			"A physiological space modeling the eye's three cone types: Long (~560nm), Medium (~530nm), Short (~420nm). A linear transform of CIE XYZ, it underpins chromatic adaptation, color-blindness simulation, Oklab, IPT, and ICtCp. For computation, not manual picking.",
		aka: 'LMS, cone response space, cone fundamentals',
		channels:
			"l = long/'red' cone response; m = medium/'green' cone response; s = short/'blue' cone response; each 0-1+ (nonnegative, often normalized so white = 1)"
	},
	cmyk: {
		about:
			'Subtractive print model: cyan, magenta, yellow inks plus black (Key) for deeper darks, sharper text, and lower ink cost. The standard for offset/process printing. Device-dependent with a smaller gamut than RGB.',
		aka: 'process color, four-color process',
		channels: 'C cyan, M magenta, Y yellow, K black ink coverage, each 0-1 (or 0-100%); alpha 0-1'
	},
	cmy: {
		about:
			'Subtractive model where cyan, magenta, and yellow inks absorb red, green, and blue from white light, producing color by subtraction. The theoretical basis of printing; usually the complement of RGB (C=1-R, etc.).',
		channels: 'C cyan, M magenta, Y yellow ink amount, each 0-1 (or 0-100%); alpha 0-1'
	},
	ccmmyk: {
		about:
			'Extended CMYK that adds diluted light-cyan and light-magenta inks to fill the gap between paper white and full-strength inks. Smooths highlight/midtone gradients and skin tones; standard in 6-color photo inkjet printers.',
		aka: 'CcMmYK, 6-color process',
		channels: 'C/M/Y/K full inks plus c light cyan and m light magenta, each 0-1 (or 0-100%)'
	},
	yiq: {
		about:
			"NTSC television model that splits luma (Y) from in-phase (I) and quadrature (Q) chroma, optimized for North American analog broadcast and backward compatible with black-and-white TV. The I axis aligns with the eye's peak chroma sensitivity.",
		aka: 'NTSC color space',
		channels:
			'Y luma (brightness), I in-phase orange-cyan chroma, Q quadrature purple-green chroma; alpha 0-1'
	},
	ypbpr: {
		about:
			'Analog component-video form of YCbCr, splitting the signal into luma plus blue- and red-difference signals. Used in component video cables and AV equipment for high-quality analog transmission; maps to YCbCr by scale and offset.',
		aka: "Y'PbPr, component video",
		channels:
			'Y luminance (brightness), Pb blue-minus-luma difference, Pr red-minus-luma difference; alpha 0-1'
	},
	ycbcr: {
		about:
			'Digital luma/chroma encoding that powers nearly all video compression (JPEG, MPEG, H.264/265, VP9, AV1). Separating luma from chroma enables chroma subsampling (4:2:0, 4:2:2) and is handy for keying and color grading.',
		aka: "Y'CbCr, YCC, digital component video",
		channels:
			'Y luma 16-235 (8-bit), Cb blue-difference chroma 16-240, Cr red-difference chroma 16-240; alpha 0-1'
	},
	rec601: {
		about:
			'ITU-R BT.601 standard-definition TV spec defining YCbCr encoding for 525-line (NTSC) and 625-line (PAL/SECAM) systems. Used for SD video, DVD authoring, and legacy broadcast. Sets the SD luma weights, not a separate model.',
		aka: 'BT.601, ITU-R BT.601',
		channels: 'YCbCr with SD luma weights Y = 0.299R + 0.587G + 0.114B'
	},
	yuv: {
		about:
			'Foundational analog video model separating brightness (Y) from color (U, V). Enabled backward-compatible color TV over black-and-white infrastructure (B&W sets read only Y). The conceptual basis of all luma-chroma encodings.',
		aka: "Y'UV",
		channels:
			'Y luma 0-1, U blue-difference chroma ~-0.436..0.436, V red-difference chroma ~-0.615..0.615; alpha 0-1'
	},
	ydbdr: {
		about:
			'SECAM television model used in French and former Soviet analog broadcasting. Encodes color as blue- and red-difference signals with FM modulation for immunity to phase errors. Mainly of legacy/archival interest now.',
		aka: 'SECAM color space',
		channels: 'Y luma (brightness), Db blue color-difference, Dr red color-difference'
	},
	ycgco: {
		about:
			'Video/graphics model splitting luma (Y) from green-difference (Cg) and orange-blue (Co) chroma. Computable with only additions and bit-shifts (no multiplies) and decorrelates better than YCbCr. Used in H.264/H.265, good for embedded and low-latency paths.',
		aka: 'YCoCg',
		channels:
			'Y luminance 0-1, Cg green-magenta chroma ~-0.5..0.5, Co orange-blue chroma ~-0.5..0.5; alpha 0-1'
	},
	ycocgr: {
		about:
			'Bit-exact reversible variant of YCgCo that adds lifting steps for a zero-loss RGB round-trip. Uses only add/subtract/shift, with better energy compaction than reversible YCbCr. Used in H.264/H.265 lossless modes and screen-content coding.',
		aka: 'YCoCg-R, reversible YCoCg',
		channels:
			'Y luma, Co orange-blue difference, Cg green-magenta difference (integer, ranges vary)'
	},
	sycc: {
		about:
			'Extended YCbCr encoding (IEC 61966-2-1 Amd.1) that allows sRGB values below 0 and above 1, capturing colors beyond the sRGB gamut. Used in digital cameras and JPEG 2000 for more flexible saturation than strict sRGB.',
		aka: 'sYCC',
		channels:
			'Y luminance, Cb blue-difference chroma, Cr red-difference chroma (ranges vary); alpha 0-1'
	},
	xvycc: {
		about:
			'Extended-gamut video standard (IEC 61966-2-4) that uses YCbCr headroom/footroom to reach ~1.8x the sRGB gamut. Backward compatible (decoders clip out-of-range values) and carried over HDMI 1.3+ as x.v.Color; useful for HDR/wide-gamut video.',
		aka: 'x.v.Color, IEC 61966-2-4',
		channels:
			'Y luminance 0-255, C1 blue-projection chroma -128..127, C2 red-projection chroma -128..127; alpha 0-1'
	},
	rec2100: {
		about:
			'ITU-R BT.2100 standard for HDR and Ultra-HD television. Pairs the wide Rec. 2020 gamut with HDR transfer functions PQ (absolute, 0-10,000 cd/m2) and HLG (relative, SDR-compatible). Foundation for HDR10, HDR10+, Dolby Vision, and HLG broadcast.',
		aka: 'BT.2100, ITU-R BT.2100',
		channels:
			'Rec. 2020 primaries with PQ or HLG transfer function (RGB or YCbCr); relates to ICtCp'
	},
	yjk: {
		about:
			'Color model from the MSX2+ computer (1988) in the YUV family. Four adjacent pixels share one J,K chroma pair while each pixel keeps its own Y luma, giving cheap color under 8-bit hardware limits. Mainly of retro-computing interest.',
		aka: 'MSX2+ YJK',
		channels: 'Y luma per pixel (brightness), J and K shared chrominance across 4 pixels'
	},
	impossible: {
		about:
			'Theoretical colors that no single wavelength or real light/pigment mix can produce; they exist only as math constructs or neural phenomena. Explains imaginary primaries and gamut boundaries rather than serving as a usable color model.',
		aka: 'imaginary colors, chimerical colors',
		channels:
			'Not a coordinate model; e.g. points outside the spectral locus in CIE XYZ (negative tristimulus values)'
	},
	icam: {
		about:
			'Image-based color appearance model that processes whole images instead of single colors, accounting for spatial context, local adaptation, and surround. Better than pixel-wise CAMs for complex scenes; used in HDR rendering, tone mapping, and image quality.',
		aka: 'iCAM, image color appearance model',
		channels:
			'Image-level model (no per-color channels); derived from CIE XYZ plus spatial analysis'
	},
	rgchroma: {
		about:
			'2D representation that strips intensity from RGB by normalizing: r = R/(R+G+B), g = G/(R+G+B), with blue implicit. Invariant to illumination intensity, making it useful for skin detection, tracking, and shadow removal in computer vision.',
		aka: 'rg chromaticity, normalized RGB chromaticity',
		channels: 'r red chromaticity 0-1, g green chromaticity 0-1 (b = 1 - r - g implicit)'
	},
	rgcolor: {
		about:
			'Simplified two-channel models using only red and green, historically used in early computing. Now mainly of academic or historical interest for studying color vision; effectively subsumed by rg chromaticity.',
		aka: 'RG color model',
		channels: 'R red and G green only (blue dropped); typically 0-1 per channel'
	},
	gl: {
		about:
			'The normalized RGBA color representation used by OpenGL/WebGL shaders and GPU pipelines, with channels in 0.0-1.0 floating point. Not a distinct color model, just normalized (s)RGB suited to a linear, GPU-friendly space.',
		aka: 'OpenGL color, WebGL color, normalized RGBA',
		channels: 'r, g, b each 0.0-1.0, plus alpha 0-1 (opacity)'
	},
	pantone: {
		about:
			'Proprietary spot-color matching system by Pantone (US, 1963), the print and product industry standard for brand and spot colors. Physical, licensed swatch books in coated, uncoated, and matte finishes; color data is paid.',
		aka: 'PMS, Pantone Matching System',
		channels: 'Codes with finish suffix, e.g. PANTONE 185 C (coated)'
	},
	munsell: {
		about:
			'First scientifically-based color-order system, created by Albert Munsell (US, 1905). An algorithmic/notation system specifying perceptually equal steps; used in soil science, geology, archaeology, dental shades, and color communication.',
		aka: 'Munsell, JIS Z8102',
		channels: 'Hue Value/Chroma notation, e.g. 5R 4/14'
	},
	ncs: {
		about:
			"Natural Color System, a perceptual system from Sweden (1964) based on Hering's opponent-color theory, describing how colors appear via blackness, chromaticness, and hue. National standard in Sweden, Norway, Spain, South Africa; licensed swatches.",
		aka: 'Natural Color System',
		channels: 'Notation like NCS S 2060-Y90R (blackness, chromaticness, hue)'
	},
	ral: {
		about:
			'Standardized color matching system from Germany (1927), dominant in Europe for paints, coatings, and plastics. Predefined swatch collections (Classic ~215, Design ~1,825, Effect 490) with official CIE Lab values; categorical code system.',
		aka: 'RAL Classic, RAL Design, RAL Effect',
		channels: 'Categorical codes, e.g. RAL 9010 (Pure White)'
	},
	hks: {
		about:
			'European spot-color system named after originators Hostmann-Steinberg, Kast+Ehinger, and Schmincke; standard in German-speaking Europe. 120 base colors over 3,520 shades, distributed as physical swatch fans for print.',
		aka: 'Hostmann-Steinberg, Kast+Ehinger, Schmincke',
		channels: 'Base number plus series suffix, e.g. HKS 13 K (coated)'
	},
	copic: {
		about:
			"World's leading professional alcohol marker color system by Too Corporation (Japan). Physical refillable markers; 358 colors (Classic) or 396 (Sketch/Ciao) coded by hue family, saturation, and brightness. Standard for manga, illustration, and design rendering.",
		aka: 'Copic markers',
		channels: 'Hue family + saturation + brightness digits, e.g. BV23'
	},
	dic: {
		about:
			'Proprietary Japanese spot-color system by DIC Corporation, comparable to Pantone and dominant (with Toyo) in Asian print and packaging. Physical swatch guides with code identifiers.',
		aka: 'DIC Color Guide, Dainippon Ink and Chemicals',
		channels: 'DIC code identifiers, e.g. DIC 184'
	},
	toyo: {
		about:
			'Major Japanese spot-color matching system by Toyo Ink; with DIC, one of the two dominant Asian print systems. Over 1,050 process and spot colors with physical swatch guides on coated and uncoated paper.',
		aka: 'Toyo Ink, Toyo 94 Color Finder',
		channels: 'Toyo catalog codes referencing process/spot colors'
	},
	trumatch: {
		about:
			'Digital-first CMYK color matching system with over 2,000 process colors achievable with standard CMYK, organized by hue with systematic saturation/brightness steps. Algorithmic system for predictable desktop-publishing print output.',
		aka: 'TRUMATCH Colorfinder',
		channels: 'Trumatch codes carrying native CMYK values, organized by 50 hues'
	},
	ansi: {
		about:
			'Terminal color system defining colors for command-line interfaces via ANSI escape codes, based on the VGA palette. Algorithmic palettes: 4-bit (16 colors), 8-bit (256 colors), and 24-bit true color. Used in CLI apps, terminal UIs, and shell scripts.',
		aka: 'ANSI 16, ANSI 256, ANSI escape codes',
		channels: 'Integer code, e.g. ANSI 196, emitted via escape like \\x1b[31m'
	},
	bs: {
		about:
			'British Standards Institution color system for UK industrial and design use, spanning the BS 381C, BS 4800, and BS 5252 palettes. Standardized predefined colors for UK government, military, and industry.',
		aka: 'BS 381C, BS 4800, BS 5252, British Standard Colour',
		channels: 'Standard codes referencing a BS palette, e.g. 381C-538'
	},
	fedstd595: {
		about:
			"Federal Standard 595C, the US government's official color standard with a fixed palette of ~650 colors for military equipment, government buildings, and federal procurement. Defined swatch/notation standard.",
		aka: 'FED-STD-595C, Federal Standard 595',
		channels: '5-digit code; first digit = finish, rest = color, e.g. 36375'
	},
	iscc_nbs: {
		about:
			'Color naming and classification system by the Inter-Society Color Council and US National Bureau of Standards (1955). An algorithmic naming scheme dividing color space into 267 named regions mapped onto Munsell coordinates for standardized English names.',
		aka: 'ISCC-NBS system',
		channels: "Systematic English names, e.g. 'vivid red', 'dark grayish yellow'"
	},
	werner: {
		about:
			'Pioneering color naming system published by Patrick Syme after Abraham Werner (1814), describing 110 named colors with mineral, vegetable, and animal examples. Historical reference, famously used by Darwin aboard HMS Beagle; now a digitized swatch catalog.',
		aka: "Werner's Nomenclature of Colours, Syme",
		channels: "Named colors with painted swatch, e.g. 'Arterial Blood Red'"
	},
	din6164: {
		about:
			'German color-order system (DIN standard) based on CIE colorimetry, mathematically rigorous with perceptually equal hue steps. Organizes colors by Hue (T), Saturation (S), and Darkness (D); used in German industry, coatings, and textiles.',
		aka: 'DIN color system, Deutsches Institut fur Normung',
		channels: 'T:S:D notation, e.g. Hue (T) 1-24, Saturation (S), Darkness (D)'
	},
	ostwald: {
		about:
			'Historical color-order system by Wilhelm Ostwald (1916) classifying colors by hue, white content (W), and black content (K), where color content + W + K = 100%. Largely superseded; conceptual ancestor of the modern HWB model.',
		aka: 'Ostwald color system',
		channels: 'Hue plus white and black content (C + W + K = 100%)'
	},
	pccs: {
		about:
			"Practical Color Coordinate System, a Japanese color system (1964) organizing colors into named 'tone' categories for practical design communication and manufacturing. Notation/system widely used in Japanese design education and palette coordination.",
		aka: 'Practical Color Coordinate System',
		channels: 'Named tone categories, e.g. vivid, bright, deep, light, soft, pale'
	},
	coloroid: {
		about:
			'Hungarian color-order system (1962) designed specifically for architecture, interior, and environmental design. An algorithmic system using aesthetically optimized rather than purely perceptual spacing, representing colors by hue, saturation, and brightness.',
		aka: 'Coloroid color system',
		channels: 'A (hue), T (saturation), V (lightness), e.g. lookup(A, T, V)'
	},
	cns: {
		about:
			'Chinese National Standard color system defining standardized colors for industrial and governmental use across mainland China and Taiwan, built on the Munsell framework. Official government/industrial standard for Greater China.',
		aka: 'Chinese National Standard, CNS 13076, GB/T 15608',
		channels: 'CNS codes mapped to Munsell-based color standards'
	},
	hexachrome: {
		about:
			"Pantone's six-color printing process (1995, discontinued 2008) adding Orange and Green to CMYK (CMYK+OG) to extend gamut, reaching ~90% Pantone spot reproducibility vs ~50% for CMYK. A printing process, succeeded by expanded-gamut CMYKOGV.",
		aka: 'PANTONE Hexachrome, CMYKOG',
		channels: 'Six-color ink process: CMYK + Orange (O) + Green (G)'
	},
	focoltone: {
		about:
			'British color system designed to eliminate trapping/registration problems in CMYK process printing. 763 colors each defined as specific CMYK builds with known overprint behavior; no spot inks. Supported in major design software.',
		aka: 'FOCOLTONE',
		channels: 'Focoltone codes carrying specific CMYK percentages'
	},
	scotdic: {
		about:
			'Textile color communication system providing physical fabric swatches (cotton, polyester) for accurate dye matching, with 2,300+ colors. Used for standardized textile/fashion specification, dye matching, and garment QC.',
		aka: 'SCOTDIC textile colours',
		channels: 'Categorical SCOTDIC color codes selecting predefined swatches'
	},
	as2700: {
		about:
			'Australian Standard for colors (Standards Australia), defining ~240 colors for architecture, building, and industry across Australia and New Zealand. Mandatory for Australian government and infrastructure projects; physical chips with CIE Lab values.',
		aka: 'AS 2700, Australian Standard colours',
		channels: "Letter group prefix + 3-digit number, e.g. G61 ('Sleeperwood')"
	},
	anpa: {
		about:
			'American Newspaper Publishers Association color system defining 300 spot colors specifically for newsprint paper stock, to standardize print-media color reproduction. Largely historical today.',
		aka: 'ANPA-COLOR, American Newspaper Publishers Association',
		channels: 'ANPA spot color codes optimized for newsprint'
	},
	coloradd: {
		about:
			'Universal color identification system for color-blind people, created in Portugal (2010). An accessibility notation using geometric symbols to encode colors so they can be identified without being seen; used in inclusive packaging, wayfinding, and education.',
		aka: 'ColorADD code',
		channels: 'Geometric symbols (triangle=red, bars=blue/yellow); combined for secondaries'
	},
	colorindex: {
		about:
			'Colour Index International, the global reference database for pigments and dyes, assigning standardized C.I. names and numbers to every commercial colorant (13,000+ entries). A chemical/colorant naming reference, not a display color space.',
		aka: 'C.I., Colour Index',
		channels: 'C.I. [Application] [Color] [Number], e.g. C.I. Pigment Red 170'
	},
	iccprofile: {
		about:
			"ICC profile, a standardized data file (International Color Consortium) describing a device's color characteristics for cross-device consistency. Not a color model but a data format/standard; built into every OS, using CIE Lab/XYZ as the connection space.",
		aka: 'International Color Consortium profile, .icc/.icm',
		channels: 'Binary profile data (Input/Display/Output) plus device color values'
	},
	isocie: {
		about:
			'Collection of joint ISO/CIE colorimetry standards defining foundational color science: standard observers, illuminants, CIE XYZ, CIELAB, CIELUV, and the CIEDE2000 difference formula. Reference specifications, not a single implementable system.',
		aka: 'ISO/CIE standards, CIE colorimetry',
		channels: 'Model-specific (XYZ: X,Y,Z; Lab: L,a,b; Luv: L,u,v) per ISO/CIE specs'
	}
};
