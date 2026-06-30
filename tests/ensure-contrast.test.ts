import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { ColorValue, OKLCH, ensureContrastValue, wcagTargetRatio } from '../src/lib/models';
import { contrastRatio } from '../src/lib/analysis/contrast';

function run(src: string) {
	return evaluate(src);
}
function colorOf(src: string, name: string): ColorValue {
	const r = run(src);
	const v = r.variables.get(name);
	if (!v) throw new Error(`no var ${name}; errors: ${JSON.stringify(r.errors)}`);
	return v.value as ColorValue;
}

describe('wcagTargetRatio', () => {
	test('preset strings map to ratios (case / space insensitive)', () => {
		expect(wcagTargetRatio('AA')).toBe(4.5);
		expect(wcagTargetRatio('AAA')).toBe(7);
		expect(wcagTargetRatio('aa-large')).toBe(3);
		expect(wcagTargetRatio('AAA large')).toBe(4.5);
	});
	test('raw ratios pass through within 1–21', () => {
		expect(wcagTargetRatio(4.5)).toBe(4.5);
		expect(wcagTargetRatio(21)).toBe(21);
	});
	test('out-of-range and unknown targets throw', () => {
		expect(() => wcagTargetRatio(0.5)).toThrow();
		expect(() => wcagTargetRatio(99)).toThrow();
		expect(() => wcagTargetRatio('bogus')).toThrow();
	});
});

describe('ensureContrastValue (engine)', () => {
	test('an already-legible color is returned untouched', () => {
		const black = OKLCH(0, 0, 0);
		const white = OKLCH(1, 0, 0);
		const out = ensureContrastValue(black, white, wcagTargetRatio('AAA'));
		expect(out).toBe(black); // same instance — no work done
	});

	test('a failing pair is nudged to meet the target', () => {
		const bg = OKLCH(0.62, 0.05, 250);
		const fg = OKLCH(0.58, 0.05, 250); // ~1.1:1 — illegible
		expect(contrastRatio(fg, bg)).toBeLessThan(2);
		const aa = ensureContrastValue(fg, bg, 4.5);
		expect(contrastRatio(aa, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('hue is preserved when only lightness moves', () => {
		const bg = OKLCH(0.62, 0.05, 250);
		const fg = OKLCH(0.58, 0.05, 250);
		const out = ensureContrastValue(fg, bg, 4.5);
		expect(out.channel('ok_h')).toBeCloseTo(250, 0);
	});

	test('AAA reaches a higher ratio than AA for the same pair', () => {
		const bg = OKLCH(0.95, 0.02, 250);
		const fg = OKLCH(0.85, 0.05, 250);
		const aa = ensureContrastValue(fg, bg, 4.5);
		const aaa = ensureContrastValue(fg, bg, 7);
		expect(contrastRatio(aa, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
		expect(contrastRatio(aaa, bg)).toBeGreaterThanOrEqual(7 - 1e-6);
	});

	test('an unreachable target falls back to the most legible achromatic extreme', () => {
		// vs a mid-tone background even pure black/white cannot clear AAA (7:1)
		const bg = OKLCH(0.6, 0.02, 250);
		const fg = OKLCH(0.58, 0.08, 250);
		const out = ensureContrastValue(fg, bg, 7);
		expect(out).toBeInstanceOf(ColorValue); // best-effort, never throws
		expect(contrastRatio(out, bg)).toBeLessThan(7); // honestly can't reach it
		expect(contrastRatio(out, bg)).toBeGreaterThan(contrastRatio(fg, bg)); // but improved
		expect(out.channel('ok_c')).toBeLessThan(0.02); // collapsed to near-grey extreme
	});

	test('guarantee holds on the DISPLAYED form for an out-of-gamut fg', () => {
		// A vivid OKLCH/P3-style fg whose RAW luminance clears AA, but whose
		// gamut-mapped (rendered) form does not — must still be adjusted.
		const bg = OKLCH(0.45, 0, 0);
		const fg = OKLCH(0.8, 0.5, 140); // out of sRGB
		expect(fg.inGamut).toBe(false);
		expect(contrastRatio(fg.gamutMapped, bg)).toBeLessThan(4.5); // displayed fg fails
		const out = ensureContrastValue(fg, bg, 4.5);
		// the guarantee is measured on what actually renders:
		expect(contrastRatio(out.gamutMapped, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});
});

describe('ensureContrast (DSL builtin)', () => {
	test('exposed as a builtin and returns a usable color', () => {
		const r = run(
			'bg = OKLCH(0.62, 0.05, 250)\nfg = ensureContrast(OKLCH(0.58, 0.05, 250), bg, "AA")'
		);
		expect(r.errors).toEqual([]);
		const fg = r.variables.get('fg')!.value as ColorValue;
		const bg = r.variables.get('bg')!.value as ColorValue;
		expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('default target is AA when omitted', () => {
		const fg = colorOf(
			'bg = OKLCH(0.62, 0.05, 250)\nfg = ensureContrast(OKLCH(0.58, 0.05, 250), bg)',
			'fg'
		);
		const bg = colorOf(
			'bg = OKLCH(0.62, 0.05, 250)\nfg = ensureContrast(OKLCH(0.58, 0.05, 250), bg)',
			'bg'
		);
		expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('a numeric ratio target works', () => {
		const r = run('bg = OKLCH(0.95, 0.02, 250)\nfg = ensureContrast(OKLCH(0.9, 0.04, 250), bg, 6)');
		expect(r.errors).toEqual([]);
		const fg = r.variables.get('fg')!.value as ColorValue;
		const bg = r.variables.get('bg')!.value as ColorValue;
		expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(6 - 1e-6);
	});

	test('cross-model operands compose (bg is a read-only reference)', () => {
		const r = run('fg = ensureContrast(hex("#888"), hex("#ffffff"), "AA")');
		expect(r.errors).toEqual([]);
		const fg = r.variables.get('fg')!.value as ColorValue;
		const white = OKLCH(1, 0, 0);
		expect(contrastRatio(fg, white)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('an unknown target string surfaces a per-statement error', () => {
		const r = run(
			'bg = OKLCH(0.9, 0.02, 200)\nc = ensureContrast(OKLCH(0.8, 0.05, 200), bg, "nope")'
		);
		expect(r.errors.length).toBeGreaterThan(0);
		expect(r.variables.has('c')).toBe(false);
	});

	test('re-solves reactively: the same definition stays AA as the seed moves', () => {
		// fg is DEFINED relative to bg; changing the seed re-evaluates and re-solves.
		const ratioFor = (seedL: number) => {
			const src =
				`seed = OKLCH(${seedL}, 0.05, 250)\n` +
				`bg = seed\n` +
				`fg = ensureContrast(OKLCH(0.6, 0.03, 250), bg, "AA")`;
			const r = run(src);
			expect(r.errors).toEqual([]);
			const fg = r.variables.get('fg')!.value as ColorValue;
			const bg = r.variables.get('bg')!.value as ColorValue;
			return contrastRatio(fg, bg);
		};
		for (const seedL of [0.25, 0.5, 0.75, 0.95]) {
			expect(ratioFor(seedL)).toBeGreaterThanOrEqual(4.5 - 1e-6);
		}
	});
});
