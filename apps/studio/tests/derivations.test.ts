import { test, expect, describe } from 'bun:test';
import { Color, Hsl, Lab, Lch, Oklab, Oklch, Srgb, Srgb8, Xyz65 } from '@lilbunnyrabbit/chromatics';
import {
	HUE_MODELS,
	INTERP_SPACES,
	RAMP_MODELS,
	RAMP_SHADES,
	harmonyColors,
	mixIn,
	rampColors,
	rotateIn
} from '../src/lib/color/spaces';
import { evaluate } from '../src/lib/dsl/evaluator';
import { MODEL_CLASSES, modelName } from '../src/lib/dsl/values';

const base = new Oklch(0.62, 0.16, 264);
const shown = (c: Color) => c.to(Srgb).gamutMap().to(Srgb8).toHex();

describe('derivation lists stay in sync with the DSL (anti-drift)', () => {
	test('every curated space / model is a DSL class', () => {
		const dsl = new Set(MODEL_CLASSES.map(([, m]) => m));
		for (const s of [...INTERP_SPACES, ...HUE_MODELS, ...RAMP_MODELS]) {
			expect(dsl.has(s.model), s.label).toBe(true);
		}
	});
});

describe('tonal ramps per model', () => {
	test('Oklch ramp yields 11 shades, light → dark', () => {
		const steps = rampColors(base, Oklch);
		expect(steps.map((s) => s.shade)).toEqual([
			50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
		]);
		expect(steps[0].color.to(Oklch).l).toBeGreaterThan(steps[10].color.to(Oklch).l);
	});

	test('every curated ramp model produces 11 distinct displayed steps', () => {
		for (const m of RAMP_MODELS) {
			const hexes = rampColors(base, m.model).map((s) => shown(s.color));
			expect(hexes, m.label).toHaveLength(11);
			expect(new Set(hexes).size, m.label).toBe(11);
		}
		const a = rampColors(base, Oklch).map((s) => shown(s.color));
		const b = rampColors(base, Lab).map((s) => shown(s.color));
		expect(a).not.toEqual(b);
	});

	test('ramp steps are new colours; the base is untouched', () => {
		const seed = base.clone();
		rampColors(seed, Oklch);
		expect(seed.coords).toEqual(base.coords);
	});

	test('an uncurated ramp model falls back to Oklch', () => {
		expect(rampColors(base, Xyz65).map((s) => shown(s.color))).toEqual(
			rampColors(base, Oklch).map((s) => shown(s.color))
		);
	});
});

