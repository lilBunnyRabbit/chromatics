<script lang="ts">
	/**
	 * Phone shell: compact top bar + single active-view body + floating "Code"
	 * editor pill + 5-slot bottom tab bar, with the editor / more / docs overlays.
	 * Reuses the exact same analysis components and the shared `ui.tab` nav model
	 * as the desktop shell — only the chrome differs.
	 */
	import Inspector from '$lib/components/Inspector.svelte';
	import Studio from '$lib/components/Studio.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import Styleguide from '$lib/components/Styleguide.svelte';
	import Matrix from '$lib/components/Matrix.svelte';
	import Validate from '$lib/components/Validate.svelte';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import ExportPanel from '$lib/components/ExportPanel.svelte';
	import Docs from '$lib/components/Docs.svelte';
	import BottomTabBar from './BottomTabBar.svelte';
	import MoreSheet from './MoreSheet.svelte';
	import MobileEditorSheet from './MobileEditorSheet.svelte';
	import { app } from '$lib/state/app.svelte';
	import { ui, type Tab } from '$lib/state/ui.svelte';
	import { welcome } from '$lib/state/welcome.svelte';

	let moreOpen = $state(false);
	let editorOpen = $state(false);
	let showDocs = $state(false);

	const OVERFLOW: Tab[] = ['styleguide', 'matrix', 'explore', 'export'];
	const moreActive = $derived(moreOpen || OVERFLOW.includes(ui.tab));
	const errorCount = $derived(app.result.errors.length);

	function select(t: Tab) {
		ui.tab = t;
	}
</script>

<div class="m-shell">
	<header class="m-topbar">
		<div class="brand"><span class="brand-dot"></span> Chromatics</div>
		<div class="spacer"></div>
		<span class="chip"
			>{app.scheme.entries.length} color{app.scheme.entries.length !== 1 ? 's' : ''}</span
		>
		<button
			class="icon-btn"
			onclick={() => (welcome.open = true)}
			aria-label="What is Chromatics?"
			title="What is Chromatics?"
		>
			<svg
				width="18"
				height="18"
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
	</header>

	{#if errorCount > 0}
		<button class="m-errorbanner" onclick={() => (editorOpen = true)}>
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg
			>
			<span>{errorCount} error{errorCount > 1 ? 's' : ''} — tap to edit</span>
		</button>
	{/if}

	<main class="m-body">
		{#if ui.tab === 'inspector'}
			<Inspector scheme={app.scheme} />
		{:else if ui.tab === 'studio'}
			<Studio />
		{:else if ui.tab === 'preview'}
			<Preview />
		{:else if ui.tab === 'styleguide'}
			<Styleguide />
		{:else if ui.tab === 'validate'}
			<Validate />
		{:else if ui.tab === 'matrix'}
			<Matrix />
		{:else if ui.tab === 'explore'}
			<ModelViewer seed={app.scheme.entries[0]?.color.hex ?? '#3aa0ff'} />
		{:else if ui.tab === 'export'}
			<ExportPanel />
		{/if}
	</main>

	<button class="m-fab" onclick={() => (editorOpen = true)} aria-label="Edit code">
		<svg
			width="17"
			height="17"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></svg
		>
		<span>Code</span>
	</button>

	<BottomTabBar current={ui.tab} onselect={select} onmore={() => (moreOpen = true)} {moreActive} />

	<MoreSheet
		open={moreOpen}
		onclose={() => (moreOpen = false)}
		onopendocs={() => (showDocs = true)}
	/>
	<MobileEditorSheet open={editorOpen} onclose={() => (editorOpen = false)} />

	{#if showDocs}
		<div class="m-docs-host">
			<Docs onclose={() => (showDocs = false)} />
		</div>
	{/if}
</div>

<style>
	.m-shell {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: var(--bg);
		color: var(--text);
		overflow: hidden;
	}
	.m-topbar {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		padding-top: calc(10px + env(safe-area-inset-top, 0));
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 650;
		font-size: 15px;
		letter-spacing: -0.01em;
	}
	.brand-dot {
		width: 17px;
		height: 17px;
		border-radius: 5px;
		background: conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d);
	}
	.spacer {
		flex: 1;
	}
	.m-errorbanner {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 8px 14px;
		border: none;
		border-bottom: 1px solid var(--border);
		background: color-mix(in srgb, var(--danger) 12%, var(--surface));
		color: var(--danger);
		font-size: 12.5px;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
	}

	.m-body {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow: hidden;
		/* Clearance so internal-scroll views end above the floating Code pill. */
		padding-bottom: 60px;
	}

	.m-fab {
		position: absolute;
		right: 14px;
		bottom: calc(54px + env(safe-area-inset-bottom, 0) + 14px);
		z-index: 60;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 10px 16px;
		border: none;
		border-radius: 99px;
		background: var(--accent);
		color: var(--accent-fg);
		font-size: 13.5px;
		font-weight: 650;
		box-shadow: var(--shadow);
		cursor: pointer;
	}

	.m-docs-host {
		position: absolute;
		inset: 0;
		z-index: 150;
	}
</style>
