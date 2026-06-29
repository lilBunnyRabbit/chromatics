import { test, expect, describe } from 'bun:test';
import {
	OKLCH,
	HSL,
	RGB,
	hex,
	ColorValue,
	ModelView,
	type DSLValue,
	type DSLFunction
} from '../src/lib/models';
import { Color } from '../src/lib/dsl/color';

// --- helpers that simulate the evaluator's member dispatch ---
function call(c: ColorValue, prop: string, ...args: DSLValue[]): DSLValue {
	const m = c.member(prop);
	if (typeof m !== 'function') throw new Error(`${prop} is not a method`);
	return (m as DSLFunction)(...args);
}
function get(c: ColorValue, prop: string): DSLValue {
	const m = c.member(prop);
	if (m === undefined) throw new Error(`${prop} is undefined`);
	return m;
}
function viewCall(c: ColorValue, view: string, prop: string, ...args: DSLValue[]): DSLValue {
	const v = c.member(view) as ModelView;
	const m = v.member(prop);
	if (typeof m !== 'function') throw new Error(`${view}.${prop} is not a method`);
	return (m as DSLFunction)(...args);
}
function viewGet(c: ColorValue, view: string, prop: string): DSLValue {
	const v = c.member(view) as ModelView;
	const m = v.member(prop);
	if (m === undefined) throw new Error(`${view}.${prop} is undefined`);
	return m;
}

const seeds: Array<[number, number, number]> = [
	[0.6, 0.12, 250],
	[0.3, 0.05, 30],
	[0.85, 0.2, 140],
	[0.5, 0.0, 0] // achromatic edge
];

describe('ColorValue ≡ legacy Color (parity)', () => {
	for (const [l, c, h] of seeds) {
		const legacy = Color.OKLCH(l, c, h);
		const cv = OKLCH(l, c, h);

		test(`channels oklch(${l}, ${c}, ${h})`, () => {
			expect(cv.channel('ok_l')).toBeCloseTo(legacy.ok_l, 10);
			expect(cv.channel('ok_c')).toBeCloseTo(legacy.ok_c, 10);
			expect(cv.channel('ok_h')).toBeCloseTo(legacy.ok_h, 8);
			expect(cv.channel('h')).toBeCloseTo(legacy.h, 6);
			expect(cv.channel('s')).toBeCloseTo(legacy.s, 6);
			expect(cv.channel('l')).toBeCloseTo(legacy.l, 6);
			expect(cv.channel('r')).toBeCloseTo(legacy.r, 8);
			expect(cv.channel('g')).toBeCloseTo(legacy.g, 8);
			expect(cv.channel('b')).toBeCloseTo(legacy.b, 8);
		});

		test(`hex + gamut oklch(${l}, ${c}, ${h})`, () => {
			expect(cv.hex).toBe(legacy.hex);
			expect(get(cv, 'hex')).toBe(legacy.hex);
			expect(cv.inGamut).toBe(legacy.inGamut);
			expect(cv.inP3).toBe(legacy.inP3);
		});

		// OKLCH math now lives on the .oklch view (demoted from the universal root).
		test(`flat ops oklch(${l}, ${c}, ${h})`, () => {
			expect((viewCall(cv, 'oklch', 'lighten', 0.1) as ColorValue).hex).toBe(
				legacy.lighten(0.1).hex
			);
			expect((viewCall(cv, 'oklch', 'darken', 0.1) as ColorValue).hex).toBe(legacy.darken(0.1).hex);
			expect((viewCall(cv, 'oklch', 'saturate', 0.05) as ColorValue).hex).toBe(
				legacy.saturate(0.05).hex
			);
			expect((viewCall(cv, 'oklch', 'desaturate', 0.05) as ColorValue).hex).toBe(
				legacy.desaturate(0.05).hex
			);
			expect((viewCall(cv, 'oklch', 'rotate', 150) as ColorValue).hex).toBe(legacy.rotate(150).hex);
			expect((viewCall(cv, 'oklch', 'invert') as ColorValue).hex).toBe(legacy.invert().hex);
			expect((viewCall(cv, 'oklch', 'complement') as ColorValue).hex).toBe(legacy.complement().hex);
			expect((viewCall(cv, 'oklch', 'shift', { l: 0.1, c: 0.02, h: 20 }) as ColorValue).hex).toBe(
				legacy.shift({ l: 0.1, c: 0.02, h: 20 }).hex
			);
			expect((viewCall(cv, 'oklch', 'derive', { l: 0.5 }) as ColorValue).hex).toBe(
				legacy.derive({ l: 0.5 }).hex
			);
			expect((get(cv, 'gamutMapped') as ColorValue).hex).toBe(legacy.gamutMapped.hex);
		});
	}

	test('mix parity (shortest-arc OKLCH)', () => {
		const a = Color.OKLCH(0.6, 0.12, 250);
		const b = Color.OKLCH(0.4, 0.1, 30);
		const A = OKLCH(0.6, 0.12, 250);
		const B = OKLCH(0.4, 0.1, 30);
		expect((viewCall(A, 'oklch', 'mix', B, 0.3) as ColorValue).hex).toBe(a.mix(b, 0.3).hex);
		expect((viewCall(A, 'oklch', 'mix', B) as ColorValue).hex).toBe(a.mix(b).hex);
	});

	test('contrast parity (now via srgb.contrastWCAG)', () => {
		const a = Color.OKLCH(0.2, 0.02, 250);
		const b = Color.OKLCH(0.9, 0.03, 250);
		expect(
			viewCall(OKLCH(0.2, 0.02, 250), 'srgb', 'contrastWCAG', OKLCH(0.9, 0.03, 250)) as number
		).toBeCloseTo(a.contrast(b), 10);
	});

	test('HSL / RGB / hex constructors match legacy', () => {
		expect(HSL(280, 0.6, 0.5).hex).toBe(Color.HSL(280, 0.6, 0.5).hex);
		expect(RGB(0.2, 0.4, 0.8).hex).toBe(Color.RGB(0.2, 0.4, 0.8).hex);
		expect(hex('#6c5ce7').hex).toBe(Color.hex('#6c5ce7').hex);
	});
});

