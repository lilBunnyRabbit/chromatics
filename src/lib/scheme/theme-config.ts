/**
 * `theme({...})` config — role mapping authored in the DSL. Like tokens and
 * components it rides `scheme.nonColorVars`, so a styleguide's role assignment
 * (which named color is bg / fg / primary / surface / the -fg pairs) travels with
 * the shareable `app.source` and is authoritative for the render, the audit and
 * the export at once. The Preview/Styleguide dropdowns remain a convenience that
 * fills only the roles `theme()` leaves unset.
 */
import type { Scheme } from './types.js';
import type { Roles } from './roles.js';

export interface ThemeConfig {
	__theme: true;
	roles: Partial<Record<keyof Roles, string>>;
}

export function isThemeConfig(v: unknown): v is ThemeConfig {
	return typeof v === 'object' && v !== null && (v as Record<string, unknown>).__theme === true;
}

/** Merge every `theme()` descriptor's role overrides (later calls win). */
export function themeRolesFromScheme(scheme: Scheme): Partial<Record<keyof Roles, string>> {
	const out: Partial<Record<keyof Roles, string>> = {};
	for (const v of scheme.nonColorVars) {
		if (isThemeConfig(v.value)) Object.assign(out, (v.value as ThemeConfig).roles);
	}
	return out;
}
