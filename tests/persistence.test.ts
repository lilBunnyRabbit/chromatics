import { test, expect, describe, beforeEach } from 'bun:test';

/** Minimal synchronous in-memory localStorage shim for the document layer. */
class MemStorage {
	private map = new Map<string, string>();
	#throwOnSet: ((key: string, value: string) => void) | null = null;
	get length() {
		return this.map.size;
	}
	key(i: number): string | null {
		return [...this.map.keys()][i] ?? null;
	}
	getItem(k: string): string | null {
		return this.map.has(k) ? this.map.get(k)! : null;
	}
	setItem(k: string, v: string): void {
		if (this.#throwOnSet) this.#throwOnSet(k, v);
		this.map.set(k, String(v));
	}
	removeItem(k: string): void {
		this.map.delete(k);
	}
	clear(): void {
		this.map.clear();
	}
	/** Test hook: install a guard that may throw before a set lands. */
	failNextSetsWith(fn: ((key: string, value: string) => void) | null): void {
		this.#throwOnSet = fn;
	}
}

let mem: MemStorage;
beforeEach(() => {
	mem = new MemStorage();
	(globalThis as { localStorage?: unknown }).localStorage = mem;
});

// Imported after the shim type is in place; the module reads globalThis.localStorage lazily.
import {
	makeEnvelope,
	writeDoc,
	readDoc,
	removeDoc,
	readIndex,
	rebuildIndex,
	listDocs,
	migrate,
	exportLibrary,
	importLibrary,
	readActive,
	writeActive,
	DOC_SCHEMA_VERSION
} from '../src/lib/persistence/documents';

describe('document CRUD', () => {
	test('writeDoc round-trips and upserts the index', () => {
		const env = makeEnvelope({ name: 'Brand', source: 'bg = hex("#fff")', origin: 'imported' });
		const res = writeDoc(env);
		expect(res.ok).toBe(true);

		const got = readDoc(env.id);
		expect(got?.source).toBe('bg = hex("#fff")');
		expect(got?.name).toBe('Brand');

		const idx = readIndex();
		expect(idx.length).toBe(1);
		expect(idx[0].id).toBe(env.id);
		expect(idx[0].bytes).toBeGreaterThan(0);
	});

	test('updating a doc replaces its index row, not appends', () => {
		const env = makeEnvelope({ name: 'A', source: 'x' });
		writeDoc(env);
		writeDoc({ ...env, name: 'A2', source: 'xy', updatedAt: env.updatedAt + 5 });
		const idx = readIndex();
		expect(idx.length).toBe(1);
		expect(idx[0].name).toBe('A2');
	});

	test('removeDoc clears the key and the index row', () => {
		const env = makeEnvelope({ source: 'z' });
		writeDoc(env);
		removeDoc(env.id);
		expect(readDoc(env.id)).toBeNull();
		expect(readIndex().length).toBe(0);
	});

	test('writeDoc reports quota failures instead of throwing', () => {
		mem.failNextSetsWith(() => {
			const e = new Error('quota');
			(e as { name?: string }).name = 'QuotaExceededError';
			throw e;
		});
		const res = writeDoc(makeEnvelope({ source: 'big' }));
		expect(res.ok).toBe(false);
		expect(res.ok === false && res.reason).toBe('quota');
	});

	test('rebuildIndex reconstructs a missing index from doc keys', () => {
		const a = makeEnvelope({ name: 'A', source: 'a', at: 100 });
		const b = makeEnvelope({ name: 'B', source: 'b', at: 200 });
		writeDoc(a);
		writeDoc(b);
		mem.removeItem('chromatics:index');
		expect(readIndex().length).toBe(0);

		const rebuilt = rebuildIndex();
		expect(rebuilt.length).toBe(2);
		// recency-sorted: newest first
		expect(rebuilt[0].id).toBe(b.id);
	});

	test('listDocs heals an empty index when docs exist', () => {
		const a = makeEnvelope({ source: 'a' });
		writeDoc(a);
		mem.removeItem('chromatics:index');
		expect(listDocs().length).toBe(1);
	});
});

describe('migration', () => {
	test('legacy named schemes become imported docs', () => {
		mem.setItem('chromatics:scheme:Sunset', 'bg = hex("#f00")');
		mem.setItem('chromatics:scheme:Ocean', 'bg = hex("#00f")');

		const { docs } = migrate('seed');
		expect(docs.length).toBe(2);
		const names = docs.map((d) => d.name).sort();
		expect(names).toEqual(['Ocean', 'Sunset']);
		expect(docs.every((d) => d.origin === 'imported')).toBe(true);
	});

	test('legacy last buffer becomes the active Untitled doc', () => {
		mem.setItem('chromatics:last', 'bg = hex("#abc")');
		const { activeId, docs } = migrate('seed');
		expect(docs.length).toBe(1);
		const active = readDoc(activeId!);
		expect(active?.source).toBe('bg = hex("#abc")');
		expect(active?.name).toBeNull();
	});

	test('last identical to a named scheme is not duplicated; that scheme is active', () => {
		mem.setItem('chromatics:scheme:Brand', 'SAME');
		mem.setItem('chromatics:last', 'SAME');
		const { activeId, docs } = migrate('seed');
		expect(docs.length).toBe(1);
		expect(readDoc(activeId!)?.name).toBe('Brand');
	});

	test('brand-new user is seeded one Untitled example doc', () => {
		const { activeId, docs } = migrate('SEED-SOURCE');
		expect(docs.length).toBe(1);
		const active = readDoc(activeId!);
		expect(active?.source).toBe('SEED-SOURCE');
		expect(active?.origin).toBe('example');
	});

	test('migrate is idempotent — second run adds nothing', () => {
		mem.setItem('chromatics:scheme:One', 'a');
		mem.setItem('chromatics:last', 'b');
		const first = migrate('seed');
		expect(mem.getItem('chromatics:schema')).toBe(String(DOC_SCHEMA_VERSION));

		const before = listDocs().length;
		const second = migrate('seed');
		expect(listDocs().length).toBe(before);
		expect(second.activeId).toBe(first.activeId);
	});

	test('legacy keys are left in place as a safety copy', () => {
		mem.setItem('chromatics:scheme:Keep', 'a');
		migrate('seed');
		expect(mem.getItem('chromatics:scheme:Keep')).toBe('a');
	});
});

describe('library export / import', () => {
	test('export then import re-creates docs with fresh ids (no clobber)', () => {
		const a = makeEnvelope({ name: 'A', source: 'aaa' });
		writeDoc(a);
		writeActive(a.id);
		const dump = exportLibrary();

		const { added, firstId } = importLibrary(dump);
		expect(added).toBe(1);
		expect(firstId).not.toBe(a.id); // fresh id
		expect(listDocs().length).toBe(2); // original + imported copy
		expect(readActive()).toBe(a.id); // active untouched by import
	});

	test('import of garbage is a no-op', () => {
		expect(importLibrary('not json').added).toBe(0);
		expect(importLibrary('{}').added).toBe(0);
	});
});