describe('view methods (the special features)', () => {
	test('oklch.atLightness / gamutMap / maxChroma', () => {
		const c = OKLCH(0.6, 0.3, 30); // high chroma → likely out of sRGB gamut
		expect((viewCall(c, 'oklch', 'atLightness', 0.2) as ColorValue).channel('ok_l')).toBeCloseTo(
			0.2,
			10
		);
		const mapped = viewCall(c, 'oklch', 'gamutMap') as ColorValue;
		expect(mapped.inGamut).toBe(true);
		const mc = viewCall(c, 'oklch', 'maxChroma') as number;
		expect(mc).toBeGreaterThan(0);
		expect(mc).toBeLessThanOrEqual(0.5);
	});

	test('hsl.rotateHue (naive) differs from oklch.rotateHue (perceptual)', () => {
		const c = OKLCH(0.6, 0.15, 30);
		const hslRot = viewCall(c, 'hsl', 'rotateHue', 60) as ColorValue;
		const okRot = viewCall(c, 'oklch', 'rotateHue', 60) as ColorValue;
		expect(hslRot.hex).not.toBe(okRot.hex);
	});

	test('hsl.tint/shade/tone move toward white/black/gray', () => {
		const c = HSL(200, 0.6, 0.5);
		expect((viewCall(c, 'hsl', 'tint', 0.5) as ColorValue).channel('l')).toBeGreaterThan(
			c.channel('l')
		);
		expect((viewCall(c, 'hsl', 'shade', 0.5) as ColorValue).channel('l')).toBeLessThan(
			c.channel('l')
		);
		expect((viewCall(c, 'hsl', 'tone', 0.5) as ColorValue).channel('s')).toBeLessThan(
			c.channel('s')
		);
	});

	test('oklch.triadic returns three ColorValues (array method)', () => {
		const arr = viewCall(OKLCH(0.6, 0.12, 30), 'oklch', 'triadic') as ColorValue[];
		expect(Array.isArray(arr)).toBe(true);
		expect(arr.length).toBe(3);
		expect(arr[0]).toBeInstanceOf(ColorValue);
	});

	test('srgb.contrastWCAG matches WCAG contrast', () => {
		const a = OKLCH(0.2, 0.02, 250);
		const b = OKLCH(0.9, 0.03, 250);
		expect(viewCall(a, 'srgb', 'contrastWCAG', b) as number).toBeCloseTo(
			Color.OKLCH(0.2, 0.02, 250).contrast(Color.OKLCH(0.9, 0.03, 250)),
			6
		);
	});

	test('srgb.luminance / invert / simulateCVD', () => {
		const c = RGB(0.8, 0.2, 0.2);
		expect(viewGet(c, 'srgb', 'luminance') as number).toBeGreaterThan(0);
		expect(viewCall(c, 'srgb', 'invert') as ColorValue).toBeInstanceOf(ColorValue);
		const cvd = viewCall(c, 'srgb', 'simulateCVD', 'deuteranopia') as ColorValue;
		expect(cvd).toBeInstanceOf(ColorValue);
		expect(cvd.hex).not.toBe(c.hex);
	});

	test('cross-model view re-entry: a view exposes sibling views', () => {
		const okView = OKLCH(0.6, 0.12, 30).member('oklch') as ModelView;
		expect(okView.member('srgb')).toBeInstanceOf(ModelView);
	});

	test('unknown member resolves to undefined (evaluator will throw)', () => {
		expect(OKLCH(0.6, 0.12, 30).member('definitelyNotAThing')).toBeUndefined();
	});
});
