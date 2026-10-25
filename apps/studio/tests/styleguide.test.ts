import { test, expect, describe } from 'bun:test';
import { evaluate } from '../src/lib/dsl/evaluator';
import { schemeFromEvalResult } from '../src/lib/scheme/adapter';
import { tokensFromScheme, buildTokenVars, isToken } from '../src/lib/scheme/tokens';
import {
	componentsFromScheme,
	auditPairsFromComponents,
	type ButtonSpec
} from '../src/lib/scheme/components';
import { themeRolesFromScheme } from '../src/lib/scheme/theme-config';
import { resolveRoles, emptyRoles, DEFAULT_OPACITIES } from '../src/lib/scheme/roles';
import { resolveRef, resolveColor, refAlpha, type ResolveCtx } from '../src/lib/render/resolve';
import { toStyleguideCss, toStyleguideHtml } from '../src/lib/export/styleguide';
import { source as designSystem } from '../src/routes/examples/design-system';

function build(src: string) {
	const scheme = schemeFromEvalResult(evaluate(src), src);
	const tokens = tokensFromScheme(scheme);
	const themeRoles = themeRolesFromScheme(scheme);
	const roles = resolveRoles(scheme.entries, { ...emptyRoles(), ...themeRoles });
	const components = componentsFromScheme(scheme);
	const ctx: ResolveCtx = { tokens, scheme, roles };
	return { scheme, tokens, themeRoles, roles, components, ctx };
}

describe('design-system example', () => {
	const r = evaluate(designSystem);
	test('evaluates with zero errors', () => {
		expect(r.errors).toEqual([]);
	});

	const { scheme, tokens, themeRoles, roles, components } = build(designSystem);

	test('produces token groups in nonColorVars', () => {
		const textVar = scheme.nonColorVars.find((v) => v.name === 'text');
		expect(textVar && isToken(textVar.value)).toBe(true);
		expect(tokens.text.base).toBe('16px');
		expect(tokens.radius.md).toBe('10px');
		expect(tokens.space['4']).toBe('16px');
	});

	test('theme() maps roles, including the -fg pairs', () => {
		expect(themeRoles.primary).toBe('primary');
		expect(themeRoles.primaryFg).toBe('primary_fg');
		expect(roles.primary).toBe('primary');
		expect(roles.primaryFg).toBe('primary_fg');
	});

	test('picks up the three components', () => {
		expect(components.map((c) => c.spec.__component).sort()).toEqual(['button', 'card', 'type']);
		const button = components.find((c) => c.spec.__component === 'button')!.spec as ButtonSpec;
		expect(button.variants).toHaveLength(4);
		expect(button.sizes).toHaveLength(3);
	});

	test('bare token steps expand to their family; colors stay as-is', () => {
		const button = components.find((c) => c.spec.__component === 'button')!.spec as ButtonSpec;
		expect(button.sizes[0].text).toBe('text.sm'); // "sm" → text.sm
		expect(button.sizes[0].padX).toBe('space.3'); // "3"  → space.3
		expect(button.variants[2].bg).toBe('primary/15'); // color field untouched
		const card = components.find((c) => c.spec.__component === 'card')!.spec;
		if (card.__component === 'card') {
			expect(card.radius).toBe('radius.lg'); // "lg" → radius.lg
			expect(card.pad).toBe('space.6'); // "6"  → space.6
			expect(card.shadow).toBe('shadow.md'); // "md" → shadow.md
		}
	});
});

