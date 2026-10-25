<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { migrate } from '$lib/dsl/migrate';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const migration = $derived(migrate(app.source));
	let dismissedFor = $state<string | null>(null);
	const show = $derived(open || (!migration.unchanged && dismissedFor !== app.source));

	// The upgrade only edits statements in place, so old and new line up line for line.
	const rows = $derived.by(() => {
		const before = app.source.split('\n');
		const after = migration.source.split('\n');
		const notes = new Map<number, string[]>();
		for (const c of migration.changes) notes.set(c.line, [...(notes.get(c.line) ?? []), c.message]);
		return before
			.map((line, i) => ({
				n: i + 1,
				before: line,
				after: after[i] ?? '',
				notes: notes.get(i + 1) ?? []
			}))
			.filter((r) => r.before !== r.after);
	});

	function apply() {
		if (ui.sourceLocked) return;
		app.source = migration.source;
		open = false;
	}

	function dismiss() {
		dismissedFor = app.source;
		open = false;
	}
</script>

{#if show}
	<div class="upgrade" role="region" aria-label="Upgrade to the new DSL">
		{#if migration.unchanged}
			<div class="bar">
				<span>Nothing to upgrade: this script already uses the new DSL.</span>
				<button class="btn" onclick={() => (open = false)}>Close</button>
			</div>
		{:else}
			<div class="bar">
				<span>
					Written for the old DSL: {rows.length} line{rows.length === 1 ? '' : 's'} to upgrade{#if migration.leftovers.length},
						{migration.leftovers.length} need a hand fix{/if}.
				</span>
				<button class="btn" onclick={() => (open = !open)} aria-expanded={open}>
					{open ? 'Hide' : 'Review upgrade'}
				</button>
				<button class="btn btn-accent" onclick={apply} disabled={ui.sourceLocked}>Apply</button>
				<button class="btn" onclick={dismiss}>Dismiss</button>
			</div>
			{#if open}
				<div class="review scroll">
					{#if migration.leftovers.length}
						<ul class="leftovers">
							{#each migration.leftovers as l (l.line + l.message)}
								<li><span class="ln">line {l.line}</span>{l.message}</li>
							{/each}
						</ul>
					{/if}
					{#each rows as r (r.n)}
						<div class="row">
							<span class="ln">{r.n}</span>
							<code class="old">− {r.before.trim()}</code>
							<code class="new">+ {r.after.trim()}</code>
							{#if r.notes.length}<span class="why">{r.notes.join(' · ')}</span>{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{/if}

<style>
	.upgrade {
		border-bottom: 1px solid var(--border);
		background: var(--accent-soft);
		font-size: 12px;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		flex-wrap: wrap;
	}
	.bar span {
		flex: 1;
		min-width: 12rem;
	}
	.review {
		max-height: 40vh;
		overflow-y: auto;
		padding: 0 10px 8px;
	}
	.row {
		display: grid;
		grid-template-columns: 3ch 1fr;
		column-gap: 8px;
		padding: 4px 0;
		border-top: 1px solid var(--border);
	}
	.row code {
		grid-column: 2;
		white-space: pre-wrap;
		word-break: break-word;
		font-size: 11px;
	}
	.old {
		color: var(--text-muted);
		text-decoration: line-through;
	}
	.why {
		grid-column: 2;
		color: var(--text-muted);
		font-size: 11px;
	}
	.ln {
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
		margin-right: 6px;
	}
	.leftovers {
		margin: 6px 0;
		padding-left: 1.2em;
		color: var(--danger);
	}
</style>
