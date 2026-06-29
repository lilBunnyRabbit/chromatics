import { test, expect } from 'bun:test';
import { evaluate } from '../../src/lib/dsl/evaluator';
import { source } from '../../src/routes/examples/brand-dark';
import { isColorValue, ColorValue } from '../../src/lib/models';

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