describe('resolveRef', () => {
	const { ctx } = build(designSystem);
	test('roles → role var', () => {
		expect(resolveRef('primary', ctx)).toEqual({ kind: 'role', css: 'var(--primary)' });
		expect(resolveRef('primary-fg', ctx)).toEqual({ kind: 'role', css: 'var(--primary-fg)' });
	});
	test('tokens → token var', () => {
		expect(resolveRef('space.4', ctx)).toEqual({ kind: 'token', css: 'var(--space-4)' });
		expect(resolveRef('text.lg', ctx)).toEqual({ kind: 'token', css: 'var(--text-lg)' });
	});
	test('named color → namespaced color var', () => {
		expect(resolveRef('primary_fg', ctx)).toEqual({
			kind: 'named',
			css: 'var(--color-primary-fg)'
		});
	});
	test('css literal passes through', () => {
		expect(resolveRef('16px', ctx).kind).toBe('literal');
		expect(resolveRef('#fff', ctx).kind).toBe('literal');
	});
	test('garbage is unresolved (not thrown)', () => {
		expect(resolveRef('nope.zzz', ctx).kind).toBe('unresolved');
		expect(resolveRef('mystery', ctx).kind).toBe('unresolved');
	});

	test('opacity suffix → color-mix (primary/30, fg/muted)', () => {
		const a = resolveRef('primary/30', ctx);
		expect(a.kind).toBe('role');
		expect(a.css).toBe('color-mix(in srgb, var(--primary) 30%, transparent)');
		const b = resolveRef('fg/muted', ctx);
		expect(b.css).toBe('color-mix(in srgb, var(--fg) calc(var(--op-muted) * 100%), transparent)');
	});
});

describe('refAlpha', () => {
	test('numeric and named opacity modifiers', () => {
		expect(refAlpha('primary/30')).toBe(0.3);
		expect(refAlpha('primary')).toBeNull();
		expect(refAlpha('fg/muted', DEFAULT_OPACITIES)).toBe(DEFAULT_OPACITIES.muted);
	});
});

describe('resolveColor (for the audit)', () => {
	const { ctx } = build(designSystem);
	test('resolves role and named refs to colors', () => {
		expect(resolveColor('primary', ctx)).not.toBeNull();
		expect(resolveColor('primary-fg', ctx)).not.toBeNull();
		expect(resolveColor('primary_fg', ctx)).not.toBeNull();
	});
	test('returns null for non-color refs', () => {
		expect(resolveColor('space.4', ctx)).toBeNull();
		expect(resolveColor('mystery', ctx)).toBeNull();
	});
});

describe('auditPairsFromComponents', () => {
	const { scheme, tokens, roles, components } = build(designSystem);
	const audit = auditPairsFromComponents(scheme, roles, DEFAULT_OPACITIES, tokens, components);

	test('grades the real components with finite ratios', () => {
		expect(audit.length).toBeGreaterThan(0);
		for (const a of audit) {
			expect(Number.isFinite(a.ratio)).toBe(true);
			expect(a.ratio).toBeGreaterThanOrEqual(1);
		}
	});
	test('computes WCAG large-text from the type tokens', () => {
		// the type ramp's "Display heading" is text.3xl → large
		expect(audit.some((a) => a.large === true)).toBe(true);
	});
});

describe('token vars', () => {
	const { tokens } = build(designSystem);
	const vars = buildTokenVars(tokens);
	test('emits text/space/radius custom properties', () => {
		expect(vars).toContain('--text-base:16px');
		expect(vars).toContain('--space-4:16px');
		expect(vars).toContain('--radius-md:10px');
	});
});

describe('styleguide export', () => {
	const { scheme, tokens, roles, components } = build(designSystem);
	const input = { scheme, tokens, roles, opacities: DEFAULT_OPACITIES, components };

	test('CSS has :root vars + component utility classes', () => {
		const css = toStyleguideCss(input);
		expect(css).toContain(':root {');
		expect(css).toContain('--primary:');
		expect(css).toContain('--space-4:16px');
		expect(css).toContain('--color-primary-fg:');
		expect(css).toContain('.button {');
		expect(css).toContain('.button--primary {');
		expect(css).toContain('.button--md {');
	});

	test('HTML is a self-contained page embedding the CSS', () => {
		const html = toStyleguideHtml(input);
		expect(html.startsWith('<!doctype html>')).toBe(true);
		expect(html).toContain(':root {');
		expect(html).toContain('class="button');
	});
});
