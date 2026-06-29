<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { ui, type Tab } from '$lib/state/ui.svelte';
	import { welcome } from '$lib/state/welcome.svelte';
	import Welcome from '$lib/components/Welcome.svelte';

	let { children } = $props();
	let ready = $state(false);

	onMount(() => {
		const applied = document.documentElement.getAttribute('data-theme');
		if (applied === 'dark' || applied === 'light') ui.theme = applied;
		try {
			const raw = localStorage.getItem('chromatics:ui');
			if (raw) {
				const p = JSON.parse(raw);
				if (typeof p.editorWidth === 'number') ui.editorWidth = p.editorWidth;
				if (typeof p.editorCollapsed === 'boolean') ui.editorCollapsed = p.editorCollapsed;
				if (p.tab) ui.tab = p.tab as Tab;
				if (p.swatchMode) ui.swatchMode = p.swatchMode;
			}
		} catch {
			/* ignore */
		}

		// Desktop/mobile shell gate. Only read matchMedia after mount so the
		// prerendered + first-client render stay on the desktop shell (no
		// hydration mismatch); then flip and track viewport changes.
		const mql = window.matchMedia('(max-width: 768px)');
		ui.isMobile = mql.matches;
		const onChange = (e: MediaQueryListEvent) => (ui.isMobile = e.matches);
		mql.addEventListener('change', onChange);

		ui.mounted = true;
		ready = true;

		return () => mql.removeEventListener('change', onChange);
	});

	$effect(() => {
		if (!ready) return;
		document.documentElement.setAttribute('data-theme', ui.theme);
		try {
			localStorage.setItem('chromatics:theme', ui.theme);
		} catch {
			/* ignore */
		}
	});

	$effect(() => {
		if (!ready) return;
		try {
			localStorage.setItem(
				'chromatics:ui',
				JSON.stringify({
					editorWidth: ui.editorWidth,
					editorCollapsed: ui.editorCollapsed,
					tab: ui.tab,
					swatchMode: ui.swatchMode
				})
			);
		} catch {
			/* ignore */
		}
	});
</script>

<!-- App content is inerted (unfocusable/unclickable) while the welcome modal is up. -->
<div style="display: contents" inert={welcome.open}>
	{@render children()}
</div>

<!-- First-run showcase; rendered once, works on every route + both shells. -->
<Welcome />
