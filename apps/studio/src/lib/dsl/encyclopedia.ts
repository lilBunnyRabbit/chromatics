/**
 * The Color Models & Systems encyclopedia content — the data behind the
 * interactive /models page. One entry per registered model/system id.
 *
 * Distilled from the chromatics docs vault (06-Reference). The terse one-liner
 * `about`/`aka`/`channels` strings still live in `model-docs.ts` (used by the
 * DSL reference + 3-D viewer); THIS file is the long-form reference: what each
 * model is, what it's used for, why you'd reach for it inside Chromatics, and
 * how it connects to other models (relation ids are clickable cross-links).
 *
 * GENERATED-ASSEMBLED then hand-maintainable. Relation ids are guaranteed to be
 * valid registry ids at build time (see the /models page resolver).
 */

export interface EncyclopediaRelations {
	/** Spaces this model is mathematically derived from / its parent space. */
	derivedFrom?: string[];
	/** Notable direct conversion targets. */
	convertsTo?: string[];
	/** Sibling / comparable / alternative / successor models. */
	related?: string[];
}

export interface EncyclopediaResource {
	label: string;
	url: string;
}

export interface EncyclopediaEntry {
	/** One-line hook. */
	summary: string;
	/** 2-4 sentences: what it is, who/when made it, how it's structured. */
	whatItIs: string;
	/** Concrete real-world use cases. */
	usedFor: string[];
	/** Why reach for this model inside Chromatics specifically. */
	benefitsHere: string[];
	relations: EncyclopediaRelations;
	resources: EncyclopediaResource[];
}

