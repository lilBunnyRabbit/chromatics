/**
 * Scheme diff engine (CD-14). Both sides re-derive through the shared spine, so
 * these lock the comparison semantics: palette add/remove/change with ΔE + OKLCH
 * deltas, role re-targets, and the headline WCAG-band crossings (light + dark).
 */
import { test, expect, describe } from 'bun:test';
import { deriveScheme } from '../src/lib/scheme/derive';
import { diffSchemes, diffSnapshots, deriveSnapshot } from '../src/lib/scheme/diff';
import { emptyRoles, DEFAULT_OPACITIES } from '../src/lib/scheme/roles';

const base = { roles: emptyRoles(), opacities: DEFAULT_OPACITIES };

const A = `bg = OKLCH(0.98, 0.01, 250)
fg = OKLCH(0.25, 0.02, 250)
primary = OKLCH(0.55, 0.15, 250)`;

// fg pushed much lighter — body text contrast collapses (AAA → Fail).
const B_LIGHT_FG = `bg = OKLCH(0.98, 0.01, 250)
fg = OKLCH(0.85, 0.02, 250)
primary = OKLCH(0.55, 0.15, 250)`;

// A + a new accent color.
const A_PLUS_ACCENT = `${A}
accent = OKLCH(0.6, 0.12, 30)`;

const render = (src: string) => deriveScheme(src, base);

describe('identical snapshots', () => {
	const d = diffSchemes(render(A), render(A));
	test('summary reports no change', () => {
		expect(d.summary.changed).toBe(false);
		expect(d.summary.colorsChanged).toBe(0);
		expect(d.summary.contrastRegressions).toBe(0);
	});
	test('every palette + contrast row is unchanged', () => {
		expect(d.palette.every((p) => p.status === 'unchanged')).toBe(true);
		expect(d.contrast.every((c) => c.status === 'unchanged' && !c.crossed)).toBe(true);
	});
});

describe('a changed color', () => {
	const d = diffSchemes(render(A), render(B_LIGHT_FG));
	test('fg is marked changed with ΔE + signed OKLCH deltas', () => {
		const fg = d.palette.find((p) => p.name === 'fg');
		expect(fg?.status).toBe('changed');
		expect(fg?.deltaE).toBeGreaterThan(0);
		expect(fg?.dL).toBeGreaterThan(0); // 0.25 → 0.85
		expect(fg?.before).not.toBe(fg?.after);
	});
	test('untouched colors stay unchanged', () => {
		expect(d.palette.find((p) => p.name === 'bg')?.status).toBe('unchanged');
		expect(d.palette.find((p) => p.name === 'primary')?.status).toBe('unchanged');
		expect(d.summary.colorsChanged).toBe(1);
		expect(d.summary.maxDeltaE).toBeGreaterThan(0);
	});
});

describe('contrast band crossings (the headline)', () => {
	const d = diffSchemes(render(A), render(B_LIGHT_FG));
	test('body text crosses to a worse band and counts as a regression', () => {
		const body = d.contrast.find((c) => c.label === 'Body text');
		expect(body?.crossed).toBe(true);
		expect(body?.direction).toBe('worse');
		expect(body?.beforeLevel).not.toBe(body?.afterLevel);
		expect(d.summary.contrastRegressions).toBeGreaterThanOrEqual(1);
	});
	test('an improvement is counted the other way', () => {
		const d2 = diffSchemes(render(B_LIGHT_FG), render(A));
		expect(d2.summary.contrastImprovements).toBeGreaterThanOrEqual(1);
		expect(d2.summary.contrastRegressions).toBe(0);
	});
});

describe('added / removed colors and roles', () => {
	test('adding a color shows added in palette + role', () => {
		const d = diffSchemes(render(A), render(A_PLUS_ACCENT));
		const accent = d.palette.find((p) => p.name === 'accent');
		expect(accent?.status).toBe('added');
		expect(accent?.before).toBeUndefined();
		expect(d.summary.colorsAdded).toBe(1);
		// 'accent' name → auto-assigned accent role appears.
		const role = d.roles.find((r) => r.role === 'accent');
		expect(role?.status).toBe('added');
		expect(role?.after).toBe('accent');
	});
	test('removing a color is the mirror image', () => {
		const d = diffSchemes(render(A_PLUS_ACCENT), render(A));
		const accent = d.palette.find((p) => p.name === 'accent');
		expect(accent?.status).toBe('removed');
		expect(accent?.after).toBeUndefined();
		expect(d.summary.colorsRemoved).toBe(1);
	});
});

describe('dark mode is compared too', () => {
	const DARK = `bg = OKLCH(0.98, 0.01, 250)
fg = OKLCH(0.25, 0.02, 250)
primary = OKLCH(0.55, 0.15, 250)
bg_dark = OKLCH(0.18, 0.01, 250)
fg_dark = OKLCH(0.92, 0.02, 250)
dark = theme.dark({ bg: "bg_dark", fg: "fg_dark" })`;
	// Break the dark foreground so a dark pair regresses.
	const DARK2 = DARK.replace(
		'fg_dark = OKLCH(0.92, 0.02, 250)',
		'fg_dark = OKLCH(0.30, 0.02, 250)'
	);

	test('hasDark surfaces and dark contrast diffs populate', () => {
		const d = diffSchemes(render(DARK), render(DARK2));
		expect(d.hasDark).toBe(true);
		expect(d.darkContrast.length).toBeGreaterThan(0);
		expect(d.darkContrast.some((c) => c.crossed)).toBe(true);
	});
	test('no dark theme → empty darkContrast', () => {
		const d = diffSchemes(render(A), render(A));
		expect(d.hasDark).toBe(false);
		expect(d.darkContrast).toEqual([]);
	});
});

describe('robustness', () => {
	test('disjoint audit labels never crash (add/remove rows)', () => {
		// Different component sets → different audit labels on each side.
		const withComponents = `bg = OKLCH(0.98,0.01,250)
fg = OKLCH(0.25,0.02,250)
primary = OKLCH(0.55,0.15,250)
component { btn = button(primary, fg) }`;
		expect(() => diffSchemes(render(A), render(withComponents))).not.toThrow();
	});
	test('diffSnapshots re-derives from raw {source, settings}', () => {
		const d = diffSnapshots({ source: A, settings: base }, { source: B_LIGHT_FG, settings: base });
		expect(d.summary.changed).toBe(true);
		// deriveSnapshot is the same engine the live store uses.
		expect(deriveSnapshot({ source: A, settings: base }).scheme.entries.length).toBe(3);
	});
});
