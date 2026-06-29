/**
 * Derivation spaces — the single source of truth for "pick a model" across the
 * three studio derivations that used to be hardwired to OKLCH:
 *
 *  - INTERP_SPACES — interpolation spaces for gradients / mixes.
 *  - HUE_MODELS    — hue wheels harmony can rotate on (per-model harmony).
 *  - RAMP_MODELS   — lightness axes a tonal ramp can walk.
 *
 * The engine already supports any registered model generically (lerpInMode /
 * rotateHueInMode / channel projection); these curated lists are what the DSL
 * cards and the Studio pickers read so they can never drift apart. An anti-drift
 * test in derivations.test.ts asserts every mode here resolves to a real model.
 */
import { ColorValue } from './value';
import { rotateHueInMode, wrapHue } from './util';
import type { CuloriColor } from './registry';

// ── gradient / mix interpolation spaces ───────────────────────────────────
export interface InterpSpace {
	/** DSL/UI id (also the `space` string in preview.gradient). */
	id: string;
	label: string;
	/** culori mode lerped in. */
	mode: string;
	/** Cylindrical (carries a hue) → the hue strategy applies. */
	cylindrical: boolean;
	/** Perceptually-uniform interpolation. */
	perceptual: boolean;
}

export const INTERP_SPACES: InterpSpace[] = [
	{ id: 'oklab', label: 'OKLab', mode: 'oklab', cylindrical: false, perceptual: true },
	{ id: 'oklch', label: 'OKLCH', mode: 'oklch', cylindrical: true, perceptual: true },
	{ id: 'lab', label: 'CIELAB', mode: 'lab', cylindrical: false, perceptual: true },
	{ id: 'lch', label: 'CIE LCh', mode: 'lch', cylindrical: true, perceptual: true },
	{ id: 'hsl', label: 'HSL', mode: 'hsl', cylindrical: true, perceptual: false },
	{ id: 'hsv', label: 'HSV', mode: 'hsv', cylindrical: true, perceptual: false },
	{ id: 'hsluv', label: 'HSLuv', mode: 'hsluv', cylindrical: true, perceptual: true },
	{ id: 'okhsl', label: 'Okhsl', mode: 'okhsl', cylindrical: true, perceptual: true },
	{ id: 'cubehelix', label: 'Cubehelix', mode: 'cubehelix', cylindrical: true, perceptual: false },
	{ id: 'srgb', label: 'sRGB', mode: 'rgb', cylindrical: false, perceptual: false },
	{ id: 'linear', label: 'Linear sRGB', mode: 'lrgb', cylindrical: false, perceptual: false },
	{ id: 'p3', label: 'Display P3', mode: 'p3', cylindrical: false, perceptual: false }
];

const _interp = new Map(INTERP_SPACES.map((s) => [s.id, s]));
export function interpSpace(id: string): InterpSpace {
	return _interp.get(id) ?? INTERP_SPACES[0];
}

// ── harmony hue models ─────────────────────────────────────────────────────
export interface HueModel {
	/** DSL/UI id (the `model` string in preview.harmony). */
	id: string;
	label: string;
	/** culori mode whose `h` channel is rotated. */
	mode: string;
	perceptual: boolean;
	note?: string;
}

export const HUE_MODELS: HueModel[] = [
	{ id: 'oklch', label: 'OKLCH', mode: 'oklch', perceptual: true },
	{ id: 'lch', label: 'CIE LCh', mode: 'lch', perceptual: true },
	{ id: 'cam16', label: 'CAM16', mode: 'cam16', perceptual: true, note: 'appearance-model hue' },
	{ id: 'hsluv', label: 'HSLuv', mode: 'hsluv', perceptual: true },
	{ id: 'okhsl', label: 'Okhsl', mode: 'okhsl', perceptual: true },
	{ id: 'hsl', label: 'HSL', mode: 'hsl', perceptual: false, note: 'classic RGB wheel' },
	{ id: 'hsv', label: 'HSV', mode: 'hsv', perceptual: false, note: 'classic RGB wheel' }
];

const _hue = new Map(HUE_MODELS.map((m) => [m.id, m]));
export function hueModel(id: string): HueModel {
	return _hue.get(id) ?? HUE_MODELS[0];
}

/** Named harmony schemes → the hue offsets (degrees) applied off the base. */
export const SCHEME_OFFSETS: Record<string, number[]> = {
	complementary: [180],
	analogous: [-30, 30],
	triadic: [120, 240],
	split: [150, 210],
	tetradic: [90, 180, 270]
};

