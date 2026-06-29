/**
 * The one resolver the renderer, the exporters, and the accessibility audit all
 * call, so they can never disagree about what a reference means. Every binding in
 * a component spec is a late-resolved STRING:
 *
 *   "primary" | "surface" | "primary-fg"   → a color ROLE   → var(--primary)
 *   "brand"   (a scheme entry name)        → a NAMED color  → var(--brand)
 *   "space.4" | "radius.md" | "text.lg"    → a TOKEN        → var(--space-4)
 *   "16px" | "#fff" | "1px solid"          → a CSS LITERAL  → passthrough
 *   anything else                          → UNRESOLVED     → visible badge
 *
 * `resolveRef` is for rendering/markup (returns a `var(...)`/literal CSS value).
 * `resolveColor` returns the actual ColorValue a color ref points at, for the
 * contrast audit. Both share the same role-fallback chain as `roles.cssVars`.
 */
import type { Scheme } from '../scheme/types.js';
import type { StyleTokens } from '../scheme/tokens.js';
import { TOKEN_VAR_PREFIX, pxOf } from '../scheme/tokens.js';
import type { Roles, Opacities } from '../scheme/roles.js';
import { ColorValue, hex } from '../models/index.js';
import { kebab } from '../export/index.js';

export interface ResolveCtx {
	tokens: StyleTokens;
	scheme: Scheme;
	roles: Roles; // effective (resolved) roles — names
}

export type RefKind = 'role' | 'token' | 'named' | 'literal' | 'unresolved';
export interface Resolved {
	kind: RefKind;
	/** CSS value to drop into a style (`var(--x)` or a literal). */
	css: string;
}

/** Role keyword → { roles key, emitted var, fallback ref } — mirrors cssVars. */
const ROLE_OF: Record<string, { key: keyof Roles; varName: string; fallback?: string }> = {
	bg: { key: 'bg', varName: '--bg' },
	fg: { key: 'fg', varName: '--fg' },
	primary: { key: 'primary', varName: '--primary' },
	'primary-fg': { key: 'primaryFg', varName: '--primary-fg', fallback: 'fg' },
	secondary: { key: 'secondary', varName: '--secondary', fallback: 'primary' },
	'secondary-fg': { key: 'secondaryFg', varName: '--secondary-fg', fallback: 'fg' },
	tertiary: { key: 'tertiary', varName: '--tertiary', fallback: 'secondary' },
	'tertiary-fg': { key: 'tertiaryFg', varName: '--tertiary-fg', fallback: 'fg' },
	accent: { key: 'accent', varName: '--accent', fallback: 'primary' },
	'accent-fg': { key: 'accentFg', varName: '--accent-fg', fallback: 'fg' },
	surface: { key: 'surface', varName: '--surface', fallback: 'bg' },
	'surface-fg': { key: 'fg', varName: '--surface-fg' },
	border: { key: 'border', varName: '--border', fallback: 'fg' }
};

export function isRole(ref: string): boolean {
	return ref in ROLE_OF;
}

