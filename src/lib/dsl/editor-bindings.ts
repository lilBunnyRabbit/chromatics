/**
 * Shared CodeMirror bindings for the Chroma DSL editor — the autocomplete
 * source and the hover tooltip — built once off the global `app` store so both
 * the desktop workspace and the mobile editor sheet host the exact same editor
 * behaviour without duplicating the (non-trivial) hover logic.
 */
import { app } from '$lib/state/app.svelte';
import { isColorValue } from '$lib/models';
import { chromaCompletions } from './complete';
import { chromaHover } from './hover';
import { chromaSwatches, type SwatchMode } from './swatch-deco';

export const completion = chromaCompletions(() => app.result.order);

const hexOf = (name: string) => {
	const e = app.scheme.byName.get(name);
	return e ? e.color.hex : null;
};

/** Build the inline-swatch extension for a given marker style. */
export function makeSwatches(mode: SwatchMode) {
	return chromaSwatches(hexOf, mode);
}

export const hover = chromaHover((name) => {
	const e = app.scheme.byName.get(name);
	if (e) {
		const c = e.color;
		const r2 = (n: number, d: number) => Math.round(n * d) / d;
		const ok = `oklch(${r2(c.channel('ok_l'), 1000)} ${r2(c.channel('ok_c'), 10000)} ${r2(c.channel('ok_h'), 100)})`;
		return { hex: c.hex, text: `${c.hex} · ${ok}` };
	}
	const v = app.result.variables.get(name);
	if (v && !isColorValue(v.value)) {
		const val =
			typeof v.value === 'number' ? String(Math.round(v.value * 10000) / 10000) : String(v.value);
		return { text: `= ${val}` };
	}
	return null;
});