export interface HarmonySwatch {
	/** The color's hue in the chosen model (for wheel placement). */
	hue: number;
	color: ColorValue;
	/** True for the untouched base color. */
	base: boolean;
}

/**
 * Build a harmony off `base` by rotating on `modelId`'s hue wheel. Returns the
 * base swatch first, then one per scheme offset. Shared by preview.harmony and
 * the per-model `c.<model>.triadic()` methods so the card can't disagree.
 */
export function harmonyColors(base: ColorValue, scheme: string, modelId: string): HarmonySwatch[] {
	const hm = hueModel(modelId);
	const proj = base.project(hm.mode) as unknown as Record<string, number | undefined>;
	const baseHue = wrapHue(proj.h ?? 0);
	const offsets = SCHEME_OFFSETS[scheme] ?? SCHEME_OFFSETS.complementary;
	return [
		{ hue: baseHue, color: base, base: true },
		...offsets.map((deg) => ({
			hue: wrapHue(baseHue + deg),
			color: rotateHueInMode(base, hm.mode, deg),
			base: false
		}))
	];
}

// ── tonal ramp models ───────────────────────────────────────────────────────
/** Tailwind-style shade keys, light → dark. */
export const RAMP_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
/** The canonical OKLCH lightness curve (even perceptual steps), light → dark. */
const FRACS = [0.97, 0.93, 0.86, 0.77, 0.67, 0.58, 0.5, 0.42, 0.34, 0.26, 0.19];

export interface RampModel {
	/** DSL/UI id (the `mode`/`model` string in preview.ramp / c.ramp). */
	id: string;
	label: string;
	mode: string;
	/** culori field varied across the ramp (the "lightness" axis). */
	field: string;
	/** Per-shade target values for `field`, light → dark (length = RAMP_SHADES). */
	stops: number[];
	perceptual: boolean;
	note?: string;
}

export const RAMP_MODELS: RampModel[] = [
	{
		id: 'oklch',
		label: 'OKLCH lightness',
		mode: 'oklch',
		field: 'l',
		stops: FRACS,
		perceptual: true
	},
	{
		id: 'lab',
		label: 'CIELAB L*',
		mode: 'lab',
		field: 'l',
		stops: FRACS.map((f) => f * 100),
		perceptual: true
	},
	{
		id: 'hct',
		label: 'HCT tone',
		mode: 'hct',
		field: 't',
		stops: [95, 90, 80, 70, 60, 50, 42, 35, 25, 16, 10],
		perceptual: true,
		note: 'Material tone — CAM16 hue & chroma held'
	},
	{
		id: 'okhsl',
		label: 'Okhsl lightness',
		mode: 'okhsl',
		field: 'l',
		stops: FRACS,
		perceptual: true
	},
	{
		id: 'hsluv',
		label: 'HSLuv lightness',
		mode: 'hsluv',
		field: 'l',
		stops: FRACS.map((f) => f * 100),
		perceptual: true
	},
	{
		id: 'hsl',
		label: 'HSL lightness',
		mode: 'hsl',
		field: 'l',
		stops: FRACS,
		perceptual: false,
		note: 'non-perceptual — uneven steps'
	},
	{
		id: 'hsv',
		label: 'HSV value',
		mode: 'hsv',
		field: 'v',
		stops: FRACS,
		perceptual: false,
		note: 'Value, not lightness — stays saturated (no tint)'
	}
];

const _ramp = new Map(RAMP_MODELS.map((m) => [m.id, m]));
export function rampModel(id: string): RampModel {
	return _ramp.get(id) ?? RAMP_MODELS[0];
}

export interface RampStep {
	key: string;
	shade: number;
	color: ColorValue;
}

/**
 * Generate a tonal ramp by walking `modelId`'s lightness axis while holding the
 * model's other channels. Colors are returned stored natively in the ramp
 * model (gamut-mapping for display happens at the edge), so a ramp can feed
 * roles/tokens, not just a preview card.
 */
export function rampColors(base: ColorValue, modelId: string): RampStep[] {
	const rm = rampModel(modelId);
	const proj = base.project(rm.mode) as unknown as Record<string, number | undefined> & {
		mode: string;
	};
	return rm.stops.map((val, i) => ({
		key: String(RAMP_SHADES[i]),
		shade: RAMP_SHADES[i],
		color: ColorValue.from({ ...proj, [rm.field]: val } as unknown as CuloriColor)
	}));
}
