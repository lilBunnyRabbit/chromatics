<script lang="ts">
	import { lerpInMode, type HueStrategy } from '$lib/models/util';
	import { interpSpace, rampColors, harmonyColors, type ColorValue } from '$lib/models';
	import { deltaE2000 } from '$lib/analysis/similarity';

	let { data }: { data: any } = $props();

	const r1 = (n: number) => Math.round(n * 10) / 10;

	// ── gradient ──────────────────────────────────────────────
	const gradientSpace = $derived(interpSpace(data?.space ?? 'oklab'));

	// stops + 2 discrete chips: from, intermediates, to. Each chip is gamut-mapped
	// (perceptual midpoints that leave sRGB clamp by chroma, not by hue twist) and
	// flagged `oog` if the raw interpolated color was outside sRGB before mapping.
	const gradientChips = $derived.by(() => {
		if (data?.__preview !== 'gradient') return [];
		const n = Math.max(0, data.stops | 0);
		const hue = (data.hue ?? 'shorter') as HueStrategy;
		const chip = (c: ColorValue) => ({ hex: c.gamutMapped.hex, oog: !c.inGamut });
		const out = [chip(data.from)];
		for (let i = 1; i <= n; i++) {
			const t = i / (n + 1);
			out.push(chip(lerpInMode(data.from, data.to, gradientSpace.mode, t, hue)));
		}
		out.push(chip(data.to));
		return out;
	});

	const gradientCSS = $derived(
		`linear-gradient(90deg, ${gradientChips.map((c) => c.hex).join(', ')})`
	);
	const gradientCaption = $derived.by(() => {
		const cyl = gradientSpace.cylindrical && (data?.hue ?? 'shorter') !== 'shorter';
		const base = cyl ? `${gradientSpace.label} · ${data.hue} hue` : gradientSpace.label;
		const oog = gradientChips.filter((c) => c.oog).length;
		return oog > 0 ? `${base} · ${oog} out of sRGB` : base;
	});

	// ── ramp ──────────────────────────────────────────────────
	const rampSteps = $derived.by(() => {
		if (data?.__preview !== 'ramp') return [];
		return rampColors(data.base, data.mode).map((s) => ({
			hex: s.color.gamutMapped.hex,
			shade: s.shade,
			oog: !s.color.inGamut,
			color: s.color as ColorValue
		}));
	});

	// Perceptual spacing between adjacent shades (ΔE2000) + how many left sRGB —
	// makes the model choice legible (an even ramp has tight ΔE min↔max).
	const rampCaption = $derived.by(() => {
		const steps = rampSteps;
		if (steps.length < 2) return data?.mode ?? '';
		let min = Infinity;
		let max = 0;
		for (let i = 1; i < steps.length; i++) {
			const dE = deltaE2000(steps[i - 1].color, steps[i].color);
			if (dE < min) min = dE;
			if (dE > max) max = dE;
		}
		const oog = steps.filter((s) => s.oog).length;
		const base = `${data.mode} · ΔE ${r1(min)}–${r1(max)}`;
		return oog > 0 ? `${base} · ${oog} out of sRGB` : base;
	});

	// ── harmony ───────────────────────────────────────────────
	const harmony = $derived.by(() => {
		if (data?.__preview !== 'harmony') return null;
		const R = 80;
		const pt = (hue: number) => {
			const a = ((hue - 90) * Math.PI) / 180;
			return { x: Math.cos(a) * R, y: Math.sin(a) * R };
		};
		const swatches = harmonyColors(data.base, data.scheme, data.model).map((s) => ({
			hex: s.color.gamutMapped.hex,
			hue: s.hue,
			isBase: s.base,
			...pt(s.hue)
		}));
		const base = swatches.find((s) => s.isBase) ?? swatches[0];
		const derived = swatches.filter((s) => !s.isBase);
		return { base, derived, swatches };
	});

	// ── mix ───────────────────────────────────────────────────
	const mixChips = $derived.by(() => {
		if (data?.__preview !== 'mix') return [];
		const n = Math.max(1, data.steps | 0);
		const out: { hex: string }[] = [];
		for (let i = 0; i < n; i++) {
			const t = n === 1 ? 0 : i / (n - 1);
			out.push({ hex: lerpInMode(data.from, data.to, 'oklab', t).gamutMapped.hex });
		}
		return out;
	});
</script>

