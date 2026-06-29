<script lang="ts">
	/**
	 * A 2-D gamut slice for one color model: the plane sweeps two channels (the
	 * other channels held at their current value), filled with the actual colors,
	 * with the sRGB / P3 / Rec.2020 gamut boundaries drawn on top. The marker is
	 * the live color; click / drag to pick. Replaces the heavier 3-D viewer.
	 */
	import type { ModelDef } from '$lib/models';
	import { toMode, inGamut } from '$lib/models/registry';
	import { ui } from '$lib/state/ui.svelte';

	let {
		def,
		vals,
		markerColor = '#000',
		onpick
	}: {
		def: ModelDef;
		vals: number[];
		markerColor?: string;
		onpick: (xi: number, xVal: number, yi: number, yVal: number) => void;
	} = $props();

	const GW = 144;
	const GH = 112;
	const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

	interface Axes {
		xi: number;
		yi: number;
		invertY: boolean;
		fixed: number[];
	}
	/** Pick the two plane channels + which channels stay fixed. */
	function planeAxes(d: ModelDef): Axes {
		const ch = d.channels;
		const n = ch.length;
		const hueIdx = ch.findIndex((c) => Math.abs(c.range[1] - 360) < 1 || c.localKey === 'h');
		const lightIdx = ch.findIndex(
			(c) =>
				/light|lumin|value|tone|bright|intens/i.test(c.label) || /^(l|j|i|t|v)$/i.test(c.localKey)
		);
		if (hueIdx >= 0) {
			// cylindrical → lightness vertical, chroma horizontal, hue (+extra) fixed
			let yi =
				lightIdx >= 0 && lightIdx !== hueIdx ? lightIdx : ch.findIndex((_, i) => i !== hueIdx);
			let xi = ch.findIndex((_, i) => i !== hueIdx && i !== yi);
			if (xi < 0) xi = yi;
			const fixed = ch.map((_, i) => i).filter((i) => i !== xi && i !== yi);
			return { xi, yi, invertY: true, fixed };
		}
		if (lightIdx >= 0 && n >= 3) {
			// cartesian with a lightness axis → fix lightness, plane = the two others (Lab a×b)
			const rest = ch.map((_, i) => i).filter((i) => i !== lightIdx);
			return { xi: rest[0], yi: rest[1], invertY: false, fixed: [lightIdx, ...rest.slice(2)] };
		}
		const xi = 0;
		const yi = Math.min(1, n - 1);
		return {
			xi,
			yi,
			invertY: false,
			fixed: ch.map((_, i) => i).filter((i) => i !== xi && i !== yi)
		};
	}

	const axes = $derived(planeAxes(def));
	// Only the FIXED channel values feed the plane render, so picking (which moves
	// xi/yi) just moves the marker and never re-renders the whole slice.
	const fixedVals = $derived(axes.fixed.map((i) => vals[i] ?? 0));

	interface Grid {
		data: Uint8ClampedArray;
		sIn: Uint8Array;
		pIn: Uint8Array;
		rIn: Uint8Array;
		flags: { s: boolean; p: boolean; r: boolean };
	}
	const grid = $derived.by<Grid | null>(() => {
		const ctor = def.ctor;
		if (!ctor) return null;
		const ch = def.channels;
		const [xLo, xHi] = ch[axes.xi].range;
		const [yLo, yHi] = ch[axes.yi].range;
		const data = new Uint8ClampedArray(GW * GH * 4);
		const sIn = new Uint8Array(GW * GH);
		const pIn = new Uint8Array(GW * GH);
		const rIn = new Uint8Array(GW * GH);
		const base = ch.map(() => 0);
		axes.fixed.forEach((idx, k) => (base[idx] = fixedVals[k]));
		const toRgb = toMode('rgb');
		const inP3 = inGamut('p3');
		const inRec = inGamut('rec2020');
		let anyS = false,
			anyNotS = false,
			anyNotP = false,
			anyNotR = false;
		for (let gy = 0; gy < GH; gy++) {
			const ty = gy / (GH - 1);
			const yVal = axes.invertY ? yHi - ty * (yHi - yLo) : yLo + ty * (yHi - yLo);
			for (let gx = 0; gx < GW; gx++) {
				const xVal = xLo + (gx / (GW - 1)) * (xHi - xLo);
				const probe = base.slice();
				probe[axes.xi] = xVal;
				probe[axes.yi] = yVal;
				let r = 0,
					g = 0,
					b = 0,
					s = 0,
					p = 0,
					rr = 0;
				try {
					const built = ctor.build(probe);
					const rgb = toRgb(built) as unknown as { r?: number; g?: number; b?: number } | undefined;
					r = rgb?.r ?? 0;
					g = rgb?.g ?? 0;
					b = rgb?.b ?? 0;
					const e = 1e-4;
					s = r >= -e && r <= 1 + e && g >= -e && g <= 1 + e && b >= -e && b <= 1 + e ? 1 : 0;
					p = s ? 1 : inP3(built) ? 1 : 0;
					rr = p ? 1 : inRec(built) ? 1 : 0;
				} catch {
					/* leave black + out of gamut */
				}
				const i = gy * GW + gx;
				sIn[i] = s;
				pIn[i] = p;
				rIn[i] = rr;
				if (s) anyS = true;
				else anyNotS = true;
				if (!p) anyNotP = true;
				if (!rr) anyNotR = true;
				const o = i * 4;
				data[o] = Math.round(clamp01(r) * 255);
				data[o + 1] = Math.round(clamp01(g) * 255);
				data[o + 2] = Math.round(clamp01(b) * 255);
				data[o + 3] = 255;
			}
		}
		return {
			data,
			sIn,
			pIn,
			rIn,
			flags: { s: anyS && anyNotS, p: anyNotP, r: anyNotR }
		};
	});

	// ── canvas plumbing ──
	let host: HTMLDivElement | undefined = $state();
	let canvas: HTMLCanvasElement | undefined = $state();
	let W = $state(300);
	const H = $derived(Math.round(Math.min(240, Math.max(150, W * 0.66))));
	let dragging = false;
	let off: HTMLCanvasElement | null = null;
	// plain (non-reactive) cache keys so we only rebuild the expensive slice when
	// the grid / size actually change — picking just moves the marker.
	let builtGrid: Grid | null = null;
	let builtW = 0;
	let builtH = 0;

	function contour(
		ctx: CanvasRenderingContext2D,
		G: Uint8Array,
		Wd: number,
		Hd: number,
		color: string,
		lw: number
	) {
		const cw = Wd / GW;
		const cdh = Hd / GH;
		const path = new Path2D();
		for (let gy = 0; gy < GH; gy++) {
			for (let gx = 0; gx < GW; gx++) {
				const i = gy * GW + gx;
				const v = G[i];
				if (gx < GW - 1 && v !== G[i + 1]) {
					const x = (gx + 1) * cw;
					path.moveTo(x, gy * cdh);
					path.lineTo(x, (gy + 1) * cdh);
				}
				if (gy < GH - 1 && v !== G[i + GW]) {
					const y = (gy + 1) * cdh;
					path.moveTo(gx * cw, y);
					path.lineTo((gx + 1) * cw, y);
				}
			}
		}
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'rgba(0,0,0,0.45)';
		ctx.lineWidth = lw + 1.4;
		ctx.stroke(path);
		ctx.strokeStyle = color;
		ctx.lineWidth = lw;
		ctx.stroke(path);
	}

	function rebuildOffscreen() {
		const g = grid;
		if (!g || !host) return;
		const S = window.devicePixelRatio || 1;
		const Wd = Math.max(1, Math.round(W * S));
		const Hd = Math.max(1, Math.round(H * S));
		if (!off) off = document.createElement('canvas');
		off.width = Wd;
		off.height = Hd;
		const ctx = off.getContext('2d');
		if (!ctx) return;
		const tmp = document.createElement('canvas');
		tmp.width = GW;
		tmp.height = GH;
		const tctx = tmp.getContext('2d')!;
		const img = tctx.createImageData(GW, GH);
		img.data.set(g.data);
		tctx.putImageData(img, 0, 0);
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(tmp, 0, 0, Wd, Hd);
		if (g.flags.r) contour(ctx, g.rIn, Wd, Hd, 'rgba(255,255,255,0.42)', 1.0 * S);
		if (g.flags.p) contour(ctx, g.pIn, Wd, Hd, 'rgba(255,255,255,0.7)', 1.2 * S);
		if (g.flags.s) contour(ctx, g.sIn, Wd, Hd, 'rgba(255,255,255,0.96)', 1.6 * S);
	}

	const markerX = $derived.by(() => {
		const [lo, hi] = def.channels[axes.xi]?.range ?? [0, 1];
		return hi === lo ? 0 : ((vals[axes.xi] - lo) / (hi - lo)) * W;
	});
	const markerY = $derived.by(() => {
		const [lo, hi] = def.channels[axes.yi]?.range ?? [0, 1];
		const t = hi === lo ? 0 : (vals[axes.yi] - lo) / (hi - lo);
		return (axes.invertY ? 1 - t : t) * H;
	});

	function drawVisible() {
		if (!canvas || !off) return;
		const S = window.devicePixelRatio || 1;
		const Wd = Math.round(W * S);
		const Hd = Math.round(H * S);
		canvas.width = Wd;
		canvas.height = Hd;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, Wd, Hd);
		ctx.drawImage(off, 0, 0, Wd, Hd);
		const mx = markerX * S;
		const my = markerY * S;
		ctx.beginPath();
		ctx.arc(mx, my, 6 * S, 0, 6.2832);
		ctx.fillStyle = markerColor;
		ctx.fill();
		ctx.lineWidth = 1 * S;
		ctx.strokeStyle = 'rgba(0,0,0,0.7)';
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(mx, my, 7.5 * S, 0, 6.2832);
		ctx.lineWidth = 2 * S;
		ctx.strokeStyle = '#fff';
		ctx.stroke();
	}

	// One effect: rebuild the slice (expensive) only when grid/size changed, then
	// always repaint the marker (cheap). No reactive writes here → no update loop.
	$effect(() => {
		const g = grid;
		void markerX;
		void markerY;
		void markerColor;
		void ui.theme;
		if (!g || !host) return;
		if (g !== builtGrid || W !== builtW || H !== builtH) {
			rebuildOffscreen();
			builtGrid = g;
			builtW = W;
			builtH = H;
		}
		drawVisible();
	});

	function pickFrom(e: PointerEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const px = Math.min(W, Math.max(0, e.clientX - rect.left));
		const py = Math.min(H, Math.max(0, e.clientY - rect.top));
		const [xLo, xHi] = def.channels[axes.xi].range;
		const [yLo, yHi] = def.channels[axes.yi].range;
		const xVal = xLo + (px / W) * (xHi - xLo);
		const ty = py / H;
		const yVal = axes.invertY ? yHi - ty * (yHi - yLo) : yLo + ty * (yHi - yLo);
		onpick(axes.xi, xVal, axes.yi, yVal);
	}
	function onDown(e: PointerEvent) {
		dragging = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		pickFrom(e);
	}
	function onMove(e: PointerEvent) {
		if (dragging) pickFrom(e);
	}
	function onUp() {
		dragging = false;
	}

	const ch = $derived(def.channels);
	const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)));
	const caption = $derived(
		ch[axes.yi] && ch[axes.xi]
			? `${ch[axes.yi].label} × ${ch[axes.xi].label}` +
					(axes.fixed.length
						? ` · ${axes.fixed.map((i) => `${ch[i].label} ${fmt(vals[i])}`).join(', ')}`
						: '')
			: ''
	);
	const rings = $derived(
		[
			{ on: grid?.flags.s, label: 'sRGB', cls: 'srgb' },
			{ on: grid?.flags.p, label: 'P3', cls: 'p3' },
			{ on: grid?.flags.r, label: 'Rec.2020', cls: 'rec' }
		].filter((r) => r.on)
	);
