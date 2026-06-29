/**
 * Component specs — the third layer of the design system (colors → tokens →
 * components). A spec is a tagged plain object authored via `component.*` in the
 * DSL; like tokens and previews it rides `scheme.nonColorVars`. Every color/size
 * field is a late-resolved Ref string (see ../render/resolve).
 *
 * `auditPairsFromComponents` is the payoff: it grades the user's ACTUAL
 * components (every variant/size/state) through the same role-fallback chain and
 * contrast math as the fixed audit — with WCAG large-text COMPUTED from the type
 * tokens, which the 21 hardcoded pairs can only ever guess.
 */
import type { Scheme } from './types.js';
import type { Roles, Opacities, AuditPair } from './roles.js';
import type { StyleTokens } from './tokens.js';
import {
	resolveColor,
	resolveTextPx,
	resolveWeight,
	refAlpha,
	isLargeText,
	type ResolveCtx
} from '../render/resolve.js';
import { contrastRatio, contrastRatioAlpha } from '../analysis/contrast.js';

export type Ref = string;

export interface ButtonVariant {
	name: string;
	bg: Ref;
	fg: Ref;
	border?: Ref;
}
export interface ButtonSize {
	name: string;
	padY: Ref;
	padX: Ref;
	text: Ref;
	radius?: Ref;
	weight?: Ref;
}
export interface ButtonSpec {
	__component: 'button';
	variants: ButtonVariant[];
	sizes: ButtonSize[];
	states: string[];
}

export interface CardSpec {
	__component: 'card';
	bg: Ref;
	fg: Ref;
	border?: Ref;
	radius: Ref;
	pad: Ref;
	shadow?: Ref;
	title?: string;
}

export interface TypeStep {
	text: Ref;
	weight?: Ref;
	leading?: Ref;
	sample?: string;
}
export interface TypeSpec {
	__component: 'type';
	steps: TypeStep[];
}

export type ComponentSpec = ButtonSpec | CardSpec | TypeSpec;
export interface NamedComponent {
	name: string;
	spec: ComponentSpec;
}

const KINDS = new Set(['button', 'card', 'type']);

export function isComponent(v: unknown): v is ComponentSpec {
	return (
		typeof v === 'object' &&
		v !== null &&
		!Array.isArray(v) &&
		KINDS.has((v as Record<string, unknown>).__component as string)
	);
}

export function componentsFromScheme(scheme: Scheme): NamedComponent[] {
	return scheme.nonColorVars
		.filter((v) => isComponent(v.value))
		.map((v) => ({ name: v.name, spec: v.value as unknown as ComponentSpec }));
}

/** Contrast audit derived from the user's actual components. */
export function auditPairsFromComponents(
	scheme: Scheme,
	roles: Roles,
	op: Opacities,
	tokens: StyleTokens,
	components: NamedComponent[]
): AuditPair[] {
	const ctx: ResolveCtx = { tokens, scheme, roles };
	const pairs: AuditPair[] = [];
	const seen = new Set<string>();

	const add = (label: string, fgRef: Ref, bgRef: Ref, alpha?: number, large?: boolean) => {
		const fg = resolveColor(fgRef, ctx);
		const bg = resolveColor(bgRef, ctx);
		if (!fg || !bg) return;
		// Combine an explicit state alpha (e.g. disabled) with any /opacity on the ref.
		const ra = refAlpha(fgRef, op);
		const eff = alpha != null && ra != null ? alpha * ra : (alpha ?? ra ?? null);
		const key = `${fgRef}|${bgRef}|${eff ?? 1}|${large ? 1 : 0}`;
		if (seen.has(key)) return;
		seen.add(key);
		const ratio = eff != null ? contrastRatioAlpha(fg, bg, eff) : contrastRatio(fg, bg);
		pairs.push({
			label,
			fg: String(fgRef) + (alpha != null ? ` @${alpha}` : ''),
			bg: String(bgRef),
			ratio,
			large
		});
	};

	for (const { name, spec } of components) {
		if (spec.__component === 'button') {
			const hasDisabled = spec.states.includes('disabled');
			for (const v of spec.variants) {
				for (const s of spec.sizes) {
					const px = resolveTextPx(s.text, ctx);
					const weight = resolveWeight(s.weight ?? 'weight.semibold', ctx);
					const large = isLargeText(px, weight);
					add(`${name} · ${v.name}/${s.name}`, v.fg, v.bg, undefined, large);
				}
				if (v.border) add(`${name} · ${v.name} border`, v.border, v.bg, undefined, true);
				if (hasDisabled) add(`${name} · ${v.name} disabled`, v.fg, v.bg, op.disabled, true);
			}
		} else if (spec.__component === 'card') {
			add(`${name} · body`, spec.fg, spec.bg);
			if (spec.border) add(`${name} · border`, spec.border, spec.bg, undefined, true);
		} else if (spec.__component === 'type') {
			spec.steps.forEach((step, i) => {
				const px = resolveTextPx(step.text, ctx);
				const weight = resolveWeight(step.weight ?? 'weight.regular', ctx);
				const large = isLargeText(px, weight);
				const tag = step.sample ? step.sample.slice(0, 16) : `step ${i + 1}`;
				add(`${name} · ${tag}`, 'fg', 'bg', undefined, large);
			});
		}
	}

	return pairs;
}
