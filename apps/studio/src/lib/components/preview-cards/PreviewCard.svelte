<script lang="ts">
	import PreviewRelationships from './PreviewRelationships.svelte';
	import PreviewAccessibility from './PreviewAccessibility.svelte';
	import PreviewSingle from './PreviewSingle.svelte';
	import PreviewScheme from './PreviewScheme.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let { data, name }: { data: any; name: string } = $props();

	const REL = ['gradient', 'ramp', 'harmony', 'mix'];
	const A11Y = ['pair', 'cvd', 'onBackgrounds'];
	const SINGLE = ['space', 'channels', 'gamut', 'print', 'name', 'temperature'];
	const SCHEME = ['palette', 'grid', 'chart', 'ui', 'brandMark'];
	const type = $derived(String(data.__preview));
</script>

<div class="pcard">
	<div class="pcard-head">
		<span class="pname">{name}</span>
		<span class="ptype">preview.{type}</span>
	</div>
	<div class="pcard-body">
		{#if REL.includes(type)}
			<PreviewRelationships {data} />
		{:else if A11Y.includes(type)}
			<PreviewAccessibility {data} />
		{:else if SINGLE.includes(type)}
			<PreviewSingle {data} />
		{:else if SCHEME.includes(type)}
			<PreviewScheme {data} />
		{:else}
			<div class="punknown">Unknown preview: {type}</div>
		{/if}
	</div>
</div>

<style>
	.pcard {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.pcard-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		min-width: 0;
		padding: 7px 11px;
		border-bottom: 1px solid var(--border);
		background: var(--surface-2);
	}
	.pname {
		font-weight: 600;
		font-size: 12.5px;
		color: var(--text);
	}
	.ptype {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10.5px;
		color: var(--text-faint);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.pcard-body {
		padding: 11px;
	}
	.punknown {
		font-size: 12px;
		color: var(--text-faint);
	}
</style>
