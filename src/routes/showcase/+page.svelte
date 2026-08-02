<script lang="ts">
	/**
	 * `/showcase` — the embeddable read-first view of a shared scheme.
	 *
	 * Everything arrives in the URL: the scheme in the hash (the same `~1`/`~2`
	 * share payload the Share button produces) and the presentation knobs in the
	 * query string (see `$lib/showcase/config`). Both are read client-side, so
	 * this works on a static host and the payload never reaches a server.
	 *
	 * The shell is mount-gated: the prerendered HTML is only the (noindex) head
	 * plus a skeleton, because the hash — the actual content — is browser-only.
	 */
	import { onMount } from 'svelte';
	import ShowcaseShell from '$lib/components/showcase/ShowcaseShell.svelte';
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { decodeHash } from '$lib/persistence/url-hash';
	import {
		parseShowcaseConfig,
		DEFAULT_SHOWCASE_CONFIG,
		type ShowcaseConfig
	} from '$lib/showcase/config';

	let ready = $state(false);
	let cfg = $state<ShowcaseConfig>(DEFAULT_SHOWCASE_CONFIG);
	let hasScheme = $state(false);

	onMount(() => {
		// Must be set before +layout's onMount runs (children mount first): it
		// suppresses the localStorage theme/ui reads + writes and the welcome modal.
		ui.embed = true;
		cfg = parseShowcaseConfig(location.search);

		let mql: MediaQueryList | null = null;
		let onScheme: ((e: MediaQueryListEvent) => void) | null = null;
		if (cfg.theme === 'auto') {
			mql = window.matchMedia('(prefers-color-scheme: dark)');
			ui.theme = mql.matches ? 'dark' : 'light';
			onScheme = (e) => (ui.theme = e.matches ? 'dark' : 'light');
			mql.addEventListener('change', onScheme);
		} else {
			ui.theme = cfg.theme;
		}
		document.documentElement.setAttribute('data-theme', ui.theme);

		decodeHash(location.hash).then((shared) => {
			if (shared?.source?.trim()) {
				app.source = shared.source;
				hasScheme = true;
				// One seam for both directions (`app.settings()` writes the link):
				// it defaults every hole, so a partial or older payload can't put
				// `undefined` where the panels render a number.
				if (shared.settings) app.applySettings(shared.settings);
			}
			ready = true;
		});

		return () => {
			// Client-side nav back into the studio must restore normal behaviour.
			ui.embed = false;
			ui.sourceLocked = false;
			if (mql && onScheme) mql.removeEventListener('change', onScheme);
		};
	});
</script>

<svelte:head>
	<title>Color scheme — Chromatics showcase</title>
	<!-- Embeds are other sites' content; the canonical page is the studio. -->
	<meta name="robots" content="noindex, follow" />
	<meta
		name="description"
		content="An embedded Chromatics color scheme — code, palette, contrast and preview."
	/>
</svelte:head>

{#if ready}
	<ShowcaseShell {cfg} {hasScheme} />
{:else}
	<div class="sc-boot" aria-busy="true">Loading scheme…</div>
{/if}

<style>
	.sc-boot {
		padding: 28px 16px;
		font-size: 13px;
		color: var(--text-faint);
		text-align: center;
	}
</style>
