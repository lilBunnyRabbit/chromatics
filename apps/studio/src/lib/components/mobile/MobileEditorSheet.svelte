<script lang="ts">
	/**
	 * Full-screen DSL editor for phones. Hosts the existing (fully fluid) Editor
	 * verbatim plus the error strip; the editor is the single source of truth, so
	 * closing the sheet re-derives every analysis view from app.source.
	 */
	import Sheet from './Sheet.svelte';
	import Editor from '$lib/Editor.svelte';
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { completion, hover, makeSwatches } from '$lib/dsl/editor-bindings';

	const swatch = $derived(makeSwatches(ui.swatchMode));

	let { open = false, onclose }: { open?: boolean; onclose: () => void } = $props();
</script>

<Sheet {open} {onclose} variant="full" padded={false} title="Code">
	{#snippet headerRight()}
		{#if app.result.errors.length > 0}
			<span class="err-chip"
				>{app.result.errors.length} error{app.result.errors.length > 1 ? 's' : ''}</span
			>
		{/if}
	{/snippet}

	<div class="m-editor-host">
		<Editor bind:value={app.source} completionSource={completion} {hover} {swatch} />
	</div>
	{#if app.result.errors.length > 0}
		<div class="m-errorbar scroll">
			{#each app.result.errors as err (err.line + err.message)}
				<div class="err-row">
					<span class="err-line">line {err.line}</span><span>{err.message}</span>
				</div>
			{/each}
		</div>
	{/if}
</Sheet>

<style>
	.m-editor-host {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	/* Larger glyphs for touch typing without forking Editor (overrides the
	   CodeMirror theme's 13px on .cm-editor via the ancestor selector). */
	.m-editor-host :global(.cm-editor) {
		font-size: 15px;
	}
	.err-chip {
		padding: 2px 9px;
		border-radius: 99px;
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
		font-size: 11px;
		font-weight: 600;
	}
	.m-errorbar {
		flex-shrink: 0;
		max-height: 30dvh;
		overflow-y: auto;
		border-top: 1px solid var(--border);
		background: color-mix(in srgb, var(--danger) 7%, var(--surface));
		padding: 8px 14px calc(8px + env(safe-area-inset-bottom, 0));
	}
	.err-row {
		display: flex;
		gap: 8px;
		font-size: 12px;
		color: var(--danger);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
	}
	.err-line {
		opacity: 0.7;
		flex-shrink: 0;
	}
</style>
