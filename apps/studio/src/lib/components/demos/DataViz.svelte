<script lang="ts">
	import type { SchemeEntry } from '$lib/scheme/types';

	let { entries }: { entries: SchemeEntry[] } = $props();

	/** CSS color strings for every entry, in source order — the categorical chart scale. */
	const series = $derived(entries.map((e) => e.color.toCSS()));

	/** Cycling color accessor: wraps when there are fewer colors than data points. */
	const at = (i: number): string =>
		series.length
			? series[((i % series.length) + series.length) % series.length]
			: 'var(--primary)';

	// ── Sample datasets (hardcoded — this is a preview of the user's palette) ──

	/** Grouped bar: four quarters, up to four product-line series. */
	const barSeries = ['Direct', 'Channel', 'Online', 'Retail'];
	const barCategories = ['Q1', 'Q2', 'Q3', 'Q4'];
	const barData: number[][] = [
		// rows = categories, cols = series
		[34, 22, 41, 18],
		[28, 31, 36, 24],
		[45, 27, 30, 33],
		[39, 38, 48, 29]
	];
	const barMax = Math.max(1, ...barData.flat());

	/** Line / area: seven points, three trend series. */
	const lineSeries = ['Sessions', 'Signups', 'Revenue'];
	const linePoints = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const lineData: number[][] = [
		// rows = series, cols = points
		[20, 34, 28, 46, 40, 58, 54],
		[12, 18, 22, 19, 30, 26, 38],
		[8, 14, 11, 20, 24, 22, 33]
	];

	// Geometry for the line chart viewBox (unitless; SVG scales to the card).
	const LW = 280;
	const LH = 160;
	const LPAD = 8;
	const lineMax = Math.max(1, ...lineData.flat());

	function lx(i: number): number {
		const span = linePoints.length - 1 || 1;
		return LPAD + (i / span) * (LW - LPAD * 2);
	}
	function ly(v: number): number {
		// Invert: larger value → higher on screen (smaller y).
		return LH - LPAD - (v / lineMax) * (LH - LPAD * 2);
	}

	/** Build a "x,y x,y …" points string for an SVG polyline. */
	function polyPoints(values: number[]): string {
		return values.map((v, i) => `${lx(i)},${ly(v)}`).join(' ');
	}

	/** Closed area path under a single series (down to the baseline). */
	const areaPath = $derived.by(() => {
		const vals = lineData[0];
		const top = vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${lx(i)},${ly(v)}`).join(' ');
		const base = LH - LPAD;
		return `${top} L${lx(vals.length - 1)},${base} L${lx(0)},${base} Z`;
	});

	/** Donut: small breakdown dataset. */
	const donutData = [
		{ label: 'Mobile', value: 52 },
		{ label: 'Desktop', value: 31 },
		{ label: 'Tablet', value: 12 },
		{ label: 'Other', value: 5 }
	];
	const donutTotal = donutData.reduce((sum, d) => sum + d.value, 0);

	// Donut geometry — a single circle per segment using stroke-dasharray.
	const DONUT_R = 60;
	const DONUT_C = 2 * Math.PI * DONUT_R; // circumference

	/** Each segment as a dash arc, with a running offset around the ring. */
	const donutSegments = $derived.by(() => {
		let acc = 0;
		return donutData.map((d, i) => {
			const frac = donutTotal ? d.value / donutTotal : 0;
			const dash = frac * DONUT_C;
			const seg = {
				color: at(i),
				dash,
				gap: DONUT_C - dash,
				// Negative offset rotates the arc's start to the running position.
				offset: -acc * DONUT_C,
				label: d.label,
				value: d.value
			};
			acc += frac;
			return seg;
		});
	});

	/** Sequential ramp: 7 steps from the first brand color → near-black, via color-mix. */
	const rampSteps = $derived(
		Array.from({ length: 7 }, (_, k) => ({
			pct: 100 - k * 14,
			css: `color-mix(in oklab, ${at(0)} ${100 - k * 14}%, #111)`
		}))
	);
</script>

