/**
 * Document store — the per-document persistence layer (client-only, Svelte-free,
 * unit-testable). Each document is an envelope keyed by a stable `id`, never by
 * name, so renaming/duplicate-names cost nothing and editing one document can
 * never clobber another. A small denormalized index drives the picker without
 * loading every source; it is a rebuildable cache, not the source of truth.
 *
 * Keys
 *   chromatics:doc:<id>  → one DocEnvelope (the per-doc source of truth)
 *   chromatics:index     → DocIndexEntry[] (source-less; recency-sortable cache)
 *   chromatics:active    → the active document id (raw string)
 *   chromatics:schema    → migration marker ("1")
 *
 * Legacy keys (read once by migrate(), then left in place as a safety copy):
 *   chromatics:last          → the old single autosave buffer
 *   chromatics:scheme:<name> → the old named schemes
 *
 * Orthogonal & untouched: chromatics:ui, chromatics:theme, chromatics:welcomed,
 * and share-links (location.hash, see url-hash.ts).
 */
import type { Roles, Opacities } from '$lib/scheme/roles';
import type { VisionSimulation } from '$lib/analysis/cvd';

export const DOC_SCHEMA_VERSION = 1;

const DOC_PREFIX = 'chromatics:doc:';
const INDEX_KEY = 'chromatics:index';
const ACTIVE_KEY = 'chromatics:active';
const SCHEMA_KEY = 'chromatics:schema';
const LEGACY_LAST = 'chromatics:last';
const LEGACY_SCHEME_PREFIX = 'chromatics:scheme:';

export type DocOrigin = 'blank' | 'example' | 'imported' | 'shared';

/** Per-document view options (Preview / Studio / Styleguide), saved with the doc. */
export interface DocSettings {
	roles: Roles;
	opacities: Opacities;
	visionSim: VisionSimulation;
	fgOpacity: number;
}

export interface DocEnvelope {
	id: string;
	/** Display name; `null` = Untitled. Not unique — `id` is the key. */
	name: string | null;
	source: string;
	origin: DocOrigin;
	/** Example name when origin === 'example'. */
	exampleId?: string;
	settings?: DocSettings;
	createdAt: number;
	updatedAt: number;
	schemaVersion: number;
}

/** The source-less row stored in the index and shown in the switcher. */
export interface DocIndexEntry {
	id: string;
	name: string | null;
	origin: DocOrigin;
	updatedAt: number;
	bytes: number;
}

export type WriteResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' };

// ── low-level storage access (guarded; works in browser + bun:test) ──────────

function store(): Storage | null {
	try {
		const s = (globalThis as { localStorage?: Storage }).localStorage;
		return s ?? null;
	} catch {
		return null;
	}
}

function readRaw(key: string): string | null {
	const s = store();
	if (!s) return null;
	try {
		return s.getItem(key);
	} catch {
		return null;
	}
}

function isQuota(e: unknown): boolean {
	return (
		!!e &&
		typeof e === 'object' &&
		('name' in e
			? (e as { name?: string }).name === 'QuotaExceededError' ||
				(e as { name?: string }).name === 'NS_ERROR_DOM_QUOTA_REACHED'
			: false)
	);
}

function writeRaw(key: string, value: string): WriteResult {
	const s = store();
	if (!s) return { ok: false, reason: 'unavailable' };
	try {
		s.setItem(key, value);
		return { ok: true };
	} catch (e) {
		return { ok: false, reason: isQuota(e) ? 'quota' : 'unavailable' };
	}
}

function removeRaw(key: string): void {
	const s = store();
	if (!s) return;
	try {
		s.removeItem(key);
	} catch {
		/* ignore */
	}
}

function byteLen(s: string): number {
	try {
		return new TextEncoder().encode(s).length;
	} catch {
		return s.length;
	}
}

// ── ids ──────────────────────────────────────────────────────────────────────

