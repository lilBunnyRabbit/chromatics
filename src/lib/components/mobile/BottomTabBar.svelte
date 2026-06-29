<script lang="ts">
	/**
	 * Five-slot bottom navigation. Four primary analysis destinations plus a
	 * "More" slot that opens the overflow sheet (Matrix / 3D Explore / Export +
	 * app actions). "More" reads active whenever the live tab is an overflow tab.
	 */
	import type { Tab } from '$lib/state/ui.svelte';

	let {
		current,
		onselect,
		onmore,
		moreActive
	}: {
		current: Tab;
		onselect: (t: Tab) => void;
		onmore: () => void;
		moreActive: boolean;
	} = $props();

	const PRIMARY: { id: Tab; label: string }[] = [
		{ id: 'inspector', label: 'Palette' },
		{ id: 'studio', label: 'Studio' },
		{ id: 'preview', label: 'Preview' },
		{ id: 'validate', label: 'Validate' }
	];
</script>

<nav class="tabbar" aria-label="Primary">
	{#each PRIMARY as t (t.id)}
		<button
			class="tab"
			class:active={current === t.id}
			aria-current={current === t.id ? 'page' : undefined}
			onclick={() => onselect(t.id)}
		>
			<span class="tab-ico">
				{#if t.id === 'inspector'}
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
				{:else if t.id === 'studio'}
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="21" y1="5" x2="14" y2="5" /><line x1="10" y1="5" x2="3" y2="5" /><line
							x1="21"
							y1="12"
							x2="12"
							y2="12"
						/><line x1="8" y1="12" x2="3" y2="12" /><line x1="21" y1="19" x2="16" y2="19" /><line
							x1="12"
							y1="19"
							x2="3"
							y2="19"
						/><line x1="14" y1="3" x2="14" y2="7" /><line x1="8" y1="10" x2="8" y2="14" /><line
							x1="16"
							y1="17"
							x2="16"
							y2="21"
						/></svg
					>
				{:else if t.id === 'preview'}
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
				{:else}
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
				{/if}
			</span>
			<span class="tab-label">{t.label}</span>
		</button>
	{/each}

	<button class="tab" class:active={moreActive} onclick={onmore} aria-label="More">
		<span class="tab-ico">
			<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"
				><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle
					cx="19"
					cy="12"
					r="1.7"
				/></svg
			>
		</span>
		<span class="tab-label">More</span>
	</button>
</nav>

<style>
	.tabbar {
		flex-shrink: 0;
		display: flex;
		align-items: stretch;
		border-top: 1px solid var(--border);
		background: var(--surface);
		padding-bottom: env(safe-area-inset-bottom, 0);
		box-shadow: 0 -1px 0 color-mix(in srgb, var(--border) 60%, transparent);
	}
	.tab {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 8px 2px 7px;
		min-height: 54px;
		border: none;
		background: transparent;
		color: var(--text-faint);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: color 0.12s;
	}
	.tab.active {
		color: var(--accent);
	}
	.tab-ico {
		display: inline-flex;
	}
	.tab-ico :global(svg) {
		width: 22px;
		height: 22px;
	}
	.tab-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.01em;
	}
</style>
