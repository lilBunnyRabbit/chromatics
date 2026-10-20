<script lang="ts">
	/**
	 * The Design System tab — a guided flow (Roles → Light/Dark → Components →
	 * Tokens → Handoff) layered over the SAME derived state, not a new pipeline.
	 * Step completeness is purely `$derived`; each unfinished step offers a
	 * one-click Scaffold that appends real DSL the editor re-evaluates. Light/dark
	 * is pure role re-binding (`theme.dark()`); the toggle is a non-dirtying view
	 * preference. The surface, role mapping and audit are read from `app.*`.
	 */
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { cssVars, NONE_ROLE, type Roles } from '$lib/scheme/roles';
	import { isToken } from '$lib/scheme/tokens';
	import { kebab } from '$lib/export';
	import { simulateVision, visionSimulations } from '$lib/analysis/cvd';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';
	import type { ResolveCtx } from '$lib/render/resolve';
	import {
		buildFlow,
		rolesScaffold,
		tokensScaffold,
		componentsScaffold,
		modesScaffold,
		type FlowStepId
	} from '$lib/scheme/flow';
	import { insert } from './tools/shared';
	import StyleguideRenderer from './styleguide/StyleguideRenderer.svelte';
	import TokenSpecimens from './styleguide/TokenSpecimens.svelte';
	import FlowSteps from './system/FlowSteps.svelte';

	/**
	 * Which mode the live preview + audit show. View-only (non-dirtying), and
	 * shared with the Preview tab through `app.previewMode` so the two toggles
	 * never disagree.
	 */
	const mode = $derived(app.previewMode);

	// ── rendered surface (CVD-aware, like Preview) ──
	const simEntries = $derived(
		app.visionSim === 'none'
			? app.scheme.entries
			: app.scheme.entries.map((e) => ({ ...e, color: simulateVision(e.color, app.visionSim) }))
	);
	const simScheme = $derived({
		...app.scheme,
		entries: simEntries,
		byName: new Map(simEntries.map((e) => [e.name, e]))
	});
	// Active mode's roles drive the preview; dark falls back to light when unauthored.
	const activeRoles = $derived(app.modeRoles);
	const themeVars = $derived(cssVars(simScheme, activeRoles, app.opacities));
	const namedVars = $derived(
		simEntries.map((e) => `--color-${kebab(e.name)}:${e.color.toCSS()}`).join(';')
	);
	const styleStr = $derived([themeVars, app.tokenVars, namedVars].filter(Boolean).join(';'));
	const ctx: ResolveCtx = $derived({
		tokens: app.tokens,
		scheme: app.scheme,
		roles: activeRoles
	});

	// ── audit (current mode; from real components, else the 21 fixed pairs) ──
	const audit = $derived(app.modeComponentAudit);
	const fails = $derived(
		audit.filter(
			(a) => (a.large ? wcagLevels(a.ratio).large : wcagLevels(a.ratio).normal) === 'Fail'
		).length
	);
	const hasComponents = $derived(app.components.length > 0);

	// ── the guided flow model (pure, derived) ──
	const rolesComplete = $derived(app.themeVars !== '');
	const tokensAuthored = $derived(app.scheme.nonColorVars.some((v) => isToken(v.value)));
	const flowInput = $derived({
		rolesComplete,
		darkAuthored: app.hasDarkTheme,
		tokensAuthored,
		componentCount: app.components.length
	});
	const steps = $derived(buildFlow(flowInput));
	const actionable = $derived(steps.filter((s) => s.status !== 'soon'));
	const doneCount = $derived(actionable.filter((s) => s.status === 'done').length);

	let activeStep = $state<FlowStepId>(
		buildFlow({
			rolesComplete: app.themeVars !== '',
			darkAuthored: app.hasDarkTheme,
			tokensAuthored: app.scheme.nonColorVars.some((v) => isToken(v.value)),
			componentCount: app.components.length
		}).find((s) => s.status === 'todo')?.id ?? 'roles'
	);
	const activeStepObj = $derived(steps.find((s) => s.id === activeStep) ?? steps[0]);

	const SCAFFOLD_CTA: Partial<Record<FlowStepId, string>> = {
		roles: 'Auto-map roles',
		modes: 'Add dark theme',
		tokens: 'Add token scales',
		components: 'Add starter components'
	};

	/** Whether the active step's scaffold can run right now. */
	const canScaffold = $derived(
		activeStep === 'roles'
			? app.scheme.entries.length > 0
			: activeStep === 'modes'
				? rolesComplete
				: activeStep === 'tokens' || activeStep === 'components'
	);

	function scaffold(id: FlowStepId) {
		const s =
			id === 'roles'
				? rolesScaffold(app.scheme)
				: id === 'modes'
					? modesScaffold(app.scheme, app.effectiveRoles)
					: id === 'tokens'
						? tokensScaffold(app.scheme)
						: id === 'components'
							? componentsScaffold(app.scheme)
							: null;
		if (s) {
			insert(s.lines, s.comment);
			if (id === 'modes') app.previewMode = 'dark';
		}
	}

	/** "name #hex" for a role target, or a placeholder when it resolves to nothing. */
	function describe(name: string): string {
		const e = name ? app.scheme.byName.get(name) : undefined;
		return e ? `${e.name} ${e.color.hex}` : 'none';
	}

	const roleRows: [keyof Roles, string, boolean][] = [
		['bg', 'Background', false],
		['fg', 'Foreground', false],
		['primary', 'Primary', false],
		['primaryFg', 'Primary FG', true],
		['secondary', 'Secondary', true],
		['secondaryFg', 'Secondary FG', true],
		['tertiary', 'Tertiary', true],
		['accent', 'Accent', true],
		['accentFg', 'Accent FG', true],
		['surface', 'Surface', true],
		['border', 'Border', true]
	];
