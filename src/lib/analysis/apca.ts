/**
 * APCA (Accessible Perceptual Contrast Algorithm) — the WCAG 3 / SAPC contrast
 * model. Unlike the WCAG 2 ratio it is polarity-aware (dark-on-light vs
 * light-on-dark are different numbers) and tracks perceived readability far
 * better, especially in dark mode. Faithful port of the public APCA 0.1.9
 * constants (apca-w3). Returns a signed Lc in roughly [-108, +106].
 */
import type { ColorValue } from '../models/index.js';

const mainTRC = 2.4;
const Rco = 0.2126729,
	Gco = 0.7151522,
	Bco = 0.072175;
const normBG = 0.56,
	normTXT = 0.57,
	revTXT = 0.62,
	revBG = 0.65;
const blkThrs = 0.022,
	blkClmp = 1.414;
const scaleBoW = 1.14,
	scaleWoB = 1.14;
const loBoWoffset = 0.027,
	loWoBoffset = 0.027;
const deltaYmin = 0.0005,
	loClip = 0.1;

/** Screen luminance (Ys) from a color's clamped sRGB, using APCA's simple 2.4 TRC. */
function srgbToY(c: ColorValue): number {
	const lin = (v: number) => Math.pow(Math.min(1, Math.max(0, v)), mainTRC);
	return Rco * lin(c.channel('r')) + Gco * lin(c.channel('g')) + Bco * lin(c.channel('b'));
}

/** APCA's soft black-level clamp. */
function softClamp(y: number): number {
	return y >= blkThrs ? y : y + Math.pow(blkThrs - y, blkClmp);
}

/**
 * Signed APCA lightness contrast (Lc). Positive ≈ dark text on a light
 * background; negative ≈ light text on a dark background. Magnitude is what the
 * readability thresholds compare against.
 */
export function apcaContrast(text: ColorValue, bg: ColorValue): number {
	const Ytxt = softClamp(srgbToY(text));
	const Ybg = softClamp(srgbToY(bg));
	if (Math.abs(Ytxt - Ybg) < deltaYmin) return 0;

	let out: number;
	if (Ybg > Ytxt) {
		const sapc = (Math.pow(Ybg, normBG) - Math.pow(Ytxt, normTXT)) * scaleBoW;
		out = sapc < loClip ? 0 : sapc - loBoWoffset;
	} else {
		const sapc = (Math.pow(Ybg, revBG) - Math.pow(Ytxt, revTXT)) * scaleWoB;
		out = sapc > -loClip ? 0 : sapc + loWoBoffset;
	}
	return out * 100;
}

export type ApcaUse = 'Body' | 'Large' | 'Headline' | 'Spot' | 'Fail';

/**
 * Coarse readability bucket for an |Lc| value. APCA is genuinely contextual
 * (font size & weight matter), so this is directional guidance, not a verdict:
 *  ≥90 any text · ≥75 fluent body · ≥60 large/medium · ≥45 headlines/large-bold
 *  ≥30 spot / non-text · below that, avoid for text.
 */
export function apcaUse(lc: number): ApcaUse {
	const a = Math.abs(lc);
	if (a >= 75) return 'Body';
	if (a >= 60) return 'Large';
	if (a >= 45) return 'Headline';
	if (a >= 30) return 'Spot';
	return 'Fail';
}

export function apcaColor(use: ApcaUse): string {
	switch (use) {
		case 'Body':
			return '#22c55e';
		case 'Large':
			return '#84cc16';
		case 'Headline':
			return '#eab308';
		case 'Spot':
			return '#f97316';
		case 'Fail':
			return '#ef4444';
	}
}