export function newId(): string {
	// Sortable-ish prefix + entropy; collisions across a single user are nil.
	return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── envelope <-> index ───────────────────────────────────────────────────────

export function entryFromEnvelope(env: DocEnvelope): DocIndexEntry {
	return {
		id: env.id,
		name: env.name,
		origin: env.origin,
		updatedAt: env.updatedAt,
		bytes: byteLen(env.source)
	};
}

/** Build a fresh envelope with defaulted timestamps/version. */
export function makeEnvelope(init: {
	name?: string | null;
	source?: string;
	origin?: DocOrigin;
	exampleId?: string;
	settings?: DocSettings;
	at?: number;
}): DocEnvelope {
	const at = init.at ?? Date.now();
	return {
		id: newId(),
		name: init.name ?? null,
		source: init.source ?? '',
		origin: init.origin ?? 'blank',
		exampleId: init.exampleId,
		settings: init.settings,
		createdAt: at,
		updatedAt: at,
		schemaVersion: DOC_SCHEMA_VERSION
	};
}

// ── index ────────────────────────────────────────────────────────────────────

export function readIndex(): DocIndexEntry[] {
	const raw = readRaw(INDEX_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as DocIndexEntry[]) : [];
	} catch {
		return [];
	}
}

export function writeIndex(entries: DocIndexEntry[]): WriteResult {
	return writeRaw(INDEX_KEY, JSON.stringify(entries));
}

/** Scan every chromatics:doc:* key and reconstruct the index (self-healing). */
export function rebuildIndex(): DocIndexEntry[] {
	const s = store();
	const entries: DocIndexEntry[] = [];
	if (s) {
		for (let i = 0; i < s.length; i++) {
			const k = s.key(i);
			if (!k || !k.startsWith(DOC_PREFIX)) continue;
			const env = readDoc(k.slice(DOC_PREFIX.length));
			if (env) entries.push(entryFromEnvelope(env));
		}
	}
	entries.sort((a, b) => b.updatedAt - a.updatedAt);
	writeIndex(entries);
	return entries;
}

/** Index, healing it from the doc keys if it is missing or empty-but-docs-exist. */
export function listDocs(): DocIndexEntry[] {
	const idx = readIndex();
	if (idx.length > 0) return idx;
	const rebuilt = rebuildIndex();
	return rebuilt;
}

function upsertIndexEntry(entry: DocIndexEntry): void {
	const idx = readIndex();
	const at = idx.findIndex((e) => e.id === entry.id);
	if (at >= 0) idx[at] = entry;
	else idx.push(entry);
	writeIndex(idx);
}

function dropIndexEntry(id: string): void {
	writeIndex(readIndex().filter((e) => e.id !== id));
}

// ── documents ────────────────────────────────────────────────────────────────

export function readDoc(id: string): DocEnvelope | null {
	const raw = readRaw(DOC_PREFIX + id);
	if (!raw) return null;
	try {
		const env = JSON.parse(raw) as DocEnvelope;
		return env && typeof env.id === 'string' ? env : null;
	} catch {
		return null;
	}
}

/** Write the doc key and keep its index row in sync. */
export function writeDoc(env: DocEnvelope): WriteResult {
	const res = writeRaw(DOC_PREFIX + env.id, JSON.stringify(env));
	if (res.ok) upsertIndexEntry(entryFromEnvelope(env));
	return res;
}

export function removeDoc(id: string): void {
	removeRaw(DOC_PREFIX + id);
	dropIndexEntry(id);
}

export function readActive(): string | null {
	return readRaw(ACTIVE_KEY);
}

export function writeActive(id: string): void {
	writeRaw(ACTIVE_KEY, id);
}

// ── migration (idempotent, guarded by chromatics:schema) ─────────────────────

export interface MigrationResult {
	activeId: string | null;
	docs: DocIndexEntry[];
}

/**
 * One-time, non-destructive migration of the legacy single-buffer + named-scheme
 * model into per-doc envelopes. Idempotent: re-running after the schema marker is
 * set is a no-op. Legacy keys are left in place this version as a safety copy.
 *
 * `seedSource` is used only for a brand-new user with no legacy data, so the app
 * still has live content on first paint.
 */
