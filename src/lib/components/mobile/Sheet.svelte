<script lang="ts">
	/**
	 * Reusable mobile overlay sheet. `variant="bottom"` slides a rounded panel up
	 * from the bottom (auto height, capped, internal scroll); `variant="full"`
	 * covers the whole viewport (100dvh) for the editor. Backdrop tap and Escape
	 * close it; honours the bottom safe-area inset.
	 */
	import { fly, fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		open = false,
		title = '',
		variant = 'bottom',
		padded = true,
		onclose,
		children,
		headerRight
	}: {
		open?: boolean;
		title?: string;
		variant?: 'bottom' | 'full';
		padded?: boolean;
		onclose: () => void;
		children?: Snippet;
		headerRight?: Snippet;
	} = $props();

	function onKey(e: KeyboardEvent) {
		if (open && e.key === 'Escape') {
			e.stopPropagation();
			onclose();
		}
	}
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<div class="sheet-root {variant}" role="dialog" aria-modal="true" aria-label={title || 'Sheet'}>
		<button
			class="sheet-backdrop"
			transition:fade={{ duration: 150 }}
			onclick={onclose}
			aria-label="Close"
		></button>
		<div
			class="sheet-panel {variant}"
			transition:fly={{ y: variant === 'full' ? 48 : 360, duration: 220 }}
		>
			<header class="sheet-head">
				{#if variant === 'bottom'}<div class="sheet-grip"></div>{/if}
				<div class="sheet-head-row">
					<span class="sheet-title">{title}</span>
					<div class="sheet-head-right">
						{@render headerRight?.()}
						<button class="icon-btn" onclick={onclose} aria-label="Close">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg
							>
						</button>
					</div>
				</div>
			</header>
			<div class="sheet-body scroll" class:padded class:full={variant === 'full'}>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.sheet-root {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	.sheet-backdrop {
		position: absolute;
		inset: 0;
		border: none;
		padding: 0;
		margin: 0;
		background: rgba(8, 10, 14, 0.46);
		cursor: pointer;
	}
	.sheet-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		background: var(--surface);
		box-shadow: var(--shadow);
		min-height: 0;
	}
	.sheet-panel.bottom {
		max-height: 85dvh;
		border-radius: 18px 18px 0 0;
		border-top: 1px solid var(--border);
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
	.sheet-panel.full {
		height: 100dvh;
		border-radius: 0;
	}
	.sheet-head {
		flex-shrink: 0;
		padding: 0 6px 0 16px;
		border-bottom: 1px solid var(--border);
	}
	.sheet-panel.full .sheet-head {
		padding-top: env(safe-area-inset-top, 0);
	}
	.sheet-grip {
		width: 38px;
		height: 4px;
		border-radius: 99px;
		background: var(--border-strong);
		margin: 8px auto 2px;
	}
	.sheet-head-row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
	}
	.sheet-title {
		font-weight: 650;
		font-size: 15px;
		letter-spacing: -0.01em;
	}
	.sheet-head-right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.sheet-body {
		min-height: 0;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
	.sheet-body.padded {
		padding: 12px 16px calc(18px + env(safe-area-inset-bottom, 0));
	}
	.sheet-body.full {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
