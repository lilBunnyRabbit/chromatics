<script lang="ts">
	import { contrastRatio } from '$lib/analysis/contrast';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';

	let { data }: { data: any } = $props();

	// ── palette ───────────────────────────────────────────────
	const paletteColors = $derived.by(() => {
		if (data?.__preview !== 'palette') return [];
		return (data.colors ?? []) as any[];
	});

	// ── grid (contrast matrix) ────────────────────────────────
	const GRID_CAP = 8;

	const gridColors = $derived.by(() => {
		if (data?.__preview !== 'grid') return [];
		return ((data.colors ?? []) as any[]).slice(0, GRID_CAP);
	});

	const gridTruncated = $derived(
		data?.__preview === 'grid' && (data.colors?.length ?? 0) > GRID_CAP
	);

	// rows = fg, cols = bg
	const gridRows = $derived.by(() => {
		const cols = gridColors;
		return cols.map((fg, r) =>
			cols.map((bg, c) => {
				if (r === c) {
					return { diagonal: true, color: fg, ratio: 0, level: 'AAA' as const };
				}
				const ratio = contrastRatio(fg, bg);
				const level = wcagLevels(ratio).normal;
				return { diagonal: false, fg, bg, ratio, level };
			})
		);
	});

	// ── chart ─────────────────────────────────────────────────
	const CHART_HEIGHTS = [62, 38, 80, 50, 28, 70];

	const chartColors = $derived.by(() => {
		if (data?.__preview !== 'chart') return [];
		return (data.colors ?? []) as any[];
	});

	const chartBars = $derived.by(() => {
		const cols = chartColors;
		if (cols.length === 0) return [];
		return CHART_HEIGHTS.map((h, i) => ({
			h,
			css: cols[i % cols.length].toCSS()
		}));
	});

	const chartLegend = $derived.by(() => chartColors.slice(0, 6));

	// ── ui ────────────────────────────────────────────────────
	const ui = $derived.by(() => {
		if (data?.__preview !== 'ui') return null;
		const { bg, fg, primary } = data;
		if (!bg || !fg || !primary) return null;
		const primaryText = primary.channel('ok_l') > 0.6 ? '#000' : '#fff';
		return {
			bg: bg.toCSS(),
			fg: fg.toCSS(),
			primary: primary.toCSS(),
			primaryText
		};
	});

	// ── brandMark ─────────────────────────────────────────────
	const brand = $derived.by(() => {
		if (data?.__preview !== 'brandMark') return null;
		if (!data.color) return null;
		return data.color.toCSS();
	});
</script>

