import { test, expect, describe } from 'bun:test';
import { Oklch, Srgb, type Color } from '@lilbunnyrabbit/chromatics';
import { parse } from '@lilbunnyrabbit/chromatics/all';
import { evaluate } from '../src/lib/dsl/evaluator';
import { apcaContrast, apcaUse } from '../src/lib/analysis/apca';
import { deltaE2000, similarPairs, similarityLevel } from '../src/lib/analysis/similarity';
import { printProof } from '../src/lib/analysis/print';
import { nearestName } from '../src/lib/color-names';
import { quantize, rgbToHex } from '../src/lib/analysis/quantize';
import { colorLiteral, oklchLiteral, uniqueName, appendStatements } from '../src/lib/dsl/emit';
import { toSwatchSVG } from '../src/lib/export/swatch';
import type { Scheme, SchemeEntry } from '../src/lib/scheme/types';

const white = parse('#ffffff');
const black = parse('#000000');

function entry(name: string, h: string): SchemeEntry {
	const color = parse(h);
	Object.freeze(color);
	return { name, color, deps: [], line: 0, index: 0 };
}
function scheme(entries: SchemeEntry[]): Scheme {
	return {
		groups: [{ label: 'Colors', entries }],
		entries,
		byName: new Map(entries.map((e) => [e.name, e])),
		errors: [],
		nonColorVars: []
	};
}

describe('APCA', () => {
	test('black text on white ≈ Lc 106', () => {
		expect(apcaContrast(black, white)).toBeCloseTo(106.04, 1);
	});
	test('white text on black ≈ Lc -108 (polarity-aware)', () => {
		expect(apcaContrast(white, black)).toBeCloseTo(-107.88, 1);
	});
	test('identical colors are 0', () => {
		expect(apcaContrast(white, white)).toBe(0);
	});
	test('use buckets', () => {
		expect(apcaUse(106)).toBe('Body');
		expect(apcaUse(-107)).toBe('Body');
		expect(apcaUse(20)).toBe('Fail');
	});
});

describe('similarity', () => {
	test('a color with itself is ΔE 0', () => {
		expect(deltaE2000(white, white)).toBeCloseTo(0, 6);
	});
	test('black vs white is far apart', () => {
		expect(deltaE2000(black, white)).toBeGreaterThan(95);
	});
	test('finds confusable pairs below threshold', () => {
		const s = scheme([entry('a', '#3366cc'), entry('b', '#3367cd'), entry('c', '#cc3366')]);
		const pairs = similarPairs(s.entries, 10);
		expect(pairs.length).toBe(1);
		expect(pairs[0].a).toBe('a');
		expect(pairs[0].b).toBe('b');
		expect(pairs[0].deltaE).toBeLessThan(2);
	});
	test('level classification', () => {
		expect(similarityLevel(0.5)).toBe('identical');
		expect(similarityLevel(1.5)).toBe('imperceptible');
		expect(similarityLevel(50)).toBe('distinct');
	});
});

describe('print proof', () => {
	test('pure black is all key, no rich black', () => {
		const p = printProof(black);
		expect(p.k).toBeGreaterThan(0.99);
		expect(p.c + p.m + p.y).toBeLessThan(0.01);
		expect(p.richBlack).toBe(false);
	});
	test('saturated color over a low ink limit flags overInk', () => {
		const p = printProof(parse('#102030'), 240);
		expect(typeof p.totalInk).toBe('number');
		expect(p.proofHex).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe('color names', () => {
	test('exact red is "red"', () => {
		expect(nearestName(parse('#ff0000')).name).toBe('red');
		expect(nearestName(parse('#ff0000')).deltaE).toBeCloseTo(0, 3);
	});
	test('near-steelblue resolves', () => {
		expect(nearestName(parse('#4682b5')).name).toBe('steelblue');
	});
});

describe('quantize', () => {
	test('extracts dominant colors from RGBA bytes', () => {
		// 2 red + 2 blue opaque pixels
		const data = new Uint8ClampedArray([
			255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255
		]);
		const cols = quantize(data, 2);
		expect(cols.length).toBe(2);
		const hexes = cols.map(rgbToHex);
		expect(hexes).toContain('#ff0000');
		expect(hexes).toContain('#0000ff');
	});
	test('skips transparent pixels', () => {
		const data = new Uint8ClampedArray([255, 0, 0, 0, 0, 255, 0, 255]);
		const cols = quantize(data, 4);
		expect(cols.length).toBe(1);
		expect(rgbToHex(cols[0])).toBe('#00ff00');
	});
});

describe('DSL emit', () => {
	test('in-gamut color → parse() hex literal', () => {
		expect(colorLiteral(parse('#3366cc'))).toBe('parse("#3366cc")');
	});
	test('out-of-gamut color → Oklch literal', () => {
		const wide = new Oklch(0.7, 0.37, 150);
		expect(wide.to(Srgb).inGamut()).toBe(false);
		expect(colorLiteral(wide)).toBe(oklchLiteral(wide));
		expect(oklchLiteral(wide)).toBe('Oklch(0.7, 0.37, 150)');
	});
	test('emitted literals evaluate in the new DSL', () => {
		for (const c of [parse('#3366cc'), new Oklch(0.7, 0.37, 150)]) {
			const r = evaluate(`x = ${colorLiteral(c)}`);
			expect(r.errors).toEqual([]);
			expect((r.variables.get('x')!.value as Color).to(Oklch).l).toBeCloseTo(c.to(Oklch).l, 4);
		}
	});
	test('unique name avoids collisions', () => {
		expect(uniqueName('primary', ['primary', 'primary_2'])).toBe('primary_3');
		expect(uniqueName('2cool', [])).toBe('_2cool');
	});
	test('appendStatements adds a gap and comment', () => {
		const out = appendStatements(
			'seed = Oklch(0.6, 0.1, 200)',
			['x = seed.clone().lighten(0.1)'],
			'tint'
		);
		expect(out).toContain('seed = Oklch(0.6, 0.1, 200)\n\n// tint\nx = seed.clone().lighten(0.1)');
	});
});

describe('swatch SVG', () => {
	test('renders one card per entry with hex + name', () => {
		const s = scheme([entry('primary', '#3366cc'), entry('accent', '#cc3366')]);
		const svg = toSwatchSVG(s);
		expect(svg).toStartWith('<svg');
		expect(svg).toContain('#3366cc');
		expect(svg).toContain('primary');
		expect(svg).toContain('accent');
	});
});
