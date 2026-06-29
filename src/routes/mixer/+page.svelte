<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { hex, ColorValue } from '$lib/models';
	import { ui } from '$lib/state/ui.svelte';
	import { welcome } from '$lib/state/welcome.svelte';
	import { orderedMixerModels, seedVals, buildFromVals, readableText } from '$lib/mixer/engine';
	import ModelCard from '$lib/components/mixer/ModelCard.svelte';

	const SEED = '#cf65c3';
	const models = orderedMixerModels();
	const byId = new Map(models.map((m) => [m.id, m]));
	const seed0 = hex(SEED);

	// ── canonical state ──
	// One color (stored as OKLCH inside ColorValue — there is no "base" model).
	let color = $state<ColorValue>(seed0);
	// Per-model slider positions, keyed by id. Authoritative + instant.
	let vals = $state<Record<string, number[]>>(
		Object.fromEntries(models.map((m) => [m.id, seedVals(seed0, m)]))
	);
	// rAF-coalesced snapshot driving the gradient tracks (kept off the per-drag path).
	let gradVals = $state<Record<string, number[]>>(
		Object.fromEntries(models.map((m) => [m.id, seedVals(seed0, m)]))
	);
	// The model being edited — never re-seeded from `color`, so its slider can't
	// jump under the finger (the rule that makes cross-model editing stable). Stays
	// "locked" after release until another model is touched or the color is set
	// externally, so the values you dialed in are exactly what you keep.
	let active = $state<string | null>(null);
	let dragging = $state(false);

	// Re-seed every model EXCEPT the active one whenever the color changes.
	// Reads: color, active. Writes: vals[others] via per-key set (never reads vals),
	// so this effect does not depend on its own writes → no loop.
	$effect(() => {
		const c = color;
		const skip = active;
		for (const m of models) {
			if (m.id === skip) continue;
			vals[m.id] = seedVals(c, m);
		}
	});

	// ── gradient coalescing ──
	let rafId = 0;
	function scheduleGrads(all: boolean) {
		if (typeof requestAnimationFrame === 'undefined') return;
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			if (all) {
				gradVals = Object.fromEntries(models.map((m) => [m.id, vals[m.id]]));
			} else if (active) {
				gradVals = { ...gradVals, [active]: vals[active] };
			}
		});
	}

	// ── interaction ──
	function onChannelInput(id: string, index: number, value: number) {
		dragging = true;
		active = id; // switching models here re-seeds the previously-active one
		const cur = (vals[id] ?? []).slice();
		cur[index] = value;
		// Commit the slider value only if it forms a real color, so vals[id] never
		// holds an orphaned (un-buildable) set that the reseed effect would clobber.
		const c = buildFromVals(byId.get(id)!, cur);
		if (c) {
			vals[id] = cur;
			color = c;
		}
		scheduleGrads(false); // only the active card's tracks rebuild mid-drag
	}
	// End of an edit gesture (pointer up, blur, key up). Refresh every card's
	// tracks once; `active` stays locked so the edited model keeps its exact values.
	function endDrag() {
		if (!dragging) return;
		dragging = false;
		scheduleGrads(true);
	}
	/** Set the color from outside the grid (hex field, random, reset): clears the
	 *  active lock so EVERY model — including the last one dragged — re-seeds. */
	function setColor(c: ColorValue) {
		dragging = false;
		active = null;
		color = c;
		scheduleGrads(true);
	}

	onMount(() => {
		// A pointerup anywhere ends a drag even if the cursor left the slider.
		const up = () => endDrag();
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', up);
		// Escape releases the lock (keyboard escape hatch) and re-syncs every model.
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && active !== null) {
				dragging = false;
				active = null;
				scheduleGrads(true);
			}
		};
		window.addEventListener('keydown', onKey);
		// Land on a color from the URL hash (#aabbcc) if present.
		const fromHash = location.hash.replace(/^#/, '');
		if (fromHash) {
			try {
				setColor(hex(fromHash.startsWith('#') ? fromHash : `#${fromHash}`));
			} catch {
				/* ignore a bad hash */
			}
		}
		return () => {
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointercancel', up);
			window.removeEventListener('keydown', onKey);
		};
	});

	// ── header: hex field ──
	let hexInput = $state(SEED);
	let hexFocused = $state(false);
	let hexErr = $state(false);
	// Keep the field mirroring the live color, except while it's being edited.
	$effect(() => {
		if (!hexFocused) hexInput = color.hex;
	});
	function applyHex() {
		const raw = hexInput.trim();
		if (!raw) {
			hexErr = false;
			return;
		}
		try {
			const c = hex(raw);
			hexErr = false;
			setColor(c);
		} catch {
			hexErr = raw.length >= 4; // don't flash red on partial typing
		}
	}

	function randomColor() {
		const b = () => Math.floor(Math.random() * 256);
		const h2 = (n: number) => n.toString(16).padStart(2, '0');
		setColor(hex(`#${h2(b())}${h2(b())}${h2(b())}`));
	}

	let copied = $state(false);
	let copyTimer = 0;
	async function copyHex() {
		try {
			await navigator.clipboard.writeText(color.hex);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = window.setTimeout(() => (copied = false), 1100);
		} catch {
			/* clipboard blocked — no-op */
		}
	}

	// ── derived display ──
	const mapped = $derived(color.gamutMapped); // always displayable
	const bg = $derived(mapped.hex);
	const ink = $derived(readableText(mapped));
	const inGamut = $derived(color.inGamut);
	const rgb255 = $derived.by(() => {
		const c = mapped.project('rgb') as unknown as Record<'r' | 'g' | 'b', number>;
		return {
			r: Math.round((c.r ?? 0) * 255),
			g: Math.round((c.g ?? 0) * 255),
			b: Math.round((c.b ?? 0) * 255)
		};
	});

	// ── search ──
	let query = $state('');
	const q = $derived(query.trim().toLowerCase());
	const shown = $derived(
		models.filter((m) => !q || m.label.toLowerCase().includes(q) || m.id.includes(q))
	);

	// ── group by family (taxonomy shared with the /models encyclopedia) ──
	const FAMILY_LABEL: Record<string, string> = {
		'perceptual-cylindrical': 'Perceptual · cylindrical',
		lab: 'Perceptual · opponent (ΔE)',
		hue: 'Hue · RGB-cylindrical',
		rgb: 'RGB · working & display',
		tristimulus: 'Tristimulus & chromaticity',
		video: 'Video / broadcast',
		subtractive: 'Subtractive / print',
		other: 'Concepts & niche',
		system: 'Color systems'
	};
	const FAMILY_ORDER = [
		'perceptual-cylindrical',
		'lab',
		'hue',
		'rgb',
		'tristimulus',
		'video',
		'subtractive',
		'other',
		'system'
	];
	// Families that actually have cards, in display order (stable — drives the toggle bar).
	const families = FAMILY_ORDER.filter((f) => models.some((m) => m.family === f)).map((f) => ({
		key: f,
		label: FAMILY_LABEL[f] ?? f,
		total: models.filter((m) => m.family === f).length
	}));
	// Families toggled off (hidden). Default: all visible.
	let famOff = $state<Record<string, boolean>>({});
	function toggleFamily(f: string) {
		famOff[f] = !famOff[f];
	}
	function showAllFamilies() {
		famOff = {};
	}
	const anyOff = $derived(families.some((f) => famOff[f.key]));

	// Visible groups: family in order, search-filtered, not toggled off, non-empty.
	const groups = $derived(
		families
			.filter((f) => !famOff[f.key])
			.map((f) => ({ ...f, items: shown.filter((m) => m.family === f.key) }))
			.filter((g) => g.items.length)
	);
	const shownCount = $derived(groups.reduce((n, g) => n + g.items.length, 0));
