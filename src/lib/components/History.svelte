<script lang="ts">
	/**
	 * History tab (CD-14) — checkpoint versions of the working copy and see what a
	 * change did across the whole derived system. A version is a frozen
	 * `{source, settings}` snapshot; nothing derived is stored. The diff re-derives
	 * both sides through the shared `deriveScheme()` spine and compares — so it can
	 * never drift from what the live studio renders.
	 *
	 * Headline-first: Contrast band crossings (the payoff — "Muted text AA → Fail"),
	 * then Palette (ΔE + OKLCH deltas), then Roles (re-target + dangling). The
	 * comparison is reactive: with the working copy on one side it doubles as a live
	 * diff-as-you-type against any checkpoint.
	 */
	import { app } from '$lib/state/app.svelte';
	import { docs } from '$lib/state/docs.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import type { SchemeVersion } from '$lib/persistence/documents';
	import {
		deriveSnapshot,
		diffSchemes,
		type Snapshot,
		type SchemeDiff,
		type ContrastDelta
	} from '$lib/scheme/diff';
	import { emptyRoles, DEFAULT_OPACITIES, type Roles } from '$lib/scheme/roles';
	import { wcagColor } from '$lib/analysis/wcag';
	import { toDiffCardSVG } from '$lib/export/diff-card';
	import { encodeHash } from '$lib/persistence/url-hash';

	const CURRENT = '__current__';

	let baseSel = $state<string>('');
	let compareSel = $state<string>(CURRENT);
	let snapLabel = $state('');
	let notice = $state('');
	let confirmId = $state<string | null>(null);
	let renamingId = $state<string | null>(null);
	let renameValue = $state('');

	// Keep base pointed at a real snapshot: default to the newest version, fall
	// back to the working copy when there are none / the selected one was deleted.
	$effect(() => {
		const ids = docs.versions.map((v) => v.id);
		if (baseSel !== CURRENT && !ids.includes(baseSel)) {
			baseSel = docs.versions.length ? docs.versions[docs.versions.length - 1].id : CURRENT;
		}
		if (compareSel !== CURRENT && !ids.includes(compareSel)) compareSel = CURRENT;
	});

	function flash(msg: string) {
		notice = msg;
		setTimeout(() => (notice = msg === notice ? '' : notice), 1600);
	}

	function rel(ts: number): string {
		const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
		if (s < 45) return 'just now';
		const m = Math.round(s / 60);
		if (m < 60) return `${m}m ago`;
		const h = Math.round(m / 60);
		if (h < 24) return `${h}h ago`;
		return `${Math.round(h / 24)}d ago`;
	}

	function settingsOf(v: SchemeVersion) {
		return {
			roles: v.settings?.roles ?? emptyRoles(),
			opacities: v.settings?.opacities ?? DEFAULT_OPACITIES
		};
	}

	function snapOf(sel: string): Snapshot {
		if (sel === CURRENT) {
			return { source: app.source, settings: { roles: app.roles, opacities: app.opacities } };
		}
		const v = docs.versions.find((x) => x.id === sel);
		if (!v) return { source: app.source, settings: { roles: app.roles, opacities: app.opacities } };
		return { source: v.source, settings: settingsOf(v) };
	}

	function labelOf(sel: string): string {
		if (sel === CURRENT) return 'Working copy';
		return docs.versions.find((v) => v.id === sel)?.label ?? 'Snapshot';
	}

	// Newest-first for the list & dropdowns; the stored array is oldest→newest.
	const ordered = $derived([...docs.versions].reverse());

	// The diff: re-derive both sides. Wrapped so a momentarily-invalid source can't
	// throw the whole tab. Tracks app.source/roles/opacities (working copy) + versions.
	const result = $derived.by((): { diff: SchemeDiff | null; error: string | null } => {
		try {
			const before = deriveSnapshot(snapOf(baseSel));
			const after = deriveSnapshot(snapOf(compareSel));
			return { diff: diffSchemes(before, after), error: null };
		} catch (e) {
			return { diff: null, error: e instanceof Error ? e.message : String(e) };
		}
	});
	// Bare bindings so the template narrows cleanly inside `{:else if diff}`.
	const diff = $derived(result.diff);
	const error = $derived(result.error);

	// Per-version swatch strips for the list. Keyed on `docs.versions` only (NOT
	// app.source) so typing in the editor doesn't re-derive every checkpoint.
	const versionSwatches = $derived.by(() => {
		const map = new Map<string, string[]>();
		for (const v of docs.versions) {
			try {
				const r = deriveSnapshot({ source: v.source, settings: settingsOf(v) });
				map.set(
					v.id,
					r.scheme.entries.slice(0, 10).map((e) => e.color.hex)
				);
			} catch {
				map.set(v.id, []);
			}
		}
		return map;
	});

	const contrastChanges = $derived(
		diff?.contrast.filter((c) => c.crossed || c.status !== 'unchanged') ?? []
	);
	const darkContrastChanges = $derived(
		diff?.darkContrast.filter((c) => c.crossed || c.status !== 'unchanged') ?? []
	);
	const paletteChanges = $derived(diff?.palette.filter((p) => p.status !== 'unchanged') ?? []);
	const roleChanges = $derived(diff?.roles.filter((r) => r.status !== 'unchanged') ?? []);

	const ROLE_LABEL: Record<keyof Roles, string> = {
		bg: 'Background',
		fg: 'Foreground',
		primary: 'Primary',
		secondary: 'Secondary',
		tertiary: 'Tertiary',
		accent: 'Accent',
		surface: 'Surface',
		border: 'Border',
		primaryFg: 'Primary text',
		secondaryFg: 'Secondary text',
		tertiaryFg: 'Tertiary text',
		accentFg: 'Accent text'
	};

	function fmtRatio(n?: number): string {
		return n == null ? '—' : n.toFixed(2);
	}
	function fmtDelta(n?: number, digits = 3): string {
		if (n == null) return '';
		const s = n.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '');
		return (n > 0 ? '+' : '') + s;
	}

	// ── actions ──
	function doSnapshot() {
		const v = docs.snapshot(snapLabel.trim() || undefined);
		snapLabel = '';
		if (v) {
			baseSel = v.id;
			compareSel = CURRENT;
			flash('Snapshot saved');
		}
	}
	function restore(id: string) {
		docs.restoreVersion(id);
		flash('Restored — previous state auto-saved');
	}
	function startRename(v: SchemeVersion) {
		renamingId = v.id;
		renameValue = v.label;
	}
	function commitRename() {
		if (renamingId) docs.renameVersion(renamingId, renameValue);
		renamingId = null;
	}
	function confirmDelete() {
		if (confirmId) {
			if (baseSel === confirmId) baseSel = CURRENT;
			if (compareSel === confirmId) compareSel = CURRENT;
			docs.deleteVersion(confirmId);
		}
		confirmId = null;
	}
	async function shareVersion(v: SchemeVersion) {
		const hash = await encodeHash({ source: v.source, settings: v.settings });
		const url = `${location.origin}${location.pathname}${location.search}${hash}`;
		await navigator.clipboard?.writeText(url);
		flash('Link copied');
	}

	function cardSVG(): string | null {
		if (!diff) return null;
		return toDiffCardSVG(diff, {
			beforeLabel: labelOf(baseSel),
			afterLabel: labelOf(compareSel),
			background: ui.theme === 'dark' ? '#0f1115' : '#fbfcfd'
		});
	}
	function downloadCard() {
		const svg = cardSVG();
		if (!svg) return;
		const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = 'chromatics-diff.svg';
		a.click();
		URL.revokeObjectURL(url);
		flash('Diff card downloaded');
	}
	async function copyCard() {
		const svg = cardSVG();
		if (!svg) return;
		await navigator.clipboard?.writeText(svg);
		flash('Diff card SVG copied');
	}
