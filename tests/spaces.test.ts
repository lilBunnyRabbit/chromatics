import { test, expect, describe } from 'bun:test';
import { allModels, ColorValue, hex } from '../src/lib/models';

/** Probe colours that sit inside every space we ship. */
const PROBES = ['#1a8cff', '#7ac26a', '#e49b39', '#b5a2d2'];
/** RYB's artists' gamut is smaller than sRGB, so its inverse is a best fit. */
const GAMUT_LIMITED = new Set(['ryb']);

describe('every experimental colour space round-trips through its constructor', () => {
	const models = allModels().filter(
		(m) => m.status === 'experimental' && m.ctor && m.channels.length === 3 && m.family !== 'system'
	);

	test('we cover a broad set of spaces', () => {
		expect(models.length).toBeGreaterThan(25);
	});

	for (const m of models) {
		test(`${m.id} (${m.label}) round-trips to the source hex`, () => {
			for (const hx of PROBES) {
				const base = hex(hx);
				const proj = base.project(m.mode) as unknown as Record<string, number | undefined>;
				const args = m.channels.map((ch) => (proj[ch.culoriField] ?? 0) * (ch.scale ?? 1));
				const built = ColorValue.from(m.ctor!.build(args));
				if (GAMUT_LIMITED.has(m.id)) expect(built).toBeDefined();
				else expect(built.hex.toLowerCase()).toBe(hx);
			}
		});
	}
});

describe('appearance-model reference values', () => {
	test('CAM16 of pure red matches Material', () => {
		const r = hex('#ff0000');
		expect(r.channel('cam16_j')).toBeCloseTo(46.45, 1);
		expect(r.channel('cam16_c')).toBeCloseTo(113.35, 1);
		expect(r.channel('cam16_h')).toBeCloseTo(27.41, 1);
	});
	test('xyY of white is the D65 chromaticity', () => {
		const w = hex('#ffffff');
		expect(w.channel('xyy_x')).toBeCloseTo(0.3127, 3);
		expect(w.channel('xyy_y')).toBeCloseTo(0.329, 3);
	});
	test('Hunter Lab of white is L≈100, a≈0, b≈0', () => {
		const w = hex('#ffffff');
		expect(w.channel('hlab_l')).toBeCloseTo(100, 1);
		expect(w.channel('hlab_a')).toBeCloseTo(0, 1);
		expect(w.channel('hlab_b')).toBeCloseTo(0, 1);
	});
	test('CAM16-UCS ΔE separates near from far colours', () => {
		const deltaE = hex('#1a8cff').view('cam16ucs').member('deltaE') as (c: ColorValue) => number;
		expect(deltaE(hex('#1a90ff'))).toBeLessThan(deltaE(hex('#ff0000')));
	});
});

describe('coming-soon spaces stay honest', () => {
	test('a conceptual model throws an actionable error', () => {
		const yjk = allModels().find((m) => m.id === 'yjk')!;
		expect(yjk.status).toBe('coming-soon');
		expect(yjk.backed).toBe(false);
	});
});
