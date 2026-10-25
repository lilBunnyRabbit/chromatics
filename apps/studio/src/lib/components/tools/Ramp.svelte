<script lang="ts">
	import { Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';
	import { app } from '$lib/state/app.svelte';
	import { RAMP_MODELS, rampColors } from '$lib/color/spaces';
	import { modelName } from '$lib/dsl/values';
	import { uniqueName, round } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	let baseIdx = $state(0);
	const idx = $derived(Math.min(baseIdx, Math.max(0, entries.length - 1)));
	const base = $derived(entries[idx]);

	let modelId = $state('Oklch');
	const rm = $derived(RAMP_MODELS.find((m) => modelName(m.model) === modelId) ?? RAMP_MODELS[0]);

	const results = $derived.by(() => {
		if (!base) return [];
		return rampColors(base.color, rm.model).map((s) => ({
			k: s.key,
			hex: s.color.to(Srgb).gamutMap().to(Srgb8).toHex()
		}));
	});

	// Matches rampColors(): the base in the ramp's model, its lightness axis set.
	function stepExpr(b: string, v: number): string {
		return `${b}.to(${modelId}).set({ ${rm.channel}: ${round(v, 3)} })`;
	}

	function apply() {
		if (!base) return;
		const taken = new Set(takenNames());
		const prefix = base.name;
		const lines = results.map((r, i) => {
			const name = uniqueName(`${prefix}_${r.k}`, taken);
			taken.add(name);
			return `${name} = ${stepExpr(base.name, rm.stops[i])}`;
		});
		insert(lines, `Tonal ramp (${rm.label}) from ${base.name}`);
	}
</script>

<div class="tool">
	{#if !base}
		<p class="empty">Define a color in the editor to generate a tonal ramp.</p>
	{:else}
		<div class="controls">
			<label class="field">
				<span>Base</span>
				<select class="select" bind:value={baseIdx}>
					{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>Model</span>
				<select class="select" bind:value={modelId}>
					{#each RAMP_MODELS as m (m.label)}<option value={modelName(m.model)}>{m.label}</option
						>{/each}
				</select>
			</label>
			<button class="btn btn-accent" onclick={apply}>Insert {results.length} steps</button>
		</div>

		<div class="ramp">
			{#each results as r (r.k)}
				<div class="step">
					<span class="block" style="background:{r.hex}"></span>
					<span class="lbl">{r.k}</span>
					<span class="hx">{r.hex}</span>
				</div>
			{/each}
		</div>
		<p class="hint">
			{rm.note
				? rm.note
				: rm.perceptual
					? `Even ${rm.label.toLowerCase()} steps at the base hue — gamut-mapped at the extremes.`
					: `${rm.label} steps (non-perceptual).`}
		</p>
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
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.btn-accent {
		margin-left: auto;
	}
	.ramp {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		flex: 1;
		min-width: 52px;
	}
	.block {
		width: 100%;
		height: 64px;
		border-radius: 6px;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.lbl {
		font-size: 11px;
		font-weight: 700;
		color: var(--text-muted);
	}
	.hx {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 9.5px;
		color: var(--text-faint);
	}
	.hint {
		font-size: 12px;
		color: var(--text-faint);
	}
	.empty {
		color: var(--text-faint);
		font-size: 13px;
	}

	@media (max-width: 640px) {
		.controls {
			align-items: stretch;
		}
		.field {
			width: 100%;
		}
		.btn-accent {
			margin-left: 0;
			width: 100%;
			min-height: 40px;
		}
		.ramp {
			flex-wrap: nowrap;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
			scrollbar-width: none;
		}
		.ramp::-webkit-scrollbar {
			display: none;
		}
		.step {
			flex: 0 0 auto;
			min-width: 48px;
		}
	}
</style>