function isCssLiteral(s: string): boolean {
	if (/^#|^\d|[()]/.test(s)) return true;
	if (/\b(px|rem|em|%|vh|vw|ch|fr)\b/.test(s)) return true;
	return ['transparent', 'currentcolor', 'inherit', 'none', 'unset', 'initial'].includes(
		s.toLowerCase()
	);
}

/** A trailing opacity modifier: `primary/30` (percent) or `fg/muted` (named). */
const ALPHA_RE = /^([A-Za-z][\w.-]*?)\/(\d{1,3}|muted|disabled|hover|active)$/;
const OP_NAMES = ['muted', 'disabled', 'hover', 'active'];

function splitAlpha(ref: string): { base: string; mod: string | null } {
	const m = ALPHA_RE.exec(ref);
	return m ? { base: m[1], mod: m[2] } : { base: ref, mod: null };
}

function resolveBase(ref: string, ctx: ResolveCtx): Resolved {
	if (ref === '') return { kind: 'unresolved', css: 'transparent' };

	const dot = ref.indexOf('.');
	if (dot > 0) {
		const fam = ref.slice(0, dot);
		const step = ref.slice(dot + 1);
		const prefix = TOKEN_VAR_PREFIX[fam];
		const map = (ctx.tokens as unknown as Record<string, Record<string, unknown>>)[fam];
		if (prefix && map && step in map) return { kind: 'token', css: `var(--${prefix}-${step})` };
		return { kind: 'unresolved', css: 'transparent' };
	}

	const role = ROLE_OF[ref];
	if (role) return { kind: 'role', css: `var(${role.varName})` };

	if (ctx.scheme.byName.has(ref)) return { kind: 'named', css: `var(--color-${kebab(ref)})` };

	if (isCssLiteral(ref)) return { kind: 'literal', css: ref };

	return { kind: 'unresolved', css: 'transparent' };
}

/**
 * Resolve a ref to a CSS value for markup/exports. A trailing `/<n>` or
 * `/<opacity-name>` applies opacity to a color ref (Tailwind-style): `primary/30`
 * → 30%, `fg/muted` → the live `--op-muted`.
 */
export function resolveRef(ref: unknown, ctx: ResolveCtx): Resolved {
	if (typeof ref !== 'string' || ref === '') return { kind: 'unresolved', css: 'transparent' };
	const { base, mod } = splitAlpha(ref);
	const res = resolveBase(base, ctx);
	if (mod && (res.kind === 'role' || res.kind === 'named' || res.kind === 'literal')) {
		const pct = OP_NAMES.includes(mod)
			? `calc(var(--op-${mod}) * 100%)`
			: `${Math.min(100, Number(mod))}%`;
		return { kind: res.kind, css: `color-mix(in srgb, ${res.css} ${pct}, transparent)` };
	}
	return res;
}

/** The opacity a ref's `/modifier` implies, if any (0–1). */
export function refAlpha(ref: unknown, opacities?: Opacities): number | null {
	if (typeof ref !== 'string') return null;
	const { mod } = splitAlpha(ref);
	if (!mod) return null;
	if (OP_NAMES.includes(mod)) return opacities ? (opacities[mod as keyof Opacities] ?? null) : null;
	return Math.max(0, Math.min(1, Number(mod) / 100));
}

function roleColor(ref: string, ctx: ResolveCtx, depth = 0): ColorValue | null {
	const def = ROLE_OF[ref];
	if (!def || depth > 5) return null;
	const name = ctx.roles[def.key];
	const e = name ? ctx.scheme.byName.get(name) : undefined;
	if (e) return e.color;
	return def.fallback ? roleColor(def.fallback, ctx, depth + 1) : null;
}

/** The actual (opaque) color a color-ref points at — for the contrast audit. */
export function resolveColor(ref: unknown, ctx: ResolveCtx): ColorValue | null {
	if (typeof ref !== 'string' || !ref) return null;
	const { base } = splitAlpha(ref);
	if (ROLE_OF[base]) return roleColor(base, ctx);
	const e = ctx.scheme.byName.get(base);
	if (e) return e.color;
	if (/^#|^(rgb|hsl|oklch|oklab|lab|lch|hwb|color)\(/i.test(base)) {
		try {
			return hex(base);
		} catch {
			return null;
		}
	}
	return null;
}

/** A text-size ref → px (for the WCAG large-text threshold). */
export function resolveTextPx(ref: unknown, ctx: ResolveCtx): number {
	if (typeof ref === 'string') {
		if (ref.startsWith('text.')) return pxOf(ctx.tokens.text[ref.slice(5)]);
		if (/^\d/.test(ref)) return pxOf(ref);
	}
	return 16;
}

/** A weight ref → numeric weight (for the WCAG large-text threshold). */
export function resolveWeight(ref: unknown, ctx: ResolveCtx): number {
	if (typeof ref === 'string' && ref.startsWith('weight.'))
		return ctx.tokens.weight[ref.slice(7)] ?? 400;
	const n = Number(ref);
	return Number.isFinite(n) ? n : 400;
}

/** WCAG "large text": ≥24px, or ≥18.66px and bold. */
export function isLargeText(px: number, weight: number): boolean {
	return px >= 24 || (px >= 18.66 && weight >= 700);
}
