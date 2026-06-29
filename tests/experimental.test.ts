import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { manifest } from '../src/lib/dsl/manifest';
import { getModel, type ColorValue } from '../src/lib/models';

/** Evaluate a script and return the value of one variable (asserting no errors). */
function run(src: string) {
	const r = evaluate(src);
	expect(r.errors).toEqual([]);
	return (name: string) => r.variables.get(name)!.value;
}
const asColor = (v: unknown) => v as ColorValue;

describe('status field', () => {
	const status = (id: string) => getModel(id)!.status;
	test('new culori-backed spaces are stable', () => {
		expect(status('xyz50')).toBe('stable');
		expect(status('xyb')).toBe('stable');
	});
	test('hand-rolled models are experimental', () => {
		for (const id of ['cmyk', 'hsluv', 'hpluv', 'hct', 'ral'])
			expect(status(id)).toBe('experimental');
	});
	test('licensed catalogs are coming-soon', () => {
		for (const id of ['pantone', 'munsell', 'ncs', 'hks', 'dic', 'toyo', 'copic', 'trumatch'])
			expect(status(id)).toBe('coming-soon');
	});
	test('manifest carries status onto members', () => {
		const hct = manifest.viewMembers.get('hct')!.find((m) => m.name === 'tonalPalette')!;
		expect(hct.status).toBe('experimental');
		expect(hct.backed).toBe(true);
		const pan = manifest.viewMembers.get('pantone')!.find((m) => m.name === 'nearest')!;
		expect(pan.status).toBe('coming-soon');
		expect(pan.backed).toBe(false);
	});
});

describe('xyz50 + xyb (stable, culori-backed)', () => {
	test('channels resolve and constructors round-trip via OKLCH', () => {
		const g = run(`
a = XYZ50(0.2, 0.21, 0.18)
x = a.xyz50_x
b = hex("#7ac26a")
yb = b.xyb_b
xb = b.xyb.x`);
		expect(typeof g('x')).toBe('number');
		expect(Number.isFinite(g('yb') as number)).toBe(true);
		expect(typeof g('xb')).toBe('number');
	});
	test('xyb has a native ΔE', () => {
		const g = run(`a = hex("#ff0000")\nb = hex("#00ff00")\nd = a.xyb.deltaExyb(b)`);
		expect(g('d') as number).toBeGreaterThan(0);
	});
});

describe('CMYK (experimental, naive device)', () => {
	test('constructor round-trips inks and totalInk works', () => {
		const g = run(`
a = CMYK(0.2, 0.4, 0, 0.1)
c = a.cmyk.c
m = a.cmyk.m
k = a.cmyk.k
ink = a.cmyk.totalInk`);
		expect(g('c') as number).toBeCloseTo(0.2, 2);
		expect(g('m') as number).toBeCloseTo(0.4, 2);
		expect(g('k') as number).toBeCloseTo(0.1, 2);
		expect(g('ink') as number).toBeCloseTo(70, 1); // (0.2+0.4+0+0.1)*100
	});
	test('pure cyan/magenta/yellow build the expected primaries', () => {
		const g = run(`c = CMYK(1,0,0,0)\nm = CMYK(0,1,0,0)\ny = CMYK(0,0,1,0)`);
		expect(asColor(g('c')).hex.toLowerCase()).toBe('#00ffff');
		expect(asColor(g('m')).hex.toLowerCase()).toBe('#ff00ff');
		expect(asColor(g('y')).hex.toLowerCase()).toBe('#ffff00');
	});
	test('limitInk caps total area coverage', () => {
		const g = run(
			`a = CMYK(0.9, 0.9, 0.9, 0.9)\nlim = a.cmyk.limitInk(240)\nink = lim.cmyk.totalInk`
		);
		expect(g('ink') as number).toBeLessThanOrEqual(240.001);
		expect(asColor(g('lim'))).toBeDefined();
	});
	test('separations returns the four ink plates', () => {
		const r = evaluate(`a = hex("#3366cc")\ns = a.cmyk.separations()`);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('s')!.value as unknown[]).length).toBe(4);
	});
});

describe('HSLuv + HPLuv (experimental, faithful reference)', () => {
	test('HSLuv matches the reference value for pure red', () => {
		const g = run(`r = hex("#ff0000")\nh = r.hsluv_h\ns = r.hsluv_s\nl = r.hsluv_l`);
		expect(g('h') as number).toBeCloseTo(12.177, 2);
		expect(g('s') as number).toBeCloseTo(100, 2);
		expect(g('l') as number).toBeCloseTo(53.237, 2);
	});
	test('HSLuv constructor round-trips to the source hex', () => {
		const g = run(`r = HSLUV(12.177, 100, 53.237)`);
		expect(asColor(g('r')).hex.toLowerCase()).toBe('#ff0000');
	});
	test('native hue rotation changes the color', () => {
		const g = run(`r = hex("#1a8cff")\nrot = r.hsluv.rotateHue(40)`);
		expect(asColor(g('rot')).hex).not.toBe('#1a8cff');
	});
	test('HPLuv produces an in-gamut pastel', () => {
		const g = run(`p = HPLUV(200, 50, 60)\nok = p.inGamut`);
		expect(g('ok')).toBe(true);
	});
});

describe('HCT (experimental, CAM16 + tone solver)', () => {
	test('forward matches Material published HCT for red', () => {
		const g = run(`r = hex("#ff0000")\nh = r.hct_h\nc = r.hct_c\nt = r.hct_t`);
		expect(g('h') as number).toBeCloseTo(27.4, 0);
		expect(g('c') as number).toBeCloseTo(113.4, 0);
		expect(g('t') as number).toBeCloseTo(53.2, 0);
	});
	test('round-trips saturated colors to the exact hex', () => {
		for (const hx of ['#ff0000', '#1a8cff', '#7ac26a', '#b5a2d2']) {
			const g = run(`r = hex("${hx}")\nrt = HCT(r.hct_h, r.hct_c, r.hct_t)`);
			expect(asColor(g('rt')).hex.toLowerCase()).toBe(hx);
		}
	});
	test('tonalPalette spans tones and atTone sets the tone', () => {
		const r = evaluate(
			`r = hex("#1a8cff")\npal = r.hct.tonalPalette()\np40 = r.hct.atTone(40)\nt = p40.hct_t`
		);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('pal')!.value as unknown[]).length).toBe(13);
		expect(r.variables.get('t')!.value as number).toBeCloseTo(40, 0);
	});
	test('materialRoles returns four key tones', () => {
		const r = evaluate(`r = hex("#1a8cff")\nroles = r.hct.materialRoles()`);
		expect(r.errors).toEqual([]);
		expect((r.variables.get('roles')!.value as unknown[]).length).toBe(4);
	});
});

describe('RAL Classic (experimental, nearest-swatch search)', () => {
	test('nearest/code/name resolve a known swatch', () => {
		const g = run(`
c = hex("#cc0605")
code = c.ral.code()
name = c.ral.name()
near = c.ral.nearest()
d = c.ral.deltaE()`);
		expect(g('code')).toBe('RAL 3020'); // traffic red
		expect(g('name')).toBe('Traffic red');
		expect(asColor(g('near'))).toBeDefined();
		expect(g('d') as number).toBeLessThan(3); // exact swatch input → tiny ΔE
	});
	test('coming-soon catalog still throws actionably', () => {
		const r = evaluate(`c = hex("#cc0605")\nx = c.pantone.nearest()`);
		expect(r.errors.length).toBe(1);
		expect(r.errors[0].message).toContain('@lilbunnyrabbit/chromatics');
	});
});
