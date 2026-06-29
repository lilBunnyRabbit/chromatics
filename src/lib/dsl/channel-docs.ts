/**
 * Per-channel "what it is" descriptions for the encyclopedia Channels table.
 * One array per model id whose entries align 1:1 with that model's registered
 * `channels` order. Min/max come from the registry; this is the meaning column.
 *
 * Distilled from the chromatics docs vault (06-Reference Channels tables).
 */
export const CHANNEL_DOCS: Record<string, string[]> = {
	oklch: [
		'Perceptual lightness; higher = brighter, holding chroma steady unlike HSL',
		'Color intensity from the gray axis outward; raising it makes the color more vivid',
		'Hue angle around the perceptual wheel; rotating it shifts the color family'
	],
	oklab: [
		'Perceptual lightness; 0 = black, 1 = white',
		'Green-to-red opponent axis; negative = green, positive = red',
		'Blue-to-yellow opponent axis; negative = blue, positive = yellow'
	],
	hsl: [
		'Hue angle on the color wheel; 0 red, 120 green, 240 blue',
		'Colorfulness relative to lightness; 0 = gray, 1 = vivid',
		'Lightness; 0 = black, 0.5 = pure color, 1 = white'
	],
	hsv: [
		'Hue angle on the color wheel; 0 red, 120 green, 240 blue',
		'Color purity relative to value; 0 = white/gray, 1 = vivid',
		'Brightness equal to max(R,G,B); 0 = black, 1 = brightest'
	],
	hwb: [
		'Base hue on the color wheel; 0/360 red, 120 green, 240 blue',
		'Amount of white mixed in; higher = paler',
		'Amount of black mixed in; higher = darker (W+B>=1 yields gray)'
	],
	lab: [
		'Perceptual lightness; 0 = black, 100 = reference white',
		'Green-to-red opponent axis; negative = green, positive = red',
		'Blue-to-yellow opponent axis; negative = blue, positive = yellow'
	],
	lch: [
		'Perceptual lightness; 0 = black, 100 = reference white',
		'Chroma (colorfulness); 0 = gray, higher = more vivid',
		'Hue angle; 0 = red, 90 = yellow, 180 = green, 270 = blue'
	],
	srgb: [
		'Gamma-encoded red intensity in the standard web/display sRGB gamut',
		'Gamma-encoded green intensity in the standard web/display sRGB gamut',
		'Gamma-encoded blue intensity in the standard web/display sRGB gamut'
	],
	lin: [
		'Linear-light red intensity, no gamma; proportional to physical red light',
		'Linear-light green intensity, no gamma; proportional to physical green light',
		'Linear-light blue intensity, no gamma; proportional to physical blue light'
	],
	p3: [
		'Gamma-encoded red intensity in the wide Display P3 gamut (~25% wider than sRGB)',
		'Gamma-encoded green intensity in the wide Display P3 gamut',
		'Gamma-encoded blue intensity in the wide Display P3 gamut'
	],
	xyz: [
		'Roughly-red tristimulus mixing L and M cone responses; shifts red-green balance',
		'Luminance, proportional to perceived brightness; higher = lighter',
		'Roughly-blue tristimulus weighted to the S cone; shifts blue-yellow balance'
	],
	a98: [
		"Gamma-encoded (2.2) red intensity in Adobe RGB's wide gamut, strong in cyan-green",
		"Gamma-encoded (2.2) green intensity in Adobe RGB's wide gamut",
		"Gamma-encoded (2.2) blue intensity in Adobe RGB's wide gamut"
	],
	prophoto: [
		"Red intensity in ProPhoto's very wide gamut (some primaries imaginary)",
		"Green intensity in ProPhoto's very wide gamut",
		"Blue intensity in ProPhoto's very wide gamut"
	],
	rec2020: [
		'Red intensity in the wide Rec. 2020 UHD/HDR gamut (~630nm primary)',
		'Green intensity in the wide Rec. 2020 UHD/HDR gamut (~532nm primary)',
		'Blue intensity in the wide Rec. 2020 UHD/HDR gamut (~467nm primary)'
	],
	luv: [
		'Perceptual lightness; 0 = black, 100 = reference white',
		'Red-to-green axis; positive = red/magenta, negative = green/cyan',
		'Yellow-to-blue axis; positive = yellow, negative = blue'
	],
	lchuv: [
		'Perceived lightness from CIELUV; higher = brighter',
		'Colorfulness relative to brightness; 0 = neutral gray, higher = more saturated',
		'Hue angle on the CIELUV wheel; lines of constant hue pass through white'
	],
	lab65: [
		'Perceptual lightness against D65 white; 0 = black, 100 = white',
		'Green-to-red opponent axis; negative = green, positive = red',
		'Blue-to-yellow opponent axis; negative = blue, positive = yellow'
	],
	lch65: [
		'Perceptual lightness from D65 CIELAB; higher = brighter',
		'Chroma, distance from the neutral axis; 0 = gray, higher = more vivid',
		'Hue angle; 0 = red, 90 = yellow, 180 = green, 270 = blue'
	],
	dlab: [
		'Logarithmically compressed perceptual lightness; 0 = black, 100 = white',
		'Compressed green-to-red opponent axis; negative = green, positive = red',
		'Compressed blue-to-yellow opponent axis; negative = blue, positive = yellow'
	],
	dlch: [
		'Compressed DIN99o lightness; higher = brighter, near-Euclidean perceptual scale',
		'Compressed DIN99o chroma; 0 = gray, higher = more saturated',
		'Compressed DIN99o hue angle; rotating it shifts the color family'
	],
	jab: [
		'HDR-capable perceptual lightness; higher = brighter',
		'Red-to-green opponent axis; positive = red, negative = green',
		'Blue-to-yellow opponent axis; positive = yellow, negative = blue'
	],
	jch: [
		'HDR-capable perceptual lightness from JzAzBz; higher = brighter',
		'Colorfulness; 0 = neutral, higher = more vivid',
		'Hue angle around the JzAzBz wheel; rotating it changes the perceived hue'
	],
	itp: [
		'Perceptual intensity via PQ curve; higher = brighter, near constant-luminance',
		'Blue-yellow (tritan) chroma; positive and negative shift opposite ends',
		'Red-green (protan) chroma; positive and negative shift opposite ends'
	],
	hsi: [
		'Hue angle on the color wheel; 0 red, 120 green, 240 blue',
		'Color purity; distance from gray of equal intensity; 0 = gray, 1 = most chromatic',
		'Intensity, the average (R+G+B)/3; 0 = black'
	],
	okhsl: [
		'Hue angle around the Oklab wheel; rotating it shifts the color family',
		'Saturation; 0 = gray, 1 = most vivid in-gamut for that hue and lightness',
		'Perceptual lightness, even across hues; 0 = black, 1 = white'
	],
	okhsv: [
		'Hue angle around the Oklab wheel; rotating it shifts the color family',
		'Saturation; 0 = gray, 1 = most vivid in-gamut at that value',
		'Value/brightness, perceptually even across hues; 0 = black, 1 = brightest'
	],
	cubehelix: [
		'Starting hue angle of the helix through the RGB cube',
		'Saturation, how far the helix swings from the gray diagonal; 0 = grayscale',
		'Lightness rising monotonically from black to white'
	],
	yiq: [
		'NTSC luma, the brightness B&W sets read; higher = lighter',
		'In-phase chroma along the orange-cyan axis the eye sees most sharply',
		'Quadrature chroma along the coarser purple-green axis'
	],
	xyz50: [
		'Roughly-red tristimulus referenced to the D50 white point used by ICC profiles',
		'Luminance under D50; higher = brighter',
		'Roughly-blue (S-cone) tristimulus referenced to D50, the ICC connection white'
	],
	xyb: [
		'Red-green opponent signal (L−M); negative = greener, positive = redder',
		'Luma/brightness from cone average (L+M)/2; higher = lighter',
		'Blue-yellow opponent signal (S−Y), asymmetric for compression; negative = yellower, positive = bluer'
	],
	cmyk: [
		'Cyan ink coverage; absorbs red light, so more cyan shifts toward greenish-blue',
		'Magenta ink coverage; absorbs green light, so more magenta adds a purplish-red cast',
		'Yellow ink coverage; absorbs blue light, so more yellow pushes toward yellow-orange',
		'Black (Key) ink coverage; adds neutral density, deepening darks and reducing saturation'
	],
	hct: [
		"Hue from CAM16's appearance circle; rotating it changes the base color",
		'CAM16 chroma; 0 = muted neutral, higher = more vivid',
		'Tone, perceived lightness equal to CIELAB L*; lower = darker, higher = brighter'
	],
	hsluv: [
		'Hue angle on the color wheel; rotating changes the base color',
		'Colorfulness stretched to fill the sRGB gamut per hue; perceptually uniform',
		'Perceived lightness in CIE Luv; perceptually uniform'
	],
	hpluv: [
		'Hue angle on the color wheel; rotating shifts all colors',
		'Saturation capped to the pastel range; lower = softer, higher = more intense',
		'Perceptually uniform lightness in CIE Luv'
	],
	xyy: [
		'Horizontal chromaticity on the CIE 1931 diagram; encodes hue/saturation, not brightness',
		'Vertical chromaticity on the CIE 1931 diagram; together with x sets the color point',
		'Luminance, brightness independent of the (x,y) chromaticity'
	],
	ucs: [
		"Horizontal coordinate of the 1976 uniform chromaticity (u'); perceptually evened hue/saturation",
		"Vertical coordinate of the 1976 uniform chromaticity (v'); 1.5× the 1960 v",
		'Luminance carried alongside chromaticity; higher = brighter'
	],
	ucs60: [
		"Horizontal coordinate of MacAdam's 1960 uniform chromaticity (u); basis for CCT",
		"Vertical coordinate of the 1960 uniform chromaticity (v); v' = 1.5v in the 1976 scale",
		'Luminance carried alongside chromaticity; higher = brighter'
	],
	uvw: [
		'Chromaticity-derived opponent coordinate relative to white; sign sets red-green-like balance',
		'Chromaticity-derived opponent coordinate relative to white; sign sets the other chroma axis',
		'Lightness in this historical CIE space; higher = lighter'
	],
	hlab: [
		'Reflectance-based lightness; higher = lighter',
		'Red-to-green opponent axis; positive = red, negative = green',
		'Yellow-to-blue opponent axis; positive = yellow, negative = blue'
	],
	ipt: [
		'Overall intensity from cone responses; higher = brighter',
		'Red-green (protan) opponent axis; positive = red, negative = green',
		'Yellow-blue (tritan) opponent axis; positive = yellow, negative = blue'
	],
	aces: [
		'Scene-linear red across the full-visible AP0 gamut; HDR can exceed 1',
		'Scene-linear green across the full-visible AP0 gamut; HDR can exceed 1',
		'Scene-linear blue across the full-visible AP0 gamut; HDR can exceed 1'
	],
	acescg: [
		'Linear red on the cinema-wide AP1 primaries; HDR can exceed 1',
		'Linear green on the cinema-wide AP1 primaries; HDR can exceed 1',
		'Linear blue on the cinema-wide AP1 primaries; HDR can exceed 1'
	],
	acescc: [
		'Log-encoded red (AP1 primaries) for grading; pure log, no toe',
		'Log-encoded green (AP1 primaries) for grading; pure log, no toe',
		'Log-encoded blue (AP1 primaries) for grading; pure log, no toe'
	],
	acescct: [
		'Log+toe-encoded red (AP1) for grading, preserving shadow detail',
		'Log+toe-encoded green (AP1) for grading, preserving shadow detail',
		'Log+toe-encoded blue (AP1) for grading, preserving shadow detail'
	],
	scrgb: [
		'Linear extended-range red on sRGB primaries; negatives = out-of-gamut, >1 = HDR',
		'Linear extended-range green on sRGB primaries; negatives = out-of-gamut, >1 = HDR',
		'Linear extended-range blue on sRGB primaries; negatives = out-of-gamut, >1 = HDR'
	],
	smptec: [
		'Gamma-encoded red intensity on legacy SMPTE-C HDTV primaries (D65)',
		'Gamma-encoded green intensity on legacy SMPTE-C HDTV primaries (D65)',
		'Gamma-encoded blue intensity on legacy SMPTE-C HDTV primaries (D65)'
	],
	ypbpr: [
		'Gamma-corrected luma (brightness) of the analog component signal',
		"Blue color-difference (B'-Y'); positive pushes toward blue, negative toward yellow",
		"Red color-difference (R'-Y'); positive pushes toward red, negative toward cyan"
	],
	ycbcr: [
		'Gamma-corrected luma carrying brightness, kept full-resolution for compression',
		"Blue-difference chroma (B'-Y'), scaled and offset; positive = bluer",
		"Red-difference chroma (R'-Y'), scaled and offset; positive = redder"
	],
	rec601: [
		"Luma with SD weights Y' = 0.299R' + 0.587G' + 0.114B'; sets brightness",
		"Blue-difference chroma (B'-Y') under BT.601 weighting; positive = bluer",
		"Red-difference chroma (R'-Y') under BT.601 weighting; positive = redder"
	],
	yuv: [
		'Luma read by B&W TVs; carries the brightness of the PAL signal',
		"Blue-difference chroma (scaled B'-Y'); positive = bluer, negative = yellower",
		"Red-difference chroma (scaled R'-Y'); positive = redder, negative = cyaner"
	],
	ydbdr: [
		'Luma (brightness) of the SECAM signal, read by B&W receivers',
		'Blue color-difference, scaled from U; positive pushes toward blue',
		'Red color-difference, scaled and inverted from V; sets red chroma'
	],
	secam: [
		'Luma (brightness) transmitted continuously each line',
		'Blue color-difference, FM-modulated and sent on alternate lines',
		'Red color-difference, FM-modulated and sent on the interleaved lines'
	],
	ycgco: [
		'Luma (brightness) from a fast add/shift transform of RGB',
		'Green-difference chroma; positive = greener, negative = magenta',
		'Orange-difference chroma; positive = orange/red, negative = blue'
	],
	ycocgr: [
		'Luma (brightness) of the reversible integer transform',
		'Orange-difference chroma; positive = orange/red, negative = blue',
		'Green-difference chroma; positive = greener, negative = magenta'
	],
	sycc: [
		'Luma (brightness); identical encoding to YCbCr but for extended sRGB',
		'Blue-difference chroma, allowed beyond normal range for out-of-gamut blues',
		'Red-difference chroma, allowed beyond normal range for out-of-gamut reds'
	],
	xvycc: [
		'Luma (brightness); uses signal headroom/footroom for a wider gamut',
		'Blue-projection chroma reaching past sRGB into extended blues',
		'Red-projection chroma reaching past sRGB into extended reds'
	],
	rec2100: [
		'PQ-encoded red primary; nonlinear toward absolute HDR luminance',
		'PQ-encoded green primary, the dominant contributor to perceived brightness',
		'PQ-encoded blue primary on the wide Rec. 2020 gamut'
	],
	hsp: [
		'Hue angle on the color wheel; 0 red, 120 green, 240 blue',
		'Color purity; 0 = gray, 1 = most vivid',
		'Perceived brightness from Rec. 601 luma weights; equally bright across hues'
	],
	tsl: [
		'Tint angle derived from normalized rg chromaticity; hue-like tone',
		'Color intensity; 0 = gray, 1 = full saturation',
		'Lightness; 0 = black, 1 = white'
	],
	ryb: [
		"Red pigment amount on the artists' wheel; more pigment darkens and shifts toward red",
		'Yellow pigment amount; more pigment darkens and shifts the mix toward yellow',
		'Blue pigment amount; more pigment darkens and shifts the mix toward blue'
	],
	cam16: [
		'Perceived lightness relative to white under modeled viewing conditions; higher = brighter',
		'Colorfulness relative to white; higher = more vivid',
		'Perceived hue angle; modifying it changes the base hue'
	],
	cam16ucs: [
		'Uniform perceptual lightness; 0 = black, 100 = white',
		'Uniform red-green opponent axis; positive = red, negative = green',
		'Uniform blue-yellow opponent axis; positive = yellow, negative = blue'
	],
	ciecam02: [
		'Perceived lightness/brightness predicted under modeled viewing conditions; higher = brighter',
		'Colorfulness relative to white; higher = more intense colors',
		'Perceived hue angle; changing it shifts the color family'
	],
	cmy: [
		'Cyan ink amount; absorbs red light, so increasing it deepens the cyan tone',
		'Magenta ink amount; absorbs green light, so increasing it deepens the magenta tone',
		'Yellow ink amount; absorbs blue light, so increasing it deepens the yellow tone'
	],
	lms: [
		'Long-wavelength (~560 nm) "red" cone response; higher relative to M/S shifts toward red/magenta',
		'Medium-wavelength (~530 nm) "green" cone response; higher relative to L/S shifts toward green-cyan',
		'Short-wavelength (~420 nm) "blue" cone response; higher relative to others shifts toward blue/violet'
	]
};
