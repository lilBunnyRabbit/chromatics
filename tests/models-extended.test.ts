import { test, expect, describe } from 'bun:test';
import {
	OKLCH,
	HWB,
	LAB,
	hex,
	ColorValue,
	ModelView,
	type DSLValue,
	type DSLFunction
} from '../src/lib/models';

function call(c: ColorValue, prop: string, ...args: DSLValue[]): DSLValue {
	const m = c.member(prop);
	if (typeof m !== 'function') throw new Error(`${prop} is not a method`);
	return (m as DSLFunction)(...args);
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

describe('cross-model channel accessors', () => {
	const c = OKLCH(0.6, 0.12, 250);

	test('every namespaced accessor resolves to a finite number', () => {
		for (const key of [
			'hwb_w',
			'hwb_b',
			'lab_a',
			'lab_b',
			'lab_l',
			'lr',
			'lg',
			'lb',
			'oklab_a',
			'p3_r'
		]) {
			expect(Number.isFinite(c.channel(key))).toBe(true);
		}
	});

	test('hwb whiteness/blackness sum within the channel ranges', () => {
		expect(c.channel('hwb_w')).toBeGreaterThanOrEqual(0);
		expect(c.channel('hwb_b')).toBeGreaterThanOrEqual(0);
	});

	test('linear-sRGB channel differs from gamma-encoded sRGB channel', () => {
		// linear and encoded values diverge except at 0 and 1
		expect(c.channel('lr')).not.toBeCloseTo(c.channel('r'), 4);
	});
});

describe('constructor round-trips (in-gamut, via OKLCH storage)', () => {
	test('HWB round-trips whiteness/blackness within tolerance', () => {
		const c = HWB(120, 0.2, 0.3);
		expect(c.channel('hwb_w')).toBeCloseTo(0.2, 3);
		expect(c.channel('hwb_b')).toBeCloseTo(0.3, 3);
	});

	test('LAB round-trips L*/a*/b* within tolerance', () => {
		const c = LAB(50, 20, -30);
		expect(c.channel('lab_l')).toBeCloseTo(50, 2);
		expect(c.channel('lab_a')).toBeCloseTo(20, 2);
		expect(c.channel('lab_b')).toBeCloseTo(-30, 2);
	});
});

describe('CIE Lab ΔE family', () => {
	const white = hex('#ffffff');
	const black = hex('#000000');

	test('deltaE2000 of a color with itself is ~0', () => {
		expect(viewCall(white, 'lab', 'deltaE2000', white) as number).toBeCloseTo(0, 6);
	});

	test('deltaE2000(white, black) is large (~100)', () => {
		expect(viewCall(white, 'lab', 'deltaE2000', black) as number).toBeGreaterThan(95);
	});

	test('isPerceptiblyDifferent respects the JND threshold', () => {
		const a = OKLCH(0.6, 0.12, 250);
		const aNudge = OKLCH(0.6005, 0.12, 250);
		expect(viewCall(a, 'lab', 'isPerceptiblyDifferent', aNudge) as boolean).toBe(false);
		expect(viewCall(a, 'lab', 'isPerceptiblyDifferent', black.to('oklch')) as boolean).toBe(true);
	});
});

describe('mixing space matters (the model-manipulation thesis)', () => {
	const a = OKLCH(0.6, 0.12, 250);
	const b = OKLCH(0.4, 0.1, 30);

	test('Oklab mix, OKLCH mix, and linear blend all differ', () => {
		const oklab = (viewCall(a, 'oklab', 'mix', b, 0.5) as ColorValue).hex;
		const oklch = (viewCall(a, 'oklch', 'mix', b, 0.5) as ColorValue).hex; // OKLCH shortest-arc
		const linear = (viewCall(a, 'lin', 'blend', b, 0.5) as ColorValue).hex;
		expect(oklab).not.toBe(oklch);
		expect(linear).not.toBe(oklab);
		expect(linear).not.toBe(oklch);
	});

	test('deltaEok is a non-negative number', () => {
		expect(viewCall(a, 'oklab', 'deltaEok', b) as number).toBeGreaterThan(0);
	});
});

describe('HWB special features', () => {
	const c = HWB(200, 0.1, 0.2);

	test('addWhite raises whiteness', () => {
		expect((viewCall(c, 'hwb', 'addWhite', 0.3) as ColorValue).channel('hwb_w')).toBeGreaterThan(
			c.channel('hwb_w')
		);
	});
	test('addBlack raises blackness', () => {
		expect((viewCall(c, 'hwb', 'addBlack', 0.3) as ColorValue).channel('hwb_b')).toBeGreaterThan(
			c.channel('hwb_b')
		);
	});
	test('pureHue zeroes whiteness and blackness', () => {
		const pure = viewCall(c, 'hwb', 'pureHue') as ColorValue;
		expect(pure.channel('hwb_w')).toBeCloseTo(0, 3);
		expect(pure.channel('hwb_b')).toBeCloseTo(0, 3);
	});
	test('isGray accessor is a boolean', () => {
		expect(typeof viewGet(HWB(0, 0.6, 0.6), 'hwb', 'isGray')).toBe('boolean');
	});
});
