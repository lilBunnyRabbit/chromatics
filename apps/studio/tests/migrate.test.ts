// ADR-017 gate: every pre-package example, upgraded by migrate(), evaluates in the new DSL to the
// culori baseline's hexes. The only allowed differences are colours culori held out of sRGB (it
// clipped them; the package gamut-maps, ADR-016 78d) and the model changes listed in review.md.
import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Lab65, Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';
import { parse } from '@lilbunnyrabbit/chromatics/all';
import { migrate } from '../src/lib/dsl/migrate';
import { evaluate } from '../src/lib/dsl/evaluator';
import { isColor } from '../src/lib/dsl/values';
import { examples } from '../src/routes/examples';

interface BaselineEntry {
	hex: string;
	inGamut: boolean;
}

const baseline = JSON.parse(
	readFileSync(join(import.meta.dir, 'fixtures/baseline/culori/examples.json'), 'utf8')
) as Record<string, { entries: Record<string, BaselineEntry> }>;

const LEGACY_DIR = join(import.meta.dir, 'fixtures/legacy-examples');
const legacy = await Promise.all(
	readdirSync(LEGACY_DIR)
		.filter((f) => f !== 'index.ts' && f !== 'brand-dark-template.ts')
		.map(async (f) => (await import(join(LEGACY_DIR, f))) as { name: string; source: string })
);

const hexOf = (v: unknown) => (isColor(v) ? v.to(Srgb).gamutMap().to(Srgb8).toHex() : null);

// review.md: the package's HCT stores the tone as given where culori's re-solved chroma into sRGB, and
// Machado CVD runs in linear light where culori applied it to gamma sRGB (grill 79).
const KNOWN = new Set([
	'Showcase:brand_20',
	'Showcase:brand_90',
	'Showcase:warning',
	'Showcase:cvd'
]);

describe('old examples, upgraded', () => {
	test('all ten are covered', () => expect(legacy.length).toBe(10));

	for (const ex of legacy) {
		describe(ex.name, () => {
			const m = migrate(ex.source);
			const r = evaluate(m.source);

			test('upgrades without errors, except leftovers it flagged', () => {
				const flagged = new Set(m.leftovers.map((l) => l.line));
				expect(r.errors.filter((e) => !flagged.has(e.line))).toEqual([]);
				expect(m.changes.length).toBeGreaterThan(0);
			});

			test('keeps every in-sRGB hex within one 8-bit step', () => {
				for (const [name, rec] of Object.entries(baseline[ex.name].entries)) {
					const v = r.variables.get(name);
					if (!v || !rec.inGamut || KNOWN.has(`${ex.name}:${name}`)) continue;
					const now = hexOf(v.value);
					if (now === null) continue;
					const dE = parse(now).to(Lab65).deltaE2000(parse(rec.hex).to(Lab65));
					expect({ name, dE: dE < 0.5 }).toEqual({ name, dE: true });
				}
			});

			test('is a no-op on its own output', () => {
				expect(migrate(m.source).unchanged).toBe(true);
			});
		});
	}

	test('Brand Dark is byte-for-byte', () => {
		const old = legacy.find((e) => e.name === 'Brand Dark')!;
		const r = evaluate(migrate(old.source).source);
		for (const [name, rec] of Object.entries(baseline['Brand Dark'].entries)) {
			expect({ name, hex: hexOf(r.variables.get(name)?.value) }).toEqual({ name, hex: rec.hex });
		}
	});
});

describe('the shipped examples', () => {
	for (const ex of examples) {
		test(`${ex.name} needs no upgrade`, () => expect(migrate(ex.source).unchanged).toBe(true));
	}
});

