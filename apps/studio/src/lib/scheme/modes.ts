/**
 * Light/dark as pure role re-binding (CD-13 P1). Dark mode does NOT fork the
 * scheme — it re-points roles onto already-named colors and re-resolves through
 * the SAME `cssVars`/`auditPairs`. This module is the thin glue:
 *
 *  - `darkRolesFor`     — light effective roles, overlaid with the dark `theme.dark()`
 *                         re-points (dangling targets keep the light value so dark
 *                         never renders empty).
 *  - `modeWarnings`     — "require + warn": flag dark targets that name a missing
 *                         color, and the load-bearing roles dark inherits from light.
 *  - `modeFragilePairs` — pairs that fail their WCAG band in EITHER mode
 *                         (worst-of-both), zipped by label.
 */
import type { Scheme } from './types.js';
import { ROLE_KEYS, type Roles, type AuditPair } from './roles.js';
import { wcagLevels, type WcagLevel } from '../analysis/wcag.js';

/**
 * Surfaces/text a real dark theme must re-point (primary/accent intentionally
 * stay shared, so they're NOT flagged). Inheriting any of these from light is the
 * common footgun — e.g. a light surface left on a dark background.
 */
const CORE_ROLES: (keyof Roles)[] = ['bg', 'fg', 'surface', 'border'];

/**
 * Dark effective roles = light effective roles re-pointed by valid `theme.dark()`
 * targets. An unspecified or dangling dark role keeps its light value.
 */
export function darkRolesFor(
	scheme: Scheme,
	lightEffective: Roles,
	darkThemeRoles: Partial<Record<keyof Roles, string>>
): Roles {
	const out = { ...lightEffective };
	for (const k of ROLE_KEYS) {
		const target = darkThemeRoles[k];
		if (target && scheme.byName.has(target)) out[k] = target;
	}
	return out;
}

export interface ModeWarning {
	role: keyof Roles;
	kind: 'dangling' | 'inherited';
	message: string;
}

/**
 * "Require + warn": surface (a) dark targets that name a non-existent color, and
 * (b) core roles (bg/fg/primary) the dark theme leaves to inherit from light.
 * Only meaningful once a dark theme is authored.
 */
export function modeWarnings(
	scheme: Scheme,
	darkThemeRoles: Partial<Record<keyof Roles, string>>
): ModeWarning[] {
	if (Object.keys(darkThemeRoles).length === 0) return [];
	const out: ModeWarning[] = [];
	for (const k of ROLE_KEYS) {
		const target = darkThemeRoles[k];
		if (target && !scheme.byName.has(target)) {
			out.push({
				role: k,
				kind: 'dangling',
				message: `dark ${k} → "${target}" is not a defined color (inheriting light)`
			});
		}
	}
	for (const k of CORE_ROLES) {
		const target = darkThemeRoles[k];
		if (!target || !scheme.byName.has(target)) {
			out.push({
				role: k,
				kind: 'inherited',
				message: `dark mode has no dark ${k} — set one in the dark { … } block for a real dark theme`
			});
		}
	}
	return out;
}

export interface ModeFragilePair {
	label: string;
	lightRatio: number;
	darkRatio: number;
	lightLevel: WcagLevel;
	darkLevel: WcagLevel;
}

const levelOf = (p: AuditPair): WcagLevel =>
	p.large ? wcagLevels(p.ratio).large : wcagLevels(p.ratio).normal;

/**
 * Pairs that fail in EITHER mode — worst-of-both. Zipped by label (the only join
 * key); bands are recomputed per ratio respecting the large-text flag, since a
 * lower ratio is not the same as a worse band when `large` differs.
 */
export function modeFragilePairs(light: AuditPair[], dark: AuditPair[]): ModeFragilePair[] {
	const darkByLabel = new Map(dark.map((p) => [p.label, p]));
	const out: ModeFragilePair[] = [];
	for (const lp of light) {
		const dp = darkByLabel.get(lp.label);
		if (!dp) continue;
		const lightLevel = levelOf(lp);
		const darkLevel = levelOf(dp);
		if (lightLevel === 'Fail' || darkLevel === 'Fail') {
			out.push({
				label: lp.label,
				lightRatio: lp.ratio,
				darkRatio: dp.ratio,
				lightLevel,
				darkLevel
			});
		}
	}
	return out;
}
