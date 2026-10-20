<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { contrastRatio } from '$lib/analysis/contrast';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';
	import { apcaContrast, apcaUse, apcaColor } from '$lib/analysis/apca';
	import { similarPairs } from '$lib/analysis/similarity';
	import { printProof, INK_LIMITS } from '$lib/analysis/print';

	const entries = $derived(app.scheme.entries);

	// — Contrast (every color as text over a chosen background) —
	let bgIdx = $state(0);
	const safeBg = $derived(Math.min(bgIdx, Math.max(0, entries.length - 1)));
	const bg = $derived(entries[safeBg]);
	const contrastRows = $derived.by(() => {
		if (!bg) return [];
		return entries
			.filter((_, i) => i !== safeBg)
			.map((e) => {
				const wc = contrastRatio(e.color, bg.color);
				const lc = apcaContrast(e.color, bg.color);
				return { name: e.name, hex: e.color.hex, wc, levels: wcagLevels(wc), lc, use: apcaUse(lc) };
			});
	});

	// — Similarity —
	let simThreshold = $state(10);
	const pairs = $derived(similarPairs(entries, simThreshold));

	// — Print soft-proof —
	let inkLimit = $state(300);
	const proofs = $derived.by(() =>
		entries.map((e) => ({ name: e.name, hex: e.color.hex, ...printProof(e.color, inkLimit) }))
	);
</script>

