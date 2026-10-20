<script lang="ts">
	/**
	 * Live specimens of the non-color token scales (type / spacing / radius /
	 * shadow). Always shown, so a scheme with only colors still renders a full
	 * design system off DEFAULT_TOKENS. Values come straight from the merged
	 * StyleTokens, themed by the surrounding container's CSS vars.
	 */
	import type { StyleTokens } from '$lib/scheme/tokens';

	let { tokens }: { tokens: StyleTokens } = $props();

	const textSteps = $derived(Object.entries(tokens.text));
	const spaceSteps = $derived(Object.entries(tokens.space).filter(([, v]) => parseFloat(v) > 0));
	const radiusSteps = $derived(Object.entries(tokens.radius));
	const shadowSteps = $derived(Object.entries(tokens.shadow).filter(([k]) => k !== 'none'));
</script>

<div class="tok-grid">
	<section class="tok-block">
		<h3 class="tok-title">Type scale</h3>
		<div class="tok-type">
			{#each textSteps as [name, size] (name)}
				<div class="tok-type-row">
					<span class="tok-key">{name}</span>
					<span class="tok-val">{size}</span>
					<span class="tok-specimen" style="font-size:{size};font-family:var(--font-sans)">Ag</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="tok-block">
		<h3 class="tok-title">Spacing</h3>
		<div class="tok-space">
			{#each spaceSteps as [name, size] (name)}
				<div class="tok-space-row">
					<span class="tok-key">{name}</span>
					<span class="tok-bar" style="width:{size}"></span>
					<span class="tok-val">{size}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="tok-block">
		<h3 class="tok-title">Radius</h3>
		<div class="tok-swatches">
			{#each radiusSteps as [name, val] (name)}
				<div class="tok-swatch-col">
					<div class="tok-radius" style="border-radius:{name === 'full' ? '999px' : val}"></div>
					<span class="tok-key">{name}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="tok-block">
		<h3 class="tok-title">Elevation</h3>
		<div class="tok-swatches">
			{#each shadowSteps as [name, val] (name)}
				<div class="tok-swatch-col">
					<div class="tok-shadow" style="box-shadow:{val}"></div>
					<span class="tok-key">{name}</span>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.tok-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 22px;
	}
	.tok-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.tok-title {
		margin: 0;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: var(--op-muted);
	}
	.tok-key {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 11px;
		opacity: var(--op-muted);
	}
	.tok-val {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 11px;
		opacity: var(--op-disabled);
	}

	.tok-type {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.tok-type-row {
		display: grid;
		grid-template-columns: 36px 52px 1fr;
		align-items: baseline;
		gap: 10px;
	}
	.tok-specimen {
		line-height: 1.1;
		overflow: hidden;
		white-space: nowrap;
	}

	.tok-space {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.tok-space-row {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: 10px;
	}
	.tok-bar {
		height: 12px;
		border-radius: 3px;
		background: var(--primary);
		min-width: 1px;
	}

	.tok-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.tok-swatch-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.tok-radius {
		width: 56px;
		height: 56px;
		background: var(--primary);
	}
	.tok-shadow {
		width: 56px;
		height: 56px;
		border-radius: 10px;
		background: var(--surface);
		border: 1px solid var(--border);
	}
</style>
