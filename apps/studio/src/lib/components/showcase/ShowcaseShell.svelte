<script lang="ts">
	/**
	 * The `/showcase` embed surface: a scheme decoded from a share link, shown
	 * through the same analysis panels as the studio, with no document chrome.
	 *
	 * Two things make it safe to drop into someone else's page:
	 *  - it never calls `docs.init()`, so autosave (gated on `docs.hydrated`)
	 *    never runs and the visitor's own saved documents stay untouched;
	 *  - while locked it sets `ui.sourceLocked`, so the DSL emitters reachable
	 *    from the reused panels are inert.
	 *
	 * Layout is document flow (no 100vh shell) so the content has a natural
	 * height — that height is what the auto-height postMessage reports to the
	 * host page.
	 */
	import { onMount, untrack } from 'svelte';
	import { base } from '$app/paths';
	import Editor from '$lib/Editor.svelte';
	import Inspector from '$lib/components/Inspector.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import Styleguide from '$lib/components/Styleguide.svelte';
	import Matrix from '$lib/components/Matrix.svelte';
	import Validate from '$lib/components/Validate.svelte';
	import ExportPanel from '$lib/components/ExportPanel.svelte';
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { completion, hover, makeSwatches } from '$lib/dsl/editor-bindings';
	import { encodeHash } from '$lib/persistence/url-hash';
	import {
		SHOWCASE_VIEW_LABELS,
		buildShowcaseUrl,
		type ShowcaseConfig,
		type ShowcaseView
	} from '$lib/showcase/config';

	let { cfg, hasScheme }: { cfg: ShowcaseConfig; hasScheme: boolean } = $props();

	// Seeded from the URL config once; the viewer owns them from then on.
	let view = $state<ShowcaseView>(untrack(() => cfg.view));
	let unlocked = $state(untrack(() => cfg.edit === 'open'));
	const canEdit = $derived(cfg.edit !== 'none');

	const swatch = $derived(makeSwatches(ui.swatchMode));
	const entries = $derived(app.scheme.entries);
	const errors = $derived(app.result.errors);

	// CodeMirror sizes to its parent, so the code pane needs a definite height:
	// grow with the program, capped so a long scheme still fits in an embed.
	const codeHeight = $derived(
		Math.min(760, Math.max(220, app.source.split('\n').length * 20 + 36))
	);

	// Panels reused here can emit DSL — inert unless the viewer forked the scheme.
	$effect(() => {
		ui.sourceLocked = !unlocked;
	});

	/**
	 * Links out carry the *current* (possibly edited) source. `encodeHash` is
	 * async, so they're precomputed into hrefs rather than resolved inside a
	 * click handler — an awaited `window.open` trips popup blockers.
	 */
	let studioHref = $state(base + '/');
	let shareUrl = $state('');
	$effect(() => {
		const state = { source: app.source, settings: app.settings() };
		let live = true;
		encodeHash(state).then((hash) => {
			if (!live) return;
			studioHref = `${base}/#${hash}`;
			shareUrl = buildShowcaseUrl(location.origin, base, hash, { ...cfg, view });
		});
		return () => {
			live = false;
		};
	});

	let copyLabel = $state('Copy link');
	function copyLink() {
		if (!shareUrl) return;
		navigator.clipboard?.writeText(shareUrl);
		copyLabel = 'Copied!';
		setTimeout(() => (copyLabel = 'Copy link'), 1200);
	}

	/*
	 * ── sizing ──
	 * The analysis panels are built for the studio's fixed-height shell: a
	 * `height: 100%` root over an inner `overflow-y: auto` pane. Dropped into a
	 * flow layout they'd just collapse and scroll internally, which is exactly
	 * what an embed must not do — the host page should scroll, not the frame.
	 *
	 * So the body gets a *definite* height that we settle onto the active
	 * panel's natural content height: measure how far anything overflows, grow
	 * by that, repeat until nothing overflows (converges in 1–3 frames). Reset
	 * to the floor on every view switch so the body can shrink again. Subtrees
	 * marked `data-fixed` (the code pane, which is deliberately capped and
	 * scrolls on its own) are measured but not descended into.
	 */
	const MIN_BODY = 280;
	// Generous: a 40-colour Inspector is genuinely ~8000px and the host page
	// should scroll it, not the frame. The cap only exists to bound runaways.
	const MAX_BODY = 12000;
	let bodyEl = $state<HTMLElement | null>(null);
	let bodyH = $state(MIN_BODY);

	function overflowIn(root: HTMLElement): number {
		let extra = 0;
		const stack: Element[] = [root];
		while (stack.length) {
			const el = stack.pop() as HTMLElement;
			if (el.clientHeight > 0) extra = Math.max(extra, el.scrollHeight - el.clientHeight);
			if (el !== root && el.dataset.fixed !== undefined) continue;
			for (const c of el.children) stack.push(c);
		}
		return extra;
	}

	// Timer, not rAF: an embed can sit in a background tab, where rAF is parked
	// and the frame would stay stuck at the floor height.
	function settle(rounds = 5) {
		if (!bodyEl) return;
		const extra = overflowIn(bodyEl);
		if (extra <= 1 || bodyH >= MAX_BODY) return;
		bodyH = Math.min(MAX_BODY, bodyH + extra);
		if (rounds > 0) setTimeout(() => settle(rounds - 1), 16);
	}

	// Re-settle whenever the view or the scheme changes; a view switch starts
	// from the floor so a short panel doesn't inherit a tall one's height.
	$effect(() => {
		void view;
		bodyH = MIN_BODY;
		const t = setTimeout(() => settle(), 16);
		return () => clearTimeout(t);
	});
	$effect(() => {
		void app.source;
		void app.scheme;
		const t = setTimeout(() => settle(), 16);
		return () => clearTimeout(t);
	});

	// ── auto-height: tell the embedding page how tall we actually are ──
	let root = $state<HTMLElement | null>(null);
	let posting = false;
	let lastPosted = 0;

	function post() {
		if (!posting || !root) return;
		// Measure our own content box, never `documentElement.scrollHeight`: once
		// the host has grown the frame, the document is as tall as the frame and
		// the height could only ever ratchet upward.
		const height = Math.ceil(root.getBoundingClientRect().height);
		if (height === lastPosted) return;
		lastPosted = height;
		// The host matches the frame by `event.source`, so a wildcard target
		// origin leaks nothing beyond the height we already render.
		window.parent.postMessage({ type: 'chromatics:height', height }, '*');
	}

	// Driven by state rather than only by the ResizeObserver: RO delivery rides
	// the rendering loop, which a background tab parks — the frame would then
	// stay stuck at whatever height it was first told.
	$effect(() => {
		void bodyH;
		void view;
		void app.scheme;
		const t = setTimeout(post, 32);
		return () => clearTimeout(t);
	});

	/** In a frame the shell must not stretch to the viewport, or it can't shrink. */
	let framed = $state(false);

	onMount(() => {
		framed = window.parent !== window;
		posting = cfg.autoHeight && framed;
		// Content that resizes on its own (fonts, images, the viewer's window)
		// still needs a nudge; the observer re-runs the same two steps.
		const ro = new ResizeObserver(() => {
			settle();
			post();
		});
		ro.observe(document.documentElement);
		if (root) ro.observe(root);
		if (bodyEl) ro.observe(bodyEl);
		post();
		return () => ro.disconnect();
	});