export function migrate(seedSource: string): MigrationResult {
	if (readRaw(SCHEMA_KEY)) {
		// Already migrated — just report current state.
		return { activeId: readActive(), docs: listDocs() };
	}

	// If a doc index already exists (e.g. partial prior run), don't re-import.
	if (readIndex().length === 0) {
		const now = Date.now();
		const migrated: DocEnvelope[] = [];

		// 1) Named schemes → imported docs.
		const s = store();
		if (s) {
			const names: string[] = [];
			for (let i = 0; i < s.length; i++) {
				const k = s.key(i);
				if (k && k.startsWith(LEGACY_SCHEME_PREFIX))
					names.push(k.slice(LEGACY_SCHEME_PREFIX.length));
			}
			names.sort();
			for (const name of names) {
				const source = readRaw(LEGACY_SCHEME_PREFIX + name) ?? '';
				migrated.push(makeEnvelope({ name, source, origin: 'imported', at: now }));
			}
		}

		// 2) The old autosave buffer → the active (Untitled) doc, unless it is
		//    byte-identical to a scheme we just imported (i.e. they were mid-edit
		//    on a named scheme — don't duplicate it).
		const last = readRaw(LEGACY_LAST);
		let activeId: string | null = null;
		if (last && last.trim()) {
			const twin = migrated.find((m) => m.source === last);
			if (twin) {
				activeId = twin.id;
			} else {
				const env = makeEnvelope({ name: null, source: last, origin: 'blank', at: now + 1 });
				migrated.push(env);
				activeId = env.id;
			}
		}

		// 3) Brand-new user → seed one Untitled from the default example.
		if (migrated.length === 0) {
			const env = makeEnvelope({
				name: null,
				source: seedSource,
				origin: 'example',
				at: now
			});
			migrated.push(env);
			activeId = env.id;
		}

		// 4) Default active = most-recently-updated.
		if (!activeId) {
			activeId = [...migrated].sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
		}

		for (const env of migrated) writeRaw(DOC_PREFIX + env.id, JSON.stringify(env));
		writeIndex(migrated.map(entryFromEnvelope));
		writeActive(activeId);
	}

	writeRaw(SCHEMA_KEY, String(DOC_SCHEMA_VERSION));
	return { activeId: readActive(), docs: listDocs() };
}

// ── library export / import ──────────────────────────────────────────────────

export interface LibraryExport {
	kind: 'chromatics-library';
	version: number;
	exportedAt: number;
	active: string | null;
	docs: DocEnvelope[];
}

/** Serialize every document (with sources) for backup / cross-device transfer. */
export function exportLibrary(): string {
	const docs: DocEnvelope[] = [];
	for (const e of listDocs()) {
		const env = readDoc(e.id);
		if (env) docs.push(env);
	}
	const payload: LibraryExport = {
		kind: 'chromatics-library',
		version: DOC_SCHEMA_VERSION,
		exportedAt: Date.now(),
		active: readActive(),
		docs
	};
	return JSON.stringify(payload, null, 2);
}

/** Merge an exported library in with FRESH ids so nothing is ever clobbered. */
export function importLibrary(json: string): { added: number; firstId: string | null } {
	let payload: Partial<LibraryExport>;
	try {
		payload = JSON.parse(json) as Partial<LibraryExport>;
	} catch {
		return { added: 0, firstId: null };
	}
	const incoming = Array.isArray(payload.docs) ? payload.docs : [];
	let added = 0;
	let firstId: string | null = null;
	const now = Date.now();
	for (const raw of incoming) {
		if (!raw || typeof raw.source !== 'string') continue;
		const env = makeEnvelope({
			name: typeof raw.name === 'string' ? raw.name : null,
			source: raw.source,
			origin: 'imported',
			settings: raw.settings,
			at: typeof raw.updatedAt === 'number' ? raw.updatedAt : now
		});
		const res = writeDoc(env);
		if (res.ok) {
			added++;
			if (!firstId) firstId = env.id;
		}
	}
	return { added, firstId };
}
