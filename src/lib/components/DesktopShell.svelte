<script lang="ts">
	import Editor from '$lib/Editor.svelte';
	import Inspector from '$lib/components/Inspector.svelte';
	import Matrix from '$lib/components/Matrix.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import Styleguide from '$lib/components/Styleguide.svelte';
	import ModelViewer from '$lib/components/ModelViewer.svelte';
	import Studio from '$lib/components/Studio.svelte';
	import Validate from '$lib/components/Validate.svelte';
	import Docs from '$lib/components/Docs.svelte';
	import ExportPanel from '$lib/components/ExportPanel.svelte';
	import DocControls from '$lib/components/DocControls.svelte';
	import { app } from '$lib/state/app.svelte';
	import { ui, type Tab } from '$lib/state/ui.svelte';
	import { welcome } from '$lib/state/welcome.svelte';
	import { completion, hover, makeSwatches } from '$lib/dsl/editor-bindings';
	import type { SwatchMode } from '$lib/dsl/swatch-deco';
	import { base } from '$app/paths';
	import { encodeHash } from '$lib/persistence/url-hash';

	let showDocs = $state(false);
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && showDocs) showDocs = false;
	}

	// Editor colour-marker style — live-swappable from the editor header.
	const SWATCH_MODES: { value: SwatchMode; label: string }[] = [
		{ value: 'underline', label: 'Underline' },
		{ value: 'square', label: 'Swatch' },
		{ value: 'outline', label: 'Outline' },
		{ value: 'dot', label: 'Dot' },
		{ value: 'background', label: 'Fill' },
		{ value: 'text', label: 'Text' }
	];
	const swatch = $derived(makeSwatches(ui.swatchMode));

	const TABS: { id: Tab; label: string }[] = [
		{ id: 'inspector', label: 'Inspector' },
		{ id: 'studio', label: 'Studio' },
		{ id: 'preview', label: 'Preview' },
		{ id: 'styleguide', label: 'Styleguide' },
		{ id: 'matrix', label: 'Matrix' },
		{ id: 'validate', label: 'Validate' },
		{ id: 'explore', label: '3D Explore' },
		{ id: 'export', label: 'Export' }
	];

	let shareLabel = $state('Share');

	async function share() {
		location.hash = await encodeHash({ source: app.source });
		navigator.clipboard?.writeText(location.href);
		shareLabel = 'Copied!';
		setTimeout(() => (shareLabel = 'Share'), 1200);
	}

	// --- resizable editor ---
	let resizing = $state(false);
	function startResize(e: PointerEvent) {
		resizing = true;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onResize(e: PointerEvent) {
		if (!resizing) return;
		const pct = (e.clientX / window.innerWidth) * 100;
		ui.editorWidth = Math.min(76, Math.max(24, pct));
	}
	function endResize() {
		resizing = false;
	}
	function resetWidth() {
		ui.editorWidth = 46;
	}
</script>

<svelte:window onkeydown={onKey} />

<div class="app">
	<!-- Top bar -->
	<header class="topbar">
		<div class="brand"><span class="brand-dot"></span> Chromatics</div>

		<DocControls variant="bar" />

		{#if app.result.errors.length > 0}
			<span class="err-chip"
				>{app.result.errors.length} error{app.result.errors.length > 1 ? 's' : ''}</span
			>
		{/if}

		<div class="spacer"></div>

		<button class="btn" onclick={share}>{shareLabel}</button>
		<a class="btn" href="{base}/mixer" title="Cross-model color mixer">Mixer</a>
		<a class="btn" href="{base}/models" title="Color models & systems encyclopedia">Models</a>
		<button class="btn {showDocs ? 'btn-accent' : ''}" onclick={() => (showDocs = !showDocs)}
			>API</button
		>
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
					stroke-linejoin="round"
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
					stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg
				>
			{/if}
		</button>
	</header>

	<!-- Workspace -->
	<div class="workspace" class:resizing>
		{#if !ui.editorCollapsed}
			<section class="editor-pane" style="width: {ui.editorWidth}%">
				<div class="pane-head">
					<span class="pane-title">Editor</span>
					<div class="spacer"></div>
					<select
						class="select swatch-pick"
						bind:value={ui.swatchMode}
						aria-label="Colour marker style"
						title="Colour marker style"
					>
						{#each SWATCH_MODES as m (m.value)}
							<option value={m.value}>{m.label}</option>
						{/each}
					</select>
					<button
						class="icon-btn"
						onclick={() => (ui.editorCollapsed = true)}
						aria-label="Collapse editor"
						title="Collapse editor"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg
						>
					</button>
				</div>
				<div class="editor-host scroll">
					<Editor bind:value={app.source} completionSource={completion} {hover} {swatch} />
				</div>
				{#if app.result.errors.length > 0}
					<div class="errorbar scroll">
						{#each app.result.errors as err (err.line + err.message)}
							<div class="err-row">
								<span class="err-line">line {err.line}</span><span>{err.message}</span>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="resizer"
				onpointerdown={startResize}
				onpointermove={onResize}
				onpointerup={endResize}
				ondblclick={resetWidth}
				title="Drag to resize · double-click to reset"
			>
				<div class="grip"><span></span><span></span><span></span></div>
			</div>
		{:else}
			<button
				class="editor-rail"
				onclick={() => (ui.editorCollapsed = false)}
				title="Expand editor"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg
				>
				<span class="rail-label">Editor</span>
			</button>
		{/if}

		<section class="analyze-pane">
			<div class="pane-head">
				<div class="seg">
					{#each TABS as t (t.id)}
						<button
							class="seg-item {ui.tab === t.id ? 'active' : ''}"
							onclick={() => (ui.tab = t.id)}>{t.label}</button
						>
					{/each}
				</div>
				<div class="spacer"></div>
				<span class="chip"
					>{app.scheme.entries.length} color{app.scheme.entries.length !== 1 ? 's' : ''}</span
				>
			</div>
			<div class="analyze-body">
				{#if ui.tab === 'inspector'}
					<Inspector scheme={app.scheme} />
				{:else if ui.tab === 'studio'}
					<Studio />
				{:else if ui.tab === 'matrix'}
					<Matrix />
				{:else if ui.tab === 'validate'}
					<Validate />
				{:else if ui.tab === 'preview'}
					<Preview />
				{:else if ui.tab === 'styleguide'}
					<Styleguide />
				{:else if ui.tab === 'explore'}
					<ModelViewer seed={app.scheme.entries[0]?.color.hex ?? '#3aa0ff'} />
				{:else}
					<ExportPanel />
				{/if}
			</div>
			{#if showDocs}<Docs onclose={() => (showDocs = false)} />{/if}
		</section>
	</div>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--bg);
		color: var(--text);
	}
	.topbar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 14px;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
		flex-shrink: 0;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 650;
		font-size: 14px;
		letter-spacing: -0.01em;
		margin-right: 6px;
	}
	.brand-dot {
		width: 16px;
		height: 16px;
		border-radius: 5px;
		background: conic-gradient(from 0deg, #ff5d5d, #ffd24d, #4dff88, #4db8ff, #a64dff, #ff5d5d);
	}
	.spacer {
		flex: 1;
	}
	.err-chip {
		padding: 2px 9px;
		border-radius: 99px;
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
		font-size: 11px;
		font-weight: 600;
	}

	.workspace {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.workspace.resizing {
		cursor: col-resize;
		user-select: none;
	}

	.editor-pane {
		display: flex;
		flex-direction: column;
		min-width: 0;
		border-right: 1px solid var(--border);
		background: var(--surface);
	}
	.pane-head {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px 8px 14px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
		min-height: 45px;
	}
	.pane-title {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.swatch-pick {
		font-size: 11.5px;
		padding: 3px 22px 3px 8px;
	}
	.editor-host {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
	.errorbar {
		flex-shrink: 0;
		max-height: 120px;
		overflow-y: auto;
		border-top: 1px solid var(--border);
		background: color-mix(in srgb, var(--danger) 7%, var(--surface));
		padding: 8px 14px;
	}
	.err-row {
		display: flex;
		gap: 8px;
		font-size: 12px;
		color: var(--danger);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
	}
	.err-line {
		opacity: 0.7;
		flex-shrink: 0;
	}

	.resizer {
		width: 12px;
		flex-shrink: 0;
		cursor: col-resize;
		background: transparent;
		position: relative;
		margin: 0 -6px;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.grip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		width: 7px;
		height: 42px;
		border-radius: 99px;
		background: var(--border-strong);
		transition:
			background 0.12s,
			height 0.12s;
	}
	.grip span {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--surface);
	}
	.resizer:hover .grip,
	.workspace.resizing .grip {
		background: var(--accent);
		height: 58px;
	}
	.resizer:hover .grip span,
	.workspace.resizing .grip span {
		background: var(--accent-fg);
	}

	.editor-rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		width: 38px;
		flex-shrink: 0;
		padding: 12px 0;
		border-right: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-muted);
		cursor: pointer;
	}
	.editor-rail:hover {
		color: var(--text);
		background: var(--surface-2);
	}
	.rail-label {
		writing-mode: vertical-rl;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.analyze-pane {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		background: var(--bg);
	}
	.analyze-body {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}
</style>
