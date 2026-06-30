/**
 * The shared scheme-derivation spine (CD-12 keystone).
 *
 * `deriveScheme` bundles the whole `source → EvalResult → Scheme → roles/audit/
 * tokens/components` cascade that used to live as inlined `$derived` getters in
 * `state/app.svelte.ts`. Pulling it into one pure function means the live store
 * and any headless caller (diff, versioning, light/dark re-rendering) run the
 * *same* code — the anti-drift cornerstone the roadmap depends on.
 *
 * It is pure over `{ source, settings }` and `settings` is deliberately the
 * minimal `{ roles, opacities }` — NOT the full per-doc `DocSettings`. `visionSim`
 * (CVD) and `fgOpacity` are presentation knobs applied *downstream* of the
 * canonical scheme; wiring them in here would change exported/audited colors.
 */
import { evaluate, type EvalResult } from '../dsl/evaluator.js';
import { schemeFromEvalResult } from './adapter.js';
import type { Scheme } from './types.js';
import { tokensFromScheme, buildTokenVars, type StyleTokens } from './tokens.js';
import {
	componentsFromScheme,
	auditPairsFromComponents,
	type NamedComponent
} from './components.js';
import {
	resolveRoles,
	cssVars,
	auditPairs,
	ROLE_KEYS,
	type Roles,
	type Opacities,
	type AuditPair
} from './roles.js';
import { themeRolesFromScheme } from './theme-config.js';
import {
	darkRolesFor,
	modeWarnings,
	modeFragilePairs,
	type ModeWarning,
	type ModeFragilePair
} from './modes.js';
import { kebab } from '../export/index.js';

/** The minimal inputs the derivation actually consumes (a subset of DocSettings). */
export interface DeriveSettings {
	roles: Roles;
	opacities: Opacities;
}

/** Everything the studio renders from one `{ source, settings }` pair. */
export interface RenderedScheme {
	result: EvalResult;
	scheme: Scheme;
	/** DSL `theme()` role mapping (authoritative; dropdowns fill the rest). */
	themeRoles: Partial<Roles>;
	/** theme() wins per role, then the UI override, then auto. */
	mergedRoles: Roles;
	/** Overrides collapsed onto the auto heuristic — dangling names self-heal. */
	effectiveRoles: Roles;
	themeVars: string;
	audit: AuditPair[];
	tokens: StyleTokens;
	tokenVars: string;
	namedColorVars: string;
	components: NamedComponent[];
	componentAudit: AuditPair[];

	// ── light/dark (CD-13 P1): dark = pure role re-binding ──
	/** A `theme.dark()` mapping exists in the source. */
	hasDarkTheme: boolean;
	/** Dark `theme.dark()` re-points (named colors). */
	darkThemeRoles: Partial<Roles>;
	/** Light roles re-pointed for dark; dangling/unspecified keep the light value. */
	darkEffectiveRoles: Roles;
	darkThemeVars: string;
	darkAudit: AuditPair[];
	darkComponentAudit: AuditPair[];
	/** "Require + warn" hints about the dark theme (dangling / inherited core roles). */
	modeWarnings: ModeWarning[];
	/** Pairs that fail their WCAG band in EITHER mode (worst-of-both). */
	modeFragile: ModeFragilePair[];
}

/** theme() wins per role, then the UI override, then auto (mirrors app.mergedRoles). */
function mergeRoles(roles: Roles, themeRoles: Partial<Roles>): Roles {
	const out = { ...roles };
	for (const k of ROLE_KEYS) {
		const dv = themeRoles[k];
		if (dv !== undefined && dv !== '') out[k] = dv;
	}
	return out;
}

/**
 * Derive the full rendered design system from source + the role/opacity settings.
 * A 1:1 extraction of the old `app.svelte.ts` `$derived` chain — pure, no I/O.
 */
export function deriveScheme(source: string, settings: DeriveSettings): RenderedScheme {
	const { roles, opacities } = settings;

	const result = evaluate(source);
	const scheme = schemeFromEvalResult(result, source);

	const themeRoles = themeRolesFromScheme(scheme);
	const mergedRoles = mergeRoles(roles, themeRoles);
	const effectiveRoles = resolveRoles(scheme.entries, mergedRoles);

	const themeVars = cssVars(scheme, effectiveRoles, opacities);
	const audit = auditPairs(scheme, effectiveRoles, opacities);

	const tokens = tokensFromScheme(scheme);
	const tokenVars = buildTokenVars(tokens);
	const namedColorVars = scheme.entries
		.map((e) => `--color-${kebab(e.name)}:${e.color.toCSS()}`)
		.join(';');

	const components = componentsFromScheme(scheme);
	const componentAudit = components.length
		? auditPairsFromComponents(scheme, effectiveRoles, opacities, tokens, components)
		: audit;

	// ── light/dark: re-bind roles, then re-run the SAME pure audit/cssVars ──
	const darkThemeRoles = themeRolesFromScheme(scheme, 'dark');
	const hasDarkTheme = Object.keys(darkThemeRoles).length > 0;
	const darkEffectiveRoles = darkRolesFor(scheme, effectiveRoles, darkThemeRoles);
	const darkThemeVars = cssVars(scheme, darkEffectiveRoles, opacities);
	const darkAudit = auditPairs(scheme, darkEffectiveRoles, opacities);
	// Mirror the components.length branch so light/dark audit lists align by label.
	const darkComponentAudit = components.length
		? auditPairsFromComponents(scheme, darkEffectiveRoles, opacities, tokens, components)
		: darkAudit;

	return {
		result,
		scheme,
		themeRoles,
		mergedRoles,
		effectiveRoles,
		themeVars,
		audit,
		tokens,
		tokenVars,
		namedColorVars,
		components,
		componentAudit,
		hasDarkTheme,
		darkThemeRoles,
		darkEffectiveRoles,
		darkThemeVars,
		darkAudit,
		darkComponentAudit,
		modeWarnings: modeWarnings(scheme, darkThemeRoles),
		modeFragile: modeFragilePairs(componentAudit, darkComponentAudit)
	};
}
