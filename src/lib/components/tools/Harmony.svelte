<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { OKLCH, type ColorValue } from '$lib/models';
	import { wrapHue } from '$lib/models/util';
	import { uniqueName } from '$lib/dsl/emit';
	import { takenNames, insert, oklchText } from './shared';

	const entries = $derived(app.scheme.entries);
	let baseIdx = $state(0);
	const idx = $derived(Math.min(baseIdx, Math.max(0, entries.length - 1)));
	const base = $derived(entries[idx]);

	type Scheme = { label: string; offsets: { n: string; d: number }[] };
	const SCHEMES: Record<string, Scheme> = {
		complementary: { label: 'Complementary', offsets: [{ n: 'complement', d: 180 }] },
		analogous: {
			label: 'Analogous',
			offsets: [
				{ n: 'analog_1', d: -30 },
				{ n: 'analog_2', d: 30 }
			]
		},
		triadic: {
			label: 'Triadic',
			offsets: [
				{ n: 'triad_1', d: 120 },
				{ n: 'triad_2', d: 240 }
			]
		},
		split: {
			label: 'Split complementary',
			offsets: [
				{ n: 'split_1', d: 150 },
				{ n: 'split_2', d: 210 }
			]
		},
		tetradic: {
			label: 'Tetradic',
			offsets: [
				{ n: 'tetrad_1', d: 90 },
				{ n: 'tetrad_2', d: 180 },
				{ n: 'tetrad_3', d: 270 }
			]
		}
	};
	let scheme = $state<keyof typeof SCHEMES>('complementary');

	function derive(c: ColorValue, deg: number): ColorValue {
		return OKLCH(c.channel('ok_l'), c.channel('ok_c'), wrapHue(c.channel('ok_h') + deg))
			.gamutMapped;
	}
	const results = $derived.by(() => {
		if (!base) return [];
		return SCHEMES[scheme].offsets.map((o) => ({
			name: o.n,
			deg: o.d,
			color: derive(base.color, o.d)
		}));
	});

	function apply() {
		if (!base) return;
		const taken = new Set(takenNames());
		const lines = results.map((r) => {
			const name = uniqueName(r.name, taken);
			taken.add(name);
			return `${name} = ${base.name}.oklch.rotateHue(${r.deg}).oklch.gamutMap()`;
		});
		insert(lines, `${SCHEMES[scheme].label} harmony from ${base.name}`);
	}
</script>

<div class="tool">
	{#if !base}
		<p class="empty">Define a color in the editor to build a harmony from it.</p>
	{:else}
		<div class="controls">
			<label class="field">
				<span>Base</span>
				<select class="select" bind:value={baseIdx}>
					{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>Scheme</span>
				<select class="select" bind:value={scheme}>
					{#each Object.entries(SCHEMES) as [id, s] (id)}<option value={id}>{s.label}</option
						>{/each}
				</select>
			</label>
			<button class="btn btn-accent" onclick={apply}
				>Insert {results.length} color{results.length > 1 ? 's' : ''}</button
			>
		</div>

		<div class="wheel-row">
			<svg class="wheel" viewBox="-110 -110 220 220" width="180" height="180">
				<circle cx="0" cy="0" r="100" fill="none" stroke="var(--border)" />
				{#each [base.color.channel('ok_h')] as bh (bh)}
					{@const a = ((bh - 90) * Math.PI) / 180}
					<line
						x1="0"
						y1="0"
						x2={92 * Math.cos(a)}
						y2={92 * Math.sin(a)}
						stroke="var(--border-strong)"
						stroke-width="1"
					/>
					<circle
						cx={92 * Math.cos(a)}
						cy={92 * Math.sin(a)}
						r="11"
						fill={base.color.hex}
						stroke="var(--text)"
						stroke-width="1.5"
					/>
				{/each}
				{#each results as r (r.name)}
					{@const a = ((r.color.channel('ok_h') - 90) * Math.PI) / 180}
					<line
						x1="0"
						y1="0"
						x2={92 * Math.cos(a)}
						y2={92 * Math.sin(a)}
						stroke="var(--border)"
						stroke-width="1"
					/>
					<circle
						cx={92 * Math.cos(a)}
						cy={92 * Math.sin(a)}
						r="9"
						fill={r.color.hex}
						stroke="var(--surface)"
						stroke-width="1.5"
					/>
				{/each}
			</svg>
			<div class="swatches">
				<div class="sw-row base-row">
					<span class="sw" style="background:{base.color.hex}"></span>
					<span class="sw-name">{base.name}</span>
					<span class="sw-meta">{oklchText(base.color)} · base</span>
				</div>
				{#each results as r (r.name)}
					<div class="sw-row">
						<span class="sw" style="background:{r.color.hex}"></span>
						<span class="sw-name">{r.name}</span>
						<span class="sw-meta">{r.color.hex} · +{r.deg}°</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.tool {
		display: flex;
		flex-direction: column;
		gap: 16px;
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
	.wheel-row {
		display: flex;
		gap: 22px;
		align-items: center;
		flex-wrap: wrap;
	}
	.wheel {
		flex-shrink: 0;
	}
	.swatches {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 220px;
		flex: 1;
	}
	.sw-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 8px;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
	}
	.base-row {
		background: var(--accent-soft);
	}
	.sw {
		width: 22px;
		height: 22px;
		border-radius: 5px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		flex-shrink: 0;
	}
	.sw-name {
		font-weight: 600;
		font-size: 13px;
	}
	.sw-meta {
		margin-left: auto;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-faint);
	}
	.empty {
		color: var(--text-faint);
		font-size: 13px;
	}

	@media (max-width: 520px) {
		.wheel {
			width: min(180px, 62vw);
			height: auto;
		}
		.swatches {
			min-width: 100%;
		}
	}
</style>
