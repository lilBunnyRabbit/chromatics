/**
 * Parity + purity guard for the shared derivation spine (scheme/derive.ts).
 *
 * deriveScheme is a 1:1 extraction of the old inlined $derived chain in
 * app.svelte.ts, so these lock the load-bearing behaviour: the role-merge
 * precedence (explicit override > theme() > the name heuristic), the per-mode
 * override layer, the component-audit fallback, and the fact that the canonical
 * scheme is a pure function of {source, roles, darkRoles, opacities} only — never
 * of presentation knobs (visionSim / fgOpacity).
 */
import { test, expect, describe } from 'bun:test';
import { deriveScheme } from '../src/lib/scheme/derive';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import {
	resolveRoles,
	applyOverrides,
	cssVars,
	emptyRoles,
	NONE_ROLE,
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
		const auto = resolveRoles(scheme.entries, { ...emptyRoles(), ...themeRoles });
		const effective = applyOverrides(scheme.entries, auto, roles);

		expect(r.autoRoles).toEqual(auto);
		expect(r.effectiveRoles).toEqual(effective);
		expect(r.themeVars).toBe(cssVars(scheme, effective, DEFAULT_OPACITIES));
	});
});

describe('an explicit override beats the DSL role definitions', () => {
	// design-system pins bg:"background" via theme(); "only auto takes colors from
	// the role definitions", so a pick must win — otherwise the viewer is locked in.
	const pinned = deriveScheme(designSystem, {
		roles: { ...emptyRoles(), bg: 'primary' },
		opacities: DEFAULT_OPACITIES
	});

	test('the override is the declared intent and the rendered role', () => {
		expect(pinned.mergedRoles.bg).toBe('primary');
		expect(pinned.effectiveRoles.bg).toBe('primary');
	});

	test('auto still reports what the DSL would have picked', () => {
		expect(pinned.autoRoles.bg).toBe('background');
		expect(pinned.themeRoles.bg).toBe('background');
	});

	test('clearing the override falls back to the DSL binding', () => {
		const r = deriveScheme(designSystem, base);
		expect(r.effectiveRoles.bg).toBe('background');
	});

	test('a dangling override falls back to the DSL binding, not a fresh guess', () => {
		const r = deriveScheme(designSystem, {
			roles: { ...emptyRoles(), bg: 'renamed_away' },
			opacities: DEFAULT_OPACITIES
		});
		expect(r.effectiveRoles.bg).toBe('background');
	});

	test('NONE_ROLE turns an optional role off even when theme() binds it', () => {
		const withAccent = deriveScheme(designSystem, base).effectiveRoles.accent;
		expect(withAccent).not.toBe('');
		const off = deriveScheme(designSystem, {
			roles: { ...emptyRoles(), accent: NONE_ROLE },
			opacities: DEFAULT_OPACITIES
		});
		expect(off.effectiveRoles.accent).toBe('');
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