</script>

<div class="history scroll">
	<!-- Snapshot composer -->
	<section class="card snap-card">
		<div class="snap-row">
			<input
				class="snap-input"
				bind:value={snapLabel}
				placeholder="Label this snapshot (optional)"
				onkeydown={(e) => {
					if (e.key === 'Enter') doSnapshot();
				}}
				aria-label="Snapshot label"
			/>
			<button class="btn btn-accent" onclick={doSnapshot}>Snapshot</button>
		</div>
		<p class="snap-hint">
			A snapshot freezes the current source + settings. Diffs re-derive — nothing rendered is
			stored.
		</p>
	</section>

	{#if docs.versions.length === 0}
		<div class="empty">
			<strong>No snapshots yet.</strong>
			<span
				>Take a snapshot before a brand change, then compare to see every color, role and contrast
				pair that moved.</span
			>
		</div>
	{:else}
		<!-- Compare selector -->
		<section class="card">
			<div class="cmp-head">
				<label class="field">
					<span>Base</span>
					<select class="select" bind:value={baseSel} aria-label="Diff base">
						<option value={CURRENT}>Working copy</option>
						{#each ordered as v (v.id)}<option value={v.id}>{v.label}</option>{/each}
					</select>
				</label>
				<svg
					class="cmp-arrow"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg
				>
				<label class="field">
					<span>Compare</span>
					<select class="select" bind:value={compareSel} aria-label="Diff compare">
						<option value={CURRENT}>Working copy</option>
						{#each ordered as v (v.id)}<option value={v.id}>{v.label}</option>{/each}
					</select>
				</label>
				<div class="spacer"></div>
				<div class="card-actions">
					<button class="btn" onclick={downloadCard} disabled={!diff}>Download card</button>
					<button class="btn" onclick={copyCard} disabled={!diff}>Copy SVG</button>
				</div>
			</div>

			{#if error}
				<div class="diff-error">Can’t diff — a snapshot failed to evaluate ({error}).</div>
			{:else if diff}
				{@const s = diff.summary}
				{#if baseSel === compareSel}
					<div class="diff-empty">Pick two different snapshots to compare.</div>
				{:else if !s.changed}
					<div class="diff-empty">Identical — no colors, roles or contrast pairs changed.</div>
				{:else}
					<!-- Summary chips -->
					<div class="summary">
						{#if s.contrastRegressions}<span class="sum sum-bad"
								>{s.contrastRegressions} contrast regression{s.contrastRegressions === 1
									? ''
									: 's'}</span
							>{/if}
						{#if s.contrastImprovements}<span class="sum sum-good"
								>{s.contrastImprovements} contrast gain{s.contrastImprovements === 1
									? ''
									: 's'}</span
							>{/if}
						{#if s.colorsChanged}<span class="sum">{s.colorsChanged} changed</span>{/if}
						{#if s.colorsAdded}<span class="sum sum-good">{s.colorsAdded} added</span>{/if}
						{#if s.colorsRemoved}<span class="sum sum-bad">{s.colorsRemoved} removed</span>{/if}
						{#if s.rolesChanged}<span class="sum"
								>{s.rolesChanged} role{s.rolesChanged === 1 ? '' : 's'}</span
							>{/if}
						{#if s.maxDeltaE > 0}<span class="sum">max ΔE {s.maxDeltaE.toFixed(1)}</span>{/if}
					</div>

					<!-- Contrast (headline) -->
					{#if contrastChanges.length || darkContrastChanges.length}
						<div class="sec">
							<h4>Contrast{diff.hasDark ? ' · light' : ''}</h4>
							{#if contrastChanges.length}
								{@render contrastList(contrastChanges)}
							{:else}
								<div class="sec-empty">No contrast pairs changed.</div>
							{/if}
						</div>
						{#if diff.hasDark}
							<div class="sec">
								<h4>Contrast · dark</h4>
								{#if darkContrastChanges.length}
									{@render contrastList(darkContrastChanges)}
								{:else}
									<div class="sec-empty">No dark contrast pairs changed.</div>
								{/if}
							</div>
						{/if}
					{/if}

					<!-- Palette -->
					{#if paletteChanges.length}
						<div class="sec">
							<h4>Palette</h4>
							<div class="plist">
								{#each paletteChanges as p (p.name)}
									<div class="prow">
										<span class="sw-pair">
											{#if p.before}<i class="sw" style="background:{p.before}"></i>{:else}<i
													class="sw sw-none"
												></i>{/if}
											<span class="arr">→</span>
											{#if p.after}<i class="sw" style="background:{p.after}"></i>{:else}<i
													class="sw sw-none"
												></i>{/if}
										</span>
										<span class="pname">{p.name}</span>
										<span class="pstatus ps-{p.status}">{p.status}</span>
										{#if p.status === 'changed'}
											<span class="pmeta">ΔE {p.deltaE?.toFixed(1)}</span>
											<span class="pmeta dim"
												>L {fmtDelta(p.dL)} · C {fmtDelta(p.dC, 4)} · H {fmtDelta(p.dH, 1)}°</span
											>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Roles -->
					{#if roleChanges.length}
						<div class="sec">
							<h4>Roles</h4>
							<div class="rlist">
								{#each roleChanges as r (r.role)}
									<div class="rrow">
										<span class="rname">{ROLE_LABEL[r.role]}</span>
										<span class="rmap">
											<code>{r.before || '∅'}</code>
											<span class="arr">→</span>
											<code>{r.after || '∅'}</code>
										</span>
										<span class="pstatus ps-{r.status}">{r.status}</span>
										{#if r.dangling}<span class="dangling" title="Target color no longer exists"
												>dangling</span
											>{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}
			{/if}
			{#if notice}<div class="dc-note">{notice}</div>{/if}
		</section>

		<!-- Version list -->
		<section class="card">
			<div class="card-head">
				<h3>Snapshots</h3>
				<span class="count">{docs.versions.length}</span>
			</div>
			<div class="vlist">
				{#each ordered as v (v.id)}
					<div class="vrow" class:pinned={v.pinned}>
						<div class="vstrip">
							{#each versionSwatches.get(v.id) ?? [] as hex, i (i)}
								<i class="vsw" style="background:{hex}"></i>
							{/each}
						</div>
						<div class="vmain">
							{#if renamingId === v.id}
								<input
									class="vrename"
									bind:value={renameValue}
									onblur={commitRename}
									onkeydown={(e) => {
										if (e.key === 'Enter') commitRename();
										if (e.key === 'Escape') renamingId = null;
									}}
									aria-label="Rename snapshot"
								/>
							{:else}
								<button class="vlabel" onclick={() => startRename(v)} title="Rename"
									>{v.label}</button
								>
							{/if}
							<span class="vtime">{rel(v.createdAt)}{v.note ? ` · ${v.note}` : ''}</span>
						</div>
						<div class="vacts">
							<button
								class="ix"
								class:on={baseSel === v.id}
								title="Use as base"
								onclick={() => (baseSel = v.id)}>base</button
							>
							<button
								class="ix"
								class:on={compareSel === v.id}
								title="Use as compare"
								onclick={() => (compareSel = v.id)}>cmp</button
							>
							<button
								class="ic"
								class:on={v.pinned}
								title={v.pinned ? 'Unpin' : 'Pin (exempt from cap)'}
								aria-pressed={v.pinned}
								onclick={() => docs.pinVersion(v.id, !v.pinned)}
							>
								<svg
									viewBox="0 0 24 24"
									width="15"
									height="15"
									fill={v.pinned ? 'currentColor' : 'none'}
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M12 17v5" /><path d="M9 10.5V4h6v6.5l2 3.5H7l2-3.5Z" /></svg
								>
							</button>
							<button class="ic" title="Copy share link" onclick={() => shareVersion(v)}>
								<svg
									viewBox="0 0 24 24"
									width="15"
									height="15"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle
										cx="18"
										cy="19"
										r="3"
									/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg
								>
							</button>
							<button class="ic" title="Restore this snapshot" onclick={() => restore(v.id)}>
								<svg
									viewBox="0 0 24 24"
									width="15"
									height="15"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg
								>
							</button>
							<button
								class="ic ic-danger"
								title="Delete snapshot"
								onclick={() => (confirmId = v.id)}
							>
								<svg
									viewBox="0 0 24 24"
									width="15"
									height="15"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg
								>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

{#if confirmId}
	<div class="confirm-wrap">
		<button class="confirm-scrim" aria-label="Cancel" onclick={() => (confirmId = null)}></button>
		<div class="confirm" role="dialog" aria-modal="true" aria-label="Delete snapshot">
			<div class="confirm-title">Delete this snapshot?</div>
			<p class="confirm-text">This permanently removes the checkpoint. This can’t be undone.</p>
			<div class="confirm-actions">
				<button class="btn" onclick={() => (confirmId = null)}>Cancel</button>
				<button class="btn ic-danger-btn" onclick={confirmDelete}>Delete</button>
			</div>
		</div>
	</div>
{/if}

{#snippet contrastList(rows: ContrastDelta[])}
	<div class="clist">
		{#each rows as c (c.label)}
			<div class="crow" class:reg={c.direction === 'worse' && c.crossed}>
				<span class="cname">{c.label}{c.large ? ' (large)' : ''}</span>
				<span class="cratios">
					<span>{fmtRatio(c.before)}</span>
					<span class="arr">→</span>
					<span class:up={c.direction === 'better'} class:down={c.direction === 'worse'}
						>{fmtRatio(c.after)}</span
					>
				</span>
				<span class="cbands">
					{#if c.beforeLevel}<span class="band" style="--bc:{wcagColor(c.beforeLevel)}"
							>{c.beforeLevel}</span
						>{/if}
					{#if c.crossed}<span class="arr">→</span>{/if}
					{#if c.afterLevel && c.crossed}<span class="band" style="--bc:{wcagColor(c.afterLevel)}"
							>{c.afterLevel}</span
						>{/if}
				</span>
			</div>
		{/each}
	</div>
{/snippet}

<style>
	.history {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 14px;
		overflow-y: auto;
		height: 100%;
	}
	.card {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		padding: 14px;
	}
	.card-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
	}
	.card-head h3 {
		margin: 0;
		font-size: 13px;
		font-weight: 700;
	}
	.count {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-faint);
		background: var(--surface-2);
		border-radius: 99px;
		padding: 1px 8px;
	}

	.snap-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.snap-row {
		display: flex;
		gap: 8px;
	}
	.snap-input {
		flex: 1;
		font-size: 13px;
		padding: 7px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
	}
	.snap-hint {
		margin: 0;
		font-size: 11.5px;
		color: var(--text-faint);
	}

	.empty,
	.diff-empty,
	.diff-error,
	.sec-empty {
		font-size: 13px;
		color: var(--text-muted);
		padding: 12px 2px;
	}
	.empty {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 18px;
		border: 1px dashed var(--border);
		border-radius: 12px;
		text-align: center;
	}
	.diff-error {
		color: var(--danger);
	}

	.cmp-head {
		display: flex;
		align-items: flex-end;
		gap: 10px;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.field .select {
		max-width: 180px;
	}
	.cmp-arrow {
		width: 18px;
		height: 18px;
		color: var(--text-faint);
		margin-bottom: 7px;
	}
	.spacer {
		flex: 1;
	}
	.card-actions {
		display: flex;
		gap: 6px;
	}

	.summary {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 12px;
	}
	.sum {
		font-size: 11.5px;
		font-weight: 600;
		padding: 3px 9px;
		border-radius: 99px;
		background: var(--surface-2);
		color: var(--text-muted);
	}
	.sum-bad {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
	}
	.sum-good {
		background: color-mix(in srgb, #22c55e 18%, transparent);
		color: #15803d;
	}

	.sec {
		margin-top: 12px;
	}
	.sec h4 {
		margin: 0 0 6px;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--text-faint);
	}

	.clist,
	.plist,
	.rlist {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.crow,
	.prow,
	.rrow {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 8px;
		border-radius: 7px;
		background: var(--bg);
		font-size: 12.5px;
	}
	.crow.reg {
		background: color-mix(in srgb, var(--danger) 10%, var(--bg));
	}
	.cname,
	.pname,
	.rname {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cratios {
		display: inline-flex;
		gap: 6px;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12px;
		color: var(--text-muted);
		min-width: 96px;
		justify-content: flex-end;
	}
	.cratios .up {
		color: #15803d;
		font-weight: 600;
	}
	.cratios .down {
		color: var(--danger);
		font-weight: 600;
	}
	.cbands {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		min-width: 84px;
		justify-content: flex-end;
	}
	.band {
		font-size: 10.5px;
		font-weight: 700;
		padding: 1px 7px;
		border-radius: 99px;
		color: var(--bc);
		background: color-mix(in srgb, var(--bc) 16%, transparent);
	}
	.arr {
		color: var(--text-faint);
	}

	.sw-pair {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		flex-shrink: 0;
	}
	.sw {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		border: 1px solid var(--border);
		display: inline-block;
	}
	.sw-none {
		background: repeating-linear-gradient(
			45deg,
			var(--surface-2),
			var(--surface-2) 3px,
			transparent 3px,
			transparent 6px
		);
	}
	.pname {
		font-weight: 550;
	}
	.pstatus {
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--text-faint);
		flex-shrink: 0;
	}
	.ps-added {
		color: #15803d;
	}
	.ps-removed {
		color: var(--danger);
	}
	.ps-retargeted,
	.ps-changed {
		color: var(--accent);
	}
	.pmeta {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-muted);
		flex-shrink: 0;
	}
	.pmeta.dim {
		color: var(--text-faint);
	}

	.rmap {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
	}
	.rmap code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11.5px;
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: 5px;
	}
	.dangling {
		font-size: 10px;
		font-weight: 700;
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 14%, transparent);
		padding: 1px 6px;
		border-radius: 99px;
	}

	.vlist {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.vrow {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 9px;
		background: var(--bg);
	}
	.vrow.pinned {
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
	}
	.vstrip {
		display: inline-flex;
		border-radius: 5px;
		overflow: hidden;
		flex-shrink: 0;
		border: 1px solid var(--border);
	}
	.vsw {
		width: 12px;
		height: 22px;
		display: inline-block;
	}
	.vmain {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
		flex: 1;
	}
	.vlabel {
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.vlabel:hover {
		color: var(--accent);
	}
	.vrename {
		font-size: 13px;
		padding: 2px 6px;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text);
	}
	.vtime {
		font-size: 11px;
		color: var(--text-faint);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.vacts {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		flex-shrink: 0;
	}
	.ix {
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		padding: 3px 6px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--text-muted);
		cursor: pointer;
	}
	.ix.on {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
	}
	.ic {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 26px;
		border: 1px solid transparent;
		border-radius: 6px;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
	}
	.ic:hover {
		background: var(--surface-2);
		color: var(--text);
	}
	.ic.on {
		color: var(--accent);
	}
	.ic-danger:hover {
		color: var(--danger);
		background: color-mix(in srgb, var(--danger) 12%, transparent);
	}
	.dc-note {
		margin-top: 8px;
		font-size: 11.5px;
		color: var(--text-muted);
	}

	.confirm-wrap {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
	.confirm-scrim {
		position: absolute;
		inset: 0;
		border: none;
		background: rgba(0, 0, 0, 0.42);
		cursor: default;
	}
	.confirm {
		position: relative;
		z-index: 1;
		width: min(360px, 100%);
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: 14px;
		padding: 18px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
	}
	.confirm-title {
		font-size: 15px;
		font-weight: 700;
	}
	.confirm-text {
		margin: 8px 0 16px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-muted);
	}
	.confirm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	.ic-danger-btn {
		color: var(--danger);
		border-color: color-mix(in srgb, var(--danger) 40%, var(--border));
	}
</style>
