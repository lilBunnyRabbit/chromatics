/**
 * Shared CodeMirror bindings for the Chroma DSL editor — the autocomplete
 * source and the hover tooltip — built once off the global `app` store so both
 * the desktop workspace and the mobile editor sheet host the exact same editor
 * behaviour without duplicating the (non-trivial) hover logic.
 */
import { Srgb, Srgb8, type Color, type ColorModel } from '@lilbunnyrabbit/chromatics';
import { app } from '$lib/state/app.svelte';
import { isColor, modelName } from '@lilbunnyrabbit/chromatics-dsl';
import { chromaCompletions } from './complete';
import { chromaHover } from './hover';
import { chromaSwatches, type SwatchMode } from './swatch-deco';

const modelOf = (name: string) => {
	const v = app.result.variables.get(name)?.value;
	return isColor(v) ? modelName(v.constructor as ColorModel) : undefined;
};

export const completion = chromaCompletions(() => app.result.order, modelOf);

const hexOf = (name: string) => {
	const e = app.scheme.byName.get(name);
	return e ? e.color.to(Srgb).gamutMap().to(Srgb8).toHex() : null;
};

export function makeSwatches(mode: SwatchMode) {
	return chromaSwatches(hexOf, mode);
}

export const hover = chromaHover((name) => {
	const e = app.scheme.byName.get(name);
	if (e) {
		const hex = e.color.to(Srgb).gamutMap().to(Srgb8).toHex();
		const own = (e.color as Color & { toCss?: () => string }).toCss?.() ?? e.color.toString();
		return { hex, text: own === hex ? hex : `${hex} · ${own}` };
	}
	const v = app.result.variables.get(name);
	if (v) {
		const val =
			typeof v.value === 'number' ? String(Math.round(v.value * 10000) / 10000) : String(v.value);
		return { text: `= ${val}` };
	}
	return null;
}, modelOf);
