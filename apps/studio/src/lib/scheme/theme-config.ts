/**
 * The studio's reading of a program's role mappings (`roles {}`, `light {}`, `dark {}`, `theme({…})`).
 * The package keeps keys as written; the studio accepts hyphen, camel and snake spellings of its 12 roles
 * (`primary-fg` | `primaryFg` | `primary_fg`) plus `background` / `foreground`, and folds them onto `Roles`.
 * `STUDIO_ROLE_NAMES` is what the studio declares to `deriveScheme`, so any other key is an error.
 */
import { isThemeConfig } from '@lilbunnyrabbit/chromatics-dsl/scheme';
import type { Scheme } from './types.js';
import type { Roles } from './roles.js';

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

/** Every role key a studio program may write. */
export const STUDIO_ROLE_NAMES: readonly string[] = Object.keys(KEY_ALIASES);

/**
 * Merge every role mapping for one mode (later lines win), keys folded onto `Roles`. A mapping with no
 * `mode` counts as light. Targets are names and may dangle; callers check them against the scheme.
 */
export function themeRolesFromScheme(
	scheme: Scheme,
	mode: 'light' | 'dark' = 'light'
): Partial<Record<keyof Roles, string>> {
	const out: Partial<Record<keyof Roles, string>> = {};
	for (const v of scheme.nonColorVars) {
		if (!isThemeConfig(v.value) || (v.value.mode ?? 'light') !== mode) continue;
		for (const [key, name] of Object.entries(v.value.roles)) {
			const role = KEY_ALIASES[key];
			if (role) out[role] = name;
		}
	}
	return out;
}
