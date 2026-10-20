/**
 * Shared CodeMirror bindings for the Chroma DSL editor — the autocomplete
 * source and the hover tooltip — built once off the global `app` store so both
 * the desktop workspace and the mobile editor sheet host the exact same editor
 * behaviour without duplicating the (non-trivial) hover logic.
 */
import { app } from '$lib/state/app.svelte';
import { isColorValue, formatOwnModel } from '$lib/models';
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
		// Show the color in its OWN model (how it was authored), not always OKLCH.
		const own = formatOwnModel(c, e.model);
		return { hex: c.hex, text: own === c.hex ? c.hex : `${c.hex} · ${own}` };
	}
	const v = app.result.variables.get(name);
	if (v && !isColorValue(v.value)) {
		const val =
			typeof v.value === 'number' ? String(Math.round(v.value * 10000) / 10000) : String(v.value);
		return { text: `= ${val}` };
	}
	return null;
});
