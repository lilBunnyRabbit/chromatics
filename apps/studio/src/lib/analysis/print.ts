/**
 * Print soft-proof — how a screen color behaves as process ink. Reports the
 * CMYK separation, total area coverage (TAC), whether it busts a press ink
 * limit, and the proofed appearance after ink-limiting. The CMYK model is the
 * app's naive (profile-less) one, so this is directional, not a contract proof.
 */
import { Cmyk, Srgb, Srgb8, type Color } from '@lilbunnyrabbit/chromatics';

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

export function printProof(color: Color, inkLimit = 300): PrintProof {
	const ink = color.to(Cmyk);
	const { c, m, y, k } = ink;
	const total = ink.totalInk();
	const overInk = total > inkLimit / 100;
	const proofHex = ink
		.limitInk(inkLimit / 100)
		.to(Srgb)
		.gamutMap()
		.to(Srgb8)
		.toHex();
	return {
		c,
		m,
		y,
		k,
		totalInk: total * 100,
		overInk,
		proofHex,
		richBlack: k > 0.5 && c + m + y > 0.1
	};
}
