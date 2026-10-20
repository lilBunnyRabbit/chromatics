/**
 * Light/dark as pure role re-binding (CD-13 P1). These lock the load-bearing
 * behaviour: theme.dark()/theme.light() tag the descriptor with a mode so the
 * aggregator separates them; dark re-binds onto light (dangling/unspecified
 * inherit light + warn); worst-of-both flags pairs that fail in either mode; and
 * the styleguide CSS export gains a `.dark` block.
 */
import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import { themeRolesFromScheme } from '../src/lib/scheme/theme-config';
import { deriveScheme } from '../src/lib/scheme/derive';
import { darkRolesFor, modeWarnings, modeFragilePairs } from '../src/lib/scheme/modes';
import { toStyleguideCss } from '../src/lib/export/styleguide';
import { tokensFromScheme } from '../src/lib/scheme/tokens';
import { componentsFromScheme } from '../src/lib/scheme/components';
import { emptyRoles, DEFAULT_OPACITIES, type AuditPair } from '../src/lib/scheme/roles';
import { manifest } from '../src/lib/dsl/manifest';

const SRC = `
bg = OKLCH(0.96, 0.01, 250)
fg = OKLCH(0.20, 0.02, 250)
primary = OKLCH(0.60, 0.15, 250)
bg_dark = OKLCH(0.18, 0.02, 250)
fg_dark = OKLCH(0.95, 0.01, 250)
light = theme({ bg: "bg", fg: "fg", primary: "primary" })
dark = theme.dark({ bg: "bg_dark", fg: "fg_dark" })
`;
const scheme = (src: string) => schemeFromEvalResult(evaluate(src), src);

describe('theme.dark()/theme.light() mode separation', () => {
	const s = scheme(SRC);

	test('evaluates without errors', () => {
		expect(evaluate(SRC).errors).toEqual([]);
	});

	test('light aggregator sees the base theme, not the dark one', () => {
		const light = themeRolesFromScheme(s, 'light');
		expect(light.bg).toBe('bg');
		expect(light.primary).toBe('primary');
		expect(light.fg).toBe('fg');
	});

	test('dark aggregator sees only theme.dark()', () => {
		const dark = themeRolesFromScheme(s, 'dark');
		expect(dark.bg).toBe('bg_dark');
		expect(dark.fg).toBe('fg_dark');
		expect(dark.primary).toBeUndefined(); // not re-pointed → inherits light
	});
});

describe('dark re-binding + warnings', () => {
	const r = deriveScheme(SRC, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });

	test('deriveScheme exposes a dark theme', () => {
		expect(r.hasDarkTheme).toBe(true);
	});

	test('dark roles re-point bg/fg, inherit primary from light', () => {
		expect(r.darkEffectiveRoles.bg).toBe('bg_dark');
		expect(r.darkEffectiveRoles.fg).toBe('fg_dark');
		expect(r.darkEffectiveRoles.primary).toBe(r.effectiveRoles.primary); // inherited
	});

	test('does NOT warn about intentionally-shared primary/accent', () => {
		expect(r.modeWarnings.some((w) => w.role === 'primary')).toBe(false);
		expect(r.modeWarnings.some((w) => w.role === 'accent')).toBe(false);
	});

	test('warns when a dark theme omits a surface role (e.g. surface)', () => {
		// SRC only re-points bg/fg in dark → surface + border inherit light
		expect(r.modeWarnings.some((w) => w.role === 'surface' && w.kind === 'inherited')).toBe(true);
		expect(r.modeWarnings.some((w) => w.role === 'border' && w.kind === 'inherited')).toBe(true);
	});

	test('a dangling dark target keeps the light value and warns', () => {
		const s2 = scheme(`${SRC}\nbad = theme.dark({ surface: "nope" })`);
		const lightEff = deriveScheme(`${SRC}\nbad = theme.dark({ surface: "nope" })`, {
			roles: emptyRoles(),
			opacities: DEFAULT_OPACITIES
		}).effectiveRoles;
		const darkThemeRoles = themeRolesFromScheme(s2, 'dark');
		const dark = darkRolesFor(s2, lightEff, darkThemeRoles);
		expect(dark.surface).toBe(lightEff.surface); // dangling → light value
		expect(modeWarnings(s2, darkThemeRoles).some((w) => w.kind === 'dangling')).toBe(true);
	});
});

describe('per-mode role overrides (the preview override seam)', () => {
	const derive = (roles = emptyRoles(), darkRoles = emptyRoles(), src = SRC) =>
		deriveScheme(src, { roles, darkRoles, opacities: DEFAULT_OPACITIES });

	test('a dark override wins over the theme.dark() re-point', () => {
		const r = derive(emptyRoles(), { ...emptyRoles(), bg: 'bg' });
		expect(r.darkAutoRoles.bg).toBe('bg_dark'); // what auto would have picked
		expect(r.darkEffectiveRoles.bg).toBe('bg'); // the explicit pick wins
	});

	test('light and dark overrides are independent', () => {
		const r = derive({ ...emptyRoles(), bg: 'primary' }, { ...emptyRoles(), fg: 'primary' });
		expect(r.effectiveRoles.bg).toBe('primary');
		expect(r.effectiveRoles.fg).toBe('fg'); // untouched by the dark override
		expect(r.darkEffectiveRoles.bg).toBe('bg_dark'); // dark re-point still applies
		expect(r.darkEffectiveRoles.fg).toBe('primary');
	});

	test('dark is previewable with NO dark theme authored', () => {
		const noDark = `
bg = OKLCH(0.96, 0.01, 250)
fg = OKLCH(0.20, 0.02, 250)
primary = OKLCH(0.60, 0.15, 250)
bg_dark = OKLCH(0.18, 0.02, 250)
roles {
  bg = bg
  fg = fg
  primary = primary
}`;
		const r = derive(emptyRoles(), { ...emptyRoles(), bg: 'bg_dark' }, noDark);
		expect(r.hasDarkTheme).toBe(false);
		expect(r.darkAutoRoles.bg).toBe('bg'); // inherits light...
		expect(r.darkEffectiveRoles.bg).toBe('bg_dark'); // ...until you override it
	});

	test('a dark role left on auto inherits the light override', () => {
		const r = derive({ ...emptyRoles(), primary: 'fg' });
		expect(r.darkEffectiveRoles.primary).toBe('fg');
	});
});

