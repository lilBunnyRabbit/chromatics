/**
 * Editor docs for the DSL's namespaces (autocomplete, highlight, hover, the Docs overlay). The members
 * themselves live in `@lilbunnyrabbit/chromatics-dsl`; `tests/manifest.test.ts` checks these keys against them.
 */

export interface Signature {
	sig: string;
	doc: string;
}

/** Signatures + one-line docs for each member (autocomplete / highlighter / docs). */
export const PREVIEW_SIGNATURES: Record<string, Signature> = {
	gradient: {
		sig: '(from, to, space?, stops?)',
		doc: 'Gradient bar — space or { space, hue, stops } (hue: shorter/longer/increasing/decreasing)'
	},
	ramp: {
		sig: '(base, model?)',
		doc: 'Tonal 50–950 ramp (model: oklch/lab/hct/okhsl/hsluv/hsl/hsv)'
	},
	harmony: {
		sig: '(base, scheme?, model?)',
		doc: 'Harmony off a base hue (model: which hue wheel to rotate on)'
	},
	mix: { sig: '(from, to, steps?)', doc: 'Discrete blend steps' },
	pair: { sig: '(fg, bg)', doc: 'Type specimen + WCAG & APCA contrast' },
	cvd: { sig: '(color)', doc: 'Color under color-vision deficiencies' },
	onBackgrounds: { sig: '(color, [bgs])', doc: 'Legibility across several backgrounds' },
	space: { sig: '(color, model?)', doc: '3D position of a color in a model' },
	channels: { sig: '(color, model?)', doc: 'Per-channel readout with ranges' },
	gamut: { sig: '(color)', doc: 'sRGB / Display-P3 reach' },
	print: { sig: '(color)', doc: 'CMYK separation & total ink' },
	name: { sig: '(color)', doc: 'Nearest CSS color name' },
	temperature: { sig: '(color)', doc: 'Hue-based warm/cool indicator' },
	palette: { sig: '(...colors)', doc: 'Palette strip' },
	grid: { sig: '(...colors)', doc: 'Contrast matrix of a color set' },
	chart: { sig: '(...colors)', doc: 'Categorical chart preview' },
	ui: { sig: '(bg, fg, primary?)', doc: 'Themed mini UI card' },
	brandMark: { sig: '(color)', doc: 'Logo lockup across backgrounds' }
};

const SCALE_SIGNATURES: Record<string, Signature> = {
	text: { sig: '(base?, ratio?)', doc: 'Modular type scale in px — xs…4xl' },
	space: { sig: '(base?)', doc: 'Linear spacing scale in px' },
	radius: { sig: '(base?)', doc: 'Radius scale from a single base' },
	shadow: { sig: '(tint?)', doc: 'Elevation scale, optionally color-tinted' }
};

export const TOKENS_SIGNATURES: Record<string, Signature> = {
	...SCALE_SIGNATURES,
	token: { sig: '(family, map, unit?)', doc: 'Arbitrary token group (font, border, …)' }
};

export const TOKENS_DOC = 'tokens.* — design tokens: text, space, radius, shadow, token(…)';

export const COMPONENT_SIGNATURES: Record<string, Signature> = {
	button: {
		sig: '({ variants, sizes, states })',
		doc: 'Button matrix — variants × sizes × states'
	},
	card: { sig: '({ bg, fg, radius, pad, … })', doc: 'Surface card spec' },
	type: { sig: '([{ text, weight, sample }])', doc: 'Type specimen ramp' }
};

export const THEME_DOC =
	'theme({ bg, fg, primary, surface, primaryFg, … }) — map named colors to theme roles';

export const ROLES_DOC =
	'roles { primary = brand, bg = surface, … } — bind theme roles to your named colors';

/** Namespace members for the manifest (autocomplete + highlight + hover). */
export const THEME_SIGNATURES: Record<string, Signature> = {
	light: {
		sig: 'theme.light({ bg, fg, … })',
		doc: 'Role mapping for light mode (same as the bare theme()).'
	},
	dark: {
		sig: 'theme.dark({ bg, fg, … })',
		doc: 'Re-point roles for dark mode onto already-named colors. Assign it (dark = theme.dark({…})).'
	}
};
