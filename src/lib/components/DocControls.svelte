<script lang="ts">
	/**
	 * Shared document controls for both shells — the single home for the
	 * save/switch/rename/new/duplicate/delete/import/export surface. `variant`
	 * picks a compact horizontal layout for the desktop top bar ('bar') or a
	 * stacked layout for the mobile More sheet ('sheet'). All logic lives in the
	 * `docs` store; this component is presentation only, so the two shells never
	 * drift.
	 */
	import { docs } from '$lib/state/docs.svelte';
	import { examples } from '../../routes/examples';

	let { variant = 'bar' }: { variant?: 'bar' | 'sheet' } = $props();

	let renaming = $state(false);
	let renameValue = $state('');
	let menuOpen = $state(false);
	let confirmId = $state<string | null>(null);
	let notice = $state('');
	let fileInput: HTMLInputElement;

	const exampleNames = examples.map((e) => e.name);
	const confirmName = $derived(
		confirmId ? (docs.index.find((d) => d.id === confirmId)?.name ?? 'Untitled') : ''
	);

	const chip = $derived(
		docs.storageStatus === 'quota'
			? { text: 'Storage full — export to free space', cls: 'err' }
			: docs.storageStatus === 'unavailable'
				? { text: 'Not saved — storage disabled', cls: 'err' }
				: docs.saveState === 'saving'
					? { text: 'Saving…', cls: 'muted' }
					: docs.saveState === 'saved'
						? { text: 'Saved', cls: 'ok' }
						: { text: '', cls: '' }
	);

	function rel(ts: number): string {
		const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
		if (s < 45) return 'now';
		const m = Math.round(s / 60);
		if (m < 60) return `${m}m`;
		const h = Math.round(m / 60);
		if (h < 24) return `${h}h`;
		return `${Math.round(h / 24)}d`;
	}
	function label(d: { name: string | null; updatedAt: number }): string {
		return `${d.name ?? 'Untitled'} · ${rel(d.updatedAt)}`;
	}

	function flash(msg: string) {
		notice = msg;
		setTimeout(() => (notice = msg === notice ? '' : notice), 1600);
	}

	function startRename() {
		renameValue = docs.activeName ?? '';
		renaming = true;
	}
	function commitRename() {
		if (!renaming) return;
		docs.rename(docs.activeId, renameValue);
		renaming = false;
	}
	function cancelRename() {
		renaming = false;
	}
	function autofocus(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	function switchDoc(e: Event) {
		docs.open((e.currentTarget as HTMLSelectElement).value);
	}
	function pickTemplate(e: Event) {
		const sel = e.currentTarget as HTMLSelectElement;
		if (sel.value) docs.newFromExample(sel.value);
		sel.value = '';
		menuOpen = false;
	}

	function requestDelete() {
		confirmId = docs.activeId;
		menuOpen = false;
	}
	function confirmDelete() {
		if (confirmId) docs.remove(confirmId);
		confirmId = null;
	}

	function exportLibrary() {
		const json = docs.exportLibrary();
		const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = 'chromatics-library.json';
		a.click();
		URL.revokeObjectURL(url);
		menuOpen = false;
		flash('Library exported');
	}
	async function onImportFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		menuOpen = false;
		if (!file) return;
		const n = docs.importLibrary(await file.text());
		flash(n ? `Imported ${n} document${n === 1 ? '' : 's'}` : 'Nothing to import');
	}

	function onKey(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		if (confirmId) confirmId = null;
		else if (menuOpen) menuOpen = false;
		else if (renaming) cancelRename();
	}
</script>

<svelte:window onkeydown={onKey} />

