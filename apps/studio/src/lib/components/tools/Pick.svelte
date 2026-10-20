<script lang="ts">
	import { onMount } from 'svelte';
	import { hex, type ColorValue } from '$lib/models';
	import { nearestName } from '$lib/color-names';
	import { uniqueName } from '$lib/dsl/emit';
	import { takenNames, insert, oklchText } from './shared';

	let hexInput = $state('#3aa0ff');
	let nameInput = $state('picked');
	let hasEyeDropper = $state(false);

	onMount(() => {
		hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;
	});

	const normalized = $derived.by(() => {
		const v = hexInput.trim().replace(/^#?/, '');
		return /^[0-9a-fA-F]{6}$/.test(v) || /^[0-9a-fA-F]{3}$/.test(v) ? `#${v}` : null;
	});
	const color = $derived.by<ColorValue | null>(() => {
		if (!normalized) return null;
		try {
			return hex(normalized);
		} catch {
			return null;
		}
	});
	const near = $derived(color ? nearestName(color) : null);

	async function pick() {
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const ed = new (
				window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }
			).EyeDropper();
			const res = await ed.open();
			hexInput = res.sRGBHex;
		} catch {
			/* user cancelled */
		}
	}

	function apply() {
		if (!color) return;
		const name = uniqueName(nameInput || 'picked', takenNames());
		insert([`${name} = hex("${color.hex}")`], 'Picked color');
	}
</script>

<div class="tool">
	<div class="controls">
		{#if hasEyeDropper}
			<button class="btn" onclick={pick}>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="m2 22 1-1h3l9-9" /><path d="M3 21v-3l9-9" /><path
						d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"
					/></svg
				>
				Eyedropper
			</button>
		{/if}
		<label class="field">
			<span>Hex</span>
			<input class="select hex-in" bind:value={hexInput} spellcheck="false" />
		</label>
		<label class="field">
			<span>Variable name</span>
			<input class="select" bind:value={nameInput} spellcheck="false" />
		</label>
		<button class="btn btn-accent" onclick={apply} disabled={!color}>Insert</button>
	</div>

	{#if color && near}
		<div class="readout">
			<span class="big-sw" style="background:{color.hex}"></span>
			<div class="meta">
				<div class="line">
					<b>{color.hex}</b> · nearest <b>{near.name}</b> (ΔE {near.deltaE.toFixed(1)})
				</div>
				<div class="line mono">{oklchText(color)}</div>
			</div>
		</div>
	{:else}
		<p class="err">Enter a 3- or 6-digit hex color.</p>
	{/if}
	{#if !hasEyeDropper}
		<p class="hint">The screen eyedropper isn't available in this browser — paste a hex instead.</p>
	{/if}
</div>

<style>
	.tool {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.controls {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		flex-wrap: wrap;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.hex-in {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		width: 110px;
	}
	.btn-accent {
		margin-left: auto;
	}
	.readout {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.big-sw {
		width: 56px;
		height: 56px;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		flex-shrink: 0;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.line {
		font-size: 13px;
		color: var(--text-muted);
	}
	.mono {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-faint);
	}
	.hint {
		font-size: 12px;
		color: var(--text-faint);
	}
	.err {
		font-size: 12px;
		color: var(--danger);
	}

	@media (max-width: 520px) {
		/* Let each control take its own full row for easier touch typing */
		.controls > .field,
		.controls > .btn {
			flex: 1 1 100%;
		}
		/* Full-width inputs: override .hex-in fixed width and stretch both inputs */
		.field .select,
		.hex-in {
			width: 100%;
		}
		/* Drop the desktop right-alignment so Insert sits on its own full row */
		.btn-accent {
			margin-left: 0;
		}
		/* Comfortable touch targets */
		.field .select,
		.btn {
			min-height: 40px;
		}
	}
</style>
