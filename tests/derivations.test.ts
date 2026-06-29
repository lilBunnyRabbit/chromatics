import { test, expect, describe } from 'bun:test';
import {
	OKLCH,
	rampColors,
	harmonyColors,
	isColorValue,
	getModelByMode,
	INTERP_SPACES,
	RAMP_MODELS,
	HUE_MODELS
} from '../src/lib/models';
import { lerpHue } from '../src/lib/models/util';
import { evaluate } from '../src/lib/dsl/evaluator';

const base = OKLCH(0.62, 0.16, 264);

describe('derivation descriptors stay in sync with the registry (anti-drift)', () => {
	test('every curated space/model mode resolves to a registered model', () => {
		for (const s of [...INTERP_SPACES, ...HUE_MODELS, ...RAMP_MODELS]) {
			expect(getModelByMode(s.mode), `${s.id} → mode "${s.mode}"`).toBeDefined();
		}
	});
});

describe('tonal ramps per model', () => {
	test('oklch ramp yields 11 shades, light → dark', () => {
		const steps = rampColors(base, 'oklch');
		expect(steps.map((s) => s.shade)).toEqual([
			50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
		]);
		expect(steps[0].color.channel('ok_l')).toBeGreaterThan(steps[10].color.channel('ok_l'));
	});

	test('every curated ramp model produces 11 in-gamut, distinct steps', () => {
		for (const m of RAMP_MODELS) {
			const steps = rampColors(base, m.id);
			expect(steps).toHaveLength(11);
			for (const s of steps) expect(s.color.gamutMapped.inGamut).toBe(true);
		}
		// lab vs oklch ramps differ — the model actually matters.
		const a = rampColors(base, 'oklch').map((s) => s.color.gamutMapped.hex);
		const b = rampColors(base, 'lab').map((s) => s.color.gamutMapped.hex);
		expect(a).not.toEqual(b);
	});

	test('unknown ramp model falls back to oklch', () => {
		expect(rampColors(base, 'nope').map((s) => s.color.gamutMapped.hex)).toEqual(
			rampColors(base, 'oklch').map((s) => s.color.gamutMapped.hex)
		);
	});
});

describe('harmony per hue model', () => {
	test('triadic differs between OKLCH and HSL wheels', () => {
		const ok = harmonyColors(base, 'triadic', 'oklch').map((s) => s.color.gamutMapped.hex);
		const hsl = harmonyColors(base, 'triadic', 'hsl').map((s) => s.color.gamutMapped.hex);
		expect(ok).toHaveLength(3);
		expect(hsl).toHaveLength(3);
		expect(ok).not.toEqual(hsl);
	});

	test('every curated hue model rotates and stays renderable', () => {
		for (const m of HUE_MODELS) {
			const swatches = harmonyColors(base, 'complementary', m.id);
			expect(swatches).toHaveLength(2);
			expect(swatches[0].base).toBe(true);
			for (const s of swatches) expect(typeof s.color.gamutMapped.hex).toBe('string');
		}
	});
});

describe('per-model harmony DSL methods exist', () => {
	const val = (src: string, name: string) => evaluate(src).variables.get(name)?.value;
	test('c.lch / c.cam16 / c.hsluv / c.okhsl gain the full harmony set', () => {
		const src =
			`c = OKLCH(0.6, 0.14, 30)\n` +
			`a = c.lch.triadic()\n` +
			`b = c.cam16.complementary()\n` +
			`d = c.hsluv.analogous()\n` +
			`e = c.okhsl.rotateHue(40)`;
		const r = evaluate(src);
		expect(r.errors).toEqual([]);
		expect(Array.isArray(val(src, 'a'))).toBe(true);
		expect(isColorValue(val(src, 'b'))).toBe(true);
		expect(Array.isArray(val(src, 'd'))).toBe(true);
		expect(isColorValue(val(src, 'e'))).toBe(true);
	});

	test('Harmony tool codegen evaluates to a color for every hue model', () => {
		// Mirrors Harmony.svelte harmExpr(): oklch keeps .oklch.gamutMap(), others
		// chain the root .gamutMapped accessor after the per-model rotateHue.
		for (const m of HUE_MODELS) {
			const expr =
				m.id === 'oklch'
					? `x = c.oklch.rotateHue(180).oklch.gamutMap()`
					: `x = c.${m.id}.rotateHue(180).gamutMapped`;
			const r = evaluate(`c = OKLCH(0.6, 0.14, 30)\n${expr}`);
			expect(r.errors, m.id).toEqual([]);
			expect(isColorValue(r.variables.get('x')?.value), m.id).toBe(true);
		}
	});

	test('base.ramp(model) returns real colors that can feed tokens', () => {
		const r = evaluate(`c = OKLCH(0.6, 0.14, 30)\ng = c.ramp("lab")`);
		expect(r.errors).toEqual([]);
		const g = r.variables.get('g')?.value as unknown[];
		expect(Array.isArray(g)).toBe(true);
		expect(g).toHaveLength(11);
		expect(isColorValue(g[0])).toBe(true);
	});
});

describe('gradient hue strategy', () => {
	test('strategies pick different arcs around the wheel', () => {
		// 20° → 340°: the short arc goes the −40° way (mid 0°); the long way goes
		// +320° (mid 180°). increasing forces +, decreasing forces −.
		expect(Math.round(lerpHue(20, 340, 0.5, 'shorter'))).toBe(0);
		expect(Math.round(lerpHue(20, 340, 0.5, 'longer'))).toBe(180);
		expect(lerpHue(20, 340, 0.5, 'increasing')).toBeCloseTo(180, 5);
		expect(lerpHue(20, 340, 0.5, 'decreasing')).toBeCloseTo(0, 5);
	});

	test('equal-hue endpoints stay flat for every strategy (no phantom sweep)', () => {
		for (const s of ['shorter', 'longer', 'increasing', 'decreasing'] as const) {
			expect(lerpHue(120, 120, 0.5, s)).toBeCloseTo(120, 5);
		}
	});

	test('preview.gradient accepts an options object', () => {
		const r = evaluate(
			`a=OKLCH(0.6,0.1,200)\nb=OKLCH(0.5,0.1,20)\n` +
				`g=preview.gradient(a,b,{ space: "lch", hue: "longer", stops: 9 })`
		);
		expect(r.errors).toEqual([]);
		const g = r.variables.get('g')?.value as Record<string, unknown>;
		expect(g.space).toBe('lch');
		expect(g.hue).toBe('longer');
		expect(g.stops).toBe(9);
	});

	test('preview.harmony carries a model (default oklch)', () => {
		const r = evaluate(
			`a=OKLCH(0.6,0.1,200)\nh=preview.harmony(a)\nh2=preview.harmony(a,"triadic","hsl")`
		);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('h')?.value as Record<string, unknown>).model).toBe('oklch');
		expect((r.variables.get('h2')?.value as Record<string, unknown>).model).toBe('hsl');
	});
});
