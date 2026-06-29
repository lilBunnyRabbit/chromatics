/**
 * Family op-tables — the encyclopedia's "method altitude" expressed as data.
 * Each table is spread into a ModelDef via `inherit`, so a method exists on a
 * family of models without any class inheritance.
 */
import { ColorValue, type PlainObject, type DSLValue } from './value';
import {
	num,
	str,
	color,
	makeOklch,
	wrapHue,
	method,
	accessor,
	obj,
	optNum,
	oklchMix,
	assertSameModel,
	p
} from './util';
import {
	wcagContrast,
	wcagLuminance,
	filterDeficiencyProt,
	filterDeficiencyDeuter,
	filterDeficiencyTrit,
	filterGrayscale,
	differenceCiede2000,
	differenceCie76,
	differenceCie94,
	differenceCmc,
	differenceEuclidean,
	type CuloriColor
} from './registry';
import type { MethodDef } from './types';

type HueKind = 'hue' | 'perceptual';

/** Coerce a binary op's `other` arg and enforce the same-model rule. */
function other(self: ColorValue, o: DSLValue, op: string): ColorValue {
	const b = color(o);
	assertSameModel(self, b, op);
	return b;
}

/** Rotate hue either naively (HSL) or perceptually (OKLCH). */
function rotated(self: ColorValue, deg: number, kind: HueKind): ColorValue {
	if (kind === 'perceptual') {
		return ColorValue.from(
			makeOklch(self.channel('ok_l'), self.channel('ok_c'), wrapHue(self.channel('ok_h') + deg))
		);
	}
	const h = self.project('hsl') as unknown as Record<string, number | undefined>;
	return ColorValue.from({
		mode: 'hsl',
		h: wrapHue((h.h ?? 0) + deg),
		s: h.s ?? 0,
		l: h.l ?? 0
	} as unknown as CuloriColor);
}

const tag = (k: HueKind) => (k === 'hue' ? 'hue' : 'perceptual-cylindrical');

export function mkRotateHue(kind: HueKind): MethodDef {
	return method(
		'rotateHue',
		[p('degrees')],
		'color',
		kind === 'hue' ? 'Rotate the HSL hue (naive)' : 'Rotate the hue perceptually (OKLCH)',
		(self, [d]) => rotated(self, num(d), kind),
		tag(kind)
	);
}
export function mkComplementary(kind: HueKind): MethodDef {
	return method(
		'complementary',
		[],
		'color',
		'The opposite hue (180°)',
		(self) => rotated(self, 180, kind),
		tag(kind)
	);
}
export function mkTriadic(kind: HueKind): MethodDef {
	return method(
		'triadic',
		[],
		'colors',
		'Three evenly spaced hues',
		(self) => [self, rotated(self, 120, kind), rotated(self, 240, kind)],
		tag(kind)
	);
}
export function mkAnalogous(kind: HueKind): MethodDef {
	return method(
		'analogous',
		[p('angle', 'number', { optional: true })],
		'colors',
		'Neighbouring hues either side',
		(self, [a]) => {
			const ang = a === undefined ? 30 : num(a);
			return [rotated(self, -ang, kind), self, rotated(self, ang, kind)];
		},
		tag(kind)
	);
}

/** Naive (RGB-cylindrical) harmony — "thinking in HSL". */
export const HUE_OPS: MethodDef[] = [
	mkRotateHue('hue'),
	mkComplementary('hue'),
	mkTriadic('hue'),
	mkAnalogous('hue')
];

/** Perceptual harmony (correct hues) — "thinking in OKLCH". */
export const PERCEPTUAL_CYL_OPS: MethodDef[] = [
	mkRotateHue('perceptual'),
	mkComplementary('perceptual'),
	mkTriadic('perceptual'),
	mkAnalogous('perceptual')
];

// --- OKLCH math (formerly the universal `root` shortcuts; now scoped to oklch) ---
// "Ops live on their model": OKLCH lightness/chroma/hue manipulation lives on
// the OKLCH view, reached via c.oklch.lighten() etc. Each returns an OKLCH color.
const okL = (c: ColorValue) => c.channel('ok_l');
const okC = (c: ColorValue) => c.channel('ok_c');
const okH = (c: ColorValue) => c.channel('ok_h');