<div class="body">
	{#if data.__preview === 'gradient'}
		<div class="bar" style:background={gradientCSS}></div>
		<div class="chips">
			{#each gradientChips as c, i (i)}
				<span
					class="chip"
					class:oog={c.oog}
					style:background={c.hex}
					title={c.oog ? 'outside sRGB — shown gamut-mapped' : ''}
				></span>
			{/each}
		</div>
		<div class="caption">{gradientCaption}</div>
	{:else if data.__preview === 'ramp'}
		<div class="ramp">
			{#each rampSteps as step (step.shade)}
				<div class="ramp-col">
					<span
						class="ramp-block"
						class:oog={step.oog}
						style:background={step.hex}
						title={step.oog ? 'outside sRGB — shown gamut-mapped' : ''}
					></span>
					<span class="ramp-label">{step.shade}</span>
				</div>
			{/each}
		</div>
		<div class="caption">{rampCaption}</div>
	{:else if data.__preview === 'harmony'}
		{#if harmony}
			<div class="harmony">
				<svg class="wheel" viewBox="-100 -100 200 200" aria-hidden="true">
					<circle cx="0" cy="0" r="80" class="wheel-ring" />
					{#each harmony.derived as d (d.hue)}
						<line x1="0" y1="0" x2={d.x} y2={d.y} class="spoke" />
						<circle cx={d.x} cy={d.y} r="9" fill={d.hex} class="dot" />
					{/each}
					<circle
						cx={harmony.base.x}
						cy={harmony.base.y}
						r="13"
						fill={harmony.base.hex}
						class="dot base"
					/>
				</svg>
				<div class="swatches">
					{#each harmony.swatches as s (s.hue)}
						<div class="swatch-row">
							<span class="swatch" style:background={s.hex}></span>
							<span class="swatch-hex">{s.hex}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="caption">{data.scheme} · {data.model}</div>
		{/if}
	{:else if data.__preview === 'mix'}
		<div class="mix">
			{#each mixChips as chip, i (i)}
				<div class="mix-col">
					<span class="mix-block" style:background={chip.hex}></span>
					<span class="mix-hex">{chip.hex}</span>
				</div>
			{/each}
		</div>
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

	/* gradient */
	.bar {
		width: 100%;
		height: 48px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
	}
	.chips {
		display: flex;
		gap: 3px;
		margin-top: 4px;
	}
	.chip {
		flex: 1 1 0;
		height: 16px;
		border-radius: 3px;
		border: 1px solid var(--border);
	}

	/* ramp */
	.ramp {
		display: flex;
		gap: 2px;
		width: 100%;
	}
	.ramp-col {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}
	.ramp-block {
		width: 100%;
		height: 40px;
		border-radius: 3px;
		border: 1px solid var(--border);
	}
	.ramp-label {
		font-size: 9px;
		color: var(--text-muted);
		margin-top: 3px;
	}

	/* out-of-sRGB marker (shared by gradient chips + ramp blocks) */
	.chip.oog,
	.ramp-block.oog {
		outline: 2px dashed color-mix(in srgb, var(--text) 55%, transparent);
		outline-offset: -3px;
	}

	/* harmony */
	.harmony {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.wheel {
		width: 120px;
		height: 120px;
		flex: 0 0 auto;
	}
	.wheel-ring {
		fill: none;
		stroke: var(--border);
		stroke-width: 1.5;
	}
	.spoke {
		stroke: var(--border);
		stroke-width: 1;
	}
	.dot {
		stroke: var(--surface);
		stroke-width: 2;
	}
	.dot.base {
		stroke: var(--text);
		stroke-width: 2;
	}
	.swatches {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.swatch-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.swatch {
		width: 16px;
		height: 16px;
		flex: 0 0 auto;
		border-radius: 3px;
		border: 1px solid var(--border);
	}
	.swatch-hex {
		font-size: 10px;
		color: var(--text-muted);
	}

	/* mix */
	.mix {
		display: flex;
		gap: 4px;
		width: 100%;
	}
	.mix-col {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}
	.mix-block {
		width: 100%;
		height: 44px;
		border-radius: 3px;
		border: 1px solid var(--border);
	}
	.mix-hex {
		font-size: 8px;
		color: var(--text-muted);
		margin-top: 3px;
		white-space: nowrap;
	}

	/* mobile (narrow viewport) */
	@media (max-width: 480px) {
		.harmony {
			flex-direction: column;
			align-items: stretch;
		}
		.wheel {
			width: 96px;
			height: 96px;
			align-self: center;
		}
		.swatches {
			width: 100%;
		}
		.mix {
			overflow-x: auto;
		}
	}
</style>