describe('rules', () => {
	const up = (src: string) => migrate(src).source;

	test('constructors, hex() and flat keys', () => {
		expect(up('a = OKLCH(0.5, 0.1, 30)')).toBe('a = Oklch(0.5, 0.1, 30)');
		expect(up('a = hex("#ff0000")')).toBe('a = parse("#ff0000")');
		expect(up('a = HSL(10, 0.5, 0.5)\nb = a.ok_l')).toBe(
			'a = Hsl(10, 0.5, 0.5)\nb = a.to(Oklch).l'
		);
	});

	test("a bare channel is the colour's own model's, as before", () => {
		expect(up('a = HSL(10, 0.5, 0.5)\nb = a.l')).toBe('a = Hsl(10, 0.5, 0.5)\nb = a.l');
		expect(up('a = OKLCH(0.5, 0.1, 30)\nb = a.s')).toBe('a = Oklch(0.5, 0.1, 30)\nb = a.to(Hsl).s');
	});

	test('mutating calls on a named colour copy first; views convert', () => {
		expect(up('a = OKLCH(0.5, 0.1, 30)\nb = a.lighten(0.1)')).toBe(
			'a = Oklch(0.5, 0.1, 30)\nb = a.clone().lighten(0.1)'
		);
		expect(up('a = hex("#ff0000")\nb = a.oklch.lighten(0.1)')).toBe(
			'a = parse("#ff0000")\nb = a.to(Oklch).lighten(0.1)'
		);
	});

	test('old raw-unit semantics are kept', () => {
		expect(up('a = OKLCH(0.5, 0.1, 30)\nb = a.saturate(0.02)')).toContain(
			'a.clone().shift({ c: 0.02 })'
		);
		expect(up('a = HSV(10, 0.5, 0.5)\nb = a.rotateHue(30)')).toContain('a.to(Hsl).rotateHue(30)');
		expect(up('a = HSLUV(10, 50, 60)')).toBe('a = Hsluv(10, 0.5, 0.6)');
		expect(up('a = YCBCR(0.5, 0.6, 0.4)')).toBe('a = Ycbcr709(0.5, 0.1, -0.1)');
	});

	test('free functions become same-model methods', () => {
		expect(up('m = mix(a.oklab, b.oklab, 0.3)')).toBe('m = a.to(Oklab).mix(b.to(Oklab), 0.3)');
		expect(up('r = contrast(a, b)')).toBe('r = a.to(Srgb).contrast(b.to(Srgb))');
		expect(up('d = deltaE(a, b)')).toBe('d = a.to(Lab65).deltaE2000(b.to(Lab65))');
	});

	test('preview model ids become classes, scale becomes tokens', () => {
		expect(up('r = preview.ramp(a, "lab")')).toBe('r = preview.ramp(a, Lab)');
		expect(up('t = scale.text(16)')).toBe('t = tokens.text(16)');
	});

	test('simulateCVD becomes the simulateCvd builtin', () => {
		expect(up('a = hex("#ff0000")\nb = a.srgb.simulateCVD("deuteranopia")')).toBe(
			'a = parse("#ff0000")\nb = simulateCvd(a.to(Srgb), "deutan")'
		);
		expect(up('a = RGB(1, 0, 0)\nb = a.simulateCVD("protanomaly", 0.4)')).toBe(
			'a = Srgb(1, 0, 0)\nb = simulateCvd(a.clone(), "protan", 0.4)'
		);
	});

	test('no package equivalent: left as written and flagged', () => {
		const m = migrate('a = OKLCH(0.5, 0.1, 30)\nb = a.invert()');
		expect(m.leftovers).toEqual([
			{ line: 2, message: '.invert() on oklch: no package equivalent' }
		]);
		expect(m.source).toBe(
			'a = Oklch(0.5, 0.1, 30)\nb = a.invert() // migrate: .invert() on oklch: no package equivalent'
		);
		expect(evaluate(m.source).errors.map((e) => e.line)).toEqual([2]);
	});

	test('keeps comments, blank lines and block sugar', () => {
		const src = '// head\n\npreview {\n  r = ramp(a, "hsl") // tail\n}\n';
		expect(up(src)).toBe('// head\n\npreview {\n  r = ramp(a, Hsl) // tail\n}\n');
	});

	test('new-DSL code passes through untouched', () => {
		const src =
			'a = Oklch(0.5, 0.1, 30)\nb = a.clone().lighten(0.1)\nc = a.to(Hsl).s\nd = new Lab(50, 0, 0)';
		expect(migrate(src).unchanged).toBe(true);
	});
});
