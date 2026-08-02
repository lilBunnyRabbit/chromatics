<script lang="ts">
	/**
	 * Overflow + app-actions sheet for the mobile shell. Holds the analysis views
	 * that don't fit the 5-slot bottom bar (Export / Matrix / Validate) and the
	 * chrome that lived in the desktop top bar (documents via DocControls, share,
	 * theme, DSL reference). Self-contained: owns its own action state.
	 */
	import Sheet from './Sheet.svelte';
	import DocControls from '$lib/components/DocControls.svelte';
	import { app } from '$lib/state/app.svelte';
	import { docs } from '$lib/state/docs.svelte';
	import { ui, type Tab } from '$lib/state/ui.svelte';
	import { encodeHash } from '$lib/persistence/url-hash';
	import { base } from '$app/paths';

	let {
		open = false,
		onclose,
		onopendocs
	}: { open?: boolean; onclose: () => void; onopendocs: () => void } = $props();

	let shareLabel = $state('Share');

	const VIEWS: { id: Tab; label: string; desc: string }[] = [
		{ id: 'export', label: 'Export', desc: 'CSS · tokens · swatch' },
		{ id: 'matrix', label: 'Matrix', desc: 'Contrast grid' },
		{ id: 'validate', label: 'Validate', desc: 'Accessibility checks' },
		{ id: 'history', label: 'History', desc: 'Snapshots · diff a change' }
	];

	function pickView(id: Tab) {
		ui.tab = id;
		onclose();
	}
	async function share() {
		location.hash = await encodeHash({ source: app.source, settings: docs.currentSettings() });
		navigator.clipboard?.writeText(location.href);
		shareLabel = 'Copied!';
		setTimeout(() => (shareLabel = 'Share'), 1200);
	}
</script>

<Sheet {open} {onclose} title="More">
	<div class="more-group">
		<div class="more-group-title">Views</div>
		{#each VIEWS as v (v.id)}
			<button class="more-row" class:active={ui.tab === v.id} onclick={() => pickView(v.id)}>
				<span class="more-ico">
					{#if v.id === 'matrix'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><rect x="3" y="3" width="18" height="18" rx="2" /><path
								d="M3 9h18M3 15h18M9 3v18M15 3v18"
							/></svg
						>
					{:else if v.id === 'validate'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path
								d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
							/><path d="m9 12 2 2 4-4" /></svg
						>
					{:else if v.id === 'history'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path
								d="M12 7v5l4 2"
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
							><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path
								d="M12 15V3"
							/></svg
						>
					{/if}
				</span>
				<span class="more-text">
					<span class="more-label">{v.label}</span>
					<span class="more-desc">{v.desc}</span>
				</span>
				<svg
					class="more-chev"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
				>
			</button>
		{/each}
	</div>

	<div class="more-group">
		<div class="more-group-title">Document</div>
		<DocControls variant="sheet" />

		<button class="more-row more-row-share" onclick={share}>
			<span class="more-ico">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4" /><path
						d="M12 2v13"
					/></svg
				>
			</span>
			<span class="more-label">{shareLabel}</span>
		</button>
	</div>

	<div class="more-group">
		<div class="more-group-title">Settings</div>
		<button class="more-row" onclick={() => ui.toggleTheme()}>
			<span class="more-ico">
				{#if ui.theme === 'dark'}
					<svg
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
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg
					>
				{/if}
			</span>
			<span class="more-label">Theme</span>
			<span class="more-trailing">{ui.theme === 'dark' ? 'Dark' : 'Light'}</span>
		</button>

		<button
			class="more-row"
			onclick={() => {
				onclose();
				onopendocs();
			}}
		>
			<span class="more-ico">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></svg
				>
			</span>
			<span class="more-text">
				<span class="more-label">DSL reference</span>
				<span class="more-desc">Models · methods · functions</span>
			</span>
			<svg
				class="more-chev"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
			>
		</button>

		<a class="more-row" href="{base}/mixer" onclick={onclose}>
			<span class="more-ico">
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
			</span>
			<span class="more-text">
				<span class="more-label">Mixer</span>
				<span class="more-desc">One color across every model · live sliders</span>
			</span>
			<svg
				class="more-chev"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
			>
		</a>

		<a class="more-row" href="{base}/models" onclick={onclose}>
			<span class="more-ico">
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
			</span>
			<span class="more-text">
				<span class="more-label">Color models &amp; systems</span>
				<span class="more-desc">Encyclopedia · 3D viewer · 100 spaces</span>
			</span>
			<svg
				class="more-chev"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg
			>
		</a>
	</div>
</Sheet>

<style>
	.more-group {
		margin-bottom: 14px;
	}
	.more-group:last-child {
		margin-bottom: 0;
	}
	.more-group-title {
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
		padding: 2px 4px 8px;
	}
	.more-row {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		text-align: left;
		padding: 11px 12px;
		min-height: 52px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		margin-bottom: 8px;
		font-size: 14px;
		text-decoration: none;
	}
	.more-row:last-child {
		margin-bottom: 0;
	}
	.more-row.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}
	.more-ico {
		display: inline-flex;
		flex-shrink: 0;
		color: var(--text-muted);
	}
	.more-row.active .more-ico {
		color: var(--accent);
	}
	.more-ico :global(svg) {
		width: 20px;
		height: 20px;
	}
	.more-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}
	.more-label {
		font-weight: 550;
	}
	.more-desc {
		font-size: 11.5px;
		color: var(--text-faint);
	}
	.more-trailing {
		margin-left: auto;
		font-size: 12.5px;
		color: var(--text-muted);
	}
	.more-chev {
		width: 18px;
		height: 18px;
		margin-left: auto;
		color: var(--text-faint);
		flex-shrink: 0;
	}
</style>
