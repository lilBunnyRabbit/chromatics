<script lang="ts">
	/**
	 * The Styleguide tab: the user's color scheme + design tokens + `component.*`
	 * specs, rendered as one live, themed design system. Mirrors Preview's chrome
	 * (CVD select + audit side panel) but the surface is generated from specs, and
	 * the audit is derived from the user's REAL components (app.componentAudit).
	 */
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { cssVars, NONE_ROLE, type Roles } from '$lib/scheme/roles';
	import { kebab } from '$lib/export';
	import { simulateVision, visionSimulations } from '$lib/analysis/cvd';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';
	import type { ResolveCtx } from '$lib/render/resolve';
	import StyleguideRenderer from './styleguide/StyleguideRenderer.svelte';
	import TokenSpecimens from './styleguide/TokenSpecimens.svelte';
	import Sheet from './mobile/Sheet.svelte';

	let panelOpen = $state(!ui.isMobile);

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
	const themeVars = $derived(cssVars(simScheme, app.effectiveRoles, app.opacities));
	const namedVars = $derived(
		simEntries.map((e) => `--color-${kebab(e.name)}:${e.color.toCSS()}`).join(';')
	);
	const styleStr = $derived([themeVars, app.tokenVars, namedVars].filter(Boolean).join(';'));

	const ctx: ResolveCtx = $derived({
		tokens: app.tokens,
		scheme: app.scheme,
		roles: app.effectiveRoles
	});

	const audit = $derived(app.componentAudit);
	const fails = $derived(
		audit.filter(
			(a) => (a.large ? wcagLevels(a.ratio).large : wcagLevels(a.ratio).normal) === 'Fail'
		).length
	);
	const hasComponents = $derived(app.components.length > 0);

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
		<span class="sg-tool-title">Styleguide</span>
		<select class="select" bind:value={app.visionSim}>
			{#each visionSimulations as sim (sim.value)}<option value={sim.value}>{sim.label}</option
				>{/each}
		</select>
		<div class="sg-spacer"></div>
		<span class="sg-fails" class:bad={fails > 0}>
			{#if fails > 0}{fails} of {audit.length} failing{:else}all {audit.length} pass{/if}
		</span>
		<button class="btn" onclick={() => (panelOpen = !panelOpen)}>
			{panelOpen ? 'Hide audit' : 'Audit'}
		</button>
	</div>

	<div class="sg-body">
		{#snippet panelBody()}
			<div class="sg-section-title">Roles</div>
			<p class="sg-panel-hint">
				Map named colors to roles here, or with <code>theme(&#123;…&#125;)</code> in the editor (the editor
				wins and is shareable).
			</p>
			{#each roleRows as [key, label, optional] (key)}
				{@const active = app.effectiveRoles[key]}
				{@const locked = app.themeRoles[key] !== undefined && app.themeRoles[key] !== ''}
				<div class="role-row">
					<div
						class="role-swatch"
						style="background: {active
							? (app.scheme.byName.get(active)?.color.toCSS() ?? 'var(--border-strong)')
							: 'var(--border-strong)'}"
					></div>
					<label class="role-label">
						<span class="role-name"
							>{label}{#if locked}<span class="role-tag">theme</span>{/if}</span
						>
						<select class="role-select" bind:value={app.roles[key]} disabled={locked}>
							<option value="">{locked ? `theme: ${active}` : 'Auto'}</option>
							{#if optional}<option value={NONE_ROLE}>None</option>{/if}
							{#each app.scheme.entries as e (e.name)}
								<option value={e.name}>{e.name}</option>
							{/each}
						</select>
					</label>
				</div>
			{/each}

			<div class="sg-section-title sg-section-divider">
				{hasComponents ? 'Component audit' : 'Audit'} ({fails} failing)
			</div>
			{#if !hasComponents}
				<p class="sg-panel-hint">
					Define <code>component.*</code> in the editor to audit your real buttons, cards and text. Showing
					the base scheme audit for now.
				</p>
			{/if}
			<div class="audit-list">
				{#each audit as item (item.label + item.fg + item.bg)}
					{@const level = item.large ? wcagLevels(item.ratio).large : wcagLevels(item.ratio).normal}
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
		{/snippet}

		{#if !ui.isMobile && panelOpen}
			<aside class="sg-panel">{@render panelBody()}</aside>
		{/if}
		{#if ui.isMobile}
			<Sheet open={panelOpen} onclose={() => (panelOpen = false)} title="Component audit">
				<div class="sg-panel-sheet">{@render panelBody()}</div>
			</Sheet>
		{/if}

		<main class="sg-scroll">
			{#if !themeVars}
				<div class="sg-empty">Define at least background, foreground and primary colors.</div>
			{:else}
				<div class="sg-surface" style={styleStr}>
					<header class="sg-head">
						<h1 class="sg-h1">Design System</h1>
						<p class="sg-sub">
							{app.scheme.entries.length} colors · {app.components.length} component{app.components
								.length === 1
								? ''
								: 's'}
						</p>
					</header>

					<section class="sg-group">
						<h2 class="sg-group-title">Tokens</h2>
						<TokenSpecimens tokens={app.tokens} />
					</section>

					{#if hasComponents}
						<section class="sg-group">
							<h2 class="sg-group-title">Components</h2>
							<div class="sg-comps">
								{#each app.components as c (c.name)}
									<StyleguideRenderer name={c.name} spec={c.spec} {ctx} />
								{/each}
							</div>
						</section>
					{:else}
						<section class="sg-group">
							<div class="sg-cta">
								<div class="sg-cta-title">Add components</div>
								<p class="sg-cta-text">Author them in the editor, then they render here live:</p>
								<pre class="sg-cta-code">button = component.button(&#123;
  variants: [&#123; name: "primary", bg: "primary", fg: "primary-fg" &#125;],
  sizes: [&#123; name: "md", padY: "space.2", padX: "space.4", text: "text.base" &#125;]
&#125;)</pre>
							</div>
						</section>
					{/if}
				</div>
			{/if}
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
	.sg-panel {
		width: 240px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		overflow-y: auto;
		color: var(--text-muted);
	}
	.sg-section-title {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		margin-top: 4px;
	}
	.sg-section-divider {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}
	.role-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.role-swatch {
		width: 14px;
		height: 14px;
		border-radius: 3px;
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
	}
	.role-tag {
		font-size: 8.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--accent);
		background: var(--accent-soft, color-mix(in srgb, var(--accent) 14%, transparent));
		padding: 0 4px;
		border-radius: 3px;
	}
	.role-select {
		background: var(--surface-2);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: 3px;
		padding: 2px 4px;
		font-size: 11px;
		width: 100%;
	}
	.role-select:disabled {
		opacity: 0.6;
	}
	.sg-panel-hint {
		margin: 0 0 4px;
		font-size: 11px;
		line-height: 1.5;
		color: var(--text-faint);
	}
	.sg-panel-hint code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10.5px;
		color: var(--text-muted);
	}
	.audit-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.audit-row {
		padding: 3px 5px;
		border-radius: 3px;
		font-size: 10px;
	}
	.audit-fail {
		background: color-mix(in srgb, var(--danger) 10%, transparent);
	}
	.audit-label {
		color: var(--text);
		font-weight: 600;
	}
	.audit-detail {
		color: var(--text-faint);
		font-size: 9px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.audit-result {
		display: flex;
		gap: 6px;
		align-items: baseline;
	}
	.audit-ratio {
		font-family: monospace;
		color: var(--text-muted);
	}
	.audit-level {
		font-weight: 700;
	}
	.sg-panel-sheet {
		display: flex;
		flex-direction: column;
		gap: 6px;
		color: var(--text-muted);
	}

	.sg-scroll {
		flex: 1;
		min-width: 0;
		overflow: auto;
	}
	.sg-empty {
		padding: 32px;
		color: var(--text-faint);
		font-size: 13px;
	}
	.sg-surface {
		min-height: 100%;
		background: var(--bg);
		color: var(--fg);
		font-family: var(--font-sans);
		padding: 32px;
		display: flex;
		flex-direction: column;
		gap: 36px;
	}
	.sg-head {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-bottom: 18px;
		border-bottom: 1px solid var(--border);
	}
	.sg-h1 {
		margin: 0;
		font-size: var(--text-3xl);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
	}
	.sg-sub {
		margin: 0;
		font-size: var(--text-sm);
		opacity: var(--op-muted);
	}
	.sg-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.sg-group-title {
		margin: 0;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: var(--op-muted);
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
		background: var(--surface);
		color: var(--surface-fg);
	}
	.sg-cta-title {
		font-size: 15px;
		font-weight: 700;
	}
	.sg-cta-text {
		margin: 6px 0 12px;
		font-size: 13px;
		opacity: var(--op-muted);
	}
	.sg-cta-code {
		margin: 0;
		padding: 14px 16px;
		border-radius: 8px;
		background: var(--bg);
		border: 1px solid var(--border);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12px;
		line-height: 1.6;
		overflow-x: auto;
	}

	@media (max-width: 768px) {
		.sg-toolbar {
			flex-wrap: wrap;
			gap: 8px 10px;
			padding: 9px 12px;
		}
		.sg-spacer {
			display: none;
		}
		.sg-surface {
			padding: 18px;
		}
	}
</style>
