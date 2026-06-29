/**
 * Preview primitives — the `preview.*` namespace. These don't return colors;
 * they return tagged descriptors that the Inspector renders richly (a gradient
 * bar, a contrast specimen, a 3D plot…). This turns the scheme output into a
 * live design board authored entirely in the DSL, with the editor still the
 * single source of truth.
 *
 * Each function returns `{ __preview: <type>, ...refs }` where the refs are the
 * actual ColorValues — the render components do the drawing.
 */
import { color, num, str } from '../models/util.js';
import type { DSLValue, DSLFunction, PlainObject } from '../models/index.js';

/** A rendered-preview descriptor (a plain object marked with `__preview`). */
export type PreviewValue = PlainObject & { __preview: string };

export function isPreview(v: unknown): v is PreviewValue {
	return (
		typeof v === 'object' &&
		v !== null &&
		!Array.isArray(v) &&
		typeof (v as Record<string, unknown>).__preview === 'string'
	);
}

/** Wrap a positional-args builder as a DSLFunction. */
function def(build: (a: DSLValue[]) => PlainObject): DSLFunction {
	return (...a: DSLValue[]) => build(a);
}
const colorsOf = (a: DSLValue[]) => a.map((x) => color(x));
const optStr = (v: DSLValue | undefined, d: string) => (v === undefined ? d : str(v));
const optInt = (v: DSLValue | undefined, d: number) => (v === undefined ? d : Math.round(num(v)));

export const preview: Record<string, DSLFunction> = {
	// — Relationships —
	gradient: def(([from, to, space, stops]) => ({
		__preview: 'gradient',
		from: color(from),
		to: color(to),
		space: optStr(space, 'oklab'),
		stops: optInt(stops, 7)
	})),
	ramp: def(([base, mode]) => ({
		__preview: 'ramp',
		base: color(base),
		mode: optStr(mode, 'oklch')
	})),
	harmony: def(([base, scheme]) => ({
		__preview: 'harmony',
		base: color(base),
		scheme: optStr(scheme, 'complementary')
	})),
	mix: def(([from, to, steps]) => ({
		__preview: 'mix',
		from: color(from),
		to: color(to),
		steps: optInt(steps, 5)
	})),

	// — Accessibility —
	pair: def(([fg, bg]) => ({ __preview: 'pair', fg: color(fg), bg: color(bg) })),
	cvd: def(([c]) => ({ __preview: 'cvd', color: color(c) })),
	onBackgrounds: def(([c, bgs]) => ({
		__preview: 'onBackgrounds',
		color: color(c),
		backgrounds: Array.isArray(bgs) ? bgs.map((x) => color(x)) : []
	})),

	// — Single-color analysis —
	space: def(([c, model]) => ({
		__preview: 'space',
		color: color(c),
		model: optStr(model, 'oklch')
	})),
	channels: def(([c, model]) => ({
		__preview: 'channels',
		color: color(c),
		model: optStr(model, 'oklch')
	})),
	gamut: def(([c]) => ({ __preview: 'gamut', color: color(c) })),
	print: def(([c]) => ({ __preview: 'print', color: color(c) })),
	name: def(([c]) => ({ __preview: 'name', color: color(c) })),
	temperature: def(([c]) => ({ __preview: 'temperature', color: color(c) })),

	// — Scheme & mockups —
	palette: def((a) => ({ __preview: 'palette', colors: colorsOf(a) })),
	grid: def((a) => ({ __preview: 'grid', colors: colorsOf(a) })),
	chart: def((a) => ({ __preview: 'chart', colors: colorsOf(a) })),
	ui: def(([bg, fg, primary]) => ({
		__preview: 'ui',
		bg: color(bg),
		fg: color(fg),
		primary: primary === undefined ? color(fg) : color(primary)
	})),
	brandMark: def(([c]) => ({ __preview: 'brandMark', color: color(c) }))
};

/** Names of every preview member — used for autocomplete and docs. */
export const PREVIEW_MEMBERS = Object.keys(preview);

/** Signatures + one-line docs for each member (autocomplete / highlighter / docs). */
export const PREVIEW_SIGNATURES: Record<string, { sig: string; doc: string }> = {
	gradient: { sig: '(from, to, space?, stops?)', doc: 'Gradient bar between two colors' },
	ramp: { sig: '(base, mode?)', doc: 'Tonal 50–950 ramp from one color' },
	harmony: { sig: '(base, scheme?)', doc: 'Harmony colors off a base hue' },
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
