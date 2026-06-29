<script lang="ts">
	import { lerpInMode, wrapHue } from '$lib/models/util';
	import { OKLCH } from '$lib/models';

	let { data }: { data: any } = $props();

	// ── gradient ──────────────────────────────────────────────
	const spaceToMode: Record<string, string> = {
		oklab: 'oklab',
		oklch: 'oklch',
		linear: 'lrgb'
	};

	const gradientMode = $derived(spaceToMode[data?.space] ?? 'oklab');

	// stops + 2 discrete chips: from, intermediates, to
	const gradientChips = $derived.by(() => {
		if (data?.__preview !== 'gradient') return [];
		const n = Math.max(0, data.stops | 0);
		const out: string[] = [data.from.hex];
		for (let i = 1; i <= n; i++) {
			const t = i / (n + 1);
			out.push(lerpInMode(data.from, data.to, gradientMode, t).hex);
		}
		out.push(data.to.hex);
		return out;
	});

	const gradientCSS = $derived(`linear-gradient(90deg, ${gradientChips.join(', ')})`);

	// ── ramp ──────────────────────────────────────────────────
	const RAMP_L = [0.97, 0.93, 0.86, 0.77, 0.67, 0.58, 0.5, 0.42, 0.34, 0.26, 0.19];
	const RAMP_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

	const rampSteps = $derived.by(() => {
		if (data?.__preview !== 'ramp') return [];
		const c = data.base.channel('ok_c');
		const h = data.base.channel('ok_h');
		return RAMP_L.map((L, i) => ({
			hex: OKLCH(L, c, h).gamutMapped.hex,
			shade: RAMP_SHADES[i]
		}));
	});

	// ── harmony ───────────────────────────────────────────────
	const SCHEME_OFFSETS: Record<string, number[]> = {
		complementary: [180],
		analogous: [-30, 30],
		triadic: [120, 240],
		split: [150, 210],
		tetradic: [90, 180, 270]
	};

	const harmony = $derived.by(() => {
		if (data?.__preview !== 'harmony') return null;
		const l = data.base.channel('ok_l');
		const c = data.base.channel('ok_c');
		const h = data.base.channel('ok_h');
		const offsets = SCHEME_OFFSETS[data.scheme] ?? [180];
		const R = 80;
		const pt = (hue: number) => {
			const a = ((hue - 90) * Math.PI) / 180;
			return { x: Math.cos(a) * R, y: Math.sin(a) * R };
		};
		const base = { hex: data.base.hex, hue: h, ...pt(h) };
		const derived = offsets.map((deg) => {
			const hue = wrapHue(h + deg);
			return { hex: OKLCH(l, c, hue).gamutMapped.hex, hue, ...pt(hue) };
		});
		return { base, derived, swatches: [base, ...derived] };
	});

	// ── mix ───────────────────────────────────────────────────
	const mixChips = $derived.by(() => {
		if (data?.__preview !== 'mix') return [];
		const n = Math.max(1, data.steps | 0);
		const out: { hex: string }[] = [];
		for (let i = 0; i < n; i++) {
			const t = n === 1 ? 0 : i / (n - 1);
			out.push({ hex: lerpInMode(data.from, data.to, 'oklab', t).hex });
		}
		return out;
	});
</script>

<div class="body">
	{#if data.__preview === 'gradient'}
		<div class="bar" style:background={gradientCSS}></div>
		<div class="chips">
			{#each gradientChips as hex, i (i)}
				<span class="chip" style:background={hex}></span>
			{/each}
		</div>
		<div class="caption">{data.space}</div>
	{:else if data.__preview === 'ramp'}
		<div class="ramp">
			{#each rampSteps as step (step.shade)}
				<div class="ramp-col">
					<span class="ramp-block" style:background={step.hex}></span>
					<span class="ramp-label">{step.shade}</span>
				</div>
			{/each}
		</div>
		<div class="caption">{data.mode}</div>
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
			<div class="caption">{data.scheme}</div>
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