describe('modeFragilePairs (worst-of-both)', () => {
	const mk = (label: string, ratio: number): AuditPair => ({ label, fg: 'a', bg: 'b', ratio });

	test('flags a pair failing in either mode, passes when both pass', () => {
		const light = [mk('A', 8), mk('B', 2), mk('C', 9)];
		const dark = [mk('A', 2), mk('B', 9), mk('C', 8)];
		const fragile = modeFragilePairs(light, dark);
		const labels = fragile.map((p) => p.label).sort();
		expect(labels).toEqual(['A', 'B']); // A fails dark, B fails light, C passes both
	});
});

describe('dual-mode styleguide CSS', () => {
	const r = deriveScheme(SRC, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
	const s = scheme(SRC);
	const input = {
		scheme: s,
		tokens: tokensFromScheme(s),
		roles: r.effectiveRoles,
		opacities: DEFAULT_OPACITIES,
		components: componentsFromScheme(s)
	};

	test('no darkRoles → single :root, no .dark', () => {
		const css = toStyleguideCss(input);
		expect(css).toContain(':root {');
		expect(css).not.toContain('.dark {');
	});

	test('with darkRoles → emits a .dark block with the dark bg', () => {
		const css = toStyleguideCss({ ...input, darkRoles: r.darkEffectiveRoles });
		expect(css).toContain('.dark {');
		// the dark bg color differs from light → its value appears under .dark
		const darkBg = s.byName.get('bg_dark')!.color.toCSS();
		expect(css).toContain(`--bg:${darkBg}`);
	});
});

describe('manifest registers the theme namespace', () => {
	test('theme.light / theme.dark are autocomplete members', () => {
		const members = manifest.viewMembers.get('theme')?.map((m) => m.name) ?? [];
		expect(members).toContain('light');
		expect(members).toContain('dark');
		expect(manifest.methodNames.has('dark')).toBe(true);
	});
});

describe('block syntax: roles {} + nested/sibling light/dark', () => {
	const COLORS = `
bg = OKLCH(0.96, 0.01, 250)
fg = OKLCH(0.20, 0.02, 250)
primary = OKLCH(0.60, 0.15, 250)
bg_dark = OKLCH(0.18, 0.02, 250)
fg_dark = OKLCH(0.95, 0.01, 250)
`;

	test('legacy flat roles {} is unchanged — light base, no dark', () => {
		const src = `${COLORS}
roles {
  bg = bg
  fg = fg
  primary = primary
}`;
		expect(evaluate(src).errors).toEqual([]);
		const s = scheme(src);
		expect(themeRolesFromScheme(s, 'light')).toMatchObject({
			bg: 'bg',
			fg: 'fg',
			primary: 'primary'
		});
		expect(themeRolesFromScheme(s, 'dark')).toEqual({});
		expect(
			deriveScheme(src, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES }).hasDarkTheme
		).toBe(false);
	});

	test('nested dark {} inside roles {} → light base + dark re-bind', () => {
		const src = `${COLORS}
roles {
  bg = bg
  fg = fg
  primary = primary
  dark {
    bg = bg_dark
    fg = fg_dark
  }
}`;
		expect(evaluate(src).errors).toEqual([]);
		const s = scheme(src);
		expect(themeRolesFromScheme(s, 'light')).toMatchObject({ bg: 'bg', primary: 'primary' });
		expect(themeRolesFromScheme(s, 'dark')).toMatchObject({ bg: 'bg_dark', fg: 'fg_dark' });
		const r = deriveScheme(src, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
		expect(r.hasDarkTheme).toBe(true);
		expect(r.darkEffectiveRoles.bg).toBe('bg_dark');
		expect(r.darkEffectiveRoles.primary).toBe(r.effectiveRoles.primary); // inherited
	});

	test('top-level sibling dark {} block (append-safe) → dark re-bind', () => {
		const src = `${COLORS}
roles {
  bg = bg
  fg = fg
  primary = primary
}

dark {
  bg = bg_dark
  fg = fg_dark
}`;
		expect(evaluate(src).errors).toEqual([]);
		const s = scheme(src);
		expect(themeRolesFromScheme(s, 'dark')).toMatchObject({ bg: 'bg_dark', fg: 'fg_dark' });
		expect(themeRolesFromScheme(s, 'light')).toMatchObject({ bg: 'bg', primary: 'primary' });
	});

	test('function form theme.dark() still works (alias)', () => {
		const src = `${COLORS}
roles {
  bg = bg
  fg = fg
  primary = primary
}
d = theme.dark({ bg: "bg_dark", fg: "fg_dark" })`;
		expect(evaluate(src).errors).toEqual([]);
		expect(themeRolesFromScheme(scheme(src), 'dark')).toMatchObject({ bg: 'bg_dark' });
	});
});