<div class="validate scroll">
	{#if entries.length === 0}
		<div class="empty">Define some colors to validate them.</div>
	{:else}
		<!-- Contrast -->
		<section class="card">
			<div class="card-head">
				<h3>Contrast — WCAG 2 &amp; APCA</h3>
				<label class="field">
					<span>over</span>
					<select class="select" bind:value={bgIdx}>
						{#each entries as e, i (e.name)}<option value={i}>{e.name}</option>{/each}
					</select>
				</label>
			</div>
			<div class="ctable">
				<div class="ct-head">
					<span>Color</span><span>WCAG</span><span>Normal</span><span>Large</span><span
						>APCA Lc</span
					><span>Use</span>
				</div>
				{#each contrastRows as r (r.name)}
					<div class="ct-row">
						<span class="ct-name"><i class="dot" style="background:{r.hex}"></i>{r.name}</span>
						<span class="mono">{r.wc.toFixed(2)}</span>
						<span class="lvl" style="color:{wcagColor(r.levels.normal)}">{r.levels.normal}</span>
						<span class="lvl" style="color:{wcagColor(r.levels.large)}">{r.levels.large}</span>
						<span class="mono">{Math.round(r.lc)}</span>
						<span class="lvl" style="color:{apcaColor(r.use)}">{r.use}</span>
					</div>
				{/each}
			</div>
			<p class="note">
				APCA is polarity-aware (sign = light-on-dark vs dark-on-light) and tracks readability
				better, especially in dark mode. “Use” is directional guidance, not a pass/fail.
			</p>
		</section>

		<!-- Similarity -->
		<section class="card">
			<div class="card-head">
				<h3>Similar colors — ΔE 2000</h3>
				<label class="field">
					<span>≤ ΔE {simThreshold}</span>
					<input type="range" min="1" max="25" bind:value={simThreshold} />
				</label>
			</div>
			{#if pairs.length === 0}
				<p class="ok-line">
					No pairs within ΔE {simThreshold} — every color is comfortably distinct.
				</p>
			{:else}
				<div class="pairs">
					{#each pairs as p (p.a + p.b)}
						<div class="pair" class:warn={p.level === 'identical' || p.level === 'imperceptible'}>
							<span class="pair-names">{p.a} ↔ {p.b}</span>
							<span class="pair-de mono">ΔE {p.deltaE.toFixed(1)}</span>
							<span class="pair-lvl">{p.level.replace('-', ' ')}</span>
						</div>
					{/each}
				</div>
				<p class="note">
					ΔE &lt; 2.3 is below the just-noticeable threshold — those pairs will read as the same
					color.
				</p>
			{/if}
		</section>

		<!-- Print -->
		<section class="card">
			<div class="card-head">
				<h3>Print soft-proof — CMYK</h3>
				<label class="field">
					<span>ink limit</span>
					<select class="select" bind:value={inkLimit}>
						{#each INK_LIMITS as l (l.value)}<option value={l.value}>{l.label}</option>{/each}
					</select>
				</label>
			</div>
			<div class="ptable">
				{#each proofs as p (p.name)}
					<div class="p-row" class:warn={p.overInk}>
						<span class="ct-name"><i class="dot" style="background:{p.hex}"></i>{p.name}</span>
						<span class="seps">
							{#each [['C', p.c], ['M', p.m], ['Y', p.y], ['K', p.k]] as [k, v] (k)}
								<span class="sep"
									><i style="height:{Math.round((v as number) * 100)}%"></i><em>{k}</em></span
								>
							{/each}
						</span>
						<span class="mono ink" class:over={p.overInk}>{Math.round(p.totalInk)}%</span>
						{#if p.overInk}
							<span class="proof"
								>→ <i class="dot" style="background:{p.proofHex}"></i>{p.proofHex}</span
							>
						{:else if p.richBlack}
							<span class="tag">rich black</span>
						{/if}
					</div>
				{/each}
			</div>
			<p class="note">
				Total area coverage over the limit is scaled down to the proofed swatch. Profile-less
				(naive) CMYK — directional, not a contract proof.
			</p>
		</section>
	{/if}
</div>

<style>
	.validate {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 14px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.card {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		padding: 14px 16px;
	}
	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}
	.card-head h3 {
		font-size: 14px;
		font-weight: 650;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.field input[type='range'] {
		width: 120px;
		accent-color: var(--accent);
	}
	.ctable,
	.ptable {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.ct-head {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		gap: 8px;
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-faint);
		padding: 0 8px 4px;
		border-bottom: 1px solid var(--border);
	}
	.ct-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
		gap: 8px;
		align-items: center;
		padding: 5px 8px;
		border-radius: var(--radius-sm);
		font-size: 12px;
	}
	.ct-row:hover {
		background: var(--surface-2);
	}
	.ct-name {
		display: flex;
		align-items: center;
		gap: 7px;
		font-weight: 600;
		min-width: 0;
	}
	.dot {
		width: 14px;
		height: 14px;
		border-radius: 4px;
		border: 1px solid color-mix(in srgb, var(--text) 14%, transparent);
		flex-shrink: 0;
		display: inline-block;
	}
	.mono {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--text-muted);
	}
	.lvl {
		font-weight: 700;
		font-size: 11px;
	}
	.note {
		font-size: 11px;
		color: var(--text-faint);
		margin-top: 10px;
		line-height: 1.5;
	}
	.ok-line {
		font-size: 12.5px;
		color: var(--ok);
	}
	.pairs {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.pair {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 6px 10px;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		font-size: 12.5px;
	}
	.pair.warn {
		background: color-mix(in srgb, var(--warn) 14%, transparent);
	}
	.pair-names {
		font-weight: 600;
	}
	.pair-de {
		margin-left: auto;
	}
	.pair-lvl {
		font-size: 11px;
		color: var(--text-faint);
		width: 96px;
		text-align: right;
	}
	.p-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 6px 8px;
		border-radius: var(--radius-sm);
		font-size: 12px;
	}
	.p-row:hover {
		background: var(--surface-2);
	}
	.p-row.warn {
		background: color-mix(in srgb, var(--warn) 12%, transparent);
	}
	.p-row .ct-name {
		width: 160px;
		flex-shrink: 0;
	}
	.seps {
		display: flex;
		gap: 6px;
		align-items: flex-end;
		height: 26px;
	}
	.sep {
		width: 14px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		height: 100%;
	}
	.sep i {
		width: 8px;
		background: var(--text-muted);
		border-radius: 2px 2px 0 0;
		min-height: 1px;
		display: block;
	}
	.sep em {
		font-size: 8px;
		font-style: normal;
		color: var(--text-faint);
	}
	.ink {
		margin-left: auto;
	}
	.ink.over {
		color: var(--danger);
		font-weight: 700;
	}
	.proof {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-faint);
	}
	.tag {
		font-size: 10px;
		color: var(--text-faint);
		padding: 1px 7px;
		border-radius: 99px;
		background: var(--surface-2);
	}
	.empty {
		padding: 32px;
		color: var(--text-faint);
		font-size: 13px;
	}

	@media (max-width: 640px) {
		/* (1) Keep the 6 fractional contrast columns legible on narrow screens. */
		.ct-head,
		.ct-row {
			gap: 4px;
			padding-left: 4px;
			padding-right: 4px;
		}
		.ct-head {
			font-size: 9px;
		}
		.ct-row {
			font-size: 11px;
		}
		.lvl {
			font-size: 10px;
		}

		/* (2) Let print rows wrap: name takes its own line, CMYK bars + ink% + proof wrap below. */
		.p-row {
			flex-wrap: wrap;
			gap: 8px 12px;
		}
		.p-row .ct-name {
			flex: 1 1 100%;
			width: auto;
		}

		/* (3) Relax similarity level width; full-width sliders with a 40px touch target. */
		.pair-lvl {
			width: auto;
		}
		.field input[type='range'] {
			width: 100%;
			min-height: 40px;
		}
	}
</style>
