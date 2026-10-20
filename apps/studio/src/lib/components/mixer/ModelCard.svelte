<script lang="ts">
	import { base } from '$app/paths';
	import type { ModelDef } from '$lib/models';
	import { channelGradient, fmtChannel } from '$lib/mixer/engine';

	let {
		def,
		values,
		gradValues,
		editing = false,
		oninput,
		onrelease
	}: {
		def: ModelDef;
		/** Live slider positions (authoritative, updated every frame). */
		values: number[];
		/** rAF-coalesced source for the gradient tracks (kept off the per-frame path). */
		gradValues: number[];
		/** True while this card is the one being dragged — gets an "editing" accent. */
		editing?: boolean;
		oninput: (index: number, value: number) => void;
		onrelease: () => void;
	} = $props();

	// Recomputes only when gradValues (this card's coalesced snapshot) changes.
	const grads = $derived(def.channels.map((_, i) => channelGradient(def, gradValues, i)));

	const STATUS_TITLE: Record<string, string> = {
		stable: 'Stable · exact culori-backed conversion',
		experimental: 'Experimental · faithful but not spec-certified',
		'coming-soon': 'Coming soon'
	};
</script>

<article class="card" class:editing aria-current={editing ? 'true' : undefined}>
	<header class="card-h">
		<span class="dot {def.status}" title={STATUS_TITLE[def.status]}></span>
		<span class="name" title={def.label}>{def.label}</span>
		<code class="id">.{def.id}</code>
		<a
			class="ext"
			href="{base}/models#{def.id}"
			title="Open {def.label} in the encyclopedia"
			target="_blank"
			rel="noopener"
			aria-label="Open {def.label} in the encyclopedia"
		>
			<svg
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg
			>
		</a>
	</header>
	<div class="rows">
		{#each def.channels as ch, i (ch.key)}
			<div class="row">
				<span class="lab" title={ch.label}>{ch.label}</span>
				<input
					class="grad"
					type="range"
					min={ch.range[0]}
					max={ch.range[1]}
					step={(ch.range[1] - ch.range[0]) / 240}
					value={values[i]}
					style:--grad={grads[i]}
					oninput={(e) => oninput(i, +e.currentTarget.value)}
					onpointerup={onrelease}
					onpointercancel={onrelease}
					onkeyup={onrelease}
					onblur={onrelease}
					aria-label="{def.label} {ch.label}"
				/>
				<span class="val mono">{fmtChannel(values[i])}</span>
			</div>
		{/each}
	</div>
</article>

<style>
	.card {
		break-inside: avoid;
		margin-bottom: 18px;
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--surface) 90%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		padding: 12px 14px 14px;
		box-shadow: var(--shadow-sm);
		transition:
			border-color 120ms,
			box-shadow 120ms;
	}
	/* The card currently being dragged: subtle accent ring so it's clear which model
	   you're driving (and why the others are the ones moving). */
	.card.editing {
		border-color: color-mix(in srgb, var(--accent) 70%, var(--border));
		box-shadow:
			0 0 0 1px color-mix(in srgb, var(--accent) 55%, transparent),
			var(--shadow);
	}
	.card-h {
		display: flex;
		align-items: center;
		gap: 7px;
		margin-bottom: 9px;
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 99px;
		flex-shrink: 0;
		background: var(--text-faint);
	}
	.dot.stable {
		background: #3fb27f;
	}
	.dot.experimental {
		background: var(--warn);
	}
	.name {
		font-size: 12.5px;
		font-weight: 650;
		color: var(--text);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.id {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10px;
		color: var(--text-faint);
		flex-shrink: 0;
	}
	.ext {
		display: inline-flex;
		color: var(--text-faint);
		opacity: 0.7;
		flex-shrink: 0;
	}
	.ext:hover {
		color: var(--accent);
		opacity: 1;
	}
	.rows {
		display: grid;
		gap: 7px;
	}
	.row {
		display: grid;
		grid-template-columns: 58px minmax(0, 1fr) 46px;
		align-items: center;
		gap: 8px;
	}
	.lab {
		font-size: 11px;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.val {
		font-size: 11px;
		font-weight: 600;
		color: var(--text);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* gradient-track slider: the track previews where moving this channel goes,
	   the thumb is a high-contrast box readable on any color (lifted from the
	   encyclopedia playground so the two pages stay visually consistent). */
	input[type='range'].grad {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 20px;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	input.grad::-webkit-slider-runnable-track {
		height: 16px;
		border-radius: 4px;
		background: var(--grad);
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
	}
	input.grad::-moz-range-track {
		height: 16px;
		border-radius: 4px;
		background: var(--grad);
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
	}
	input.grad::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 6px;
		height: 22px;
		margin-top: -4px;
		border-radius: 2px;
		background: #fff;
		border: 1.5px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.55),
			0 1px 3px rgba(0, 0, 0, 0.35);
	}
	input.grad::-moz-range-thumb {
		width: 6px;
		height: 22px;
		border-radius: 2px;
		background: #fff;
		border: 1.5px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.55),
			0 1px 3px rgba(0, 0, 0, 0.35);
	}
	input.grad:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 4px;
	}
</style>
