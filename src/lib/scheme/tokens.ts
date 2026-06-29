/**
 * Non-color design tokens — the second half of the design system, alongside the
 * color Scheme. A token group authored in the DSL (`scale.text(...)`, `token(...)`)
 * is a tagged plain object that rides `scheme.nonColorVars` exactly like a
 * `preview.*` descriptor; `tokensFromScheme` overlays every authored group onto
 * `DEFAULT_TOKENS` to produce one render-ready set. `buildTokenVars` emits it as
 * CSS custom properties, a sibling to `roles.cssVars`.
 *
 * The scale MATH lives here (pure, testable); `src/lib/dsl/tokens.ts` only wraps
 * these builders as DSL functions.
 */
import type { Scheme } from './types.js';

export type StringMap = Record<string, string>;
export type NumberMap = Record<string, number>;

/** The merged, render-ready token set consumed by the renderer + exporters. */
export interface StyleTokens {
	font: StringMap; // sans / serif / mono            → --font-*
	text: StringMap; // xs … 4xl (px)                  → --text-*
	weight: NumberMap; // regular / medium / …          → --weight-*
	leading: NumberMap; // tight / normal / relaxed      → --leading-*
	tracking: StringMap; // tight / normal / wide (em)    → --tracking-*
	space: StringMap; // 0 … n (px)                     → --space-*
	radius: StringMap; // sm / md / lg / full            → --radius-*
	border: StringMap; // hairline / thin / thick        → --bw-*
	shadow: StringMap; // sm / md / lg (box-shadow)      → --shadow-*
	z: NumberMap; // base / dropdown / modal / …    → --z-*
	duration: StringMap; // fast / base / slow            → --duration-*
	easing: StringMap; // standard / in / out            → --ease-*
	breakpoints: StringMap; // EXPORT ONLY (can't be a var in @media)
}

/** Family → CSS-var prefix. Shared by buildTokenVars and the ref resolver. */
export const TOKEN_VAR_PREFIX: Record<string, string> = {
	font: 'font',
	text: 'text',
	weight: 'weight',
	leading: 'leading',
	tracking: 'tracking',
	space: 'space',
	radius: 'radius',
	border: 'bw',
	shadow: 'shadow',
	z: 'z',
	duration: 'duration',
	easing: 'ease'
};

/** A token group authored in the DSL (parallels a `preview.*` descriptor). */
export interface TokenGroup {
	__token: string; // family key, e.g. 'text' | 'space' | 'radius'
	__unit?: string; // 'px' | 'rem' | 'em' | 'ms' | ''
	map: Record<string, string | number>;
}

export function isToken(v: unknown): v is TokenGroup {
	return (
		typeof v === 'object' &&
		v !== null &&
		!Array.isArray(v) &&
		typeof (v as Record<string, unknown>).__token === 'string' &&
		typeof (v as Record<string, unknown>).map === 'object'
	);
}

// ── scale math (pure builders, reused by DEFAULT_TOKENS and the DSL) ──

const round = (n: number) => Math.round(n * 100) / 100;

const TEXT_STEPS: [string, number][] = [
	['xs', -2],
	['sm', -1],
	['base', 0],
	['lg', 1],
	['xl', 2],
	['2xl', 3],
	['3xl', 4],
	['4xl', 5]
];

/** A modular type scale in px from a base size and ratio. */
export function textScale(base = 16, ratio = 1.25): StringMap {
	const out: StringMap = {};
	for (const [key, exp] of TEXT_STEPS) out[key] = `${round(base * ratio ** exp)}px`;
	return out;
}

const SPACE_STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24];

/** A linear spacing scale in px from a base step. */
export function spaceScale(base = 4): StringMap {
	const out: StringMap = {};
	for (const k of SPACE_STEPS) out[String(k)] = `${base * k}px`;
	return out;
}

/** A radius scale in px derived from one base (shadcn single-knob style). */
export function radiusScale(base = 8): StringMap {
	return {
		none: '0px',
		sm: `${round(base / 2)}px`,
		md: `${base}px`,
		lg: `${base * 2}px`,
		xl: `${base * 3}px`,
		full: '9999px'
	};
}

/** An elevation scale, optionally tinted by a color (hex/CSS string). */
export function shadowScale(tint = '#000'): StringMap {
	const mix = (pct: number) => `color-mix(in srgb, ${tint} ${pct}%, transparent)`;
	return {
		none: 'none',
		sm: `0 1px 2px ${mix(8)}`,
		md: `0 4px 12px ${mix(12)}`,
		lg: `0 12px 32px ${mix(16)}`,
		xl: `0 24px 60px ${mix(22)}`
	};
}

/** The full default design system — any color scheme renders against this. */
export const DEFAULT_TOKENS: StyleTokens = {
	font: {
		sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
		serif: 'Georgia, "Times New Roman", serif',
		mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
	},
	text: textScale(16, 1.25),
	weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
	leading: { none: 1, tight: 1.15, snug: 1.3, normal: 1.5, relaxed: 1.75 },
	tracking: {
		tighter: '-0.04em',
		tight: '-0.02em',
		normal: '0em',
		wide: '0.04em',
		wider: '0.08em'
	},
	space: spaceScale(4),
	radius: radiusScale(8),
	border: { none: '0px', hairline: '1px', thin: '2px', thick: '4px' },
	shadow: shadowScale('#000'),
	z: { base: 0, dropdown: 1000, sticky: 1100, overlay: 1200, modal: 1300, toast: 1400 },
	duration: { fast: '120ms', base: '200ms', slow: '320ms' },
	easing: {
		standard: 'cubic-bezier(.2,0,0,1)',
		in: 'cubic-bezier(.4,0,1,1)',
		out: 'cubic-bezier(0,0,.2,1)'
	},
	breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }
};

function cloneTokens(t: StyleTokens): StyleTokens {
	return JSON.parse(JSON.stringify(t)) as StyleTokens;
}

/** Overlay every authored TokenGroup onto DEFAULT_TOKENS (pure, O(n)). */
export function tokensFromScheme(scheme: Scheme): StyleTokens {
	const t = cloneTokens(DEFAULT_TOKENS);
	for (const v of scheme.nonColorVars) {
		const val = v.value;
		if (!isToken(val)) continue;
		const fam = val.__token;
		if (!(fam in t)) continue;
		const target = (t as unknown as Record<string, Record<string, string | number>>)[fam];
		const unit = val.__unit ?? '';
		for (const [k, raw] of Object.entries(val.map)) {
			target[k] = typeof raw === 'number' && unit ? `${raw}${unit}` : raw;
		}
	}
	return t;
}

/** `--text-*`, `--space-*`, `--radius-*`… declaration string (no `:root`). */
export function buildTokenVars(t: StyleTokens): string {
	const out: string[] = [];
	const add = (prefix: string, map: Record<string, string | number>) => {
		for (const [k, v] of Object.entries(map)) out.push(`--${prefix}-${k}:${v}`);
	};
	add('font', t.font);
	add('text', t.text);
	add('weight', t.weight);
	add('leading', t.leading);
	add('tracking', t.tracking);
	add('space', t.space);
	add('radius', t.radius);
	add('bw', t.border);
	add('shadow', t.shadow);
	add('z', t.z);
	add('duration', t.duration);
	add('ease', t.easing);
	return out.join(';');
}

/** Parse a text-token value ("16px") to a number for WCAG large-text checks. */
export function pxOf(value: string | undefined): number {
	if (!value) return 0;
	const m = /^(-?\d+(?:\.\d+)?)/.exec(value.trim());
	return m ? parseFloat(m[1]) : 0;
}
