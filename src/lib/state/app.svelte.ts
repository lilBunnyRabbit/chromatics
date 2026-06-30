/**
 * The single reactive store: source -> EvalResult -> Scheme, plus the analysis
 * view-state (CVD mode, fg opacity) and the theme role mapping. Everything
 * downstream is $derived; no panel mutates the scheme.
 *
 * The whole derivation cascade now lives in the pure `deriveScheme()` spine
 * (scheme/derive.ts); this store holds the mutable inputs, calls it once, and
 * re-exposes each rendered field as a thin `$derived` so the ~70 `app.*`
 * callsites are untouched. `visionSim`/`fgOpacity` stay here — they are
 * presentation knobs applied downstream of the canonical scheme, not derive
 * inputs.
 */
import type { EvalResult } from '$lib/dsl/evaluator';
import type { Scheme } from '$lib/scheme/types';
import type { VisionSimulation } from '$lib/analysis/cvd';
import type { StyleTokens } from '$lib/scheme/tokens';
import type { NamedComponent } from '$lib/scheme/components';
import { deriveScheme, type RenderedScheme } from '$lib/scheme/derive';
import type { ModeWarning, ModeFragilePair } from '$lib/scheme/modes';
import {
	emptyRoles,
	DEFAULT_OPACITIES,
	type Roles,
	type Opacities,
	type AuditPair
} from '$lib/scheme/roles';

export class AppStore {
	source = $state('');
	visionSim = $state<VisionSimulation>('none');
	fgOpacity = $state(100);

	/** Sparse user overrides; `''` per role means "auto". */
	roles = $state<Roles>(emptyRoles());
	opacities = $state<Opacities>({ ...DEFAULT_OPACITIES });

	fgAlpha = $derived(this.fgOpacity / 100);

	/** The one pure derivation; every field below is a thin re-exposure of it. */
	private rendered: RenderedScheme = $derived(
		deriveScheme(this.source, { roles: this.roles, opacities: this.opacities })
	);

	result: EvalResult = $derived(this.rendered.result);
	scheme: Scheme = $derived(this.rendered.scheme);

	/** DSL `theme()` role mapping (authoritative); dropdowns fill the rest. */
	themeRoles: Partial<Roles> = $derived(this.rendered.themeRoles);
	/** theme() wins per role, then the UI dropdown overrides, then auto. */
	mergedRoles: Roles = $derived(this.rendered.mergedRoles);
	/** Overrides collapsed onto the auto heuristic — dangling names self-heal. */
	effectiveRoles: Roles = $derived(this.rendered.effectiveRoles);

	themeVars: string = $derived(this.rendered.themeVars);
	audit: AuditPair[] = $derived(this.rendered.audit);

	// ── design system (tokens + components) ──
	/** DEFAULT_TOKENS overlaid with every `scale.*`/`token(...)` group. */
	tokens: StyleTokens = $derived(this.rendered.tokens);
	/** `--text-*`, `--space-*`, … for the styleguide surface. */
	tokenVars: string = $derived(this.rendered.tokenVars);
	/** One `--<name>` per scheme entry, so components can ref any named color. */
	namedColorVars: string = $derived(this.rendered.namedColorVars);
	/** `component.*` specs authored in the editor. */
	components: NamedComponent[] = $derived(this.rendered.components);
	/** Audit derived from the user's real components — falls back to the 21 pairs. */
	componentAudit: AuditPair[] = $derived(this.rendered.componentAudit);

	// ── light/dark (CD-13 P1) — dark = pure role re-binding, no new mutable state ──
	hasDarkTheme: boolean = $derived(this.rendered.hasDarkTheme);
	darkThemeRoles: Partial<Roles> = $derived(this.rendered.darkThemeRoles);
	darkEffectiveRoles: Roles = $derived(this.rendered.darkEffectiveRoles);
	darkThemeVars: string = $derived(this.rendered.darkThemeVars);
	darkAudit: AuditPair[] = $derived(this.rendered.darkAudit);
	darkComponentAudit: AuditPair[] = $derived(this.rendered.darkComponentAudit);
	modeWarnings: ModeWarning[] = $derived(this.rendered.modeWarnings);
	modeFragile: ModeFragilePair[] = $derived(this.rendered.modeFragile);
}

export const app = new AppStore();
