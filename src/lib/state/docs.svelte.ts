/**
 * The active-document store. Wraps the pure `persistence/documents` layer in
 * Svelte 5 reactivity and owns the autosave lifecycle.
 *
 * Model: there is no loose "current source". One Document is always active; its
 * `source` + per-doc settings (light/dark role overrides, opacities, CVD,
 * fg-opacity) live in the `app`
 * store (so every existing $derived chain is untouched), and a single debounced
 * effect writes them back to that document's own `chromatics:doc:<id>` slot.
 * Opening another document can never clobber the one you were editing.
 *
 * The autosave effect is gated behind `hydrated` so initialization (seed → migrate
 * → open) never persists a transient state — this also fixes the old
 * seed-then-effect race.
 */
import { app } from './app.svelte';
import { examples } from '../../routes/examples';
import * as store from '$lib/persistence/documents';
import { DOC_SCHEMA_VERSION, capVersions, newVersionId } from '$lib/persistence/documents';
import type {
	DocEnvelope,
	DocIndexEntry,
	DocSettings,
	SchemeVersion,
	WriteResult
} from '$lib/persistence/documents';
import { debounce } from '$lib/util/debounce';

const SAVE_DEBOUNCE_MS = 500;

/** A readable default label for a snapshot, e.g. "Jun 30, 2:45 PM". */
function defaultVersionLabel(at: number): string {
	try {
		return new Date(at).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	} catch {
		return 'Snapshot';
	}
}

/** Capture the per-doc options currently live in the app store. */
function snapshotSettings(): DocSettings {
	return app.settings();
}

/** Push a document's saved options back into the app store (defaulting holes). */
function applySettings(s: DocSettings | undefined): void {
	app.applySettings(s);
}

/** Serialized {source, settings} — the unit of "has this doc changed?". */
function snapshotKey(): string {
	return JSON.stringify({ source: app.source, settings: snapshotSettings() });
}

export class DocStore {
	/** Recency cache for the switcher (source-less). */
	index = $state<DocIndexEntry[]>([]);
	activeId = $state('');
	hydrated = $state(false);
	storageStatus = $state<'ok' | 'quota' | 'unavailable'>('ok');
	/** The active doc was changed in another tab — surfaced as a chip. */
	externalChange = $state(false);

	/** Last value persisted to the active doc; the dirty/idempotency baseline. */
	baseline = $state('');
	/** Checkpointed versions of the active doc (CD-14), newest appended last. */
	versions = $state<SchemeVersion[]>([]);
	/** In-memory copy of the active envelope (name/origin/createdAt/exampleId). */
	activeEnv: DocEnvelope | null = null;