</script>

<div class="sg-root">
	<div class="sg-toolbar">
		<span class="sg-tool-title">Design System</span>
		<div class="mode-toggle" role="group" aria-label="Preview mode">
			<button
				class="mode-btn"
				class:on={mode === 'light'}
				onclick={() => (app.previewMode = 'light')}
			>
				Light
			</button>
			<button
				class="mode-btn"
				class:on={mode === 'dark'}
				class:muted={!app.hasDarkTheme}
				title={app.hasDarkTheme
					? 'Preview dark mode'
					: 'No dark theme authored — dark inherits light until you override a role'}
				onclick={() => (app.previewMode = 'dark')}
			>
				Dark
			</button>
		</div>
		<select class="select" bind:value={app.visionSim}>
			{#each visionSimulations as sim (sim.value)}<option value={sim.value}>{sim.label}</option
				>{/each}
		</select>
		<div class="sg-spacer"></div>
		<span class="sg-fails" class:bad={fails > 0}>
			{mode === 'dark' ? 'dark' : 'light'} ·
			{#if fails > 0}{fails} of {audit.length} failing{:else}all {audit.length} pass{/if}
		</span>
	</div>

	<div class="sg-body">
		<FlowSteps
			{steps}
			active={activeStep}
			{doneCount}
			totalCount={actionable.length}
			onselect={(id) => (activeStep = id)}
		/>

		<main class="sg-main">
			<header class="step-header">
				<div class="step-heading">
					<h2 class="step-h">{activeStepObj.title}</h2>
					<p class="step-desc">{activeStepObj.blurb}</p>
				</div>
				{#if activeStepObj.status === 'todo' && SCAFFOLD_CTA[activeStep] && !ui.sourceLocked}
					<button
						class="btn btn-accent"
						disabled={!canScaffold}
						onclick={() => scaffold(activeStep)}
					>
						{SCAFFOLD_CTA[activeStep]}
					</button>
				{/if}
			</header>

			<div class="step-body">
				{#if activeStep === 'roles'}
					<!-- ── Roles ── -->
					{#if app.scheme.entries.length === 0}
						<div class="sg-empty">Define some colors in the editor to start mapping roles.</div>
					{:else}
						<p class="step-hint">
							You are editing the <strong>{mode}</strong> mapping (switch with the toolbar toggle).
							<code>Auto</code> follows the editor's <code>roles &#123;…&#125;</code> /
							<code>theme(&#123;…&#125;)</code>
							block — it names the color it landed on. Picking anything else pins that role for this mode
							and wins over the editor, without rewriting your source.
							<strong>Auto-map roles</strong> writes a <code>theme()</code> block from a best guess.
						</p>
						<div class="role-grid">
							{#each roleRows as [key, label, optional] (key)}
								{@const active = app.modeRoles[key]}
								{@const auto = app.modeAutoRoles[key]}
								{@const fromDsl = (mode === 'dark' ? app.darkThemeRoles : app.themeRoles)[key]}
								{@const pinned = app.modeOverrides[key] !== ''}
								<div class="role-row">
									<div
										class="role-swatch"
										style="background: {active
											? (app.scheme.byName.get(active)?.color.toCSS() ?? 'var(--border-strong)')
											: 'var(--border-strong)'}"
									></div>
									<label class="role-label">
										<span class="role-name"
											>{label}{#if pinned}<span class="role-tag">pinned</span
												>{:else if fromDsl}<span class="role-tag">theme</span>{/if}</span
										>
										<select class="role-select" bind:value={app.modeOverrides[key]}>
											<option value="">Auto · {describe(auto)}</option>
											{#if optional}<option value={NONE_ROLE}>None</option>{/if}
											{#each app.scheme.entries as e (e.name)}
												<option value={e.name}>{e.name}</option>
											{/each}
										</select>
									</label>
								</div>
							{/each}
						</div>
						{#if rolesComplete}
							<p class="step-ok">
								✓ Background, foreground and primary resolve — the system renders.
							</p>
						{:else}
							<p class="step-warn">Set at least background, foreground and primary to continue.</p>
						{/if}
					{/if}
				{:else if activeStep === 'modes'}
					<!-- ── Light & Dark — pure role re-binding ── -->
					<p class="step-hint">
						Dark mode is pure <strong>role re-binding</strong>: a
						<code>dark &#123; … &#125;</code> block (or <code>dark &#123;&#125;</code> nested in
						<code>roles &#123;&#125;</code>) re-points
						<code>bg</code>/<code>fg</code>/<code>surface</code>/<code>border</code> onto
						already-named colors; <code>primary</code>/<code>accent</code> stay shared. Both modes re-resolve
						through the same audit and export — no second pipeline.
					</p>

					{#if !rolesComplete}
						<div class="sg-empty">
							Finish <strong>Roles</strong> first — dark mode re-points the resolved roles.
							<button class="link-btn" onclick={() => (activeStep = 'roles')}>Go to Roles →</button>
						</div>
					{:else if !app.hasDarkTheme}
						<div class="sg-cta">
							<div class="sg-cta-title">No dark theme yet</div>
							<p class="sg-cta-text">
								<strong>Add dark theme</strong> writes inverted-lightness
								<code>bg/fg/surface/border</code> colors and a <code>dark &#123; … &#125;</code> block
								that re-points onto them — then tune it in the editor.
							</p>
						</div>
					{:else}
						{#if app.modeWarnings.length}
							<div class="warn-box">
								{#each app.modeWarnings as w (w.role + w.kind)}
									<div class="warn-row">⚠ {w.message}</div>
								{/each}
							</div>
						{/if}

						<div class="mode-compare">
							{#each [{ m: 'light', roles: app.effectiveRoles, label: 'Light' }, { m: 'dark', roles: app.darkEffectiveRoles, label: 'Dark' }] as col (col.m)}
								{@const vars = cssVars(simScheme, col.roles, app.opacities)}
								<div class="mode-card">
									<div class="mode-card-head">{col.label}</div>
									<div class="mode-preview" style={[vars, app.tokenVars, namedVars].join(';')}>
										<div class="mp-sample">
											<span class="mp-title">Aa</span>
											<button class="mp-btn">Primary</button>
										</div>
										<div class="mp-swatches">
											{#each ['--bg', '--surface', '--primary', '--accent', '--fg', '--border'] as v (v)}
												<span class="mp-sw" style="background: var({v})"></span>
											{/each}
										</div>
									</div>
								</div>
							{/each}
						</div>

						<div class="sg-section-title">Dark re-points</div>
						<div class="role-grid">
							{#each Object.entries(app.darkThemeRoles) as [role, target] (role)}
								<div class="role-row">
									<div
										class="role-swatch"
										style="background: {app.scheme.byName.get(target)?.color.toCSS() ??
											'var(--border-strong)'}"
									></div>
									<span class="role-name">{role} → {target}</span>
								</div>
							{/each}
						</div>
					{/if}
				{:else if !themeVars}
					<!-- shared gate: the live surface needs bg/fg/primary -->
					<div class="sg-empty">
						Set background, foreground and primary first.
						<button class="link-btn" onclick={() => (activeStep = 'roles')}>Go to Roles →</button>
					</div>
				{:else if activeStep === 'components'}
					<!-- ── Components ── -->
					{#if hasComponents}
						<div class="sg-surface" style={styleStr}>
							<div class="sg-comps">
								{#each app.components as c (c.name)}
									<StyleguideRenderer name={c.name} spec={c.spec} {ctx} />
								{/each}
							</div>
						</div>
					{:else}
						<div class="sg-cta">
							<div class="sg-cta-title">No components yet</div>
							<p class="sg-cta-text">
								Use <strong>Add starter components</strong> above, or author
								<code>component.*</code> in the editor — they render here live and feed the audit:
							</p>
							<pre class="sg-cta-code">button = component.button(&#123;
  variants: [&#123; name: "primary", bg: "primary", fg: "primary-fg" &#125;],
  sizes: [&#123; name: "md", padY: "2", padX: "4", text: "base" &#125;]
&#125;)</pre>
						</div>
					{/if}
				{:else if activeStep === 'tokens'}
					<!-- ── Tokens ── -->
					{#if !tokensAuthored}
						<p class="step-hint">
							Showing the default scales. <strong>Add token scales</strong> writes
							<code>scale.text/space/radius</code> and a <code>font</code> token you can tune.
						</p>
					{/if}
					<div class="sg-surface" style={styleStr}>
						<TokenSpecimens tokens={app.tokens} />
					</div>
				{:else if activeStep === 'handoff'}
					<!-- ── Handoff ── -->
					<div class="handoff">
						<div class="handoff-summary">
							<div class="hs-stat">
								<span class="hs-num">{app.scheme.entries.length}</span>
								<span class="hs-label">colors</span>
							</div>
							<div class="hs-stat">
								<span class="hs-num">{app.components.length}</span>
								<span class="hs-label">components</span>
							</div>
							<div class="hs-stat">
								<span class="hs-num" class:bad={fails > 0}
									>{audit.length - fails}/{audit.length}</span
								>
								<span class="hs-label">contrast pass</span>
							</div>
							<button class="btn btn-accent hs-export" onclick={() => (ui.tab = 'export')}>
								Open Export →
							</button>
						</div>

						{#if app.hasDarkTheme}
							<div class="sg-section-title">
								Mode-fragile pairs ({app.modeFragile.length})
							</div>
							{#if app.modeFragile.length === 0}
								<p class="step-ok">✓ Every audited pair passes in both light and dark.</p>
							{:else}
								<p class="step-hint">Pairs that fail their WCAG band in one mode or the other:</p>
								<div class="audit-list">
									{#each app.modeFragile as p (p.label)}
										<div class="audit-row audit-fail">
											<div class="audit-label">{p.label}</div>
											<div class="audit-result">
												<span class="mf-mode" style="color: {wcagColor(p.lightLevel)}"
													>light {p.lightLevel}</span
												>
												<span class="mf-mode" style="color: {wcagColor(p.darkLevel)}"
													>dark {p.darkLevel}</span
												>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						{/if}

						<div class="sg-section-title">
							{hasComponents ? 'Component audit' : 'Audit'} · {mode} ({fails} failing)
						</div>
						{#if !hasComponents}
							<p class="step-hint">
								Define <code>component.*</code> to audit your real buttons, cards and text. Showing the
								base scheme audit for now.
							</p>
						{/if}
						<div class="audit-list">
							{#each audit as item (item.label + item.fg + item.bg)}
								{@const level = item.large
									? wcagLevels(item.ratio).large
									: wcagLevels(item.ratio).normal}
								<div class="audit-row" class:audit-fail={level === 'Fail'}>
									<div class="audit-label">{item.label}</div>
									<div class="audit-detail">{item.fg} / {item.bg}</div>
									<div class="audit-result">
										<span class="audit-ratio">{item.ratio.toFixed(2)}</span>
										<span class="audit-level" style="color: {wcagColor(level)}">{level}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>

<style>
	.sg-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--bg);
	}
	.sg-toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 14px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.sg-tool-title {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.sg-spacer {
		flex: 1;
	}
	.sg-fails {
		padding: 2px 10px;
		border-radius: 99px;
		font-size: 11px;
		font-weight: 600;
		background: color-mix(in srgb, var(--ok) 16%, transparent);
		color: var(--ok);
	}
	.sg-fails.bad {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
	}
	.sg-body {
		display: flex;
		flex: 1;
		min-height: 0;
	}

	/* ── main / step ── */
	.sg-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	.step-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 22px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.step-h {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--text);
	}
	.step-desc {
		margin: 3px 0 0;
		font-size: 12px;
		color: var(--text-faint);
	}
	.step-body {
		padding: 20px 22px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.step-hint {
		margin: 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--text-faint);
		max-width: 60ch;
	}
	.step-hint code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-muted);
	}
	.step-ok {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		color: var(--ok);
	}
	.step-warn {
		margin: 0;
		font-size: 12px;
		color: var(--text-faint);
	}

	.btn-accent {
		background: var(--accent);
		color: var(--accent-fg, #fff);
		border-color: var(--accent);
		font-weight: 600;
		flex-shrink: 0;
	}
	.btn-accent:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.link-btn {
		background: none;
		border: none;
		color: var(--accent);
		cursor: pointer;
		font: inherit;
		padding: 0 0 0 8px;
	}

	/* ── roles ── */
	.role-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 8px 18px;
		max-width: 720px;
	}
	.role-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.role-swatch {
		width: 16px;
		height: 16px;
		border-radius: 4px;
		border: 1px solid var(--border-strong);
		flex-shrink: 0;
	}
	.role-label {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 11px;
	}
	.role-name {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--text-muted);
	}
	.role-tag {
		font-size: 8.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		padding: 0 4px;
		border-radius: 3px;
	}
	.role-select {
		background: var(--surface-2);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: 4px;
		padding: 3px 5px;
		font-size: 12px;
		width: 100%;
	}

	/* ── light/dark mode toggle (toolbar) ── */
	.mode-toggle {
		display: inline-flex;
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		overflow: hidden;
	}
	.mode-btn {
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 600;
		background: transparent;
		color: var(--text-muted);
		border: none;
		cursor: pointer;
	}
	.mode-btn.on {
		background: var(--surface-2);
		color: var(--text);
	}
	.mode-btn.muted:not(.on) {
		opacity: 0.55;
	}

	/* ── light/dark step ── */
	.warn-box {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 10px 12px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--warning, #eab308) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--warning, #eab308) 35%, transparent);
	}
	.warn-row {
		font-size: 12px;
		color: var(--text-muted);
	}
	.mode-compare {
		display: grid;
		grid-template-columns: repeat(2, minmax(160px, 280px));
		gap: 14px;
	}
	.mode-card {
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
	}
	.mode-card-head {
		padding: 6px 12px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		border-bottom: 1px solid var(--border);
	}
	.mode-preview {
		background: var(--bg);
		color: var(--fg);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.mp-sample {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.mp-title {
		font-size: 22px;
		font-weight: 700;
	}
	.mp-btn {
		padding: 5px 12px;
		border-radius: var(--radius-md, 8px);
		border: none;
		background: var(--primary);
		color: var(--primary-fg);
		font-size: 12px;
		font-weight: 600;
	}
	.mp-swatches {
		display: flex;
		gap: 6px;
	}
	.mp-sw {
		width: 22px;
		height: 22px;
		border-radius: 5px;
		border: 1px solid var(--border);
	}
	.mf-mode {
		font-size: 11px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	/* ── rendered surface (tokens + components) ── */
	.sg-empty {
		padding: 24px;
		color: var(--text-faint);
		font-size: 13px;
	}
	.sg-surface {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--bg);
		color: var(--fg);
		font-family: var(--font-sans);
		padding: 28px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}
	.sg-comps {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.sg-cta {
		border: 1px dashed var(--border);
		border-radius: 12px;
		padding: 20px 22px;
		background: var(--surface-2);
		max-width: 60ch;
	}
	.sg-cta-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text);
	}
	.sg-cta-text {
		margin: 6px 0 12px;
		font-size: 13px;
		color: var(--text-muted);
	}
	.sg-cta-text code,
	.sg-cta-code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
	}
	.sg-cta-code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 8px;
		background: var(--bg);
		border: 1px solid var(--border);
		font-size: 12px;
		line-height: 1.6;
		overflow-x: auto;
		color: var(--text-muted);
	}

	/* ── handoff ── */
	.handoff {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.handoff-summary {
		display: flex;
		align-items: center;
		gap: 26px;
		padding: 16px 18px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface-2);
		flex-wrap: wrap;
	}
	.hs-stat {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.hs-num {
		font-size: 22px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--text);
	}
	.hs-num.bad {
		color: var(--danger);
	}
	.hs-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
	}
	.hs-export {
		margin-left: auto;
	}
	.sg-section-title {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		margin-top: 4px;
	}
	.audit-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 2px 12px;
	}
	.audit-row {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 4px 6px;
		border-radius: 4px;
		font-size: 11px;
	}
	.audit-fail {
		background: color-mix(in srgb, var(--danger) 10%, transparent);
	}
	.audit-label {
		color: var(--text);
		font-weight: 600;
		flex-shrink: 0;
	}
	.audit-detail {
		color: var(--text-faint);
		font-size: 10px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}
	.audit-result {
		display: flex;
		gap: 6px;
		align-items: baseline;
		margin-left: auto;
	}
	.audit-ratio {
		font-family: monospace;
		color: var(--text-muted);
	}
	.audit-level {
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.sg-body {
			flex-direction: column;
		}
		.sg-toolbar {
			flex-wrap: wrap;
			gap: 8px 10px;
			padding: 9px 12px;
		}
		.sg-spacer {
			display: none;
		}
		.step-header,
		.step-body {
			padding: 14px 16px;
		}
		.sg-surface {
			padding: 18px;
		}
	}
</style>