<div class="body">
	{#if data.__preview === 'palette'}
		{#if paletteColors.length === 0}
			<div class="empty">empty palette</div>
		{:else}
			<div class="pal-bar">
				{#each paletteColors as c, i (i)}
					<span class="pal-seg" style:background={c.toCSS()}></span>
				{/each}
			</div>
			<div class="pal-labels">
				{#each paletteColors as c, i (i)}
					<span class="pal-hex">{c.hex}</span>
				{/each}
			</div>
		{/if}
	{:else if data.__preview === 'grid'}
		{#if gridColors.length === 0}
			<div class="empty">no colors</div>
		{:else}
			<div class="grid">
				<table class="grid-table">
					<tbody>
						<tr>
							<td class="grid-corner"></td>
							{#each gridColors as bg, c (c)}
								<td class="grid-head">
									<span class="grid-dot" style:background={bg.toCSS()}></span>
								</td>
							{/each}
						</tr>
						{#each gridRows as row, r (r)}
							<tr>
								<td class="grid-head grid-head-row">
									<span class="grid-dot" style:background={gridColors[r].toCSS()}></span>
								</td>
								{#each row as cell, c (c)}
									{#if cell.diagonal}
										<td class="grid-cell grid-diag" style:background={cell.color.toCSS()}></td>
									{:else}
										<td
											class="grid-cell"
											style:background={cell.bg.toCSS()}
											style:color={cell.fg.toCSS()}
											style:--flag={wcagColor(cell.level)}
											class:fail={cell.level === 'Fail'}
										>
											<span class="grid-ratio">{cell.ratio.toFixed(1)}</span>
										</td>
									{/if}
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="caption">
				fg × bg contrast{#if gridTruncated}
					· first {GRID_CAP} of {data.colors.length}{/if}
			</div>
		{/if}
	{:else if data.__preview === 'chart'}
		{#if chartBars.length === 0}
			<div class="empty">no colors</div>
		{:else}
			<div class="chart">
				{#each chartBars as bar, i (i)}
					<div class="chart-col">
						<span class="chart-bar" style:height={bar.h + '%'} style:background={bar.css}></span>
					</div>
				{/each}
			</div>
			<div class="legend">
				{#each chartLegend as c, i (i)}
					<span class="legend-item">
						<span class="legend-sw" style:background={c.toCSS()}></span>
						<span class="legend-lbl">{c.hex}</span>
					</span>
				{/each}
			</div>
		{/if}
	{:else if data.__preview === 'ui'}
		{#if ui}
			<div class="ui-card" style:background={ui.bg} style:color={ui.fg}>
				<div class="ui-head">
					Acme Dashboard
					<span class="ui-badge" style:background={ui.primary} style:color={ui.primaryText}
						>New</span
					>
				</div>
				<p class="ui-body">A compact themed component swatch with real controls.</p>
				<div class="ui-actions">
					<button class="ui-btn" style:background={ui.primary} style:color={ui.primaryText}>
						Continue
					</button>
					<button class="ui-btn ui-btn-outline" style:border-color={ui.fg} style:color={ui.fg}>
						Cancel
					</button>
				</div>
			</div>
		{:else}
			<div class="empty">missing bg/fg/primary</div>
		{/if}
	{:else if data.__preview === 'brandMark'}
		{#if brand}
			<div class="brand-row">
				<!-- on white -->
				<div class="brand-tile" style:background="#fff" style:color="#111">
					<svg class="brand-glyph" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="3" y="3" width="13" height="13" rx="4" fill={brand} />
						<rect x="8" y="8" width="13" height="13" rx="4" fill={brand} opacity="0.65" />
					</svg>
					<span class="brand-word">Acme</span>
				</div>
				<!-- on near-black -->
				<div class="brand-tile" style:background="#111" style:color="#fff">
					<svg class="brand-glyph" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="3" y="3" width="13" height="13" rx="4" fill={brand} />
						<rect x="8" y="8" width="13" height="13" rx="4" fill={brand} opacity="0.65" />
					</svg>
					<span class="brand-word">Acme</span>
				</div>
				<!-- reversed: white glyph/text on color fill -->
				<div class="brand-tile" style:background={brand} style:color="#fff">
					<svg class="brand-glyph" viewBox="0 0 24 24" aria-hidden="true">
						<rect x="3" y="3" width="13" height="13" rx="4" fill="#fff" />
						<rect x="8" y="8" width="13" height="13" rx="4" fill="#fff" opacity="0.65" />
					</svg>
					<span class="brand-word">Acme</span>
				</div>
			</div>
		{:else}
			<div class="empty">no color</div>
		{/if}
	{/if}
</div>

<style>
	.body {
		padding: 4px;
		width: 100%;
		box-sizing: border-box;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--text);
	}

	.empty {
		font-size: 10px;
		color: var(--text-faint);
		padding: 8px 2px;
	}

	.caption {
		margin-top: 4px;
		font-size: 10px;
		color: var(--text-faint);
	}

	/* palette */
	.pal-bar {
		display: flex;
		width: 100%;
		height: 44px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.pal-seg {
		flex: 1 1 0;
		min-width: 0;
	}
	.pal-labels {
		display: flex;
		width: 100%;
		margin-top: 4px;
	}
	.pal-hex {
		flex: 1 1 0;
		min-width: 0;
		text-align: center;
		font-size: 8px;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 1px;
	}

	/* grid */
	.grid {
		width: 100%;
		overflow-x: auto;
	}
	.grid-table {
		border-collapse: separate;
		border-spacing: 2px;
	}
	.grid-corner,
	.grid-head {
		width: 16px;
		height: 16px;
		padding: 0;
	}
	.grid-head {
		text-align: center;
		vertical-align: middle;
	}
	.grid-dot {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		border: 1px solid var(--border);
		vertical-align: middle;
	}
	.grid-cell {
		width: 36px;
		height: 36px;
		min-width: 36px;
		text-align: center;
		vertical-align: middle;
		border-radius: 3px;
		box-shadow: inset 0 0 0 2px var(--flag, transparent);
		position: relative;
	}
	.grid-diag {
		box-shadow: inset 0 0 0 1px var(--border);
	}
	.grid-ratio {
		font-size: 10px;
		font-weight: 600;
		line-height: 1;
	}
	.grid-cell.fail::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		border-width: 0 7px 7px 0;
		border-style: solid;
		border-color: transparent var(--flag) transparent transparent;
		border-top-right-radius: 3px;
	}

	/* chart */
	.chart {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		width: 100%;
		height: 64px;
		padding: 2px 2px 0;
		box-sizing: border-box;
		border-bottom: 1px solid var(--border);
	}
	.chart-col {
		flex: 1 1 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		height: 100%;
		min-width: 0;
	}
	.chart-bar {
		width: 100%;
		border-radius: 3px 3px 0 0;
		min-height: 3px;
		border: 1px solid var(--border);
		border-bottom: none;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 8px;
		margin-top: 6px;
	}
	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.legend-sw {
		width: 10px;
		height: 10px;
		border-radius: 2px;
		border: 1px solid var(--border);
	}
	.legend-lbl {
		font-size: 9px;
		color: var(--text-muted);
	}

	/* ui */
	.ui-card {
		width: 100%;
		box-sizing: border-box;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		padding: 10px;
	}
	.ui-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		font-size: 12px;
		font-weight: 700;
	}
	.ui-badge {
		font-size: 8px;
		font-weight: 700;
		padding: 2px 5px;
		border-radius: 999px;
		line-height: 1;
		white-space: nowrap;
	}
	.ui-body {
		margin: 6px 0 10px;
		font-size: 10px;
		line-height: 1.4;
		opacity: 0.85;
	}
	.ui-actions {
		display: flex;
		gap: 6px;
	}
	.ui-btn {
		font-family: inherit;
		font-size: 10px;
		font-weight: 600;
		padding: 5px 10px;
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		cursor: default;
		line-height: 1;
	}
	.ui-btn-outline {
		background: transparent;
		border-style: solid;
		border-width: 1px;
	}

	/* brandMark */
	.brand-row {
		display: flex;
		gap: 6px;
		width: 100%;
	}
	.brand-tile {
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 8px 6px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
	}
	.brand-glyph {
		width: 20px;
		height: 20px;
		flex: 0 0 auto;
	}
	.brand-word {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	/* ── small screens (mobile shell renders these near full width) ── */
	@media (max-width: 480px) {
		/* brandMark: stack the 3 lockup tiles, one per line */
		.brand-row {
			flex-direction: column;
		}

		/* grid: keep header row + first column labels visible while
		   scrolling the contrast matrix horizontally (.grid is overflow-x:auto) */
		.grid-head {
			position: sticky;
			top: 0;
			z-index: 1;
			background: var(--surface);
		}
		.grid-head-row,
		.grid-corner {
			position: sticky;
			left: 0;
			z-index: 2;
			background: var(--surface);
		}
	}
</style>
