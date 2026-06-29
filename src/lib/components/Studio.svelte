<script lang="ts">
	import Harmony from './tools/Harmony.svelte';
	import Ramp from './tools/Ramp.svelte';
	import Gradient from './tools/Gradient.svelte';
	import AutoFix from './tools/AutoFix.svelte';
	import ImageExtract from './tools/ImageExtract.svelte';
	import Pick from './tools/Pick.svelte';

	type ToolId = 'harmony' | 'ramp' | 'gradient' | 'fix' | 'extract' | 'pick';
	const TOOLS: { id: ToolId; label: string; blurb: string }[] = [
		{
			id: 'harmony',
			label: 'Harmony',
			blurb: 'Complementary, triadic & analogous colors off a base hue.'
		},
		{
			id: 'ramp',
			label: 'Tonal ramp',
			blurb: 'A 50–950 lightness or HCT-tone scale from one color.'
		},
		{
			id: 'gradient',
			label: 'Gradient',
			blurb: 'Interpolate two colors in OKLab, OKLCH or linear light.'
		},
		{ id: 'fix', label: 'Auto-fix', blurb: 'Nudge a foreground until it meets a contrast target.' },
		{ id: 'extract', label: 'From image', blurb: 'Pull a starter palette from a logo or photo.' },
		{ id: 'pick', label: 'Pick', blurb: 'Eyedropper / hex → a named color.' }
	];
	let tool = $state<ToolId>('harmony');
	const active = $derived(TOOLS.find((t) => t.id === tool)!);
</script>

<div class="studio">
	<div class="studio-bar">
		<div class="seg">
			{#each TOOLS as t (t.id)}
				<button class="seg-item {tool === t.id ? 'active' : ''}" onclick={() => (tool = t.id)}
					>{t.label}</button
				>
			{/each}
		</div>
	</div>
	<div class="studio-body scroll">
		<p class="blurb">{active.blurb} <span class="emit-note">Inserts DSL into the editor.</span></p>
		<div class="tool-host">
			{#if tool === 'harmony'}
				<Harmony />
			{:else if tool === 'ramp'}
				<Ramp />
			{:else if tool === 'gradient'}
				<Gradient />
			{:else if tool === 'fix'}
				<AutoFix />
			{:else if tool === 'extract'}
				<ImageExtract />
			{:else}
				<Pick />
			{/if}
		</div>
	</div>
</div>

<style>
	.studio {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--bg);
	}
	.studio-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 14px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.studio-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 16px;
	}
	.blurb {
		font-size: 12.5px;
		color: var(--text-muted);
		margin-bottom: 16px;
	}
	.emit-note {
		color: var(--text-faint);
		margin-left: 4px;
	}
	.tool-host {
		max-width: 760px;
	}

	@media (max-width: 640px) {
		.seg {
			display: flex;
			flex-wrap: nowrap;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
		}
		.seg::-webkit-scrollbar {
			display: none;
		}
		.seg-item {
			flex: 0 0 auto;
			white-space: nowrap;
			min-height: 40px;
		}
		.studio-body {
			padding: 12px;
		}
		.tool-host {
			max-width: none;
		}
	}
</style>
