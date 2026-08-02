import { test, expect, describe } from 'bun:test';
import { OKLCH, HSL, LAB, HWB, RGB, hex, allModels, CHANNELS } from '../src/lib/models';
import type { ColorValue, ModelView } from '../src/lib/models';
import { evaluate } from '../src/lib/dsl/evaluator';

/** Simulates the evaluator's `color.<prop>` dispatch. */
function get(c: ColorValue, prop: string): number {
	const v = c.member(prop);
	if (typeof v !== 'number') throw new Error(`${prop} is not a channel (got ${typeof v})`);
	return v;
}
function viewGet(c: ColorValue, view: string, prop: string): number {
	const v = (c.member(view) as ModelView).member(prop);
	if (typeof v !== 'number') throw new Error(`${view}.${prop} is not a channel`);
	return v;
}

describe('bare channels are model-local', () => {
	// The reported seed: `.l`/`.c`/`.h` used to read the HSL projection.
	const bg = OKLCH(0.255, 0.0233, 230.47);

	test('an OKLCH color answers .l/.c/.h with its OWN coordinates', () => {
		expect(get(bg, 'l')).toBeCloseTo(0.255, 12);
		expect(get(bg, 'c')).toBeCloseTo(0.0233, 12);
		expect(get(bg, 'h')).toBeCloseTo(230.47, 12);
	});

	test('bare ≡ namespaced ≡ view', () => {
		expect(get(bg, 'l')).toBe(get(bg, 'ok_l'));
		expect(get(bg, 'c')).toBe(get(bg, 'ok_c'));
		expect(get(bg, 'h')).toBe(get(bg, 'ok_h'));
		expect(get(bg, 'l')).toBe(viewGet(bg, 'oklch', 'l'));
		expect(get(bg, 'h')).toBe(viewGet(bg, 'oklch', 'h'));
	});

	test('reads are exact — no round-trip through the flat index', () => {
		// hsl.l for this seed is ~0.131; the old behaviour returned that for `.l`.
		expect(get(bg, 'l')).not.toBeCloseTo(bg.channel('l'), 3);
		expect(get(bg, 'h')).not.toBeCloseTo(bg.channel('h'), 1);
	});

	test('HSL and sRGB keep their flat keys (localKey === flat key)', () => {
		const c = HSL(265, 0.6, 0.62);
		expect(get(c, 'h')).toBeCloseTo(265, 12);
		expect(get(c, 's')).toBeCloseTo(0.6, 12);
		expect(get(c, 'l')).toBeCloseTo(0.62, 12);
		expect(get(c, 'h')).toBe(c.channel('h'));

		const r = RGB(0.2, 0.4, 0.6);
		expect(get(r, 'r')).toBeCloseTo(0.2, 12);
		expect(get(r, 'g')).toBeCloseTo(0.4, 12);
		expect(get(r, 'b')).toBeCloseTo(0.6, 12);
	});

	test('Lab .b is Lab b, not sRGB blue', () => {
		const c = LAB(50, 20, -60);
		expect(get(c, 'l')).toBeCloseTo(50, 12);
		expect(get(c, 'a')).toBeCloseTo(20, 12);
		expect(get(c, 'b')).toBeCloseTo(-60, 12);
		// the flat index still holds the sRGB reading, and they differ
		expect(c.channel('b')).toBeGreaterThan(0);
		expect(c.channel('b')).toBeLessThanOrEqual(1);
	});

	test('HWB .b is blackness, not blue', () => {
		const c = HWB(200, 0.1, 0.3);
		expect(get(c, 'w')).toBeCloseTo(0.1, 12);
		expect(get(c, 'b')).toBeCloseTo(0.3, 12);
	});

	test('a model with no local key still falls back to the flat index', () => {
		// srgb has no `l`/`h`/`s` channel → hsl projection, as before.
		const c = hex('#3366cc');
		expect(get(c, 'l')).toBe(c.channel('l'));
		expect(get(c, 'h')).toBe(c.channel('h'));
		expect(get(c, 's')).toBe(c.channel('s'));
		// …and an OKLCH color can still borrow hsl saturation (no local `s`).
		expect(get(OKLCH(0.6, 0.12, 250), 's')).toBe(OKLCH(0.6, 0.12, 250).channel('s'));
	});

	test('namespaced cross-model keys are unchanged everywhere', () => {
		const c = HSL(265, 0.6, 0.62);
		expect(get(c, 'ok_l')).toBe(c.channel('ok_l'));
		expect(get(c, 'lab_a')).toBe(c.channel('lab_a'));
		expect(get(c, 'hwb_w')).toBe(c.channel('hwb_w'));
	});

	test('to() re-tags what the bare channels mean', () => {
		const c = OKLCH(0.6, 0.12, 250);
		expect(get(c, 'l')).toBeCloseTo(0.6, 12);
		expect(get(c.to('lab'), 'l')).toBeGreaterThan(1); // CIE L* is 0–100
		expect(get(c.to('hsl'), 'l')).toBe(c.channel('l'));
	});

	test('channels never shadow a method of the same model', () => {
		const clashes: string[] = [];
		for (const m of allModels()) {
			for (const ch of m.channels) {
				if (m.methods.has(ch.localKey)) clashes.push(`${m.id}.${ch.localKey}`);
				if (m.methods.has(ch.key)) clashes.push(`${m.id}.${ch.key}`);
			}
		}
		expect(clashes).toEqual([]);
	});

	test('only hsl + srgb claim un-namespaced flat keys', () => {
		const flat = [...CHANNELS.entries()]
			.filter(([k, ch]) => k === ch.localKey)
			.map(([k, ch]) => `${k}:${ch.modelId}`);
		expect(flat.sort()).toEqual(['h:hsl', 's:hsl', 'l:hsl', 'r:srgb', 'g:srgb', 'b:srgb'].sort());
	});
});

describe('bare channels through the DSL', () => {
	test('the reported snippet needs no ok_ prefix', () => {
		const r = evaluate(`
background = OKLCH(0.255, 0.0233, 230.47)
bg_l = background.l
bg_c = background.c
bg_h = background.h
lighter = OKLCH(background.l + 0.2, background.c, background.h)
`);
		expect(r.errors).toEqual([]);
		expect(r.variables.get('bg_l')!.value).toBeCloseTo(0.255, 12);
		expect(r.variables.get('bg_c')!.value).toBeCloseTo(0.0233, 12);
		expect(r.variables.get('bg_h')!.value).toBeCloseTo(230.47, 12);
		expect((r.variables.get('lighter')!.value as ColorValue).channel('ok_l')).toBeCloseTo(
			0.455,
			12
		);
	});

	test('an HSL color still reads its own hue (Conversions example)', () => {
		const r = evaluate(`
brand   = HSL(265, 0.6, 0.62)
brand_h = brand.h
grey      = HSL(210, 0, 0.5)
grey_back = grey.to("hsv").to("hsl")
grey_h    = grey_back.h
`);
		expect(r.errors).toEqual([]);
		expect(r.variables.get('brand_h')!.value).toBeCloseTo(265, 12);
		expect(r.variables.get('grey_h')!.value).toBeCloseTo(210, 12);
	});
});
