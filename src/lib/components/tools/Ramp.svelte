<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { OKLCH, type ColorValue } from '$lib/models';
	import { uniqueName } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	let baseIdx = $state(0);
	const idx = $derived(Math.min(baseIdx, Math.max(0, entries.length - 1)));
	const base = $derived(entries[idx]);

	type Stop = { k: string; l: number; t: number };
	// Tailwind-style scale: shade key → OKLCH lightness and HCT tone.
	const STOPS: Stop[] = [
		{ k: '50', l: 0.97, t: 95 },
		{ k: '100', l: 0.93, t: 90 },
		{ k: '200', l: 0.86, t: 80 },
		{ k: '300', l: 0.77, t: 70 },
		{ k: '400', l: 0.67, t: 60 },
		{ k: '500', l: 0.58, t: 50 },
		{ k: '600', l: 0.5, t: 42 },
		{ k: '700', l: 0.42, t: 35 },
		{ k: '800', l: 0.34, t: 25 },
		{ k: '900', l: 0.26, t: 16 },
		{ k: '950', l: 0.19, t: 10 }
	];

	let mode = $state<'oklch' | 'hct'>('oklch');

	function deriveOklch(c: ColorValue, l: number): ColorValue {
		return OKLCH(l, c.channel('ok_c'), c.channel('ok_h')).gamutMapped;
	}
	function deriveHct(c: ColorValue, t: number): ColorValue {
		const fn = c.view('hct').member('atTone') as unknown as (t: number) => ColorValue;
		return fn(t);
	}
	const results = $derived.by(() => {
		if (!base) return [];
		return STOPS.map((s) => ({
			k: s.k,
			color: mode === 'oklch' ? deriveOklch(base.color, s.l) : deriveHct(base.color, s.t)
		}));
	});

	function apply() {
		if (!base) return;
		const taken = new Set(takenNames());
		const prefix = base.name;
		const lines = results.map((r, i) => {
			const name = uniqueName(`${prefix}_${r.k}`, taken);
			taken.add(name);
			const expr =
				mode === 'oklch'
					? `${base.name}.oklch.atLightness(${STOPS[i].l}).oklch.gamutMap()`
					: `${base.name}.hct.atTone(${STOPS[i].t})`;
			return `${name} = ${expr}`;
		});
		insert(
			lines,
			`Tonal ramp (${mode === 'oklch' ? 'OKLCH lightness' : 'HCT tone'}) from ${base.name}`
		);
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
			<div class="seg">
				<button class="seg-item {mode === 'oklch' ? 'active' : ''}" onclick={() => (mode = 'oklch')}
					>OKLCH lightness</button
				>
				<button class="seg-item {mode === 'hct' ? 'active' : ''}" onclick={() => (mode = 'hct')}
					>HCT tone</button
				>
			</div>
			<button class="btn btn-accent" onclick={apply}>Insert {results.length} steps</button>
		</div>

		<div class="ramp">
			{#each results as r (r.k)}
				<div class="step">
					<span class="block" style="background:{r.color.hex}"></span>
					<span class="lbl">{r.k}</span>
					<span class="hx">{r.color.hex}</span>
				</div>
			{/each}
		</div>
		<p class="hint">
			{mode === 'oklch'
				? 'Even perceptual lightness steps at the base hue — gamut-mapped at the extremes.'
				: 'Material-style tones (CAM16 hue & chroma held, L* tone varied).'}
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
		.seg {
			width: 100%;
		}
		.seg-item {
			flex: 1;
			min-height: 40px;
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