{#if variant === 'bar'}
	<div class="dc dc-bar">
		{#if renaming}
			<input
				class="dc-rename"
				bind:value={renameValue}
				use:autofocus
				onblur={commitRename}
				onkeydown={(e) => {
					if (e.key === 'Enter') commitRename();
				}}
				aria-label="Document name"
				placeholder="Untitled"
			/>
		{:else}
			<select
				class="select dc-switch"
				value={docs.activeId}
				onchange={switchDoc}
				aria-label="Switch document"
			>
				{#each docs.ordered as d (d.id)}
					<option value={d.id}>{label(d)}</option>
				{/each}
			</select>
			<button
				class="icon-btn"
				onclick={startRename}
				title="Rename document"
				aria-label="Rename document"
			>
				<svg
					viewBox="0 0 24 24"
					width="15"
					height="15"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg
				>
			</button>
		{/if}

		{#if chip.text}<span class="dc-chip dc-{chip.cls}">{chip.text}</span>{/if}

		<button class="btn" onclick={() => docs.saveNow()} disabled={docs.saveState !== 'saving'}
			>Save</button
		>
		<button class="btn" onclick={() => docs.newDoc()}>New</button>

		<div class="dc-menu-host">
			<button
				class="icon-btn"
				onclick={() => (menuOpen = !menuOpen)}
				title="Document actions"
				aria-label="Document actions"
				aria-expanded={menuOpen}
			>
				<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"
					><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle
						cx="19"
						cy="12"
						r="1.8"
					/></svg
				>
			</button>
			{#if menuOpen}
				<button class="dc-scrim" aria-label="Close menu" onclick={() => (menuOpen = false)}
				></button>
				<div class="dc-pop" role="menu" aria-label="Document actions">
					<div class="dc-pop-head">New from template</div>
					<select
						class="select dc-pop-select"
						onchange={pickTemplate}
						aria-label="New from template"
					>
						<option value="">Choose…</option>
						{#each exampleNames as n (n)}<option value={n}>{n}</option>{/each}
					</select>
					<div class="dc-pop-sep"></div>
					<button
						class="dc-pop-item"
						role="menuitem"
						onclick={() => {
							docs.duplicate(docs.activeId);
							menuOpen = false;
						}}>Duplicate</button
					>
					<button class="dc-pop-item dc-pop-danger" role="menuitem" onclick={requestDelete}
						>Delete…</button
					>
					<div class="dc-pop-sep"></div>
					<button class="dc-pop-item" role="menuitem" onclick={exportLibrary}
						>Export library…</button
					>
					<button class="dc-pop-item" role="menuitem" onclick={() => fileInput.click()}
						>Import library…</button
					>
				</div>
			{/if}
		</div>

		{#if docs.externalChange}
			<span class="dc-conflict">
				Changed in another tab
				<button class="dc-link" onclick={() => docs.reloadExternal()}>Reload</button>
				<button class="dc-link" onclick={() => docs.keepMine()}>Keep mine</button>
			</span>
		{/if}
		{#if notice}<span class="dc-note">{notice}</span>{/if}
	</div>
{:else}
	<div class="dc dc-sheet">
		<div class="dc-active">
			{#if renaming}
				<input
					class="dc-rename"
					bind:value={renameValue}
					use:autofocus
					onblur={commitRename}
					onkeydown={(e) => {
						if (e.key === 'Enter') commitRename();
					}}
					aria-label="Document name"
					placeholder="Untitled"
				/>
			{:else}
				<button class="dc-title" onclick={startRename} title="Rename">
					<span class="dc-title-text">{docs.activeName ?? 'Untitled'}</span>
					<svg
						viewBox="0 0 24 24"
						width="14"
						height="14"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg
					>
				</button>
			{/if}
			{#if chip.text}<span class="dc-chip dc-{chip.cls}">{chip.text}</span>{/if}
		</div>

		<div class="dc-row-actions">
			<button class="btn" onclick={() => docs.saveNow()} disabled={docs.saveState !== 'saving'}
				>Save</button
			>
			<button class="btn" onclick={() => docs.newDoc()}>New</button>
			<button class="btn" onclick={() => docs.duplicate(docs.activeId)}>Duplicate</button>
			<button class="btn dc-del" onclick={requestDelete}>Delete…</button>
		</div>

		{#if docs.externalChange}
			<div class="dc-conflict dc-conflict-block">
				Changed in another tab.
				<button class="dc-link" onclick={() => docs.reloadExternal()}>Reload</button>
				<button class="dc-link" onclick={() => docs.keepMine()}>Keep mine</button>
			</div>
		{/if}

		<div class="dc-list">
			{#each docs.ordered as d (d.id)}
				<button
					class="dc-list-row"
					class:active={d.id === docs.activeId}
					onclick={() => docs.open(d.id)}
				>
					<span class="dc-list-name">{d.name ?? 'Untitled'}</span>
					<span class="dc-list-time">{rel(d.updatedAt)}</span>
				</button>
			{/each}
		</div>

		<label class="dc-field">
			<span>New from template</span>
			<select class="select" onchange={pickTemplate} aria-label="New from template">
				<option value="">Choose…</option>
				{#each exampleNames as n (n)}<option value={n}>{n}</option>{/each}
			</select>
		</label>

		<div class="dc-row-actions">
			<button class="btn" onclick={exportLibrary}>Export library…</button>
			<button class="btn" onclick={() => fileInput.click()}>Import library…</button>
		</div>
		{#if notice}<div class="dc-note">{notice}</div>{/if}
	</div>
{/if}

<input
	bind:this={fileInput}
	type="file"
	accept="application/json,.json"
	onchange={onImportFile}
	hidden
/>

{#if confirmId}
	<div class="dc-confirm-wrap">
		<button class="dc-confirm-scrim" aria-label="Cancel delete" onclick={() => (confirmId = null)}
		></button>
		<div class="dc-confirm" role="dialog" aria-modal="true" aria-label="Confirm delete">
			<div class="dc-confirm-title">Delete “{confirmName}”?</div>
			<p class="dc-confirm-text">This permanently deletes the document. This can’t be undone.</p>
			<div class="dc-confirm-actions">
				<button class="btn" onclick={() => (confirmId = null)}>Cancel</button>
				<button class="btn dc-del" onclick={confirmDelete}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dc-bar {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dc-switch {
		max-width: 200px;
	}
	.dc-rename {
		font-size: 13px;
		padding: 4px 8px;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
		min-width: 140px;
	}
	.dc-chip {
		font-size: 11px;
		font-weight: 600;
		padding: 2px 8px;
		border-radius: 99px;
		white-space: nowrap;
	}
	.dc-ok {
		color: var(--text-faint);
	}
	.dc-muted {
		color: var(--text-muted);
	}
	.dc-err {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 14%, transparent);
	}

	.dc-menu-host {
		position: relative;
		display: inline-flex;
	}
	.dc-scrim {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: transparent;
		border: none;
		cursor: default;
	}
	.dc-pop {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		z-index: 50;
		min-width: 196px;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: 10px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
	}
	.dc-pop-head {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-faint);
		padding: 4px 6px 2px;
	}
	.dc-pop-select {
		width: 100%;
		margin-bottom: 2px;
	}
	.dc-pop-sep {
		height: 1px;
		background: var(--border);
		margin: 4px 0;
	}
	.dc-pop-item {
		text-align: left;
		font-size: 13px;
		padding: 7px 8px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--text);
		cursor: pointer;
	}
	.dc-pop-item:hover {
		background: var(--surface-2);
	}
	.dc-pop-danger {
		color: var(--danger);
	}

	.dc-del {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 40%, var(--border));
	}
	.dc-del:hover {
		background: color-mix(in srgb, var(--danger) 12%, transparent);
		border-color: var(--danger);
	}

	.dc-conflict {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 11.5px;
		color: var(--danger);
	}
	.dc-conflict-block {
		padding: 8px 10px;
		border: 1px solid color-mix(in srgb, var(--danger) 40%, var(--border));
		border-radius: 8px;
		background: color-mix(in srgb, var(--danger) 8%, transparent);
	}
	.dc-link {
		background: none;
		border: none;
		color: var(--accent);
		font-weight: 600;
		font-size: inherit;
		cursor: pointer;
		padding: 0 2px;
		text-decoration: underline;
	}
	.dc-note {
		font-size: 11.5px;
		color: var(--text-muted);
	}

	/* ── sheet variant ── */
	.dc-sheet {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.dc-active {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.dc-title {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		text-align: left;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 9px 12px;
		color: var(--text);
		cursor: pointer;
	}
	.dc-title-text {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
	}
	.dc-title svg {
		color: var(--text-faint);
		flex-shrink: 0;
	}
	.dc-row-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.dc-row-actions .btn {
		flex: 1;
		min-width: 90px;
	}
	.dc-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 240px;
		overflow-y: auto;
	}
	.dc-list-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 9px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		font-size: 13.5px;
	}
	.dc-list-row.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}
	.dc-list-name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 550;
	}
	.dc-list-time {
		flex-shrink: 0;
		font-size: 11px;
		color: var(--text-faint);
	}
	.dc-field {
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-faint);
	}

	/* ── confirm dialog ── */
	.dc-confirm-wrap {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.dc-confirm-scrim {
		position: absolute;
		inset: 0;
		border: none;
		background: rgba(0, 0, 0, 0.42);
		cursor: default;
	}
	.dc-confirm {
		position: relative;
		z-index: 1;
		width: min(360px, 100%);
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: 14px;
		padding: 18px 18px 16px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
	}
	.dc-confirm-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text);
	}
	.dc-confirm-text {
		margin: 8px 0 16px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-muted);
	}
	.dc-confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
</style>
