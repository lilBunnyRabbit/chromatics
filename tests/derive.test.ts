/**
 * Parity + purity guard for the shared derivation spine (scheme/derive.ts).
 *
 * deriveScheme is a 1:1 extraction of the old inlined $derived chain in
 * app.svelte.ts, so these lock the load-bearing behaviour: the role-merge
 * precedence (theme() > override > auto), the component-audit fallback, and the
 * fact that the canonical scheme is a pure function of {source, roles, opacities}
 * only — never of presentation knobs (visionSim / fgOpacity).
 */
import { test, expect, describe } from 'bun:test';
import { deriveScheme } from '../src/lib/scheme/derive';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import {
	resolveRoles,
	cssVars,
	emptyRoles,
	DEFAULT_OPACITIES,
	type Roles
} from '../src/lib/scheme/roles';
import { themeRolesFromScheme } from '../src/lib/scheme/theme-config';
import { source as designSystem } from '../src/routes/examples/design-system';

const base = { roles: emptyRoles(), opacities: DEFAULT_OPACITIES };

describe('deriveScheme on the Design System example', () => {
	const r = deriveScheme(designSystem, base);

	test('bundles every rendered field', () => {
		expect(r.scheme.entries.length).toBeGreaterThan(0);
		expect(r.themeVars).toContain('--bg');
		expect(r.themeVars).toContain('--fg');
		expect(r.themeVars).toContain('--primary');
		expect(r.tokenVars).toContain('--text-');
		expect(r.namedColorVars).toContain('--color-');
		expect(r.components.length).toBeGreaterThan(0);
		expect(Array.isArray(r.componentAudit)).toBe(true);
	});

	test('threads source into the adapter (RHS descriptions survive)', () => {
		expect(r.scheme.entries.some((e) => !!e.description)).toBe(true);
	});

	test('component audit is the component-derived audit when components exist', () => {
		// design-system authors button/card/type, so this is NOT the 21-pair fallback
		expect(r.componentAudit).not.toBe(r.audit);
	});
});

describe('matches the inline chain it replaced (1:1)', () => {
	test('scheme + effectiveRoles + themeVars equal a hand-rolled chain', () => {
		const roles: Roles = { ...emptyRoles(), accent: 'primary' };
		const r = deriveScheme(designSystem, { roles, opacities: DEFAULT_OPACITIES });

		const scheme = schemeFromEvalResult(evaluate(designSystem), designSystem);
		const themeRoles = themeRolesFromScheme(scheme);
		const merged = { ...roles };
		for (const k of Object.keys(merged) as (keyof Roles)[]) {
			const dv = themeRoles[k];
			if (dv !== undefined && dv !== '') merged[k] = dv;
		}
		const effective = resolveRoles(scheme.entries, merged);

		expect(r.effectiveRoles).toEqual(effective);
		expect(r.themeVars).toBe(cssVars(scheme, effective, DEFAULT_OPACITIES));
	});

	test('theme() wins over a UI role override', () => {
		// design-system pins bg:"background" via theme(); an override must not win
		const r = deriveScheme(designSystem, {
			roles: { ...emptyRoles(), bg: 'primary' },
			opacities: DEFAULT_OPACITIES
		});
		expect(r.mergedRoles.bg).toBe('background');
	});
});

describe('purity: opacities flow through, nothing else leaks in', () => {
	test('opacities change the emitted vars', () => {
		const a = deriveScheme(designSystem, base);
		const b = deriveScheme(designSystem, {
			roles: emptyRoles(),
			opacities: { ...DEFAULT_OPACITIES, muted: 0.1 }
		});
		expect(a.themeVars).not.toBe(b.themeVars);
		expect(b.themeVars).toContain('--op-muted:0.1');
	});

	test('deterministic for a fixed (source, settings)', () => {
		const a = deriveScheme(designSystem, base);
		const b = deriveScheme(designSystem, base);
		expect(a.themeVars).toBe(b.themeVars);
		expect(a.namedColorVars).toBe(b.namedColorVars);
		expect(a.scheme.entries.map((e) => e.name)).toEqual(b.scheme.entries.map((e) => e.name));
	});
});
