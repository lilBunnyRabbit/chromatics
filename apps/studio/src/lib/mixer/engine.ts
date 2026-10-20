/**
 * Mixer engine — the pure (DOM-free, unit-testable) core behind the /mixer page.
 *
 * The Mixer shows one card per model, each with a slider per channel. Dragging
 * any slider sets the color; every OTHER model's sliders then re-read it by
 * CONVERTING into their own model. A ColorValue is stored natively in one model
 * (see value.ts) and converts to the others on demand (direct edge → BFS →
 * culori fallback), so the engine needs two primitives — read a model's channels
 * off a color (converting if needed), and rebuild a color from a model's channels.
 */
import { allModels, ColorValue, type ModelDef, type ChannelDef } from '../models';

/** Well-known spaces first (so the grid opens on familiar territory), then the
 *  rest in registration order. Ids not present here keep their natural order. */
const FRONT_ORDER = [
	'srgb',
	'hsl',
	'hsv',
	'hwb',
	'hsi',
	'cmyk',
	'cmy',
	'lab',
	'lch',
	'xyz',
	'oklch',
	'oklab',
	'luv',
	'lchuv',
	'hsluv',
	'ycbcr',
	'yiq',
	'p3'
];

/** Every backed model that has at least one channel — i.e. everything the Mixer
 *  can put behind sliders. Excludes `root`, the 34 coming-soon stubs (no
 *  conversion) and RAL (a swatch lookup with zero channels). */
export function mixerModels(): ModelDef[] {
	return allModels().filter((m) => m.id !== 'root' && m.backed && m.channels.length > 0);
}

/** mixerModels() with the well-known spaces pulled to the front. */
export function orderedMixerModels(): ModelDef[] {
	const all = mixerModels();
	const rank = (id: string) => {
		const i = FRONT_ORDER.indexOf(id);
		return i === -1 ? FRONT_ORDER.length : i;
	};
	return all
		.map((m, i) => ({ m, i }))
		.sort((a, b) => rank(a.m.id) - rank(b.m.id) || a.i - b.i)
		.map((x) => x.m);
}

/** Midpoint of a channel's range — the sane fallback when a projection yields an
 *  undefined/NaN field (e.g. the hue of an achromatic color). */
function mid(ch: ChannelDef): number {
	return (ch.range[0] + ch.range[1]) / 2;
}

/** Read a color's channel values in a given model, in channel order. Undefined or
 *  NaN fields fall back to the channel midpoint so a slider never goes blank. */
export function seedVals(color: ColorValue, def: ModelDef): number[] {
	let proj: Record<string, number | undefined>;
	try {
		proj = color.project(def.mode) as unknown as Record<string, number | undefined>;
	} catch {
		return def.channels.map(mid);
	}
	return def.channels.map((ch) => {
		const v = proj[ch.culoriField];
		return v == null || Number.isNaN(v) ? mid(ch) : v;
	});
}

/** Rebuild a ColorValue from a model's full channel set. Keyed by culoriField so
 *  it is order-independent and works for every backed model regardless of whether
 *  it registered a named DSL constructor. Returns null for an un-convertible set. */
export function buildFromVals(def: ModelDef, vals: number[]): ColorValue | null {
	const obj: Record<string, unknown> = { mode: def.mode };
	def.channels.forEach((ch, i) => {
		obj[ch.culoriField] = vals[i];
	});
	try {
		return ColorValue.from(obj as unknown as Parameters<typeof ColorValue.from>[0]);
	} catch {
		return null;
	}
}

/** A CSS linear-gradient previewing where dragging channel `index` pushes the
 *  color, holding this model's other channels fixed. sRGB-clamped via hex; an
 *  un-buildable sample contributes a transparent stop. */
export function channelGradient(def: ModelDef, vals: number[], index: number, stops = 14): string {
	const ch = def.channels[index];
	const [lo, hi] = ch.range;
	const out: string[] = [];
	for (let s = 0; s <= stops; s++) {
		const probe = vals.slice();
		probe[index] = lo + (s / stops) * (hi - lo);
		const c = buildFromVals(def, probe);
		out.push(c ? c.hex : 'transparent');
	}
	return `linear-gradient(to right, ${out.join(', ')})`;
}

/** Black or white, whichever reads better on `color` (WCAG relative luminance).
 *  Channels are clamped so wide-gamut / out-of-sRGB colors still resolve. */
export function readableText(color: ColorValue): '#000000' | '#ffffff' {
	const rgb = color.project('rgb') as unknown as Record<'r' | 'g' | 'b', number | undefined>;
	const lin = (v: number) => {
		if (!Number.isFinite(v)) return 0; // NaN/∞ channel → treat as 0 (mirrors seedVals)
		const c = Math.min(1, Math.max(0, v));
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	const L = 0.2126 * lin(rgb.r ?? 0) + 0.7152 * lin(rgb.g ?? 0) + 0.0722 * lin(rgb.b ?? 0);
	return L > 0.4 ? '#000000' : '#ffffff';
}

/** Compact channel-value formatter: more decimals for small magnitudes, fewer for
 *  large ones (matches the encyclopedia playground). */
export function fmtChannel(v: number | undefined | null): string {
	if (v == null || Number.isNaN(v)) return '–';
	const a = Math.abs(v);
	const dp = a < 2 ? 3 : a < 50 ? 1 : 0;
	return String(+v.toFixed(dp));
}