export const OKLCH_OPS: MethodDef[] = [
	method('lighten', [p('amount')], 'color', 'Increase OKLCH lightness', (self, [a]) =>
		ColorValue.from(makeOklch(okL(self) + num(a), okC(self), okH(self)))
	),
	method('darken', [p('amount')], 'color', 'Decrease OKLCH lightness', (self, [a]) =>
		ColorValue.from(makeOklch(okL(self) - num(a), okC(self), okH(self)))
	),
	method('saturate', [p('amount')], 'color', 'Increase OKLCH chroma', (self, [a]) =>
		ColorValue.from(makeOklch(okL(self), okC(self) + num(a), okH(self)))
	),
	method('desaturate', [p('amount')], 'color', 'Decrease OKLCH chroma', (self, [a]) =>
		ColorValue.from(makeOklch(okL(self), okC(self) - num(a), okH(self)))
	),
	method('rotate', [p('degrees')], 'color', 'Shift OKLCH hue', (self, [d]) =>
		ColorValue.from(makeOklch(okL(self), okC(self), wrapHue(okH(self) + num(d))))
	),
	method('invert', [], 'color', 'Flip lightness and rotate hue 180°', (self) =>
		ColorValue.from(makeOklch(1 - okL(self), okC(self), wrapHue(okH(self) + 180)))
	),
	method('complement', [], 'color', 'Rotate OKLCH hue 180°', (self) =>
		ColorValue.from(makeOklch(okL(self), okC(self), wrapHue(okH(self) + 180)))
	),
	method(
		'mix',
		[p('other', 'color'), p('ratio', 'number', { optional: true })],
		'color',
		'Blend in OKLCH (shortest-arc hue), ratio 0–1 (default 0.5). Both colors must be OKLCH.',
		(self, [o, r]) => {
			const b = color(o);
			assertSameModel(self, b, 'mix');
			return oklchMix(self, b, r === undefined ? 0.5 : num(r));
		}
	),
	method(
		'shift',
		[p('deltas', 'object')],
		'color',
		'Add deltas to OKLCH channels: { l?, c?, h? }',
		(self, [d]) => {
			const o = obj(d) as PlainObject;
			return ColorValue.from(
				makeOklch(
					okL(self) + (optNum(o, 'l') ?? 0),
					okC(self) + (optNum(o, 'c') ?? 0),
					wrapHue(okH(self) + (optNum(o, 'h') ?? 0))
				)
			);
		}
	),
	method(
		'derive',
		[p('overrides', 'object')],
		'color',
		'Replace OKLCH channels: { l?, c?, h? }',
		(self, [d]) => {
			const o = obj(d) as PlainObject;
			return ColorValue.from(
				makeOklch(
					optNum(o, 'l') ?? okL(self),
					optNum(o, 'c') ?? okC(self),
					optNum(o, 'h') ?? okH(self)
				)
			);
		}
	)
];

// --- RGB family: accessibility + CVD ---

const CVD_FILTERS: Record<string, (severity?: number) => (c: CuloriColor) => CuloriColor> = {
	protanopia: filterDeficiencyProt,
	protanomaly: filterDeficiencyProt,
	deuteranopia: filterDeficiencyDeuter,
	deuteranomaly: filterDeficiencyDeuter,
	tritanopia: filterDeficiencyTrit,
	tritanomaly: filterDeficiencyTrit
};