describe('harmony per hue model', () => {
	test('triadic differs between Oklch and Hsl wheels', () => {
		const ok = harmonyColors(base, 'triadic', Oklch).map((s) => shown(s.color));
		const hsl = harmonyColors(base, 'triadic', Hsl).map((s) => shown(s.color));
		expect(ok).toHaveLength(3);
		expect(hsl).toHaveLength(3);
		expect(ok).not.toEqual(hsl);
	});

	test('every curated hue model rotates and stays renderable', () => {
		for (const m of HUE_MODELS) {
			const swatches = harmonyColors(base, 'complementary', m.model);
			expect(swatches, m.label).toHaveLength(2);
			expect(swatches[0].base).toBe(true);
			expect(swatches[1].hue, m.label).toBeCloseTo((swatches[0].hue + 180) % 360, 6);
			for (const s of swatches) expect(shown(s.color)).toMatch(/^#[0-9a-f]{6}$/);
		}
	});
});

describe('harmony and ramp methods in the DSL', () => {
	test('hue models carry the package harmony set', () => {
		const r = evaluate(
			`c = Oklch(0.6, 0.14, 30)\n` +
				`a = c.to(Lch).triadic()\n` +
				`b = c.to(Cam16).complement()\n` +
				`d = c.to(Hsluv).analogous()\n` +
				`e = c.to(Okhsl).rotateHue(40)`
		);
		expect(r.errors).toEqual([]);
		const v = (n: string) => r.variables.get(n)?.value;
		expect(Array.isArray(v('a'))).toBe(true);
		expect(v('b')).toBeInstanceOf(Color);
		expect(Array.isArray(v('d'))).toBe(true);
		expect(v('e')).toBeInstanceOf(Color);
	});

	test('Harmony tool codegen matches rotateIn for every hue model', () => {
		for (const m of HUE_MODELS) {
			const name = modelName(m.model);
			const r = evaluate(`c = Oklch(0.6, 0.14, 30)\nx = c.to(${name}).rotateHue(180)`);
			expect(r.errors, name).toEqual([]);
			expect(shown(r.variables.get('x')!.value as Color), name).toBe(
				shown(rotateIn(new Oklch(0.6, 0.14, 30), m.model, 180))
			);
		}
	});

	test('Ramp tool codegen matches rampColors for every ramp model', () => {
		for (const m of RAMP_MODELS) {
			const name = modelName(m.model);
			const lines = m.stops.map(
				(v, i) => `s${RAMP_SHADES[i]} = c.to(${name}).set({ ${m.channel}: ${v} })`
			);
			const r = evaluate(`c = Oklch(0.6, 0.14, 30)\n${lines.join('\n')}`);
			expect(r.errors, name).toEqual([]);
			const expected = rampColors(new Oklch(0.6, 0.14, 30), m.model).map((s) => shown(s.color));
			expect(
				RAMP_SHADES.map((k) => shown(r.variables.get(`s${k}`)!.value as Color)),
				name
			).toEqual(expected);
		}
	});

	test('Gradient tool codegen matches mixIn for every space', () => {
		const a = new Oklch(0.6, 0.1, 200);
		const b = new Oklch(0.5, 0.1, 20);
		for (const s of INTERP_SPACES) {
			const name = modelName(s.model);
			const r = evaluate(
				`a = Oklch(0.6, 0.1, 200)\nb = Oklch(0.5, 0.1, 20)\nx = a.to(${name}).mix(b.to(${name}), 0.5)`
			);
			expect(r.errors, name).toEqual([]);
			expect(shown(r.variables.get('x')!.value as Color), name).toBe(
				shown(mixIn(a, b, s.model, 0.5))
			);
		}
	});

	test('c.to(Model).ramp(n) returns real colours that can feed tokens', () => {
		const r = evaluate(`c = Oklch(0.6, 0.14, 30)\ng = c.to(Lab).ramp(11)`);
		expect(r.errors).toEqual([]);
		const g = r.variables.get('g')?.value as unknown[];
		expect(g).toHaveLength(11);
		expect(g[0]).toBeInstanceOf(Lab);
	});
});

describe('gradient hue strategy', () => {
	// Expected arcs: CSS Color 4 #hue-interpolation pseudo-code.
	const midHue = (
		from: number,
		to: number,
		hue: 'shorter' | 'longer' | 'increasing' | 'decreasing'
	) => mixIn(new Oklch(0.6, 0.1, from), new Oklch(0.6, 0.1, to), Oklch, 0.5, hue).to(Oklch).h;

	test('strategies pick different arcs around the wheel', () => {
		expect(midHue(20, 340, 'shorter')).toBeCloseTo(0, 5);
		expect(midHue(20, 340, 'longer')).toBeCloseTo(180, 5);
		expect(midHue(20, 340, 'increasing')).toBeCloseTo(180, 5);
		expect(midHue(20, 340, 'decreasing')).toBeCloseTo(0, 5);
	});

	test('equal-hue endpoints stay flat, except longer, which takes the full turn', () => {
		for (const s of ['shorter', 'increasing', 'decreasing'] as const) {
			expect(midHue(120, 120, s)).toBeCloseTo(120, 5);
		}
		// CSS Color 4: longer with −180 < θ₂ − θ₁ ≤ 0 adds 360 to θ₂, so 120 → 480.
		expect(midHue(120, 120, 'longer')).toBeCloseTo(300, 5);
	});

	test('a rectangular space ignores the hue strategy', () => {
		const a = new Oklch(0.6, 0.1, 20);
		const b = new Oklch(0.6, 0.1, 340);
		expect(shown(mixIn(a, b, Oklab, 0.5, 'longer'))).toBe(
			shown(mixIn(a, b, Oklab, 0.5, 'shorter'))
		);
	});

	test('preview.gradient accepts an options object', () => {
		const r = evaluate(
			`a=Oklch(0.6,0.1,200)\nb=Oklch(0.5,0.1,20)\n` +
				`g=preview.gradient(a,b,{ space: Lch, hue: "longer", stops: 9 })`
		);
		expect(r.errors).toEqual([]);
		const g = r.variables.get('g')?.value as Record<string, unknown>;
		expect(g.space).toBe(Lch);
		expect(g.hue).toBe('longer');
		expect(g.stops).toBe(9);
	});

	test('preview.harmony carries a model (default Oklch)', () => {
		const r = evaluate(
			`a=Oklch(0.6,0.1,200)\nh=preview.harmony(a)\nh2=preview.harmony(a,"triadic",Hsl)`
		);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('h')?.value as Record<string, unknown>).model).toBe(Oklch);
		expect((r.variables.get('h2')?.value as Record<string, unknown>).model).toBe(Hsl);
	});
});
