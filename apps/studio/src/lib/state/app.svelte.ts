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
import type { DocSettings } from '$lib/persistence/documents';
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

	/** Sparse light-mode overrides; `''` per role means "auto". */
	roles = $state<Roles>(emptyRoles());
	/** The dark-mode sibling — same seam, layered on the `theme.dark()` re-binding. */
	darkRoles = $state<Roles>(emptyRoles());
	opacities = $state<Opacities>({ ...DEFAULT_OPACITIES });

	/**
	 * Which mode every preview surface renders (Preview + Design System share it,
	 * so the two toggles never disagree). Purely a view knob: it selects which
	 * already-derived role set is shown, and never touches `source`. It works with
	 * or without an authored `theme.dark()` — unauthored dark just inherits light
	 * until you override a role.
	 */
	previewMode = $state<'light' | 'dark'>('light');

	fgAlpha = $derived(this.fgOpacity / 100);

	/** The one pure derivation; every field below is a thin re-exposure of it. */
	private rendered: RenderedScheme = $derived(
		deriveScheme(this.source, {
			roles: this.roles,
			darkRoles: this.darkRoles,
			opacities: this.opacities
		})
	);

	result: EvalResult = $derived(this.rendered.result);
	scheme: Scheme = $derived(this.rendered.scheme);

	/** DSL `theme()` role mapping — what "auto" resolves through. */
	themeRoles: Partial<Roles> = $derived(this.rendered.themeRoles);
	/** The declared intent per role: the UI override if any, else theme(). */
	mergedRoles: Roles = $derived(this.rendered.mergedRoles);
	/** What "auto" picks for light (theme() over the heuristic) — shown in the UI. */
	autoRoles: Roles = $derived(this.rendered.autoRoles);
	/** `autoRoles` with the light overrides on top — the rendered light roles. */
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
	/** What "auto" picks for dark (light roles re-pointed by `theme.dark()`). */
	darkAutoRoles: Roles = $derived(this.rendered.darkAutoRoles);
	darkEffectiveRoles: Roles = $derived(this.rendered.darkEffectiveRoles);
	darkThemeVars: string = $derived(this.rendered.darkThemeVars);
	darkAudit: AuditPair[] = $derived(this.rendered.darkAudit);
	darkComponentAudit: AuditPair[] = $derived(this.rendered.darkComponentAudit);
	modeWarnings: ModeWarning[] = $derived(this.rendered.modeWarnings);
	modeFragile: ModeFragilePair[] = $derived(this.rendered.modeFragile);

	// ── the previewed mode, resolved (what every preview surface actually shows) ──
	/** The override map the mode's dropdowns bind to — mutable, per mode. */
	get modeOverrides(): Roles {
		return this.previewMode === 'dark' ? this.darkRoles : this.roles;
	}
	/** What "auto" picks in the previewed mode. */
	modeAutoRoles: Roles = $derived(
		this.previewMode === 'dark' ? this.darkAutoRoles : this.autoRoles
	);
	/** The rendered roles for the previewed mode (auto + that mode's overrides). */
	modeRoles: Roles = $derived(
		this.previewMode === 'dark' ? this.darkEffectiveRoles : this.effectiveRoles
	);
	modeAudit: AuditPair[] = $derived(this.previewMode === 'dark' ? this.darkAudit : this.audit);
	modeComponentAudit: AuditPair[] = $derived(
		this.previewMode === 'dark' ? this.darkComponentAudit : this.componentAudit
	);

	/**
	 * The per-doc settings currently live in the store, as a detached copy. The
	 * one place that knows what belongs in a `DocSettings`: autosave, share links
	 * and the /showcase embed all snapshot through here, so a new setting can't
	 * be persisted but dropped from a link (or vice versa).
	 */
	settings(): DocSettings {
		return {
			roles: { ...this.roles },
			darkRoles: { ...this.darkRoles },
			opacities: { ...this.opacities },
			visionSim: this.visionSim,
			fgOpacity: this.fgOpacity
		};
	}

	/**
	 * The inverse of `settings()`, defaulting every hole. Share links and older
	 * documents can carry a partial (or absent) settings blob — an unmerged
	 * assignment would put `undefined` where a number is rendered.
	 */
	applySettings(s: DocSettings | undefined): void {
		this.roles = { ...emptyRoles(), ...(s?.roles ?? {}) };
		this.darkRoles = { ...emptyRoles(), ...(s?.darkRoles ?? {}) };
		this.opacities = { ...DEFAULT_OPACITIES, ...(s?.opacities ?? {}) };
		this.visionSim = s?.visionSim ?? 'none';
		this.fgOpacity = typeof s?.fgOpacity === 'number' ? s.fgOpacity : 100;
	}
}

export const app = new AppStore();
