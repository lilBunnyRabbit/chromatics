/**
 * Hue/other spaces over gamma-encoded R'G'B':
 *  - HSP   (Finley) — HSV-like but with a perceptually-weighted brightness P.
 *  - TSL   — Tint / Saturation / Lightness (used in skin detection).
 *  - RYB   — the artists' Red-Yellow-Blue wheel (trilinear paint model). Its
 *            gamut is smaller than sRGB, so RGB→RYB is a clamped best fit
 *            (vivid colours don't round-trip); RYB→RGB and mixing are exact.
 */
import { defMode, type Vec, type Obj } from './shared';

const sqf = Math.sqrt;
const Pr = 0.299,
	Pg = 0.587,
	Pb = 0.114;

// --- HSP (Darel Rex Finley) ---
function rgbToHsp(R: number, G: number, B: number): Vec {
	const P = sqf(R * R * Pr + G * G * Pg + B * B * Pb);
	let H = 0,
		S = 0;
	if (R === G && G === B) {
		H = 0;
		S = 0;
	} else if (R >= G && R >= B) {
		if (B >= G) {
			H = 1 - ((1 / 6) * (B - G)) / (R - G);
			S = 1 - G / R;
		} else {
			H = ((1 / 6) * (G - B)) / (R - B);
			S = 1 - B / R;
		}
	} else if (G >= R && G >= B) {
		if (R >= B) {
			H = 2 / 6 - ((1 / 6) * (R - B)) / (G - B);
			S = 1 - B / G;
		} else {
			H = 2 / 6 + ((1 / 6) * (B - R)) / (G - R);
			S = 1 - R / G;
		}
	} else {
		if (G >= R) {
			H = 4 / 6 - ((1 / 6) * (G - R)) / (B - R);
			S = 1 - R / B;
		} else {
			H = 4 / 6 + ((1 / 6) * (R - G)) / (B - G);
			S = 1 - G / B;
		}
	}
	return [H * 360, S, P];
}
function hspToRgb(Hd: number, S: number, P: number): Vec {
	let H = (((Hd % 360) + 360) % 360) / 360;
	let R = 0,
		G = 0,
		B = 0,
		part: number;
	const m = 1 - S;
	if (m > 0) {
		if (H < 1 / 6) {
			H = 6 * H;
			part = 1 + H * (1 / m - 1);
			B = P / sqf(Pr / m / m + Pg * part * part + Pb);
			R = B / m;
			G = B + H * (R - B);
		} else if (H < 2 / 6) {
			H = 6 * (-H + 2 / 6);
			part = 1 + H * (1 / m - 1);
			B = P / sqf(Pg / m / m + Pr * part * part + Pb);
			G = B / m;
			R = B + H * (G - B);
		} else if (H < 3 / 6) {
			H = 6 * (H - 2 / 6);
			part = 1 + H * (1 / m - 1);
			R = P / sqf(Pg / m / m + Pb * part * part + Pr);
			G = R / m;
			B = R + H * (G - R);
		} else if (H < 4 / 6) {
			H = 6 * (-H + 4 / 6);
			part = 1 + H * (1 / m - 1);
			R = P / sqf(Pb / m / m + Pg * part * part + Pr);
			B = R / m;
			G = R + H * (B - R);
		} else if (H < 5 / 6) {
			H = 6 * (H - 4 / 6);
			part = 1 + H * (1 / m - 1);
			G = P / sqf(Pb / m / m + Pr * part * part + Pg);
			B = G / m;
			R = G + H * (B - G);
		} else {
			H = 6 * (-H + 1);
			part = 1 + H * (1 / m - 1);
			G = P / sqf(Pr / m / m + Pb * part * part + Pg);
			R = G / m;
			B = G + H * (R - G);
		}
	} else {
		if (H < 1 / 6) {
			H = 6 * H;
			R = sqf((P * P) / (Pr + Pg * H * H));
			G = R * H;
			B = 0;
		} else if (H < 2 / 6) {
			H = 6 * (-H + 2 / 6);
			G = sqf((P * P) / (Pg + Pr * H * H));
			R = G * H;
			B = 0;
		} else if (H < 3 / 6) {
			H = 6 * (H - 2 / 6);
			G = sqf((P * P) / (Pg + Pb * H * H));
			B = G * H;
			R = 0;
		} else if (H < 4 / 6) {
			H = 6 * (-H + 4 / 6);
			B = sqf((P * P) / (Pb + Pg * H * H));
			G = B * H;
			R = 0;
		} else if (H < 5 / 6) {
			H = 6 * (H - 4 / 6);
			B = sqf((P * P) / (Pb + Pr * H * H));
			R = B * H;
			G = 0;
		} else {
			H = 6 * (-H + 1);
			R = sqf((P * P) / (Pr + Pb * H * H));
			B = R * H;
			G = 0;
		}
	}
	return [R, G, B];
}
defMode(
	'hsp',
	['h', 's', 'p'],
	'rgb',
	(c) => hspToRgb(c.h ?? 0, c.s ?? 0, c.p ?? 0),
	(c) => rgbToHsp(c.r ?? 0, c.g ?? 0, c.b ?? 0),
	{ h: [0, 360], s: [0, 1], p: [0, 1] }
);

