<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { lerpInMode } from '$lib/models/util';
	import { uniqueName, round } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	let aIdx = $state(0);
	let bIdx = $state(1);
	const ai = $derived(Math.min(aIdx, Math.max(0, entries.length - 1)));
	const bi = $derived(Math.min(bIdx, Math.max(0, entries.length - 1)));
	const a = $derived(entries[ai]);
	const b = $derived(entries[bi]);

	const SPACES = {
		oklab: { label: 'OKLab', mode: 'oklab' },
		oklch: { label: 'OKLCH', mode: 'oklch' },
		linear: { label: 'Linear', mode: 'lrgb' }
	} as const;
	let space = $state<keyof typeof SPACES>('oklab');
	let stops = $state(3); // intermediate colors

	function expr(t: number): string {
		const r = round(t, 3);
		// Mix in the chosen space; convert BOTH operands into it so the same-model
		// rule holds regardless of how a and b were authored.
		if (space === 'oklab') return `mix(${a.name}.oklab, ${b.name}.oklab, ${r})`;
		if (space === 'oklch') return `mix(${a.name}.oklch, ${b.name}.oklch, ${r})`;
		return `mix(${a.name}.lin, ${b.name}.lin, ${r})`;
	}

	// Preview = A, the intermediate stops, then B.
	const ramp = $derived.by(() => {
		if (!a || !b) return [];
		const out = [{ hex: a.color.hex, t: 0 }];
		for (let i = 1; i <= stops; i++) {
			const t = i / (stops + 1);
			out.push({ hex: lerpInMode(a.color, b.color, SPACES[space].mode, t).hex, t });
		}
		out.push({ hex: b.color.hex, t: 1 });
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
		insert(lines, `${SPACES[space].label} gradient ${a.name} → ${b.name}`);
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
				<select class="select" bind:value={space}>
					{#each Object.entries(SPACES) as [id, s] (id)}<option value={id}>{s.label}</option>{/each}
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
