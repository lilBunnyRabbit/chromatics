<script lang="ts">
	import { Color, Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';
	import { parse } from '@lilbunnyrabbit/chromatics/all';
	import { CATALOG, infoByName, type ModelInfo } from '$lib/color/catalog';
	import { LEGACY_MODEL_IDS } from '$lib/color/legacy';
	import { buildFromVals, lightIndex, seedVals } from '$lib/mixer/engine';
	import { MODEL_DOCS } from '$lib/dsl/model-docs';
	import { ui } from '$lib/state/ui.svelte';

	let {
		seed = '#3aa0ff',
		pinned,
		compact = false
	}: { seed?: string | Color; pinned?: string; compact?: boolean } = $props();

	const FAMILY_LABEL: Record<string, string> = {
		perceptual: 'Perceptual cylindrical',
		lab: 'Lab family',
		hue: 'Hue family',
		rgb: 'RGB family',
		tristimulus: 'Tristimulus',
		video: 'Video / broadcast',
		subtractive: 'Subtractive',
		appearance: 'Color appearance'
	};
	const FAMILY_ORDER = [
		'perceptual',
		'lab',
		'hue',
		'rgb',
		'tristimulus',
		'video',
		'subtractive',
		'appearance'
	];
	const pickable = CATALOG.filter((m) => m.channels.length === 3);
	const grouped = FAMILY_ORDER.map((f) => ({
		label: FAMILY_LABEL[f] ?? f,
		models: pickable.filter((m) => m.family === f).sort((a, b) => a.label.localeCompare(b.label))
	})).filter((g) => g.models.length);

	// MODEL_DOCS is keyed by old studio ids; the first old id per package model owns the write-up.
	const docIdOf = new Map<string, string>();
	for (const [id, name] of Object.entries(LEGACY_MODEL_IDS))
		if (!docIdOf.has(name)) docIdOf.set(name, id);

	const DENSITY = [
		{ label: 'Coarse', n: 10 },
		{ label: 'Normal', n: 16 },
		{ label: 'Dense', n: 22 },
		{ label: 'Fine', n: 30 },
		{ label: 'Max', n: 40 }
	];

	const isPickable = (name: string | undefined) => !!name && pickable.some((m) => m.name === name);

	// Seed from the pinned model when embedded; the $effect below keeps it in sync.
	// svelte-ignore state_referenced_locally
	let modelName = $state(isPickable(pinned) ? pinned! : 'Oklch');
	let density = $state(22);
	let vals = $state<number[]>([0.7, 0.15, 250]);
	let yaw = $state(-0.7);
	let pitch = $state(0.5);
	let canvas: HTMLCanvasElement | undefined = $state();
	let dragging = false;
	let lastX = 0;
	let lastY = 0;

	const info = $derived(infoByName(modelName) ?? pickable[0]);
	const about = $derived(MODEL_DOCS[docIdOf.get(modelName) ?? '']?.about);

	// When embedded pinned to one model (encyclopedia), follow the parent's model.
	$effect(() => {
		if (pinned && pinned !== modelName && isPickable(pinned)) modelName = pinned;
	});

	type Vec3 = { x: number; y: number; z: number };

	type CylInfo =
		| { hueIdx: number; kind: 'lc'; lightIdx: number; chromaIdx: number }
		| { hueIdx: number; kind: 'wb'; wIdx: number; bIdx: number };

	/** How to arrange a hue-based model as a cylinder/cone, or null if cartesian. */
	function cylInfo(m: ModelInfo): CylInfo | null {
		const ch = m.channels;
		const hueIdx = ch.findIndex((c) => c.hue === true);
		if (hueIdx < 0) return null;
		// hue + chroma + lightness (OKLCH, HSL, LCh, HCT, CAM16, …)
		const lightIdx = lightIndex(m);
		if (lightIdx >= 0) {
			const chromaIdx = [0, 1, 2].find((i) => i !== hueIdx && i !== lightIdx)!;
			return { hueIdx, kind: 'lc', lightIdx, chromaIdx };
		}
		// hue + whiteness + blackness (HWB) → a bicone
		const wIdx = ch.findIndex((c, i) => i !== hueIdx && c.name === 'w');
		const bIdx = ch.findIndex((c, i) => i !== hueIdx && c.name === 'b');
		if (wIdx >= 0 && bIdx >= 0) return { hueIdx, kind: 'wb', wIdx, bIdx };
		return null;
	}
	const isCyl = $derived(cylInfo(info) !== null);
	/** For cartesian models: which channel goes on the vertical axis, plus x/z. */
	function boxAxes(m: ModelInfo): [number, number, number] {
		const li = lightIndex(m);
		const yi = li < 0 ? 1 : li;
		const rest = [0, 1, 2].filter((i) => i !== yi);
		return [rest[0], yi, rest[1]];
	}

	function seedColor(): Color | null {
		if (seed instanceof Color) return seed;
		try {
			return parse(seed);
		} catch {
			return null;
		}
	}

	// Re-seed the sliders whenever the model changes.
	let lastModel = '';
	$effect(() => {
		if (modelName === lastModel) return;
		lastModel = modelName;
		const c = seedColor();
		vals = c ? seedVals(c, info) : info.channels.map((ch) => (ch.range[0] + ch.range[1]) / 2);
	});

	const current = $derived(buildFromVals(info, vals));
	const curHex = $derived.by(() => {
		try {
			return current ? current.to(Srgb).gamutMap().to(Srgb8).toHex() : '#000000';
		} catch {
			return '#000000';
		}
	});
	const inGamut = $derived.by(() => {
		try {
			return current ? current.to(Srgb).inGamut() : false;
		} catch {
			return false;
		}
	});

	interface Prim {
		v: Vec3[];
		n: Vec3;
		rgb: [number, number, number];
	}

	/** Map a color into this model's 3-D layout (polar for cylindrical, box else); null if it can't convert. */
	function layoutFor(m: ModelInfo): (c: Color) => Vec3 | null {
		const ch = m.channels;
		const coordsOf = (c: Color): readonly number[] | null => {
			try {
				return c.to(m.model).coords;
			} catch {
				return null;
			}
		};
		const cyl = cylInfo(m);
		if (cyl) {
			const [hLo, hHi] = ch[cyl.hueIdx].range;
			const angle = (k: readonly number[]) => ((k[cyl.hueIdx] - hLo) / (hHi - hLo)) * 2 * Math.PI;
			if (cyl.kind === 'lc') {
				const [lLo, lHi] = ch[cyl.lightIdx].range;
				const [cLo, cHi] = ch[cyl.chromaIdx].range;
				return (c) => {
					const k = coordsOf(c);
					if (!k) return null;
					const rad = Math.max(0, (k[cyl.chromaIdx] - cLo) / (cHi - cLo)) * 0.5;
					const th = angle(k);
					return {
						x: rad * Math.cos(th),
						y: (k[cyl.lightIdx] - lLo) / (lHi - lLo) - 0.5,
						z: rad * Math.sin(th)
					};
				};
			}
			// whiteness/blackness bicone: pure hue at the equator, white top, black bottom
			const [wLo, wHi] = ch[cyl.wIdx].range;
			const [bLo, bHi] = ch[cyl.bIdx].range;
			return (c) => {
				const k = coordsOf(c);
				if (!k) return null;
				const W = (k[cyl.wIdx] - wLo) / (wHi - wLo);
				const B = (k[cyl.bIdx] - bLo) / (bHi - bLo);
				const rad = Math.max(0, 1 - W - B) * 0.5;
				const th = angle(k);
				return { x: rad * Math.cos(th), y: (W - B) / 2, z: rad * Math.sin(th) };
			};
		}
		const [xi, yi, zi] = boxAxes(m);
		const nrm = (ci: number, v: number) => {
			const [lo, hi] = ch[ci].range;
			return hi === lo ? 0 : (v - lo) / (hi - lo) - 0.5;
		};
		return (c) => {
			const k = coordsOf(c);
			if (!k) return null;
			return { x: nrm(xi, k[xi]), y: nrm(yi, k[yi]), z: nrm(zi, k[zi]) };
		};
	}

	// ── geometry: the sRGB gamut as a solid, mapped into the model's space ──
	const geo = $derived.by(() => buildGamutSurface(info, density));

	function buildGamutSurface(m: ModelInfo, dens: number): Prim[] {
		const G = Math.max(6, Math.round(dens * 0.9));
		const layout = layoutFor(m);
		const node = (r: number, g: number, b: number) => ({
			p: layout(new Srgb(r, g, b)),
			rgb: [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)] as [
				number,
				number,
				number
			]
		});
		// six faces of the unit sRGB cube
		const faces: ((u: number, v: number) => [number, number, number])[] = [
			(u, v) => [0, u, v],
			(u, v) => [1, u, v],
			(u, v) => [u, 0, v],
			(u, v) => [u, 1, v],
			(u, v) => [u, v, 0],
			(u, v) => [u, v, 1]
		];
		const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
		const cross = (a: Vec3, b: Vec3): Vec3 => ({
			x: a.y * b.z - a.z * b.y,
			y: a.z * b.x - a.x * b.z,
			z: a.x * b.y - a.y * b.x
		});
		const normal = (a: Vec3, b: Vec3, c: Vec3): Vec3 => {
			const n = cross(sub(b, a), sub(c, a));
			const len = Math.hypot(n.x, n.y, n.z) || 1;
			return { x: n.x / len, y: n.y / len, z: n.z / len };
		};
		const avg = (cs: [number, number, number][]): [number, number, number] => [
			cs.reduce((s, c) => s + c[0], 0) / cs.length,
			cs.reduce((s, c) => s + c[1], 0) / cs.length,
			cs.reduce((s, c) => s + c[2], 0) / cs.length
		];
		const prims: Prim[] = [];
		for (const f of faces) {
			const grid: { p: Vec3 | null; rgb: [number, number, number] }[][] = [];
			for (let i = 0; i <= G; i++) {
				grid[i] = [];
				for (let j = 0; j <= G; j++) {
					const [r, g, b] = f(i / G, j / G);
					grid[i][j] = node(r, g, b);
				}
			}
			for (let i = 0; i < G; i++) {
				for (let j = 0; j < G; j++) {
					const a = grid[i][j],
						b = grid[i][j + 1],
						c = grid[i + 1][j + 1],
						e = grid[i + 1][j];
					if (!a.p || !b.p || !c.p || !e.p) continue; // Ryb can't reach a few dark blues
					prims.push({
						v: [a.p, b.p, c.p, e.p],
						n: normal(a.p, b.p, e.p),
						rgb: avg([a.rgb, b.rgb, c.rgb, e.rgb])
					});
				}
			}
		}
		return prims;
	}

	function draw() {
		const cv = canvas;
		if (!cv) return;
		const ctx = cv.getContext('2d');
		if (!ctx) return;
		const dpr = window.devicePixelRatio || 1;
		const w = cv.clientWidth || 320;
		const h = cv.clientHeight || 320;
		cv.width = w * dpr;
		cv.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		const cx = w / 2,
			cy = h / 2,
			scale = Math.min(w, h) * 0.64;
		const cosY = Math.cos(yaw),
			sinY = Math.sin(yaw),
			cosX = Math.cos(pitch),
			sinX = Math.sin(pitch);
		const rot = (p: Vec3): Vec3 => {
			const x1 = p.x * cosY - p.z * sinY;
			const z1 = p.x * sinY + p.z * cosY;
			const y2 = p.y * cosX - z1 * sinX;
			const z2 = p.y * sinX + z1 * cosX;
			return { x: x1, y: y2, z: z2 };
		};
		const drawn = geo
			.map((pr) => {
				const rv = pr.v.map(rot);
				const rn = rot(pr.n);
				const depth = rv.reduce((s, p) => s + p.z, 0) / rv.length;
				const shade = 0.74 + 0.26 * Math.min(1, Math.abs(rn.z));
				return { rv, depth, shade, rgb: pr.rgb };
			})
			.sort((a, b) => a.depth - b.depth);
		for (const pr of drawn) {
			const col = `rgb(${(pr.rgb[0] * pr.shade) | 0},${(pr.rgb[1] * pr.shade) | 0},${(pr.rgb[2] * pr.shade) | 0})`;
			ctx.fillStyle = col;
			ctx.strokeStyle = col;
			ctx.lineWidth = 1;
			ctx.beginPath();
			pr.rv.forEach((p, i) => {
				const sx = cx + p.x * scale,
					sy = cy - p.y * scale;
				if (i === 0) ctx.moveTo(sx, sy);
				else ctx.lineTo(sx, sy);
			});
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// current-color marker, placed in the same layout
		const mp = layoutFor(info)(current ?? new Srgb(0, 0, 0)) ?? { x: 0, y: -0.5, z: 0 };
		const m = rot(mp);
		ctx.beginPath();
		ctx.arc(cx + m.x * scale, cy - m.y * scale, 8, 0, 6.2832);
		ctx.fillStyle = curHex;
		ctx.fill();
		ctx.lineWidth = 2.5;
		ctx.strokeStyle = ui.theme === 'dark' ? '#fff' : '#000';
		ctx.stroke();
	}

	$effect(() => {
		void geo;
		void vals;
		void yaw;
		void pitch;
		void curHex;
		void ui.theme;
		draw();
	});

	function onDown(e: PointerEvent) {
		dragging = true;
		lastX = e.clientX;
		lastY = e.clientY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onMove(e: PointerEvent) {
		if (!dragging) return;
		yaw += (e.clientX - lastX) * 0.01;
		pitch += (e.clientY - lastY) * 0.01; // free orbit, no clamp
		lastX = e.clientX;
		lastY = e.clientY;
	}
	function onUp() {
		dragging = false;
	}
	function reset() {
		yaw = -0.7;
		pitch = 0.5;
	}
</script>

<div class="mv" class:compact>
	{#if !compact}
		<div class="mv-controls">
			<div class="mv-row">
				{#if !pinned}
					<label class="mv-select">
						<span>Model</span>
						<select class="select" bind:value={modelName}>
							{#each grouped as g (g.label)}
								<optgroup label={g.label}>
									{#each g.models as m (m.name)}
										<option value={m.name}>{m.label}</option>
									{/each}
								</optgroup>
							{/each}
						</select>
					</label>
				{/if}
				<label class="mv-select mv-density">
					<span>Resolution</span>
					<select class="select" bind:value={density}>
						{#each DENSITY as d (d.n)}
							<option value={d.n}>{d.label}</option>
						{/each}
					</select>
				</label>
			</div>

			{#if about}
				<p class="mv-about">{about}</p>
			{/if}

			<div class="mv-sliders">
				{#each info.channels as ch, i (ch.name)}
					<div class="mv-slider">
						<div class="mv-slabel">
							<code>.{ch.name}</code>
							<span class="mv-val">{+vals[i]?.toFixed(ch.range[1] - ch.range[0] <= 2 ? 3 : 1)}</span
							>
						</div>
						<input
							type="range"
							min={ch.range[0]}
							max={ch.range[1]}
							step={(ch.range[1] - ch.range[0]) / 240}
							bind:value={vals[i]}
						/>
					</div>
				{/each}
			</div>

			<div class="mv-result">
				<span class="mv-swatch" style="background:{curHex}"></span>
				<code>{curHex}</code>
				{#if !inGamut}<span class="mv-oog">out of sRGB</span>{/if}
			</div>
		</div>
	{/if}

	<div class="mv-canvas-wrap">
		<canvas
			bind:this={canvas}
			onpointerdown={onDown}
			onpointermove={onMove}
			onpointerup={onUp}
			onpointercancel={onUp}
			ondblclick={reset}
		></canvas>
		<span class="mv-hint"
			>{isCyl ? 'cylindrical' : 'cartesian'} layout · drag to rotate · double-click resets</span
		>
	</div>
</div>

<style>
	.mv {
		display: grid;
		grid-template-columns: minmax(220px, 300px) 1fr;
		gap: 14px;
		height: 100%;
		min-height: 0;
		padding: 12px;
	}
	.mv.compact {
		grid-template-columns: 1fr;
		padding: 0;
	}
	.mv-controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
		overflow-y: auto;
	}
	.mv-row {
		display: flex;
		gap: 8px;
	}
	.mv-row .mv-select {
		flex: 1;
		min-width: 0;
	}
	.mv-density {
		flex: 0 0 auto;
		min-width: 120px;
	}
	.mv-select {
		display: grid;
		gap: 4px;
	}
	.mv-select .select {
		width: 100%;
	}
	.mv-select span {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
	}
	.mv-about {
		margin: 0;
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--text-muted);
	}
	.mv-sliders {
		display: grid;
		gap: 12px;
	}
	.mv-slider {
		display: grid;
		gap: 3px;
	}
	.mv-slabel {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 11px;
	}
	.mv-slabel code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--syn-prop);
		font-weight: 600;
	}
	.mv-val {
		margin-left: auto;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--text);
		font-weight: 600;
	}
	.mv-slider input[type='range'] {
		width: 100%;
		accent-color: var(--accent);
	}
	.mv-result {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-top: 4px;
	}
	.mv-swatch {
		width: 26px;
		height: 26px;
		border-radius: var(--radius-xs);
		border: 1px solid var(--border);
	}
	.mv-result code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 13px;
		font-weight: 600;
	}
	.mv-oog {
		font-size: 9.5px;
		color: var(--warn);
		border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent);
		border-radius: 99px;
		padding: 0 6px;
	}
	.mv-canvas-wrap {
		position: relative;
		min-height: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface-2);
		overflow: hidden;
	}
	.mv-canvas-wrap canvas {
		width: 100%;
		height: 100%;
		display: block;
		touch-action: none;
		cursor: grab;
	}
	.mv-canvas-wrap canvas:active {
		cursor: grabbing;
	}
	.mv-hint {
		position: absolute;
		left: 10px;
		bottom: 8px;
		font-size: 10px;
		color: var(--text-faint);
		pointer-events: none;
	}
	@media (max-width: 720px) {
		.mv {
			grid-template-columns: 1fr;
		}
		.mv-canvas-wrap {
			min-height: 280px;
		}
	}
	@media (max-width: 480px) {
		.mv-row {
			flex-direction: column;
			align-items: stretch;
		}
		.mv-density {
			min-width: 0;
			width: 100%;
		}
	}
</style>
