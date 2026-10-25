<script lang="ts">
	import { Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';
	import { app } from '$lib/state/app.svelte';
	import { INTERP_SPACES, mixIn } from '$lib/color/spaces';
	import { modelName } from '$lib/dsl/values';
	import { uniqueName, round } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	let aIdx = $state(0);
	let bIdx = $state(1);
	const ai = $derived(Math.min(aIdx, Math.max(0, entries.length - 1)));
	const bi = $derived(Math.min(bIdx, Math.max(0, entries.length - 1)));
	const a = $derived(entries[ai]);
	const b = $derived(entries[bi]);

	let spaceId = $state('Oklab');
	const space = $derived(
		INTERP_SPACES.find((s) => modelName(s.model) === spaceId) ?? INTERP_SPACES[0]
	);
	let stops = $state(3); // intermediate colors

	function expr(t: number): string {
		const r = round(t, 3);
		// Both operands converted: mix is same-model, and to() leaves a and b untouched.
		return `${a.name}.to(${spaceId}).mix(${b.name}.to(${spaceId}), ${r})`;
	}

	// Preview = A, the intermediate stops, then B — all gamut-mapped by chroma
	// (not naive RGB clip) so out-of-gamut endpoints don't hue-twist the bar.
	const ramp = $derived.by(() => {
		if (!a || !b) return [];
		const out = [{ hex: a.color.to(Srgb).gamutMap().to(Srgb8).toHex(), t: 0 }];
		for (let i = 1; i <= stops; i++) {
			const t = i / (stops + 1);
			out.push({
				hex: mixIn(a.color, b.color, space.model, t).to(Srgb).gamutMap().to(Srgb8).toHex(),
				t
			});
		}
		out.push({ hex: b.color.to(Srgb).gamutMap().to(Srgb8).toHex(), t: 1 });
		return out;
	});
	const css = $derived(`linear-gradient(90deg, ${ramp.map((s) => s.hex).join(', ')})`);

	let copied = $state(false);
	function copyCss() {
		navigator.clipboard?.writeText(css);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}

	function apply() {
		if (!a || !b) return;
		const taken = new Set(takenNames());
		const lines: string[] = [];
		for (let i = 1; i <= stops; i++) {
			const t = i / (stops + 1);
			const name = uniqueName(`${a.name}_${b.name}_${i}`, taken);
			taken.add(name);
			lines.push(`${name} = ${expr(t)}`);
		}
		insert(lines, `${space.label} gradient ${a.name} → ${b.name}`);
	}
</script>

<div class="tool">
	{#if entries.length < 1}
		<p class="empty">Define at least one color to build a gradient.</p>
	{:else}
		<div class="controls">
			<label class="field">
				<span>From</span>
				<select class="select" bind:value={aIdx}>
					{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>To</span>
				<select class="select" bind:value={bIdx}>
					{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>Space</span>
				<select class="select" bind:value={spaceId}>
					{#each INTERP_SPACES as s (s.label)}<option value={modelName(s.model)}>{s.label}</option
						>{/each}
				</select>
			</label>
			<label class="field">
				<span>Stops · {stops}</span>
				<input type="range" min="1" max="7" bind:value={stops} />
			</label>
			<button class="btn btn-accent" onclick={apply}
				>Insert {stops} color{stops > 1 ? 's' : ''}</button
			>
		</div>

		<div class="bar" style="background:{css}"></div>
		<div class="chips">
			{#each ramp as s (s.t)}
				<div class="chip-col">
					<span class="chip" style="background:{s.hex}" class:end={s.t === 0 || s.t === 1}></span>
					<span class="ct">{s.t === 0 || s.t === 1 ? (s.t === 0 ? a.name : b.name) : s.hex}</span>
				</div>
			{/each}
		</div>
		<div class="css-row">
			<code class="css">{css}</code>
			<button class="btn" onclick={copyCss}>{copied ? 'Copied' : 'Copy CSS'}</button>
		</div>
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
	.field input[type='range'] {
		width: 110px;
		accent-color: var(--accent);
	}
	.btn-accent {
		margin-left: auto;
	}
	.bar {
		height: 56px;
		border-radius: 8px;
		border: 1px solid var(--border);
	}
	.chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	.chip-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		flex: 1;
		min-width: 48px;
	}
	.chip {
		width: 100%;
		height: 24px;
		border-radius: 5px;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.chip.end {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
	.ct {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 9.5px;
		color: var(--text-faint);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 56px;
	}
	.css-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.css {
		flex: 1;
		min-width: 0;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-muted);
		background: var(--surface-2);
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.empty {
		color: var(--text-faint);
		font-size: 13px;
	}
	@media (max-width: 520px) {
		.css-row {
			flex-direction: column;
			align-items: stretch;
		}
		.css-row .btn {
			min-height: 40px;
		}
		.chip-col {
			min-width: 40px;
		}
	}
</style>
