import { test, expect } from 'bun:test';
import { evaluate } from '../../src/lib/dsl/evaluator';
import { source } from '../fixtures/brand-dark';
import { source as example } from '../../src/routes/examples/brand-dark';
import { isColorValue, ColorValue } from '../../src/lib/models';
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
		if (isColorValue(v.value)) out[n] = (v.value as ColorValue).hex;
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

// ── The editor example ("Brand Dark") is the same palette wired into a full
// system (roles + tokens + components). It must never drift from the oracle.

test('the Brand Dark example reproduces the published hexes', () => {
	const { out, errors } = hexes(example);
	expect(errors).toEqual([]);
	for (const [name, hex] of Object.entries(MASTER_PUBLISHED)) {
		expect(out[name]).toBe(hex);
	}
});

test('the Brand Dark example matches the fixture oracle on every shared color', () => {
	const oracle = hexes(source).out;
	const built = hexes(example).out;
	for (const [name, hex] of Object.entries(oracle)) {
		expect(built[name]).toBe(hex);
	}
});

test('the Brand Dark example binds all 12 roles and keeps every label AAA', () => {
	const r = deriveScheme(example, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
	expect(r.result.errors).toEqual([]);
	// `roles { … }` is authoritative — no role falls through to the auto heuristic.
	expect(Object.values(r.effectiveRoles).every((n) => n !== '')).toBe(true);
	// The ensureContrast-derived ink clears AAA on every filled surface.
	const labels = ['Primary btn', 'Secondary btn', 'Tertiary btn', 'Accent btn'];
	for (const label of labels) {
		expect(r.audit.find((p) => p.label === label)!.ratio).toBeGreaterThanOrEqual(7);
	}
	// …and the worst-case roll-up the source computes agrees with the audit.
	expect(r.result.variables.get('labels_aaa')!.value).toBe(true);
});
