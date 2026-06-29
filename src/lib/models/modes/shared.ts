/**
 * Shared helpers for registering custom culori modes (the engine's extension
 * seam). Every space we add that culori doesn't know becomes a real mode here,
 * after which projection / channels / constructors / ΔE all work natively.
 */
import { useMode, converter, interpolatorLinear, fixupHueShorter, fixupAlpha } from 'culori';

export type Vec = [number, number, number];
export type Obj = Record<string, number | undefined>;

/** 3×3 matrix · vec3. */
export const mul3 = (M: number[][], v: Vec): Vec => [
	M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
	M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
	M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]
];

/** Signed power (preserves sign through a fractional exponent). */
export const spow = (x: number, p: number): number => Math.sign(x) * Math.pow(Math.abs(x), p);

/** Inverse of a 3×3 matrix (adjugate / determinant). */
export const inv3 = (m: number[][]): number[][] => {
	const [a, b, c] = m[0],
		[d, e, f] = m[1],
		[g, h, i] = m[2];
	const A = e * i - f * h,
		B = -(d * i - f * g),
		C = d * h - e * g;
	const det = a * A + b * B + c * C;
	return [
		[A / det, (c * h - b * i) / det, (b * f - c * e) / det],
		[B / det, (a * i - c * g) / det, (c * d - a * f) / det],
		[C / det, (b * g - a * h) / det, (a * e - b * d) / det]
	];
};

/** sRGB / Rec.709 transfer pair (gamma-encoded ↔ linear). */
export const eotfSrgb = (c: number) =>
	c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
export const oetfSrgb = (c: number) =>
	c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/** D65 reference white in CIE XYZ (matches culori's xyz65 scaling, Y=1). */
export const D65: Vec = [0.9504559270516716, 1, 1.0890577507598784];

/** Per-channel interpolation config (hue-aware for `h`, alpha-aware for `alpha`). */
export const interp = (channels: string[]): Record<string, unknown> => {
	const out: Record<string, unknown> = {};
	for (const ch of channels) {
		if (ch === 'h') out.h = { use: interpolatorLinear, fixup: fixupHueShorter };
		else if (ch === 'alpha') out.alpha = { use: interpolatorLinear, fixup: fixupAlpha };
		else out[ch] = { use: interpolatorLinear };
	}
	return out;
};

/**
 * Register a custom mode that connects through `via` (an existing culori mode,
 * usually 'rgb' or 'xyz65'). `toVia` maps a color of THIS mode → the three
 * primaries of `via`; `fromVia` maps a `via` color → THIS mode's three channels.
 *
 * culori's converter only hops once through `rgb`, so we always register direct
 * `rgb` edges and chain mode ↔ via ↔ rgb internally using culori's own
 * converters. Alpha is carried through automatically.
 */
export function defMode(
	mode: string,
	channels: string[],
	via: string,
	toVia: (c: Obj) => Vec,
	fromVia: (c: Obj) => Vec,
	ranges: Record<string, [number, number]> = {}
): void {
	const chs = [...channels, 'alpha'];
	const viaCh = VIA_CH[via];
	const cToRgb = converter('rgb');
	const cToVia = converter(via as Parameters<typeof converter>[0]);

	const toRgb = (c: Obj) => {
		const [a, b, d] = toVia(c);
		const viaColor = { mode: via, [viaCh[0]]: a, [viaCh[1]]: b, [viaCh[2]]: d } as Record<
			string,
			unknown
		>;
		const out = cToRgb(viaColor as never) as unknown as Obj;
		if (c.alpha !== undefined) out.alpha = c.alpha;
		return out;
	};
	const fromRgb = (rgb: Obj) => {
		const viaColor = cToVia(rgb as never) as unknown as Obj;
		const [a, b, d] = fromVia(viaColor);
		const out: Obj = { mode, [channels[0]]: a, [channels[1]]: b, [channels[2]]: d } as Obj;
		if (rgb.alpha !== undefined) out.alpha = rgb.alpha;
		return out;
	};
	useMode({
		mode,
		channels: chs,
		ranges,
		interpolate: interp(chs),
		toMode: { rgb: toRgb },
		fromMode: { rgb: fromRgb },
		parse: [],
		serialize: mode
	} as unknown as Parameters<typeof useMode>[0]);
}

/** Positional channel names of the hub modes we connect through. */
const VIA_CH: Record<string, [string, string, string]> = {
	rgb: ['r', 'g', 'b'],
	xyz65: ['x', 'y', 'z'],
	lrgb: ['r', 'g', 'b']
};

/** Read the three primary channels of a color in `via` order. */
export const xyzOf = (c: Obj): Vec => [c.x ?? 0, c.y ?? 0, c.z ?? 0];
export const rgbOf = (c: Obj): Vec => [c.r ?? 0, c.g ?? 0, c.b ?? 0];
