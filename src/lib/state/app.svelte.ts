/**
 * The single reactive store: source -> EvalResult -> Scheme, plus the analysis
 * view-state (CVD mode, fg opacity) and the theme role mapping. Everything
 * downstream is $derived; no panel mutates the scheme.
 */
import { evaluate, type EvalResult } from '$lib/dsl/evaluator';
import { schemeFromEvalResult } from '$lib/scheme/adapter';
import type { Scheme } from '$lib/scheme/types';
import type { VisionSimulation } from '$lib/analysis/cvd';
import { tokensFromScheme, buildTokenVars, type StyleTokens } from '$lib/scheme/tokens';
import {
	componentsFromScheme,
	auditPairsFromComponents,
	type NamedComponent
} from '$lib/scheme/components';
import { kebab } from '$lib/export';
import {
	emptyRoles,
	resolveRoles,
	cssVars as buildVars,
	auditPairs as buildAudit,
	DEFAULT_OPACITIES,
	ROLE_KEYS,
	type Roles,
	type Opacities,
	type AuditPair
} from '$lib/scheme/roles';
import { themeRolesFromScheme } from '$lib/scheme/theme-config';

export class AppStore {
	source = $state('');
	visionSim = $state<VisionSimulation>('none');
	fgOpacity = $state(100);

	/** Sparse user overrides; `''` per role means "auto". */
	roles = $state<Roles>(emptyRoles());
	opacities = $state<Opacities>({ ...DEFAULT_OPACITIES });

	result: EvalResult = $derived(evaluate(this.source));
	scheme: Scheme = $derived(schemeFromEvalResult(this.result, this.source));
	fgAlpha = $derived(this.fgOpacity / 100);

	/** DSL `theme()` role mapping (authoritative); dropdowns fill the rest. */
	themeRoles: Partial<Roles> = $derived(themeRolesFromScheme(this.scheme));
	/** theme() wins per role, then the UI dropdown overrides, then auto. */
	mergedRoles: Roles = $derived.by(() => {
		const out = { ...this.roles };
		for (const k of ROLE_KEYS) {
			const dv = this.themeRoles[k];
			if (dv !== undefined && dv !== '') out[k] = dv;
		}
		return out;
	});
	/** Overrides collapsed onto the auto heuristic — dangling names self-heal. */
	effectiveRoles: Roles = $derived(resolveRoles(this.scheme.entries, this.mergedRoles));

	themeVars: string = $derived(buildVars(this.scheme, this.effectiveRoles, this.opacities));
	audit: AuditPair[] = $derived(buildAudit(this.scheme, this.effectiveRoles, this.opacities));

	// ── design system (tokens + components) ──
	/** DEFAULT_TOKENS overlaid with every `scale.*`/`token(...)` group. */
	tokens: StyleTokens = $derived(tokensFromScheme(this.scheme));
	/** `--text-*`, `--space-*`, … for the styleguide surface. */
	tokenVars: string = $derived(buildTokenVars(this.tokens));
	/** One `--<name>` per scheme entry, so components can ref any named color. */
	namedColorVars: string = $derived(
		this.scheme.entries.map((e) => `--color-${kebab(e.name)}:${e.color.toCSS()}`).join(';')
	);
	/** `component.*` specs authored in the editor. */
	components: NamedComponent[] = $derived(componentsFromScheme(this.scheme));
	/** Audit derived from the user's real components — falls back to the 21 pairs. */
	componentAudit: AuditPair[] = $derived(
		this.components.length
			? auditPairsFromComponents(
					this.scheme,
					this.effectiveRoles,
					this.opacities,
					this.tokens,
					this.components
				)
			: this.audit
	);
}

export const app = new AppStore();
