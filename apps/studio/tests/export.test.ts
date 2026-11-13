import { test, expect, describe } from 'bun:test';
import { evaluate } from '@lilbunnyrabbit/chromatics-dsl';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import { toPaletteVars, toMarkdown, type ColorFormat } from '@lilbunnyrabbit/chromatics-dsl/export';
import { exportScheme } from '../src/lib/export';
import { encodeHash, decodeHash } from '../src/lib/persistence/url-hash';

const SRC = `bg = Oklch(0.2, 0.02, 250)
brand = parse("#6c5ce7")
bg_dark = bg.to(Oklch).darken(0.05)`;
const scheme = schemeFromEvalResult(evaluate(SRC), SRC);

describe('exportScheme (studio Export tab)', () => {
	test('dispatches by format; css is the palette', () => {
		expect(exportScheme(scheme, 'css')).toBe(toPaletteVars(scheme));
		expect(exportScheme(scheme, 'markdown')).toBe(toMarkdown(scheme));
	});

	test('threads the color format through', () => {
		const fmt: ColorFormat = { mode: 'single', model: 'Oklch' };
		expect(exportScheme(scheme, 'css', fmt)).toBe(toPaletteVars(scheme, fmt));
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
		const state = { source: 'cafe = parse("#fff") // ☕ ünïcödé' };
		expect(await decodeHash('#' + (await encodeHash(state)))).toEqual(state);
	});
});
