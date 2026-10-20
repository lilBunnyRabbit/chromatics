<script lang="ts">
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import { getModel } from '$lib/models';
	import { printProof } from '$lib/analysis/print';
	import { nearestName } from '$lib/color-names';

	let { data }: { data: any } = $props();

	const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

	// Round a channel value sensibly: small magnitudes get more decimals.
	function fmt(v: number): string {
		if (!Number.isFinite(v)) return '—';
		const a = Math.abs(v);
		if (a !== 0 && a < 1) return v.toFixed(3);
		if (a < 10) return v.toFixed(2);
		return Math.round(v).toString();
	}

	// ── channels ──────────────────────────────────────────────
	const channelRows = $derived.by(() => {
		if (data?.__preview !== 'channels') return [];
		const chans = getModel(data.model)?.channels ?? getModel('oklch')?.channels ?? [];
		return chans.map((ch) => {
			const value = data.color.channel(ch.key);
			const [lo, hi] = ch.range;
			const span = hi - lo;
			const fill = span === 0 ? 0 : clamp(((value - lo) / span) * 100);
			return { label: ch.label, value, fill };
		});
	});

	// ── gamut ─────────────────────────────────────────────────
	const gamut = $derived.by(() => {
		if (data?.__preview !== 'gamut') return null;
		const c = data.color;
		const inSRGB = c.inGamut;
		return {
			hex: c.hex,
			inSRGB,
			inP3: c.inP3,
			mappedHex: inSRGB ? null : c.gamutMapped.hex
		};
	});

	// ── print ─────────────────────────────────────────────────
	const proof = $derived.by(() => {
		if (data?.__preview !== 'print') return null;
		return printProof(data.color);
	});
	const inkBars = $derived.by(() => {
		const p = proof;
		if (!p) return [];
		return [
			{ key: 'C', value: p.c },
			{ key: 'M', value: p.m },
			{ key: 'Y', value: p.y },
			{ key: 'K', value: p.k }
		];
	});

	// ── name ──────────────────────────────────────────────────
	const named = $derived.by(() => {
		if (data?.__preview !== 'name') return null;
		const n = nearestName(data.color);
		return { ...n, hex: data.color.hex };
	});

	// ── temperature ───────────────────────────────────────────
	const temp = $derived.by(() => {
		if (data?.__preview !== 'temperature') return null;
		let h = data.color.channel('ok_h');
		if (!Number.isFinite(h)) h = 0;
		h = ((h % 360) + 360) % 360;
		const warm = (h >= 0 && h <= 90) || (h >= 300 && h <= 360);
		const cool = h >= 150 && h <= 270;
		const label = warm ? 'Warm' : cool ? 'Cool' : 'Neutral';
		// Marker: warm at 0%, cool at 100%. Map hue onto that axis.
		// Warm hues (orange/red/yellow) → left; cool (green/blue) → right.
		let pos: number;
		if (h <= 90)
			pos = (h / 90) * 33; // 0–33% warm zone (0→yellow)
		else if (h < 150)
			pos = 33 + ((h - 90) / 60) * 17; // toward neutral
		else if (h <= 270)
			pos = 50 + ((h - 150) / 120) * 40; // cool zone
		else pos = 90 + ((h - 270) / 90) * 10; // wrap toward warm
		return { hex: data.color.hex, hue: h, label, pos: clamp(pos) };
	});
</script>

