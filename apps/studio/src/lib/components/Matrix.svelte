<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import type { ColorValue } from '$lib/models';
	import { contrastRatioAlpha } from '$lib/analysis/contrast';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';
	import { apcaContrast, apcaUse, apcaColor } from '$lib/analysis/apca';
	import { simulateVision, visionSimulations } from '$lib/analysis/cvd';

	type Cell = { name: string; color: ColorValue; description?: string };

	let selected = $state<{ bgIdx: number; fgIdx: number } | null>(null);
	let dialogEl = $state<HTMLDialogElement | null>(null);
	let infoDialogEl = $state<HTMLDialogElement | null>(null);

	const groups = $derived(
		app.scheme.groups.map((g) => ({
			label: g.label,
			colors: g.entries.map(
				(e): Cell =>
					app.visionSim === 'none'
						? { name: e.name, color: e.color, description: e.description }
						: {
								name: e.name,
								color: simulateVision(e.color, app.visionSim),
								description: e.description
							}
			)
		}))
	);
	const colors = $derived(groups.flatMap((g) => g.colors));
	const colTemplate = $derived(
		'auto ' + groups.map((g) => `repeat(${g.colors.length}, 1fr)`).join(' 6px ')
	);
	const fgAlpha = $derived(app.fgAlpha);
	let contrastModel = $state<'wcag' | 'apca'>('wcag');

	// Mobile single-axis view: pick one background, list every color as fg on it.
	let mBgIdx = $state(0);
	const safeBgIdx = $derived(colors.length ? Math.min(mBgIdx, colors.length - 1) : 0);
	const mBg = $derived(colors[safeBgIdx] ?? null);

	const sel = $derived(
		selected && colors[selected.bgIdx] && colors[selected.fgIdx]
			? { bg: colors[selected.bgIdx], fg: colors[selected.fgIdx] }
			: null
	);
	const selRatio = $derived(sel ? contrastRatioAlpha(sel.fg.color, sel.bg.color, fgAlpha) : 0);
	const selLevels = $derived(wcagLevels(selRatio));
	const selApca = $derived(sel ? apcaContrast(sel.fg.color, sel.bg.color) : 0);
	const selApcaUse = $derived(apcaUse(selApca));

	function fmtOklch(c: ColorValue): string {
		const fmt = (v: number, max: number) => {
			const s = v.toFixed(max);
			return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
		};
		return `oklch(${fmt(c.channel('ok_l'), 5)} ${fmt(c.channel('ok_c'), 5)} ${fmt(c.channel('ok_h'), 5)})`;
	}

	function selectCell(bgIdx: number, fgIdx: number) {
		selected = { bgIdx, fgIdx };
		dialogEl?.showModal();
	}
	function closeDialog() {
		dialogEl?.close();
		selected = null;
	}

	const markdownTable = $derived.by(() => {
		if (!colors.length) return '';
		const rows = colors.map((c) => ({
			name: c.name,
			hex: c.color.hex,
			oklch: fmtOklch(c.color),
			comment: c.description ?? ''
		}));
		const w = {
			name: Math.max(4, ...rows.map((r) => r.name.length)),
			hex: Math.max(3, ...rows.map((r) => r.hex.length)),
			oklch: Math.max(5, ...rows.map((r) => r.oklch.length)),
			comment: Math.max(7, ...rows.map((r) => r.comment.length))
		};
		const pad = (s: string, len: number) => s + ' '.repeat(len - s.length);
		const sep = `| ${'-'.repeat(w.name)} | ${'-'.repeat(w.hex)} | ${'-'.repeat(w.oklch)} | ${'-'.repeat(w.comment)} |`;
		const header = `| ${pad('name', w.name)} | ${pad('hex', w.hex)} | ${pad('oklch', w.oklch)} | ${pad('comment', w.comment)} |`;
		const body = rows.map(
			(r) =>
				`| ${pad(r.name, w.name)} | ${pad(r.hex, w.hex)} | ${pad(r.oklch, w.oklch)} | ${pad(r.comment, w.comment)} |`
		);
		return [header, sep, ...body].join('\n');
	});

	function copyMarkdown() {
		navigator.clipboard.writeText(markdownTable);
	}
</script>