export const ENCYCLOPEDIA: Record<string, EncyclopediaEntry> = {
	oklch: {
		summary:
			'The cylindrical form of Oklab and the best modern choice for perceptually uniform color work, with CSS-native support',
		whatItIs:
			'OKLCH is the polar (cylindrical) representation of Oklab, expressing a color as Lightness, Chroma, and Hue. It was introduced by Bjorn Ottosson in 2020 as part of the Oklab work and standardized in CSS Color 4 via the oklch() function. Unlike HSL it preserves chroma when lightness changes, and its hue angles stay perceptually even across the wheel, so equal numeric steps look like equal visual steps.',
		usedFor: [
			'Authoring modern CSS colors with the oklch() function',
			'Building accessible, perceptually even design-system palettes',
			'Generating tints and shades that hold their hue and chroma',
			'Dynamic theming and runtime color generation',
			'Smooth gradients and interpolation without muddy midpoints',
			'Gamut-aware color adjustment for sRGB, P3, and Rec.2020'
		],
		benefitsHere: [
			'OKLCH is the perceptual workhorse for color math in Chromatics — a color built with OKLCH(l, c, h) stays OKLCH, and any other color reaches it via the c.oklch view; lightness/chroma/hue tweaks there are perceptually even.',
			'Its registered methods gamutMap, maxChroma, isInGamut, atLightness, and atChroma let you keep a color in a target gamut while holding hue and tweaking only chroma or lightness.',
			"rotateHue, complementary, triadic, and analogous build perceptually even harmonies that translate cleanly into any other model's view."
		],
		relations: {
			derivedFrom: ['oklab'],
			convertsTo: ['oklab', 'lms', 'xyz', 'srgb'],
			related: ['jch', 'lch65', 'lch', 'okhsl', 'hct']
		},
		resources: [
			{
				label: 'Bjorn Ottosson - A perceptual color space (Oklab)',
				url: 'https://bottosson.github.io/posts/oklab/'
			},
			{ label: 'oklch.com - interactive OKLCH color picker', url: 'https://oklch.com' },
			{
				label: 'W3C CSS Color Module Level 4 - oklch()',
				url: 'https://www.w3.org/TR/css-color-4/'
			},
			{ label: 'Oklab - Wikipedia', url: 'https://en.wikipedia.org/wiki/Oklab' }
		]
	},
	oklab: {
		summary:
			"Björn Ottosson's 2020 perceptual space that fixes CIELAB's blues and dark tones with simpler math",
		whatItIs:
			'Oklab is a modern opponent-color space proposed by Björn Ottosson in 2020 to be a more accurate perceptual model than CIELAB for sRGB and similar displays. It has lightness L plus a green-red axis (a) and a blue-yellow axis (b), named like CIELAB but computed differently. Internally it converts linear XYZ to an LMS cone space, applies a cube-root nonlinearity, then a matrix tuned with CAM16 uniformity data, which gives it cleaner hue linearity and lightness than CIELAB and a near drop-in for the complex CAM16.',
		usedFor: [
			'Gradient and color-mix interpolation (the CSS color-mix() default space)',
			'Perceptually correct blending without muddy mid-tones',
			'Gamut mapping and palette generation for UI',
			'CSS color authoring via oklab()',
			'Fast color-difference estimates competitive with deltaE2000'
		],
		benefitsHere: [
			'OKLAB(l,a,b) reconstructs a color from rectangular opponent coordinates, and c.oklab views any stored color in this space directly',
			'mix() blends in Oklab, the perceptually correct default interpolation space, so gradients stay even',
			'deltaEok gives a fast Euclidean color difference that rivals deltaE2000 for everyday work',
			'Stable and backed by culori, so the math is production-faithful, not a stub'
		],
		relations: {
			derivedFrom: ['lms', 'xyz'],
			convertsTo: ['oklch', 'okhsl', 'okhsv'],
			related: ['lab', 'ipt', 'cam16ucs', 'jab', 'itp']
		},
		resources: [
			{ label: 'Oklab — Wikipedia', url: 'https://en.wikipedia.org/wiki/Oklab' },
			{
				label: 'Björn Ottosson — A perceptual color space for image processing',
				url: 'https://bottosson.github.io/posts/oklab/'
			},
			{
				label: 'W3C CSS Color Module Level 4 — oklab()/oklch()',
				url: 'https://www.w3.org/TR/css-color-4/'
			}
		]
	},
	hsl: {
		summary:
			"The web's default cylindrical model — hue angle, saturation, and a lightness that runs black to color to white",
		whatItIs:
			"HSL (Hue, Saturation, Lightness) is a cylindrical-coordinate transform of sRGB, formally described by Joblove and Greenberg in 1978 to align with artists' notions of tint, shade, and tone. Hue is the angle around the color wheel, saturation is the radial distance from gray, and lightness is the average of the maximum and minimum of the RGB components — so L=0 is black, L=1 is white, and L=0.5 is the fully saturated 'pure' color. This yields a double-cone geometry that collapses to a point at pure black and white and is widest at mid-lightness. It is intuitive to manipulate but not perceptually uniform.",
		usedFor: [
			'CSS and web design via the native hsl() / hsla() functions',
			'Building tint, shade, and tone ramps from a base color',
			'Color pickers and sliders in design tools like Illustrator and Inkscape',
			'Quick, human-readable color adjustments in UI code',
			'Generating simple harmony schemes (complementary, triadic, analogous) by rotating hue'
		],
		benefitsHere: [
			'Construct or rebuild a color directly with HSL(h, s, l), or read a channel off any color via the .hsl view — e.g. OKLCH(0.7,0.12,250).hsl.h.',
			"Reach for HSL's registered tint, shade, and tone methods to add white, black, or gray without leaving the model.",
			'Use rotateHue, complementary, triadic, and analogous on the .hsl view for fast wheel-based scheme building.',
			'Stable and fully backed; the most familiar space for emitting CSS hsl() strings, though OKLCH is preferable when perceptual uniformity matters.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'hsv', 'hwb', 'hsi'],
			related: ['hsv', 'hwb', 'hsi', 'hsluv', 'oklch']
		},
		resources: [
			{ label: 'HSL and HSV - Wikipedia', url: 'https://en.wikipedia.org/wiki/HSL_and_HSV' },
			{
				label: 'hsl() - MDN Web Docs',
				url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl'
			},
			{ label: 'CSS Color Module Level 4 (W3C)', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	hsv: {
		summary:
			'The original cylindrical RGB model (Alvy Ray Smith, 1978) where Value tracks the brightest channel',
		whatItIs:
			"HSV (Hue, Saturation, Value), also called HSB, is the original cylindrical transform of RGB, introduced by Alvy Ray Smith in 1978 as an efficient 'hexcone' model. Picturing the RGB cube standing on its black corner, hue is the angle around the neutral axis, value is the height (V = max of R, G, B), and saturation is the radial distance from gray. V=1, S=1 gives the purest, brightest version of a hue; lowering S adds white and lowering V adds black. It is intuitive for selection but not perceptually uniform, and is asymmetric in that V=1 can be either vivid or white depending on saturation.",
		usedFor: [
			'The default model behind most color-picker UIs (Photoshop, GIMP)',
			"Interactive color selection where 'pick a hue, then brightness and vividness' is natural",
			'Graphics and image-editing software internals',
			'Quick conversions to and from RGB for shading and tinting',
			'Thresholding and masking in basic image processing'
		],
		benefitsHere: [
			'Construct with HSV(h, s, v) or read channels through the .hsv view — e.g. c.hsv.v for the brightest-channel value.',
			'Use the registered rotateHue, complementary, triadic, and analogous methods to spin harmony sets around the wheel.',
			'Pair the .hsv and .hsl views to compare value-based versus lightness-based brightness on the same color.',
			"Stable and fully backed; ideal when mirroring a classic picker's hue/saturation/value sliders inside the DSL."
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'hsl', 'hsi', 'hwb'],
			related: ['hsl', 'hwb', 'hsi', 'hsp', 'okhsv']
		},
		resources: [
			{ label: 'HSL and HSV - Wikipedia', url: 'https://en.wikipedia.org/wiki/HSL_and_HSV' },
			{
				label: 'Convert between RGB, YUV, HSV (Getreuer)',
				url: 'https://getreuer.info/posts/colorspace/'
			},
			{ label: 'CSS Color Module Level 4 (W3C)', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	hwb: {
		summary:
			'Describes a hue mixed with amounts of white and black — the most painter-intuitive cylindrical model',
		whatItIs:
			"HWB (Hue, Whiteness, Blackness) is a cylindrical model proposed by Alvy Ray Smith and Eric Lyons in 1996 as a more intuitive alternative to HSL and HSV. It keeps the same hue angle but replaces saturation and value with whiteness and blackness: a color is a pure hue with some fraction of white and some fraction of black mixed in, the remainder (1 − W − B) being the pure hue. When W + B reaches or exceeds 1 the hue is lost and the result is gray, so every HWB value maps to a valid color. Conceptually simple ('add x% white, y% black') but, like its siblings, not perceptually uniform and tied to sRGB.",
		usedFor: [
			"Intuitive 'add white / add black' color mixing for designers",
			'CSS via the Color Level 4 hwb() function',
			'Creating tint and shade scales from a base hue',
			'Teaching and tooling where painter-style mixing is clearer than saturation/value',
			'Generating grayscale fallbacks when whiteness plus blackness saturates'
		],
		benefitsHere: [
			'Construct with HWB(h, w, b) or inspect any color via the .hwb view to read its whiteness and blackness.',
			'Use the registered addWhite and addBlack methods for direct tint/shade operations, plus pureHue to strip back to the full-saturation hue.',
			'Call isGray to test whether whiteness plus blackness has washed the hue out.',
			'Stable and fully backed; the cleanest space for emitting CSS hwb() strings and painter-style mixing.'
		],
		relations: {
			derivedFrom: ['hsv', 'srgb'],
			convertsTo: ['hsv', 'srgb', 'hsl'],
			related: ['hsv', 'hsl', 'hsi', 'hsp']
		},
		resources: [
			{
				label: 'HWB color model - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/HWB_color_model'
			},
			{
				label: 'hwb() - MDN Web Docs',
				url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb'
			},
			{ label: 'Alvy Ray Smith - hwb2rgb paper', url: 'http://alvyray.com/Papers/CG/hwb2rgb.htm' },
			{ label: 'CSS Color Module Level 4 (W3C)', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	lab: {
		summary:
			'CIELAB (1976), the industrial workhorse where a delta-E of about 1 is a just-noticeable difference',
		whatItIs:
			"CIELAB, defined by the CIE in 1976 and usually just called Lab, is a device-independent perceptual space derived from CIE XYZ through a cube-root transform that mimics the eye's nonlinear response. Its coordinates are L* (lightness 0-100), a* (green-red), and b* (blue-yellow), and it spans the entire visible range, including colors outside common RGB gamuts. It is approximately perceptually uniform, so Euclidean distance corresponds roughly to perceived difference, which made it the standard in paint, textile, and printing industries and the foundation for the delta-E family of difference formulas.",
		usedFor: [
			'Color-difference measurement and quality control (delta-E)',
			'ICC color management and print color matching',
			'Color correction and grading that separates lightness from chroma',
			'Industrial paint, textile, and ink specification',
			'Luminance-only sharpening that leaves chroma untouched'
		],
		benefitsHere: [
			'LAB(l,a,b) builds a color from opponent coordinates, and c.lab views any color in CIELAB for measurement',
			'deltaE2000 gives the gold-standard difference, with deltaE76, deltaE94, and deltaECMC for legacy and textile workflows',
			'isPerceptiblyDifferent answers whether two colors differ above a deltaE2000 threshold for pass/fail QC',
			'Stable and backed, so difference numbers are faithful for real color work'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['lch', 'srgb'],
			related: ['lab65', 'luv', 'oklab', 'dlab', 'hlab', 'cam16ucs']
		},
		resources: [
			{
				label: 'CIELAB color space — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/CIELAB_color_space'
			},
			{ label: 'Bruce Lindbloom — XYZ to Lab math', url: 'http://www.brucelindbloom.com/' },
			{ label: 'W3C CSS Color Module Level 4', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	lch: {
		summary:
			'Cylindrical CIELAB expressing color as lightness, chroma, and hue for intuitive perceptual editing',
		whatItIs:
			'CIE LCh is the cylindrical (polar) form of CIELAB, converting the a*/b* pair into chroma C* and hue angle h while keeping L* unchanged. It exposes lightness, chroma, and hue separately, like HSL but on a perceptually uniform base, so equal numeric steps look more evenly spaced than they would in HSL. It is the Lab-based form used by CSS lch() and is preferred over rectangular Lab for palette and gradient design; not every C*,h pair maps to a real color, since high chroma can fall out of gamut, especially for blues.',
		usedFor: [
			'Perceptually uniform palette and theme design',
			'Smooth gradients that avoid muddy RGB mid-tones',
			'Hue rotation and chroma adjustment that preserve lightness',
			'Accessible color systems built on chroma and lightness contrast',
			'CSS color authoring via lch()'
		],
		benefitsHere: [
			'LCH(l,c,h) reconstructs a color from lightness, chroma, and hue, and c.lch views any color in this cylindrical Lab form',
			'deltaE2000, deltaE76, deltaE94, and deltaECMC compute color difference directly from the LCh view',
			'isPerceptiblyDifferent flags whether a chroma or hue tweak crossed a noticeable threshold',
			"Stable and backed, sharing CIELAB's faithful math via culori"
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['lab', 'srgb'],
			related: ['lch65', 'lchuv', 'oklch', 'dlch', 'luv']
		},
		resources: [
			{ label: 'CIELCh(ab) — Wikipedia', url: 'https://en.wikipedia.org/wiki/CIELCh_ab' },
			{
				label: 'Smashing Magazine — A Guide To Modern CSS Colors',
				url: 'https://www.smashingmagazine.com/2021/11/guide-modern-css-colors/'
			},
			{ label: 'W3C CSS Color Module Level 4', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	srgb: {
		summary:
			'The standard RGB space of the web and consumer displays (IEC 61966-2-1), D65 white point and a ~2.2 gamma curve',
		whatItIs:
			'sRGB is the default RGB color space for the web and consumer devices, co-developed by HP and Microsoft in 1996 and standardized as IEC 61966-2-1. It fixes a specific set of primaries, a D65 white point, and a piecewise transfer function approximating a ~2.2 gamma. CSS rgb() and hex (#RRGGBB) are interpreted as sRGB by default, which makes it the universal interchange format for digital color.',
		usedFor: [
			'Web pages and CSS colors (rgb() and hex default to sRGB)',
			'Consumer monitors, phones, and image interchange',
			'PNG/JPEG image storage and general digital output',
			'Cross-device color matching under typical office/home viewing',
			'The baseline gamut for accessibility and contrast checks'
		],
		benefitsHere: [
			'Build colors directly with the RGB(r,g,b) constructor or pull the c.srgb view to read 8-bit r/g/b for any color',
			'Run accessibility math on it: contrastWCAG, meetsAA, meetsAAA, and luminance evaluate WCAG contrast straight from the sRGB view',
			'Use invert, grayscale, and simulateCVD to preview color-vision-deficiency and tonal transforms in the display space users actually see',
			'Stable status means the conversions are exact culori-backed math, not approximations'
		],
		relations: {
			derivedFrom: ['xyz', 'lin'],
			convertsTo: ['lin', 'xyz', 'hsl', 'hsv', 'lab'],
			related: ['lin', 'p3', 'scrgb', 'a98', 'rec2020']
		},
		resources: [
			{ label: 'Wikipedia: sRGB', url: 'https://en.wikipedia.org/wiki/SRGB' },
			{
				label: 'W3C CSS Color Module Level 4 — sRGB',
				url: 'https://www.w3.org/TR/css-color-4/#predefined-sRGB'
			},
			{
				label: 'Bruce Lindbloom — color math & RGB/XYZ matrices',
				url: 'http://www.brucelindbloom.com/'
			}
		]
	},
	lin: {
		summary:
			'sRGB with the gamma curve removed, so values are proportional to physical light — the correct space for color math',
		whatItIs:
			"Linear sRGB is the gamma-linearized form of sRGB: the sRGB transfer function is undone so channel values become proportional to physical light intensity. It shares sRGB's primaries and D65 white point, differing only in the absence of gamma. This makes it the physically correct space for color arithmetic — blending, interpolation, alpha compositing, and shader math — and the required intermediate for sRGB to CIE XYZ conversions.",
		usedFor: [
			'Blending and mixing colors so results match physical light',
			'Alpha compositing and premultiplied-alpha pipelines',
			'Shader and GPU rendering math',
			'Image resizing and filtering without gamma artifacts',
			'Serving as the bridge between sRGB display values and CIE XYZ'
		],
		benefitsHere: [
			'Reach the c.lin view whenever you need light-linear r/g/b instead of gamma-encoded sRGB values',
			'Use blend to mix two colors in linear light — the physically correct way, avoiding the muddy midpoints of blending in gamma sRGB',
			'Use premultiply to prepare premultiplied-alpha values for correct compositing',
			'Has no DSL constructor of its own; it is a derived view of sRGB, so build with RGB(...) and read .lin'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'xyz', 'scrgb'],
			related: ['srgb', 'scrgb', 'xyz']
		},
		resources: [
			{
				label: 'Wikipedia: sRGB transfer function',
				url: 'https://en.wikipedia.org/wiki/SRGB#Transfer_function_("gamma")'
			},
			{
				label: 'W3C CSS Color Module Level 4 — linear-sRGB',
				url: 'https://www.w3.org/TR/css-color-4/#predefined-sRGB-linear'
			},
			{
				label: 'Bruce Lindbloom — RGB working space math',
				url: 'http://www.brucelindbloom.com/index.html?Eqn_RGB_to_XYZ.html'
			}
		]
	},
	p3: {
		summary:
			"Apple's wide-gamut display space — DCI P3 primaries with sRGB's D65 white point and ~2.2 gamma, ~25% wider than sRGB",
		whatItIs:
			"Display P3 is Apple's adaptation of the digital-cinema DCI P3 space for consumer displays. It keeps DCI P3's wide primaries but pairs them with sRGB's D65 white point and the sRGB ~2.2 transfer function, yielding a gamut roughly 25% wider than sRGB while staying D65-compatible. It has been the default color space on iPhone, iPad, and Mac since around 2016 and is available in CSS via color(display-p3 r g b).",
		usedFor: [
			'Wide-gamut web and app design targeting Apple devices',
			'Richer, more saturated reds and greens than sRGB can show',
			'CSS authoring with color(display-p3 ...)',
			'Modern photo and video display on P3-capable screens',
			'Checking whether a color exceeds the sRGB gamut'
		],
		benefitsHere: [
			'Construct P3-native colors with P3(r,g,b) or read the c.p3 view to get wide-gamut r/g/b for any color',
			'Call isInGamut to test whether a color fits inside Display P3 before committing to a wide-gamut value',
			'Run contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, and simulateCVD on the P3 view for accessible wide-gamut design',
			'Stable status: culori handles the sRGB↔P3 transform exactly'
		],
		relations: {
			derivedFrom: ['xyz', 'srgb'],
			convertsTo: ['srgb', 'xyz', 'rec2020'],
			related: ['srgb', 'rec2020', 'a98', 'smptec']
		},
		resources: [
			{
				label: 'Wikipedia: Display P3 / DCI-P3',
				url: 'https://en.wikipedia.org/wiki/DCI-P3#Display_P3'
			},
			{
				label: 'W3C CSS Color Module Level 4 — display-p3',
				url: 'https://www.w3.org/TR/css-color-4/#predefined-display-p3'
			},
			{
				label: 'WebKit — Wide Gamut Color in CSS with Display P3',
				url: 'https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/'
			}
		]
	},
	xyz: {
		summary:
			'The CIE 1931 master reference space derived from human color-matching — the hub every other space converts through',
		whatItIs:
			"CIE XYZ is the foundational, device-independent color space of modern colorimetry, defined by the CIE in 1931 from human color-matching experiments. Its three values come from integrating a light's spectral power against the standard observer's color-matching functions x̄, ȳ, z̄. The X, Y, Z primaries are deliberately fictitious (non-physical) so that every visible color lands at positive coordinates, and Y is constructed to equal luminance. It is linear and additive but not perceptually uniform, which is why it serves as a conversion hub rather than a picking space.",
		usedFor: [
			'Universal interchange/connection space when converting between any two color spaces',
			'Defining and characterizing other spaces (sRGB, Lab, Luv, Oklab) via 3x3 matrices',
			'Specifying standard illuminants and reference white points',
			'Device-independent color management and colorimetric calculations',
			'Computing chromaticity coordinates and gamut boundaries'
		],
		benefitsHere: [
			'Reach for the `c.xyz` view (or `XYZ(x,y,z)`) when you need raw, linear tristimulus values rather than a perceptual or device readout — it is the physically additive root of the pipeline',
			'Stable and backed: use `scaleLuminance` to brighten or dim a color by acting directly on the Y (luminance) axis without disturbing its chromaticity',
			"Because Chromatics routes every model through a culori-backed core, `c.xyz` is the natural place to inspect what a color 'really is' before it is re-expressed in any other space"
		],
		relations: {
			convertsTo: ['xyy', 'lab', 'luv', 'lms', 'srgb', 'xyz50'],
			related: ['xyz50', 'xyy', 'ucs60', 'ucs', 'lms', 'lab']
		},
		resources: [
			{
				label: 'Wikipedia: CIE 1931 color space',
				url: 'https://en.wikipedia.org/wiki/CIE_1931_color_space'
			},
			{ label: 'Bruce Lindbloom: XYZ ↔ RGB matrices', url: 'http://www.brucelindbloom.com/' },
			{ label: 'EasyRGB: color math', url: 'https://www.easyrgb.com/en/math.php' }
		]
	},
	a98: {
		summary:
			"Adobe's 1998 wide-gamut RGB covering ~50% of visible colors vs sRGB's ~35%, the standard for photography and print prep",
		whatItIs:
			"Adobe RGB (1998) is a wide-gamut RGB color space developed by Adobe, covering roughly 50% of CIE Lab visible colors against sRGB's ~35%. Its extra reach is most pronounced in the cyan-green region, and it uses a D65 white point with a 2.2 gamma. It became the standard working space for professional photography and high-quality print, giving better CMYK conversion coverage than sRGB.",
		usedFor: [
			'Professional photography and RAW editing workflows',
			'Print preparation where CMYK coverage matters',
			'Capturing saturated cyan-green tones sRGB cannot hold',
			'Color matching across print and digital media',
			'Wide-gamut editing before export to a delivery space'
		],
		benefitsHere: [
			'Build Adobe RGB colors with A98(r,g,b) or read the c.a98 view to see wide-gamut r/g/b for any color',
			'Call isInGamut to check whether a color is reproducible within Adobe RGB',
			'Apply contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, and simulateCVD on the Adobe RGB view',
			'Stable status: the sRGB↔Adobe RGB matrix and gamma are handled exactly by culori'
		],
		relations: {
			derivedFrom: ['xyz', 'srgb'],
			convertsTo: ['srgb', 'xyz', 'cmyk'],
			related: ['srgb', 'prophoto', 'p3', 'rec2020']
		},
		resources: [
			{
				label: 'Wikipedia: Adobe RGB color space',
				url: 'https://en.wikipedia.org/wiki/Adobe_RGB_color_space'
			},
			{
				label: 'Bruce Lindbloom — RGB working space data',
				url: 'http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html'
			}
		]
	},
	prophoto: {
		summary:
			"Kodak's extremely wide-gamut RGB (ROMM RGB) covering ~90% of visible colors — ~13% of it lies outside human vision",
		whatItIs:
			'ProPhoto RGB, also called ROMM RGB, is an extremely wide-gamut RGB space developed by Kodak that covers roughly 90% of CIE Lab visible colors — larger than Adobe RGB — using a D50 white point. It is built for archival photography and high-fidelity RAW editing, preserving maximum information from camera sensors. A notable caution: about 13% of its gamut is imaginary, lying outside human vision, so colors must be gamut-mapped before display.',
		usedFor: [
			'Editing RAW images with maximum color preservation',
			'Archival storage of high-fidelity photographs',
			'Holding extreme highlight and shadow detail',
			'Lightroom / Capture One wide-gamut editing pipelines',
			'Master space before converting to a narrower delivery gamut'
		],
		benefitsHere: [
			'Build with PROPHOTO(r,g,b) or read the c.prophoto view to access its extremely wide r/g/b for any color',
			"Call isInGamut to detect when a color falls outside ProPhoto's enormous gamut",
			'Run contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, and simulateCVD on the ProPhoto view',
			'Stable status, but note the D50 reference and that ~13% of the gamut is imaginary — gamut-map to sRGB or P3 before display'
		],
		relations: {
			derivedFrom: ['xyz50', 'xyz'],
			convertsTo: ['srgb', 'xyz50', 'lab'],
			related: ['a98', 'aces', 'rec2020', 'srgb']
		},
		resources: [
			{
				label: 'Wikipedia: ProPhoto RGB color space',
				url: 'https://en.wikipedia.org/wiki/ProPhoto_RGB_color_space'
			},
			{
				label: 'Bruce Lindbloom — RGB working space data',
				url: 'http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html'
			}
		]
	},
	rec2020: {
		summary:
			'The ITU standard for Ultra HD and HDR TV (BT.2020), monochromatic laser primaries covering ~76% of CIE 1931 xy',
		whatItIs:
			"Rec. 2020 (ITU-R BT.2020) is the RGB color space for Ultra High Definition and HDR television. Its primaries are monochromatic spectral wavelengths (R=630nm, G=532nm, B=467nm) on a D65 white point, giving a gamut covering ~75.8% of CIE 1931 xy versus sRGB's ~35.9%. It is required for 4K/8K UHD and HDR delivery and underpins modern broadcast and streaming pipelines.",
		usedFor: [
			'4K/8K Ultra HD content mastering and delivery',
			'HDR video production and grading',
			'Modern broadcast and streaming color pipelines',
			'Holding highly saturated colors beyond Rec. 709/sRGB',
			'Source space for ICtCp and Rec. 2100 HDR encodings'
		],
		benefitsHere: [
			'Build with REC2020(r,g,b) or read the c.rec2020 view to get wide-gamut r/g/b for any color',
			'Call isInGamut to check whether a color is reproducible within Rec. 2020',
			'Apply contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, and simulateCVD on the Rec. 2020 view',
			'Stable status: a natural companion to the c.itp (ICtCp) and c.rec2100 views for HDR work'
		],
		relations: {
			derivedFrom: ['xyz', 'srgb'],
			convertsTo: ['srgb', 'xyz', 'itp', 'rec2100'],
			related: ['p3', 'rec2100', 'itp', 'srgb', 'smptec']
		},
		resources: [
			{ label: 'Wikipedia: Rec. 2020', url: 'https://en.wikipedia.org/wiki/Rec._2020' },
			{
				label: 'W3C CSS Color Module Level 4 — predefined color spaces',
				url: 'https://www.w3.org/TR/css-color-4/#predefined'
			},
			{ label: 'colour-science.org', url: 'https://www.colour-science.org/' }
		]
	},
	luv: {
		summary:
			'CIELUV (1976), a uniform space tuned for additive light mixing and the basis for HSLuv',
		whatItIs:
			"CIELUV is a 1976 CIE uniform space, parallel to CIELAB but formulated for consistency in additive mixtures of lights and displays. Its coordinates are L* (lightness, same 0-100 scale as Lab) plus u* and v*, derived from the CIE 1976 u',v' uniform chromaticity diagram. Its defining trait is linearity under tristimulus addition: mixing two lights mixes their LUV coordinates in proportion to luminance, which Lab cannot do, and lines of constant hue pass through the white point. It allocates blue hues more uniformly than Lab and underlies HSLuv and HPLuv.",
		usedFor: [
			'Lighting and LED design where lights add linearly',
			'Display color interpolation and gradients',
			'Color-difference (delta-E) evaluation for emissive media',
			'Computing correlated color temperature inputs',
			'Foundation for the HSLuv and HPLuv palette systems'
		],
		benefitsHere: [
			'LUV(l,u,v) builds a color from CIELUV opponent coordinates, and c.luv views any color in this additive-friendly space',
			'deltaEuv gives the Euclidean Luv difference, alongside deltaE2000, deltaE76, deltaE94, and deltaECMC',
			'isPerceptiblyDifferent reports whether two lights differ above a noticeable threshold',
			'Stable and backed, so the additive-mixing behavior is faithful'
		],
		relations: {
			derivedFrom: ['xyz', 'ucs'],
			convertsTo: ['lchuv', 'hsluv', 'srgb'],
			related: ['lab', 'lchuv', 'hpluv', 'oklab']
		},
		resources: [
			{ label: 'CIELUV color space — Wikipedia', url: 'https://en.wikipedia.org/wiki/CIELUV' },
			{ label: 'HSLuv reference', url: 'https://www.hsluv.org/' },
			{ label: 'Bruce Lindbloom — color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	lchuv: {
		summary:
			'Cylindrical form of CIELUV; lines of constant hue pass through the white point, making it the basis of HSLuv',
		whatItIs:
			'LCHuv (CIELCh(uv)) is the polar representation of the CIE 1976 L*u*v* space, giving Lightness, Chroma, and Hue. Because CIELUV is built around additive (light) mixing, straight lines of constant hue in LCHuv pass through the white point, which suits lighting and additive-blend contexts better than the Lab-based LCHab. It is the mathematical foundation for the HSLuv and HPLuv reparameterizations and defaults to the D65 white point.',
		usedFor: [
			'Additive color and lighting palette design',
			'Hue interpolation where constant-hue lines stay true',
			'Professional photo editing needing perceptual control',
			'Serving as the substrate for HSLuv and HPLuv',
			'Chroma and saturation scaling at fixed hue'
		],
		benefitsHere: [
			'Reach LCHuv through the c.lchuv view or the LCHUV(l, c, h) constructor when you specifically want the Luv-based, additive-friendly cylinder rather than the Lab-based LCH.',
			'It carries the full Lab delta-E suite (deltaE2000, deltaE76, deltaE94, deltaECMC, isPerceptiblyDifferent) plus rotateHue, so you can measure perceptual difference and rotate hue in one space.',
			'Pairs naturally with the hsluv and hpluv views, which are direct reparameterizations of this space.'
		],
		relations: {
			derivedFrom: ['luv', 'xyz'],
			convertsTo: ['luv', 'xyz', 'hsluv', 'hpluv'],
			related: ['lch', 'lch65', 'oklch', 'hsluv']
		},
		resources: [
			{ label: 'CIELCh(uv) - Wikipedia', url: 'https://en.wikipedia.org/wiki/CIELUV' },
			{ label: 'HSLuv reference', url: 'https://www.hsluv.org/' },
			{
				label: 'colormath - LCHuv',
				url: 'https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-l-c-huv/'
			}
		]
	},
	lab65: {
		summary:
			'The D65-referenced CIELAB, same cube-root uniformity but tied to the display white instead of print D50',
		whatItIs:
			'Lab (D65) is the D65-referenced variant of CIELAB. It uses the exact same cube-root transform of XYZ and the same approximate perceptual uniformity, where a delta-E of about 1 is just noticeable, but it normalizes against the D65 white point rather than the print-default D50 used by ICC connection spaces. This makes it the natural CIELAB form for display-referred work, since web and screen colors are themselves defined against D65 and need no chromatic adaptation.',
		usedFor: [
			'Display-referred color difference where D65 is the working white',
			'Web and screen color measurement without D50 adaptation',
			'Color correction and grading for monitors and broadcast',
			'Cross-checking sRGB or P3 colors in a uniform space',
			'Delta-E evaluation aligned to the display white point'
		],
		benefitsHere: [
			'LAB65(l,a,b) builds a color in D65 CIELAB, and c.lab65 views any color against the display white',
			'deltaE2000, deltaE76, deltaE94, and deltaECMC measure difference directly in the D65 frame',
			'isPerceptiblyDifferent flags noticeable differences for screen-referred QC',
			'Stable and backed, distinct from the D50 lab view so you pick the right white point'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['lch65', 'srgb'],
			related: ['lab', 'lch65', 'luv', 'oklab']
		},
		resources: [
			{
				label: 'CIELAB color space — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/CIELAB_color_space'
			},
			{ label: 'Bruce Lindbloom — XYZ to Lab math', url: 'http://www.brucelindbloom.com/' },
			{ label: 'W3C CSS Color Module Level 4', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	lch65: {
		summary:
			'The D65-referenced cylindrical form of CIELAB, giving display-referred lightness, chroma, and hue separation',
		whatItIs:
			"LCH65 is CIELCh(ab) computed against the D65 white point rather than the print-default D50. It is the cylindrical (polar) form of CIELAB, expressing color as L* (lightness), C* (chroma), and h (hue angle), derived by C*=sqrt(a*^2+b*^2) and h=atan2(b*, a*). Using D65 aligns it with display and web color, where sRGB and most monitors are D65-referenced, so it is the natural variant for screen palette work that still wants Lab's perceptual structure.",
		usedFor: [
			'Display-referred palette and gradient design',
			'Perceptually uniform color manipulation on screens',
			'Hue, chroma, and lightness separation for accessible contrast',
			'Smooth LCH interpolation avoiding muddy RGB midpoints',
			'Harmonious scheme generation on a uniform base'
		],
		benefitsHere: [
			'Use the c.lch65 view or LCH65(l, c, h) constructor when you want CIELCh under the D65 white point that matches sRGB and display output, instead of the D50-referenced lch view.',
			'It exposes the Lab delta-E family (deltaE2000, deltaE76, deltaE94, deltaECMC, isPerceptiblyDifferent) for measuring perceived differences, plus rotateHue for in-space hue moves.',
			'Different hues reach different maximum real chroma, so combine it with the OKLCH gamutMap view when a high-chroma blue needs to be brought back into gamut.'
		],
		relations: {
			derivedFrom: ['lab65', 'xyz'],
			convertsTo: ['lab65', 'xyz', 'srgb'],
			related: ['lch', 'lchuv', 'oklch', 'dlch', 'jch']
		},
		resources: [
			{ label: 'CIELCh_ab - Wikipedia', url: 'https://en.wikipedia.org/wiki/CIELAB_color_space' },
			{
				label: 'A Guide To Modern CSS Colors (Smashing Magazine)',
				url: 'https://www.smashingmagazine.com/2021/11/guide-modern-css-colors/'
			},
			{ label: 'W3C CSS Color Module Level 4', url: 'https://www.w3.org/TR/css-color-4/' }
		]
	},
	dlab: {
		summary:
			'DIN99o (DIN 6176), a rescaled CIELAB whose plain Euclidean distance approximates perceived difference',
		whatItIs:
			'DIN99o Lab is a German-standard (DIN 6176) transform of CIELAB that logarithmically compresses chroma and rotates the axes so that ordinary Euclidean distance closely tracks perceived color difference, a metric known as delta-E99o. It keeps Lab-like coordinates (L99, a99, b99) but squeezes the highly nonuniform regions of CIELAB into a near-uniform shape, giving an alternative to the more complex CIEDE2000 formula. It is used where a simple straight-line distance must stand in for perceived difference, particularly in industrial color tolerancing.',
		usedFor: [
			'Industrial color tolerancing with a single Euclidean delta-E99o',
			'Quality control where straight-line distance must equal perceived difference',
			'A simpler substitute for the CIEDE2000 weighting formula',
			'Textile, coatings, and automotive color matching under German standards',
			'Pass/fail color acceptance testing'
		],
		benefitsHere: [
			'DLAB(l,a,b) builds a color in the compressed DIN99o frame, and c.dlab views any color where plain distance equals difference',
			'deltaE99 gives the native DIN99o Euclidean difference, with deltaE2000, deltaE76, deltaE94, and deltaECMC also available',
			'isPerceptiblyDifferent flags noticeable differences using a near-uniform metric',
			'Stable and backed, so the DIN99o rescaling is computed faithfully'
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['dlch'],
			related: ['lab', 'dlch', 'luv', 'cam16ucs']
		},
		resources: [
			{
				label: 'Color difference (DIN99 formulas) — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Color_difference'
			},
			{ label: 'Bruce Lindbloom — color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	dlch: {
		summary:
			'The cylindrical form of DIN99o, where straight-line distance closely tracks perceived color difference',
		whatItIs:
			"DLCH is DIN99o LCh, the polar form of the DIN99o Lab space defined in the German DIN 6176 standard. DIN99o applies a logarithmic compression to CIELAB so that simple Euclidean (and here cylindrical) distance closely approximates perceived color difference, removing much of CIELAB's non-uniformity. In cylindrical form it gives a compressed lightness, chroma, and hue, letting you edit hue and chroma intuitively in a near-uniform space.",
		usedFor: [
			'Color-difference evaluation with simple Euclidean distance',
			'Industrial and textile color tolerancing (DIN 6176 contexts)',
			'Perceptually even hue and chroma editing',
			'Quality-control color matching',
			'Building palettes where equal steps look equal'
		],
		benefitsHere: [
			'Reach it via the c.dlch view or DLCH(l, c, h) constructor when you want a space whose distances are near-perceptually-uniform without the CAM16 machinery.',
			'Alongside the standard Lab delta-E suite (deltaE2000, deltaE76, deltaE94, deltaECMC, isPerceptiblyDifferent), its rectangular sibling dlab adds a dedicated deltaE99 for the DIN99 metric.',
			'rotateHue lets you spin hue inside the compressed cylinder where a fixed angular step stays visually consistent across the wheel.'
		],
		relations: {
			derivedFrom: ['dlab', 'lab', 'xyz'],
			convertsTo: ['dlab', 'lab', 'xyz'],
			related: ['lch', 'lch65', 'lchuv', 'oklch', 'jch']
		},
		resources: [
			{
				label: 'DIN99 color space - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/DIN99_color_space'
			},
			{
				label: 'Color difference - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Color_difference'
			}
		]
	},
	jab: {
		summary:
			'JzAzBz (2017), a perceptually uniform space built for HDR across starlight to sunlight (0-10,000 cd/m2)',
		whatItIs:
			'JzAzBz is a 2017 perceptual color space designed so Euclidean distance correlates with perceived difference across the full HDR luminance range, from starlight to bright sunlight (0-10,000 cd/m2). It builds on an LMS representation passed through the Perceptual Quantizer (PQ) curve from Rec. 2100, yielding lightness Jz with red-green (Az) and blue-yellow (Bz) opponent axes. Across high-luminance content it outperforms CIELAB, whose uniformity breaks down at HDR brightness levels.',
		usedFor: [
			'HDR imaging and video color-difference evaluation',
			'High-luminance display calibration',
			'Color analysis spanning very dark to very bright tones',
			'HDR gradient and tone work where Lab fails',
			'Precise delta-E across a wide brightness range'
		],
		benefitsHere: [
			'JAB(j,a,b) builds a color in the HDR-capable JzAzBz frame, and c.jab views any color in this PQ-based space',
			'deltaEz gives an HDR-aware color difference that holds up at high luminance where deltaE2000 weakens',
			'deltaE2000, deltaE76, deltaE94, and deltaECMC are also exposed for cross-comparison',
			'Stable and backed, so the PQ-based math is production-faithful'
		],
		relations: {
			derivedFrom: ['lms', 'xyz'],
			convertsTo: ['jch'],
			related: ['itp', 'oklab', 'lab', 'cam16ucs', 'rec2100']
		},
		resources: [
			{ label: 'JzAzBz — Wikipedia', url: 'https://en.wikipedia.org/wiki/JzAzBz' },
			{ label: 'colour-science.org — JzAzBz model', url: 'https://www.colour-science.org/' }
		]
	},
	jch: {
		summary:
			'Cylindrical form of JzAzBz, pairing HDR-capable perceptual uniformity with intuitive hue and chroma control',
		whatItIs:
			'JCH is JzCzHz, the polar representation of the JzAzBz space (Safdar et al., 2017), expressing color as Jz (HDR lightness), Cz (chroma), and hz (hue). JzAzBz was designed to be perceptually uniform across a very wide luminance range including HDR, and the cylindrical form keeps that uniformity while adding intuitive hue-based manipulation. It is well suited to high-luminance palette design and HDR grading where you want hue control in an HDR-ready space.',
		usedFor: [
			'HDR color manipulation and grading tools',
			'High-luminance palette design',
			'Perceptually uniform hue rotation across a wide dynamic range',
			'Wide-gamut, high-brightness gradient design',
			'Hue-based editing in an HDR-capable uniform space'
		],
		benefitsHere: [
			'Use the c.jch view or JCH(j, c, h) constructor when an OKLCH-style cylinder is wanted but the work spans HDR luminance that standard SDR spaces clip.',
			'It carries the full Lab delta-E suite (deltaE2000, deltaE76, deltaE94, deltaECMC, isPerceptiblyDifferent), while its rectangular sibling jab adds a dedicated deltaEz for the Jz metric.',
			'rotateHue spins hue inside the HDR-uniform cylinder, keeping perceived hue steps even even at high brightness.'
		],
		relations: {
			derivedFrom: ['jab', 'xyz'],
			convertsTo: ['jab', 'xyz', 'itp'],
			related: ['oklch', 'lch65', 'itp', 'rec2100', 'dlch']
		},
		resources: [
			{ label: 'JzAzBz - Wikipedia', url: 'https://en.wikipedia.org/wiki/JzAzBz' },
			{
				label: 'colour-science.org - JzAzBz / JzCzHz model',
				url: 'https://www.colour-science.org/'
			},
			{
				label: 'colormath - JzCzHz',
				url: 'https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-jz-cz-hz/'
			}
		]
	},
	itp: {
		summary:
			"ICtCp (ITU-R BT.2100), Dolby's HDR model with constant-luminance intensity and two perceptual chroma axes",
		whatItIs:
			'ICtCp is a modern HDR video color model from Dolby, standardized in ITU-R BT.2100. It separates Intensity (I) from two chroma components, Ct (blue-yellow, tritan) and Cp (red-green, protan). Starting from linear Rec. 2020 RGB, it applies the PQ or HLG curve to an LMS representation, then a decorrelation matrix, producing a near constant-luminance signal that is far more perceptually uniform than YCbCr for wide-gamut HDR. That uniformity lets chroma be subsampled or quantized with fewer visible errors, which is why Dolby Vision uses it internally.',
		usedFor: [
			'HDR video encoding and Dolby Vision processing',
			'More efficient chroma subsampling than YCbCr',
			'Rec. 2100 and HDR10+ production workflows',
			'Constant-luminance representation for HDR grading',
			'Perceptually consistent HDR color-difference measurement'
		],
		benefitsHere: [
			'ITP(i,t,cp) builds a color in the ICtCp frame, and c.itp views any color in this HDR-aligned space',
			'deltaEitp gives the ITU-R BT.2124 HDR color difference designed for exactly this space',
			'deltaE2000, deltaE76, deltaE94, and deltaECMC are also available for comparison',
			'Stable and backed, so the PQ/HLG and decorrelation math is faithful'
		],
		relations: {
			derivedFrom: ['lms', 'rec2020'],
			convertsTo: ['xyz', 'jab'],
			related: ['ycbcr', 'rec2100', 'jab', 'oklab']
		},
		resources: [
			{ label: 'ICtCp — Wikipedia', url: 'https://en.wikipedia.org/wiki/ICtCp' },
			{
				label: 'Dolby — ICtCp white paper (Hill et al.)',
				url: 'https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf'
			}
		]
	},
	hsi: {
		summary:
			'Cylindrical RGB model whose Intensity is the plain average of R, G, B — the grayscale image itself',
		whatItIs:
			'HSI (Hue, Saturation, Intensity) is a cylindrical representation of RGB, similar to HSL and HSV but defining intensity as the simple arithmetic mean I = (R + G + B) / 3. Hue is the same wheel angle as its siblings, and saturation measures distance from a gray of equal intensity. Because intensity weights all three channels equally rather than emphasizing the max or the extremes, the I channel is essentially the grayscale version of the image. That property makes overall illumination changes affect I while leaving hue and saturation largely intact, which is why HSI is favored in machine vision. Like the other RGB-cylinder models it is not perceptually uniform and is singular near black or zero saturation.',
		usedFor: [
			'Computer vision and image segmentation',
			'Color-based object detection under varying lighting',
			'Remote sensing and lighting-invariant analysis',
			'Edge detection and grayscale extraction (the I channel is the gray image)',
			"Separating 'how much light' from 'what color' in processing pipelines"
		],
		benefitsHere: [
			'Construct with HSI(h, s, i) or read the average-based intensity off any color via the .hsi view — e.g. c.hsi.i.',
			'Use rotateHue, complementary, triadic, and analogous on the .hsi view for wheel-based scheme work.',
			'Compare .hsi.i against .hsl.l and .hsv.v to see how mean-based intensity differs from lightness and value.',
			'Stable and fully backed; the right model when you want intensity defined as the true RGB average rather than a luma weighting.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'hsl', 'hsv'],
			related: ['hsl', 'hsv', 'hwb', 'hsp']
		},
		resources: [
			{
				label: 'HSI color space - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/HSI_color_space'
			},
			{ label: 'HSL and HSV - Wikipedia', url: 'https://en.wikipedia.org/wiki/HSL_and_HSV' },
			{
				label: 'HSI-RGB color converter equations (had2know)',
				url: 'https://www.had2know.org/technology/hsi-rgb-color-converter-equations.html'
			}
		]
	},
	okhsl: {
		summary:
			'A perceptual reparameterization of HSL built on Oklab, keeping familiar controls with even lightness and saturation',
		whatItIs:
			"Okhsl is Bjorn Ottosson's perceptual version of HSL, defined on top of the Oklab/OKLCH machinery. It keeps HSL's three familiar controls (hue, saturation, lightness) but redefines saturation and lightness so they behave perceptually evenly across hues and stay inside the sRGB gamut. In practice it is a near drop-in, gamut-aware replacement for HSL for palette and UI work where classic HSL's uneven brightness and saturation cause problems.",
		usedFor: [
			'Drop-in replacement for HSL in UI and design tools',
			'Generating palettes with even perceived lightness across hues',
			'Color pickers where saturation maps to the real sRGB gamut',
			'Consistent tint/shade ramps that hold perceived lightness',
			'Accessible color choices using familiar HSL-style sliders'
		],
		benefitsHere: [
			"Reach it through the c.okhsl view or OKHSL(h, s, l) constructor when you want HSL's mental model but with OKLCH-grade perceptual behavior under the hood.",
			"Because it shares Oklab's foundation, its saturation already respects the sRGB gamut, so palettes stay in range without a separate gamut-mapping pass.",
			'It exposes rotateHue plus the Lab delta-E suite (deltaE2000, deltaE76, deltaE94, deltaECMC, isPerceptiblyDifferent) for measuring how distinct generated swatches are.'
		],
		relations: {
			derivedFrom: ['oklab', 'oklch'],
			convertsTo: ['oklch', 'oklab', 'srgb'],
			related: ['okhsv', 'hsl', 'hsluv', 'oklch', 'hct']
		},
		resources: [
			{
				label: 'Bjorn Ottosson - Okhsv and Okhsl',
				url: 'https://bottosson.github.io/posts/colorpicker/'
			},
			{ label: 'Oklab - Wikipedia', url: 'https://en.wikipedia.org/wiki/Oklab' }
		]
	},
	okhsv: {
		summary:
			'A perceptual version of HSV built on Oklab, giving HSV-style controls with even brightness and reliable gamut mapping',
		whatItIs:
			"Okhsv is Bjorn Ottosson's perceptual reparameterization of HSV, defined on the Oklab/OKLCH foundation. It keeps HSV's hue, saturation, and value controls but redefines them so brightness and saturation behave consistently across hues and map reliably to the sRGB gamut. The result gives color pickers more predictable behavior than classic HSV, where equal value or saturation steps can look very different from one hue to another.",
		usedFor: [
			'Drop-in replacement for HSV in color pickers',
			'Building swatch grids with consistent perceived brightness',
			'Value/saturation sliders that track real in-gamut color',
			'Perceptually even palette generation with HSV-style controls',
			'UI tooling that wants HSV ergonomics without its quirks'
		],
		benefitsHere: [
			"Use the c.okhsv view or OKHSV(h, s, v) constructor when you want HSV's value-based model but with OKLCH-grade perceptual evenness and sRGB gamut awareness.",
			'Saturation and value already respect the sRGB gamut, so generated colors stay in range without extra clamping.',
			'It carries rotateHue and the Lab delta-E suite (deltaE2000, deltaE76, deltaE94, deltaECMC, isPerceptiblyDifferent) for rotating hue and checking how perceptibly distinct swatches are.'
		],
		relations: {
			derivedFrom: ['oklab', 'oklch'],
			convertsTo: ['oklch', 'oklab', 'srgb'],
			related: ['okhsl', 'hsv', 'hsl', 'oklch', 'hct']
		},
		resources: [
			{
				label: 'Bjorn Ottosson - Okhsv and Okhsl',
				url: 'https://bottosson.github.io/posts/colorpicker/'
			},
			{ label: 'Oklab - Wikipedia', url: 'https://en.wikipedia.org/wiki/Oklab' }
		]
	},
	cubehelix: {
		summary:
			"Dave Green's helical color scheme that climbs from black to white with strictly increasing luminance",
		whatItIs:
			'Cubehelix is a color scheme devised by astronomer Dave Green that traces a helix through the RGB cube while luminance rises monotonically from black to white. Rather than a fixed set of channels, it is parameterized by a start hue, the number of hue rotations, a hue/saturation amount, and a lightness fraction that increases steadily along the ramp. Because brightness ordering is preserved end to end, the scheme remains legible and correctly ordered even when reproduced in grayscale or on monochrome print — its original purpose for astronomical imaging. It is a sequential color map generator rather than a general-purpose color coordinate space.',
		usedFor: [
			'Scientific and astronomical data visualization color maps',
			'Sequential heatmaps that must survive grayscale printing',
			'Colorblind-considerate ramps with monotonic brightness',
			'Intensity imaging where correct luminance ordering matters',
			'Continuous data legends and shaded relief'
		],
		benefitsHere: [
			'Construct a point on the helix with CUBEHELIX(h, s, l) or read it off any color via the .cubehelix view.',
			"Use the registered rotateHue method to step the helix's hue along the ramp.",
			'Stable and fully backed, but note it is a sequential-ramp generator — for perceptual scheme building OKLCH or HSLuv are usually the better routing space.',
			"Pair the .cubehelix view with luminance checks on the .srgb view to confirm a ramp's brightness ordering."
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb'],
			related: ['hsl', 'hsluv', 'oklch']
		},
		resources: [
			{
				label: 'Cubehelix - Dave Green (MRAO, Cambridge)',
				url: 'https://www.mrao.cam.ac.uk/~dag/CUBEHELIX/'
			},
			{
				label:
					'Green, D. A. (2011), A colour scheme for the display of astronomical intensity images',
				url: 'https://arxiv.org/abs/1108.5083'
			}
		]
	},
	yiq: {
		summary:
			"NTSC television model splitting luma from in-phase and quadrature chroma, tuned to the eye's chroma sensitivity",
		whatItIs:
			'YIQ is the color model of the NTSC analog television system used in North America and Japan. It separates luminance (Y) from two chrominance signals, I (in-phase) and Q (quadrature), so a single broadcast remained backward compatible with black-and-white receivers, which read only the Y channel. It is essentially YUV rotated about 33 degrees so that the I axis aligns with the orange-cyan direction where human chroma sensitivity peaks, allowing more bandwidth to be allocated where the eye notices it most.',
		usedFor: [
			'Encoding and decoding legacy NTSC analog broadcast signals',
			'Restoring and converting archival North American television footage',
			'Bandwidth-efficient chroma allocation along the I/Q axes',
			'Educational illustration of luma-chroma separation in analog TV',
			'Color balancing where Y sets brightness and I/Q tune the chroma'
		],
		benefitsHere: [
			'Use the `YIQ(y,i,q)` constructor or the `c.yiq` view to inspect any color in NTSC luma-chroma terms; status is stable so the math runs faithfully.',
			'`scaleChroma` lets you scale the I/Q chrominance toward grayscale or oversaturation while preserving the Y luma.',
			'Lab-style difference methods (`deltaE2000`, `deltaE76`, `isPerceptiblyDifferent`) are registered for comparing colors after a YIQ round-trip.'
		],
		relations: {
			derivedFrom: ['yuv', 'srgb'],
			convertsTo: ['srgb', 'yuv'],
			related: ['yuv', 'ycbcr', 'ydbdr']
		},
		resources: [
			{ label: 'YIQ - Wikipedia', url: 'https://en.wikipedia.org/wiki/YIQ' },
			{ label: 'BlackIce: YIQ Colorspace', url: 'https://www.blackice.com/colorspaceYIQ.htm' }
		]
	},
	xyz50: {
		summary:
			'CIE XYZ normalized to a D50 white point — the ICC profile connection space used in color management and print',
		whatItIs:
			'CIE XYZ (D50) is the same CIE 1931 tristimulus space as standard XYZ, but referenced to the D50 illuminant instead of D65. D50 is the reference white for the ICC profile connection space (PCS), so this variant is the space in which color is exchanged inside ICC-based color management and print workflows. Converting between it and the D65-referenced XYZ requires a chromatic-adaptation transform (typically Bradford).',
		usedFor: [
			'ICC profile connection space (PCS) for color management',
			'Print and prepress color exchange where D50 is the viewing standard',
			'Converting between device profiles via a common D50 hub',
			'Computing D50-referenced Lab for graphic-arts work',
			'Cross-illuminant color matching'
		],
		benefitsHere: [
			'Use the `c.xyz50` view (or `XYZ50(x,y,z)`) when you specifically need D50-referenced tristimulus values for ICC/print-aligned work rather than the D65 default',
			'Stable and backed: `scaleLuminance` adjusts brightness along Y while keeping the D50-referenced chromaticity intact',
			'Pair it with `c.xyz` in the same session to see how Chromatics adapts a color between the D65 and D50 white points'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['xyz', 'lab', 'xyy'],
			related: ['xyz', 'lab', 'iccprofile']
		},
		resources: [
			{
				label: 'Wikipedia: CIE 1931 color space',
				url: 'https://en.wikipedia.org/wiki/CIE_1931_color_space'
			},
			{ label: 'Bruce Lindbloom: chromatic adaptation', url: 'http://www.brucelindbloom.com/' }
		]
	},
	xyb: {
		summary:
			"JPEG XL's internal perceptual transform — a modified LMS space with an asymmetric blue channel built for compression",
		whatItIs:
			"XYB is the internal perceptual color transform of the JPEG XL image format. It is a modified LMS cone space defined by X = L−M (red-green opponent), Y = (L+M)/2 (luma), and B = S−Y (blue-yellow opponent). The asymmetric blue channel exploits the eye's lower sensitivity to blue detail and noise, and the transform decorrelates natural-image content more effectively than the older YCbCr used in JPEG.",
		usedFor: [
			'Internal color representation in JPEG XL encoding/decoding',
			'Efficient lossy image compression and perceptual coding',
			'Decorrelating natural-image channels better than YCbCr',
			'Exploiting reduced human sensitivity to blue noise',
			'Research into next-generation image formats'
		],
		benefitsHere: [
			'Inspect the `c.xyb` view (or `XYB(x,y,b)`) to see how JPEG XL would internally encode a color — a window into a compression-oriented opponent space rather than a picking model',
			"Stable and backed with a `deltaExyb` method for measuring difference in XYB's own perceptual axes, useful when reasoning about compression-induced color shifts",
			'Compare it against the `c.lms` view to understand the L−M / S−Y opponent construction that XYB is built on'
		],
		relations: {
			derivedFrom: ['lms'],
			convertsTo: ['lms', 'xyz', 'srgb'],
			related: ['lms', 'ycbcr', 'itp']
		},
		resources: [
			{ label: 'Wikipedia: JPEG XL', url: 'https://en.wikipedia.org/wiki/JPEG_XL' },
			{ label: 'libjxl — reference implementation', url: 'https://github.com/libjxl/libjxl' }
		]
	},
	cmyk: {
		summary:
			'Four-color subtractive print model adding black (Key) to cyan, magenta, and yellow inks',
		whatItIs:
			'CMYK is the subtractive ink model used in color printing, extending CMY with a fourth K (black, or Key) channel. Ideal cyan, magenta, and yellow each absorb one third of white light, but in real inks combining all three yields a muddy brown, so black is added for true darks, sharper text, and lower ink cost. White is the bare paper and color builds up as inks subtract wavelengths. It is device-dependent: results shift with printer profile, ink set, and paper stock, and ICC profiles map it to and from CIE Lab (D50) for accurate reproduction.',
		usedFor: [
			'Offset and digital color printing of books, magazines, and packaging',
			'Preparing artwork for the four-color process press',
			'Estimating and limiting total ink coverage for a given paper and press',
			'Building rich blacks for large dark areas and deep shadow detail',
			'Gray component replacement (GCR) to swap CMY buildup for cheaper black ink',
			'Print proofing and color separation of images into plates'
		],
		benefitsHere: [
			'Reach for the `c.cmyk` view to inspect how any color separates into ink coverage, since every value already lives in OKLCH and routes through culori to CMYK as a view.',
			'Build a print-target color explicitly with the `CMYK(c,m,y,k)` constructor when you need to reason in ink terms rather than display channels.',
			'Status is experimental: the math is faithful but not ICC-certified, and methods like `totalInk`, `isRichBlack`, `limitInk`, `setKey`, and `separations` are real and runnable for press-constraint checks, not a substitute for a profiled RIP.'
		],
		relations: {
			derivedFrom: ['cmy'],
			convertsTo: ['cmy', 'srgb'],
			related: ['ccmmyk', 'cmy', 'ryb']
		},
		resources: [
			{
				label: 'CMYK color model (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/CMYK_color_model'
			},
			{
				label: 'Why is black designated by the letter K? (Color Vision Printing)',
				url: 'https://www.colorvisionprinting.com/blog/why-is-the-color-black-designated-by-the-letter-k-in-cmyk'
			},
			{ label: 'Bruce Lindbloom - color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	hct: {
		summary:
			"Google's Material Design 3 model fusing CAM16 hue and chroma with CIELAB lightness (Tone) for dynamic theming",
		whatItIs:
			"HCT (Hue-Chroma-Tone) is the color model behind Material Design 3 and Material You, developed by Google. It combines CAM16's perceptually grounded hue and chroma with CIELAB's lightness, renamed Tone, which is truly uniform across all hues. Because Tone maps directly to L*, designers can target exact contrast and lightness while CAM16 keeps hue and chroma perceptually accurate, making HCT well suited to generating whole themes from a single seed color.",
		usedFor: [
			'Generating Material You themes from a seed color',
			'Building tonal palettes at fixed tone steps (0,10,...,100)',
			'Hitting precise contrast and accessibility targets via Tone',
			'Design-system role tokens (primary, container, on-surface, etc.)',
			'Dynamic and adaptive theming in modern apps'
		],
		benefitsHere: [
			'Reach it via the c.hct view or HCT(h, c, t) constructor; its registered tonalPalette and materialRoles methods generate Material-style tonal scales and role tokens directly.',
			'atTone and withChroma let you hold hue while pinning a target tone for contrast or pushing chroma for vividness, and rotateHue spins hue inside the model.',
			'Status is experimental: the HCT math is faithfully hand-rolled from CAM16 plus Lab lightness rather than ICC-certified, so treat outputs as accurate-but-not-official.'
		],
		relations: {
			derivedFrom: ['cam16', 'lab'],
			convertsTo: ['cam16', 'lab', 'srgb'],
			related: ['oklch', 'cam16', 'ciecam02', 'okhsl', 'lch65']
		},
		resources: [
			{
				label: 'HCT - Material Color Utilities (GitHub)',
				url: 'https://github.com/material-foundation/material-color-utilities'
			},
			{
				label: 'The science of color and design (Material blog)',
				url: 'https://material.io/blog/science-of-color-design'
			},
			{
				label: 'Introducing Material You (Material.io)',
				url: 'https://material.io/blog/introducing-material-you'
			}
		]
	},
	hsluv: {
		summary:
			'A perceptually uniform HSL that maps CIE LCh(uv) to a human-friendly 0–100 saturation scale',
		whatItIs:
			'HSLuv is a reparameterization of HSL built for perceptual uniformity, so that equal numeric steps in saturation and lightness look equally different across all hues. It maps CIE LCh(uv) to a friendly 0–100 saturation and lightness scale with sRGB gamut mapping baked in, which means S=100 always yields the most saturated sRGB color available for a given hue and lightness — no gamut surprises. It and its sibling HPLuv were designed explicitly as human-friendly, drop-in alternatives to HSL for programmatic color work.',
		usedFor: [
			'Programmatic palette generation with even perceptual spacing',
			'Accessible design and data visualization color sets',
			'UI theming where equal lightness should look equally bright',
			'Drop-in replacement for HSL with predictable gamut behavior',
			'Generating evenly spaced categorical color wheels'
		],
		benefitsHere: [
			'Construct with HSLUV(h, s, l) or read perceptually-tuned channels off any color via the .hsluv view.',
			'Use the registered saturate and withLightness methods for gamut-safe adjustments where S=100 is always the most saturated in-gamut color.',
			'Call rotateHue on the .hsluv view to spin evenly spaced hues for categorical palettes.',
			"Marked experimental (faithful hand-rolled math, not ICC-certified) but fully backed — a strong choice when HSL's per-hue lightness drift is a problem."
		],
		relations: {
			derivedFrom: ['lchuv', 'luv'],
			convertsTo: ['luv', 'srgb', 'hpluv'],
			related: ['hpluv', 'hsl', 'lchuv', 'oklch', 'okhsl']
		},
		resources: [
			{ label: 'HSLuv reference site', url: 'https://www.hsluv.org/' },
			{ label: 'HSLuv source & spec (GitHub)', url: 'https://github.com/hsluv/hsluv' }
		]
	},
	hpluv: {
		summary:
			'A pastel-only HSLuv variant where every value maps to a valid sRGB color with no gamut clipping',
		whatItIs:
			'HPLuv (Hue, Pastel saturation, Lightness) is a variant of HSLuv that constrains the saturation curve so that every possible H, P, L combination lands inside the sRGB gamut without clipping, while staying perceptually uniform across all three axes. The trade-off is that it can only produce softer, pastel colors — the most vivid hues are out of reach. Like HSLuv it is built on CIE LCh(uv) and was designed as a human-friendly alternative to HSL, here optimized for guaranteed gamut safety.',
		usedFor: [
			'Soft, pastel UI palettes',
			'Design themes that must never clip the sRGB gamut',
			'Guaranteed in-gamut generative color without mapping passes',
			'Muted data-visualization color sets',
			'Modern UI theming where gamut safety matters more than vividness'
		],
		benefitsHere: [
			'Construct with HPLUV(h, p, l) or read its pastel channels off any color via the .hpluv view.',
			'Use rotateHue on the .hpluv view to spin pastel hues that are all guaranteed in sRGB gamut.',
			'Skip gamut mapping entirely for HPLuv-generated colors, since every value is in-gamut by construction.',
			'Marked experimental (faithful hand-rolled math) but fully backed — reach for it over HSLuv when you specifically need a clip-free pastel palette.'
		],
		relations: {
			derivedFrom: ['hsluv', 'lchuv', 'luv'],
			convertsTo: ['hsluv', 'luv', 'srgb'],
			related: ['hsluv', 'hsl', 'lchuv', 'oklch']
		},
		resources: [
			{ label: 'HSLuv / HPLuv reference site', url: 'https://www.hsluv.org/' },
			{ label: 'HSLuv & HPLuv source (GitHub)', url: 'https://github.com/hsluv/hsluv' }
		]
	},
	xyy: {
		summary:
			'Splits CIE XYZ into chromaticity (x, y) plus luminance (Y) — the basis of the famous CIE 1931 horseshoe diagram',
		whatItIs:
			'CIE xyY is a repacking of XYZ rather than a new space: x = X/(X+Y+Z) and y = Y/(X+Y+Z) isolate chromaticity, while Y carries luminance unchanged. The (x, y) pair plots on the CIE 1931 chromaticity diagram — the horseshoe-shaped spectrum locus with white near the center — which is the standard way to define color-space primaries and white points. Because chromaticity is separated from brightness, xyY is ideal for gamut and lighting work, though it is not perceptually uniform (the green region is stretched).',
		usedFor: [
			'Defining color-space primaries and white points (e.g. D65 ≈ x 0.3127, y 0.3290)',
			'Drawing and comparing gamuts on the CIE 1931 chromaticity diagram',
			'Lighting and lamp tint specification',
			'Display and device characterization',
			"Separating a color's chromaticity from its luminance"
		],
		benefitsHere: [
			"Use the `c.xyy` view (or `XYY(x,y,Y)`) to read a color's chromaticity coordinates directly — exactly the numbers plotted on the CIE horseshoe diagram",
			'Experimental but backed: `setLuminance` changes brightness via Y while holding chromaticity fixed, and `desaturate` pulls (x, y) toward the white point',
			'Because it is a clean repacking of `c.xyz`, switching between the two views shows the same color as raw tristimulus versus chromaticity-plus-luminance'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['xyz', 'ucs', 'ucs60'],
			related: ['xyz', 'ucs', 'ucs60', 'luv']
		},
		resources: [
			{
				label: 'Wikipedia: CIE 1931 chromaticity diagram',
				url: 'https://en.wikipedia.org/wiki/CIE_1931_color_space#Chromaticity_diagram'
			},
			{ label: 'Bruce Lindbloom: color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	ucs: {
		summary:
			"The CIE 1976 (u', v') uniform chromaticity scale — ~4x more uniform than CIE xy and the direct basis for CIELUV",
		whatItIs:
			"The CIE 1976 UCS is a projective transform of CIE XYZ into (u', v') chromaticity coordinates, computed as u' = 4X/(X+15Y+3Z) and v' = 9Y/(X+15Y+3Z). It is the most uniform 2D chromaticity diagram in standard use — roughly four times more uniform than CIE xy — and is the direct geometric basis for CIELUV, whose u* and v* are scaled from u', v'. It is the industry standard for LED and display color specification, including ANSI/NEMA binning tolerances.",
		usedFor: [
			'LED color specification and ANSI/NEMA binning',
			'Display gamut visualization on a near-uniform chromaticity diagram',
			"CIELUV calculations (u*, v* derive from u', v')",
			'Quantifying small chromaticity differences more fairly than CIE xy',
			'Light-source and white-point tolerancing'
		],
		benefitsHere: [
			"Use the `c.ucs` view (or `UCS(u,v,Y)`) to read the (u', v') coordinates that LED and display binning standards are expressed in",
			'Experimental but backed: `blendUniform` mixes colors across this near-uniform chromaticity scale, giving more even transitions than mixing in CIE xy',
			"Pair it with `c.ucs60` to see the 1960-vs-1976 relationship (v' = 1.5v), and with `c.luv` to see the lightness-extended space it underlies"
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['luv', 'ucs60', 'xyz'],
			related: ['ucs60', 'luv', 'lchuv', 'xyy', 'uvw']
		},
		resources: [
			{
				label: 'Wikipedia: CIELUV (forward transformation)',
				url: 'https://en.wikipedia.org/wiki/CIELUV#The_forward_transformation'
			},
			{ label: 'Wikipedia: CIELUV', url: 'https://en.wikipedia.org/wiki/CIELUV' }
		]
	},
	ucs60: {
		summary:
			"MacAdam's 1960 (u, v) uniform chromaticity scale — the foundation of correlated color temperature, superseded by 1976 UCS",
		whatItIs:
			"The CIE 1960 UCS is David MacAdam's projective transform of CIE XYZ into (u, v) chromaticity coordinates, defined so equal distances correspond more closely to equal perceived color differences (~4x more uniform than CIE xy). It is the canonical space for computing correlated color temperature (CCT) and the distance from the Planckian locus (Duv), and it is the geometric basis from which the improved 1976 (u', v') diagram was derived. It has since been superseded by the 1976 UCS.",
		usedFor: [
			'Correlated color temperature (CCT) calculation',
			'Distance from the Planckian locus (Duv) for white-light tint',
			'Light-source and LED specification',
			'Approximating MacAdam ellipses for tolerancing',
			"Historical comparison with the 1976 u', v' scale"
		],
		benefitsHere: [
			'Use the `c.ucs60` view (or `UCS60(u,v,Y)`) when you need the classic (u, v) coordinates — this is the space CCT is properly defined in',
			'Experimental but backed: `cct` returns the correlated color temperature in Kelvin, and `isWarm` flags whether a color sits on the warm side of the Planckian locus',
			"Compare against the `c.ucs` (1976) view to see the v' = 1.5v scaling that improved its uniformity"
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['ucs', 'xyz', 'xyy'],
			related: ['ucs', 'uvw', 'xyy', 'luv']
		},
		resources: [
			{
				label: 'Wikipedia: CIE 1960 color space',
				url: 'https://en.wikipedia.org/wiki/CIE_1960_color_space'
			},
			{
				label: 'Wikipedia: Correlated color temperature',
				url: 'https://en.wikipedia.org/wiki/Color_temperature'
			}
		]
	},
	uvw: {
		summary:
			"CIE 1964 U*V*W* — the CIE's first attempt at a perceptually uniform color space and a precursor to CIELUV, now largely obsolete",
		whatItIs:
			"UVW (CIE 1964 U*V*W*) is a historical CIE color space that extended the (u, v) chromaticity scale with a lightness coordinate W*, making it the CIE's first attempt at a full perceptually uniform color space. It was an early color-difference tool but was superseded by CIELUV in 1976 and is now largely obsolete, retained mainly for historical reference and for comparing early and modern perceptual spaces.",
		usedFor: [
			'Historical reference for the evolution of perceptual color spaces',
			'Legacy color-difference calculations in older standards',
			'Comparing pre-1976 uniformity attempts with CIELUV and CIELAB',
			'Understanding the lineage from CIE 1960 UCS to CIELUV'
		],
		benefitsHere: [
			'Use the `c.uvw` view (or `UVW(u,v,w)`) to inspect a color in this historical 1964 space — mostly of academic interest in Chromatics',
			'Experimental but backed: a `deltaE` method computes the original U*V*W* color difference, letting you compare its verdicts against modern formulas in `c.lab`',
			'Place it next to `c.ucs60` and `c.luv` to trace the historical progression from the 1960 UCS through 1964 UVW to 1976 CIELUV'
		],
		relations: {
			derivedFrom: ['xyz', 'ucs60'],
			related: ['luv', 'ucs60', 'ucs', 'xyz']
		},
		resources: [
			{
				label: 'Wikipedia: CIE 1964 color space (U*V*W*)',
				url: 'https://en.wikipedia.org/wiki/CIE_1964_color_space'
			},
			{ label: 'Bruce Lindbloom: color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	hlab: {
		summary:
			"Hunter Lab (1948), CIELAB's predecessor using a square-root rather than cube-root compression of XYZ",
		whatItIs:
			'Hunter Lab is an opponent-color space developed by Richard Hunter in 1948 for industrial color measurement, the direct ancestor of CIELAB. It expresses color as lightness L plus a red-green axis (a) and a yellow-blue axis (b), but derives them with a square-root compression of XYZ rather than the cube-root that CIELAB later adopted. Built around reflectance data, it remains present in some older industrial instruments, though CIELAB is preferred for new work because of its better uniformity.',
		usedFor: [
			'Legacy industrial color measurement and quality control',
			'Compatibility with older colorimeters and spectrophotometers',
			'Reflectance-based color matching on surfaces',
			'Historical comparison against modern CIELAB',
			'Color tolerancing on instruments that report Hunter values'
		],
		benefitsHere: [
			'HLAB(l,a,b) builds a color in the historic Hunter Lab frame, and c.hlab views any color in this square-root space',
			'deltaE measures Euclidean difference in Hunter coordinates for legacy instrument matching',
			'Backed but experimental: the math is real and hand-rolled, faithful rather than ICC-certified',
			'Useful for reproducing readings from older equipment that predates CIELAB'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['lab'],
			related: ['lab', 'luv', 'lab65']
		},
		resources: [
			{ label: 'Hunter Lab — Wikipedia', url: 'https://en.wikipedia.org/wiki/Hunter_Lab' },
			{ label: 'Bruce Lindbloom — color math & conversions', url: 'http://www.brucelindbloom.com/' }
		]
	},
	ipt: {
		summary:
			"Ebner and Fairchild's LMS-based perceptual space whose straight constant-hue lines inspired Oklab",
		whatItIs:
			'IPT is a perceptual color space built on LMS cone responses, introduced by Ebner and Fairchild in 1998. It represents color as Intensity (I) plus two opponent channels, P (protan, red-green) and T (tritan, blue-yellow), derived with a power-function nonlinearity and a matrix on LMS. Its standout property is excellent hue linearity, meaning lines of constant perceived hue are nearly straight in the P-T plane, which makes it valuable for hue-preserving gamut mapping and directly inspired the design of Oklab.',
		usedFor: [
			'Hue-preserving gamut mapping',
			'Image-quality metrics and difference assessment',
			'Precise color-difference work where hue must not drift',
			'Research and reference for perceptual hue linearity',
			'Foundation concepts later carried into Oklab'
		],
		benefitsHere: [
			'IPT(i,p,t) builds a color in this hue-linear frame, and c.ipt views any color where constant-hue lines stay straight',
			"rotateHue turns hue cleanly thanks to IPT's hue linearity, and deltaE measures difference",
			'Backed but experimental: real hand-rolled math, faithful though not ICC-certified',
			'A useful sibling to oklab when comparing hue-preservation behavior'
		],
		relations: {
			derivedFrom: ['lms', 'xyz'],
			convertsTo: ['lab'],
			related: ['oklab', 'lms', 'cam16ucs', 'jab']
		},
		resources: [
			{
				label: 'IPT color space — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/IPT_color_space'
			},
			{ label: 'colour-science.org — IPT model', url: 'https://www.colour-science.org/' }
		]
	},
	aces: {
		summary:
			'The Academy Color Encoding System master space — scene-linear AP0 primaries spanning the entire visible gamut',
		whatItIs:
			'ACES2065-1 is the master and interchange color space of the Academy Color Encoding System, developed by the Academy of Motion Picture Arts and Sciences for cinema and visual effects. It is scene-referred with linear encoding that preserves the full dynamic range, and its AP0 primaries enclose the entire CIE visible gamut. It anchors the ACES family, flowing to ACEScg (AP1) for rendering and ACEScc/ACEScct (log) for grading.',
		usedFor: [
			'Archival film mastering and long-term preservation',
			'Color interchange between VFX houses and studios',
			'Scene-referred, high-dynamic-range capture and storage',
			'The root reference of an ACES color-managed pipeline',
			'Holding the widest possible gamut before working-space conversion'
		],
		benefitsHere: [
			'Build with ACES(r,g,b) or read the c.aces view to get scene-linear AP0 r/g/b for any color',
			'Use exposure to scale scene-linear values in stops, matching how cinematographers think about light',
			'Accessibility/transform methods (contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, simulateCVD) are also available on the view',
			'Experimental status: this is faithful hand-rolled AP0 math, not an ICC-certified pipeline — use ACEScg for rendering and ACEScc/ACEScct for grading'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['acescg', 'acescc', 'acescct', 'xyz'],
			related: ['acescg', 'acescc', 'acescct', 'prophoto', 'rec2020']
		},
		resources: [
			{
				label: 'Wikipedia: Academy Color Encoding System',
				url: 'https://en.wikipedia.org/wiki/Academy_Color_Encoding_System'
			},
			{
				label: 'ACES Overview — Oscars.org Science & Technology',
				url: 'https://www.oscars.org/science-technology/aces'
			},
			{ label: 'ACES Central', url: 'https://acescentral.com' }
		]
	},
	acescg: {
		summary:
			"The ACES working space for CGI and compositing — linear AP1 primaries, wide enough for cinema but without AP0's imaginary colors",
		whatItIs:
			'ACEScg is the linear ACES working space designed for computer graphics, compositing, and visual effects. It uses the AP1 primaries — wide enough for cinema but, unlike AP0, free of imaginary colors — with a linear encoding that is physically correct for CG lighting, shading, and compositing math. It is the standard rendering and compositing space within ACES pipelines.',
		usedFor: [
			'VFX compositing and 3D rendering',
			'CG lighting and shading calculations',
			'Linear color math in a wide cinema gamut',
			'Working space between ACES2065-1 and grading spaces',
			'Texture and material authoring for ACES pipelines'
		],
		benefitsHere: [
			'Build with ACESCG(r,g,b) or read the c.acescg view to get linear AP1 r/g/b for any color',
			'Use exposure to push values up or down in photographic stops while staying linear',
			'Transform/accessibility methods (contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, simulateCVD) are present on the view',
			'Experimental status: real AP0↔AP1 math, faithful but not ICC-certified — the right working view for linear compositing demos'
		],
		relations: {
			derivedFrom: ['aces'],
			convertsTo: ['aces', 'acescc', 'acescct', 'srgb'],
			related: ['aces', 'acescc', 'acescct', 'lin']
		},
		resources: [
			{ label: 'ACEScg — ACES Central', url: 'https://acescentral.com' },
			{
				label: 'Wikipedia: Academy Color Encoding System',
				url: 'https://en.wikipedia.org/wiki/Academy_Color_Encoding_System'
			},
			{ label: 'colour-science.org', url: 'https://www.colour-science.org/' }
		]
	},
	acescc: {
		summary:
			'Logarithmic ACES encoding (AP1) for color grading — a pure log curve that gives colorists fine control over midtones',
		whatItIs:
			'ACEScc is a logarithmic encoding of ACES on the AP1 primaries, designed for color grading. Its pure log curve allocates more code values to the midtones, giving colorists fine, even control across tonal ranges in grading tools like DaVinci Resolve and Baselight. It differs from ACEScct in having no toe, so its shadows roll off as a straight log line.',
		usedFor: [
			'Color grading and post-production finishing',
			'Log-curve workflows in DaVinci Resolve, Baselight, etc.',
			'Even midtone precision for nuanced grading',
			'Delivering ACES-conformant grade interchange',
			'Display-referred grading on top of scene-linear ACES'
		],
		benefitsHere: [
			'Build with ACESCC(r,g,b) or read the c.acescc view to get log-encoded AP1 r/g/b for any color',
			'Use exposure to nudge values in stops within the log space',
			'Transform/accessibility methods (contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, simulateCVD) are available on the view',
			"Experimental status: faithful log-encoding math; for shadow-heavy grades, compare against the c.acescct view's toe"
		],
		relations: {
			derivedFrom: ['aces', 'acescg'],
			convertsTo: ['aces', 'acescg', 'acescct'],
			related: ['acescct', 'aces', 'acescg']
		},
		resources: [
			{
				label: 'Wikipedia: Academy Color Encoding System',
				url: 'https://en.wikipedia.org/wiki/Academy_Color_Encoding_System'
			},
			{ label: 'ACEScc — ACES Central', url: 'https://acescentral.com' },
			{ label: 'colour-science.org', url: 'https://www.colour-science.org/' }
		]
	},
	acescct: {
		summary:
			'ACEScc with an added toe region that preserves shadow detail — the most widely adopted ACES grading space',
		whatItIs:
			"ACEScct is a logarithmic ACES grading encoding on the AP1 primaries, like ACEScc but with an added toe region near black. The toe prevents the 'milky blacks' problem of pure-log ACEScc and preserves more shadow detail, which is why it is the most widely adopted ACES grading space in practice. It is favored in digital grading pipelines where dark-region detail is crucial.",
		usedFor: [
			'Digital color grading with important shadow detail',
			'Log-curve grading that avoids milky blacks',
			'The default grading space in many ACES pipelines',
			'Post-production finishing for film and streaming',
			'Display-referred grading over scene-linear ACES'
		],
		benefitsHere: [
			'Build with ACESCCT(r,g,b) or read the c.acescct view to get log+toe AP1 r/g/b for any color',
			'Use exposure to shift values in stops while the toe protects shadow detail',
			'Transform/accessibility methods (contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, simulateCVD) are available on the view',
			"Experimental status: faithful log+toe math; compare against the c.acescc view to see the toe's effect on dark regions"
		],
		relations: {
			derivedFrom: ['aces', 'acescg'],
			convertsTo: ['aces', 'acescc', 'acescg'],
			related: ['acescc', 'aces', 'acescg']
		},
		resources: [
			{ label: 'ACEScct — ACES Central', url: 'https://acescentral.com' },
			{
				label: 'Wikipedia: Academy Color Encoding System',
				url: 'https://en.wikipedia.org/wiki/Academy_Color_Encoding_System'
			},
			{ label: 'colour-science.org', url: 'https://www.colour-science.org/' }
		]
	},
	scrgb: {
		summary:
			'Extended sRGB (IEC 61966-2-2) allowing values below 0 and above 1 for out-of-gamut and HDR color on Windows',
		whatItIs:
			"scRGB is an extended version of sRGB defined by IEC 61966-2-2. It keeps sRGB's primaries and D65 white point but allows channel values outside the 0–1 range: negatives encode colors outside the sRGB gamut, while values greater than 1 encode HDR brightness. It uses a linear encoding so color arithmetic stays correct, and it is native to Windows color management (WCS) and DirectX rendering pipelines.",
		usedFor: [
			'HDR rendering and compositing on Windows',
			'Representing out-of-sRGB-gamut colors via negative values',
			'GPU and DirectX scene-referred color pipelines',
			"Wide-gamut work within sRGB's primary framework",
			'Extended-range intermediate for HDR display output'
		],
		benefitsHere: [
			'Build with SCRGB(r,g,b) or read the c.scrgb view to access extended-range, light-linear r/g/b for any color',
			"Use exposure to scale into HDR brightness ranges (values above 1) without leaving sRGB's primaries",
			'Transform/accessibility methods (contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, simulateCVD) are available on the view',
			'Experimental status: faithful extended-sRGB math; clamp/gamut-map back to the c.srgb view for standard display'
		],
		relations: {
			derivedFrom: ['lin', 'srgb'],
			convertsTo: ['srgb', 'lin', 'xyz'],
			related: ['srgb', 'lin', 'rec2100']
		},
		resources: [
			{ label: 'Wikipedia: scRGB', url: 'https://en.wikipedia.org/wiki/ScRGB' },
			{
				label: 'Microsoft — High dynamic range and advanced color on Windows',
				url: 'https://learn.microsoft.com/en-us/windows/win32/direct3darticles/high-dynamic-range'
			},
			{ label: 'Bruce Lindbloom — RGB working space math', url: 'http://www.brucelindbloom.com/' }
		]
	},
	smptec: {
		summary:
			"SMPTE's early-HDTV RGB space (SMPTE 240M), NTSC-like primaries with an improved transfer function, superseded by Rec. 709",
		whatItIs:
			'SMPTE-C (SMPTE 240M) is an RGB color space SMPTE defined for early HDTV systems. It uses primaries close to NTSC but with a more accurate transfer function and a D65 white point. It served as a historical bridge between NTSC and modern HDTV and contributed to the development of Rec. 709, by which it has since been largely superseded.',
		usedFor: [
			'Legacy broadcast compatibility and conversion',
			'Archival media and old NTSC-era content remastering',
			'Matching color of vintage HDTV/SMPTE 240M sources',
			'Studying the lineage from NTSC to Rec. 709',
			'Reference for older video color pipelines'
		],
		benefitsHere: [
			'Build with SMPTEC(r,g,b) or read the c.smptec view to get its NTSC-like r/g/b for any color',
			'Use exposure plus the transform/accessibility methods (contrastWCAG, meetsAA, meetsAAA, luminance, invert, grayscale, simulateCVD) available on the view',
			'Handy for previewing how modern colors land in a legacy broadcast gamut before remastering',
			'Experimental status: faithful hand-rolled SMPTE 240M math, not an ICC profile — convert to the c.srgb view for display'
		],
		relations: {
			derivedFrom: ['xyz', 'srgb'],
			convertsTo: ['srgb', 'xyz', 'rec2020'],
			related: ['srgb', 'rec2020', 'p3']
		},
		resources: [
			{ label: 'Wikipedia: NTSC — SMPTE C', url: 'https://en.wikipedia.org/wiki/NTSC#SMPTE_C' },
			{
				label: 'Bruce Lindbloom — RGB working space information',
				url: 'http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html'
			},
			{ label: 'colour-science.org', url: 'https://www.colour-science.org/' }
		]
	},
	ypbpr: {
		summary:
			'Analog component-video form of YCbCr, carrying luma plus blue- and red-difference signals',
		whatItIs:
			'YPbPr is the analog component video format that separates a video signal into a luminance channel (Y) and two color-difference channels, Pb (blue minus luma) and Pr (red minus luma). It is the analog counterpart of digital YCbCr, related to it by a simple scale and offset, and was carried on the familiar three-RCA component video cables (green/blue/red) used by DVD players, game consoles, and AV equipment.',
		usedFor: [
			'High-quality analog component video transmission over cables',
			'Interfacing legacy AV equipment, DVD players, and consoles',
			'Mapping analog signals to and from digital YCbCr',
			'Color balancing by adjusting Pb/Pr while Y controls brightness',
			'Restoring or digitizing component-video sources'
		],
		benefitsHere: [
			'The `YPbPr(y,pb,pr)` constructor and `c.ypbpr` view expose any color as analog component signals; status is experimental (faithful hand-rolled math, not a certified pipeline).',
			'`scaleChroma` scales the Pb/Pr color-difference signals to desaturate or boost chroma while leaving luma untouched.',
			'Most of its value is the scale-and-offset bridge to `ycbcr`, so pair the two views to study analog-to-digital component mapping.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['ycbcr', 'srgb'],
			related: ['ycbcr', 'yuv', 'rec601']
		},
		resources: [
			{ label: 'YPbPr - Wikipedia', url: 'https://en.wikipedia.org/wiki/YPbPr' },
			{
				label: 'Multiplexed Analogue Components (MAC) - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Multiplexed_Analogue_Components'
			}
		]
	},
	ycbcr: {
		summary:
			'Digital luma-chroma encoding behind nearly all video and image compression, enabling chroma subsampling',
		whatItIs:
			'YCbCr is the digital luma-chroma encoding that powers almost all modern image and video compression. It separates luminance (Y) from two chrominance channels, Cb (blue-difference) and Cr (red-difference), the digital counterpart of analog YPbPr. Because the eye is far less sensitive to chroma than to luma, this separation lets codecs subsample the Cb/Cr channels (4:2:0, 4:2:2) for large bandwidth savings. It underlies JPEG, MPEG, H.264/H.265, VP9, and AV1, with luma weights set by Rec.601 or Rec.709.',
		usedFor: [
			'Video and image compression in JPEG, H.264/H.265, VP9, AV1',
			'Chroma subsampling (4:2:0, 4:2:2) to cut bandwidth',
			'Digital broadcast and streaming pipelines',
			'Color keying / green-screen compositing on the chroma channels',
			'Color grading and noise reduction that isolate luma from chroma'
		],
		benefitsHere: [
			'Use `YCbCr(y,cb,cr)` or the `c.ycbcr` view (Rec.709 weights) to read any color in the dominant digital video encoding; status is experimental but faithful.',
			'`scaleChroma` scales Cb/Cr toward grayscale or oversaturation to preview subsampling and saturation effects while keeping Y fixed.',
			'Compare against `ypbpr` (its analog twin) or `rec601` (SD luma weights) to study weight and scaling differences across video standards.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'ypbpr', 'yuv'],
			related: ['ypbpr', 'yuv', 'rec601', 'itp', 'sycc']
		},
		resources: [
			{ label: 'YCbCr - Wikipedia', url: 'https://en.wikipedia.org/wiki/YCbCr' },
			{
				label: 'Microsemi UG0639: Color Space Conversion User Guide',
				url: 'https://www.microsemi.com/document-portal/doc_view/135317-ug0639-color-space-conversion-user-guide'
			},
			{ label: 'Bruce Lindbloom - color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	rec601: {
		summary:
			'ITU-R BT.601 standard-definition TV spec defining YCbCr luma weights for 525-line and 625-line systems',
		whatItIs:
			'Rec.601 (ITU-R BT.601) is the standard-definition broadcast television specification that defines the YCbCr encoding parameters for both 525-line (NTSC) and 625-line (PAL/SECAM) systems. Its defining feature is the SD luma weighting Y = 0.299R + 0.587G + 0.114B, which differs from the Rec.709 HD weights. It is an encoding spec built on YCbCr rather than a distinct color geometry, and remains the reference for SD video, DVD authoring, and legacy broadcast.',
		usedFor: [
			'Encoding standard-definition broadcast television',
			'DVD authoring and SD video mastering',
			'Decoding legacy NTSC and PAL/SECAM digital streams',
			'Setting the 0.299/0.587/0.114 SD luma coefficients',
			'Converting between SD (BT.601) and HD (BT.709) luma conventions'
		],
		benefitsHere: [
			'The `REC601(y,cb,cr)` constructor and `c.rec601` view give a YCbCr encoding using SD BT.601 luma weights; status is experimental but the weighting math is faithful.',
			'`scaleChroma` scales the Cb/Cr difference channels while preserving the SD luma signal.',
			'Hold it beside the Rec.709-weighted `ycbcr` view to see exactly how the SD vs HD luma coefficients shift the encoding.'
		],
		relations: {
			derivedFrom: ['ycbcr', 'srgb'],
			convertsTo: ['srgb', 'ycbcr'],
			related: ['ycbcr', 'yuv', 'yiq', 'rec2100']
		},
		resources: [
			{ label: 'Rec. 601 - Wikipedia', url: 'https://en.wikipedia.org/wiki/Rec._601' },
			{ label: 'ITU-R BT.601 - ITU', url: 'https://www.itu.int/rec/R-REC-BT.601' }
		]
	},
	yuv: {
		summary:
			'Foundational analog luma-chroma model that let color TV broadcast over black-and-white infrastructure',
		whatItIs:
			'YUV is the foundational analog video model that separates brightness (Y) from two chrominance signals (U, blue-difference; V, red-difference). It was historically pivotal because it enabled backward-compatible color television: black-and-white sets read only the Y channel, while color sets add U and V. Associated with European PAL broadcasting, it is the conceptual ancestor of every later luma-chroma encoding, including YCbCr and YIQ, which derive from RGB via BT.601 or BT.709 weights.',
		usedFor: [
			'Backward-compatible analog color television transmission',
			'PAL broadcasting and analog video processing',
			'Teaching the basis of all luma-chroma encodings',
			'Color tuning where U/V set chroma and Y sets brightness',
			'Digitizing and converting legacy analog video'
		],
		benefitsHere: [
			'Use `YUV(y,u,v)` or the `c.yuv` view to read any color in the original analog luma-chroma model; status is experimental but faithful.',
			'`scaleChroma` scales the U/V chrominance toward grayscale (factor 0) or oversaturation (factor 2) while Y holds brightness.',
			'Acts as the conceptual root for sibling video views like `ycbcr`, `yiq`, and `ydbdr`, so it is the natural starting point for comparisons.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'ycbcr', 'yiq'],
			related: ['ycbcr', 'yiq', 'ydbdr', 'ypbpr']
		},
		resources: [
			{ label: 'YUV - Wikipedia', url: 'https://en.wikipedia.org/wiki/YUV' },
			{ label: 'BlackIce: YUV Colorspace', url: 'https://www.blackice.com/colorspaceYUV.htm' },
			{ label: 'Bruce Lindbloom - color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	ydbdr: {
		summary:
			'The SECAM color space, encoding blue- and red-difference signals scaled from YUV for FM transmission',
		whatItIs:
			"YDbDr is the color space of the SECAM analog television system used in France and the former Soviet bloc. It encodes color as a luma channel (Y) plus blue-difference (Db) and red-difference (Dr) signals, which are scaled versions of YUV's U and V. In SECAM these chroma signals are FM-modulated and transmitted sequentially, giving immunity to the phase errors that plague NTSC. The space itself (YDbDr) is distinct from the SECAM transmission system that uses it.",
		usedFor: [
			'Encoding color for SECAM analog broadcasting',
			'Restoring and converting French and Soviet-era archival video',
			'Studying FM-modulated, phase-error-immune chroma encoding',
			'Mapping between SECAM (YDbDr) and PAL (YUV) chroma signals',
			'Legacy broadcast and historical reference work'
		],
		benefitsHere: [
			'Use `YDBDR(y,db,dr)` or the `c.ydbdr` view to inspect any color in the SECAM color space; status is experimental but the scaled-YUV math is faithful.',
			'`scaleChroma` scales the Db/Dr color-difference channels while preserving the Y luma.',
			'Keep it distinct from the `secam` system entry: `ydbdr` is the color space, while `secam` describes the FM, sequential-line transmission standard built on it.'
		],
		relations: {
			derivedFrom: ['yuv', 'srgb'],
			convertsTo: ['srgb', 'yuv'],
			related: ['secam', 'yuv', 'yiq', 'ycbcr']
		},
		resources: [
			{ label: 'YDbDr - Wikipedia', url: 'https://en.wikipedia.org/wiki/YDbDr' },
			{ label: 'SECAM - Wikipedia', url: 'https://en.wikipedia.org/wiki/SECAM' }
		]
	},
	secam: {
		summary:
			"France's 1967 Sequential Color with Memory TV standard, FM-modulating chroma line-by-line for phase immunity",
		whatItIs:
			'SECAM (Sequential Couleur a Memoire, Sequential Color with Memory) is the French analog color television standard introduced in 1967. Rather than sending both chroma channels at once, it transmits them sequentially, Db on one line and Dr on the next, and uses FM modulation instead of AM. This gives complete immunity to differential phase errors and avoids cross-color artifacts, at the cost of lower vertical chroma resolution. It is a broadcast transmission standard built on the YDbDr color space, not a separate color geometry.',
		usedFor: [
			'Analog color broadcasting in France, Russia, and former Soviet states',
			'Broadcasting in parts of Africa and the Middle East historically',
			'Phase-error-immune chroma transmission via FM modulation',
			'Restoring or interpreting SECAM-era archival recordings',
			'Comparative study of NTSC vs PAL vs SECAM chroma strategies'
		],
		benefitsHere: [
			'The `SECAM(y,db,dr)` constructor and `c.secam` view expose the SECAM-encoded color space; status is experimental but the math is faithful.',
			'`scaleChroma` adjusts the Db/Dr chroma signals while preserving luma, mirroring the `ydbdr` color space it is built on.',
			'Use `secam` for the transmission-standard framing and `ydbdr` for the bare color space when you want to keep the two concepts separate.'
		],
		relations: {
			derivedFrom: ['ydbdr', 'yuv'],
			convertsTo: ['srgb', 'ydbdr'],
			related: ['ydbdr', 'yuv', 'yiq']
		},
		resources: [
			{ label: 'SECAM - Wikipedia', url: 'https://en.wikipedia.org/wiki/SECAM' },
			{ label: 'YDbDr - Wikipedia', url: 'https://en.wikipedia.org/wiki/YDbDr' }
		]
	},
	ycgco: {
		summary:
			'Video model using green- and orange-difference chroma, computable with only adds and bit-shifts',
		whatItIs:
			'YCgCo decomposes color into luminance (Y) and two chrominance components: Cg (green-difference) and Co (orange-blue difference). Its key advantage is computational: the RGB transform needs only additions, subtractions, and bit-shifts, no multiplications, and it decorrelates natural-image color better than YCbCr. These properties make it attractive for embedded systems and low-latency codec paths; it appears in H.264/AVC and H.265/HEVC.',
		usedFor: [
			'Low-latency and embedded video codec pipelines',
			'Color transforms in H.264/AVC and H.265/HEVC',
			'GPU and graphics paths needing cheap luma-chroma separation',
			'Compression that benefits from strong RGB decorrelation',
			'Color balancing via Cg/Co with Y for brightness'
		],
		benefitsHere: [
			'Use `YCGCO(y,cg,co)` or the `c.ycgco` view to read any color in this multiply-free luma-chroma transform; status is experimental but faithful.',
			'`scaleChroma` scales the Cg/Co chroma channels while preserving the Y luma.',
			'Its natural companion is the reversible `ycocgr` view, so pair them to contrast the lossy and lossless integer transforms.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'ycocgr'],
			related: ['ycocgr', 'ycbcr', 'yuv']
		},
		resources: [
			{ label: 'YCgCo - Wikipedia', url: 'https://en.wikipedia.org/wiki/YCgCo' },
			{ label: 'YCoCg - Wikipedia', url: 'https://en.wikipedia.org/wiki/YCoCg' }
		]
	},
	ycocgr: {
		summary:
			'Bit-exact reversible variant of YCgCo giving a zero-loss RGB round-trip for lossless coding',
		whatItIs:
			'YCoCg-R is the reversible variant of YCgCo. Standard YCgCo loses precision to rounding, but YCoCg-R adds lifting steps that make the transform perfectly invertible, guaranteeing a bit-exact RGB to YCoCg-R to RGB round-trip with zero loss. Like its parent it uses only additions, subtractions, and bit-shifts, and it achieves better energy compaction than the reversible YCbCr (RCT) of JPEG 2000. It is used in the lossless and near-lossless modes of H.264/H.265 and in screen-content coding.',
		usedFor: [
			'Lossless video compression in H.264/H.265',
			'Screen-content and lossless image coding',
			'Bit-exact integer RGB round-trips with no rounding error',
			'Energy-compacting color transforms for compression',
			'Embedded pipelines needing reversible, multiply-free math'
		],
		benefitsHere: [
			'Use `YCOCGR(y,co,cg)` or the `c.ycocgr` view for the only video model here that guarantees a lossless integer-RGB round-trip; status is experimental but faithful.',
			'`scaleChroma` scales the Co/Cg difference channels while preserving the Y luma.',
			'Compare with its lossy parent `ycgco` to see how the lifting steps trade a little form for perfect reversibility.'
		],
		relations: {
			derivedFrom: ['ycgco', 'srgb'],
			convertsTo: ['srgb', 'ycgco'],
			related: ['ycgco', 'ycbcr']
		},
		resources: [{ label: 'YCoCg - Wikipedia', url: 'https://en.wikipedia.org/wiki/YCoCg' }]
	},
	sycc: {
		summary:
			'Extended YCbCr encoding (IEC 61966-2-1 Amd.1) allowing sub-zero and above-one sRGB for wider gamut',
		whatItIs:
			'sYCC is an extended YCbCr encoding defined in IEC 61966-2-1 Amendment 1, the same standard that defines sRGB. It permits sRGB component values below 0 and above 1, so it can carry colors that fall outside the strict sRGB gamut while remaining compatible with sRGB-based pipelines. It is used in digital cameras and JPEG 2000 to give more flexible saturation than strict sRGB allows.',
		usedFor: [
			'Extended-gamut image capture in digital cameras',
			'JPEG 2000 color encoding',
			'Carrying out-of-sRGB-gamut colors in a YCbCr container',
			'More flexible saturation than strict sRGB clipping',
			'Color fine-tuning via Cb/Cr with Y for brightness'
		],
		benefitsHere: [
			'Use `SYCC(y,cb,cr)` or the `c.sycc` view to read colors in the extended-sRGB YCbCr encoding; status is experimental but faithful.',
			'`scaleChroma` scales the Cb/Cr channels while preserving the Y luma, useful for previewing saturation beyond the sRGB range.',
			'It is a niche bridge to `srgb` and a sibling of `xvycc`; compare those views to see two different extended-gamut YCbCr strategies.'
		],
		relations: {
			derivedFrom: ['srgb', 'ycbcr'],
			convertsTo: ['srgb', 'ycbcr'],
			related: ['ycbcr', 'xvycc', 'srgb']
		},
		resources: [
			{ label: 'sYCC - Wikipedia', url: 'https://en.wikipedia.org/wiki/SYCC' },
			{
				label: 'IEC 61966-2-1 (sRGB / sYCC) - IEC Webstore',
				url: 'https://webstore.iec.ch/publication/6169'
			}
		]
	},
	xvycc: {
		summary:
			'Extended-gamut video standard (IEC 61966-2-4) reaching ~1.8x sRGB via YCbCr headroom, carried as x.v.Color',
		whatItIs:
			'xvYCC is an extended-gamut video color standard defined in IEC 61966-2-4. It widens the usable YCbCr gamut by exploiting the headroom and footroom of the YCbCr signal, reaching roughly 1.8 times the sRGB gamut. It stays backward compatible with standard decoders, which simply clip out-of-range values, and is carried over HDMI 1.3 and later as x.v.Color. This makes it useful for wide-gamut and HDR-leaning video over consumer connections.',
		usedFor: [
			'Wide-gamut video transport over HDMI 1.3+ (x.v.Color)',
			'Consumer-electronics video with extended color',
			'Encoding colors beyond sRGB while staying decoder-compatible',
			'HDR-leaning broadcast and playback chains',
			'Dynamic-range and chroma adjustment via Y and C1/C2'
		],
		benefitsHere: [
			'Use `XVYCC(y,cb,cr)` or the `c.xvycc` view to read colors in the extended-range YCbCr standard; status is experimental but faithful.',
			'`scaleChroma` scales the chroma-difference channels while preserving luma, useful for exploring the wider gamut headroom.',
			'It builds on `ycbcr` and is a sibling of `sycc`; compare the three views to see standard, extended-sRGB, and extended-gamut YCbCr side by side.'
		],
		relations: {
			derivedFrom: ['ycbcr', 'srgb'],
			convertsTo: ['ycbcr', 'srgb'],
			related: ['ycbcr', 'sycc', 'rec2100']
		},
		resources: [
			{ label: 'xvYCC - Wikipedia', url: 'https://en.wikipedia.org/wiki/XvYCC' },
			{
				label: 'IEC 61966-2-4 (xvYCC) - IEC Webstore',
				url: 'https://webstore.iec.ch/publication/6171'
			}
		]
	},
	rec2100: {
		summary:
			'ITU-R BT.2100 HDR/UHD television standard pairing the Rec.2020 gamut with PQ and HLG transfer functions',
		whatItIs:
			'Rec.2100 (ITU-R BT.2100) is the ITU standard for HDR and Ultra-HD television. It pairs the wide Rec.2020 color gamut with two HDR transfer functions: PQ (Perceptual Quantizer), which is absolute and spans 0 to 10,000 cd/m2, and HLG (Hybrid Log-Gamma), which is relative and backward-compatible with SDR. It is the foundation for HDR10, HDR10+, Dolby Vision, and HLG broadcast, and it is closely tied to the ICtCp model used for HDR color processing.',
		usedFor: [
			'HDR video production, streaming, and broadcast',
			'Defining HDR10, HDR10+, Dolby Vision, and HLG delivery',
			'Applying PQ or HLG transfer functions over a wide gamut',
			'Authoring Ultra-HD content on Rec.2020 primaries',
			'Tone mapping HDR signals down to SDR/sRGB displays'
		],
		benefitsHere: [
			'Use `REC2100(r,g,b)` or the `c.rec2100` view to work with the HDR encoding (PQ); status is experimental, so it is faithful hand-rolled math rather than a certified HDR pipeline.',
			'`exposure` lets you scale linear light to simulate brightness changes within the HDR range.',
			'It relates directly to the `itp` (ICtCp) view for HDR chroma processing and shares the `rec2020` gamut, so chain those views for HDR color work.'
		],
		relations: {
			derivedFrom: ['rec2020'],
			convertsTo: ['itp', 'rec2020', 'srgb'],
			related: ['itp', 'rec2020', 'rec601', 'xvycc']
		},
		resources: [
			{ label: 'Rec. 2100 - Wikipedia', url: 'https://en.wikipedia.org/wiki/Rec._2100' },
			{ label: 'ITU-R BT.2100 - ITU', url: 'https://www.itu.int/rec/R-REC-BT.2100' }
		]
	},
	hsp: {
		summary:
			'An HSV variant whose Perceived brightness uses Rec. 601 luma weights for cheap, vision-aware contrast',
		whatItIs:
			"HSP (Hue, Saturation, Perceived brightness), introduced by Darel Rex Finley, is a variant of HSV that replaces Value with a perceived-brightness channel computed from Rec. 601 luma weights: P = sqrt(0.299·R² + 0.587·G² + 0.114·B²). Weighting the green channel most and blue least matches human luminance perception far better than HSV's max-channel value or HSL's lightness, so the same P looks roughly equally bright across different hues. It is a deliberately simple, cheap stand-in for a full CIE Lab conversion when you only need brightness awareness.",
		usedFor: [
			'Quick text-contrast and readability checks',
			'Brightness-aware color adjustments without a Lab round-trip',
			'Choosing legible foreground/background pairs',
			'Sorting or thresholding colors by perceived brightness',
			'A lightweight alternative to full perceptual luminance math'
		],
		benefitsHere: [
			'Construct with HSP(h, s, p) or read the luma-weighted brightness off any color via the .hsp view — e.g. c.hsp.p.',
			'Use rotateHue on the .hsp view for hue rotation while keeping the perceived-brightness framing.',
			'Compare .hsp.p across colors as a fast brightness proxy when a full Lab/OKLCH contrast pass is overkill.',
			"Marked experimental (faithful hand-rolled math) but fully backed; for rigorous contrast prefer the RGB view's WCAG methods or OKLCH lightness."
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb'],
			related: ['hsv', 'hsl', 'hsi', 'oklch']
		},
		resources: [
			{ label: 'HSP color model (Darel Rex Finley)', url: 'http://alienryderflex.com/hsp.html' },
			{
				label: 'Rec. 601 / luma coefficients - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Rec._601'
			}
		]
	},
	tsl: {
		summary:
			'Tint-Saturation-Lightness model whose tint comes from normalized rg chromaticity, tuned for skin detection',
		whatItIs:
			'TSL (Tint, Saturation, Lightness) is a modified cylindrical color model in which the tint angle is derived from normalized rg chromaticity rather than the usual RGB-cube hue. This reformulation clusters human skin tones more tightly in tint than the hue of HSL or HSV, which is why TSL found a niche in skin-color detection and segmentation. Saturation and lightness fill the familiar roles of colorfulness and brightness. It is a specialized space rather than a general-purpose one, closely tied to chromaticity normalization.',
		usedFor: [
			'Skin-color detection and segmentation',
			'Face tracking and detection pipelines',
			'Gesture and hand-region segmentation in computer vision',
			'Lighting-tolerant chromaticity-based classification',
			'Research into perceptual clustering of skin tones'
		],
		benefitsHere: [
			'Construct with TSL(t, s, l) or read the chromaticity-derived tint off any color via the .tsl view.',
			'Use the registered rotateTint method to shift the tint angle within the model.',
			'Pair the .tsl view with the .rgchroma or .srgb views to relate tint back to normalized chromaticity.',
			'Marked experimental (faithful hand-rolled math) but fully backed — a niche choice useful mainly for skin-tone and segmentation work rather than general palette design.'
		],
		relations: {
			derivedFrom: ['srgb', 'rgchroma'],
			convertsTo: ['srgb'],
			related: ['hsl', 'hsv', 'rgchroma']
		},
		resources: [
			{
				label: 'Comparison of skin-detection color spaces (TSL) - survey',
				url: 'https://en.wikipedia.org/wiki/Skin_segmentation'
			},
			{
				label: 'TSL color space - colour-science discussion',
				url: 'https://en.wikipedia.org/wiki/HSL_and_HSV'
			}
		]
	},
	ryb: {
		summary:
			"Traditional artists' pigment wheel using red, yellow, and blue as subtractive primaries",
		whatItIs:
			'RYB is the traditional pigment-mixing model used by painters, with red, yellow, and blue as its primaries. It predates modern CMY(K) by centuries and underlies the classic color wheel taught in art education, where complements and secondary colors differ from those of additive RGB. It is intuitive but not scientifically accurate, since CMY is the correct subtractive primary set, and any mapping to RGB is approximate and non-standardized, with several published algorithms (Gossett and Chen 2004, Sugita 2016).',
		usedFor: [
			'Art education and teaching traditional color theory',
			'Painting and physical pigment mixing',
			"Building artists' color wheels and complementary schemes",
			'Designing palettes that follow painterly rather than digital relationships',
			"Generating 'paint-like' mixes that blend toward muddy darks"
		],
		benefitsHere: [
			"Use the `c.ryb` view to translate any stored color onto the artists' wheel, where complements and mixes match how pigments behave rather than how light adds.",
			'Construct a pigment triple with `RYB(r,y,b)` and call the registered `mix` method for subtractive-style blending toward painterly results.',
			'Status is experimental: the RGB mapping is an approximate, non-standard algorithm chosen for plausibility, so treat RYB output as artistic guidance, not measured color.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb'],
			related: ['cmy', 'cmyk', 'hsl']
		},
		resources: [
			{
				label: 'RYB color model (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/RYB_color_model'
			},
			{
				label: 'Gossett & Chen 2004 - Paint Inspired Color Mixing',
				url: 'https://bahamas10.github.io/ryb/assets/ryb.pdf'
			},
			{ label: 'Bjorn Ottosson - color mixing notes', url: 'https://bottosson.github.io/' }
		]
	},
	cam16: {
		summary:
			'A 2016 color appearance model predicting how colors actually look under given illumination, background, and surround',
		whatItIs:
			"CAM16 is a color appearance model published in 2016 as a successor to CIECAM02. Rather than describing a stimulus, it predicts how a color appears to a human observer under specific viewing conditions, factoring in illumination, background luminance, and surround. It outputs appearance correlates such as lightness (J), chroma (C), and hue (h), and is considered the most accurate widely used model of human color perception. It powers Google's HCT model.",
		usedFor: [
			'Cross-media color matching (screen to print to physical)',
			'Predicting color appearance under specific lighting',
			"Driving Material Design 3's HCT model",
			'Advanced HDR rendering and imaging',
			'Color-accurate photography and color correction'
		],
		benefitsHere: [
			'Use the c.cam16 view or CAM16(j, c, h) constructor when you need appearance correlates rather than raw stimulus values, for example to reason about how a color looks in a given environment.',
			"rotateHue spins hue in CAM16's appearance-calibrated hue circle, which is the same hue basis HCT builds on.",
			'Status is experimental: the appearance math is hand-rolled and faithful but not ICC-certified, and viewing-condition handling is real rather than a placeholder.'
		],
		relations: {
			derivedFrom: ['xyz', 'lms'],
			convertsTo: ['cam16ucs', 'xyz', 'hct', 'ciecam02'],
			related: ['ciecam02', 'cam16ucs', 'hct', 'jch', 'oklch']
		},
		resources: [
			{
				label: 'CAM16 color appearance model - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Color_appearance_model'
			},
			{
				label: 'colour-science.org - color appearance models',
				url: 'https://www.colour-science.org/'
			}
		]
	},
	cam16ucs: {
		summary:
			'A uniform space from the CAM16 appearance model where Euclidean distance tracks perceived difference',
		whatItIs:
			"CAM16-UCS is a uniform color space derived from the CAM16 color appearance model. It applies a compression to CAM16's output so that straight-line Euclidean distance corresponds to perceived color difference, giving lightness J' with red-green (a') and blue-yellow (b') opponent axes. Because it inherits CAM16's accounting for viewing conditions, it computes color differences that stay meaningful even when illumination, background, and surround change, which CIELAB cannot guarantee.",
		usedFor: [
			'Color-difference evaluation that holds across viewing conditions',
			'Matching screen color to print under different lighting',
			'Professional imaging and color grading',
			'Precise corrections where the surround matters',
			'Reference uniform space for appearance-model work'
		],
		benefitsHere: [
			'CAM16UCS(j,a,b) builds a color in the uniform CAM16 frame, and c.cam16ucs views any color where distance equals difference',
			'deltaE measures color difference that accounts for viewing conditions, beating Lab when the surround varies',
			'Backed but experimental: faithful hand-rolled CAM16 math, not ICC-certified',
			'Pairs with the cam16 cylindrical view for appearance-aware editing'
		],
		relations: {
			derivedFrom: ['cam16', 'xyz'],
			convertsTo: ['lab'],
			related: ['cam16', 'ciecam02', 'oklab', 'lab', 'jab']
		},
		resources: [
			{
				label: 'CAM16 color appearance model — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Color_appearance_model'
			},
			{
				label: 'colour-science.org — color appearance models',
				url: 'https://www.colour-science.org/'
			}
		]
	},
	ciecam02: {
		summary:
			'The 2002 predecessor to CAM16, a color appearance model still widely used in ICC v4 perceptual rendering',
		whatItIs:
			'CIECAM02 is a comprehensive color appearance model published by the CIE in 2002 that accounts for viewing conditions including ambient light, surround, and chromatic adaptation. It predicts appearance correlates such as lightness (J), chroma (C), and hue (h) for a color seen under defined conditions. CAM16 later refined its hue uniformity and computational stability, but CIECAM02 remains broadly deployed, notably inside ICC v4 profiles for the perceptual rendering intent.',
		usedFor: [
			'ICC v4 color management and perceptual rendering intent',
			'Cross-media color reproduction',
			'Advanced imaging and color correction',
			'Predicting color appearance under defined viewing conditions',
			'Legacy compatibility where CIECAM02 is the established model'
		],
		benefitsHere: [
			'Reach it via the c.ciecam02 view or CIECAM02(j, c, h) constructor when you specifically need the CIECAM02 appearance correlates for ICC v4 compatibility rather than the newer CAM16.',
			"rotateHue lets you move hue within CIECAM02's appearance hue circle; for new work the cam16 view is generally preferred.",
			'Status is experimental: the appearance math is faithfully hand-rolled but not ICC-certified, so it tracks CIECAM02 closely without being a licensed implementation.'
		],
		relations: {
			derivedFrom: ['xyz', 'lms'],
			convertsTo: ['cam16', 'xyz'],
			related: ['cam16', 'cam16ucs', 'hct', 'jch', 'oklch']
		},
		resources: [
			{ label: 'CIECAM02 - Wikipedia', url: 'https://en.wikipedia.org/wiki/CIECAM02' },
			{
				label: 'colour-science.org - color appearance models',
				url: 'https://www.colour-science.org/'
			}
		]
	},
	cmy: {
		summary:
			'Three-ink subtractive model where cyan, magenta, and yellow absorb red, green, and blue from white light',
		whatItIs:
			'CMY is the base subtractive color model that represents color as cyan, magenta, and yellow ink amounts. Each ink ideally absorbs one of the additive primaries: cyan absorbs red, magenta absorbs green, and yellow absorbs blue, so layering them subtracts light from the white paper. It is the theoretical foundation of all process printing and is usually treated as the simple complement of RGB (C=1-R, M=1-G, Y=1-B for idealized inks). CMYK extends it by extracting a separate black channel for practical presses.',
		usedFor: [
			'Teaching the theory of subtractive color mixing',
			'Modeling idealized three-ink reproduction before adding black',
			'Color reproduction analysis and ink-mixing simulations',
			'Generating the CMY portion of a print separation prior to K extraction',
			'Demonstrating the RGB-to-pigment complement relationship'
		],
		benefitsHere: [
			'Use the `c.cmy` view to see any stored OKLCH color as its three-ink complement, which makes the RGB-to-pigment inversion concrete inside the app.',
			'Construct an ink triple directly with `CMY(c,m,y)` when you want to demonstrate subtractive mixing without a black channel.',
			'Status is experimental: the `separations` method is real and runnable, but this is faithful hand-rolled math rather than a profiled press model, so treat output as illustrative.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['cmyk', 'srgb'],
			related: ['cmyk', 'ccmmyk', 'ryb']
		},
		resources: [
			{
				label: 'CMY color model (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/CMY_color_model'
			},
			{
				label: 'BlackIce CMY/CMYK color space',
				url: 'https://www.blackice.com/colorspaceCYMK.htm'
			},
			{ label: 'Bruce Lindbloom - color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	lms: {
		summary:
			"Models the response of the eye's three cone types (L/M/S) — a linear transform of XYZ underpinning adaptation and CVD work",
		whatItIs:
			"LMS represents color by the stimulation of the three cone photoreceptors: Long (~560 nm, 'red'), Medium (~530 nm, 'green'), and Short (~420 nm, 'blue'). Because the XYZ color-matching functions were themselves derived from cone responses, LMS is essentially a linear 3x3 transform of CIE XYZ; the exact matrix depends on which cone fundamentals are chosen (Stockman & Sharpe, CAT02, Hunt-Pointer-Estevez). It is a physiological, not perceptual, space — not meant for manual picking — and being linear and additive, it is the natural home for chromatic adaptation and color-blindness modeling.",
		usedFor: [
			'Chromatic adaptation transforms (Von Kries, Bradford, CAT02)',
			'Color-blindness (CVD) simulation by scaling individual cone channels',
			'Serving as the intermediate space for Oklab, IPT, and ICtCp',
			'Vision science and color appearance modeling',
			'Analyzing colors in terms of physiological cone stimulation'
		],
		benefitsHere: [
			'Use the `c.lms` view (or `LMS(l,m,s)`) when you want a color expressed in cone responses rather than device or perceptual axes — the biological substrate behind Oklab and ICtCp',
			'Experimental but backed: `suppressCone` zeroes or reduces one cone channel, the simple operation underlying protan/deutan/tritan simulation, and `deltaE` measures cone-space difference',
			'It is the conceptual parent of several models in Chromatics — compare `c.lms` against `c.oklab`, `c.ipt`, and `c.itp` to see how each builds on cone responses'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['xyz', 'oklab', 'ipt', 'itp'],
			related: ['xyz', 'oklab', 'ipt', 'itp', 'xyb']
		},
		resources: [
			{ label: 'Wikipedia: LMS color space', url: 'https://en.wikipedia.org/wiki/LMS_color_space' },
			{
				label: 'Dolby ICtCp white paper (PDF)',
				url: 'https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf'
			},
			{
				label: 'Color blindness simulation research — ixora.io',
				url: 'https://ixora.io/projects/colorblindness/color-blindness-simulation-research/'
			}
		]
	},
	impossible: {
		summary:
			'Imaginary and chimerical colors that no single wavelength or real light mixture can produce',
		whatItIs:
			'Impossible colors are a theoretical concept, not a usable coordinate model: colors that cannot be produced by any real light or pigment. Imaginary colors are points outside the spectral locus in CIE XYZ, requiring negative tristimulus values, and are used as math-only primaries that keep all visible colors positive. Chimerical colors arise through neural adaptation and afterimages (for example stygian blue), and opponent pairs like reddish-green or bluish-yellow cannot be perceived at once. The idea explains why some spaces use imaginary primaries and why gamut boundaries exist.',
		usedFor: [
			'Explaining why color spaces like ProPhoto include imaginary primaries',
			'Understanding gamut boundaries and the spectral locus',
			'Reasoning about negative tristimulus values in CIE XYZ',
			'Discussing chimerical and afterimage colors in vision science',
			'Illustrating opponent-process limits (no reddish-green)'
		],
		benefitsHere: [
			'This is a conceptual entry rather than a color you can construct: there is no constructor and no `c.impossible` view, because it describes points outside any real gamut.',
			'Status is coming-soon and the model is not backed: the advertised `chimerical` method throws an actionable error, as it would need dedicated neural-adaptation modeling to mean anything.',
			'To explore the underlying idea concretely, inspect a wide-gamut `c.xyz` or `c.prophoto` value and check gamut limits, since imaginary colors live just outside those boundaries.'
		],
		relations: {
			derivedFrom: ['xyz'],
			related: ['xyz', 'prophoto', 'aces']
		},
		resources: [
			{
				label: 'Impossible color (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Impossible_color'
			},
			{
				label: 'Imaginary color (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Imaginary_color'
			},
			{
				label: 'Chimerical colors (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Impossible_color#Chimerical_colors'
			}
		]
	},
	icam: {
		summary:
			'Image-based color appearance model that judges whole images, accounting for spatial context and local adaptation',
		whatItIs:
			'iCAM is a color appearance model built for imaging that processes entire images rather than single colors. Where CAM16 and CIECAM02 predict the appearance of one patch under fixed viewing conditions, iCAM (Fairchild and Johnson) adds spatial analysis so it can model simultaneous contrast, local adaptation, and surround effects across a scene. It works from CIE XYZ plus spatial filtering, giving better predictions for complex images and HDR content.',
		usedFor: [
			'HDR rendering and tone mapping of photographs',
			'Image quality and image difference assessment',
			'Modeling simultaneous contrast and local adaptation across a scene',
			'Predicting appearance of complex images better than pixel-wise CAMs',
			'Research into spatial color and image appearance'
		],
		benefitsHere: [
			"iCAM is an image-level model, so it falls outside the app's per-color DSL: there is no constructor and no `c.icam` view, since it needs whole-image pixel data, not one stored OKLCH value.",
			'Status is coming-soon and the model is not backed: the advertised `appearance` method throws an actionable error because it would require a full image-processing dataset/package.',
			'For single-color appearance work today, reach for the experimental `c.cam16` or `c.ciecam02` views, which model one patch under defined viewing conditions.'
		],
		relations: {
			derivedFrom: ['xyz'],
			convertsTo: ['xyz'],
			related: ['cam16', 'ciecam02', 'cam16ucs']
		},
		resources: [
			{
				label: 'iCAM color appearance model (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/ICAM_(color_appearance_model)'
			},
			{
				label: 'Fairchild & Johnson - The iCAM framework',
				url: 'https://www.rit-mcsl.org/fairchild/PDFs/PRO19.pdf'
			},
			{
				label: 'Fairchild - Color Appearance Models (book)',
				url: 'https://onlinelibrary.wiley.com/doi/book/10.1002/9781118653128'
			}
		]
	},
	rgchroma: {
		summary:
			'Two-axis chromaticity from RGB normalized by total intensity, making color invariant to brightness',
		whatItIs:
			'rg chromaticity strips intensity out of RGB by normalizing each channel against the sum: r = R/(R+G+B) and g = G/(R+G+B), with blue implicit as b = 1 - r - g. The result is a 2D color representation that is invariant to changes in illumination intensity, which is why it is widely used for skin detection, object tracking, and shadow removal in computer vision. Because it discards intensity, it cannot reconstruct a full color without a separately known brightness.',
		usedFor: [
			'Skin detection and face tracking in computer vision',
			'Illumination-invariant color comparison and segmentation',
			'Shadow removal and detection',
			'Normalizing color before classification or tracking',
			'Reducing lighting variation in image analysis pipelines'
		],
		benefitsHere: [
			'rg chromaticity is registered to document the illumination-invariant approach, but it is not yet wired into the app as a constructor or `c.rgchroma` view.',
			'Status is coming-soon and the model is not backed: the advertised `chromaticity` method throws an actionable error because the feature still needs its supporting code.',
			'To approximate the idea today, read RGB channels from a `c.srgb` view and normalize them by their sum yourself, keeping in mind the 2D projection drops intensity and cannot be inverted alone.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb'],
			related: ['rgcolor', 'xyy', 'tsl']
		},
		resources: [
			{
				label: 'rg chromaticity (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Rg_chromaticity'
			},
			{ label: 'Chromaticity (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Chromaticity' },
			{ label: 'colour-science.org', url: 'https://www.colour-science.org/' }
		]
	},
	rgcolor: {
		summary:
			'Simplified two-channel red-green models from early computing, now mainly of historical interest',
		whatItIs:
			'RG color models are simplified two-channel representations that use only red and green, dropping blue entirely. They appeared in early computer and display hardware that could not afford a full three-primary system, and today they are mostly of historical or academic interest for studying color vision. Conceptually they are subsumed by rg chromaticity, which keeps the same two axes but normalizes out intensity.',
		usedFor: [
			'Studying the history of early computer and display color',
			'Academic exploration of two-primary color vision',
			'Illustrating the limits of dropping a primary channel',
			'Comparing legacy hardware palettes against full RGB',
			'Teaching the step from two-channel models to rg chromaticity'
		],
		benefitsHere: [
			'This entry exists for historical completeness; the app does not expose a constructor or a `c.rgcolor` view because the model has no modern practical use.',
			'Status is coming-soon and the model is not backed: the advertised `mix` method throws an actionable error rather than returning a value.',
			'For the live two-axis idea, use rg chromaticity once it ships, or read red and green from a `c.srgb` view directly.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb'],
			related: ['rgchroma', 'srgb']
		},
		resources: [
			{ label: 'RG color model (Wikipedia)', url: 'https://en.wikipedia.org/wiki/RG_color_models' },
			{ label: 'rg chromaticity (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Rg_chromaticity' }
		]
	},
	gl: {
		summary:
			'Normalized floating-point RGBA in 0.0-1.0 as used by OpenGL/WebGL shaders and GPU pipelines',
		whatItIs:
			'GL is the color representation used by OpenGL, WebGL, and similar graphics libraries: red, green, blue, and alpha as normalized floating-point values in the 0.0-1.0 range. It is not technically a distinct color model but rather normalized (s)RGB packaged for GPU work, where shaders expect float vectors and a linear, normalized space. Colors are typically authored as RGB or RGBA and fed to fragment and vertex shaders as vec4 values.',
		usedFor: [
			'Authoring colors for GLSL fragment and vertex shaders',
			'GPU rendering in WebGL and OpenGL pipelines',
			'Passing normalized vec4 RGBA uniforms to shaders',
			'Working in a linear, normalized space for GPU-friendly math',
			'Converting design colors into shader-ready float values'
		],
		benefitsHere: [
			'GL is registered to label the GPU-normalized float form, but it is essentially normalized sRGB, so there is no separate constructor; for real work use `c.srgb` with values read as 0-1.',
			'Status is coming-soon and the model is not backed: the advertised `toFloat` method throws an actionable error, so the dedicated `c.gl` view is not yet available.',
			'In practice, take an `c.srgb` view, treat its channels as 0-1 floats, and emit a vec4 yourself until the GL helper ships.'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'lin'],
			related: ['srgb', 'lin', 'scrgb']
		},
		resources: [
			{ label: 'OpenGL Color Basics (Khronos)', url: 'https://www.khronos.org/opengl/wiki/Colors' },
			{
				label: 'WebGL Specification (Khronos)',
				url: 'https://www.khronos.org/registry/webgl/specs/latest/'
			},
			{ label: 'The Book of Shaders - Color', url: 'https://thebookofshaders.com/06/' }
		]
	},
	ccmmyk: {
		summary:
			'Six-color hi-fi print model adding diluted light cyan and light magenta inks to standard CMYK',
		whatItIs:
			'CcMmYK extends CMYK with two diluted-ink channels: light cyan (c) and light magenta (m), placed alongside the full-strength cyan, magenta, yellow, and black. The lighter inks fill the gap between bare paper white and full-strength colored inks, giving finer control in highlights and midtones. This is the standard ink layout of six-color photo inkjet printers, where it eliminates visible banding and produces smoother skin tones and sky gradients than four-color CMYK.',
		usedFor: [
			'Six-color photo inkjet printing',
			'Fine-art reproduction and giclee prints',
			'Smoothing highlight and midtone gradients to avoid banding',
			'Rendering more even skin tones and sky transitions',
			'Splitting a CMYK separation into regular plus light ink channels'
		],
		benefitsHere: [
			'CcMmYK is registered to round out the print family, so it appears as an encyclopedia entry, but it has no working constructor in the app yet.',
			'Status is coming-soon and the model is not backed: the advertised `separations` method throws an actionable error because it needs a licensed dataset/package, so it cannot be reached as a `c.<id>` view today.',
			'For real ink work right now, use the experimental `c.cmyk` view and `CMYK(c,m,y,k)` constructor instead, then revisit CcMmYK once it ships.'
		],
		relations: {
			derivedFrom: ['cmyk'],
			convertsTo: ['cmyk', 'srgb'],
			related: ['cmyk', 'cmy']
		},
		resources: [
			{
				label: 'CcMmYK color model (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/CcMmYK_color_model'
			},
			{
				label: 'CMYK color model (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/CMYK_color_model'
			},
			{ label: 'Bruce Lindbloom - color math reference', url: 'http://www.brucelindbloom.com/' }
		]
	},
	yjk: {
		summary:
			'MSX2+ (1988) color model in the YUV family where four pixels share one J,K chroma pair',
		whatItIs:
			'YJK is a color model introduced with the MSX2+ home computer in 1988, belonging to the broader YUV family. To fit tight 8-bit hardware limits, four horizontally adjacent pixels share a single pair of chrominance values (J, K) while each pixel keeps its own luma (Y). This bandwidth trick gave the MSX2+ many more on-screen colors than its memory budget would otherwise allow. It is mainly of retro-computing and historical interest today.',
		usedFor: [
			'Decoding and rendering MSX2+ screen modes',
			'Retro-computing and homebrew MSX2+ development',
			'Studying chroma-sharing bandwidth tricks in 8-bit hardware',
			'Converting MSX2+ imagery to and from RGB',
			'Historical reference within the YUV family'
		],
		benefitsHere: [
			'YJK is advertised but its status is coming-soon: the registered `decode` method THROWS an actionable error because it needs the MSX2+ hardware decode logic, so there is no live `c.yjk` math yet.',
			'Treat it as a documented conversion target on the roadmap rather than a working view; reach for `yuv` for live luma-chroma work in the same family.',
			'Once backed, it will sit alongside the other YUV-family video views; for now the entry exists to flag the planned support honestly.'
		],
		relations: {
			derivedFrom: ['yuv', 'srgb'],
			convertsTo: ['srgb'],
			related: ['yuv', 'yiq']
		},
		resources: [
			{ label: 'YJK - Wikipedia', url: 'https://en.wikipedia.org/wiki/YJK' },
			{
				label: 'Yamaha V9958 (MSX video display processor) - Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Yamaha_V9958'
			}
		]
	},
	ral: {
		summary:
			"Europe's dominant standardized swatch system for paints, coatings, and plastics, born in Germany in 1927",
		whatItIs:
			'RAL is a categorical color matching system created in Germany in 1927 and used primarily across Europe to specify colors for paints, coatings, and plastics. It assigns unique codes to predefined physical swatches for industrial consistency and quality control. The catalog spans several collections: RAL Classic (~215 colors, four-digit codes like RAL 9010 = Pure White), RAL Design (~1,825 colors organized by Hue-Lightness-Chroma derived from CIE Lab), and RAL Effect (490 colors, including metallics).',
		usedFor: [
			'Specifying paint and powder-coating colors for European architecture',
			'Industrial coatings and machinery finishes with strict QC tolerances',
			'Automotive and transport color standards',
			'Safety and signage colors (warning yellows, signal reds)',
			'Plastics and product manufacturing color references'
		],
		benefitsHere: [
			'RAL is the one catalog system in Chromatics with a real dataset and status:experimental, so c.ral and lookups run on hand-rolled math rather than throwing',
			'Use the registered nearest method to snap any working color to the closest RAL chip, returning code, name, and the deltaE distance',
			'Pair code and name to label a color with its RAL identifier, then keep editing in OKLCH while tracking how far you have drifted via deltaE',
			'Values are faithful approximations from official CIE Lab data, not an ICC-certified spot reproduction'
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['lab', 'srgb'],
			related: ['pantone', 'ncs', 'din6164', 'bs', 'fedstd595', 'as2700']
		},
		resources: [
			{
				label: 'RAL (color space) — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/RAL_colour_standard'
			},
			{ label: 'RAL Color Standard — official site', url: 'https://www.ral-farben.de' }
		]
	},
	pantone: {
		summary:
			"The world's most recognized spot-color matching system for print and product, assigning codes to physical swatches",
		whatItIs:
			'Introduced in 1963, the Pantone Matching System (PMS) is a proprietary spot-color standard that assigns unique codes to roughly 1,867+ colors so they reproduce consistently across vendors and materials. Colors are referenced by code plus a finish suffix (e.g. 185 C for coated) and are distributed as physical swatch books in coated, uncoated, and matte editions. It is the de facto language of brand and spot color across graphic design, fashion, textiles, plastics, and paint.',
		usedFor: [
			'Locking down brand identity colors across print vendors',
			'Spot-color printing where exact, repeatable inks are required',
			'Fashion and textile color specification (Pantone TCX/TPG)',
			'Plastics and product color matching',
			'Cross-industry communication of a single agreed color'
		],
		benefitsHere: [
			'Pantone is status:coming-soon in Chromatics, so its nearest and code lookups throw an actionable error until a licensed dataset is supplied',
			'The proprietary swatch values are paid and cannot ship by default; any future support would rely on community-sourced approximate sRGB with a disclaimer',
			'When enabled it would behave like the working RAL system: map a color through c.lab, then return the closest Pantone code and name',
			'For an in-app equivalent today, use lab with deltaE2000 to compare against your own swatch references'
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['lab', 'cmyk', 'srgb'],
			related: ['hks', 'dic', 'toyo', 'trumatch', 'ral', 'focoltone']
		},
		resources: [
			{ label: 'Pantone — Wikipedia', url: 'https://en.wikipedia.org/wiki/Pantone' },
			{ label: 'Pantone official site', url: 'https://www.pantone.com' }
		]
	},
	munsell: {
		summary:
			'The first scientific color-order system, naming colors by perceptually equal steps of Hue, Value, and Chroma',
		whatItIs:
			'Created by Albert Munsell in 1905, this was the first scientifically grounded color-order system. It locates a color along three perceptual dimensions arranged in roughly equal visual steps: Hue (ten families R, YR, Y, GY, G, BG, B, PB, P, RP), Value (0 black to 10 white), and Chroma (0 to ~26+ for vividness). A color is written in notation such as 5R 4/14. Because Munsell renotation data gives precise CIE xyY values per chip, conversion is lookup plus interpolation rather than a closed-form formula.',
		usedFor: [
			'Soil, rock, and sediment classification in geology and agriculture',
			'Archaeology and forensic color documentation',
			'Dental and skin shade matching',
			'Art education and teaching color theory',
			'Standardized color communication and QC (e.g. JIS Z8102)'
		],
		benefitsHere: [
			'Munsell is status:coming-soon in Chromatics, so fromNotation and nearest throw an actionable error pending the renotation dataset',
			'Its perceptual Hue/Value/Chroma structure maps conceptually onto HCT, which IS backed: reach for c.hct and atTone/withChroma for a working perceptually-uniform cylinder today',
			'When enabled, nearest would snap a color to the closest Munsell chip and report a deltaE distance, mirroring the live RAL workflow',
			"For perceptual stepping right now, OKLCH's atLightness and atChroma give the same kind of even-step control Munsell pioneered"
		],
		relations: {
			derivedFrom: ['xyz', 'lab'],
			convertsTo: ['lab', 'xyy', 'srgb'],
			related: ['hct', 'ncs', 'ostwald', 'coloroid', 'pccs', 'din6164']
		},
		resources: [
			{
				label: 'Munsell color system — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Munsell_color_system'
			},
			{ label: 'JIS Z8102 — Wikipedia', url: 'https://en.wikipedia.org/wiki/JIS_Z8102' }
		]
	},
	ncs: {
		summary:
			'A perceptual color system from Sweden describing how colors appear via blackness, chromaticness, and hue',
		whatItIs:
			"The Natural Color System, developed in Sweden in 1964, is built on Hering's opponent-color theory and describes how a color appears to human vision rather than how it is physically produced. Each color is given by its blackness, chromaticness, and hue, written in notation such as NCS S 2060-Y90R (20% blackness, 60% chromaticness, a yellow leaning 90% toward red). It defines roughly 1,950 standardized colors and is the national standard in Sweden, Norway, Spain, and South Africa.",
		usedFor: [
			'Architecture and building-specification color in Europe',
			'Interior and environmental design',
			'Product and industrial design color selection',
			'National color standards and facade specification',
			'Perceptual color description independent of any device'
		],
		benefitsHere: [
			'NCS is status:coming-soon in Chromatics, so fromNotation and nearest throw an actionable error until licensed lookup data is provided',
			"Its perception-first, opponent-color basis aligns with the app's OKLCH/Lab core; for an opponent-style working space today reach for c.lab (a/b axes) or c.oklab",
			'When enabled, nearest would return the closest NCS notation for a working color, paralleling the live RAL lookup',
			'Until then, treat NCS notations as references and compare against them using lab and deltaE2000'
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['lab', 'srgb'],
			related: ['munsell', 'ral', 'ostwald', 'din6164', 'coloroid', 'pccs']
		},
		resources: [
			{
				label: 'Natural Color System — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/Natural_Color_System'
			}
		]
	},
	hks: {
		summary:
			'A European spot-color system (Hostmann-Steinberg, Kast+Ehinger, Schmincke) with 120 base colors over 3,520 shades',
		whatItIs:
			'HKS is a set of spot-color standards used predominantly in European printing and graphic design, named for its originators Hostmann-Steinberg, Kast+Ehinger, and Schmincke. It offers 120 base colors expanded to 3,520 shades, with each base shown in nine tint steps. The system is the standard in German-speaking Europe (the DACH region) and ships as physical swatch fans across K (coated), N (uncoated), Z (newsprint), and E (continuous) series.',
		usedFor: [
			'Spot-color print production in German-speaking Europe',
			'Packaging color specification',
			'Brand colors for European print houses',
			'Newsprint and continuous-stationery color (Z and E series)',
			'Selecting coated vs uncoated reproduction (K vs N series)'
		],
		benefitsHere: [
			'HKS is status:coming-soon in Chromatics, so lookup and nearest throw an actionable error until a licensed swatch dataset is loaded',
			'As a spot-ink catalog it is print-bound; the in-app process-color equivalent is cmyk, with totalInk and limitInk to keep a separation printable',
			'When enabled, nearest would snap a color to the closest HKS base/series code, like the working RAL flow',
			'For now, approximate an HKS target by matching its sRGB swatch in lab and checking deltaE2000'
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['cmyk', 'lab', 'srgb'],
			related: ['pantone', 'dic', 'toyo', 'trumatch', 'ral', 'focoltone']
		},
		resources: [
			{
				label: 'HKS (colour system) — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/HKS_(colour_system)'
			}
		]
	},
	copic: {
		summary:
			'The leading professional alcohol-marker color system from Japan, 358 colors coded by hue family, saturation, and brightness',
		whatItIs:
			"Copic is the world's leading professional marker color system, made by Too Corporation in Japan. It organizes 358 colors (Classic) — or 396 in the Sketch and Ciao lines — by hue family, saturation, and brightness so color relationships are easy to read. Codes start with a hue family (BV, V, RV, R, YR, Y, YG, G, BG, B, E for Earth, 0 for the Colorless Blender), a first digit for saturation (0 most vivid, 9 grayest), and trailing digits for brightness (00 lightest, 99 darkest), so B23 is lighter than B26.",
		usedFor: [
			'Manga and comic illustration',
			'Concept art and editorial illustration',
			'Industrial-design and product rendering',
			'Architectural and interior sketching',
			'Planning smooth marker blends within a hue family'
		],
		benefitsHere: [
			'Copic is status:coming-soon in Chromatics, so lookup and nearest throw an actionable error until the marker dataset is supplied',
			'Its codes encode a hue-family / saturation / brightness logic close to HSV; for a live analog reach for c.hsv or the hue-family thinking of c.hsl',
			'When enabled, nearest would return the closest Copic marker code, and a blendable helper would surface adjacent codes that mix smoothly',
			"Until then, model a marker's approximate sRGB and explore neighbors with rotateHue and tint/shade/tone on the hue families"
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb', 'lab'],
			related: ['pantone', 'dic', 'toyo', 'ral', 'trumatch']
		},
		resources: [
			{ label: 'Copic — Wikipedia', url: 'https://en.wikipedia.org/wiki/Copic' },
			{ label: 'Too Corporation — official manufacturer', url: 'https://www.too.com/copic/en/' }
		]
	},
	dic: {
		summary:
			"DIC Corporation's proprietary Japanese spot-color system, comparable to Pantone, for printing and packaging",
		whatItIs:
			'The DIC Color System is a proprietary spot-color system developed by DIC Corporation (formerly Dainippon Ink and Chemicals) in Japan for packaging, design, and printing. It is one of the two dominant spot-color standards in Japanese and Asian print alongside Toyo, and serves a role comparable to Pantone in those markets. Colors are referenced by DIC code identifiers (e.g. DIC 184) backed by physical swatch guides.',
		usedFor: [
			'Japanese and Asian spot-color print production',
			'Packaging design color specification',
			'Brand colors for the Asian market',
			'Matching legacy DIC-specified jobs',
			'General design and graphic-arts color reference'
		],
		benefitsHere: [
			'DIC is status:coming-soon in Chromatics, so lookup and nearest throw an actionable error until a licensed swatch dataset is loaded',
			'As a spot-ink catalog, its closest in-app analog is cmyk for process simulation, using totalInk and separations to plan the print',
			'When enabled, nearest would snap a color to the closest DIC code, mirroring the live RAL lookup',
			"For now, compare against a DIC reference swatch's sRGB in lab via deltaE2000"
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['cmyk', 'lab', 'srgb'],
			related: ['toyo', 'pantone', 'hks', 'trumatch', 'ral']
		},
		resources: [
			{ label: 'DIC Corporation — Wikipedia', url: 'https://en.wikipedia.org/wiki/DIC_Corporation' }
		]
	},
	toyo: {
		summary:
			"Toyo Ink's Japanese spot-color matching system, one of Asia's two dominant print systems with over 1,050 colors",
		whatItIs:
			'The Toyo Color Finder is a major Japanese spot-color matching system from Toyo Ink, comparable to Pantone in Asian markets. With over 1,050 process and spot colors, it is — alongside DIC — one of the two dominant print color systems in Asia. Colors are identified by Toyo catalog codes matched against physical swatch guides printed on coated and uncoated paper, and the system is supported in Adobe Creative Suite and other design software.',
		usedFor: [
			'Japanese and Asian spot-color print production',
			'Packaging design color specification',
			'Process and spot color selection in Adobe workflows',
			'Coated vs uncoated reproduction matching',
			'Brand color references for the Asian market'
		],
		benefitsHere: [
			'Toyo is status:coming-soon in Chromatics, so lookup and nearest throw an actionable error until a licensed swatch dataset is supplied',
			'Its in-app process equivalent is cmyk, with limitInk and isRichBlack to keep a simulated separation printable',
			'When enabled, nearest would return the closest Toyo catalog code, like the working RAL flow',
			'Until then, approximate a Toyo target via its sRGB swatch and compare in lab with deltaE2000'
		],
		relations: {
			derivedFrom: ['lab'],
			convertsTo: ['cmyk', 'lab', 'srgb'],
			related: ['dic', 'pantone', 'hks', 'trumatch', 'ral']
		},
		resources: [
			{ label: 'Toyo Ink — Wikipedia', url: 'https://en.wikipedia.org/wiki/Toyo_Ink' },
			{ label: 'Toyo Ink — official site', url: 'https://www.toyoink.com' }
		]
	},
	trumatch: {
		summary:
			'A digital-first CMYK matching system with 2,000+ printable process colors organized by hue, saturation, and brightness',
		whatItIs:
			'Trumatch is a digital-first color matching system offering over 2,000 process colors that are all achievable with standard CMYK printing. Colors are organized by 50 hues, each with up to 40 systematic tints and shades, so every entry carries native CMYK values and is designed to print without out-of-gamut surprises. Built for desktop-publishing workflows, it is supported in Adobe Creative Suite.',
		usedFor: [
			'Desktop-publishing CMYK process color selection',
			'Predictable, in-gamut print color without spot inks',
			'Systematic tint/shade ramps within a hue',
			'Adobe Creative Suite color workflows',
			'Specifying process color for four-color offset printing'
		],
		benefitsHere: [
			'Trumatch is status:coming-soon in Chromatics, so lookup and nearest throw an actionable error until its dataset is loaded',
			'Because Trumatch is natively CMYK, the backed cmyk model is the direct in-app counterpart: build process colors and check totalInk, limitInk, and separations',
			'When enabled, byHue would list every tint/shade in a hue family and nearest would snap to the closest printable code',
			'For now, design directly in cmyk to stay within process gamut the way Trumatch intends'
		],
		relations: {
			derivedFrom: ['cmyk'],
			convertsTo: ['cmyk', 'srgb', 'lab'],
			related: ['focoltone', 'pantone', 'hks', 'dic', 'toyo', 'hexachrome']
		},
		resources: [{ label: 'Trumatch — Wikipedia', url: 'https://en.wikipedia.org/wiki/Trumatch' }]
	},
	ansi: {
		summary:
			'Standard terminal color codes — 4-bit 16-color and 8-bit 256-color palettes set via ANSI escape sequences',
		whatItIs:
			'The ANSI Color System defines the colors available in computer terminals and command-line interfaces through ANSI escape codes, based on the VGA palette. It spans tiers: ANSI 16 (8 standard plus 8 bright), ANSI 256 (the 16 base colors plus a 6×6×6 color cube and 24 grayscale steps), and 24-bit true color carried by escape sequences. Colors are selected by integer code (e.g. ANSI 196) and emitted with sequences like \\x1b[31m.',
		usedFor: [
			'Coloring text and backgrounds in CLI applications',
			'Terminal user interfaces and TUIs',
			'Shell scripts and log highlighting',
			'Mapping arbitrary colors down to a 256-color terminal palette',
			'Generating escape codes for cross-terminal output'
		],
		benefitsHere: [
			'ANSI is status:coming-soon in Chromatics, so lookup and nearest throw an actionable error until the palette dataset is wired in',
			'Conceptually it is a quantized sRGB palette, so the backed srgb model is the natural source: design a color, then map it down to a terminal code',
			'When enabled, nearest would return the closest ANSI 256 code and a helper would emit the matching \\x1b[38;5;Nm escape',
			'Until then, build the target in srgb and read its hex to pick a terminal color by eye'
		],
		relations: {
			derivedFrom: ['srgb'],
			convertsTo: ['srgb'],
			related: ['fedstd595', 'bs', 'ral']
		},
		resources: [
			{
				label: 'ANSI escape code — Wikipedia',
				url: 'https://en.wikipedia.org/wiki/ANSI_escape_code'
			},
			{
				label: 'ANSI256 — colormath documentation',
				url: 'https://ajalt.github.io/colormath/api/colormath/com.github.ajalt.colormath.model/-ansi256/'
			}
		]
	},
	bs: {
		summary:
			'UK national color standard spanning BS 381C, BS 4800, and BS 5252 for government, military, and industry',
		whatItIs:
			'The British Standard Colour system is a family of standardized palettes maintained by the British Standards Institution for UK industrial and design use. It spans BS 381C (signaling and identification colors), BS 4800 (building and construction), and BS 5252 (a coordinated framework of color codes). Each color is fixed by a standard code referencing one of these palettes, giving specifiers an unambiguous, named reference rather than free-form values.',
		usedFor: [
			'UK building and construction specification (BS 4800)',
			'Defense and military equipment finishes (BS 381C)',
			'Signaling, pipeline, and hazard identification colors',
			'British industrial and infrastructure standards',
			'Matching legacy UK government color references'
		],
		benefitsHere: [
			'Reach for `c.bs` when you need to name or look up a color against the official UK palettes rather than work in a continuous space.',
			'In Chromatics this is a coming-soon catalog system: the registered `nearest` and `code` methods throw an actionable error because the licensed BS swatch dataset is not bundled. Until that data ships, do continuous work in `c.lab` or `c.srgb` and treat BS codes as reference labels.',
			'When the dataset lands, `nearest` will map any OKLCH-stored color to the closest BS code, and `code` will resolve a code back to a color for round-tripping.'
		],
		relations: {
			related: ['fedstd595', 'as2700', 'ral', 'din6164', 'lab', 'srgb']
		},
		resources: [
			{
				label: 'British Standard Colour (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/British_Standard_Colour'
			},
			{
				label: 'British Standards (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/British_Standards'
			}
		]
	},
	fedstd595: {
		summary:
			"The U.S. government's official color standard — ~650 fixed colors for military equipment and federal procurement",
		whatItIs:
			"Federal Standard 595C is the United States government's official color standard, defining a fixed palette of roughly 650 colors for military, industrial, and government applications. Each color is identified by a 5-digit code in which the first digit indicates the finish (gloss, semi-gloss, or flat) and the remaining digits identify the color itself (e.g. 36375). It standardizes procurement so contractors and agencies reference the same physical swatches.",
		usedFor: [
			'U.S. military and defense equipment specification',
			'Federal procurement and government building finishes',
			'Defense contractor color requirements',
			'Aircraft, vehicle, and camouflage color matching',
			'Cross-referencing finishes by gloss, semi-gloss, or flat'
		],
		benefitsHere: [
			'Reach for `c.fedstd595` to look up or name a color against the official U.S. government palette, with the finish encoded in the leading digit of the code.',
			'This is a coming-soon catalog system in Chromatics: the `nearest` and `code` methods throw an actionable error because the licensed FED-STD-595 swatch dataset is required and not bundled. Do continuous color work in `c.lab` or `c.srgb` meanwhile.',
			'Once the dataset is added, `nearest` will return the closest 5-digit code for any color and `code` will resolve a code back to a swatch.'
		],
		relations: {
			related: ['bs', 'as2700', 'ral', 'ansi', 'lab', 'srgb']
		},
		resources: [
			{
				label: 'Federal Standard 595 (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Federal_Standard_595'
			}
		]
	},
	iscc_nbs: {
		summary:
			'A 1955 naming method dividing color space into 267 named regions over Munsell coordinates for standardized English names',
		whatItIs:
			'The ISCC–NBS system is a color naming and classification method developed by the Inter-Society Color Council and the U.S. National Bureau of Standards in 1955. It partitions color space into 267 named regions mapped onto Munsell coordinates, each with a centroid color and a defined range. Names are built systematically from hue terms plus modifiers, producing descriptions like "vivid red," "dark grayish yellow," or "strong yellowish green."',
		usedFor: [
			'Standardized English color naming for scientific description',
			'Color description in biology, geology, and other natural sciences',
			'Forensic and evidence color documentation',
			'Communicating colors in words without numeric coordinates',
			'Mapping measured colors to a controlled vocabulary'
		],
		benefitsHere: [
			'Reach for `c.iscc_nbs` to turn any Chromatics color into a human-readable name like "strong yellowish green" instead of raw coordinates.',
			'This is a coming-soon catalog system: the `nearest` and `code` methods throw an actionable error because the 267-region centroid/Munsell dataset is not bundled. Naming therefore requires that licensed data before it works.',
			'Because the system is layered on Munsell, pair it conceptually with `c.munsell`; once data ships, `nearest` will return the closest named region for an OKLCH-stored color.'
		],
		relations: {
			related: ['munsell', 'ncs', 'werner', 'cns', 'lab']
		},
		resources: [
			{
				label: 'ISCC–NBS system (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/ISCC%E2%80%93NBS_system'
			}
		]
	},
	werner: {
		summary:
			"Patrick Syme's 1814 catalog of 110 named colors with mineral, vegetable, and animal examples, famously used by Darwin",
		whatItIs:
			"Werner's Nomenclature of Colours is a pioneering color naming system published in 1814 by Patrick Syme, building on the mineralogical work of Abraham Werner. It describes 110 named colors organized into groups (whites, greys, blacks, blues, purples, reds, oranges, yellows, greens, browns), each illustrated with a painted swatch and examples from the mineral, vegetable, and animal kingdoms. Charles Darwin carried it aboard HMS Beagle to describe specimens, and it survives today as a digitized reference.",
		usedFor: [
			'Historical and natural-history color description',
			'Naming colors with mineral, plant, and animal references',
			'Design inspiration drawn from a period palette',
			'Education on early systematic color naming',
			'Recreating 19th-century specimen documentation'
		],
		benefitsHere: [
			'Reach for `c.werner` to attach an evocative historical name and natural-world examples to a color rather than a numeric code.',
			'This is a coming-soon catalog system: the `nearest` and `code` methods throw an actionable error until the digitized 110-color Werner dataset is bundled.',
			'Once the data ships, `nearest` would return the closest period name (e.g. "Arterial Blood Red") for any OKLCH-stored color — a playful, illustrative feature rather than a measurement tool.'
		],
		relations: {
			related: ['iscc_nbs', 'munsell', 'ncs', 'ral']
		},
		resources: [
			{
				label: "Werner's Nomenclature of Colours (Wikipedia)",
				url: 'https://en.wikipedia.org/wiki/Werner%27s_Nomenclature_of_Colours'
			},
			{
				label: "Werner's Nomenclature — digital recreation (c82.net)",
				url: 'https://www.c82.net/werner/'
			}
		]
	},
	din6164: {
		summary:
			'A German CIE-based color-order system organizing colors by hue (T), saturation (S), and darkness (D) with even hue steps',
		whatItIs:
			'DIN 6164 is a German color-order system from the Deutsches Institut für Normung, founded on CIE colorimetry. It organizes colors by three coordinates: Farbton/hue (T, 1–24 principal hues), Sättigung/saturation (S), and Dunkelheit/darkness (D), with perceptually equal hue steps. Because it is built on defined CIE formulas, its colors convert directly to CIE XYZ and CIE Lab, making it a mathematically rigorous standard used in German industry.',
		usedFor: [
			'German industrial color specification, especially coatings and textiles',
			'Scientific and systematic color ordering',
			'Specifying colors by hue, saturation, and darkness coordinates',
			'Converting between an ordered catalog and CIE colorimetry',
			'Quality control against a DIN reference standard'
		],
		benefitsHere: [
			'Reach for `c.din6164` when you want the German T/S/D ordering tied to measurable CIE values rather than a device space.',
			'This is a coming-soon catalog system: `nearest` and `code` throw an actionable error because the DIN 6164 conversion tables are not bundled. For rigorous perceptual work today use `c.lab` or `c.lch`, which this system maps onto.',
			'When the dataset ships, `nearest` will return the closest T/S/D triple for a color and `code` will resolve a triple back through CIE Lab/XYZ.'
		],
		relations: {
			related: ['lab', 'xyz', 'lch', 'ral', 'ostwald', 'munsell']
		},
		resources: [{ label: 'DIN 6164 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/DIN_6164' }]
	},
	ostwald: {
		summary:
			"Wilhelm Ostwald's 1916 system organizing color by hue, white content, and black content (C + W + K = 100%)",
		whatItIs:
			'The Ostwald color system, developed by chemist Wilhelm Ostwald in 1916, classifies colors by hue together with white content (W) and black content (K), constrained so that full color content (C), white, and black always sum to 100 percent. Historically influential in art and design education, it has been largely superseded by modern systems, but its white/black framing is conceptually the direct ancestor of the modern HWB model.',
		usedFor: [
			'Historical reference and the study of color-system evolution',
			'Education on hue plus white/black content composition',
			'Understanding the conceptual roots of the HWB model',
			'Analyzing early systematic tint/shade/tone organization'
		],
		benefitsHere: [
			'Reach for `c.ostwald` to relate a color to its hue, white, and black content the way the modern `c.hwb` view does — they share the same intuition.',
			"This is a coming-soon catalog system: `nearest` and `code` throw an actionable error because Ostwald's tabulated swatch data is not bundled. For practical white/black-content work today, use the backed `c.hwb` model, which carries its `addWhite`, `addBlack`, and `pureHue` methods.",
			'Treat Ostwald as a historical/educational reference; HWB is the working stand-in inside the DSL.'
		],
		relations: {
			related: ['hwb', 'hsl', 'munsell', 'din6164', 'pccs']
		},
		resources: [
			{
				label: 'Ostwald color system (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Ostwald_color_system'
			}
		]
	},
	pccs: {
		summary:
			'A 1964 Japanese system organizing colors into named tone categories for practical design and education',
		whatItIs:
			'The Practical Color Coordinate System (PCCS) is a Japanese color system introduced in 1964 to represent and communicate color for practical design and manufacturing. Its distinctive feature is named "tone" categories — vivid, bright, strong, deep, light, soft, dull, dark, pale, and others — each grouping colors of comparable lightness and saturation. This tone-plus-hue organization makes it especially suited to teaching and coordinating palettes.',
		usedFor: [
			'Japanese design education and color training',
			'Tone-based palette coordination',
			'Communicating color intent in practical design and manufacturing',
			'Grouping colors of comparable lightness and saturation',
			'Building harmonious sets from a named tone'
		],
		benefitsHere: [
			'Reach for `c.pccs` to organize colors by tone categories, which maps naturally onto palette generation in the DSL.',
			'This is a coming-soon catalog system: `byTone`-style lookups via the registered `nearest` and `code` methods throw an actionable error because the PCCS tone dataset is not bundled. For tone-like adjustments today, use the backed `c.hsl` methods `tint`, `shade`, and `tone`.',
			'When the data ships, fetching all colors of a tone would return a ready-made harmonious set; until then, approximate tones through HSL or perceptual `c.oklch` moves.'
		],
		relations: {
			related: ['hsl', 'munsell', 'ncs', 'ostwald', 'coloroid']
		},
		resources: [
			{
				label: 'Practical Color Coordinate System (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Practical_Color_Coordinate_System'
			}
		]
	},
	coloroid: {
		summary:
			'A 1962 Hungarian color-order system for architecture, spaced by aesthetic harmony rather than pure perception',
		whatItIs:
			'Coloroid is a Hungarian color-order system from 1962, designed specifically for architectural, interior, and environmental design. It represents colors by three coordinates — A (hue), T (saturation), and V (lightness/brightness) — but spaces them according to aesthetic and harmony principles rather than strictly perceptual uniformity. This makes its scales well suited to specifying and coordinating colors in the built environment.',
		usedFor: [
			'Architectural and façade color specification',
			'Interior and environmental design palettes',
			'Urban planning color coordination',
			'Generating aesthetically harmonious color sets',
			'Communicating color by hue/saturation/lightness coordinates'
		],
		benefitsHere: [
			'Reach for `c.coloroid` when you want aesthetically spaced hue/saturation/lightness coordinates aimed at architectural harmony rather than perceptual uniformity.',
			'This is a coming-soon catalog system: `nearest` and `code` (the A/T/V lookup) throw an actionable error because the Coloroid conversion dataset is not bundled. For perceptual harmony work today, use the backed `c.oklch` (and its `analogous`, `triadic`, `complementary`) or `c.hsl`.',
			'Coloroid is typically converted to HSL or RGB for digital display, so treat the HSL/OKLCH views as the practical substitute until the dataset ships.'
		],
		relations: {
			related: ['hsl', 'hsv', 'oklch', 'munsell', 'pccs']
		},
		resources: [{ label: 'Coloroid (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Coloroid' }]
	},
	cns: {
		summary:
			'The Chinese National Standard color system — Munsell-based standardized colors for industry and government in Greater China',
		whatItIs:
			'CNS (Chinese National Standard) defines standardized colors for industrial and governmental use across mainland China and Taiwan, built on the Munsell color framework. Key standards include CNS 13076 in Taiwan, a national color system based on Munsell, and GB/T 15608 in mainland China, the color naming and specification standard. Because it derives from Munsell, its colors convert to CIE Lab and approximate sRGB.',
		usedFor: [
			'Industrial and manufacturing color specification in Greater China',
			'Government procurement and public-project colors',
			'Signage and standardized labeling',
			'Color requirements for export to Chinese markets',
			'Mapping national codes onto Munsell coordinates'
		],
		benefitsHere: [
			'Reach for `c.cns` to name or look up a color against the official Chinese and Taiwanese standards rather than a device space.',
			'This is a coming-soon catalog system: `nearest` and `code` throw an actionable error because the CNS/Munsell-derived dataset is not bundled. Since the system rests on Munsell, pair it with `c.munsell`, and use `c.lab` for measurable work today.',
			'Once the data ships, `nearest` will return the closest CNS code for an OKLCH-stored color and `code` will resolve a code back to a swatch.'
		],
		relations: {
			related: ['munsell', 'iscc_nbs', 'bs', 'as2700', 'lab']
		},
		resources: [
			{
				label: 'Munsell color system (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Munsell_color_system'
			}
		]
	},
	hexachrome: {
		summary:
			"Pantone's discontinued 6-color process (CMYK + Orange + Green) for ~90% spot-color reproducibility vs ~50% with CMYK",
		whatItIs:
			'Hexachrome was Pantone\'s six-color printing process, introduced in 1995 and discontinued in 2008. It added Orange and Green inks to standard CMYK (CMYK + O + G) to extend the printable gamut, reaching roughly 90 percent Pantone spot-color reproducibility versus about 50 percent for CMYK alone. Modern "expanded gamut" CMYKOGV printing is its spiritual successor.',
		usedFor: [
			'Historical reference for expanded-gamut printing',
			'Understanding how added inks extend the CMYK gamut',
			'High-fidelity reproduction of Pantone spot colors (historically)',
			'Comparing six-color process against four-color CMYK',
			'Context for modern CMYKOGV expanded-gamut workflows'
		],
		benefitsHere: [
			'Reach for `c.hexachrome` only as a reference to a wider-gamut print process; it is not a working separation engine here.',
			'This is a coming-soon, discontinued catalog system: the registered `nearest` and `code` methods throw an actionable error and no active dataset exists. For practical print work, use the backed `c.cmyk` model (with `totalInk`, `separations`, `limitInk`, `setKey`).',
			'Use it to explain why a color sits outside CMYK gamut; pair with `c.cmyk` and the `c.p3`/`c.rec2020` wide-gamut views for the closest practical equivalents.'
		],
		relations: {
			related: ['cmyk', 'cmy', 'pantone', 'p3', 'rec2020']
		},
		resources: [
			{ label: 'Hexachrome (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Hexachrome' }
		]
	},
	focoltone: {
		summary:
			'British CMYK process-printing palette of 763 builds engineered to eliminate trapping and registration problems',
		whatItIs:
			'Focoltone is a British color system whose 763 colors are each defined as a specific CMYK build with known overprint behavior, so designs need no spot inks. Colors that share ink components overprint cleanly, which is its whole reason for being: minimizing trapping and registration issues on press. It is supported as a swatch library in Adobe Illustrator, CorelDRAW, and other design software.',
		usedFor: [
			'Four-color process (CMYK) print production',
			'Designs where ink registration and trapping are a concern',
			'Selecting colors that overprint cleanly without separate trapping work',
			'Cost control by avoiding spot inks in commercial printing',
			'Cross-application swatch libraries in Illustrator and CorelDRAW'
		],
		benefitsHere: [
			'Focoltone is a catalog system marked coming-soon: its `nearest`/`code` lookups throw an actionable error until a licensed swatch dataset is loaded, so Chromatics will not silently guess a Focoltone code.',
			'Because every Focoltone color is fundamentally a CMYK build, the backed `c.cmyk` view plus `CMYK(...)` and methods like `totalInk`/`separations` already let you reason about the ink mix a Focoltone code would carry.',
			'Any OKLCH-stored color can be previewed as `c.cmyk` to approximate how it sits in process printing while a real Focoltone table remains pending.'
		],
		relations: {
			derivedFrom: ['cmyk'],
			convertsTo: ['cmyk', 'srgb'],
			related: ['trumatch', 'pantone', 'hexachrome', 'dic', 'hks']
		},
		resources: [{ label: 'Focoltone (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Focoltone' }]
	},
	scotdic: {
		summary:
			'Textile color-communication system with 2,300+ physical fabric swatches for accurate industrial dye matching',
		whatItIs:
			'SCOTDIC is a color system used primarily in the textile industry for standardized dye matching, color communication, and quality control. It provides physical fabric swatches in cotton and polyester covering more than 2,300 colors, each identified by a categorical SCOTDIC code that selects one predefined color. It is distributed as physical swatch books rather than as a computational color space.',
		usedFor: [
			'Textile and fashion color specification',
			'Fabric dye matching against a standardized reference',
			'Garment and production quality control',
			'Communicating exact colors between mills, brands, and suppliers',
			'Mapping textile references to RGB for digital display via lookup tables'
		],
		benefitsHere: [
			'SCOTDIC is a catalog system flagged coming-soon: its `nearest`/`code` methods throw an actionable error until the licensed swatch dataset is available, so the app stays honest rather than inventing a code.',
			'In the meantime any color can be inspected through perceptual views and `c.lab` to judge dye-matching proximity, the same kind of measurement SCOTDIC swatches are evaluated against.',
			'Once data is supplied, lookups would resolve to ordinary Chromatics colors, so a SCOTDIC swatch converts to any other model via `c.to("<id>")` or the `c.<id>` view.'
		],
		relations: {
			convertsTo: ['srgb', 'lab'],
			related: ['dic', 'munsell', 'ncs', 'pantone']
		},
		resources: [{ label: 'SCOTDIC (Wikipedia)', url: 'https://en.wikipedia.org/wiki/SCOTDIC' }]
	},
	as2700: {
		summary:
			'The Australian Standard color set — ~240 named colors for architecture, building, and industry in Australia and NZ',
		whatItIs:
			'AS 2700 is the Australian Standard for colors, published under Standards Australia, defining roughly 240 colors for architecture, building, and industrial applications across Australia and New Zealand. Each color carries a letter group prefix plus a three-digit number (for example G61, "Sleeperwood"), with groups spanning blues, browns, greens, neutrals, and more. It ships as physical color chips and is cross-referenced with Munsell and measured CIE Lab values.',
		usedFor: [
			'Australian architecture and building specification',
			'Government and infrastructure projects requiring a mandatory color reference',
			'Industrial color standardization across Australia and New Zealand',
			'Specifying paint and finish colors by stable named codes',
			'Cross-referencing colors to Munsell and CIE Lab measurements'
		],
		benefitsHere: [
			'AS 2700 is a catalog system marked coming-soon: `nearest`/`code` lookups throw an actionable error until the chip dataset (with its published Lab values) is loaded.',
			'Because AS 2700 chips publish measured CIE Lab values, the backed `c.lab` view plus deltaE methods such as `deltaE2000`/`isPerceptiblyDifferent` are exactly the tools you would use to find the nearest standard color.',
			'Any working color can be checked as `c.lab` today to estimate how close it sits to an AS 2700 reference while the lookup table is pending.'
		],
		relations: {
			convertsTo: ['lab', 'srgb'],
			related: ['bs', 'fedstd595', 'munsell', 'ral']
		},
		resources: [{ label: 'AS 2700 (Wikipedia)', url: 'https://en.wikipedia.org/wiki/AS_2700' }]
	},
	anpa: {
		summary:
			'Historical American Newspaper Publishers Association palette of 300 spot colors tuned for newsprint',
		whatItIs:
			'ANPA is the color system of the American Newspaper Publishers Association, defining 300 spot colors chosen specifically to reproduce well on absorbent newsprint paper stock. It was developed to standardize color reproduction across newspaper printing. The system is largely historical today and has no active modern API.',
		usedFor: [
			'Historical reference for newspaper spot-color printing',
			'Reproducing colors reliably on low-quality newsprint stock',
			'Standardizing print-media color across newspapers',
			'Archival and legacy print color matching'
		],
		benefitsHere: [
			'ANPA is a catalog system marked coming-soon: its `nearest`/`code` lookups throw an actionable error, and given its historical status no licensed dataset is bundled.',
			'For approximate newsprint behavior you can still route any color through the backed `c.cmyk` view to reason about a process build, since ANPA was ultimately about ink on paper.',
			'Colors remain OKLCH-stored, so even without an ANPA table you can compare candidates through `c.lab` and deltaE methods for a perceptual nearest-match estimate.'
		],
		relations: {
			convertsTo: ['cmyk', 'srgb'],
			related: ['pantone', 'trumatch', 'focoltone']
		},
		resources: [
			{
				label: 'News Media Alliance (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/News_Media_Alliance'
			}
		]
	},
	coloradd: {
		summary:
			'Accessibility notation that encodes colors as geometric symbols so color-blind users can identify them without seeing them',
		whatItIs:
			'ColorADD is a universal color-identification system created in Portugal in 2010 to assist people with color blindness. Rather than a color space, it is a graphic code: a triangle for red, a diagonal bar for blue, a horizontal bar for yellow, with combinations of these primaries encoding secondary colors. It lets colors be communicated and identified through symbols instead of appearance.',
		usedFor: [
			'Accessibility design for color-vision-deficient (CVD) users',
			'Inclusive product packaging and labeling',
			'Wayfinding and signage that does not rely on hue alone',
			'Educational materials that name colors symbolically',
			'Annotating swatches with color-blind-friendly identifiers'
		],
		benefitsHere: [
			'ColorADD is registered as an accessibility/catalog system but is coming-soon: its `nearest`/`code` methods throw an actionable error until the symbol dataset and mapping are implemented.',
			"It pairs naturally with the RGB family's `simulateCVD`, which is already backed on views like `c.srgb`/`c.p3`, letting you preview how a color reads under color-vision deficiency that ColorADD symbols are meant to disambiguate.",
			'Once wired up, a ColorADD symbol would resolve from the OKLCH-stored color like any other view, so the same color drives both its on-screen appearance and its accessible symbol.'
		],
		relations: {
			convertsTo: ['srgb'],
			related: ['munsell', 'ncs']
		},
		resources: [{ label: 'ColorADD (Wikipedia)', url: 'https://en.wikipedia.org/wiki/ColorADD' }]
	},
	colorindex: {
		summary:
			'The global pigment and dye reference database, assigning standardized C.I. names and numbers to 13,000+ colorants',
		whatItIs:
			'Colour Index International is the global reference system for pigments and dyes, used across industries to ensure consistent colorant identification. It assigns each commercial colorant a standardized name and number in the form "C.I. [Application] [Color] [Number]" (for example, C.I. Pigment Red 170), covering more than 13,000 entries. It is a chemical and colorant naming reference, not a display color space.',
		usedFor: [
			'Specifying pigments and dyes by standardized chemical identity',
			'Pigment procurement and supplier communication',
			'Dye formulation and recipe documentation',
			'Ensuring consistent colorant selection across industries',
			'Cross-referencing commercial colorants to a single authoritative name'
		],
		benefitsHere: [
			'Colour Index is a catalog system marked coming-soon and is largely out of scope for a manipulation library, so its `nearest`/`code` lookups throw an actionable error and exist only as a reference pointer.',
			"Where a colorant's measured appearance is known, the backed `c.lab` view and deltaE methods are the right tools to compare a C.I. pigment's color to any working value.",
			"Any color stays OKLCH-stored and reachable as `c.<id>`, so the app can still display and analyze a pigment's color even though the chemical index itself is not a computable space."
		],
		relations: {
			convertsTo: ['lab', 'srgb'],
			related: ['pantone', 'munsell', 'ncs']
		},
		resources: [
			{
				label: 'Colour Index International (Wikipedia)',
				url: 'https://en.wikipedia.org/wiki/Colour_Index_International'
			}
		]
	},
	iccprofile: {
		summary:
			'The ICC standard data format describing how a device reproduces color, enabling consistency across hardware',
		whatItIs:
			'An ICC profile is not a color model but a standardized data file defined by the International Color Consortium that describes the color characteristics of a device. Profile types include input (scanners), display (monitors), output (printers), abstract, and DeviceLink, and conversions route through a Profile Connection Space that uses CIE Lab or CIE XYZ referenced to D50. Rendering intents (perceptual, relative colorimetric, saturation, absolute colorimetric) control how out-of-gamut colors are handled, and the format is built into every major OS via macOS ColorSync and Windows ICM/WCS.',
		usedFor: [
			'Print color management and proofing',
			'Display and monitor calibration',
			'Cross-device color consistency in photography and design',
			'Converting device-dependent values to a device-independent reference',
			'Embedding color characterization into images and documents'
		],
		benefitsHere: [
			'ICC support is registered as a system but coming-soon: profile-driven `nearest`/`code` lookups throw an actionable error until a profile parser and dataset are added, so the app does not fake CMM-grade conversions.',
			'Its connection space is exactly what Chromatics already exposes: the backed `c.xyz50` (D50 XYZ, the ICC PCS) and `c.lab` views, plus `c.xyz`, give you the device-independent interchange an ICC workflow centers on.',
			'Every color is OKLCH-stored and routed through culori, so PCS-style values like `c.lab`/`c.xyz50` are first-class today even before full profile parsing lands.'
		],
		relations: {
			derivedFrom: ['lab', 'xyz50', 'xyz'],
			convertsTo: ['lab', 'xyz50', 'srgb'],
			related: ['isocie']
		},
		resources: [
			{ label: 'ICC profile (Wikipedia)', url: 'https://en.wikipedia.org/wiki/ICC_profile' },
			{
				label: 'ICC Profiles Overview (color.org)',
				url: 'https://www.color.org/iccprofiles.xalter'
			},
			{ label: 'International Color Consortium', url: 'https://www.color.org' }
		]
	},
	isocie: {
		summary:
			'Joint ISO/CIE colorimetry standards — standard observers, illuminants, CIELAB, CIELUV, and CIEDE2000',
		whatItIs:
			'ISO-CIE refers to the collection of color-encoding and colorimetry standards defined jointly by the International Organization for Standardization and the International Commission on Illumination. They specify foundational models such as CIE XYZ, CIE Lab, and CIE Luv, along with the standard observers, standard illuminants, and the CIEDE2000 color-difference formula. Rather than a single implementable system, it is the body of reference specifications that other accurate color work follows.',
		usedFor: [
			'Foundational reference for all colorimetric work',
			'Industrial and scientific color measurement',
			'Defining standard observers and illuminants for conversion',
			'Specifying the CIEDE2000 difference formula for color tolerancing',
			'Device calibration and inter-model conversion in research settings'
		],
		benefitsHere: [
			'ISO-CIE is registered as a system but coming-soon: it is a standards collection rather than a code, so its `nearest`/`code` lookups throw an actionable error by design.',
			'Its specifications are already what Chromatics implements through culori: the backed `c.xyz`, `c.lab`, `c.luv`, and `c.lch` views plus deltaE methods like `deltaE2000` realize the CIE XYZ, CIELAB, CIELUV, and CIEDE2000 standards it defines.',
			'Because every color is stored in OKLCH and routed through these standards-derived spaces, working in Chromatics is effectively working within the ISO/CIE colorimetric framework.'
		],
		relations: {
			related: ['xyz', 'lab', 'luv', 'lch', 'iccprofile']
		},
		resources: [
			{ label: 'Color space (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Color_space' },
			{ label: 'CIE — International Commission on Illumination', url: 'https://cie.co.at' }
		]
	}
};
