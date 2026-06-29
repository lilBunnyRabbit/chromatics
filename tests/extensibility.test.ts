import { test, expect, describe } from 'bun:test';
import { buildManifest } from '../src/lib/dsl/manifest';
import { register, defineModel, allModels, CHANNELS } from '../src/lib/models/registry';
import { method, p } from '../src/lib/models/util';
import { evaluate } from '../src/lib/dsl/evaluator';
import type { CuloriColor } from '../src/lib/models/registry';

describe('zero-edit extensibility (P6 guarantee)', () => {
	test('registering a model surfaces it everywhere via the manifest', () => {
		register(
			defineModel({
				id: '__demo__',
				label: 'Demo',
				family: 'hue',
				ctor: {
					name: 'DEMO',
					params: [p('a')],
					build: ([a]) => ({ mode: 'oklch', l: a, c: 0, h: 0 }) as unknown as CuloriColor
				},
				channels: [{ key: 'demo_a', localKey: 'a', label: 'A', culoriField: 'l', range: [0, 1] }],
				ownMethods: [method('demoOp', [], 'color', 'demo op', (self) => self)]
			})
		);
		const m = buildManifest(allModels(), CHANNELS);
		expect(m.viewMembers.has('__demo__')).toBe(true);
		expect(m.methodNames.has('demoOp')).toBe(true);
		expect(m.propertyNames.has('demo_a')).toBe(true);
		expect(m.constructors.some((c) => c.name === 'DEMO')).toBe(true);
	});
});

describe('long-tail models', () => {
	test('xyz (backed) — cross-model accessor + constructor work', () => {
		const r = evaluate('c = OKLCH(0.6, 0.12, 250)\ny = c.xyz_y\nx = XYZ(0.2, 0.21, 0.55)');
		expect(r.errors).toEqual([]);
		expect(typeof r.variables.get('y')!.value).toBe('number');
		expect(r.variables.get('x')).toBeDefined();
	});

	test('experimental CMYK constructor now computes (was a stub)', () => {
		const r = evaluate(
			'a = OKLCH(0.6,0.1,200)\nink = a.cmyk.totalInk\ncyan = CMYK(1,0,0,0)\ngood = a.oklch.lighten(0.1)'
		);
		expect(r.errors).toEqual([]);
		expect(typeof r.variables.get('ink')!.value).toBe('number');
		expect(r.variables.get('cyan')).toBeDefined();
		expect(r.variables.get('good')).toBeDefined();
	});

	test('coming-soon system method throws an actionable error, caught per-statement', () => {
		const r = evaluate(
			'a = OKLCH(0.6,0.1,200)\nbad = a.munsell.nearest()\ngood = a.oklch.lighten(0.1)'
		);
		expect(r.errors.length).toBe(1);
		expect(r.errors[0].message).toContain('@lilbunnyrabbit/chromatics');
		expect(r.errors[0].line).toBe(2);
		expect(r.variables.get('good')).toBeDefined();
	});
});

describe('expanded model set', () => {
	test('wide-gamut RGB + native ΔE + native hue rotation', () => {
		const r = evaluate(
			`b = OKLCH(0.6, 0.13, 264)
g = A98(0.3, 0.7, 0.2)
inA98 = b.a98.isInGamut
dz = b.jab.deltaEz(g.oklch)
d99 = b.dlab.deltaE99(g.oklch)
duv = b.luv.deltaEuv(g.oklch)
rot = b.okhsl.rotateHue(60)`
		);
		expect(r.errors).toEqual([]);
		expect(typeof r.variables.get('inA98')!.value).toBe('boolean');
		expect(r.variables.get('dz')!.value).toBeGreaterThan(0);
		expect(r.variables.get('d99')!.value).toBeGreaterThan(0);
		expect(r.variables.get('duv')!.value).toBeGreaterThan(0);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const hex = (n: string) => (r.variables.get(n)!.value as any).hex;
		expect(hex('rot')).not.toBe(hex('b'));
	});

	test('color systems advertise their lookups but throw actionably', () => {
		const r = evaluate(
			'b = OKLCH(0.6, 0.13, 264)\nx = b.pantone.nearest()\nok = b.oklch.lighten(0.1)'
		);
		expect(r.errors.length).toBe(1);
		expect(r.errors[0].message).toContain('@lilbunnyrabbit/chromatics');
		expect(r.variables.get('ok')).toBeDefined();
	});
});
