import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import {
	toCssVars,
	toTokens,
	toTailwind,
	toMarkdown,
	exportScheme,
	serializeColor,
	isCssColor,
	kebab,
	type ColorFormat
} from '../src/lib/export';
import { encodeHash, decodeHash } from '../src/lib/persistence/url-hash';

const SRC = `bg = OKLCH(0.2, 0.02, 250)
brand = hex("#6c5ce7")
bg_dark = bg.oklch.darken(0.05)`;
const scheme = schemeFromEvalResult(evaluate(SRC), SRC);

describe('exporters', () => {
	test('css vars', () => {
		const css = toCssVars(scheme);
		expect(css).toContain(':root {');
		expect(css).toContain('--bg:');
		expect(css).toContain('--bg-dark:');
		expect(css).toContain('oklch(');
	});

	test('DTCG tokens are valid JSON with $type color', () => {
		const json = JSON.parse(toTokens(scheme));
		expect(json.bg.$type).toBe('color');
		expect(json.brand.$value).toBe('#6c5ce7');
		expect(json.bg.$extensions['com.chromatics'].oklch).toContain('oklch(');
	});

	test('tailwind @theme + legacy colors', () => {
		const tw = toTailwind(scheme);
		expect(tw).toContain('@theme {');
		expect(tw).toContain('--color-bg:');
		expect(tw).toContain("'brand': '#6c5ce7'");
	});

	test('markdown table is aligned (uniform row width)', () => {
		const md = toMarkdown(scheme);
		const lines = md.split('\n');
		expect(lines[0]).toContain('| name');
		expect(lines[1]).toMatch(/^\| -+ \| -+ \| -+ \| -+ \|$/);
		expect(new Set(lines.map((l) => l.length)).size).toBe(1);
	});

	test('exportScheme dispatches by format', () => {
		expect(exportScheme(scheme, 'css')).toBe(toCssVars(scheme));
		expect(exportScheme(scheme, 'markdown')).toBe(toMarkdown(scheme));
	});

	test('kebab', () => {
		expect(kebab('bg_dark')).toBe('bg-dark');
		expect(kebab('primaryFg')).toBe('primary-fg');
	});
});

describe('color representation', () => {
	test('isCssColor accepts CSS forms, rejects color(--custom) / color(cmyk)', () => {
		expect(isCssColor('#6c5ce7')).toBe(true);
		expect(isCssColor('oklch(0.6 0.1 250)')).toBe(true);
		expect(isCssColor('hsl(250 60% 50%)')).toBe(true);
		expect(isCssColor('color(display-p3 0.4 0.3 0.9)')).toBe(true);
		expect(isCssColor('color(xyz-d65 0.2 0.1 0.7)')).toBe(true);
		expect(isCssColor('color(--hsv 250 0.6 0.9)')).toBe(false);
		expect(isCssColor('color(cmyk 0.5 0.6 0 0.1)')).toBe(false);
	});

	test('as-defined keeps the authoring model (oklch stays oklch, hex stays hex)', () => {
		const fmt: ColorFormat = { mode: 'as-defined', model: 'hex' };
		const bg = scheme.byName.get('bg')!;
		const brand = scheme.byName.get('brand')!;
		expect(serializeColor(bg, fmt).startsWith('oklch(')).toBe(true);
		expect(serializeColor(brand, fmt)).toBe('#6c5ce7');
	});

	test('single model normalises every color to one model', () => {
		const css = toCssVars(scheme, { mode: 'single', model: 'hex' });
		// every value is a hex literal
		for (const line of css.split('\n').filter((l) => l.includes('--'))) {
			expect(line.trim()).toMatch(/: #[0-9a-f]{6};$/i);
		}
		const oklchCss = toCssVars(scheme, { mode: 'single', model: 'oklch' });
		for (const line of oklchCss.split('\n').filter((l) => l.includes('--'))) {
			expect(line).toContain('oklch(');
		}
	});

	test('as-defined falls back when the authoring model is not valid CSS', () => {
		const SRC2 = `vivid = HSV(280, 0.8, 0.9)`;
		const s2 = schemeFromEvalResult(evaluate(SRC2), SRC2);
		const e = s2.byName.get('vivid')!;
		expect(e.model).toBe('hsv');
		// HSV serialises as color(--hsv …) → not valid CSS → fallback to hex
		expect(serializeColor(e, { mode: 'as-defined', model: 'hex' })).toMatch(/^#[0-9a-f]{6}$/i);
		// a different fallback is honoured
		expect(serializeColor(e, { mode: 'as-defined', model: 'oklch' }).startsWith('oklch(')).toBe(
			true
		);
	});

	test('serialized colors round long floats (clean output)', () => {
		const css = toCssVars(scheme, { mode: 'single', model: 'oklch' });
		expect(css).toContain('oklch(');
		// no value should carry 6+ decimal places
		expect(css.match(/\d+\.\d{6,}/g)).toBeNull();
	});

	test('exportScheme threads the color format through', () => {
		const fmt: ColorFormat = { mode: 'single', model: 'oklch' };
		expect(exportScheme(scheme, 'css', fmt)).toBe(toCssVars(scheme, fmt));
	});
});

describe('url-hash round-trip', () => {
	test('encode/decode preserves source (with or without leading #)', async () => {
		const state = { source: SRC };
		const hash = await encodeHash(state);
		expect(await decodeHash('#' + hash)).toEqual(state);
		expect(await decodeHash(hash)).toEqual(state);
	});

	test('bad input decodes to null', async () => {
		expect(await decodeHash('')).toBeNull();
		expect(await decodeHash('#not-valid-base64!!')).toBeNull();
		expect(await decodeHash('#~1!!!notbase64')).toBeNull();
	});

	test('handles unicode', async () => {
		const state = { source: 'cafe = hex("#fff") // ☕ ünïcödé' };
		expect(await decodeHash('#' + (await encodeHash(state)))).toEqual(state);
	});
});
