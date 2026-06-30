/**
 * `theme({...})` config — role mapping authored in the DSL. Like tokens and
 * components it rides `scheme.nonColorVars`, so a styleguide's role assignment
 * (which named color is bg / fg / primary / surface / the -fg pairs) travels with
 * the shareable `app.source` and is authoritative for the render, the audit and
 * the export at once. The Preview/Styleguide dropdowns remain a convenience that
 * fills only the roles `theme()` leaves unset.
 *
 * A descriptor carries an optional `mode`: the bare `theme({…})` and
 * `theme.light({…})` are the light mapping; `theme.dark({…})` is the dark
 * mapping. `themeRolesFromScheme(scheme, mode)` merges only the matching mode, so
 * light and dark never clobber each other.
 */
import type { Scheme } from './types.js';
import type { Roles } from './roles.js';

export interface ThemeConfig {
	__theme: true;
	/** Undefined = light (the base mapping). */
	mode?: 'light' | 'dark';
	roles: Partial<Record<keyof Roles, string>>;
}

export function isThemeConfig(v: unknown): v is ThemeConfig {
	return typeof v === 'object' && v !== null && (v as Record<string, unknown>).__theme === true;
}

/**
 * Merge every `theme()` descriptor's role overrides for one mode (later calls
 * win). A descriptor with no `mode` counts as light.
 */
export function themeRolesFromScheme(
	scheme: Scheme,
	mode: 'light' | 'dark' = 'light'
): Partial<Record<keyof Roles, string>> {
	const out: Partial<Record<keyof Roles, string>> = {};
	for (const v of scheme.nonColorVars) {
		if (!isThemeConfig(v.value)) continue;
		const cfg = v.value as ThemeConfig;
		if ((cfg.mode ?? 'light') !== mode) continue;
		Object.assign(out, cfg.roles);
	}
	return out;
}
