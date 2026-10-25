import {
	Cam16,
	Cubehelix,
	DisplayP3,
	Hct,
	Hsl,
	Hsluv,
	Hsv,
	Lab,
	Lch,
	LinearSrgb,
	Okhsl,
	Oklab,
	Oklch,
	Srgb,
	type Color,
	type ColorModel
} from '@lilbunnyrabbit/chromatics';

export type HueStrategy = 'shorter' | 'longer' | 'increasing' | 'decreasing';

interface Mixable {
	mix(other: Color, t: number, options?: { hue?: HueStrategy }): Color;
}
interface Rotatable {
	rotateHue(degrees: number): Color;
	readonly h: number;
}

export interface InterpSpace {
	model: ColorModel;
	label: string;
	cylindrical: boolean;
	perceptual: boolean;
}

export const INTERP_SPACES: InterpSpace[] = [
	{ model: Oklab, label: 'OKLab', cylindrical: false, perceptual: true },
	{ model: Oklch, label: 'OKLCH', cylindrical: true, perceptual: true },
	{ model: Lab, label: 'CIELAB', cylindrical: false, perceptual: true },
	{ model: Lch, label: 'CIE LCh', cylindrical: true, perceptual: true },
	{ model: Hsl, label: 'HSL', cylindrical: true, perceptual: false },
	{ model: Hsv, label: 'HSV', cylindrical: true, perceptual: false },
	{ model: Hsluv, label: 'HSLuv', cylindrical: true, perceptual: true },
	{ model: Okhsl, label: 'Okhsl', cylindrical: true, perceptual: true },
	{ model: Cubehelix, label: 'Cubehelix', cylindrical: true, perceptual: false },
	{ model: Srgb, label: 'sRGB', cylindrical: false, perceptual: false },
	{ model: LinearSrgb, label: 'Linear sRGB', cylindrical: false, perceptual: false },
	{ model: DisplayP3, label: 'Display P3', cylindrical: false, perceptual: false }
];

export function interpSpace(model: ColorModel): InterpSpace {
	return INTERP_SPACES.find((s) => s.model === model) ?? INTERP_SPACES[0];
}

export function mixIn(
	a: Color,
	b: Color,
	model: ColorModel,
	t: number,
	hue: HueStrategy = 'shorter'
): Color {
	const from = a.to(model) as unknown as Mixable;
	const options = interpSpace(model).cylindrical ? { hue } : undefined;
	return from.mix(b.to(model), t, options);
}

export interface HueModel {
	model: ColorModel;
	label: string;
	perceptual: boolean;
	note?: string;
}

export const HUE_MODELS: HueModel[] = [
	{ model: Oklch, label: 'OKLCH', perceptual: true },
	{ model: Lch, label: 'CIE LCh', perceptual: true },
	{ model: Cam16, label: 'CAM16', perceptual: true, note: 'appearance-model hue' },
	{ model: Hsluv, label: 'HSLuv', perceptual: true },
	{ model: Okhsl, label: 'Okhsl', perceptual: true },
	{ model: Hsl, label: 'HSL', perceptual: false, note: 'classic RGB wheel' },
	{ model: Hsv, label: 'HSV', perceptual: false, note: 'classic RGB wheel' }
];

export function hueModel(model: ColorModel): HueModel {
	return HUE_MODELS.find((m) => m.model === model) ?? HUE_MODELS[0];
}

export function rotateIn(c: Color, model: ColorModel, degrees: number): Color {
	return (c.to(model) as unknown as Rotatable).rotateHue(degrees);
}

export const SCHEME_OFFSETS: Record<string, number[]> = {
	complementary: [180],
	analogous: [-30, 30],
	triadic: [120, 240],
	split: [150, 210],
	tetradic: [90, 180, 270]
};

export interface HarmonySwatch {
	hue: number;
	color: Color;
	base: boolean;
}

export function harmonyColors(base: Color, scheme: string, model: ColorModel): HarmonySwatch[] {
	const wheel = hueModel(model).model;
	const offsets = SCHEME_OFFSETS[scheme] ?? SCHEME_OFFSETS.complementary;
	const baseHue = (base.to(wheel) as unknown as Rotatable).h;
	return [
		{ hue: baseHue, color: base, base: true },
		...offsets.map((deg) => {
			const color = rotateIn(base, wheel, deg);
			return { hue: (color as unknown as Rotatable).h, color, base: false };
		})
	];
}

export const RAMP_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const FRACS = [0.97, 0.93, 0.86, 0.77, 0.67, 0.58, 0.5, 0.42, 0.34, 0.26, 0.19];

export interface RampModel {
	model: ColorModel;
	label: string;
	channel: string;
	stops: number[];
	perceptual: boolean;
	note?: string;
}

export const RAMP_MODELS: RampModel[] = [
	{ model: Oklch, label: 'OKLCH lightness', channel: 'l', stops: FRACS, perceptual: true },
	{
		model: Lab,
		label: 'CIELAB L*',
		channel: 'l',
		stops: FRACS.map((f) => f * 100),
		perceptual: true
	},
	{
		model: Hct,
		label: 'HCT tone',
		channel: 't',
		stops: [95, 90, 80, 70, 60, 50, 42, 35, 25, 16, 10],
		perceptual: true,
		note: 'Material tone — CAM16 hue & chroma held'
	},
	{ model: Okhsl, label: 'Okhsl lightness', channel: 'l', stops: FRACS, perceptual: true },
	{ model: Hsluv, label: 'HSLuv lightness', channel: 'l', stops: FRACS, perceptual: true },
	{
		model: Hsl,
		label: 'HSL lightness',
		channel: 'l',
		stops: FRACS,
		perceptual: false,
		note: 'non-perceptual — uneven steps'
	},
	{
		model: Hsv,
		label: 'HSV value',
		channel: 'v',
		stops: FRACS,
		perceptual: false,
		note: 'Value, not lightness — stays saturated (no tint)'
	}
];

export function rampModel(model: ColorModel): RampModel {
	return RAMP_MODELS.find((m) => m.model === model) ?? RAMP_MODELS[0];
}

export interface RampStep {
	key: string;
	shade: number;
	color: Color;
}

// Raw steps, not gamut-mapped: a ramp feeds roles and tokens, display maps at the edge.
export function rampColors(base: Color, model: ColorModel): RampStep[] {
	const rm = rampModel(model);
	const native = base.to(rm.model);
	return rm.stops.map((value, i) => ({
		key: String(RAMP_SHADES[i]),
		shade: RAMP_SHADES[i],
		color: native.clone().set({ [rm.channel]: value } as Parameters<Color['set']>[0])
	}));
}