</script>

<div class="sc" class:framed bind:this={root}>
	{#if cfg.chrome}
		<header class="sc-head">
			<div class="sc-id">
				<span class="brand-dot" aria-hidden="true"></span>
				<span class="sc-title">{cfg.title || 'Chromatics'}</span>
				<span class="sc-count">{entries.length} color{entries.length !== 1 ? 's' : ''}</span>
				{#if unlocked}<span class="sc-forked">editing · not saved</span>{/if}
			</div>
			{#if entries.length > 0}
				<div class="sc-strip" role="list" aria-label="Palette">
					{#each entries as e (e.name)}
						<span
							class="sc-chip"
							role="listitem"
							style="background: {e.color.hex}"
							title="{e.name} · {e.color.hex}"
						></span>
					{/each}
				</div>
			{/if}
		</header>
	{/if}

	{#if !hasScheme}
		<div class="sc-empty">
			<p><strong>No scheme in this link.</strong></p>
			<p>
				A showcase link carries the scheme in its URL fragment. Generate one from the
				<a href="{base}/" target="_blank" rel="noopener">Chromatics</a> Export tab → Embed.
			</p>
		</div>
	{:else}
		{#if cfg.views.length > 1}
			<nav class="sc-tabs seg" aria-label="Views">
				{#each cfg.views as v (v)}
					<button class="seg-item {view === v ? 'active' : ''}" onclick={() => (view = v)}>
						{SHOWCASE_VIEW_LABELS[v]}
					</button>
				{/each}
			</nav>
		{/if}

		<div class="sc-body" style="height: {bodyH}px" bind:this={bodyEl}>
			{#if view === 'code'}
				<div class="sc-code" data-fixed style="height: {codeHeight}px">
					<Editor
						bind:value={app.source}
						completionSource={unlocked ? completion : undefined}
						{hover}
						{swatch}
						readonly={!unlocked}
					/>
				</div>
				{#if errors.length > 0}
					<div class="sc-errors">
						{#each errors as err (err.line + err.message)}
							<div class="sc-err">
								<span class="sc-err-line">line {err.line}</span>{err.message}
							</div>
						{/each}
					</div>
				{/if}
			{:else if view === 'inspector'}
				<Inspector scheme={app.scheme} />
			{:else if view === 'preview'}
				<Preview />
			{:else if view === 'styleguide'}
				<Styleguide />
			{:else if view === 'matrix'}
				<Matrix />
			{:else if view === 'validate'}
				<Validate />
			{:else}
				<ExportPanel />
			{/if}
		</div>
	{/if}

	{#if cfg.chrome}
		<footer class="sc-foot">
			<a class="sc-by" href="{base}/" target="_blank" rel="noopener">
				<span class="brand-dot sm" aria-hidden="true"></span> Made with Chromatics
			</a>
			<div class="sc-spacer"></div>
			{#if hasScheme}
				{#if canEdit}
					<button
						class="btn {unlocked ? 'btn-accent' : ''}"
						aria-pressed={unlocked}
						title={unlocked
							? 'Editing this copy — nothing is saved'
							: 'Edit this copy (nothing is saved)'}
						onclick={() => (unlocked = !unlocked)}
					>
						{unlocked ? 'Editing' : 'Edit'}
					</button>
				{/if}
				<button class="btn" onclick={copyLink} disabled={!shareUrl}>{copyLabel}</button>
				<a class="btn" href={studioHref} target="_blank" rel="noopener">Open in Chromatics ↗</a>
			{/if}
		</footer>
	{/if}
</div>

<style>
	/*
	 * Flow layout on purpose: no 100vh anywhere, so every panel expands to its
	 * content and `scrollHeight` is the honest height we post to the host page.
	 * The panels' own `height: 100%` resolves to `auto` against this indefinite
	 * height, and their inner `overflow-y: auto` panes simply don't scroll.
	 */
	.sc {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		background: var(--bg);
		color: var(--text);
	}
	/* Inside a frame, height is content — otherwise the host's last (taller)
	   iframe height would floor the next measurement. */
	.sc.framed {
		min-height: 0;
	}
	.sc-head {
		display: flex;
		flex-direction: column;
		gap: 9px;
		padding: 11px 14px;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}
	.sc-id {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.brand-dot {
		width: 16px;
		height: 16px;
		border-radius: 5px;
		flex-shrink: 0;
		background: conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d);
	}
	.brand-dot.sm {
		width: 12px;
		height: 12px;
		border-radius: 4px;
	}
	.sc-title {
		font-weight: 650;
		font-size: 14px;
		letter-spacing: -0.01em;
	}
	.sc-count {
		font-size: 11px;
		color: var(--text-faint);
	}
	.sc-forked {
		padding: 2px 9px;
		border-radius: 99px;
		font-size: 11px;
		font-weight: 600;
		background: color-mix(in srgb, var(--accent) 16%, transparent);
		color: var(--accent);
	}
	.sc-strip {
		display: flex;
		height: 30px;
		border-radius: var(--radius-sm);
		overflow: hidden;
		border: 1px solid var(--border);
	}
	.sc-chip {
		flex: 1;
		min-width: 4px;
		transition: flex 0.15s;
	}
	.sc-chip:hover {
		flex: 1.6;
	}

	.sc-tabs {
		margin: 10px 14px 0;
		align-self: flex-start;
		max-width: calc(100% - 28px);
		overflow-x: auto;
	}

	/* Definite height, settled onto the active panel's content (see `settle`).
	   Panels keep their own inner scrolling for the rare case that content
	   exceeds MAX_BODY. */
	.sc-body {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.sc-code {
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
		border-bottom: 1px solid var(--border);
	}
	.sc-errors {
		flex-shrink: 0;
		border-top: 1px solid var(--border);
		background: color-mix(in srgb, var(--danger) 7%, var(--surface));
		padding: 8px 14px;
	}
	.sc-err {
		display: flex;
		gap: 8px;
		font-size: 12px;
		color: var(--danger);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
	}
	.sc-err-line {
		opacity: 0.7;
		flex-shrink: 0;
	}

	.sc-empty {
		padding: 28px 16px;
		text-align: center;
		font-size: 13px;
		color: var(--text-muted);
	}
	.sc-empty p {
		margin: 0 0 6px;
	}

	.sc-foot {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 9px 14px;
		border-top: 1px solid var(--border);
		background: var(--surface);
	}
	.sc-by {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: 11.5px;
		color: var(--text-faint);
		text-decoration: none;
	}
	.sc-by:hover {
		color: var(--text);
	}
	.sc-spacer {
		flex: 1;
	}

	@media (max-width: 560px) {
		.sc-foot {
			flex-wrap: wrap;
		}
	}
</style>
