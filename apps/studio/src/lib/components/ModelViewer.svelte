<script lang="ts">
	import { allModels, getModel, ColorValue, hex, type ModelDef } from '$lib/models';
	import { MODEL_DOCS } from '$lib/dsl/model-docs';
	import { ui } from '$lib/state/ui.svelte';

	let {
		seed = '#3aa0ff',
		pinnedId,
		compact = false
	}: { seed?: string; pinnedId?: string; compact?: boolean } = $props();

	const FAMILY_LABEL: Record<string, string> = {
		'perceptual-cylindrical': 'Perceptual cylindrical',
		lab: 'Lab family',
		hue: 'Hue family',
		rgb: 'RGB family',
		tristimulus: 'Tristimulus',
		video: 'Video / broadcast',
		subtractive: 'Subtractive'
	};
	const FAMILY_ORDER = [
		'perceptual-cylindrical',
		'lab',
		'hue',
		'rgb',
		'tristimulus',
		'video',
		'subtractive'
	];
	const pickable = allModels().filter(
		(m) =>
			m.backed && m.ctor && m.channels.length === 3 && m.family !== 'system' && m.family !== 'other'
	);
	const grouped = FAMILY_ORDER.map((f) => ({
		label: FAMILY_LABEL[f] ?? f,
		models: pickable.filter((m) => m.family === f).sort((a, b) => a.label.localeCompare(b.label))
	})).filter((g) => g.models.length);

	const DENSITY = [
		{ label: 'Coarse', n: 10 },
		{ label: 'Normal', n: 16 },
		{ label: 'Dense', n: 22 },
		{ label: 'Fine', n: 30 },
		{ label: 'Max', n: 40 }
	];

	// Seed from the pinned id when embedded; the $effect below keeps it in sync.
	// svelte-ignore state_referenced_locally
	let modelId = $state(pinnedId && getModel(pinnedId) ? pinnedId : 'oklch');
	let density = $state(22);
	let vals = $state<number[]>([0.7, 0.15, 250]);
	let yaw = $state(-0.7);
	let pitch = $state(0.5);
	let canvas: HTMLCanvasElement | undefined = $state();
	let dragging = false;
	let lastX = 0;
	let lastY = 0;

	const def = $derived(getModel(modelId) as ModelDef);

	// When embedded pinned to one model (encyclopedia), follow the parent's id.
	$effect(() => {
		if (pinnedId && pinnedId !== modelId && getModel(pinnedId)) modelId = pinnedId;
	});

	type Vec3 = { x: number; y: number; z: number };

	type CylInfo =
		| { hueIdx: number; kind: 'lc'; lightIdx: number; chromaIdx: number }
		| { hueIdx: number; kind: 'wb'; wIdx: number; bIdx: number };

	/** How to arrange a hue-based model as a cylinder/cone, or null if cartesian. */
	function cylInfo(d: ModelDef): CylInfo | null {
		const ch = d.channels;
		const hueIdx = ch.findIndex((c) => Math.abs(c.range[1] - 360) < 1 || c.localKey === 'h');
		if (hueIdx < 0) return null;
		// hue + chroma + lightness (OKLCH, HSL, LCh, HCT, CAM16, …)
		const lightIdx = ch.findIndex(
			(c, i) =>
				i !== hueIdx &&
				(/light|lumin|value|tone|bright|intens/i.test(c.label) || /^(l|j|v|t)$/i.test(c.localKey))
		);
		if (lightIdx >= 0) {
			const chromaIdx = [0, 1, 2].find((i) => i !== hueIdx && i !== lightIdx)!;
			return { hueIdx, kind: 'lc', lightIdx, chromaIdx };
		}
		// hue + whiteness + blackness (HWB) → a bicone
		const wIdx = ch.findIndex(
			(c, i) => i !== hueIdx && (c.localKey === 'w' || /white/i.test(c.label))
		);
		const bIdx = ch.findIndex(
			(c, i) => i !== hueIdx && (c.localKey === 'b' || /black/i.test(c.label))
		);
		if (wIdx >= 0 && bIdx >= 0 && wIdx !== bIdx) return { hueIdx, kind: 'wb', wIdx, bIdx };
		return null;
	}
	const isCyl = $derived(cylInfo(def) !== null);
	/** For cartesian models: which channel goes on the vertical axis, plus x/z. */
	function boxAxes(d: ModelDef): [number, number, number] {
		const li = d.channels.findIndex(
			(c) =>
				/light|lumin|value|tone|bright|intens/i.test(c.label) || /^(l|j|i|t|v)$/i.test(c.localKey)
		);
		const yi = li < 0 ? 1 : li;
		const rest = [0, 1, 2].filter((i) => i !== yi);
		return [rest[0], yi, rest[1]];
	}

	// Re-seed the sliders whenever the model changes.
	let lastModel = '';
	$effect(() => {
		if (modelId === lastModel) return;
		lastModel = modelId;
		try {
			const c = hex(seed);
			vals = def.channels.map((ch) => c.channel(ch.key));
		} catch {
			vals = def.channels.map((ch) => (ch.range[0] + ch.range[1]) / 2);
		}
	});

	const current = $derived.by(() => {
		try {
			return ColorValue.from(def.ctor!.build(vals));
		} catch {
			return null;
		}
	});
	const curHex = $derived(current?.hex ?? '#000000');
	const inGamut = $derived(current?.inGamut ?? false);

	interface Prim {
		v: Vec3[];
		n: Vec3;
		rgb: [number, number, number];
	}

	/** Map any color into this model's 3-D layout (polar for cylindrical, box else). */
	function layoutFor(d: ModelDef): (cv: ColorValue) => Vec3 {
		const ch = d.channels;
		const info = cylInfo(d);
		if (info) {
			const [hLo, hHi] = ch[info.hueIdx].range;
			const angle = (cv: ColorValue) =>
				((cv.channel(ch[info.hueIdx].key) - hLo) / (hHi - hLo)) * 2 * Math.PI;
			if (info.kind === 'lc') {
				const [lLo, lHi] = ch[info.lightIdx].range;
				const [cLo, cHi] = ch[info.chromaIdx].range;
				return (cv) => {
					const L = cv.channel(ch[info.lightIdx].key);
					const C = cv.channel(ch[info.chromaIdx].key);
					const rad = Math.max(0, (C - cLo) / (cHi - cLo)) * 0.5;
					const th = angle(cv);
					return { x: rad * Math.cos(th), y: (L - lLo) / (lHi - lLo) - 0.5, z: rad * Math.sin(th) };
				};
			}
			// whiteness/blackness bicone: pure hue at the equator, white top, black bottom
			const [wLo, wHi] = ch[info.wIdx].range;
			const [bLo, bHi] = ch[info.bIdx].range;
			return (cv) => {
				const W = (cv.channel(ch[info.wIdx].key) - wLo) / (wHi - wLo);
				const B = (cv.channel(ch[info.bIdx].key) - bLo) / (bHi - bLo);
				const rad = Math.max(0, 1 - W - B) * 0.5;
				const th = angle(cv);
				return { x: rad * Math.cos(th), y: (W - B) / 2, z: rad * Math.sin(th) };
			};
		}
		const [xi, yi, zi] = boxAxes(d);
		const nrm = (ci: number, v: number) => {
			const [lo, hi] = ch[ci].range;
			return hi === lo ? 0 : (v - lo) / (hi - lo) - 0.5;
		};
		return (cv) => ({
			x: nrm(xi, cv.channel(ch[xi].key)),
			y: nrm(yi, cv.channel(ch[yi].key)),
			z: nrm(zi, cv.channel(ch[zi].key))
		});
	}

	// ── geometry: the sRGB gamut as a solid, mapped into the model's space ──
	const geo = $derived.by(() => buildGamutSurface(def, density));

	function buildGamutSurface(d: ModelDef, dens: number): Prim[] {
		const G = Math.max(6, Math.round(dens * 0.9));
		const layout = layoutFor(d);
		const node = (r: number, g: number, b: number) => ({
			p: layout(ColorValue.from({ mode: 'rgb', r, g, b } as never)),
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
			const grid: { p: Vec3; rgb: [number, number, number] }[][] = [];
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
		const mp = layoutFor(def)(
			current ?? ColorValue.from({ mode: 'rgb', r: 0, g: 0, b: 0 } as never)
		);
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
				{#if !pinnedId}
					<label class="mv-select">
						<span>Model</span>
						<select class="select" bind:value={modelId}>
							{#each grouped as g (g.label)}
								<optgroup label={g.label}>
									{#each g.models as m (m.id)}
										<option value={m.id}>{m.label}</option>
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

			{#if MODEL_DOCS[modelId]?.about}
				<p class="mv-about">{MODEL_DOCS[modelId]?.about}</p>
			{/if}

			<div class="mv-sliders">
				{#each def.channels as ch, i (ch.key)}
					<div class="mv-slider">
						<div class="mv-slabel">
							<code>.{ch.localKey}</code>
							<span class="mv-chname">{ch.label}</span>
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
	.mv-chname {
		color: var(--text-muted);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.mv-val {
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
