<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { RAMP_MODELS, rampColors } from '$lib/models';
	import { uniqueName, round } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	let baseIdx = $state(0);
	const idx = $derived(Math.min(baseIdx, Math.max(0, entries.length - 1)));
	const base = $derived(entries[idx]);

	let modelId = $state('oklch');
	const rm = $derived(RAMP_MODELS.find((m) => m.id === modelId) ?? RAMP_MODELS[0]);

	const results = $derived.by(() => {
		if (!base) return [];
		return rampColors(base.color, modelId).map((s) => ({ k: s.key, color: s.color }));
	});

	// DSL expression for one shade — each model rebuilt from the base's channels
	// in that model, varying only its lightness axis. Matches rampColors().
	function stepExpr(id: string, b: string, v: number): string {
		switch (id) {
			case 'lab':
				return `LAB(${round(v, 2)}, ${b}.lab_a, ${b}.lab_b)`;
			case 'hct':
				return `${b}.hct.atTone(${round(v, 1)})`;
			case 'okhsl':
				return `OKHSL(${b}.okhsl_h, ${b}.okhsl_s, ${round(v, 3)})`;
			case 'hsluv':
				return `HSLUV(${b}.hsluv_h, ${b}.hsluv_s, ${round(v, 2)})`;
			case 'hsl':
				return `HSL(${b}.h, ${b}.s, ${round(v, 3)})`;
			case 'hsv':
				return `HSV(${b}.hsv_h, ${b}.hsv_s, ${round(v, 3)})`;
			default:
				return `${b}.oklch.atLightness(${round(v, 3)}).oklch.gamutMap()`;
		}
	}

	function apply() {
		if (!base) return;
		const taken = new Set(takenNames());
		const prefix = base.name;
		const lines = results.map((r, i) => {
			const name = uniqueName(`${prefix}_${r.k}`, taken);
			taken.add(name);
			return `${name} = ${stepExpr(modelId, base.name, rm.stops[i])}`;
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
					{#each RAMP_MODELS as m (m.id)}<option value={m.id}>{m.label}</option>{/each}
				</select>
			</label>
			<button class="btn btn-accent" onclick={apply}>Insert {results.length} steps</button>
		</div>

		<div class="ramp">
			{#each results as r (r.k)}
				<div class="step">
					<span class="block" style="background:{r.color.gamutMapped.hex}"></span>
					<span class="lbl">{r.k}</span>
					<span class="hx">{r.color.gamutMapped.hex}</span>
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
