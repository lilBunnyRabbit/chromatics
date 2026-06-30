/**
 * The `theme(...)` builtin — maps named colors to theme roles from the DSL.
 * Accepts hyphen, camel or snake keys (`primary-fg` | `primaryFg` | `primary_fg`).
 */
import type { DSLValue, DSLFunction, PlainObject } from '../models/index.js';
import type { Roles } from '../scheme/roles.js';

const KEY_ALIASES: Record<string, keyof Roles> = {
	bg: 'bg',
	background: 'bg',
	fg: 'fg',
	foreground: 'fg',
	primary: 'primary',
	'primary-fg': 'primaryFg',
	primaryFg: 'primaryFg',
	primary_fg: 'primaryFg',
	secondary: 'secondary',
	'secondary-fg': 'secondaryFg',
	secondaryFg: 'secondaryFg',
	secondary_fg: 'secondaryFg',
	tertiary: 'tertiary',
	'tertiary-fg': 'tertiaryFg',
	tertiaryFg: 'tertiaryFg',
	tertiary_fg: 'tertiaryFg',
	accent: 'accent',
	'accent-fg': 'accentFg',
	accentFg: 'accentFg',
	accent_fg: 'accentFg',
	surface: 'surface',
	border: 'border'
};

/**
 * Build a theme config from `role → colorName` pairs, normalising the role key
 * (hyphen / camel / snake) and dropping anything that isn't a known role. Shared
 * by the `theme({…})` builtin and the `roles { … }` block so both agree.
 *
 * `mode` tags the descriptor so light and dark role maps can coexist without
 * colliding: undefined / 'light' is the base mapping, 'dark' is the dark
 * re-binding (`theme.dark({…})`).
 */
export function rolesConfig(
	entries: Iterable<[string, unknown]>,
	mode?: 'light' | 'dark'
): DSLValue {
	const roles: Partial<Record<keyof Roles, string>> = {};
	for (const [k, v] of entries) {
		const rk = KEY_ALIASES[k];
		if (rk && typeof v === 'string') roles[rk] = v;
	}
	return { __theme: true, ...(mode ? { mode } : {}), roles } as unknown as DSLValue;
}

const themeWith =
	(mode?: 'light' | 'dark') =>
	(...a: DSLValue[]): DSLValue => {
		const src = a[0];
		const cfg = src && typeof src === 'object' && !Array.isArray(src) ? (src as PlainObject) : {};
		return rolesConfig(Object.entries(cfg), mode);
	};

export const themeFn: DSLFunction = themeWith();
// Static members resolved by the evaluator's function-member path (like OKLCH.from):
// theme.light({…}) is the base mapping; theme.dark({…}) re-points roles for dark.
(themeFn as unknown as Record<string, DSLValue>).light = themeWith('light') as unknown as DSLValue;
(themeFn as unknown as Record<string, DSLValue>).dark = themeWith('dark') as unknown as DSLValue;

export const THEME_DOC =
	'theme({ bg, fg, primary, surface, primaryFg, … }) — map named colors to theme roles';

export const ROLES_DOC =
	'roles { primary = brand, bg = surface, … } — bind theme roles to your named colors';

/** Namespace members for the manifest (autocomplete + highlight + hover). */
export const THEME_SIGNATURES: Record<string, { sig: string; doc: string }> = {
	light: {
		sig: 'theme.light({ bg, fg, … })',
		doc: 'Role mapping for light mode (same as the bare theme()).'
	},
	dark: {
		sig: 'theme.dark({ bg, fg, … })',
		doc: 'Re-point roles for dark mode onto already-named colors. Assign it (dark = theme.dark({…})).'
	}
};