	#queueSave = debounce(() => this.#persistActive(), SAVE_DEBOUNCE_MS);
	#stopEffect: (() => void) | null = null;
	#onVisibility = () => {
		if (typeof document !== 'undefined' && document.visibilityState === 'hidden') this.flush();
	};

	active = $derived(this.index.find((e) => e.id === this.activeId) ?? null);
	activeName = $derived(this.active?.name ?? null);
	/** Documents newest-first, for the switcher. */
	ordered = $derived([...this.index].sort((a, b) => b.updatedAt - a.updatedAt));
	dirty = $derived(this.hydrated && snapshotKey() !== this.baseline);
	saveState = $derived(!this.hydrated ? 'idle' : this.dirty ? 'saving' : 'saved');

	/** Run once from onMount (browser only). */
	init(): void {
		if (this.hydrated) return;
		const seed = examples[0]?.source ?? '';
		const { activeId } = store.migrate(seed);
		this.index = store.listDocs();

		const openId = activeId && store.readDoc(activeId) ? activeId : (this.ordered[0]?.id ?? '');
		const env = openId ? store.readDoc(openId) : null;
		if (env) this.#applyDoc(env);
		else this.#createAndOpen({ origin: 'blank', source: '' });

		this.#stopEffect = $effect.root(() => {
			$effect(() => {
				const key = snapshotKey(); // track source + settings
				if (!this.hydrated) return;
				if (key === this.baseline) return;
				this.#queueSave();
			});
		});

		if (typeof window !== 'undefined') {
			window.addEventListener('pagehide', this.flush);
			window.addEventListener('storage', this.#onStorage);
			document.addEventListener('visibilitychange', this.#onVisibility);
		}

		this.hydrated = true;
	}

	/** Open a decoded share-link as a brand-new document (never pollutes a slot). */
	openShared(source: string, settings?: DocSettings): void {
		if (!this.hydrated || !source.trim()) return;
		this.flush();
		this.#createAndOpen({ origin: 'shared', source, settings });
	}

	/** The per-doc settings currently live in the app store (for share links). */
	currentSettings(): DocSettings {
		return snapshotSettings();
	}

	// ── document lifecycle ─────────────────────────────────────────────────────

	newDoc(): void {
		this.flush();
		this.#createAndOpen({ origin: 'blank', source: '' });
	}

	newFromExample(name: string): void {
		const ex = examples.find((e) => e.name === name);
		if (!ex) return;
		this.flush();
		this.#createAndOpen({
			origin: 'example',
			source: ex.source,
			name: ex.name,
			exampleId: ex.name
		});
	}

	open(id: string): void {
		if (id === this.activeId) return;
		this.flush();
		const env = store.readDoc(id);
		if (env) this.#applyDoc(env);
	}

	rename(id: string, name: string): void {
		const trimmed = name.trim();
		const next = trimmed === '' ? null : trimmed;
		const env = id === this.activeId && this.activeEnv ? this.activeEnv : store.readDoc(id);
		if (!env || env.name === next) return;
		const updated = { ...env, name: next, updatedAt: Date.now() };
		this.#reportWrite(store.writeDoc(updated));
		if (id === this.activeId) this.activeEnv = updated;
		this.index = store.listDocs();
	}

	duplicate(id: string): void {
		this.flush();
		const env = store.readDoc(id);
		if (!env) return;
		const copy = store.makeEnvelope({
			name: (env.name ?? 'Untitled') + ' copy',
			source: env.source,
			origin: 'imported',
			settings: env.settings
		});
		this.#reportWrite(store.writeDoc(copy));
		this.index = store.listDocs();
		this.#applyDoc(copy);
	}

	/** Hard delete (UI confirms first). Picks a new active or seeds a blank. */
	remove(id: string): void {
		const wasActive = id === this.activeId;
		if (wasActive) this.#queueSave.cancel();
		store.removeDoc(id);
		this.index = store.listDocs();
		if (!wasActive) return;
		const next = this.ordered[0];
		const env = next ? store.readDoc(next.id) : null;
		if (env) this.#applyDoc(env);
		else this.#createAndOpen({ origin: 'blank', source: '' });
	}

	/** Explicit Save — persist immediately if there is anything pending. */
	saveNow(): void {
		if (!this.dirty) return;
		this.#queueSave.cancel();
		this.#persistActive();
	}

	/** Persist pending edits now (used before switching docs and on page hide). */
	flush = (): void => {
		this.#queueSave.cancel();
		if (this.dirty) this.#persistActive();
	};

	// ── cross-tab conflict ─────────────────────────────────────────────────────

	reloadExternal(): void {
		const env = store.readDoc(this.activeId);
		if (env) this.#applyDoc(env);
		this.externalChange = false;
	}

	keepMine(): void {
		this.externalChange = false;
		this.#persistActive();
	}

	// ── versions (CD-14) ─────────────────────────────────────────────────────────

	/** Capture the live `{source, settings}` as a SchemeVersion (not yet stored). */
	#buildVersion(label?: string, note?: string, parentId?: string): SchemeVersion {
		const at = Date.now();
		return {
			id: newVersionId(),
			label: label?.trim() || defaultVersionLabel(at),
			note: note?.trim() || undefined,
			source: app.source,
			settings: snapshotSettings(),
			createdAt: at,
			parentId
		};
	}

	/** Checkpoint the current working copy. Also flushes live edits to the doc. */
	snapshot(label?: string, note?: string): SchemeVersion | null {
		if (!this.hydrated || !this.activeEnv) return null;
		const v = this.#buildVersion(label, note);
		this.#commitVersions(capVersions([...this.versions, v]));
		return v;
	}

	/**
	 * Restore a version's `{source, settings}` into the working copy. Non-destructive:
	 * the current state is auto-snapshotted first, so a restore is always undoable.
	 */
	restoreVersion(id: string): void {
		const target = this.versions.find((v) => v.id === id);
		if (!target || !this.activeEnv) return;
		// Auto-snapshot the pre-restore state (built from current app BEFORE we mutate).
		const auto = this.#buildVersion(
			'Before restore',
			`Auto-saved before restoring “${target.label}”`
		);
		const withAuto = capVersions([...this.versions, auto]);
		// Apply the restored snapshot, then persist source+settings+versions together.
		app.source = target.source;
		applySettings(target.settings);
		this.#commitVersions(withAuto);
	}

	pinVersion(id: string, pinned: boolean): void {
		this.#commitVersions(this.versions.map((v) => (v.id === id ? { ...v, pinned } : v)));
	}

	renameVersion(id: string, label: string): void {
		const trimmed = label.trim();
		this.#commitVersions(
			this.versions.map((v) =>
				v.id === id ? { ...v, label: trimmed || defaultVersionLabel(v.createdAt) } : v
			)
		);
	}

	setVersionNote(id: string, note: string): void {
		const trimmed = note.trim();
		this.#commitVersions(
			this.versions.map((v) => (v.id === id ? { ...v, note: trimmed || undefined } : v))
		);
	}

	deleteVersion(id: string): void {
		this.#commitVersions(this.versions.filter((v) => v.id !== id));
	}

	/**
	 * Persist a new versions array onto the active doc, alongside the live
	 * source+settings (so a version op also saves pending edits). Degrades under
	 * quota by dropping the oldest UNPINNED versions and retrying, so pinned
	 * checkpoints and the user's source are never lost to storage pressure.
	 */
	#commitVersions(versions: SchemeVersion[]): void {
		if (!this.activeEnv) return;
		const settings = snapshotSettings();
		let next = versions;
		let res: WriteResult;
		// Try, then shed oldest unpinned on quota until it fits or nothing's left to drop.
		for (;;) {
			const env: DocEnvelope = {
				...this.activeEnv,
				source: app.source,
				settings,
				versions: next.length ? next : undefined,
				updatedAt: Date.now(),
				schemaVersion: DOC_SCHEMA_VERSION
			};
			res = store.writeDoc(env);
			if (res.ok) {
				this.activeEnv = env;
				this.versions = next;
				this.index = store.listDocs();
				this.baseline = JSON.stringify({ source: env.source, settings });
				this.#reportWrite(res);
				return;
			}
			const droppable = next.filter((v) => !v.pinned).sort((a, b) => a.createdAt - b.createdAt)[0];
			if (res.reason !== 'quota' || !droppable) break;
			next = next.filter((v) => v.id !== droppable.id);
		}
		this.#reportWrite(res);
	}

	// ── library backup ─────────────────────────────────────────────────────────

	exportLibrary(): string {
		this.flush();
		return store.exportLibrary();
	}

	importLibrary(json: string): number {
		const { added, firstId } = store.importLibrary(json);
		this.index = store.listDocs();
		if (firstId) this.open(firstId);
		return added;
	}

	// ── internals ──────────────────────────────────────────────────────────────

	#createAndOpen(init: {
		name?: string | null;
		source?: string;
		origin?: store.DocOrigin;
		exampleId?: string;
		settings?: DocSettings;
	}): void {
		const env = store.makeEnvelope(init);
		this.#reportWrite(store.writeDoc(env));
		this.index = store.listDocs();
		this.#applyDoc(env);
	}

	#applyDoc(env: DocEnvelope): void {
		this.activeEnv = env;
		this.activeId = env.id;
		this.versions = env.versions ?? [];
		app.source = env.source;
		applySettings(env.settings);
		this.baseline = snapshotKey();
		store.writeActive(env.id);
		this.externalChange = false;
	}

	#persistActive(): void {
		if (!this.activeEnv) return;
		const settings = snapshotSettings();
		const env: DocEnvelope = {
			...this.activeEnv,
			source: app.source,
			settings,
			updatedAt: Date.now(),
			schemaVersion: DOC_SCHEMA_VERSION
		};
		const res = store.writeDoc(env);
		this.#reportWrite(res);
		if (!res.ok) return;
		this.activeEnv = env;
		this.index = store.listDocs();
		this.baseline = JSON.stringify({ source: env.source, settings });
	}

	#reportWrite(res: WriteResult): void {
		this.storageStatus = res.ok ? 'ok' : res.reason;
	}

	#onStorage = (e: StorageEvent): void => {
		if (!e.key) return;
		if (e.key === 'chromatics:doc:' + this.activeId) this.externalChange = true;
		if (e.key === 'chromatics:index' || e.key.startsWith('chromatics:doc:')) {
			this.index = store.listDocs();
		}
	};
}

export const docs = new DocStore();