</script>

<div class="gp">
	<div class="gp-axislabel gp-y">{ch[axes.yi]?.label ?? ''} ↑</div>
	<div class="gp-stage" bind:this={host} bind:clientWidth={W} style:height="{H}px">
		<canvas
			bind:this={canvas}
			style:width="{W}px"
			style:height="{H}px"
			onpointerdown={onDown}
			onpointermove={onMove}
			onpointerup={onUp}
			onpointercancel={onUp}
		></canvas>
		{#if rings.length}
			<div class="gp-legend">
				{#each rings as r (r.cls)}
					<span class="gp-ring {r.cls}"><i></i>{r.label}</span>
				{/each}
			</div>
		{/if}
	</div>
	<div class="gp-foot">
		<span class="gp-axislabel gp-x">{ch[axes.xi]?.label ?? ''} →</span>
		<span class="gp-cap">{caption}</span>
	</div>
</div>

<style>
	.gp {
		display: grid;
		grid-template-columns: 18px 1fr;
		gap: 4px;
		align-items: center;
	}
	.gp-stage {
		position: relative;
		grid-column: 2;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
		background: var(--surface-2);
	}
	.gp-stage canvas {
		display: block;
		touch-action: none;
		cursor: crosshair;
	}
	.gp-axislabel {
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-faint);
		white-space: nowrap;
	}
	.gp-y {
		grid-column: 1;
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		justify-self: center;
		align-self: center;
	}
	.gp-foot {
		grid-column: 2;
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-top: 3px;
	}
	.gp-cap {
		font-size: 10.5px;
		color: var(--text-faint);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.gp-legend {
		position: absolute;
		left: 7px;
		bottom: 6px;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 3px 7px;
		border-radius: 99px;
		background: rgba(0, 0, 0, 0.42);
		backdrop-filter: blur(2px);
		pointer-events: none;
	}
	.gp-ring {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 9.5px;
		font-weight: 600;
		color: #fff;
	}
	.gp-ring i {
		width: 12px;
		height: 0;
		border-top: 2px solid #fff;
		display: inline-block;
	}
	.gp-ring.p3 i {
		opacity: 0.7;
	}
	.gp-ring.rec i {
		opacity: 0.45;
	}
</style>
