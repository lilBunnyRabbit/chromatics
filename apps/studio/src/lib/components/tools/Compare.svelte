<script lang="ts">
	/**
	 * Compare — pick a bg / fg / primary trio with a system instead of by eye.
	 *
	 * A thin view over `analysis/combinations`: the enumeration, measurement and
	 * ranking are pure and unit-tested; this file only renders candidates on ONE
	 * representative mini-UI (so the only variable is the color) and hands the
	 * winner to the role-override seam.
	 *
	 * Applying writes `app.modeOverrides` — the same per-mode override layer the
	 * Preview/Design-System dropdowns use. That keeps a comparison non-destructive
	 * (it never rewrites hand-authored `roles {}`), reversible (pick Auto again),
	 * per-mode, and already persisted with the document. "Write to editor" is the
	 * opt-in escape hatch for when the decision should live in the source.
	 */
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { ROLE_KEYS } from '$lib/scheme/roles';
	import {
		combinationCtx,
		rankCombinations,
		scoreCombination,
		autoPrimaryFg,
		combinationId,
		CONTRAST_TARGETS,
		type Combination,
		type ScoredCombination
	} from '$lib/analysis/combinations';
	import { simulateVision, visionSimulations, type VisionSimulation } from '$lib/analysis/cvd';
	import { wcagColor } from '$lib/analysis/wcag';
	import { apcaColor } from '$lib/analysis/apca';
	import { uniqueName } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	const ctx = $derived(combinationCtx(entries));

	let targetId = $state('AA');
	let limit = $state(12);
	let sim = $state<VisionSimulation>('none');
	let view = $state<'shortlist' | 'pinned'>('shortlist');
	/** Full combinations, not ids — a pin must survive falling off the shortlist. */
	let pins = $state<Combination[]>([]);

	const target = $derived(CONTRAST_TARGETS.find((t) => t.id === targetId) ?? CONTRAST_TARGETS[0]);
	const shortlist = $derived(rankCombinations(ctx, { target: target.ratio, limit }));
	const truncated = $derived(Math.max(0, entries.length - 48));

	/** The trio currently bound to the previewed mode — the baseline to beat. */
	const current = $derived.by(() => {
		const r = app.modeRoles;
		if (!r.bg || !r.fg || !r.primary) return null;
		const combo: Combination = {
			bg: r.bg,
			fg: r.fg,
			primary: r.primary,
			primaryFg: r.primaryFg || autoPrimaryFg(ctx, r.primary)
		};
		return scoreCombination(ctx, combo, target.ratio);
	});
	const pinned = $derived(
		pins.map((c) => scoreCombination(ctx, c, target.ratio)).filter((c) => c !== null)
	);
	const shown = $derived(view === 'pinned' ? pinned : shortlist);
	const pinnedIds = $derived(new Set(pins.map(combinationId)));

	function togglePin(c: ScoredCombination) {
		pins = pinnedIds.has(c.id) ? pins.filter((p) => combinationId(p) !== c.id) : [...pins, c.combo];
	}

	/** Non-destructive: pin the four slots as overrides for the previewed mode. */
	function apply(c: ScoredCombination) {
		app.modeOverrides.bg = c.combo.bg;
		app.modeOverrides.fg = c.combo.fg;
		app.modeOverrides.primary = c.combo.primary;
		app.modeOverrides.primaryFg = c.combo.primaryFg;
	}

	/**
	 * Move the decision into the source. The four overrides are cleared first —
	 * with the editor holding the mapping, leaving them set would shadow it.
	 */
	function writeToEditor(c: ScoredCombination) {
		const fn = app.previewMode === 'dark' ? 'theme.dark' : 'theme';
		const name = uniqueName(app.previewMode === 'dark' ? 'dark_roles' : 'roles', takenNames());
		insert(
			[
				`${name} = ${fn}({`,
				`  bg: "${c.combo.bg}",`,
				`  fg: "${c.combo.fg}",`,
				`  primary: "${c.combo.primary}",`,
				`  primaryFg: "${c.combo.primaryFg}"`,
				`})`
			],
			`Chosen ${app.previewMode} combination — score ${c.score}, body ${c.body.ratio.toFixed(2)}:1`
		);
		for (const k of ['bg', 'fg', 'primary', 'primaryFg'] as const) app.modeOverrides[k] = '';
	}

	function clearOverrides() {
		for (const k of ROLE_KEYS) app.modeOverrides[k] = '';
	}

	/** CSS for a color name, under the selected vision simulation. */
	function css(name: string): string {
		const e = app.scheme.byName.get(name);
		if (!e) return 'transparent';
		return (sim === 'none' ? e.color : simulateVision(e.color, sim)).toCSS();
	}

	function vars(c: Combination): string {
		return [
			`--c-bg:${css(c.bg)}`,
			`--c-fg:${css(c.fg)}`,
			`--c-primary:${css(c.primary)}`,
			`--c-primary-fg:${css(c.primaryFg)}`
		].join(';');
	}

	const isCurrent = $derived((c: ScoredCombination) => !!current && current.id === c.id);
