<script lang="ts">
	import DesktopShell from '$lib/components/DesktopShell.svelte';
	import MobileShell from '$lib/components/mobile/MobileShell.svelte';
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { decodeHash } from '$lib/persistence/url-hash';
	import { docs } from '$lib/state/docs.svelte';
	import { examples } from './examples';
	import { onMount } from 'svelte';

	// Live data for first paint (SSR/prerender + first client render). docs.init()
	// replaces this with the user's active document on mount; this seed, shown
	// before hydration, is never persisted (autosave is gated on docs.hydrated).
	if (app.source === '') app.source = examples[0].source;

	onMount(() => {
		docs.init();
		// A share-link in the hash opens as a brand-new document so it never
		// pollutes an existing slot; drop the hash so a refresh won't re-import.
		decodeHash(location.hash).then((shared) => {
			if (shared?.source) {
				docs.openShared(shared.source);
				history.replaceState(null, '', location.pathname + location.search);
			}
		});
	});
</script>

<svelte:head><title>Chromatics — color as code</title></svelte:head>

<!--
	Mount-gated shell chooser. During SSR/prerender and the first client
	(hydration) render, ui.mounted is false → DesktopShell, so the prerendered
	markup and the first client render match exactly (no hydration mismatch).
	+layout.svelte flips ui.mounted / ui.isMobile in onMount via matchMedia.
-->
{#if !ui.mounted || !ui.isMobile}
	<DesktopShell />
{:else}
	<MobileShell />
{/if}
