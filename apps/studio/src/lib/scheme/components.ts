/**
 * The studio's component audit: grades the user's ACTUAL components (every variant/size/state, specs from
 * the package's `component.*`) through the same role-fallback chain and contrast math as the fixed audit,
 * with WCAG large-text COMPUTED from the type tokens, which the 21 hardcoded pairs can only ever guess.
 */
import type { NamedComponent, Ref, StyleTokens } from '@lilbunnyrabbit/chromatics-dsl/scheme';
import type { Scheme } from './types.js';
import type { Roles, Opacities, AuditPair } from './roles.js';
import {
	resolveColor,
	resolveTextPx,
	resolveWeight,
	refAlpha,
	isLargeText,
	type ResolveCtx
} from '../render/resolve.js';
import { contrastRatio, contrastRatioAlpha } from '../analysis/contrast.js';

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
