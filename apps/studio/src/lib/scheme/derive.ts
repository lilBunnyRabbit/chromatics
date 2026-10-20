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
 * minimal `{ roles, darkRoles, opacities }` — NOT the full per-doc `DocSettings`. `visionSim`
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
	applyOverrides,
	cssVars,
	auditPairs,
	emptyRoles,
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
	/** Light-mode role overrides — `''` = auto, `NONE_ROLE` = off, a name = pinned. */
	roles: Roles;
	/** Dark-mode overrides, layered on the dark re-binding. Omit for "all auto". */
	darkRoles?: Roles;
	opacities: Opacities;
}

/** Everything the studio renders from one `{ source, settings }` pair. */
export interface RenderedScheme {
	result: EvalResult;
	scheme: Scheme;
	/** DSL `theme()` role mapping for light (what "auto" resolves through). */
	themeRoles: Partial<Roles>;
	/** The declared intent per role: the UI override if any, else theme(). */
	mergedRoles: Roles;
	/** What "auto" picks for light: theme() over the name heuristic, no overrides. */
	autoRoles: Roles;
	/** `autoRoles` with the UI overrides layered on top — the rendered light roles. */
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
	/** What "auto" picks for dark: light roles re-pointed by `theme.dark()`. */
	darkAutoRoles: Roles;
	/** `darkAutoRoles` with the dark UI overrides on top — the rendered dark roles. */
	darkEffectiveRoles: Roles;
	darkThemeVars: string;
	darkAudit: AuditPair[];
	darkComponentAudit: AuditPair[];
	/** "Require + warn" hints about the dark theme (dangling / inherited core roles). */
	modeWarnings: ModeWarning[];
	/** Pairs that fail their WCAG band in EITHER mode (worst-of-both). */
	modeFragile: ModeFragilePair[];
}

/**
 * The declared intent per role: an explicit UI override wins, otherwise the DSL
 * `theme()` binding, otherwise unset (`''` → the name heuristic downstream).
 *
 * The override deliberately comes FIRST. Authored roles are the default, not a
 * lock: "only auto takes colors from the role definitions", so a viewer can
 * always try another binding without rewriting the source.
 */
function mergeRoles(roles: Roles, themeRoles: Partial<Roles>): Roles {
	const out = { ...roles };
	for (const k of ROLE_KEYS) {
		if (out[k]) continue; // explicit pick (a name or NONE_ROLE) wins
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
	const darkRoles = settings.darkRoles ?? emptyRoles();

	const result = evaluate(source);
	const scheme = schemeFromEvalResult(result, source);

	const themeRoles = themeRolesFromScheme(scheme);
	const mergedRoles = mergeRoles(roles, themeRoles);
	// "Auto" = theme() over the name heuristic; the overrides then layer on top, so
	// the UI can always show what auto picked next to what the user pinned.
	const autoRoles = resolveRoles(scheme.entries, { ...emptyRoles(), ...themeRoles });
	const effectiveRoles = applyOverrides(scheme.entries, autoRoles, roles);

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
	const darkAutoRoles = darkRolesFor(scheme, effectiveRoles, darkThemeRoles);
	const darkEffectiveRoles = applyOverrides(scheme.entries, darkAutoRoles, darkRoles);
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
		autoRoles,
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
		darkAutoRoles,
		darkEffectiveRoles,
		darkThemeVars,
		darkAudit,
		darkComponentAudit,
		modeWarnings: modeWarnings(scheme, darkThemeRoles),
		modeFragile: modeFragilePairs(componentAudit, darkComponentAudit)
	};
}
