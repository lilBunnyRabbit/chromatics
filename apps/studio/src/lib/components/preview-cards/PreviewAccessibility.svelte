<script lang="ts">
	import { contrastRatio } from '$lib/analysis/contrast';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';
	import { apcaContrast, apcaUse, apcaColor } from '$lib/analysis/apca';
	import { simulateVision, visionSimulations } from '$lib/analysis/cvd';

	let { data }: { data: any } = $props();

	const kind = $derived(data?.__preview as string);

	// — pair —
	const pairCss = $derived(kind === 'pair' ? { bg: data.bg.toCSS(), fg: data.fg.toCSS() } : null);
	const ratio = $derived(kind === 'pair' ? contrastRatio(data.fg, data.bg) : 0);
	const wcag = $derived(kind === 'pair' ? wcagLevels(ratio) : null);
	const lc = $derived(kind === 'pair' ? apcaContrast(data.fg, data.bg) : 0);
	const use = $derived(kind === 'pair' ? apcaUse(lc) : 'Fail');

	// — cvd —
	const cvdModes = $derived(visionSimulations.filter((s) => s.value !== 'none'));

	// — onBackgrounds —
	const backgrounds = $derived(kind === 'onBackgrounds' ? (data.backgrounds ?? []) : []);
</script>

<div class="pa-root">
	{#if kind === 'pair' && pairCss && wcag}
		<!-- ── Type specimen ─────────────────────────────── -->
		<div class="metrics">
			<div class="metric">
				<span class="m-label">WCAG</span>
				<span class="m-val">{ratio.toFixed(2)}</span>
				<span class="badge" style="background:{wcagColor(wcag.normal)}">{wcag.normal}</span>
			</div>
			<div class="metric">
				<span class="m-label">APCA</span>
				<span class="m-val">{Math.round(lc)}<span class="lc">Lc</span></span>
				<span class="badge" style="background:{apcaColor(use)}">{use}</span>
			</div>
		</div>
		<p class="hint">
			APCA's verdict depends on size &amp; weight — that's why the specimen spans several.
		</p>

		<div class="specimen" style="background:{pairCss.bg}; color:{pairCss.fg}">
			<div class="sp-h1">Heading</div>
			<div class="sp-h2">Color is a power which directly influences the soul</div>
			<hr class="rule-thin" style="border-color:{pairCss.fg}" />
			<p class="sp-body">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</p>
			<hr class="rule-thick" style="border-color:{pairCss.fg}" />
			<div class="sp-small">Small caption — 12px regular weight, the readability floor.</div>
			<div class="sp-label">THIN LABEL · 11PX · 300</div>
		</div>
	{:else if kind === 'cvd'}
		<!-- ── Color-vision-deficiency swatches ──────────── -->
		<div class="swatch-row">
			<div class="swatch-cell">
				<div class="swatch" style="background:{data.color.toCSS()}"></div>
				<span class="sw-label">Normal</span>
				<span class="sw-hex">{data.color.hex}</span>
			</div>
			{#each cvdModes as s (s.value)}
				{@const sim = simulateVision(data.color, s.value)}
				<div class="swatch-cell">
					<div class="swatch" style="background:{sim.hex}"></div>
					<span class="sw-label">{s.label}</span>
					<span class="sw-hex">{sim.hex}</span>
				</div>
			{/each}
		</div>
	{:else if kind === 'onBackgrounds'}
		<!-- ── Color across backgrounds ──────────────────── -->
		{#if backgrounds.length === 0}
			<p class="note">
				Pass an array of backgrounds, e.g.
				<code>preview.onBackgrounds(brand, [bg, surface, white])</code>
			</p>
		{:else}
			<div class="tile-row">
				{#each backgrounds as bg, i (i)}
					{@const r = contrastRatio(data.color, bg)}
					{@const lv = wcagLevels(r).normal}
					<div class="tile-cell">
						<div class="tile" style="background:{bg.toCSS()}; color:{data.color.toCSS()}">
							<span class="aa">Aa</span>
							<span class="dot" style="background:{data.color.toCSS()}"></span>
						</div>
						<div class="tile-meta">
							<span class="t-ratio">{r.toFixed(1)}</span>
							<span class="badge" style="background:{wcagColor(lv)}">{lv}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.pa-root {
		padding: 4px;
		width: 100%;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		box-sizing: border-box;
	}

	/* ── shared badge ── */
	.badge {
		display: inline-block;
		padding: 1px 6px;
		border-radius: var(--radius-sm, 4px);
		font-size: 10px;
		font-weight: 700;
		line-height: 1.4;
		color: #0b0b0b;
		letter-spacing: 0.02em;
	}

	/* ── pair: metrics ── */
	.metrics {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 4px;
	}
	.metric {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1 1 auto;
		min-width: 120px;
		padding: 6px 8px;
		background: var(--surface-2, #1a1a1a);
		border: 1px solid var(--border, #2a2a2a);
		border-radius: var(--radius-sm, 4px);
	}
	.m-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: var(--text-faint, #777);
	}
	.m-val {
		font-size: 15px;
		font-weight: 700;
		color: var(--text, #eee);
		margin-left: auto;
	}
	.lc {
		font-size: 10px;
		font-weight: 500;
		color: var(--text-faint, #777);
		margin-left: 2px;
	}
	.hint {
		margin: 0 0 8px;
		font-size: 10px;
		line-height: 1.4;
		color: var(--text-faint, #777);
	}

	/* ── pair: specimen ── */
	.specimen {
		padding: 16px;
		border-radius: var(--radius, 8px);
		border: 1px solid var(--border, #2a2a2a);
		overflow: hidden;
	}
	.sp-h1 {
		font-size: 28px;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.01em;
	}
	.sp-h2 {
		font-size: 18px;
		font-weight: 600;
		line-height: 1.25;
		margin-top: 6px;
	}
	.sp-body {
		font-size: 15px;
		font-weight: 400;
		line-height: 1.5;
		margin: 0;
	}
	.sp-small {
		font-size: 12px;
		font-weight: 400;
		line-height: 1.4;
		opacity: 0.92;
	}
	.sp-label {
		font-size: 11px;
		font-weight: 300;
		letter-spacing: 0.12em;
		margin-top: 4px;
		opacity: 0.85;
	}
	.rule-thin {
		border: 0;
		border-top: 1px solid currentColor;
		margin: 12px 0;
		opacity: 0.85;
	}
	.rule-thick {
		border: 0;
		border-top: 3px solid currentColor;
		margin: 12px 0;
		opacity: 0.85;
	}

	/* ── cvd: swatches ── */
	.swatch-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.swatch-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		width: 64px;
	}
	.swatch {
		width: 100%;
		height: 44px;
		border-radius: var(--radius-sm, 4px);
		border: 1px solid var(--border, #2a2a2a);
	}
	.sw-label {
		font-size: 9px;
		line-height: 1.2;
		text-align: center;
		color: var(--text-muted, #aaa);
	}
	.sw-hex {
		font-size: 9px;
		color: var(--text-faint, #777);
	}

	/* ── onBackgrounds: tiles ── */
	.tile-row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.tile-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 72px;
	}
	.tile {
		width: 100%;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border-radius: var(--radius-sm, 4px);
		border: 1px solid var(--border, #2a2a2a);
	}
	.aa {
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.tile-meta {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.t-ratio {
		font-size: 11px;
		font-weight: 600;
		color: var(--text, #eee);
	}
	.note {
		margin: 0;
		font-size: 11px;
		line-height: 1.5;
		color: var(--text-faint, #777);
		overflow-wrap: anywhere;
		word-break: break-word;
	}
	.note code {
		font-family: inherit;
		font-size: 10px;
		color: var(--text-muted, #aaa);
		background: var(--surface-2, #1a1a1a);
		padding: 1px 4px;
		border-radius: var(--radius-sm, 4px);
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	/* ── narrow viewports ── */
	@media (max-width: 480px) {
		.specimen {
			padding: 12px;
		}
		.sp-h1 {
			font-size: 24px;
		}
	}
</style>
