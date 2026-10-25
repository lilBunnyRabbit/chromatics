import { test, expect, describe } from 'bun:test';
import { Cam16, HunterLab, Srgb, Srgb8, Xyy, type Color } from '@lilbunnyrabbit/chromatics';
import { parse } from '@lilbunnyrabbit/chromatics/all';
import { evaluate } from '../src/lib/dsl/evaluator';
import { MODEL_CLASSES } from '../src/lib/dsl/values';

const PROBES = ['#1a8cff', '#7ac26a', '#e49b39', '#b5a2d2'];

const shown = (c: Color) => c.to(Srgb).gamutMap().to(Srgb8).toHex();

describe('every DSL colour space round-trips through its constructor', () => {
	test('we cover a broad set of spaces', () => {
		expect(MODEL_CLASSES.length).toBeGreaterThan(60);
	});

	for (const [name] of MODEL_CLASSES) {
		test(`${name} round-trips to the source hex`, () => {
			for (const hx of PROBES) {
				const native = evaluate(`c = parse("${hx}").to(${name})`).variables.get('c')!
					.value as Color;
				const args = native.coords.join(', ');
				const rebuilt = evaluate(`c = ${name}(${args}, ${native.alpha})`);
				expect(rebuilt.errors, `${name} ${hx}`).toEqual([]);
				expect(shown(rebuilt.variables.get('c')!.value as Color), `${name} ${hx}`).toBe(hx);
			}
		});
	}
});

describe('appearance-model reference values', () => {
	test('CAM16 of pure red matches Material', () => {
		const r = parse('#ff0000').to(Cam16);
		expect(r.J).toBeCloseTo(46.45, 1);
		expect(r.C).toBeCloseTo(113.35, 1);
		expect(r.h).toBeCloseTo(27.41, 1);
	});
	test('xyY of white is the D65 chromaticity', () => {
		const w = parse('#ffffff').to(Xyy);
		expect(w.x).toBeCloseTo(0.3127, 3);
		expect(w.y).toBeCloseTo(0.329, 3);
	});
	test('Hunter Lab of white is L≈100, a≈0, b≈0', () => {
		const w = parse('#ffffff').to(HunterLab);
		expect(w.l).toBeCloseTo(100, 1);
		expect(w.a).toBeCloseTo(0, 1);
		expect(w.b).toBeCloseTo(0, 1);
	});
	test('CAM16-UCS ΔE separates near from far colours', () => {
		const r = evaluate(
			'a = parse("#1a8cff").to(Cam16Ucs)\nnear = a.deltaE(parse("#1a90ff").to(Cam16Ucs))\nfar = a.deltaE(parse("#ff0000").to(Cam16Ucs))'
		);
		expect(r.errors).toEqual([]);
		expect(r.variables.get('near')!.value as number).toBeLessThan(
			r.variables.get('far')!.value as number
		);
	});
});

describe('names that left the DSL (ADR-016 78j)', () => {
	test('coming-soon stubs, RAL and alias ids are not constructors', () => {
		for (const old of ['YJK', 'yjk', 'RAL', 'ral', 'scRGB', 'Scrgb', 'Rec601', 'Xvycc']) {
			expect(evaluate(`c = ${old}(0.5, 0.5, 0.5)`).errors, old).toHaveLength(1);
		}
	});
});
