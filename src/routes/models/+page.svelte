<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { allModels, getModel, ColorValue, hex, type ModelDef } from '$lib/models';
	import { seedVals, channelGradient, fmtChannel } from '$lib/mixer/engine';
	import { MODEL_DOCS } from '$lib/dsl/model-docs';
	import { ENCYCLOPEDIA } from '$lib/dsl/encyclopedia';
	import { CHANNEL_DOCS } from '$lib/dsl/channel-docs';
	import { ui } from '$lib/state/ui.svelte';
	import { welcome } from '$lib/state/welcome.svelte';
	import GamutPlane from '$lib/components/GamutPlane.svelte';

	const SEED = '#3aa0ff';

	// ── family taxonomy (display order + labels + one-line blurb) ──
	interface FamilyMeta {
		label: string;
		blurb: string;
	}
	const FAMILY: Record<string, FamilyMeta> = {
		'perceptual-cylindrical': {
			label: 'Perceptual · cylindrical',
			blurb: 'Lightness–chroma–hue spaces where equal numeric steps look like equal visual steps.'
		},
		lab: {
			label: 'Perceptual · opponent (ΔE)',
			blurb: 'Rectangular opponent spaces built for measuring color difference.'
		},
		hue: {
			label: 'Hue · RGB-cylindrical',
			blurb: 'Intuitive transforms of RGB for pickers and tint / shade work.'
		},
		rgb: {
			label: 'RGB · working & display',
			blurb: 'Device and working RGB spaces, from sRGB to wide-gamut and ACES.'
		},
		tristimulus: {
			label: 'Tristimulus & chromaticity',
			blurb: 'The CIE foundations almost every conversion passes through.'
		},
		video: {
			label: 'Video / broadcast',
			blurb: 'Luma–chroma encodings behind television and image compression.'
		},
		subtractive: { label: 'Subtractive / print', blurb: 'Ink models for the printed page.' },
		other: { label: 'Concepts & niche', blurb: 'Conceptual and special-purpose representations.' },
		system: {
			label: 'Color systems',
			blurb: 'Named swatch libraries, standards and naming schemes.'
		}
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

	const STATUS_LABEL: Record<string, string> = {
		stable: 'Stable',
		experimental: 'Experimental',
		'coming-soon': 'Coming soon'
	};

	interface Entry {
		def: ModelDef;
		aka: string;
		summary: string;
	}
	const entries: Entry[] = allModels()
		.filter((m) => m.id !== 'root')
		.map((m) => ({
			def: m,
			aka: MODEL_DOCS[m.id]?.aka ?? '',
			summary: ENCYCLOPEDIA[m.id]?.summary ?? MODEL_DOCS[m.id]?.about ?? ''
		}));

	const counts = {
		total: entries.length,
		systems: entries.filter((e) => e.def.family === 'system').length
	};

	// ── selection + search state ──
	let selectedId = $state('oklch');
	let query = $state('');
	let mobileDetail = $state(false); // mobile: list vs detail view
	let showGamut = $state(false); // gamut map collapsed by default

	const def = $derived(getModel(selectedId) as ModelDef);
	const enc = $derived(ENCYCLOPEDIA[selectedId]);
	const doc = $derived(MODEL_DOCS[selectedId]);
	const aka = $derived(doc?.aka ?? '');

	const q = $derived(query.trim().toLowerCase());
	function matches(e: Entry) {
		if (!q) return true;
		return (
			e.def.label.toLowerCase().includes(q) ||
			e.def.id.includes(q) ||
			e.aka.toLowerCase().includes(q) ||
			e.summary.toLowerCase().includes(q)
		);
	}
	const groups = $derived(
		FAMILY_ORDER.map((f) => ({
			family: f,
			meta: FAMILY[f],
			items: entries.filter((e) => e.def.family === f && matches(e))
		})).filter((g) => g.items.length)
	);
	const resultCount = $derived(groups.reduce((n, g) => n + g.items.length, 0));

	// ── live channel playground ──
	// One "active color" (pin) persists across navigation, so clicking a related
	// model or a cross-model readout CONVERTS that color into the new model rather
	// than resetting it — and the color field lets you paste/type any hex or color.
	let pin = $state<ColorValue>(hex(SEED));
	let vals = $state<number[]>([]);
	let seededFor = '';

	// Read this color's channels in the selected model (range-midpoint fallback for
	// undefined/NaN fields, e.g. achromatic hue). Shared with the Mixer engine.
	function colorToVals(c: ColorValue): number[] {
		return seedVals(c, def);
	}

	// Seed the sliders from the active color whenever the model changes.
	$effect(() => {
		if (!def?.ctor) {
			vals = [];
			seededFor = selectedId;
			return;
		}
		if (selectedId === seededFor) return;
		seededFor = selectedId;
		vals = colorToVals(pin);
	});

	const current = $derived.by(() => {
		if (!def?.ctor || vals.length !== def.channels.length) return null;
		try {
			return ColorValue.from(def.ctor.build(vals.map(Number)));
		} catch {
			return null;
		}
	});
	const curHex = $derived(current?.hex ?? null);
	const inGamut = $derived(current?.inGamut ?? false);

	// Dragging a slider updates the active color so it carries to the next model.
	function commitPin() {
		if (current) pin = current;
	}

	// Color field — paste or type any hex / CSS color to set the playground.
	let colorInput = $state(SEED);
	let colorFocused = $state(false);
	let colorError = $state(false);
	// Keep the field showing the live color, except while it's being edited.
	$effect(() => {
		if (!colorFocused && curHex) colorInput = curHex;
	});
	function applyColor() {
		const raw = colorInput.trim();
		if (!raw) {
			colorError = false;
			return;
		}
		let c: ColorValue | null = null;
		try {
			c = hex(raw);
		} catch {
			c = null;
		}
		if (!c) {
			colorError = raw.length >= 4; // don't flash red on partial typing
			return;
		}
		colorError = false;
		pin = c;
		if (def?.ctor) vals = colorToVals(c);
	}

	// Per-channel gradient track: sample the color produced by sweeping ONLY this
	// channel across its range while the others hold their current value — so the
	// slider previews where moving it will push the color. Shared with the Mixer.
	const gradients = $derived.by(() => {
		if (!def?.ctor || vals.length !== def.channels.length) return [];
		return def.channels.map((_, i) => channelGradient(def, vals, i, 16));
	});

	const fv = fmtChannel;

	const dslCall = $derived.by(() => {
		if (!def?.ctor) return '';
		return `${def.ctor.name}(${vals.map((v) => fv(v)).join(', ')})`;
	});

	// "This color across other models" — projects the live color into each mode
	// directly (via culoriField) so flat-key collisions never mislabel a channel.
	const READOUT_IDS = ['srgb', 'oklch', 'hsl', 'lab', 'hsv', 'p3'];
	const readouts = $derived.by(() => {
		if (!current) return [];
		return READOUT_IDS.filter((id) => id !== selectedId)
			.slice(0, 5)
			.map((id) => {
				const d = getModel(id);
				if (!d) return null;
				let proj: Record<string, number | undefined> = {};
				try {
					proj = current.project(d.mode) as unknown as Record<string, number | undefined>;
				} catch {
					return null;
				}
				return {
					id,
					label: d.label,
					chans: d.channels.map((ch) => ({ key: ch.localKey, v: proj[ch.culoriField] }))
				};
			})
			.filter((x): x is NonNullable<typeof x> => x !== null);
	});

	// The 2-D gamut plane works for any constructable model with ≥2 channels.
	const canPlane = $derived(!!def?.ctor && def.channels.length >= 2 && def.family !== 'system');
	function pickPlane(xi: number, xVal: number, yi: number, yVal: number) {
		vals[xi] = xVal;
		vals[yi] = yVal;
		commitPin();
	}

	// ── relationships ──
	function relName(id: string) {
		return getModel(id)?.label ?? id;
	}
	function relExists(id: string) {
		return !!getModel(id);
	}
	const relationGroups = $derived(
		[
			{ key: 'derivedFrom', label: 'Derived from', ids: enc?.relations?.derivedFrom ?? [] },
			{ key: 'convertsTo', label: 'Converts to', ids: enc?.relations?.convertsTo ?? [] },
			{ key: 'related', label: 'Related', ids: enc?.relations?.related ?? [] }
		].filter((g) => g.ids.length)
	);
	// Models that point AT this one (incoming links) — the other half of the graph.
	const referencedBy = $derived.by(() => {
		const out: string[] = [];
		for (const e of entries) {
			const r = ENCYCLOPEDIA[e.def.id]?.relations;
			if (!r) continue;
			const all = [...(r.derivedFrom ?? []), ...(r.convertsTo ?? []), ...(r.related ?? [])];
			if (all.includes(selectedId) && e.def.id !== selectedId) out.push(e.def.id);
		}
		return out.slice(0, 12);
	});

	// ── DSL methods ──
	const methods = $derived(def ? [...def.methods.values()] : []);
	function sig(m: (typeof methods)[number]) {
		return m.kind === 'method'
			? `(${m.params.map((p) => p.name + (p.optional ? '?' : '')).join(', ')}) → ${m.returns}`
			: `→ ${m.returns}`;
	}

	const fmtNum = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)));

	// ── channels table rows (registry name/range ⊕ encyclopedia description) ──
	const channelRows = $derived(
		(def?.channels ?? []).map((ch, i) => ({
			key: ch.localKey,
			name: ch.label,
			about: CHANNEL_DOCS[def.id]?.[i] ?? '',
			min: fmtNum(ch.range[0]),
			max: fmtNum(ch.range[1])
		}))
	);

	// ── selection helpers + hash deep-linking ──
	function select(id: string, fromHash = false) {
		if (!getModel(id)) return;
		selectedId = id;
		mobileDetail = true;
		if (!fromHash && typeof history !== 'undefined') {
			history.replaceState(history.state, '', `#${id}`);
		}
		document.querySelector('.enc-detail')?.scrollTo({ top: 0 });
	}

	onMount(() => {
		const fromHash = decodeURIComponent(location.hash.replace(/^#/, ''));
		if (fromHash && getModel(fromHash)) {
			selectedId = fromHash;
			mobileDetail = true; // deep-link lands on the entry, not the index
		}
		const onHash = () => {
			const id = decodeURIComponent(location.hash.replace(/^#/, ''));
			if (id && getModel(id)) select(id, true);
		};
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	});

	function toggleTheme() {
		ui.theme = ui.theme === 'dark' ? 'light' : 'dark';
	}
</script>

<svelte:head><title>Color Models & Systems · Chromatics</title></svelte:head>

<div class="enc" class:mobile={ui.isMobile} class:detail={mobileDetail}>
	<!-- ── top bar ── -->
	<header class="enc-top">
		<a class="enc-back" href="{base}/" title="Back to Chromatics">
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
		<div class="enc-titlewrap">
			<h1 class="enc-title">Color Models &amp; Systems</h1>
			<span class="chip">{counts.total} entries</span>
		</div>
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
			class="icon-btn enc-theme"
			onclick={toggleTheme}
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

	<div class="enc-main">
		<!-- ── index sidebar ── -->
		<aside class="enc-index">
			<div class="enc-search-row">
				<input
					class="enc-search"
					placeholder="Search {counts.total} models & systems…"
					bind:value={query}
				/>
				{#if q}<span class="enc-search-count">{resultCount}</span>{/if}
			</div>
			<nav class="enc-list scroll">
				{#each groups as g (g.family)}
					<div class="enc-group">
						<div class="enc-group-head">{g.meta?.label ?? g.family}</div>
						{#each g.items as e (e.def.id)}
							<button
								class="enc-row"
								class:active={e.def.id === selectedId}
								onclick={() => select(e.def.id)}
							>
								<span class="enc-dot {e.def.status}" title={STATUS_LABEL[e.def.status]}></span>
								<span class="enc-row-label">{e.def.label}</span>
								<code class="enc-row-id">.{e.def.id}</code>
							</button>
						{/each}
					</div>
				{/each}
				{#if groups.length === 0}
					<div class="enc-empty">No matches for “{query}”.</div>
				{/if}
			</nav>
		</aside>

		<!-- ── detail pane ── -->
		<main class="enc-detail scroll">
			{#if ui.isMobile}
				<button class="enc-mobile-back" onclick={() => (mobileDetail = false)}>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
					>
					All models
				</button>
			{/if}

			<!-- hero -->
			<section class="hero">
				<div class="hero-swatch" style:background={curHex ?? 'var(--surface-3)'}>
					{#if !curHex}<span class="hero-swatch-q">?</span>{/if}
				</div>
				<div class="hero-meta">
					<div class="hero-titlerow">
						<h2 class="hero-title">{def.label}</h2>
						<code class="hero-id">.{def.id}</code>
						<span class="status-badge {def.status}">{STATUS_LABEL[def.status]}</span>
					</div>
					{#if aka}<div class="hero-aka">{aka}</div>{/if}
					{#if enc?.summary}<p class="hero-summary">{enc.summary}.</p>{/if}
					<div class="hero-tags">
						<span class="tag">{FAMILY[def.family]?.label ?? def.family}</span>
						{#if def.ctor}
							<code class="tag tag-code"
								>{def.ctor.name}({def.ctor.params.map((p) => p.name).join(', ')})</code
							>
						{/if}
						{#if def.channels.length}<span class="tag"
								>{def.channels.length} channel{def.channels.length === 1 ? '' : 's'}</span
							>{/if}
						{#if methods.length}<span class="tag"
								>{methods.length} method{methods.length === 1 ? '' : 's'}</span
							>{/if}
					</div>
				</div>
			</section>

			<!-- live playground -->
			<section class="card">
				<h3 class="card-title">Interactive</h3>
				{#if def.ctor && current}
					<div class="play">
						<div class="play-left">
							<div class="play-swatch-row">
								<span class="play-swatch" style:background={curHex}></span>
								<div class="play-swatch-info">
									<input
										class="play-hexin"
										class:err={colorError}
										bind:value={colorInput}
										oninput={applyColor}
										onfocus={() => (colorFocused = true)}
										onblur={() => {
											colorFocused = false;
											colorError = false;
										}}
										spellcheck="false"
										autocomplete="off"
										autocapitalize="off"
										aria-label="Paste a hex or CSS color"
										placeholder="#hex or color"
										title="Paste or type any hex / CSS color"
									/>
									<span class="oog-slot">
										<span class="oog" class:hide={inGamut}>out of sRGB</span>
									</span>
								</div>
							</div>
							<div class="play-sliders">
								{#each def.channels as ch, i (ch.key)}
									<div class="play-slider">
										<div class="play-slabel">
											<code>.{ch.localKey}</code>
											<span class="play-chname">{ch.label}</span>
											<span class="play-val">{fv(vals[i])}</span>
										</div>
										<input
											class="grad"
											type="range"
											min={ch.range[0]}
											max={ch.range[1]}
											step={(ch.range[1] - ch.range[0]) / 240}
											style:--grad={gradients[i] ?? 'var(--surface-3)'}
											bind:value={vals[i]}
											oninput={commitPin}
										/>
									</div>
								{/each}
							</div>
							<div class="play-dsl">
								<span class="play-dsl-label">DSL</span>
								<code>{dslCall}</code>
							</div>
						</div>

						<div class="play-right">
							<div class="readout-head">This color in other models</div>
							<div class="readout">
								{#each readouts as r (r.id)}
									<button
										class="readout-row"
										onclick={() => select(r.id)}
										title="Open {r.label} with this color"
									>
										<code class="readout-id">.{r.id}</code>
										<span class="readout-chans">
											{#each r.chans as c (c.key)}
												<span class="readout-chan"><i>{c.key}</i>{fv(c.v)}</span>
											{/each}
										</span>
									</button>
								{/each}
							</div>
							<p class="readout-note">
								The same color, read through each model's lens — <strong>click any row</strong> to
								open that model with this color carried over. In the DSL:
								<code>c.{readouts[0]?.id ?? 'hsl'}</code>.
							</p>
						</div>
					</div>

					{#if canPlane}
						<div class="gamut">
							<button
								class="gamut-toggle"
								onclick={() => (showGamut = !showGamut)}
								aria-expanded={showGamut}
							>
								<span class="caret" class:open={showGamut}>▸</span>
								{showGamut ? 'Hide gamut map' : 'Show gamut map · click the plane to pick'}
							</button>
							{#if showGamut}
								<div class="gamut-body">
									<GamutPlane {def} {vals} markerColor={curHex ?? '#888'} onpick={pickPlane} />
								</div>
							{/if}
						</div>
					{/if}
				{:else}
					<div class="play-stub">
						<p>
							<strong>{def.label}</strong> isn't directly constructable in the DSL{def.status ===
							'coming-soon'
								? ' yet'
								: ''}. {#if def.status === 'coming-soon'}Its lookups are advertised but throw an
								actionable error until a licensed dataset is wired in.{/if}
						</p>
						{#if relationGroups.length}
							<p class="play-stub-alt">
								Reach for a backed alternative:
								{#each relationGroups[relationGroups.length - 1].ids
									.filter(relExists)
									.slice(0, 4) as id, i (id)}
									{i > 0 ? ' · ' : ''}<button class="rel-chip inline" onclick={() => select(id)}
										>{relName(id)}</button
									>
								{/each}
							</p>
						{/if}
					</div>
				{/if}
			</section>

			<!-- what it is -->
			{#if enc?.whatItIs}
				<section class="card">
					<h3 class="card-title">What it is</h3>
					<p class="prose">{enc.whatItIs}</p>
				</section>
			{/if}

			<!-- channels table -->
			{#if channelRows.length}
				<section class="card">
					<h3 class="card-title">Channels</h3>
					<div class="chan-tbl">
						<div class="chan-tr chan-head">
							<span>Channel</span>
							<span>What it is</span>
							<span class="chan-num">Min</span>
							<span class="chan-num">Max</span>
						</div>
						{#each channelRows as r (r.key)}
							<div class="chan-tr">
								<span class="chan-c">
									<code class="chan-key">.{r.key}</code>
									<span class="chan-name">{r.name}</span>
								</span>
								<span class="chan-about">{r.about}</span>
								<code class="chan-num" data-l="min">{r.min}</code>
								<code class="chan-num" data-l="max">{r.max}</code>
							</div>
						{/each}
					</div>
					{#if doc?.channels}
						<p class="chan-foot">{doc.channels}</p>
					{/if}
				</section>
			{/if}

			<!-- two-up: used for / benefits here -->
			<div class="two-up">
				{#if enc?.usedFor?.length}
					<section class="card">
						<h3 class="card-title">What it's used for</h3>
						<ul class="bullets">
							{#each enc.usedFor as u (u)}<li>{u}</li>{/each}
						</ul>
					</section>
				{/if}
				{#if enc?.benefitsHere?.length}
					<section class="card accent">
						<h3 class="card-title">Why use it in Chromatics</h3>
						<ul class="bullets">
							{#each enc.benefitsHere as b (b)}<li>{b}</li>{/each}
						</ul>
					</section>
				{/if}
			</div>

			<!-- relationships -->
			<section class="card">
				<h3 class="card-title">How it connects</h3>
				{#each relationGroups as g (g.key)}
					<div class="rel-group">
						<span class="rel-label">{g.label}</span>
						<div class="rel-chips">
							{#each g.ids.filter(relExists) as id (id)}
								<button class="rel-chip" onclick={() => select(id)}>
									{relName(id)}<code>.{id}</code>
								</button>
							{/each}
						</div>
					</div>
				{/each}
				{#if referencedBy.length}
					<div class="rel-group">
						<span class="rel-label">Referenced by</span>
						<div class="rel-chips">
							{#each referencedBy as id (id)}
								<button class="rel-chip ghost" onclick={() => select(id)}>
									{relName(id)}<code>.{id}</code>
								</button>
							{/each}
						</div>
					</div>
				{/if}
				<p class="rel-note">
					<strong>Click any</strong> to convert into that model with your current color carried
					over. In Chromatics every value is model-agnostic, so <em>any</em> color reaches
					<em>any</em>
					of these directly as a view — <code>c.{selectedId}</code>, <code>c.oklch</code>,
					<code>c.lab</code> … The links above are the color-science lineage; the engine doesn't make
					you walk it.
				</p>
			</section>

			<!-- DSL methods -->
			{#if methods.length}
				<section class="card">
					<h3 class="card-title">DSL — methods &amp; accessors</h3>
					<div class="methods">
						{#each methods as m (m.name)}
							<div class="method">
								<code class="m-name {m.kind === 'method' ? 'is-method' : 'is-prop'}">.{m.name}</code
								>
								<code class="m-sig">{sig(m)}</code>
								<span class="m-doc">{m.doc}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- resources -->
			{#if enc?.resources?.length}
				<section class="card">
					<h3 class="card-title">Resources</h3>
					<ul class="resources">
						{#each enc.resources as r (r.url)}
							<li>
								<a href={r.url} target="_blank" rel="noopener noreferrer">
									{r.label}
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg
									>
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<div class="enc-foot">
				Stored in OKLCH · routed through culori · {counts.total} models &amp; systems registered
			</div>
		</main>
	</div>
</div>

<style>
	.enc {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: var(--bg);
		color: var(--text);
		overflow-x: hidden;
	}
	/* top bar */
	.enc-top {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 16px;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}
	.enc-back {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: var(--text-muted);
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: var(--radius-xs);
	}
	.enc-back:hover {
		background: var(--surface-2);
		color: var(--text);
	}
	.enc-titlewrap {
		display: flex;
		align-items: center;
		gap: 9px;
		min-width: 0;
		flex: 1;
	}
	.enc-title {
		font-size: 14.5px;
		font-weight: 700;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.enc-theme {
		margin-left: auto;
	}

	.enc-main {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
	}

	/* index */
	.enc-index {
		display: flex;
		flex-direction: column;
		min-height: 0;
		border-right: 1px solid var(--border);
		background: var(--surface);
	}
	.enc-search-row {
		position: relative;
		padding: 12px 12px 8px;
	}
	.enc-search {
		width: 100%;
		padding: 8px 11px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		color: var(--text);
		font-size: 13px;
		outline: none;
	}
	.enc-search:focus {
		border-color: var(--accent);
		background: var(--surface);
	}
	.enc-search-count {
		position: absolute;
		right: 20px;
		top: 20px;
		font-size: 11px;
		color: var(--text-faint);
	}
	.enc-list {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 4px 8px 24px;
	}
	.enc-group {
		margin-top: 10px;
	}
	.enc-group-head {
		font-size: 9.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-faint);
		padding: 4px 8px;
		position: sticky;
		top: 0;
		background: var(--surface);
		z-index: 1;
	}
	.enc-row {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px 8px;
		border: none;
		background: none;
		border-radius: var(--radius-xs);
		cursor: pointer;
		text-align: left;
		color: var(--text);
	}
	.enc-row:hover {
		background: var(--surface-2);
	}
	.enc-row.active {
		background: var(--accent-soft);
	}
	.enc-row.active .enc-row-label {
		color: var(--accent);
		font-weight: 650;
	}
	.enc-dot {
		width: 7px;
		height: 7px;
		border-radius: 99px;
		flex-shrink: 0;
		background: var(--text-faint);
	}
	.enc-dot.stable {
		background: #3fb27f;
	}
	.enc-dot.experimental {
		background: var(--warn);
	}
	.enc-dot.coming-soon {
		background: var(--text-faint);
		opacity: 0.55;
	}
	.enc-row-label {
		font-size: 13px;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.enc-row-id {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10.5px;
		color: var(--text-faint);
	}
	.enc-empty {
		padding: 30px 12px;
		text-align: center;
		color: var(--text-faint);
		font-size: 13px;
	}

	/* detail */
	.enc-detail {
		min-height: 0;
		overflow-y: auto;
		padding: 20px 22px 40px;
		max-width: 940px;
	}
	.enc-mobile-back {
		display: none;
		align-items: center;
		gap: 5px;
		background: none;
		border: none;
		color: var(--accent);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		padding: 0 0 12px;
	}

	/* hero */
	.hero {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		margin-bottom: 18px;
	}
	.hero-swatch {
		width: 84px;
		height: 84px;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		flex-shrink: 0;
		display: grid;
		place-items: center;
	}
	.hero-swatch-q {
		font-size: 30px;
		font-weight: 700;
		color: var(--text-faint);
	}
	.hero-meta {
		min-width: 0;
		flex: 1;
	}
	.hero-titlerow {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.hero-title {
		font-size: 24px;
		font-weight: 750;
		margin: 0;
		letter-spacing: -0.01em;
	}
	.hero-id {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 13px;
		color: var(--syn-view, var(--accent));
		background: var(--surface-2);
		padding: 2px 8px;
		border-radius: 99px;
	}
	.hero-aka {
		font-size: 12.5px;
		color: var(--text-faint);
		margin-top: 4px;
	}
	.hero-summary {
		font-size: 14.5px;
		line-height: 1.5;
		color: var(--text-muted);
		margin: 8px 0 10px;
	}
	.hero-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.tag {
		font-size: 11px;
		color: var(--text-muted);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 99px;
		padding: 2px 9px;
	}
	.tag-code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--syn-type, var(--accent));
	}
	.status-badge {
		font-size: 10px;
		font-weight: 600;
		border-radius: 99px;
		padding: 2px 9px;
	}
	.status-badge.stable {
		color: #3fb27f;
		border: 1px solid color-mix(in srgb, #3fb27f 40%, transparent);
		background: color-mix(in srgb, #3fb27f 10%, transparent);
	}
	.status-badge.experimental {
		color: var(--warn);
		border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent);
		background: color-mix(in srgb, var(--warn) 10%, transparent);
	}
	.status-badge.coming-soon {
		color: var(--text-faint);
		border: 1px solid var(--border);
	}

	/* cards */
	.card {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		padding: 14px 16px;
		margin-bottom: 12px;
	}
	.card.accent {
		border-color: color-mix(in srgb, var(--accent) 34%, var(--border));
		background: color-mix(in srgb, var(--accent) 5%, var(--surface));
	}
	.card-title {
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-faint);
		margin: 0 0 10px;
	}
	.two-up {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 12px;
	}
	.two-up .card {
		margin-bottom: 12px;
	}

	.prose {
		font-size: 14px;
		line-height: 1.62;
		color: var(--text);
		margin: 0;
	}
	.prose-sub {
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--text-muted);
		margin: 10px 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}
	.prose-sub-k {
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--accent);
		margin-right: 6px;
	}
	.bullets {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 7px;
	}
	.bullets li {
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-muted);
	}
	.card.accent .bullets li {
		color: var(--text);
	}

	/* playground */
	.play {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 18px;
	}
	.play-swatch-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 12px;
	}
	.play-swatch {
		width: 46px;
		height: 46px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		flex-shrink: 0;
	}
	.play-hexin {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		width: 100%;
		max-width: 170px;
		padding: 4px 8px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--surface-2);
		outline: none;
	}
	.play-hexin:focus {
		border-color: var(--accent);
		background: var(--surface);
	}
	.play-hexin.err {
		border-color: var(--warn);
	}
	.play-swatch-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.oog-slot {
		display: flex;
		align-items: center;
	}
	.oog {
		font-size: 9.5px;
		line-height: 1.6;
		color: var(--warn);
		border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent);
		border-radius: 99px;
		padding: 0 6px;
		width: fit-content;
	}
	/* Always rendered (reserves its space) — just hidden when in gamut, so the
	   badge appearing/disappearing never reflows the layout. */
	.oog.hide {
		visibility: hidden;
	}
	.play-sliders {
		display: grid;
		gap: 11px;
	}
	.play-slider {
		display: grid;
		gap: 3px;
	}
	.play-slabel {
		display: flex;
		align-items: baseline;
		gap: 6px;
		font-size: 11px;
	}
	.play-slabel code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--syn-prop, var(--accent));
		font-weight: 600;
	}
	.play-chname {
		color: var(--text-muted);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.play-val {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	/* gradient-track slider: the track previews where moving this channel goes,
	   and the thumb marks the current value (a readable box on any color). */
	.play-slider input[type='range'].grad {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 22px;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}
	.play-slider input.grad::-webkit-slider-runnable-track {
		height: 18px;
		border-radius: 5px;
		background: var(--grad);
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
	}
	.play-slider input.grad::-moz-range-track {
		height: 18px;
		border-radius: 5px;
		background: var(--grad);
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
	}
	.play-slider input.grad::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 7px;
		height: 24px;
		margin-top: -4px;
		border-radius: 3px;
		background: #fff;
		border: 1.5px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.55),
			0 1px 3px rgba(0, 0, 0, 0.35);
	}
	.play-slider input.grad::-moz-range-thumb {
		width: 7px;
		height: 24px;
		border-radius: 3px;
		background: #fff;
		border: 1.5px solid rgba(0, 0, 0, 0.65);
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.55),
			0 1px 3px rgba(0, 0, 0, 0.35);
	}
	.play-slider input.grad:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
		border-radius: 5px;
	}
	.play-dsl {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		padding: 7px 10px;
		background: var(--surface-2);
		border-radius: var(--radius-xs);
		overflow-x: auto;
	}
	.play-dsl-label {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--accent);
		flex-shrink: 0;
	}
	.play-dsl code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12.5px;
		color: var(--text);
		white-space: nowrap;
	}
	.play-right {
		min-width: 0;
	}
	.readout-head {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		margin-bottom: 7px;
	}
	.readout {
		display: grid;
		gap: 4px;
	}
	.readout-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 8px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--surface-2);
		cursor: pointer;
		text-align: left;
		width: 100%;
	}
	.readout-row:hover {
		border-color: var(--accent);
	}
	.readout-id {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11.5px;
		font-weight: 600;
		color: var(--accent);
		flex-shrink: 0;
		width: 52px;
	}
	.readout-chans {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.readout-chan {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11.5px;
		color: var(--text-muted);
	}
	.readout-chan i {
		color: var(--text-faint);
		font-style: normal;
		margin-right: 3px;
	}
	.readout-note {
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--text-faint);
		margin: 10px 0 0;
	}
	.readout-note code,
	.rel-note code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		background: var(--surface-2);
		color: var(--syn-method, var(--accent));
		padding: 1px 5px;
		border-radius: var(--radius-xs);
	}

	.play-stub {
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--text-muted);
	}
	.play-stub p {
		margin: 0 0 8px;
	}
	.play-stub-alt {
		color: var(--text);
	}

	/* 2-D gamut plane */
	.gamut {
		margin-top: 14px;
		border-top: 1px solid var(--border);
		padding-top: 12px;
	}
	.gamut-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		background: none;
		border: none;
		color: var(--text-muted);
		font-size: 12.5px;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
	}
	.gamut-toggle:hover {
		color: var(--text);
	}
	.caret {
		color: var(--accent);
		transition: transform 0.12s;
	}
	.caret.open {
		transform: rotate(90deg);
	}
	.gamut-body {
		margin-top: 12px;
	}

	/* channels table */
	.chan-tbl {
		display: grid;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		overflow: hidden;
	}
	.chan-tr {
		display: grid;
		grid-template-columns: minmax(120px, 0.9fr) minmax(0, 2fr) 56px 56px;
		gap: 12px;
		align-items: baseline;
		padding: 9px 12px;
		border-top: 1px solid var(--border);
	}
	.chan-tr:first-child {
		border-top: none;
	}
	.chan-head {
		background: var(--surface-2);
		font-size: 9.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		padding-top: 7px;
		padding-bottom: 7px;
	}
	.chan-c {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.chan-key {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--syn-prop, var(--accent));
	}
	.chan-name {
		font-size: 12.5px;
		color: var(--text);
		font-weight: 550;
	}
	.chan-about {
		font-size: 12.5px;
		line-height: 1.45;
		color: var(--text-muted);
		min-width: 0;
	}
	.chan-num {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12px;
		color: var(--text-faint);
		text-align: right;
	}
	.chan-foot {
		font-size: 11.5px;
		line-height: 1.5;
		color: var(--text-faint);
		margin: 10px 0 0;
	}

	/* relationships */
	.rel-group {
		display: flex;
		gap: 12px;
		align-items: baseline;
		margin-bottom: 10px;
		flex-wrap: wrap;
	}
	.rel-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		width: 96px;
		flex-shrink: 0;
	}
	.rel-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		flex: 1;
		min-width: 0;
	}
	.rel-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border: 1px solid var(--border);
		border-radius: 99px;
		background: var(--surface-2);
		color: var(--text);
		font-size: 12.5px;
		cursor: pointer;
	}
	.rel-chip code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 10.5px;
		color: var(--text-faint);
	}
	.rel-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.rel-chip:hover code {
		color: var(--accent);
	}
	.rel-chip.ghost {
		background: none;
	}
	.rel-chip.inline {
		padding: 1px 6px;
		border: none;
		background: none;
		color: var(--accent);
		font-size: 13.5px;
	}
	.rel-chip.inline:hover {
		text-decoration: underline;
	}
	.rel-note {
		font-size: 12px;
		line-height: 1.55;
		color: var(--text-faint);
		margin: 4px 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}
	.rel-note em {
		color: var(--text-muted);
		font-style: italic;
	}

	/* methods */
	.methods {
		display: grid;
		gap: 5px;
	}
	.method {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
		font-size: 12.5px;
		line-height: 1.5;
	}
	.m-name {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	.m-name.is-method {
		color: var(--syn-method, var(--accent));
	}
	.m-name.is-prop {
		color: var(--syn-prop, var(--accent));
	}
	.m-sig {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-faint);
	}
	.m-doc {
		color: var(--text-muted);
		flex: 1;
		min-width: 160px;
	}

	/* resources */
	.resources {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
	}
	.resources a {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 13px;
		color: var(--accent);
		text-decoration: none;
	}
	.resources a:hover {
		text-decoration: underline;
	}
	.resources svg {
		opacity: 0.6;
	}

	.enc-foot {
		text-align: center;
		font-size: 11px;
		color: var(--text-faint);
		margin-top: 18px;
	}

	/* ── responsive ── */
	@media (max-width: 860px) {
		.enc-main {
			grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
		}
		.play,
		.two-up {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	/* mobile: list <-> detail single column */
	.enc.mobile .enc-main {
		grid-template-columns: minmax(0, 1fr);
	}
	.enc.mobile .enc-index {
		border-right: none;
	}
	.enc.mobile .enc-detail {
		display: none;
	}
	.enc.mobile.detail .enc-index {
		display: none;
	}
	.enc.mobile.detail .enc-detail {
		display: block;
	}
	.enc.mobile .enc-mobile-back {
		display: inline-flex;
	}
	.enc.mobile .hero-title {
		font-size: 21px;
	}
	.enc.mobile .enc-detail {
		padding: 14px 14px 36px;
	}
	.enc.mobile .rel-label {
		width: 100%;
	}
	.enc.mobile .enc-title {
		font-size: 14px;
	}
	.enc.mobile .enc-titlewrap .chip {
		display: none;
	}
	.enc.mobile .enc-back span {
		display: none;
	}
	.enc.mobile .enc-top {
		gap: 8px;
		padding: 9px 12px;
	}
	.enc.mobile .play-dsl code {
		white-space: normal;
		word-break: break-word;
	}
	.enc.mobile .enc-detail {
		overflow-x: hidden;
	}
	.enc.mobile .hero {
		gap: 12px;
		flex-direction: column;
		align-items: stretch;
	}
	.enc.mobile .hero-swatch {
		width: 56px;
		height: 56px;
	}
	.enc.mobile .readout-id {
		width: 46px;
	}
	.enc.mobile .readout-chans {
		gap: 6px;
	}
	/* channels table → stacked on mobile: name + min/max on row 1, description below */
	.enc.mobile .chan-head {
		display: none;
	}
	.enc.mobile .chan-tr {
		grid-template-columns: 1fr auto auto;
		column-gap: 10px;
		row-gap: 4px;
	}
	.enc.mobile .chan-c {
		grid-column: 1;
		grid-row: 1;
		flex-direction: row;
		align-items: baseline;
		gap: 7px;
	}
	.enc.mobile .chan-num {
		grid-row: 1;
		align-self: baseline;
	}
	.enc.mobile .chan-num::before {
		content: attr(data-l) ' ';
		font-size: 8.5px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.7;
	}
	.enc.mobile .chan-about {
		grid-column: 1 / -1;
		grid-row: 2;
	}
</style>
