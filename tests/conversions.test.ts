import { test, expect, describe } from 'bun:test';
import { ColorValue } from '../src/lib/models/value';
import { resolveConversion, toMode } from '../src/lib/models/registry';
import { evaluate } from '../src/lib/dsl/evaluator';
import '../src/lib/models/defs';

const cv = (mode: string, o: Record<string, number>) => ColorValue.from({ mode, ...o } as never);

describe('native storage + model tag', () => {
	test('a color is stored in its own model (HSL stays HSL)', () => {
		const c = cv('hsl', { h: 210, s: 0.5, l: 0.4 });
		expect(c.model).toBe('hsl');
		expect(c.channel('h')).toBeCloseTo(210, 6);
		expect(c.channel('s')).toBeCloseTo(0.5, 6);
		expect(c.channel('l')).toBeCloseTo(0.4, 6);
	});

	test('achromatic colors keep their authored hue (lost under OKLCH-canonical storage)', () => {
		const grey = cv('hsl', { h: 270, s: 0, l: 0.5 });
		expect(grey.channel('h')).toBeCloseTo(270, 6);
	});

	test('to() is identity for the same model, a new tagged color otherwise', () => {
		const c = cv('hsl', { h: 120, s: 0.5, l: 0.5 });
		expect(c.to('hsl')).toBe(c);
		const ok = c.to('oklch');
		expect(ok).not.toBe(c);
		expect(ok.model).toBe('oklch');
	});
});

describe('conversion graph (direct edge → BFS → culori fallback)', () => {
	test('direct hue edge matches culori for chromatic colors', () => {
		const hsl = { mode: 'hsl', h: 200, s: 0.6, l: 0.4 } as never;
		const direct = ColorValue.from(hsl).project('hsv') as unknown as Record<string, number>;
		const viaRgb = toMode('hsv')(toMode('rgb')(hsl)) as unknown as Record<string, number>;
		expect(direct.h).toBeCloseTo(viaRgb.h, 4);
		expect(direct.s).toBeCloseTo(viaRgb.s, 4);
		expect(direct.v).toBeCloseTo(viaRgb.v, 4);
	});

	test('BFS composes hsl→hwb via hsv and preserves grey hue', () => {
		const hwb = cv('hsl', { h: 270, s: 0, l: 0.5 }).project('hwb') as unknown as Record<
			string,
			number
		>;
		expect(hwb.h).toBeCloseTo(270, 4); // an RGB round-trip would drop this
		expect(hwb.w + hwb.b).toBeCloseTo(1, 4);
	});

	test('resolveConversion returns identity for same mode and a fn otherwise', () => {
		const c = { mode: 'hsl', h: 10, s: 0.5, l: 0.5 } as never;
		expect(resolveConversion('hsl', 'hsl')(c)).toBe(c);
		expect((resolveConversion('hsl', 'oklch')(c) as { mode: string }).mode).toBe('oklch');
	});
});

describe('per-model toCSS', () => {
	test('each color serialises in its own model', () => {
		expect(cv('hsl', { h: 200, s: 0.6, l: 0.5 }).toCSS()).toMatch(/^hsl\(/);
		expect(cv('oklch', { l: 0.6, c: 0.1, h: 200 }).toCSS()).toMatch(/^oklch\(/);
		expect(cv('hwb', { h: 90, w: 0.1, b: 0.2 }).toCSS()).toMatch(/^hwb\(/);
	});
});

describe('MODEL.from / color.to (DSL)', () => {
	test('MODEL.from(color) and color.to("model") agree', () => {
		const r = evaluate(
			'brand = hex("#6c5ce7")\na = OKLCH.from(brand)\nb = brand.to("oklch")\nd = a.ok_l - b.ok_l'
		);
		expect(r.errors).toEqual([]);
		expect(a(r, 'a')).toBe('oklch');
		expect(Math.abs(r.variables.get('d')!.value as number)).toBeLessThan(1e-9);
	});
});

describe('same-model ops (mix / contrast / deltaE require one model)', () => {
	test('same model succeeds, different models throw an actionable error', () => {
		const ok = evaluate('a = OKLCH(0.6,0.1,200)\nb = OKLCH(0.4,0.1,30)\nm = mix(a, b, 0.5)');
		expect(ok.errors).toEqual([]);

		const bad = evaluate('a = OKLCH(0.6,0.1,200)\nb = HSL(40,0.8,0.6)\nm = mix(a, b, 0.5)');
		expect(bad.errors.length).toBe(1);
		expect(bad.errors[0].message).toContain('same model');

		// converting first makes it pass
		const fixed = evaluate('a = OKLCH(0.6,0.1,200)\nb = HSL(40,0.8,0.6)\nm = mix(a, b.oklch, 0.5)');
		expect(fixed.errors).toEqual([]);
	});
});

// helper: model tag of an evaluated color var
function a(r: ReturnType<typeof evaluate>, name: string): string {
	return (r.variables.get(name)!.value as ColorValue).model;
}
