import { test, expect, describe } from 'bun:test';
import { Color, Oklch, Srgb } from '@lilbunnyrabbit/chromatics';
import { evaluate } from '../src/lib/dsl/evaluator';
import { ensureContrast, wcagTargetRatio } from '../src/lib/color/contrast-guard';

// The guarantee is on what renders: both sides gamut-mapped, as the studio displays them.
const ratio = (fg: Color, bg: Color) => fg.to(Srgb).gamutMap().contrast(bg.to(Srgb).gamutMap());

function run(src: string) {
	return evaluate(src);
}
function colorOf(src: string, name: string): Color {
	const r = run(src);
	const v = r.variables.get(name);
	if (!v) throw new Error(`no var ${name}; errors: ${JSON.stringify(r.errors)}`);
	return v.value as Color;
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

describe('ensureContrast (engine)', () => {
	test('an already-legible color comes back unchanged, as a copy', () => {
		const black = new Oklch(0, 0, 0);
		const white = new Oklch(1, 0, 0);
		const out = ensureContrast(black, white, wcagTargetRatio('AAA'));
		expect(out).not.toBe(black);
		expect(out).toBeInstanceOf(Oklch);
		expect(out.coords).toEqual(black.coords);
	});

	test('never mutates its arguments (frozen inputs are fine)', () => {
		const bg = new Oklch(0.62, 0.05, 250);
		const fg = new Oklch(0.58, 0.05, 250);
		Object.freeze(bg);
		Object.freeze(fg);
		expect(() => ensureContrast(fg, bg, 4.5)).not.toThrow();
		expect(fg.coords).toEqual([0.58, 0.05, 250]);
	});

	test('a failing pair is nudged to meet the target', () => {
		const bg = new Oklch(0.62, 0.05, 250);
		const fg = new Oklch(0.58, 0.05, 250);
		expect(ratio(fg, bg)).toBeLessThan(2);
		const aa = ensureContrast(fg, bg, 4.5);
		expect(ratio(aa, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('hue is preserved when only lightness moves', () => {
		const bg = new Oklch(0.62, 0.05, 250);
		const fg = new Oklch(0.58, 0.05, 250);
		const out = ensureContrast(fg, bg, 4.5);
		expect(out.to(Oklch).h).toBeCloseTo(250, 0);
	});

	test('AAA reaches a higher ratio than AA for the same pair', () => {
		const bg = new Oklch(0.95, 0.02, 250);
		const fg = new Oklch(0.85, 0.05, 250);
		const aa = ensureContrast(fg, bg, 4.5);
		const aaa = ensureContrast(fg, bg, 7);
		expect(ratio(aa, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
		expect(ratio(aaa, bg)).toBeGreaterThanOrEqual(7 - 1e-6);
	});

	test('an unreachable target falls back to the most legible achromatic extreme', () => {
		// Against a mid-tone background even pure black or white can't clear AAA (7:1).
		const bg = new Oklch(0.6, 0.02, 250);
		const fg = new Oklch(0.58, 0.08, 250);
		const out = ensureContrast(fg, bg, 7);
		expect(out).toBeInstanceOf(Color);
		expect(ratio(out, bg)).toBeLessThan(7);
		expect(ratio(out, bg)).toBeGreaterThan(ratio(fg, bg));
		expect(out.to(Oklch).c).toBeLessThan(0.02);
	});

	test('guarantee holds on the DISPLAYED form for an out-of-gamut fg', () => {
		// Raw luminance of this fg clears AA, but its gamut-mapped form doesn't: it must still move.
		const bg = new Oklch(0.45, 0, 0);
		const fg = new Oklch(0.8, 0.5, 140);
		expect(fg.to(Srgb).inGamut()).toBe(false);
		expect(ratio(fg, bg)).toBeLessThan(4.5);
		const out = ensureContrast(fg, bg, 4.5);
		expect(ratio(out, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});
});

describe('ensureContrast (DSL builtin)', () => {
	test('exposed as a builtin and returns a usable color', () => {
		const r = run(
			'bg = Oklch(0.62, 0.05, 250)\nfg = ensureContrast(Oklch(0.58, 0.05, 250), bg, "AA")'
		);
		expect(r.errors).toEqual([]);
		const fg = r.variables.get('fg')!.value as Color;
		const bg = r.variables.get('bg')!.value as Color;
		expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('default target is AA when omitted', () => {
		const src = 'bg = Oklch(0.62, 0.05, 250)\nfg = ensureContrast(Oklch(0.58, 0.05, 250), bg)';
		expect(ratio(colorOf(src, 'fg'), colorOf(src, 'bg'))).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('a numeric ratio target works', () => {
		const r = run('bg = Oklch(0.95, 0.02, 250)\nfg = ensureContrast(Oklch(0.9, 0.04, 250), bg, 6)');
		expect(r.errors).toEqual([]);
		const fg = r.variables.get('fg')!.value as Color;
		const bg = r.variables.get('bg')!.value as Color;
		expect(ratio(fg, bg)).toBeGreaterThanOrEqual(6 - 1e-6);
	});

	test('cross-model operands compose (bg is a read-only reference)', () => {
		const r = run('fg = ensureContrast(parse("#888"), Oklch(1, 0, 0), "AA")');
		expect(r.errors).toEqual([]);
		const fg = r.variables.get('fg')!.value as Color;
		expect(ratio(fg, new Oklch(1, 0, 0))).toBeGreaterThanOrEqual(4.5 - 1e-6);
	});

	test('the seed variable is left untouched', () => {
		const r = run(
			'seed = Oklch(0.58, 0.05, 250)\nbg = Oklch(0.62, 0.05, 250)\nfg = ensureContrast(seed, bg)'
		);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('seed')!.value as Oklch).l).toBe(0.58);
	});

	test('an unknown target string surfaces a per-statement error', () => {
		const r = run(
			'bg = Oklch(0.9, 0.02, 200)\nc = ensureContrast(Oklch(0.8, 0.05, 200), bg, "nope")'
		);
		expect(r.errors.length).toBeGreaterThan(0);
		expect(r.variables.has('c')).toBe(false);
	});

	test('re-solves reactively: the same definition stays AA as the seed moves', () => {
		const ratioFor = (seedL: number) => {
			const src = `seed = Oklch(${seedL}, 0.05, 250)\nbg = seed\nfg = ensureContrast(Oklch(0.6, 0.03, 250), bg, "AA")`;
			const r = run(src);
			expect(r.errors).toEqual([]);
			return ratio(r.variables.get('fg')!.value as Color, r.variables.get('bg')!.value as Color);
		};
		for (const seedL of [0.25, 0.5, 0.75, 0.95]) {
			expect(ratioFor(seedL)).toBeGreaterThanOrEqual(4.5 - 1e-6);
		}
	});
});
