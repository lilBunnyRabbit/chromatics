import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import {
	toCssVars,
	toTokens,
	toTailwind,
	toMarkdown,
	exportScheme,
	kebab
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
