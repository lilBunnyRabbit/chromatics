import { Srgb, Srgb8, type Color } from '@lilbunnyrabbit/chromatics';
import { CATALOG, type ChannelInfo, type ModelInfo } from '$lib/color/catalog';

const FRONT_ORDER = [
	'Srgb',
	'Hsl',
	'Hsv',
	'Hwb',
	'Hsi',
	'Cmyk',
	'Cmy',
	'Lab',
	'Lch',
	'Xyz65',
	'Oklch',
	'Oklab',
	'Luv65',
	'Lchuv65',
	'Hsluv',
	'Ycbcr709',
	'Yiq',
	'DisplayP3'
];

export function mixerModels(): readonly ModelInfo[] {
	return CATALOG;
}

export function orderedMixerModels(): ModelInfo[] {
	const rank = (name: string) => {
		const i = FRONT_ORDER.indexOf(name);
		return i === -1 ? FRONT_ORDER.length : i;
	};
	return CATALOG.map((m, i) => ({ m, i }))
		.sort((a, b) => rank(a.m.name) - rank(b.m.name) || a.i - b.i)
		.map((x) => x.m);
}

function mid(ch: ChannelInfo): number {
	return (ch.range[0] + ch.range[1]) / 2;
}

// Ryb's unreachable dark blues and results past the number range throw; midpoints keep the slider usable.
export function seedVals(color: Color, info: ModelInfo): number[] {
	try {
		return [...color.to(info.model).coords];
	} catch {
		return info.channels.map(mid);
	}
}

export function buildFromVals(info: ModelInfo, vals: number[]): Color | null {
	try {
		return new info.model(...vals);
	} catch {
		return null;
	}
}

function displayHex(c: Color): string | null {
	try {
		return c.to(Srgb).gamutMap().to(Srgb8).toHex();
	} catch {
		return null;
	}
}

export function channelGradient(
	info: ModelInfo,
	vals: number[],
	index: number,
	stops = 14
): string {
	const [lo, hi] = info.channels[index].range;
	const out: string[] = [];
	for (let s = 0; s <= stops; s++) {
		const probe = vals.slice();
		probe[index] = lo + (s / stops) * (hi - lo);
		const c = buildFromVals(info, probe);
		out.push((c && displayHex(c)) ?? 'transparent');
	}
	return `linear-gradient(to right, ${out.join(', ')})`;
}

export function readableText(color: Color): '#000000' | '#ffffff' {
	try {
		return color.to(Srgb).clamp().luminance() > 0.4 ? '#000000' : '#ffffff';
	} catch {
		return '#ffffff';
	}
}

export function fmtChannel(v: number | undefined | null): string {
	if (v == null || Number.isNaN(v)) return '–';
	const a = Math.abs(v);
	const dp = a < 2 ? 3 : a < 50 ? 1 : 0;
	return String(+v.toFixed(dp));
}

// Most specific first: Xyy's luminance `Y` beats chromaticity `y`, video luma `y` beats Yiq's `i`,
// Hpluv's `l` beats its saturation `p`.
const LIGHT_NAMES = ['l', 'J', 'j', 'Y', 'y', 'i', 't', 'v', 'W', 'p'];

/** Index of the model's lightness-like channel (never a hue), or -1. */
export function lightIndex(info: ModelInfo): number {
	const ch = info.channels;
	for (const name of LIGHT_NAMES) {
		const i = ch.findIndex((c) => c.name === name && !c.hue);
		if (i >= 0) return i;
	}
	return -1;
}
