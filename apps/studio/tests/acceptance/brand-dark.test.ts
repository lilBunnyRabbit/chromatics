import { test, expect } from 'bun:test';
import { evaluate } from '../../src/lib/dsl/evaluator';
import { source } from '../fixtures/brand-dark';
import { source as example } from '../../src/routes/examples/brand-dark';
import { Color, Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';
import { deriveScheme } from '../../src/lib/scheme/derive';
import { emptyRoles, DEFAULT_OPACITIES } from '../../src/lib/scheme/roles';

/**
 * Core colors with master's published hex values
 * (master:src/lib/schemes/brand-dark.ts). The DSL must reproduce them exactly.
 */
const MASTER_PUBLISHED: Record<string, string> = {
	background: '#17252c',
	foreground: '#b1aba8',
	primary: '#a4b483',
	secondary: '#b5a2d2',
	accent: '#d1a085',
	success: '#7ac26a',
	warning: '#e49b39',
	error: '#f88876',
	info: '#49b7fb'
};

function hexes(src: string) {
	const r = evaluate(src);
	const out: Record<string, string> = {};
	for (const n of r.order) {
		const v = r.variables.get(n)!;
		if (v.value instanceof Color) out[n] = v.value.to(Srgb).gamutMap().to(Srgb8).toHex();
	}
	return { out, errors: r.errors };
}

test('brand-dark evaluates with zero errors', () => {
	expect(evaluate(source).errors).toEqual([]);
});

test('brand-dark reproduces master published hexes byte-for-byte', () => {
	const { out } = hexes(source);
	for (const [name, hex] of Object.entries(MASTER_PUBLISHED)) {
		expect(out[name]).toBe(hex);
	}
});

test('brand-dark renders the full 18-variant background chroma study', () => {
	const { out } = hexes(source);
	const bgVars = Object.keys(out).filter((n) => n.startsWith('bg_'));
	expect(bgVars.length).toBe(18);
	// the three chroma modes at one step are distinct (sat / flat / desat)
	expect(out.bg_lightest_sat).not.toBe(out.bg_lightest_flat);
	expect(out.bg_lightest_flat).not.toBe(out.bg_lightest_desat);
});

// ── The editor example ("Brand Dark") is the v4 two-mode theme the brand guide ships (owner,
// 2026-10-25). Its golden hexes are the culori-era studio's output for the same source (theme port
// report, evaluated at 365c747), so the package port can't drift. Byte for byte: the theme reads
// WCAG's luminance, not the package's exact Y, so cottontail stays off its rounding edge.
const V4_GOLDEN: Record<string, string> = {
	background: '#17252c',
	foreground: '#b1aba8',
	primary: '#a4b483',
	secondary: '#b2a6c5',
	tertiary: '#9eb1ac',
	accent: '#dc9b76',
	success: '#7ac26a',
	warning: '#e49b39',
	error: '#f88876',
	info: '#49b7fb',
	background_lightest: '#2a404a',
	background_lighter: '#243740',
	background_light: '#1d2e36',
	background_dark: '#111d23',
	background_darker: '#0b1519',
	background_darkest: '#060d11',
	cottontail: '#e3f9b2',
	light_background: '#f6eddb',
	light_foreground: '#414754',
	light_background_lightest: '#ffffff',
	light_background_lighter: '#fcf9f3',
	light_background_light: '#f9f3e7',
	light_background_dark: '#ebd9b1',
	light_background_darker: '#dec58e',
	light_background_darkest: '#cab380',
	light_primary: '#7f4e32',
	light_accent: '#814370',
	light_secondary: '#376662',
	light_tertiary: '#5f5968',
	light_success: '#1c6f00',
	light_warning: '#5d6200',
	light_error: '#a12c1f',
	light_info: '#0063a0',
	light_cottontail: '#9c4800'
};

test('the Brand Dark example reproduces the v4 hexes, both modes', () => {
	const { out, errors } = hexes(example);
	expect(errors).toEqual([]);
	expect(out).toMatchObject(V4_GOLDEN);
});

test('the Brand Dark example keeps its own contract in both modes', () => {
	const r = evaluate(example);
	expect(r.variables.get('d_contract')!.value).toBe(true);
	expect(r.variables.get('l_contract')!.value).toBe(true);
});

test('the Brand Dark example binds all 12 roles in light and in dark', () => {
	const r = deriveScheme(example, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
	expect(r.result.errors).toEqual([]);
	expect(r.hasDarkTheme).toBe(true);
	expect(Object.values(r.effectiveRoles).every((n) => n !== '')).toBe(true);
	expect(Object.values(r.darkEffectiveRoles).every((n) => n !== '')).toBe(true);
	// The theme's contract in the studio's own audit: text and every button label clear AA.
	const labels = [
		'Body text',
		'Body on surface',
		'Primary btn',
		'Secondary btn',
		'Tertiary btn',
		'Accent btn'
	];
	for (const audit of [r.audit, r.darkAudit]) {
		for (const label of labels) {
			expect(audit.find((p) => p.label === label)!.ratio).toBeGreaterThanOrEqual(4.5);
		}
	}
});