<div class="dv-root">
	<header class="dv-head">
		<h2 class="dv-title">Data visualization</h2>
		<p class="dv-sub">
			Your palette used as a categorical chart scale — the context brands forget.
		</p>
	</header>

	{#if !entries.length}
		<p class="dv-empty">Define at least one color to preview it as a chart scale.</p>
	{:else}
		<div class="dv-grid">
			<!-- 1. Grouped bar chart -->
			<section class="dv-card">
				<h3 class="dv-card-title">Grouped bar</h3>
				<div class="dv-bars">
					{#each barCategories as cat, ci (cat)}
						<div class="dv-bar-group">
							<div class="dv-bar-cluster">
								{#each barSeries as _name, si (si)}
									<div
										class="dv-bar"
										style="height: {(barData[ci][si] / barMax) * 100}%; background: {at(si)};"
										title="{barSeries[si]} · {cat}: {barData[ci][si]}"
									></div>
								{/each}
							</div>
							<div class="dv-bar-label">{cat}</div>
						</div>
					{/each}
				</div>
				<ul class="dv-legend">
					{#each barSeries as name, si (name)}
						<li class="dv-legend-item">
							<span class="dv-swatch" style="background: {at(si)}"></span>
							<span class="dv-legend-label">{name}</span>
						</li>
					{/each}
				</ul>
			</section>

			<!-- 2. Line / area chart -->
			<section class="dv-card">
				<h3 class="dv-card-title">Trend lines</h3>
				<svg
					class="dv-svg"
					viewBox="0 0 {LW} {LH}"
					preserveAspectRatio="none"
					role="img"
					aria-label="Three trend lines over seven days"
				>
					<!-- Baseline / axis -->
					<line
						x1={LPAD}
						y1={LH - LPAD}
						x2={LW - LPAD}
						y2={LH - LPAD}
						stroke="var(--border)"
						stroke-width="1"
					/>
					<line
						x1={LPAD}
						y1={LPAD}
						x2={LPAD}
						y2={LH - LPAD}
						stroke="var(--border)"
						stroke-width="1"
					/>
					<!-- Faint area under the first series -->
					<path d={areaPath} fill={at(0)} fill-opacity="0.12" stroke="none" />
					<!-- Series polylines -->
					{#each lineData as values, li (li)}
						<polyline
							points={polyPoints(values)}
							fill="none"
							stroke={at(li)}
							stroke-width="2"
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
					{/each}
				</svg>
				<ul class="dv-legend">
					{#each lineSeries as name, li (name)}
						<li class="dv-legend-item">
							<span class="dv-swatch dv-swatch-line" style="background: {at(li)}"></span>
							<span class="dv-legend-label">{name}</span>
						</li>
					{/each}
				</ul>
			</section>

			<!-- 3. Donut chart -->
			<section class="dv-card">
				<h3 class="dv-card-title">Composition</h3>
				<div class="dv-donut-wrap">
					<svg
						class="dv-donut"
						viewBox="0 0 160 160"
						role="img"
						aria-label="Donut chart of traffic by device"
					>
						<!-- Track -->
						<circle
							cx="80"
							cy="80"
							r={DONUT_R}
							fill="none"
							stroke="var(--border)"
							stroke-width="22"
							opacity="0.4"
						/>
						<!-- Segments, rotated so the ring starts at 12 o'clock -->
						<g transform="rotate(-90 80 80)">
							{#each donutSegments as seg, di (di)}
								<circle
									cx="80"
									cy="80"
									r={DONUT_R}
									fill="none"
									stroke={seg.color}
									stroke-width="22"
									stroke-dasharray="{seg.dash} {seg.gap}"
									stroke-dashoffset={seg.offset}
								/>
							{/each}
						</g>
						<!-- Center label -->
						<text x="80" y="74" text-anchor="middle" class="dv-donut-total" fill="var(--fg)">
							{donutTotal}%
						</text>
						<text x="80" y="92" text-anchor="middle" class="dv-donut-cap" fill="var(--fg)">
							total
						</text>
					</svg>
					<ul class="dv-legend dv-legend-stack">
						{#each donutData as d, di (d.label)}
							<li class="dv-legend-item">
								<span class="dv-swatch" style="background: {at(di)}"></span>
								<span class="dv-legend-label">{d.label}</span>
								<span class="dv-legend-val">{d.value}%</span>
							</li>
						{/each}
					</ul>
				</div>
			</section>

			<!-- 4. Sequential ramp -->
			<section class="dv-card">
				<h3 class="dv-card-title">Sequential (from primary)</h3>
				<div class="dv-ramp">
					{#each rampSteps as step, k (k)}
						<div
							class="dv-ramp-step"
							style="background: {step.css}"
							title="{step.pct}% primary"
						></div>
					{/each}
				</div>
				<div class="dv-ramp-axis">
					<span>light</span>
					<span>dark</span>
				</div>
			</section>

			<!-- 5. Categorical legend / swatches -->
			<section class="dv-card dv-card-wide">
				<h3 class="dv-card-title">Categorical scale</h3>
				<div class="dv-chips">
					{#each entries as e, i (e.name + i)}
						<div class="dv-chip" title={e.description ?? e.name}>
							<span class="dv-chip-swatch" style="background: {at(i)}"></span>
							<span class="dv-chip-meta">
								<span class="dv-chip-name">{e.name}</span>
								<span class="dv-chip-hex">{e.color.hex}</span>
							</span>
						</div>
					{/each}
				</div>
				<p class="dv-note">Distinct hues read clearly as separate series.</p>
			</section>
		</div>
	{/if}
</div>

<style>
	.dv-root {
		width: 100%;
		box-sizing: border-box;
		padding: 24px;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
		font-size: 14px;
		color: var(--fg);
		background: var(--bg);
	}

	.dv-head {
		margin-bottom: 24px;
	}
	.dv-title {
		margin: 0;
		font-size: 22px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.dv-sub {
		margin: 4px 0 0;
		font-size: 13px;
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.dv-empty {
		font-size: 13px;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	.dv-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
	}

	.dv-card {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 16px;
		background: var(--surface);
		color: var(--surface-fg);
		border: 1px solid var(--border);
		border-radius: 12px;
		box-sizing: border-box;
	}
	.dv-card-wide {
		grid-column: 1 / -1;
	}
	.dv-card-title {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	/* ── Legends (shared) ── */
	.dv-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.dv-legend-stack {
		flex-direction: column;
		gap: 8px;
	}
	.dv-legend-item {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 12px;
	}
	.dv-legend-label {
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.dv-legend-val {
		margin-left: auto;
		font-variant-numeric: tabular-nums;
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.dv-swatch {
		width: 12px;
		height: 12px;
		border-radius: 3px;
		flex-shrink: 0;
	}
	.dv-swatch-line {
		height: 3px;
		border-radius: 2px;
	}

	/* ── 1. Bars ── */
	.dv-bars {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		height: 160px;
		padding-bottom: 4px;
		border-bottom: 1px solid var(--border);
	}
	.dv-bar-group {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		height: 100%;
		gap: 6px;
	}
	.dv-bar-cluster {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 3px;
		width: 100%;
		height: 100%;
	}
	.dv-bar {
		flex: 1;
		min-height: 2px;
		max-width: 14px;
		border-radius: 3px 3px 0 0;
	}
	.dv-bar-label {
		font-size: 11px;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	/* ── 2. Line / area ── */
	.dv-svg {
		width: 100%;
		height: 160px;
		display: block;
		overflow: visible;
	}

	/* ── 3. Donut ── */
	.dv-donut-wrap {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.dv-donut {
		width: 130px;
		height: 130px;
		flex-shrink: 0;
	}
	.dv-donut-total {
		font-size: 26px;
		font-weight: 700;
	}
	.dv-donut-cap {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: var(--op-muted);
	}

	/* ── 4. Ramp ── */
	.dv-ramp {
		display: flex;
		height: 56px;
		border-radius: 8px;
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.dv-ramp-step {
		flex: 1;
	}
	.dv-ramp-axis {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	/* ── 5. Chips ── */
	.dv-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.dv-chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px 6px 8px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 10px;
	}
	.dv-chip-swatch {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		flex-shrink: 0;
		border: 1px solid var(--border);
	}
	.dv-chip-meta {
		display: flex;
		flex-direction: column;
		line-height: 1.25;
	}
	.dv-chip-name {
		font-size: 12px;
		font-weight: 600;
		color: var(--fg);
	}
	.dv-chip-hex {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.dv-note {
		margin: 0;
		font-size: 12px;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	/* ── Small screens / mobile shell ── */
	@media (max-width: 640px) {
		.dv-root {
			padding: 14px;
		}
		.dv-grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		}
		.dv-bars {
			height: 140px;
		}
		.dv-svg {
			height: 140px;
		}
	}
</style>
