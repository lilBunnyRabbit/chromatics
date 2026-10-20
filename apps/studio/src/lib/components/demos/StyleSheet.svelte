<script lang="ts">
	import type { SchemeEntry } from '$lib/scheme/types';

	let { entries }: { entries: SchemeEntry[] } = $props();

	const ok = (c: SchemeEntry['color']) =>
		`oklch(${c.channel('ok_l').toFixed(2)} ${c.channel('ok_c').toFixed(3)} ${Math.round(c.channel('ok_h'))})`;

	const lorem =
		'Jackdaws love my big sphinx of quartz. Pack my box with five dozen liquor jugs and ship the whole lot by morning.';

	// Visual contrast pairings — each shows two role colors against each other.
	const pairings = [
		{ label: 'Text on bg', bg: 'var(--bg)', fg: 'var(--fg)', sample: 'Body text' },
		{ label: 'Primary on bg', bg: 'var(--bg)', fg: 'var(--primary)', sample: 'Accent link' },
		{
			label: 'Primary fg on primary',
			bg: 'var(--primary)',
			fg: 'var(--primary-fg)',
			sample: 'Button label'
		},
		{
			label: 'Secondary on surface',
			bg: 'var(--surface)',
			fg: 'var(--secondary)',
			sample: 'Highlight'
		}
	];
</script>

<div class="sheet">
	<header class="sheet-head">
		<h1 class="sheet-title">Brand Palette</h1>
		<p class="sheet-sub">Color, type and component guidelines &middot; {entries.length} colors</p>
	</header>

	<!-- 1. Swatch grid -->
	<section class="block">
		<h2 class="block-title">Colors</h2>
		<div class="swatch-grid">
			{#each entries as e (e.name + e.index)}
				<article class="swatch-card">
					<div class="swatch-block" style="background: {e.color.toCSS()}">
						<span class="aa aa-white">Aa</span>
						<span class="aa aa-black">Aa</span>
					</div>
					<div class="swatch-meta">
						<div class="swatch-name">{e.name}</div>
						<div class="swatch-hex">{e.color.hex}</div>
						<div class="swatch-ok">{ok(e.color)}</div>
						{#if e.description}
							<div class="swatch-desc">{e.description}</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- 2. Typography specimen -->
	<section class="block">
		<h2 class="block-title">Typography</h2>
		<div class="type-card">
			<h1 class="t-h1">The quick brown fox</h1>
			<h2 class="t-h2">Jumps over the lazy dog</h2>
			<p class="t-body">{lorem}</p>
			<p class="t-caption">Caption &middot; 12px &middot; muted secondary text</p>
		</div>
	</section>

	<!-- 3. UI elements -->
	<section class="block">
		<h2 class="block-title">UI Elements</h2>
		<div class="ui-card">
			<div class="ui-row">
				<button class="btn btn-primary" type="button">Primary</button>
				<button class="btn btn-secondary" type="button">Secondary</button>
				<button class="btn btn-outline" type="button">Outline</button>
			</div>
			<div class="ui-row">
				<span class="badge badge-primary">Primary</span>
				<span class="badge badge-secondary">Secondary</span>
				<span class="ui-text"
					>Read the <a class="ui-link" href="#a">documentation</a> for details.</span
				>
			</div>
		</div>
	</section>

	<!-- 4. Pairings -->
	<section class="block">
		<h2 class="block-title">Pairings</h2>
		<div class="pair-grid">
			{#each pairings as p (p.label)}
				<article class="pair-card">
					<div class="pair-swatch" style="background: {p.bg}; color: {p.fg}">
						<span class="pair-sample">{p.sample}</span>
					</div>
					<div class="pair-label">{p.label}</div>
				</article>
			{/each}
		</div>
	</section>
</div>

<style>
	.sheet {
		width: 100%;
		box-sizing: border-box;
		padding: 32px;
		background: var(--bg);
		color: var(--fg);
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		display: flex;
		flex-direction: column;
		gap: 36px;
	}

	.sheet-head {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-bottom: 20px;
		border-bottom: 1px solid var(--border);
	}
	.sheet-title {
		margin: 0;
		font-size: 34px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.sheet-sub {
		margin: 0;
		font-size: 14px;
		opacity: var(--op-muted);
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.block-title {
		margin: 0;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: var(--op-muted);
	}

	/* 1. Swatch grid */
	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
	}
	.swatch-card {
		background: var(--surface);
		color: var(--surface-fg);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.swatch-block {
		position: relative;
		height: 96px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14px;
	}
	.aa {
		font-size: 22px;
		font-weight: 700;
		line-height: 1;
	}
	.aa-white {
		color: #fff;
	}
	.aa-black {
		color: #000;
	}
	.swatch-meta {
		padding: 12px 14px 14px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.swatch-name {
		font-size: 14px;
		font-weight: 700;
	}
	.swatch-hex {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 12px;
	}
	.swatch-ok {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 11px;
		opacity: var(--op-muted);
	}
	.swatch-desc {
		margin-top: 4px;
		font-size: 11px;
		opacity: var(--op-muted);
		line-height: 1.4;
	}

	/* 2. Typography */
	.type-card {
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 28px 30px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.t-h1 {
		margin: 0;
		font-size: 40px;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}
	.t-h2 {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		line-height: 1.2;
	}
	.t-body {
		margin: 0;
		font-size: 15px;
		line-height: 1.6;
		max-width: 60ch;
	}
	.t-caption {
		margin: 0;
		font-size: 12px;
		opacity: var(--op-muted);
	}

	/* 3. UI elements */
	.ui-card {
		background: var(--surface);
		color: var(--surface-fg);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 22px 24px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.ui-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}
	.btn {
		padding: 9px 18px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		border: 1px solid transparent;
		cursor: pointer;
		font-family: inherit;
	}
	.btn-primary {
		background: var(--primary);
		color: var(--primary-fg);
	}
	.btn-secondary {
		background: var(--secondary);
		color: var(--secondary-fg);
	}
	.btn-outline {
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--border);
	}
	.badge {
		display: inline-block;
		padding: 3px 12px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 600;
	}
	.badge-primary {
		background: var(--primary);
		color: var(--primary-fg);
	}
	.badge-secondary {
		background: var(--secondary);
		color: var(--secondary-fg);
	}
	.ui-text {
		font-size: 14px;
	}
	.ui-link {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	/* 4. Pairings */
	.pair-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
	}
	.pair-card {
		background: var(--surface);
		color: var(--surface-fg);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.pair-swatch {
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.pair-sample {
		font-size: 16px;
		font-weight: 600;
	}
	.pair-label {
		padding: 10px 14px 12px;
		font-size: 12px;
		font-weight: 600;
		opacity: var(--op-muted);
	}

	/* Small screens: tighten padding, scale display type, and pack grids denser */
	@media (max-width: 640px) {
		.sheet {
			padding: 16px;
		}
		.sheet-title {
			font-size: 26px;
		}
		.t-h1 {
			font-size: 28px;
		}
		.t-h2 {
			font-size: 20px;
		}
		.swatch-grid,
		.pair-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}
	}
</style>
