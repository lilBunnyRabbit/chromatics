<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { OKLCH, type ColorValue } from '$lib/models';
	import { contrastRatio } from '$lib/analysis/contrast';
	import { apcaContrast } from '$lib/analysis/apca';
	import { uniqueName, round } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	const entries = $derived(app.scheme.entries);
	let fgIdx = $state(0);
	let bgIdx = $state(1);
	const fi = $derived(Math.min(fgIdx, Math.max(0, entries.length - 1)));
	const bi = $derived(Math.min(bgIdx, Math.max(0, entries.length - 1)));
	const fg = $derived(entries[fi]);
	const bg = $derived(entries[bi]);

	const TARGETS = [
		{ id: 'aa', label: 'AA (4.5)', ratio: 4.5 },
		{ id: 'aaa', label: 'AAA (7)', ratio: 7 },
		{ id: 'large', label: 'AA large (3)', ratio: 3 }
	];
	let targetId = $state('aa');
	const target = $derived(TARGETS.find((t) => t.id === targetId)!.ratio);

	function solve(
		fgc: ColorValue,
		bgc: ColorValue,
		want: number
	): { color: ColorValue; l: number; changed: boolean } {
		const c = fgc.channel('ok_c'),
			h = fgc.channel('ok_h'),
			l0 = fgc.channel('ok_l');
		const make = (L: number) => OKLCH(L, c, h).gamutMapped;
		if (contrastRatio(fgc, bgc) >= want) return { color: fgc, l: l0, changed: false };
		for (let step = 0.01; step <= 1.001; step += 0.01) {
			for (const L of [l0 - step, l0 + step]) {
				if (L < 0 || L > 1) continue;
				const cand = make(L);
				if (contrastRatio(cand, bgc) >= want) return { color: cand, l: L, changed: true };
			}
		}
		const w = make(1),
			b = make(0);
		return contrastRatio(w, bgc) >= contrastRatio(b, bgc)
			? { color: w, l: 1, changed: true }
			: { color: b, l: 0, changed: true };
	}

	const fixed = $derived.by(() => (fg && bg ? solve(fg.color, bg.color, target) : null));
	const beforeRatio = $derived(fg && bg ? contrastRatio(fg.color, bg.color) : 0);
	const afterRatio = $derived(fixed && bg ? contrastRatio(fixed.color, bg.color) : 0);
	const beforeApca = $derived(fg && bg ? apcaContrast(fg.color, bg.color) : 0);
	const afterApca = $derived(fixed && bg ? apcaContrast(fixed.color, bg.color) : 0);

	function apply() {
		if (!fg || !bg || !fixed || !fixed.changed) return;
		const name = uniqueName(`${fg.name}_on_${bg.name}`, takenNames());
		insert(
			[`${name} = ${fg.name}.oklch.atLightness(${round(fixed.l, 4)}).oklch.gamutMap()`],
			`${fg.name} adjusted to ${TARGETS.find((t) => t.id === targetId)!.label} on ${bg.name}`
		);
	}
</script>

<div class="tool">
	{#if entries.length < 2}
		<p class="empty">
			Define at least two colors (a foreground and a background) to auto-fix contrast.
		</p>
	{:else}
		<div class="controls">
			<label class="field">
				<span>Foreground</span>
				<select class="select" bind:value={fgIdx}>
					{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>Background</span>
				<select class="select" bind:value={bgIdx}>
					{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
				</select>
			</label>
			<label class="field">
				<span>Target</span>
				<select class="select" bind:value={targetId}>
					{#each TARGETS as t (t.id)}<option value={t.id}>{t.label}</option>{/each}
				</select>
			</label>
			<button class="btn btn-accent" onclick={apply} disabled={!fixed?.changed}>
				{fixed?.changed ? 'Insert fixed color' : 'Already passes'}
			</button>
		</div>

		{#if fg && bg && fixed}
			<div class="compare">
				<div class="side">
					<div class="cap">Before</div>
					<div class="demo" style="background:{bg.color.hex}; color:{fg.color.hex}">
						Aa Sample text
					</div>
					<div class="metrics">
						<span class="m" class:bad={beforeRatio < target}>WCAG {beforeRatio.toFixed(2)}</span>
						<span class="m">APCA {Math.round(beforeApca)}</span>
					</div>
				</div>
				<div class="arrow">→</div>
				<div class="side">
					<div class="cap">After</div>
					<div class="demo" style="background:{bg.color.hex}; color:{fixed.color.hex}">
						Aa Sample text
					</div>
					<div class="metrics">
						<span class="m" class:good={afterRatio >= target}>WCAG {afterRatio.toFixed(2)}</span>
						<span class="m">APCA {Math.round(afterApca)}</span>
						<span class="hx">{fixed.color.hex}</span>
					</div>
				</div>
			</div>
			{#if !fixed.changed}
				<p class="hint">This pair already meets the target — nothing to change.</p>
			{/if}
		{/if}
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
	.compare {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
	}
	.side {
		flex: 1;
		min-width: 160px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.cap {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
	}
	.demo {
		padding: 18px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		font-size: 17px;
		font-weight: 600;
	}
	.arrow {
		color: var(--text-faint);
		font-size: 20px;
	}
	.metrics {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}
	.m {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-muted);
		padding: 1px 7px;
		border-radius: 99px;
		background: var(--surface-2);
	}
	.m.bad {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
	}
	.m.good {
		background: color-mix(in srgb, var(--ok) 16%, transparent);
		color: var(--ok);
	}
	.hx {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
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

	@media (max-width: 520px) {
		.compare {
			flex-direction: column;
			align-items: stretch;
		}
		.side {
			min-width: 0;
		}
		.arrow {
			align-self: center;
			transform: rotate(90deg);
		}
	}
</style>