export const RGB_OPS: MethodDef[] = [
	method(
		'contrastWCAG',
		[p('other', 'color')],
		'number',
		'WCAG 2.1 contrast ratio (1–21)',
		(self, [o]) => wcagContrast(self.project('rgb'), other(self, o, 'contrastWCAG').project('rgb')),
		'rgb'
	),
	method(
		'meetsAA',
		[p('other', 'color'), p('large', 'number', { optional: true })],
		'boolean',
		'Passes WCAG AA (≥4.5, or ≥3 for large text)',
		(self, [o, large]) =>
			wcagContrast(self.project('rgb'), other(self, o, 'meetsAA').project('rgb')) >=
			(large ? 3 : 4.5),
		'rgb'
	),
	method(
		'meetsAAA',
		[p('other', 'color'), p('large', 'number', { optional: true })],
		'boolean',
		'Passes WCAG AAA (≥7, or ≥4.5 for large text)',
		(self, [o, large]) =>
			wcagContrast(self.project('rgb'), other(self, o, 'meetsAAA').project('rgb')) >=
			(large ? 4.5 : 7),
		'rgb'
	),
	accessor(
		'luminance',
		'number',
		'Relative luminance (WCAG)',
		(self) => wcagLuminance(self.project('rgb')),
		'rgb'
	),
	method(
		'invert',
		[],
		'color',
		'Invert the RGB channels',
		(self) => {
			const c = self.project('rgb') as unknown as Record<string, number | undefined>;
			return ColorValue.from({
				mode: 'rgb',
				r: 1 - (c.r ?? 0),
				g: 1 - (c.g ?? 0),
				b: 1 - (c.b ?? 0)
			} as unknown as CuloriColor);
		},
		'rgb'
	),
	method(
		'grayscale',
		[],
		'color',
		'Luma-preserving desaturation',
		(self) => ColorValue.from(filterGrayscale()(self.project('rgb'))),
		'rgb'
	),
	method(
		'simulateCVD',
		[p('type', 'string'), p('severity', 'number', { optional: true })],
		'color',
		'Simulate color-vision deficiency (protan/deuter/tritan)',
		(self, [t, sev]) => {
			const key = str(t).toLowerCase();
			const f = CVD_FILTERS[key];
			if (!f) throw new Error(`Unknown CVD type: ${str(t)}`);
			return ColorValue.from(f(sev === undefined ? 1 : num(sev))(self.project('rgb')));
		},
		'rgb'
	)
];

// --- Lab family: the ΔE difference formulas ---

/** Rotate hue natively in a model's own space (its characteristic move). */
export function mkRotateHueNative(mode: string): MethodDef {
	return method(
		'rotateHue',
		[p('degrees')],
		'color',
		'Rotate hue within this model space',
		(self, [d]) => {
			const c = self.project(mode) as unknown as Record<string, number | undefined>;
			return ColorValue.from({ ...c, h: wrapHue((c.h ?? 0) + num(d)) } as unknown as CuloriColor);
		}
	);
}

/** A model's native Euclidean ΔE (e.g. ΔEz for JzAzBz, ΔE99 for DIN99o). */
export function mkDeltaEuclidean(name: string, mode: string, doc: string): MethodDef {
	return method(name, [p('other', 'color')], 'number', doc, (self, [o]) =>
		differenceEuclidean(mode as Parameters<typeof differenceEuclidean>[0])(
			self.project(mode),
			other(self, o, name).project(mode)
		)
	);
}

export const LAB_OPS: MethodDef[] = [
	method(
		'deltaE2000',
		[p('other', 'color')],
		'number',
		'CIEDE2000 color difference',
		(self, [o]) =>
			differenceCiede2000()(self.project('lab'), other(self, o, 'deltaE2000').project('lab')),
		'lab'
	),
	method(
		'deltaE76',
		[p('other', 'color')],
		'number',
		'CIE76 (Euclidean Lab) color difference',
		(self, [o]) =>
			differenceCie76()(self.project('lab'), other(self, o, 'deltaE76').project('lab')),
		'lab'
	),
	method(
		'deltaE94',
		[p('other', 'color')],
		'number',
		'CIE94 color difference',
		(self, [o]) =>
			differenceCie94()(self.project('lab'), other(self, o, 'deltaE94').project('lab')),
		'lab'
	),
	method(
		'deltaECMC',
		[p('other', 'color')],
		'number',
		'CMC l:c color difference',
		(self, [o]) => differenceCmc()(self.project('lab'), other(self, o, 'deltaECMC').project('lab')),
		'lab'
	),
	method(
		'isPerceptiblyDifferent',
		[p('other', 'color'), p('threshold', 'number', { optional: true })],
		'boolean',
		'ΔE2000 above a just-noticeable-difference threshold',
		(self, [o, t]) =>
			differenceCiede2000()(
				self.project('lab'),
				other(self, o, 'isPerceptiblyDifferent').project('lab')
			) > (t === undefined ? 2.3 : num(t)),
		'lab'
	)
];
