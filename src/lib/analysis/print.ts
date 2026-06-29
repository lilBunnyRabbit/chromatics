/**
 * Print soft-proof — how a screen color behaves as process ink. Reports the
 * CMYK separation, total area coverage (TAC), whether it busts a press ink
 * limit, and the proofed appearance after ink-limiting. The CMYK model is the
 * app's naive (profile-less) one, so this is directional, not a contract proof.
 */
import { ColorValue } from '../models/index.js';
import type { CuloriColor } from '../models/registry.js';

export interface PrintProof {
	c: number;
	m: number;
	y: number;
	k: number;
	/** Total area coverage, percent (0–400). */
	totalInk: number;
	/** TAC exceeds the press limit. */
	overInk: boolean;
	/** The color's hex after scaling inks down to the limit (the proofed look). */
	proofHex: string;
	/** Rich black: heavy K reinforced with CMY. */
	richBlack: boolean;
}

/** Default total-ink limits by stock; 300% is a safe coated-offset default. */
export const INK_LIMITS = [
	{ label: 'Newsprint (240%)', value: 240 },
	{ label: 'Uncoated (260%)', value: 260 },
	{ label: 'Coated offset (300%)', value: 300 },
	{ label: 'Sheetfed (320%)', value: 320 }
];

export function printProof(color: ColorValue, inkLimit = 300): PrintProof {
	const p = color.project('cmyk') as unknown as Record<string, number | undefined>;
	const c = p.c ?? 0,
		m = p.m ?? 0,
		y = p.y ?? 0,
		k = p.k ?? 0;
	const total = c + m + y + k;
	const totalInk = total * 100;
	const max = inkLimit / 100;
	const overInk = total > max;

	let proof = { c, m, y, k };
	if (overInk && total > 0) {
		const f = max / total;
		proof = { c: c * f, m: m * f, y: y * f, k: k * f };
	}
	const proofHex = ColorValue.from({ mode: 'cmyk', ...proof } as unknown as CuloriColor).hex;

	return {
		c,
		m,
		y,
		k,
		totalInk,
		overInk,
		proofHex,
		richBlack: k > 0.5 && c + m + y > 0.1
	};
}