<div class="matrix-root">
	<div class="matrix-toolbar">
		<label class="tb-field">
			<span class="tb-label">fg opacity</span>
			<input class="tb-range" type="range" min="0" max="100" bind:value={app.fgOpacity} />
			<span class="tb-val mono">{app.fgOpacity}%</span>
		</label>
		<select class="select" bind:value={app.visionSim}>
			{#each visionSimulations as sim (sim.value)}
				<option value={sim.value}>{sim.label}</option>
			{/each}
		</select>
		<div class="seg">
			<button
				class="seg-item {contrastModel === 'wcag' ? 'active' : ''}"
				onclick={() => (contrastModel = 'wcag')}>WCAG</button
			>
			<button
				class="seg-item {contrastModel === 'apca' ? 'active' : ''}"
				onclick={() => (contrastModel = 'apca')}>APCA</button
			>
		</div>
		<div class="legend">
			<span class="lg"><i style="background: {wcagColor('AAA')}"></i>AAA</span>
			<span class="lg"><i style="background: {wcagColor('AA')}"></i>AA</span>
			<span class="lg"><i style="background: {wcagColor('Fail')}"></i>Fail</span>
		</div>
		<div class="tb-spacer"></div>
		<button class="btn" onclick={() => infoDialogEl?.showModal()} disabled={!colors.length}>
			Info / Export
		</button>
	</div>

	{#if colors.length === 0}
		<div class="matrix-empty">
			Define at least one color in the editor to see the contrast matrix.
		</div>
	{:else if ui.isMobile}
		<div class="m-matrix">
			<div class="m-bgpick">
				<span class="m-bgpick-label">Background</span>
				<div class="m-bgpick-row scroll">
					{#each colors as c, i (c.name + i)}
						<button class="m-bgchip" class:active={i === safeBgIdx} onclick={() => (mBgIdx = i)}>
							<span class="m-bgchip-sw" style="background: {c.color.toCSS()}"></span>
							<span class="m-bgchip-name">{c.name}</span>
						</button>
					{/each}
				</div>
			</div>

			{#if mBg}
				<div class="m-samples" style="background: {mBg.color.toCSS()}">
					{#each colors as fg, fi (fg.name + fi)}
						{#if fi !== safeBgIdx}
							{@const ratio = contrastRatioAlpha(fg.color, mBg.color, fgAlpha)}
							{@const levels = wcagLevels(ratio)}
							{@const lc = apcaContrast(fg.color, mBg.color)}
							{@const use = apcaUse(lc)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<button
								class="m-sample"
								style="color: {fg.color.toCSS()}; --fg-alpha: {fgAlpha}"
								onclick={() => selectCell(safeBgIdx, fi)}
							>
								<div class="m-sample-top">
									<span class="m-sample-sw" style="background: {fg.color.toCSS()}"></span>
									<span class="m-sample-name">{fg.name}</span>
									<span class="m-sample-metric">
										{#if contrastModel === 'wcag'}
											<b>{ratio.toFixed(2)}</b><i style="background: {wcagColor(levels.normal)}"
												>{levels.normal}</i
											>
										{:else}
											<b>Lc {Math.round(lc)}</b><i style="background: {apcaColor(use)}">{use}</i>
										{/if}
									</span>
								</div>
								<div class="m-sample-text">
									<span class="m-st-lg">Heading sample</span>
									<span class="m-st-md">Body text — the quick brown fox</span>
									<span class="m-st-sm">Thin caption text</span>
								</div>
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="matrix-scroll">
			<div class="matrix-grid" style="grid-template-columns: {colTemplate}">
				<div class="matrix-corner">fg &#x2193; &nbsp; bg &#x2192;</div>

				{#each groups as colGroup, cgi (colGroup.label + cgi)}
					{#if cgi > 0}<div class="matrix-col-sep"></div>{/if}
					{#each colGroup.colors as bg (bg.name)}
						<div class="matrix-col-header">
							<span class="header-name" title={bg.name}>{bg.name}</span>
							<span class="header-hex">{bg.color.hex}</span>
							<div class="header-swatch-wide" style="background: {bg.color.toCSS()}"></div>
						</div>
					{/each}
				{/each}

				{#each groups as rowGroup, rgi (rowGroup.label + rgi)}
					{#if rgi > 0}
						<div class="matrix-row-sep" style="grid-column: 1 / -1">
							<span class="sep-label">{rowGroup.label}</span>
						</div>
					{/if}
					{#each rowGroup.colors as fg, localFi (fg.name)}
						{@const fgIdx = groups.slice(0, rgi).reduce((s, g) => s + g.colors.length, 0) + localFi}
						<div class="matrix-row-header">
							<div class="row-header-text">
								<div class="header-name" title={fg.name}>{fg.name}</div>
								<div class="header-hex">{fg.color.hex}</div>
							</div>
							<div class="row-header-swatch" style="background: {fg.color.toCSS()}"></div>
						</div>

						{#each groups as colGroup, cgi (colGroup.label + cgi)}
							{#if cgi > 0}<div class="matrix-cell-sep"></div>{/if}
							{#each colGroup.colors as bg, localBi (bg.name)}
								{@const bgIdx =
									groups.slice(0, cgi).reduce((s, g) => s + g.colors.length, 0) + localBi}
								{#if bgIdx === fgIdx}
									<div style="background: {bg.color.toCSS()}"></div>
								{:else}
									{@const ratio = contrastRatioAlpha(fg.color, bg.color, fgAlpha)}
									{@const levels = wcagLevels(ratio)}
									{@const lc = apcaContrast(fg.color, bg.color)}
									{@const use = apcaUse(lc)}
									{@const fail =
										contrastModel === 'wcag' ? levels.normal === 'Fail' : use === 'Fail'}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="matrix-cell"
										class:matrix-cell-fail={fail}
										style="background: {bg.color.toCSS()}; color: {fg.color.toCSS()}; --fg-alpha: {fgAlpha}"
										title="{bg.name} bg + {fg.name} fg — WCAG {ratio.toFixed(
											2
										)}:1 ({levels.normal}/{levels.large}) · APCA Lc {Math.round(lc)} ({use})"
										onclick={() => selectCell(bgIdx, fgIdx)}
									>
										<div class="cell-content">
											<div class="cell-header">
												{#if contrastModel === 'wcag'}
													<span class="cell-ratio">{ratio.toFixed(2)}</span>
													<span class="cell-wcag">{levels.normal}</span>
												{:else}
													<span class="cell-ratio">{Math.round(lc)}</span>
													<span class="cell-wcag">{use}</span>
												{/if}
											</div>
											<div class="cell-text-lg">Heading</div>
											<div class="cell-text-md">Body text sample</div>
											<div class="cell-text-sm">Thin caption</div>
											<div class="cell-line" style="background: {fg.color.toCSS()}"></div>
										</div>
									</div>
								{/if}
							{/each}
						{/each}
					{/each}
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Detail dialog -->
<dialog
	bind:this={dialogEl}
	class="detail-dialog"
	onclick={(e) => {
		if (e.target === dialogEl) closeDialog();
	}}
	onclose={() => (selected = null)}
>
	{#if sel}
		<div class="dialog-inner">
			<div class="dialog-info-bar">
				<div class="dialog-color-info">
					<div class="dialog-swatch" style="background: {sel.bg.color.toCSS()}"></div>
					<div>
						<div class="dialog-color-name">{sel.bg.name}</div>
						<div class="dialog-color-value">{sel.bg.color.hex}</div>
					</div>
				</div>
				<span class="dialog-on">on</span>
				<div class="dialog-color-info">
					<div class="dialog-swatch" style="background: {sel.fg.color.toCSS()}"></div>
					<div>
						<div class="dialog-color-name">{sel.fg.name}</div>
						<div class="dialog-color-value">{sel.fg.color.hex}</div>
					</div>
				</div>
				<div class="dialog-stats">
					<div class="dialog-stat">
						<div class="dialog-ratio">{selRatio.toFixed(2)}:1</div>
						<div class="dialog-stat-label">Contrast</div>
					</div>
					<div class="dialog-stat">
						<div class="dialog-badge" style="background: {wcagColor(selLevels.normal)}">
							{selLevels.normal}
						</div>
						<div class="dialog-stat-label">Normal</div>
					</div>
					<div class="dialog-stat">
						<div class="dialog-badge" style="background: {wcagColor(selLevels.large)}">
							{selLevels.large}
						</div>
						<div class="dialog-stat-label">Large</div>
					</div>
					<div class="dialog-stat">
						<div class="dialog-ratio">{Math.round(selApca)}</div>
						<div class="dialog-stat-label">APCA Lc</div>
					</div>
					<div class="dialog-stat">
						<div class="dialog-badge" style="background: {apcaColor(selApcaUse)}">{selApcaUse}</div>
						<div class="dialog-stat-label">Use</div>
					</div>
					<button class="dialog-close" onclick={closeDialog}>Close</button>
				</div>
			</div>

			<div
				class="dialog-preview"
				style="background: {sel.bg.color.toCSS()}; color: {sel.fg.color.toCSS()}"
			>
				<h2 style="font-size: 28px; font-weight: 700; margin: 0">Heading sample</h2>
				<p style="font-size: 15px; line-height: 1.6; margin: 0">
					Body copy — the quick brown fox jumps over the lazy dog. Lorem ipsum dolor sit amet,
					consectetur adipiscing elit, sed do eiusmod tempor incididunt.
				</p>
				<p style="font-size: 13px; opacity: 0.65; margin: 0">Muted secondary text (65%).</p>
				<div class="dialog-ui-row">
					<button
						class="dialog-btn-filled"
						style="background: {sel.fg.color.toCSS()}; color: {sel.bg.color.toCSS()}">Filled</button
					>
					<button
						class="dialog-btn-outline"
						style="border-color: {sel.fg.color.toCSS()}; color: {sel.fg.color.toCSS()}"
						>Outline</button
					>
					<span
						class="dialog-badge-ui"
						style="background: {sel.fg.color.toCSS()}; color: {sel.bg.color.toCSS()}">Badge</span
					>
					<span style="text-decoration: underline; font-size: 14px">Link text</span>
				</div>
				<hr
					style="border-color: {sel.fg.color.toCSS()}; border-top-width: 1px; opacity: 1; width: 100%"
				/>
			</div>
		</div>
	{/if}
</dialog>

<!-- Info / export dialog -->
<dialog
	bind:this={infoDialogEl}
	class="info-dialog"
	onclick={(e) => {
		if (e.target === infoDialogEl) infoDialogEl?.close();
	}}
>
	<div class="info-inner">
		<div class="info-header">
			<h2 class="info-title">Scheme — {colors.length} colors</h2>
			<button class="tb-btn" onclick={copyMarkdown}>Copy Markdown</button>
			<button class="dialog-close" onclick={() => infoDialogEl?.close()}>Close</button>
		</div>
		<div class="info-body">
			{#each groups as group (group.label)}
				<div class="info-group-label">{group.label}</div>
				{#each group.colors as color (color.name)}
					<div class="info-color-row">
						<div class="info-color-swatch" style="background: {color.color.toCSS()}"></div>
						<div class="info-color-details">
							<div class="info-color-name">{color.name}</div>
							<div class="info-color-values">
								<span class="info-value">{color.color.hex}</span>
								<span class="info-value">{fmtOklch(color.color)}</span>
								{#if !color.color.inGamut}
									<span class="info-oog">out of sRGB (mapped: {color.color.gamutMapped.hex})</span>
								{:else if color.color.inP3}
									<span class="info-p3">P3</span>
								{/if}
							</div>
							{#if color.description}
								<div class="info-description">{color.description}</div>
							{/if}
						</div>
					</div>
				{/each}
			{/each}
			<div class="info-markdown"><pre class="info-markdown-pre">{markdownTable}</pre></div>
		</div>
	</div>
</dialog>

<style>
	.matrix-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--bg);
		color: var(--text);
	}
	.matrix-toolbar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 9px 14px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.tb-spacer {
		flex: 1;
	}
	.tb-field {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--surface-2);
	}
	.tb-label {
		font-size: 11px;
		color: var(--text-muted);
	}
	.tb-range {
		width: 84px;
		accent-color: var(--accent);
	}
	.tb-val {
		font-size: 11px;
		color: var(--text);
		width: 30px;
	}
	.legend {
		display: flex;
		gap: 12px;
	}
	.lg {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.lg i {
		width: 9px;
		height: 9px;
		border-radius: 3px;
	}
	.matrix-empty {
		padding: 32px;
		color: var(--text-faint);
		font-size: 13px;
	}
	.matrix-scroll {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}
	.matrix-grid {
		display: grid;
		gap: 2px;
		width: max-content;
	}
	.matrix-corner {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 30;
		background: var(--bg);
		padding: 8px;
		font-size: 11px;
		color: var(--text-faint);
		display: flex;
		align-items: end;
	}
	.matrix-col-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg);
		padding: 4px 0 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}
	.matrix-row-header {
		position: sticky;
		left: 0;
		z-index: 10;
		background: var(--bg);
		display: flex;
		align-items: stretch;
		min-width: 9rem;
	}
	.header-swatch-wide {
		width: calc(100% - 8px);
		height: 13px;
		margin: 2px 4px 4px;
		border-radius: 4px;
		flex-shrink: 0;
	}
	.row-header-swatch {
		width: 13px;
		margin: 4px;
		border-radius: 4px;
		flex-shrink: 0;
	}
	.row-header-text {
		padding: 4px 8px 6px;
		flex: 1;
		min-width: 0;
	}
	.header-name {
		font-size: 11px;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		width: 11rem;
		text-align: center;
	}
	.row-header-text .header-name {
		text-align: left;
		width: auto;
	}
	.header-hex {
		font-family: monospace;
		font-size: 9px;
		color: var(--text-muted);
	}
	.matrix-cell {
		cursor: pointer;
	}
	.matrix-cell-fail {
		clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
	}
	.cell-content {
		width: 11rem;
		padding: 6px 8px;
		display: flex;
		flex-direction: column;
		gap: 3px;
		overflow: hidden;
		opacity: var(--fg-alpha, 1);
	}
	.cell-header {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-family: monospace;
	}
	.cell-ratio {
		font-size: 11px;
		font-weight: 700;
	}
	.cell-wcag {
		font-size: 9px;
		font-weight: 700;
		opacity: 0.7;
	}
	.cell-text-lg {
		font-size: 15px;
		font-weight: 700;
		line-height: 1.1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.cell-text-md {
		font-size: 11px;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.cell-text-sm {
		font-size: 9px;
		font-weight: 200;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.cell-line {
		height: 1px;
	}
	.matrix-col-sep,
	.matrix-cell-sep {
		background: var(--bg);
	}
	.matrix-row-sep {
		display: flex;
		align-items: center;
		padding: 2px 8px;
		background: var(--bg);
	}
	.sep-label {
		font-size: 10px;
		color: var(--text-faint);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* dialogs */
	.detail-dialog {
		padding: 0;
		border: none;
		border-radius: 12px;
		max-width: 90vw;
		max-height: 90vh;
		width: 720px;
		overflow: hidden;
		background: transparent;
		margin: auto;
	}
	.detail-dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
	}
	.dialog-inner {
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}
	.dialog-info-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
		padding: 12px 20px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
	}
	.dialog-color-info {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dialog-swatch {
		width: 28px;
		height: 28px;
		border-radius: 4px;
		border: 1px solid var(--border-strong);
	}
	.dialog-color-name {
		font-weight: 500;
	}
	.dialog-color-value {
		font-family: monospace;
		font-size: 11px;
		color: var(--text-muted);
	}
	.dialog-on {
		color: var(--text-faint);
	}
	.dialog-stats {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 18px;
	}
	.dialog-stat {
		text-align: center;
	}
	.dialog-ratio {
		font-family: monospace;
		font-size: 20px;
		font-weight: 700;
	}
	.dialog-stat-label {
		font-size: 10px;
		color: var(--text-muted);
	}
	.dialog-badge {
		color: #000;
		font-weight: 700;
		font-size: 14px;
		padding: 2px 8px;
		border-radius: 4px;
	}
	.dialog-close {
		margin-left: 8px;
		padding: 6px 12px;
		border-radius: 4px;
		color: var(--text-muted);
		background: none;
		border: 1px solid var(--border-strong);
		cursor: pointer;
	}
	.dialog-close:hover {
		color: var(--text);
		border-color: var(--text-faint);
	}
	.dialog-preview {
		padding: 28px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		overflow: auto;
	}
	.dialog-ui-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}
	.dialog-btn-filled {
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		border: none;
		cursor: pointer;
	}
	.dialog-btn-outline {
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 500;
		border: 1px solid;
		background: none;
		cursor: pointer;
	}
	.dialog-badge-ui {
		padding: 2px 10px;
		border-radius: 99px;
		font-size: 12px;
		font-weight: 600;
	}
	.info-dialog {
		padding: 0;
		border: none;
		border-radius: 12px;
		max-width: 700px;
		max-height: 90vh;
		width: 90vw;
		overflow: hidden;
		background: var(--bg);
		color: var(--text);
		margin: auto;
	}
	.info-dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
	}
	.info-inner {
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}
	.info-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 20px;
		border-bottom: 1px solid var(--border);
	}
	.info-title {
		font-size: 16px;
		font-weight: 600;
		margin-right: auto;
	}
	.info-body {
		overflow: auto;
		flex: 1;
		min-height: 0;
	}
	.info-color-row {
		display: flex;
		border-bottom: 1px solid var(--border);
	}
	.info-color-swatch {
		width: 48px;
		flex-shrink: 0;
	}
	.info-color-details {
		padding: 10px 16px;
		flex: 1;
		min-width: 0;
	}
	.info-color-name {
		font-size: 14px;
		font-weight: 600;
	}
	.info-color-values {
		display: flex;
		gap: 12px;
		margin-top: 2px;
		flex-wrap: wrap;
	}
	.info-value {
		font-family: monospace;
		font-size: 12px;
		color: var(--text-muted);
	}
	.info-oog {
		font-size: 11px;
		color: var(--danger);
	}
	.info-p3 {
		font-size: 11px;
		color: var(--accent);
	}
	.info-description {
		margin-top: 3px;
		font-family: monospace;
		font-size: 12px;
		color: var(--text-muted);
	}
	.info-group-label {
		padding: 8px 16px 4px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-faint);
		border-top: 1px solid var(--border);
	}
	.info-markdown {
		padding: 12px 16px;
		border-top: 1px solid var(--border);
	}
	.info-markdown-pre {
		font-family: monospace;
		font-size: 11px;
		color: var(--text-muted);
		white-space: pre;
		overflow-x: auto;
		margin: 0;
		line-height: 1.5;
	}

	/* ---- mobile single-axis contrast view ---- */
	.m-matrix {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.m-bgpick {
		flex-shrink: 0;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
		padding: 8px 0 10px;
	}
	.m-bgpick-label {
		display: block;
		padding: 0 14px 6px;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.m-bgpick-row {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding: 0 14px;
		-webkit-overflow-scrolling: touch;
	}
	.m-bgchip {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 6px 12px 6px 8px;
		border: 1px solid var(--border);
		border-radius: 99px;
		background: var(--surface);
		color: var(--text);
		font-size: 12.5px;
		cursor: pointer;
	}
	.m-bgchip.active {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}
	.m-bgchip-sw {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 1px solid var(--border-strong);
		flex-shrink: 0;
	}
	.m-samples {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.m-sample {
		display: block;
		width: 100%;
		text-align: left;
		border: none;
		border-radius: var(--radius-sm);
		padding: 12px 14px;
		background: transparent;
		cursor: pointer;
		box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.18);
	}
	.m-sample-top {
		display: flex;
		align-items: center;
		gap: 9px;
		opacity: var(--fg-alpha, 1);
	}
	.m-sample-sw {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		flex-shrink: 0;
		box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.3);
	}
	.m-sample-name {
		font-size: 14px;
		font-weight: 650;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.m-sample-metric {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		flex-shrink: 0;
		font-family: monospace;
	}
	.m-sample-metric b {
		font-size: 13px;
	}
	.m-sample-metric i {
		font-style: normal;
		font-weight: 700;
		font-size: 10.5px;
		color: #0b0b0c;
		padding: 1px 7px;
		border-radius: 99px;
	}
	.m-sample-text {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		opacity: var(--fg-alpha, 1);
	}
	.m-st-lg {
		font-size: 19px;
		font-weight: 700;
		line-height: 1.15;
	}
	.m-st-md {
		font-size: 13px;
		line-height: 1.3;
	}
	.m-st-sm {
		font-size: 10.5px;
		font-weight: 300;
		line-height: 1.3;
	}

	@media (max-width: 768px) {
		.matrix-toolbar {
			flex-wrap: wrap;
			gap: 8px 10px;
			padding: 10px 12px;
		}
		.tb-spacer {
			display: none;
		}
		.matrix-toolbar .btn {
			margin-left: auto;
		}

		.detail-dialog,
		.info-dialog {
			width: 100vw;
			max-width: 100vw;
			height: 100dvh;
			max-height: 100dvh;
			border-radius: 0;
		}
		.dialog-inner,
		.info-inner {
			height: 100dvh;
			max-height: 100dvh;
		}
		.dialog-stats {
			margin-left: 0;
			width: 100%;
			flex-wrap: wrap;
			gap: 14px;
		}
		.dialog-preview {
			flex: 1;
		}
	}
</style>
