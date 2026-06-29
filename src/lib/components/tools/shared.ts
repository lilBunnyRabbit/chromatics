/**
 * Shared plumbing for Studio generator tools. Every tool's job is the same:
 * read the live scheme, compute new colors with the engine, and write DSL back
 * into the editor through `insert` — keeping the editor the source of truth.
 */
import { app } from '$lib/state/app.svelte';
import { appendStatements } from '$lib/dsl/emit';

/** All identifiers already defined in the source (colors + plain values). */
export function takenNames(): string[] {
	return [...app.scheme.entries.map((e) => e.name), ...app.scheme.nonColorVars.map((v) => v.name)];
}

/** Append generated DSL statements to the editor source. */
export function insert(lines: string[], comment?: string): void {
	app.source = appendStatements(app.source, lines, comment);
}

const r2 = (n: number, d: number) => Math.round(n * d) / d;

/** A compact `oklch(L C H)` readout for previews. */
export function oklchText(c: { channel(k: string): number }): string {
	return `oklch(${r2(c.channel('ok_l'), 100)} ${r2(c.channel('ok_c'), 1000)} ${r2(c.channel('ok_h'), 10)})`;
}
