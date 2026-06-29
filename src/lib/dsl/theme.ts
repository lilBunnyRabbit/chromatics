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

export const themeFn: DSLFunction = (...a) => {
	const src = a[0];
	const cfg = src && typeof src === 'object' && !Array.isArray(src) ? (src as PlainObject) : {};
	const roles: Partial<Record<keyof Roles, string>> = {};
	for (const [k, v] of Object.entries(cfg)) {
		const rk = KEY_ALIASES[k];
		if (rk && typeof v === 'string') roles[rk] = v;
	}
	return { __theme: true, roles } as unknown as DSLValue;
};

export const THEME_DOC =
	'theme({ bg, fg, primary, surface, primaryFg, … }) — map named colors to theme roles';