<div class="body">
	{#if data.__preview === 'space'}
		<div class="space-box">
			<ModelViewer seed={data.color.hex} />
		</div>
		<div class="caption">{data.model}</div>
	{:else if data.__preview === 'channels'}
		<div class="channels">
			{#each channelRows as ch (ch.label)}
				<div class="ch-row">
					<span class="ch-label">{ch.label}</span>
					<div class="ch-track">
						<span class="ch-fill" style:width={ch.fill + '%'}></span>
					</div>
					<span class="ch-value">{fmt(ch.value)}</span>
				</div>
			{/each}
		</div>
		<div class="caption">{data.model}</div>
	{:else if data.__preview === 'gamut'}
		{#if gamut}
			<div class="gamut">
				<div class="badges">
					<span class="badge" class:ok={gamut.inSRGB} class:bad={!gamut.inSRGB}>sRGB</span>
					<span class="badge" class:ok={gamut.inP3} class:bad={!gamut.inP3}>Display-P3</span>
				</div>
				<div class="gamut-swatches">
					<div class="gs-row">
						<span class="swatch" style:background={gamut.hex}></span>
						<span class="gs-label">{gamut.hex}</span>
					</div>
					{#if gamut.mappedHex}
						<div class="gs-row">
							<span class="swatch" style:background={gamut.mappedHex}></span>
							<span class="gs-label">mapped → {gamut.mappedHex}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{:else if data.__preview === 'print'}
		{#if proof}
			<div class="print">
				<div class="ink-bars">
					{#each inkBars as ink (ink.key)}
						<div class="ink-col">
							<div class="ink-track">
								<span class="ink-fill" style:height={clamp(ink.value * 100) + '%'}></span>
							</div>
							<span class="ink-label">{ink.key}</span>
						</div>
					{/each}
				</div>
				<div class="print-meta">
					<span class="ink-total" class:over={proof.overInk}>
						{Math.round(proof.totalInk)}% ink
					</span>
					{#if proof.richBlack}
						<span class="tag">rich black</span>
					{/if}
					{#if proof.overInk}
						<div class="gs-row">
							<span class="swatch" style:background={proof.proofHex}></span>
							<span class="gs-label">→ proofed</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	{:else if data.__preview === 'name'}
		{#if named}
			<div class="name">
				<span class="name-swatch" style:background={named.hex}></span>
				<div class="name-meta">
					<span class="name-title">≈ {named.name}</span>
					<span class="name-de">ΔE {named.deltaE.toFixed(1)}</span>
					<span class="name-hex">{named.hex}</span>
				</div>
			</div>
		{/if}
	{:else if data.__preview === 'temperature'}
		{#if temp}
			<div class="temp">
				<div class="temp-bar">
					<span class="temp-marker" style:left={temp.pos + '%'}></span>
				</div>
				<div class="temp-meta">
					<span
						class="temp-label"
						class:warm={temp.label === 'Warm'}
						class:cool={temp.label === 'Cool'}
					>
						{temp.label}
					</span>
					<span class="temp-hue">hue {Math.round(temp.hue)}°</span>
				</div>
				<div class="caption">hue-based warmth</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.body {
		padding: 4px;
		width: 100%;
		box-sizing: border-box;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--text);
	}

	.caption {
		margin-top: 4px;
		font-size: 10px;
		color: var(--text-faint);
	}

	.swatch {
		width: 16px;
		height: 16px;
		flex: 0 0 auto;
		border-radius: 3px;
		border: 1px solid var(--border);
	}

	.gs-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.gs-label {
		font-size: 10px;
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* space */
	.space-box {
		width: 100%;
		height: 300px;
		overflow: hidden;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--surface-2);
	}

	/* channels */
	.channels {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 100%;
	}
	.ch-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.ch-label {
		flex: 0 0 auto;
		min-width: 56px;
		font-size: 10px;
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ch-track {
		flex: 1 1 0;
		height: 8px;
		border-radius: 4px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		overflow: hidden;
		min-width: 0;
	}
	.ch-fill {
		display: block;
		height: 100%;
		background: var(--accent);
		border-radius: 4px;
	}
	.ch-value {
		flex: 0 0 auto;
		min-width: 44px;
		text-align: right;
		font-size: 10px;
		color: var(--text);
	}

	/* gamut */
	.gamut {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.badges {
		display: flex;
		gap: 6px;
	}
	.badge {
		font-size: 10px;
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		color: var(--text-muted);
	}
	.badge.ok {
		color: var(--ok);
		border-color: color-mix(in srgb, var(--ok) 50%, var(--border));
		background: color-mix(in srgb, var(--ok) 12%, transparent);
	}
	.badge.bad {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 50%, var(--border));
		background: color-mix(in srgb, var(--danger) 12%, transparent);
	}
	.gamut-swatches {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	/* print */
	.print {
		display: flex;
		align-items: flex-end;
		gap: 14px;
	}
	.ink-bars {
		display: flex;
		gap: 6px;
		flex: 0 0 auto;
	}
	.ink-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}
	.ink-track {
		width: 16px;
		height: 56px;
		display: flex;
		align-items: flex-end;
		border-radius: 3px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		overflow: hidden;
	}
	.ink-fill {
		display: block;
		width: 100%;
		background: var(--accent);
	}
	.ink-label {
		font-size: 9px;
		color: var(--text-muted);
	}
	.print-meta {
		display: flex;
		flex-direction: column;
		gap: 5px;
		min-width: 0;
	}
	.ink-total {
		font-size: 11px;
		color: var(--text);
	}
	.ink-total.over {
		color: var(--danger);
	}
	.tag {
		font-size: 10px;
		color: var(--text-muted);
		padding: 1px 6px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		align-self: flex-start;
	}

	/* name */
	.name {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.name-swatch {
		flex: 0 0 auto;
		width: 56px;
		height: 56px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
	}
	.name-meta {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.name-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
	}
	.name-de {
		font-size: 10px;
		color: var(--text-muted);
	}
	.name-hex {
		font-size: 11px;
		color: var(--text-faint);
	}

	/* temperature */
	.temp {
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: 100%;
	}
	.temp-bar {
		position: relative;
		width: 100%;
		height: 16px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: linear-gradient(90deg, #ff8a3d, #d9d9d9, #4da3ff);
	}
	.temp-marker {
		position: absolute;
		top: -3px;
		width: 4px;
		height: 22px;
		border-radius: 2px;
		background: var(--text);
		border: 1px solid var(--surface);
		transform: translateX(-50%);
	}
	.temp-meta {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}
	.temp-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text);
	}
	.temp-label.warm {
		color: #ff8a3d;
	}
	.temp-label.cool {
		color: #4da3ff;
	}
	.temp-hue {
		font-size: 10px;
		color: var(--text-muted);
	}

	/* On phones the embedded 3D ModelViewer is heavy/awkward; shrink its box.
	   (ModelViewer sets touch-action:none, so dragging won't hijack scroll.) */
	@media (max-width: 480px) {
		.space-box {
			height: 210px;
		}
	}
</style>