</script>

<div class="tool">
	{#if entries.length < 3}
		<p class="empty">
			Define at least three colors — a background, a foreground and a brand color — to compare
			combinations.
		</p>
	{:else}
		<div class="controls">
			<label class="field">
				<span>Target</span>
				<select class="select" bind:value={targetId}>
					{#each CONTRAST_TARGETS as t (t.id)}<option value={t.id}>{t.label}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>Shortlist</span>
				<select class="select" bind:value={limit}>
					{#each [6, 12, 24, 48] as n (n)}<option value={n}>top {n}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>View as</span>
				<select class="select" bind:value={sim}>
					{#each visionSimulations as v (v.value)}<option value={v.value}>{v.label}</option>{/each}
				</select>
			</label>
			<div class="seg">
				<button
					class="seg-item {view === 'shortlist' ? 'active' : ''}"
					onclick={() => (view = 'shortlist')}>Shortlist</button
				>
				<button
					class="seg-item {view === 'pinned' ? 'active' : ''}"
					onclick={() => (view = 'pinned')}>Pinned ({pins.length})</button
				>
			</div>
		</div>

		<p class="hint">
			Every {app.previewMode} combination the palette can form, on one identical UI. Applying pins
			<code>bg</code>/<code>fg</code>/<code>primary</code>/<code>primaryFg</code> as
			<strong>{app.previewMode}</strong>
			role overrides — reversible, and it never rewrites your source.
			{#if truncated > 0}<span class="warn"
					>Palette truncated to the first 48 colors ({truncated} skipped).</span
				>{/if}
		</p>

		{#if current}
			<div class="now">
				<span class="now-label">Currently applied</span>
				<span class="now-combo">
					{current.combo.bg} / {current.combo.fg} / {current.combo.primary}
				</span>
				<span class="score" style="--s:{current.score}">{current.score}</span>
				<span class="m" class:bad={!current.passes}>WCAG {current.body.ratio.toFixed(2)}</span>
				<button class="link-btn" onclick={clearOverrides}>reset to auto</button>
			</div>
		{/if}

		{#if shown.length === 0}
			<p class="empty">
				{#if view === 'pinned'}
					Nothing pinned yet — star candidates in the shortlist to compare them head-to-head.
				{:else}
					No combination in this palette reaches {target.label}. Loosen the target, or add a
					lighter/darker neutral.
				{/if}
			</p>
		{:else}
			<div class="cards">
				{#each shown as c, i (c.id)}
					<article class="card" class:is-current={isCurrent(c)}>
						<header class="card-head">
							<span class="rank">{view === 'shortlist' ? `#${i + 1}` : ''}</span>
							<span class="score" style="--s:{c.score}">{c.score}</span>
							<button
								class="pin"
								class:on={pinnedIds.has(c.id)}
								title={pinnedIds.has(c.id) ? 'Unpin' : 'Pin for head-to-head'}
								onclick={() => togglePin(c)}>★</button
							>
						</header>

						<div class="mini" style={vars(c.combo)}>
							<div class="mini-top">
								<span class="mini-title">Aa Heading</span>
								<span class="mini-badge">New</span>
							</div>
							<p class="mini-body">The quick brown fox jumps over the lazy dog.</p>
							<p class="mini-muted">Secondary label · 12 items</p>
							<div class="mini-row">
								<span class="mini-btn">Continue</span>
								<span class="mini-link">Learn more</span>
							</div>
						</div>

						<div class="metrics">
							<span class="m" title="Body text — fg on bg">
								body <b style="color:{wcagColor(c.body.level)}">{c.body.ratio.toFixed(2)}</b>
								<i style="color:{apcaColor(c.body.use)}">Lc {Math.round(c.body.lc)}</i>
							</span>
							<span class="m" title="Button label — primaryFg on primary">
								btn <b style="color:{wcagColor(c.button.level)}">{c.button.ratio.toFixed(2)}</b>
							</span>
							<span class="m" title="Primary on bg — links, icons (large-text band)">
								accent <b style="color:{wcagColor(c.accent.level)}">{c.accent.ratio.toFixed(2)}</b>
							</span>
							<span class="m" title="Smallest ΔE2000 between bg, fg and primary">
								ΔE {c.minDeltaE.toFixed(1)}
							</span>
							<span
								class="m"
								class:bad={c.cvdMinDeltaE < 8}
								title="Worst case across protanopia / deuteranopia / tritanopia"
							>
								cvd ΔE {c.cvdMinDeltaE.toFixed(1)} · {c.cvdBodyRatio.toFixed(1)}
							</span>
							{#if !c.inGamut}
								<span class="m bad" title="Outside sRGB — will not render as authored">
									gamut: {c.outOfGamut.join(', ')}
								</span>
							{/if}
						</div>

						<div class="names">
							{#each [['bg', c.combo.bg], ['fg', c.combo.fg], ['primary', c.combo.primary], ['label', c.combo.primaryFg]] as [role, name] (role)}
								<span class="n"
									><i class="dot" style="background:{css(name)}"></i>{role}: {name}</span
								>
							{/each}
						</div>

						<footer class="card-foot">
							<button class="btn" onclick={() => apply(c)} disabled={isCurrent(c)}>
								{isCurrent(c) ? 'Applied' : 'Apply'}
							</button>
							{#if !ui.sourceLocked}
								<button class="link-btn" onclick={() => writeToEditor(c)}>Write to editor</button>
							{/if}
						</footer>
					</article>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.tool {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.controls {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		flex-wrap: wrap;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.controls .seg {
		margin-left: auto;
	}
	.hint {
		font-size: 12px;
		line-height: 1.55;
		color: var(--text-faint);
		max-width: 78ch;
	}
	.hint code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
	}
	.warn {
		color: var(--warn, #eab308);
	}
	.empty {
		color: var(--text-faint);
		font-size: 13px;
	}

	/* ── current baseline ── */
	.now {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface-2);
		font-size: 12px;
	}
	.now-label {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
	}
	.now-combo {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11.5px;
		color: var(--text);
	}
	.link-btn {
		background: none;
		border: none;
		color: var(--accent);
		cursor: pointer;
		font: inherit;
		font-size: 11px;
		padding: 0;
	}

	/* ── candidate grid ── */
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		padding: 10px;
	}
	.card.is-current {
		border-color: var(--accent);
	}
	.card-head {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.rank {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-faint);
	}
	.score {
		margin-left: auto;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12px;
		font-weight: 700;
		padding: 1px 8px;
		border-radius: 99px;
		color: var(--text);
		background: color-mix(in oklab, var(--ok) calc(var(--s) * 1%), transparent);
	}
	.pin {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 0 2px;
		color: var(--border-strong);
	}
	.pin.on {
		color: var(--accent);
	}

	/* ── the identical mini-UI every candidate is judged on ── */
	.mini {
		background: var(--c-bg);
		color: var(--c-fg);
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.mini-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	.mini-title {
		font-size: 15px;
		font-weight: 700;
	}
	.mini-badge {
		background: var(--c-primary);
		color: var(--c-primary-fg);
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 1px 7px;
		border-radius: 99px;
	}
	.mini-body {
		margin: 0;
		font-size: 11.5px;
		line-height: 1.5;
	}
	.mini-muted {
		margin: 0;
		font-size: 10.5px;
		opacity: 0.65;
	}
	.mini-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 2px;
	}
	.mini-btn {
		background: var(--c-primary);
		color: var(--c-primary-fg);
		font-size: 11px;
		font-weight: 600;
		padding: 5px 12px;
		border-radius: var(--radius-sm);
	}
	.mini-link {
		color: var(--c-primary);
		font-size: 11px;
		font-weight: 600;
	}

	/* ── metrics ── */
	.metrics {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.m {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10px;
		color: var(--text-muted);
		background: var(--surface-2);
		border-radius: 99px;
		padding: 1px 7px;
		white-space: nowrap;
	}
	.m b {
		font-weight: 700;
	}
	.m i {
		font-style: normal;
		margin-left: 4px;
	}
	.m.bad {
		background: color-mix(in srgb, var(--danger) 14%, transparent);
		color: var(--danger);
	}
	.names {
		display: flex;
		flex-wrap: wrap;
		gap: 3px 10px;
		font-size: 10px;
		color: var(--text-faint);
	}
	.n {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-width: 0;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 3px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		flex-shrink: 0;
		display: inline-block;
	}
	.card-foot {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: auto;
	}
	.card-foot .btn {
		font-size: 11px;
		padding: 3px 10px;
	}

	@media (max-width: 640px) {
		.controls .seg {
			margin-left: 0;
		}
		.cards {
			grid-template-columns: 1fr;
		}
	}
</style>