</script>

<svelte:head><title>Mixer · Chromatics</title></svelte:head>

<div class="mixer" style:background={bg}>
	<header class="top">
		<a class="back" href="{base}/" title="Back to Chromatics">
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
			>
			<span>Chromatics</span>
		</a>

		<div class="title">
			<h1>Mixer</h1>
			<span class="chip"
				>{shownCount === models.length ? models.length : `${shownCount}/${models.length}`} models</span
			>
		</div>

		<div class="swatch-wrap">
			<button
				class="swatch"
				style:background={bg}
				onclick={copyHex}
				title="Copy hex"
				aria-label="Copy hex color {color.hex}"
			>
				<span class="swatch-copied" class:show={copied} style:color={ink}>copied</span>
			</button>
			<div class="readout">
				<input
					class="hexin mono"
					class:err={hexErr}
					bind:value={hexInput}
					oninput={applyHex}
					onfocus={() => (hexFocused = true)}
					onblur={() => {
						hexFocused = false;
						hexErr = false;
					}}
					spellcheck="false"
					autocomplete="off"
					autocapitalize="off"
					aria-label="Hex or CSS color"
					placeholder="#hex"
				/>
				<div class="rgb mono">
					rgb {rgb255.r}
					{rgb255.g}
					{rgb255.b}
					<span class="oog" class:hide={inGamut}>· out of sRGB</span>
				</div>
			</div>
		</div>

		<div class="spacer"></div>

		<div class="search-wrap">
			<svg
				class="search-ic"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg
			>
			<input
				class="search"
				placeholder="Filter models…"
				bind:value={query}
				aria-label="Filter models"
			/>
			{#if q}<span class="search-count">{shown.length}</span>{/if}
		</div>

		<button class="tbtn" onclick={randomColor} title="Random color">Random</button>
		<button class="tbtn" onclick={() => setColor(hex(SEED))} title="Reset">Reset</button>
		<a class="tbtn" href="{base}/models" title="Color models & systems encyclopedia">Models</a>
		<button
			class="icon-btn"
			onclick={() => (welcome.open = true)}
			aria-label="What is Chromatics?"
			title="What is Chromatics?"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><path
					d="M12 17h.01"
				/></svg
			>
		</button>
		<button
			class="icon-btn"
			onclick={() => ui.toggleTheme()}
			aria-label="Toggle theme"
			title="Toggle theme"
		>
			{#if ui.theme === 'dark'}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					><circle cx="12" cy="12" r="4" /><path
						d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
					/></svg
				>
			{:else}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg
				>
			{/if}
		</button>
	</header>

	<nav class="fambar" aria-label="Toggle model families">
		{#each families as f (f.key)}
			<button
				class="famchip"
				class:off={famOff[f.key]}
				onclick={() => toggleFamily(f.key)}
				aria-pressed={!famOff[f.key]}
				title={famOff[f.key] ? `Show ${f.label}` : `Hide ${f.label}`}
			>
				<span class="famchip-dot {f.key}"></span>
				{f.label}
				<span class="famchip-n">{f.total}</span>
			</button>
		{/each}
		{#if anyOff}
			<button class="famchip all" onclick={showAllFamilies} title="Show all families">All</button>
		{/if}
	</nav>

	<main class="grid-wrap scroll">
		{#if groups.length === 0}
			<div class="empty" style:color={ink}>
				{#if q}No models match “{query}”.{:else}All families are hidden — turn one back on above.{/if}
			</div>
		{:else}
			{#each groups as g (g.key)}
				<section class="fam">
					<div class="fam-head">
						<span class="fam-dot {g.key}"></span>
						<h2 class="fam-label">{g.label}</h2>
						<span class="fam-count">{g.items.length}</span>
					</div>
					<div class="masonry">
						{#each g.items as m (m.id)}
							<ModelCard
								def={m}
								values={vals[m.id]}
								gradValues={gradVals[m.id]}
								editing={dragging && active === m.id}
								oninput={(i, v) => onChannelInput(m.id, i, v)}
								onrelease={endDrag}
							/>
						{/each}
					</div>
				</section>
			{/each}
		{/if}
	</main>
</div>

<style>
	.mixer {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		transition: background 90ms linear;
	}

	/* ── top bar (frosted, reads against any background color) ── */
	.top {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px clamp(14px, 3.5vw, 60px);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: var(--text-muted);
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: var(--radius-xs);
		flex-shrink: 0;
	}
	.back:hover {
		background: var(--surface-2);
		color: var(--text);
	}
	.title {
		display: flex;
		align-items: baseline;
		gap: 8px;
		flex-shrink: 0;
	}
	.title h1 {
		font-size: 15px;
		font-weight: 750;
		margin: 0;
		color: var(--text);
	}
	.chip {
		font-size: 10.5px;
		color: var(--text-faint);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 1px 8px;
	}

	.swatch-wrap {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-left: 6px;
	}
	.swatch {
		position: relative;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-xs);
		border: 1px solid color-mix(in srgb, var(--border-strong) 80%, transparent);
		box-shadow: var(--shadow-sm);
		flex-shrink: 0;
		cursor: pointer;
		padding: 0;
		overflow: hidden;
	}
	.swatch-copied {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 8.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0;
		transition: opacity 120ms;
		background: color-mix(in srgb, currentColor 0%, transparent);
	}
	.swatch-copied.show {
		opacity: 1;
	}
	.readout {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.hexin {
		font-size: 14px;
		font-weight: 700;
		color: var(--text);
		width: 110px;
		padding: 2px 6px;
		border: 1px solid transparent;
		border-radius: var(--radius-xs);
		background: var(--surface-2);
		outline: none;
		text-transform: uppercase;
	}
	.hexin:focus {
		border-color: var(--accent);
		background: var(--surface);
	}
	.hexin.err {
		border-color: var(--danger);
	}
	.rgb {
		font-size: 10px;
		color: var(--text-faint);
		white-space: nowrap;
	}
	.oog {
		color: var(--warn);
	}
	.oog.hide {
		visibility: hidden;
	}

	.spacer {
		flex: 1;
	}

	.search-wrap {
		position: relative;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}
	.search-ic {
		position: absolute;
		left: 9px;
		color: var(--text-faint);
		pointer-events: none;
	}
	.search {
		width: 168px;
		padding: 6px 9px 6px 28px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		color: var(--text);
		font-size: 12.5px;
		outline: none;
	}
	.search:focus {
		border-color: var(--accent);
		background: var(--surface);
	}
	.search-count {
		position: absolute;
		right: 9px;
		font-size: 10.5px;
		color: var(--text-faint);
	}

	.tbtn {
		display: inline-flex;
		align-items: center;
		height: 30px;
		padding: 0 11px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		color: var(--text);
		font-size: 12.5px;
		font-weight: 550;
		cursor: pointer;
		text-decoration: none;
		flex-shrink: 0;
	}
	.tbtn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.icon-btn {
		display: inline-grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		color: var(--text);
		cursor: pointer;
		flex-shrink: 0;
	}
	.icon-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* ── masonry grid ── */
	.grid-wrap {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		/* Responsive side gutters: roomy on large displays, tight on phones. */
		padding: 26px clamp(16px, 3.5vw, 60px) 36px;
	}
	/* CSS columns => the wider the viewport, the more columns appear. The smaller
	   column-width keeps cards compact so big screens fill out with many columns.
	   NB: class is `.masonry`, NOT `.grid` — Tailwind ships a `.grid` utility
	   (display:grid) that would shadow column-width and collapse this to one column. */
	.masonry {
		display: block;
		column-width: 360px;
		column-gap: 20px;
	}
	@media (min-width: 2200px) {
		.masonry {
			column-width: 340px;
		}
	}
	.empty {
		text-align: center;
		padding: 60px 20px;
		font-size: 14px;
		font-weight: 600;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
	}

	/* ── family toggle bar ── */
	.fambar {
		flex-shrink: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		padding: 10px clamp(16px, 3.5vw, 60px);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
		background: color-mix(in srgb, var(--surface) 72%, transparent);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
	}
	.famchip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border: 1px solid var(--border);
		border-radius: 99px;
		background: var(--surface-2);
		color: var(--text);
		font-size: 12px;
		font-weight: 550;
		cursor: pointer;
		white-space: nowrap;
	}
	.famchip:hover {
		border-color: var(--accent);
	}
	.famchip.off {
		opacity: 0.45;
		background: transparent;
	}
	.famchip.off .famchip-dot {
		filter: grayscale(1);
	}
	.famchip-n {
		font-size: 10px;
		color: var(--text-faint);
		font-variant-numeric: tabular-nums;
	}
	.famchip.all {
		font-weight: 650;
		color: var(--accent);
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
	}
	.famchip-dot,
	.fam-dot {
		width: 8px;
		height: 8px;
		border-radius: 99px;
		flex-shrink: 0;
		background: var(--text-faint);
	}

	/* per-family accent colors (shared by the toggle dots and section headers) */
	.famchip-dot.perceptual-cylindrical,
	.fam-dot.perceptual-cylindrical {
		background: #7c7cf2;
	}
	.famchip-dot.lab,
	.fam-dot.lab {
		background: #e6748c;
	}
	.famchip-dot.hue,
	.fam-dot.hue {
		background: #f0a35e;
	}
	.famchip-dot.rgb,
	.fam-dot.rgb {
		background: #5aa9e6;
	}
	.famchip-dot.tristimulus,
	.fam-dot.tristimulus {
		background: #4ec9b0;
	}
	.famchip-dot.video,
	.fam-dot.video {
		background: #b48ce0;
	}
	.famchip-dot.subtractive,
	.fam-dot.subtractive {
		background: #d9a324;
	}

	/* ── family section ── */
	.fam {
		margin-bottom: 22px;
	}
	.fam-head {
		display: flex;
		align-items: center;
		gap: 9px;
		margin-bottom: 12px;
		padding: 7px 12px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--surface) 80%, transparent);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
	}
	.fam-label {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin: 0;
	}
	.fam-count {
		font-size: 10.5px;
		color: var(--text-faint);
		background: var(--surface-2);
		border-radius: 99px;
		padding: 1px 8px;
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 720px) {
		.top {
			flex-wrap: wrap;
			gap: 8px;
		}
		.spacer {
			display: none;
		}
		.search-wrap,
		.search {
			width: 100%;
		}
		.masonry {
			column-width: 300px;
			column-gap: 14px;
		}
	}
</style>
