<script lang="ts">
	/**
	 * First-run welcome showcase. A full-screen dialog with a hero "color as code"
	 * card and a grid of feature cards; each card jumps to the relevant tab/route
	 * and (where useful) loads a tailored example into the editor. Rendered once
	 * globally in +layout.svelte so it works on every route and both shells.
	 *
	 * Auto-opens on the visitor's first visit (persistence/local-storage.ts), and
	 * any chrome can re-open it via the shared `welcome` store. Dismissing or
	 * acting on a card marks the visitor welcomed so it won't auto-pop again.
	 */
	import { app } from '$lib/state/app.svelte';
	import { ui, type Tab } from '$lib/state/ui.svelte';
	import { welcome } from '$lib/state/welcome.svelte';
	import { hasWelcomed, markWelcomed } from '$lib/persistence/local-storage';
	import { examples } from '../../routes/examples';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';

	const SRC: Record<string, string> = Object.fromEntries(examples.map((e) => [e.name, e.source]));

	type IconName =
		| 'code'
		| 'grid'
		| 'eye'
		| 'layout'
		| 'contrast'
		| 'wand'
		| 'download'
		| 'book'
		| 'sliders';

	interface Card {
		key: string;
		title: string;
		desc: string;
		cta: string;
		icon: IconName;
		accent: string;
		/** Example name to load into the editor (optional). */
		example?: string;
		/** Studio tab to switch to (optional; implies navigating to `/`). */
		tab?: Tab;
		/** Route to navigate to instead of a studio tab (optional). */
		route?: string;
	}

	const FEATURES: Card[] = [
		{
			key: 'inspector',
			title: 'Inspector',
			desc: 'Read any color across every model — HEX, OKLCH, RGB, HSL — with live analysis.',
			cta: 'Open',
			icon: 'grid',
			accent: '#5b5bd6',
			tab: 'inspector'
		},
		{
			key: 'preview',
			title: 'Preview',
			desc: 'See your palette on real UI — type, components, charts and mockups.',
			cta: 'Open',
			icon: 'eye',
			accent: '#0e9488',
			example: 'Previews',
			tab: 'preview'
		},
		{
			key: 'styleguide',
			title: 'Styleguide',
			desc: 'Author a design system — tokens & components, rendered and auto-audited.',
			cta: 'Open',
			icon: 'layout',
			accent: '#7c3aed',
			example: 'Design System',
			tab: 'styleguide'
		},
		{
			key: 'a11y',
			title: 'Accessibility',
			desc: 'A contrast matrix with WCAG + APCA, plus color-blindness simulation.',
			cta: 'Check',
			icon: 'contrast',
			accent: '#30a46c',
			tab: 'matrix'
		},
		{
			key: 'studio',
			title: 'Studio',
			desc: 'Generate harmonies, tonal ramps & gradients, or extract colors from an image.',
			cta: 'Open',
			icon: 'wand',
			accent: '#d98324',
			tab: 'studio'
		},
		{
			key: 'export',
			title: 'Export',
			desc: 'Ship CSS vars, design tokens, a swatch SVG, Markdown — or round-trippable DSL.',
			cta: 'Open',
			icon: 'download',
			accent: '#c2410c',
			tab: 'export'
		},
		{
			key: 'models',
			title: '100 color models',
			desc: 'An interactive encyclopedia of every space & system, with a 3-D viewer.',
			cta: 'Explore',
			icon: 'book',
			accent: '#0e7490',
			route: '/models'
		},
		{
			key: 'mixer',
			title: 'Cross-model mixer',
			desc: 'One color, every model — drag a slider and watch all the others follow live.',
			cta: 'Open',
			icon: 'sliders',
			accent: '#e5484d',
			route: '/mixer'
		}
	];

	// Decorative ramp for the hero — one seed (#6c5ce7) expanded into a palette,
	// echoing what the code beside it does. Purely cosmetic (aria-hidden).
	const HERO_SWATCHES = ['#1b1733', '#2a2350', '#6c5ce7', '#9b8cff', '#d7d0ff'];

	const HERO_CODE = `brand   = hex("#6c5ce7")   // ← edit this

primary = brand.oklch.gamutMap()
accent  = primary.rotate(-150)
bg      = OKLCH(0.17, brand.ok_c * 0.3, brand.ok_h)
surface = bg.lighten(0.05)`;

	// ── open / focus management ──
	let dialogEl = $state<HTMLDivElement | null>(null);
	let lastFocused: HTMLElement | null = null;

	onMount(() => {
		if (!hasWelcomed()) welcome.open = true;
	});

	$effect(() => {
		if (welcome.open) {
			lastFocused = (document.activeElement as HTMLElement) ?? null;
			document.body.style.overflow = 'hidden';
			tick().then(() => dialogEl?.focus());
		} else {
			document.body.style.overflow = '';
			// Only restore to the opener if it's still in the DOM — a card that
			// navigates routes unmounts the trigger, so don't poke a detached node.
			if (lastFocused?.isConnected) lastFocused.focus();
		}
	});

	function dismiss() {
		markWelcomed();
		welcome.open = false;
	}

	async function run(card: Card) {
		markWelcomed();
		welcome.open = false;
		if (card.example && SRC[card.example]) app.source = SRC[card.example];
		if (card.tab) ui.tab = card.tab;
		// Tab cards live in the studio at `/`; route cards go elsewhere.
		await goto(base + (card.route ?? '/'));
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			dismiss();
			return;
		}
		if (e.key !== 'Tab' || !dialogEl) return;
		const f = dialogEl.querySelectorAll<HTMLElement>(
			'button, a[href], [tabindex]:not([tabindex="-1"])'
		);
		if (!f.length) return;
		const first = f[0];
		const last = f[f.length - 1];
		const active = document.activeElement;
		// If focus is on the panel itself (initial state) or somehow outside the
		// dialog, pull it back in — otherwise Tab/Shift+Tab would leak to the page.
		if (active === dialogEl || !dialogEl.contains(active)) {
			e.preventDefault();
			(e.shiftKey ? last : first).focus();
		} else if (e.shiftKey && active === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

{#snippet glyph(name: IconName)}
	{#if name === 'code'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></svg
		>
	{:else if name === 'grid'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect
				x="14"
				y="3"
				width="7"
				height="7"
				rx="1.5"
			/><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect
				x="3"
				y="14"
				width="7"
				height="7"
				rx="1.5"
			/></svg
		>
	{:else if name === 'eye'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle
				cx="12"
				cy="12"
				r="3"
			/></svg
		>
	{:else if name === 'layout'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg
		>
	{:else if name === 'contrast'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><circle cx="12" cy="12" r="9" /><path
				d="M12 3a9 9 0 0 0 0 18z"
				fill="currentColor"
				stroke="none"
			/></svg
		>
	{:else if name === 'wand'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path
				d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h.01M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"
			/></svg
		>
	{:else if name === 'download'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path
				d="M12 15V3"
			/></svg
		>
	{:else if name === 'book'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path
				d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
			/></svg
		>
	{:else}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2.4" /><line
				x1="4"
				y1="14"
				x2="20"
				y2="14"
			/><circle cx="15" cy="14" r="2.4" /></svg
		>
	{/if}
{/snippet}

{#if welcome.open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="wc-overlay" onclick={dismiss} onkeydown={onKeydown}>
		<div
			class="wc-panel"
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-labelledby="wc-title"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
		>
			<header class="wc-head">
				<span class="wc-dot"></span>
				<div class="wc-headtext">
					<h2 id="wc-title" class="wc-title">Welcome to Chromatics</h2>
					<p class="wc-sub">A scriptable color language and a studio to design with it.</p>
				</div>
				<button class="icon-btn wc-close" onclick={dismiss} aria-label="Close" title="Close (Esc)">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg
					>
				</button>
			</header>

			<div class="wc-body scroll">
				<!-- Hero: color as code -->
				<button
					class="wc-hero"
					onclick={() =>
						run({
							key: 'dsl',
							title: '',
							desc: '',
							cta: '',
							icon: 'code',
							accent: '#5b5bd6',
							example: 'Overview',
							tab: 'inspector'
						})}
				>
					<div class="wc-hero-text">
						<span class="wc-eyebrow">The DSL</span>
						<h3 class="wc-hero-title">Color, as code</h3>
						<p class="wc-hero-desc">
							Declare one brand color and derive a whole palette from it. Edit the seed and watch
							the rest cascade — every dependent color updates and the changes flash in the palette.
						</p>
						<span class="wc-hero-cta"
							>Edit a color, watch it cascade
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg
							>
						</span>
					</div>
					<div class="wc-hero-demo">
						<pre class="wc-code mono">{HERO_CODE}</pre>
						<div class="wc-swatches" aria-hidden="true">
							{#each HERO_SWATCHES as c (c)}
								<span class="wc-swatch" style:background={c}></span>
							{/each}
						</div>
					</div>
				</button>

				<!-- Feature grid -->
				<div class="wc-grid">
					{#each FEATURES as card (card.key)}
						<button class="wc-card" onclick={() => run(card)}>
							<span class="wc-ico" style:--ico={card.accent}>{@render glyph(card.icon)}</span>
							<span class="wc-card-title">{card.title}</span>
							<span class="wc-card-desc">{card.desc}</span>
							<span class="wc-card-cta"
								>{card.cta}
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
								>
							</span>
						</button>
					{/each}
				</div>
			</div>

			<footer class="wc-foot">
				<span class="wc-hint">Reopen this anytime from the <strong>?</strong> in the top bar.</span>
				<button class="btn" onclick={dismiss}>Skip — start exploring</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	.wc-overlay {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: max(clamp(12px, 4vh, 48px), env(safe-area-inset-top, 0px)) 16px
			max(clamp(12px, 4vh, 48px), env(safe-area-inset-bottom, 0px));
		overflow-y: auto;
		background: color-mix(in srgb, var(--bg) 55%, transparent);
		backdrop-filter: blur(6px);
	}
	.wc-panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 880px;
		max-height: calc(
			100dvh - clamp(24px, 8vh, 96px) - env(safe-area-inset-top, 0px) -
				env(safe-area-inset-bottom, 0px)
		);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		overflow: hidden;
		outline: none;
	}

	.wc-head {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 18px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.wc-dot {
		width: 26px;
		height: 26px;
		border-radius: 8px;
		flex-shrink: 0;
		background: conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d);
		box-shadow: var(--shadow-sm);
	}
	.wc-headtext {
		min-width: 0;
	}
	.wc-title {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.wc-sub {
		margin: 2px 0 0;
		font-size: 12.5px;
		color: var(--text-muted);
	}
	.wc-close {
		margin-left: auto;
		flex-shrink: 0;
	}

	.wc-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	/* hero */
	.wc-hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
		align-items: center;
		text-align: left;
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background:
			radial-gradient(
				120% 120% at 100% 0%,
				color-mix(in srgb, var(--accent) 10%, transparent),
				transparent 60%
			),
			var(--surface-2);
		cursor: pointer;
		transition:
			border-color 0.12s,
			box-shadow 0.12s,
			transform 0.12s;
	}
	.wc-hero:hover {
		border-color: color-mix(in srgb, var(--accent) 50%, var(--border));
		box-shadow: var(--shadow);
	}
	.wc-eyebrow {
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--accent);
	}
	.wc-hero-title {
		margin: 6px 0 8px;
		font-size: 22px;
		font-weight: 750;
		letter-spacing: -0.02em;
	}
	.wc-hero-desc {
		margin: 0 0 14px;
		font-size: 13px;
		line-height: 1.55;
		color: var(--text-muted);
	}
	.wc-hero-cta {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 650;
		color: var(--accent);
	}
	.wc-hero-cta svg {
		width: 16px;
		height: 16px;
	}
	.wc-hero-demo {
		min-width: 0;
	}
	.wc-code {
		margin: 0;
		padding: 13px 14px;
		border-radius: var(--radius-sm);
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 11.5px;
		line-height: 1.55;
		color: var(--text-muted);
		overflow-x: auto;
		white-space: pre;
	}
	.wc-swatches {
		display: flex;
		gap: 6px;
		margin-top: 10px;
	}
	.wc-swatch {
		flex: 1;
		height: 26px;
		border-radius: var(--radius-xs);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--text) 8%, transparent);
	}

	/* feature grid */
	.wc-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
		gap: 10px;
	}
	.wc-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 7px;
		text-align: left;
		padding: 14px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		cursor: pointer;
		transition:
			border-color 0.12s,
			box-shadow 0.12s,
			transform 0.12s;
	}
	.wc-card:hover {
		border-color: var(--border-strong);
		box-shadow: var(--shadow-sm);
		transform: translateY(-1px);
	}
	.wc-ico {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 9px;
		color: var(--ico);
		background: color-mix(in srgb, var(--ico) 14%, transparent);
	}
	.wc-ico :global(svg) {
		width: 18px;
		height: 18px;
	}
	.wc-card-title {
		font-size: 13.5px;
		font-weight: 650;
	}
	.wc-card-desc {
		font-size: 12px;
		line-height: 1.5;
		color: var(--text-muted);
		flex: 1;
	}
	.wc-card-cta {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		margin-top: 2px;
		font-size: 12px;
		font-weight: 600;
		color: var(--accent);
	}
	.wc-card-cta svg {
		width: 14px;
		height: 14px;
	}

	.wc-foot {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 13px 18px;
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}
	.wc-hint {
		font-size: 12px;
		color: var(--text-muted);
	}
	.wc-hint strong {
		color: var(--text);
	}
	.wc-foot .btn {
		margin-left: auto;
	}

	@media (max-width: 620px) {
		.wc-hero {
			grid-template-columns: 1fr;
		}
		.wc-foot {
			flex-direction: column-reverse;
			align-items: stretch;
		}
		.wc-foot .btn {
			margin-left: 0;
			justify-content: center;
		}
		.wc-hint {
			text-align: center;
		}
	}
</style>
