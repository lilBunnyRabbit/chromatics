/**
 * The active-document store. Wraps the pure `persistence/documents` layer in
 * Svelte 5 reactivity and owns the autosave lifecycle.
 *
 * Model: there is no loose "current source". One Document is always active; its
 * `source` + per-doc settings (roles/opacities/CVD/fg-opacity) live in the `app`
 * store (so every existing $derived chain is untouched), and a single debounced
 * effect writes them back to that document's own `chromatics:doc:<id>` slot.
 * Opening another document can never clobber the one you were editing.
 *
 * The autosave effect is gated behind `hydrated` so initialization (seed → migrate
 * → open) never persists a transient state — this also fixes the old
 * seed-then-effect race.
 */
import { app } from './app.svelte';
import { emptyRoles, DEFAULT_OPACITIES } from '$lib/scheme/roles';
import { examples } from '../../routes/examples';
import * as store from '$lib/persistence/documents';
import { DOC_SCHEMA_VERSION } from '$lib/persistence/documents';
import type {
	DocEnvelope,
	DocIndexEntry,
	DocSettings,
	WriteResult
} from '$lib/persistence/documents';
import { debounce } from '$lib/util/debounce';

const SAVE_DEBOUNCE_MS = 500;

/** Capture the per-doc options currently live in the app store. */
function snapshotSettings(): DocSettings {
	return {
		roles: { ...app.roles },
		opacities: { ...app.opacities },
		visionSim: app.visionSim,
		fgOpacity: app.fgOpacity
	};
}

/** Push a document's saved options back into the app store (defaulting holes). */
function applySettings(s: DocSettings | undefined): void {
	app.roles = { ...emptyRoles(), ...(s?.roles ?? {}) };
	app.opacities = { ...DEFAULT_OPACITIES, ...(s?.opacities ?? {}) };
	app.visionSim = s?.visionSim ?? 'none';
	app.fgOpacity = typeof s?.fgOpacity === 'number' ? s.fgOpacity : 100;
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
	openShared(source: string): void {
		if (!this.hydrated || !source.trim()) return;
		this.flush();
		this.#createAndOpen({ origin: 'shared', source });
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