// --- TSL (Tint, Saturation, Lightness) ---
function rgbToTsl(R: number, G: number, B: number): Vec {
	const sum = R + G + B;
	const r = sum === 0 ? 1 / 3 : R / sum,
		g = sum === 0 ? 1 / 3 : G / sum;
	const rp = r - 1 / 3,
		gp = g - 1 / 3;
	const S = sqf((9 / 5) * (rp * rp + gp * gp));
	let T: number;
	if (gp > 0) T = Math.atan(rp / gp) / (2 * Math.PI) + 1 / 4;
	else if (gp < 0) T = Math.atan(rp / gp) / (2 * Math.PI) + 3 / 4;
	else T = rp > 0 ? 0.25 : rp < 0 ? 0.75 : 0;
	return [T, S, 0.299 * R + 0.587 * G + 0.114 * B];
}
function tslToRgb(T: number, S: number, L: number): Vec {
	let rp: number, gp: number;
	if (S <= 1e-12) {
		rp = 0;
		gp = 0;
	} else {
		const ang = (T - 1 / 4) * 2 * Math.PI;
		if (Math.abs(Math.cos(ang)) < 1e-9) {
			gp = 0;
			rp = (Math.sin(ang) > 0 ? 1 : -1) * sqf((5 * S * S) / 9);
		} else {
			const x = Math.tan(ang);
			gp = (T > 0.5 ? -1 : 1) * sqf((5 * S * S) / (9 * (x * x + 1)));
			rp = x * gp;
		}
	}
	const r = rp + 1 / 3,
		g = gp + 1 / 3,
		b = 1 - r - g;
	const k = 0.299 * r + 0.587 * g + 0.114 * b;
	const total = k === 0 ? 0 : L / k;
	return [r * total, g * total, b * total];
}
defMode(
	'tsl',
	['t', 's', 'l'],
	'rgb',
	(c) => tslToRgb(c.t ?? 0, c.s ?? 0, c.l ?? 0),
	(c) => rgbToTsl(c.r ?? 0, c.g ?? 0, c.b ?? 0),
	{ t: [0, 1], s: [0, 1], l: [0, 1] }
);

// --- RYB (artists' wheel; trilinear over Gosset & Chen corners) ---
const RYB_CUBE = [
	[1, 1, 1],
	[1, 0, 0],
	[1, 1, 0],
	[0.163, 0.373, 0.6],
	[1, 0.5, 0],
	[0.5, 0, 0.5],
	[0, 0.66, 0.2],
	[0.2, 0.094, 0.0]
];
export function rybToRgb(r: number, y: number, b: number): Vec {
	const out: Vec = [0, 0, 0];
	for (let k = 0; k < 3; k++) {
		const x0 = RYB_CUBE[0][k] * (1 - r) + RYB_CUBE[1][k] * r;
		const x1 = RYB_CUBE[2][k] * (1 - r) + RYB_CUBE[4][k] * r;
		const x2 = RYB_CUBE[3][k] * (1 - r) + RYB_CUBE[5][k] * r;
		const x3 = RYB_CUBE[6][k] * (1 - r) + RYB_CUBE[7][k] * r;
		const y0 = x0 * (1 - y) + x1 * y,
			y1 = x2 * (1 - y) + x3 * y;
		out[k] = y0 * (1 - b) + y1 * b;
	}
	return out;
}
function rgbToRyb(R: number, G: number, B: number): Vec {
	let v: Vec = [0.5, 0.5, 0.5];
	const t = [R, G, B];
	for (let it = 0; it < 40; it++) {
		const f = rybToRgb(v[0], v[1], v[2]);
		const e = [f[0] - t[0], f[1] - t[1], f[2] - t[2]];
		const h = 1e-4;
		const J = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];
		for (let j = 0; j < 3; j++) {
			const vp = [...v] as Vec;
			vp[j] += h;
			const fp = rybToRgb(vp[0], vp[1], vp[2]);
			for (let i = 0; i < 3; i++) J[i][j] = (fp[i] - f[i]) / h;
		}
		const det =
			J[0][0] * (J[1][1] * J[2][2] - J[1][2] * J[2][1]) -
			J[0][1] * (J[1][0] * J[2][2] - J[1][2] * J[2][0]) +
			J[0][2] * (J[1][0] * J[2][1] - J[1][1] * J[2][0]);
		if (Math.abs(det) < 1e-12) break;
		const I = [
			[
				(J[1][1] * J[2][2] - J[1][2] * J[2][1]) / det,
				(J[0][2] * J[2][1] - J[0][1] * J[2][2]) / det,
				(J[0][1] * J[1][2] - J[0][2] * J[1][1]) / det
			],
			[
				(J[1][2] * J[2][0] - J[1][0] * J[2][2]) / det,
				(J[0][0] * J[2][2] - J[0][2] * J[2][0]) / det,
				(J[0][2] * J[1][0] - J[0][0] * J[1][2]) / det
			],
			[
				(J[1][0] * J[2][1] - J[1][1] * J[2][0]) / det,
				(J[0][1] * J[2][0] - J[0][0] * J[2][1]) / det,
				(J[0][0] * J[1][1] - J[0][1] * J[1][0]) / det
			]
		];
		const d = [
			I[0][0] * e[0] + I[0][1] * e[1] + I[0][2] * e[2],
			I[1][0] * e[0] + I[1][1] * e[1] + I[1][2] * e[2],
			I[2][0] * e[0] + I[2][1] * e[1] + I[2][2] * e[2]
		];
		v = [
			Math.max(0, Math.min(1, v[0] - d[0])),
			Math.max(0, Math.min(1, v[1] - d[1])),
			Math.max(0, Math.min(1, v[2] - d[2]))
		];
		if (Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) < 1e-9) break;
	}
	return v;
}
defMode(
	'ryb',
	['r', 'y', 'b'],
	'rgb',
	(c) => rybToRgb(c.r ?? 0, c.y ?? 0, c.b ?? 0),
	(c: Obj) => rgbToRyb(c.r ?? 0, c.g ?? 0, c.b ?? 0),
	{ r: [0, 1], y: [0, 1], b: [0, 1] }
);
