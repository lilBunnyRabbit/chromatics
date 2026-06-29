<script lang="ts">
	import type { SchemeEntry } from '$lib/scheme/types';

	let { entries }: { entries: SchemeEntry[] } = $props();

	const brand = $derived(entries.length ? entries : []);

	/** The lead brand color — prefer one named 'primary'/'brand', else the first entry. */
	const primaryEntry = $derived(
		brand.find((e) => /primary|brand/i.test(e.name)) ?? brand[0] ?? null
	);

	/** A CSS color for the lead brand mark, falling back to the chrome primary. */
	const brand1 = $derived(primaryEntry ? primaryEntry.color.toCSS() : 'var(--primary)');

	/** Up to three brand colors for multi-color marks; cycles when fewer are defined. */
	const brandColors = $derived.by<string[]>(() => {
		if (!brand.length) return ['var(--primary)', 'var(--secondary)', 'var(--tertiary)'];
		const pool: string[] = [];
		// Lead first, then the rest in source order, de-duplicated by name.
		const ordered = primaryEntry
			? [primaryEntry, ...brand.filter((e) => e !== primaryEntry)]
			: brand;
		for (const e of ordered) pool.push(e.color.toCSS());
		const out: string[] = [];
		for (let i = 0; i < 3; i++) out.push(pool[i % pool.length]);
		return out;
	});

	const brand2 = $derived(brandColors[1]);

	/** Pick black/white text for a brand fill by its OKLCH lightness, when we know it. */
	function fgFor(entry: SchemeEntry | null): string {
		if (!entry) return '#fff';
		const l = entry.color.channel('ok_l');
		return l >= 0.62 ? '#111' : '#fff';
	}

	const primaryFg = $derived(fgFor(primaryEntry));

	const secondaryEntry = $derived(
		(primaryEntry ? brand.filter((e) => e !== primaryEntry) : brand)[0] ?? null
	);
	const secondaryFill = $derived(
		secondaryEntry ? secondaryEntry.color.toCSS() : 'var(--secondary)'
	);
	const secondaryFg = $derived(secondaryEntry ? fgFor(secondaryEntry) : 'var(--secondary-fg)');

	type Lockup = { label: string; bg: string; fill: string; text: string };
	const lockups = $derived<Lockup[]>([
		{ label: 'White', bg: '#fff', fill: '#111', text: '#111' },
		{ label: 'Black', bg: '#111', fill: '#fff', text: '#fff' },
		{ label: 'App background', bg: 'var(--bg)', fill: brand1, text: 'var(--fg)' },
		{ label: 'Surface', bg: 'var(--surface)', fill: brand1, text: 'var(--surface-fg)' },
		{ label: 'Primary', bg: brand1, fill: primaryFg, text: primaryFg },
		{ label: 'Secondary', bg: secondaryFill, fill: secondaryFg, text: secondaryFg }
	]);

	const faviconSizes = [16, 24, 32, 48];
</script>

{#snippet glyph(fill: string, size: number)}
	<!-- Two overlapping rounded squares — a compact, recognizable identity mark. -->
	<svg class="glyph" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
		<rect x="3" y="3" width="19" height="19" rx="5" {fill} opacity="0.55" />
		<rect x="10" y="10" width="19" height="19" rx="5" {fill} />
	</svg>
{/snippet}

{#snippet mark(fill: string, textColor: string, glyphOnly: boolean, accent?: string)}
	<span class="mark" class:glyph-only={glyphOnly}>
		<svg class="glyph" width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
			<rect
				x="3"
				y="3"
				width="19"
				height="19"
				rx="5"
				fill={accent ?? fill}
				opacity={accent ? '1' : '0.55'}
			/>
			<rect x="10" y="10" width="19" height="19" rx="5" {fill} />
		</svg>
		{#if !glyphOnly}
			<span class="wordmark" style="color: {textColor}">Acme</span>
		{/if}
	</span>
{/snippet}

<div class="bm-root">
	<header class="bm-head">
		<h2 class="bm-title">Brand mark</h2>
		<p class="bm-sub">Logo lockups, treatments and small-scale legibility for your palette.</p>
	</header>

	{#if !brand.length}
		<p class="bm-empty">Define at least one color to preview the brand mark.</p>
	{:else}
		<!-- 1. Lockups across backgrounds -->
		<section class="bm-section">
			<h3 class="bm-section-title">Lockups across backgrounds</h3>
			<div class="bm-lockup-grid">
				{#each lockups as lk (lk.label)}
					<div class="bm-tile">
						<div class="bm-stage" style="background: {lk.bg}">
							{@render mark(lk.fill, lk.text, false)}
						</div>
						<div class="bm-tile-label">{lk.label}</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- 2. Treatments -->
		<section class="bm-section">
			<h3 class="bm-section-title">Treatments</h3>
			<div class="bm-treatment-grid">
				<div class="bm-tile">
					<div class="bm-stage" style="background: var(--surface)">
						{@render mark(brandColors[0], 'var(--surface-fg)', false, brandColors[1])}
					</div>
					<div class="bm-tile-label">Full-color</div>
				</div>
				<div class="bm-tile">
					<div class="bm-stage" style="background: var(--surface)">
						{@render mark(brand1, 'var(--surface-fg)', false)}
					</div>
					<div class="bm-tile-label">Monochrome</div>
				</div>
				<div class="bm-tile">
					<div class="bm-stage" style="background: {brand1}">
						{@render mark('var(--surface)', 'var(--surface)', false)}
					</div>
					<div class="bm-tile-label">Knockout</div>
				</div>
				<div class="bm-tile">
					<div class="bm-stage" style="background: color-mix(in srgb, {brand1} 12%, white)">
						{@render mark(brand1, brand1, false)}
					</div>
					<div class="bm-tile-label">One-color on tint</div>
				</div>
			</div>
		</section>

		<!-- 3. Favicon / avatar scale -->
		<section class="bm-section">
			<h3 class="bm-section-title">Favicon &amp; avatar scale</h3>
			<div class="bm-scale-strip">
				{#each faviconSizes as size (size)}
					<div class="bm-scale-item">
						<div class="bm-scale-stage">
							{@render glyph(brand1, size)}
						</div>
						<div class="bm-tile-label">{size}px</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.bm-root {
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

	.bm-head {
		margin-bottom: 24px;
	}
	.bm-title {
		margin: 0;
		font-size: 22px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.bm-sub {
		margin: 4px 0 0;
		font-size: 13px;
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.bm-empty {
		font-size: 13px;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	.bm-section {
		margin-bottom: 28px;
	}
	.bm-section-title {
		margin: 0 0 12px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	.bm-lockup-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 14px;
	}
	.bm-treatment-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 14px;
	}

	.bm-tile {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.bm-stage {
		height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.bm-tile-label {
		font-size: 12px;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	.mark {
		display: inline-flex;
		align-items: center;
		gap: 10px;
	}
	.mark.glyph-only {
		gap: 0;
	}
	.glyph {
		display: block;
		flex-shrink: 0;
	}
	.wordmark {
		font-size: 24px;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.bm-scale-strip {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 24px;
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}
	.bm-scale-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.bm-scale-stage {
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 600px) {
		.bm-root {
			padding: 14px;
		}
		.bm-lockup-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}
		.bm-treatment-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		}
	}
</style>
