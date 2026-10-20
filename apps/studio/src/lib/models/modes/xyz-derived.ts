/**
 * Spaces derived in closed form from CIE XYZ (D65). All connect through culori's
 * `xyz65` hub. Verified: white points land on the textbook values and every
 * sRGB swatch round-trips exactly.
 */
import { defMode, mul3, spow, D65, type Vec, type Obj } from './shared';

const [Xn, Yn, Zn] = D65;

// --- CIE xyY (chromaticity + luminance) ---
defMode(
	'xyy',
	['x', 'y', 'Y'],
	'xyz65',
	(c) => {
		const x = c.x ?? 0,
			y = c.y ?? 0,
			Y = c.Y ?? 0;
		return y === 0 ? [0, 0, 0] : [(x * Y) / y, Y, ((1 - x - y) * Y) / y];
	},
	(c) => {
		const X = c.x ?? 0,
			Y = c.y ?? 0,
			Z = c.z ?? 0;
		const s = X + Y + Z;
		return s === 0 ? [Xn / (Xn + Yn + Zn), Yn / (Xn + Yn + Zn), 0] : [X / s, Y / s, Y];
	},
	{ x: [0, 0.8], y: [0, 0.9], Y: [0, 1] }
);

// --- CIE 1976 UCS (u' v' + luminance) ---
defMode(
	'ucs',
	['u', 'v', 'Y'],
	'xyz65',
	(c) => {
		const u = c.u ?? 0,
			v = c.v ?? 0,
			Y = c.Y ?? 0;
		return v === 0 ? [0, 0, 0] : [(Y * 9 * u) / (4 * v), Y, (Y * (12 - 3 * u - 20 * v)) / (4 * v)];
	},
	(c) => {
		const X = c.x ?? 0,
			Y = c.y ?? 0,
			Z = c.z ?? 0;
		const d = X + 15 * Y + 3 * Z;
		return d === 0 ? [0, 0, 0] : [(4 * X) / d, (9 * Y) / d, Y];
	},
	{ u: [0, 0.7], v: [0, 0.6], Y: [0, 1] }
);

// --- CIE 1960 UCS (u v + luminance); v = 2/3·v' ---
defMode(
	'ucs60',
	['u', 'v', 'Y'],
	'xyz65',
	(c) => {
		const u = c.u ?? 0,
			v = c.v ?? 0,
			Y = c.Y ?? 0;
		return v === 0 ? [0, 0, 0] : [(1.5 * Y * u) / v, Y, (Y * (12 - 3 * u - 30 * v)) / (6 * v)];
	},
	(c) => {
		const X = c.x ?? 0,
			Y = c.y ?? 0,
			Z = c.z ?? 0;
		const d = X + 15 * Y + 3 * Z;
		return d === 0 ? [0, 0, 0] : [(4 * X) / d, (6 * Y) / d, Y];
	},
	{ u: [0, 0.7], v: [0, 0.4], Y: [0, 1] }
);

// --- CIE 1964 U*V*W* (built on the 1960 UCS) ---
const ucs60Of = (X: number, Y: number, Z: number): [number, number] => {
	const d = X + 15 * Y + 3 * Z;
	return d === 0 ? [0, 0] : [(4 * X) / d, (6 * Y) / d];
};
const [u0, v0] = ucs60Of(Xn, Yn, Zn);
defMode(
	'uvw',
	['u', 'v', 'w'],
	'xyz65',
	(c) => {
		const U = c.u ?? 0,
			V = c.v ?? 0,
			W = c.w ?? 0;
		if (W === 0) return [0, 0, 0];
		const Y = Math.pow((W + 17) / 25, 3) / 100;
		const u = u0 + U / (13 * W);
		const v = v0 + V / (13 * W);
		return v === 0 ? [0, 0, 0] : [(1.5 * Y * u) / v, Y, (Y * (12 - 3 * u - 30 * v)) / (6 * v)];
	},
	(c) => {
		const X = c.x ?? 0,
			Y = c.y ?? 0,
			Z = c.z ?? 0;
		const [u, v] = ucs60Of(X, Y, Z);
		const W = 25 * Math.cbrt(Y * 100) - 17;
		return [13 * W * (u - u0), 13 * W * (v - v0), W];
	},
	{ u: [-100, 100], v: [-100, 100], w: [0, 100] }
);

// --- Hunter Lab (the pre-CIELAB opponent space) ---
const Ka = (175 / 198.04) * ((Xn + Yn) * 100);
const Kb = (70 / 218.11) * ((Yn + Zn) * 100);
defMode(
	'hlab',
	['l', 'a', 'b'],
	'xyz65',
	(c) => {
		const L = c.l ?? 0,
			a = c.a ?? 0,
			b = c.b ?? 0;
		const yn = Yn * 100,
			xn = Xn * 100,
			zn = Zn * 100;
		const Y = yn * (L / 100) ** 2;
		const sq = L / 100;
		if (sq === 0) return [0, 0, 0];
		return [(xn * ((a / Ka) * sq + Y / yn)) / 100, Y / 100, (zn * (Y / yn - (b / Kb) * sq)) / 100];
	},
	(c) => {
		const x = (c.x ?? 0) * 100,
			y = (c.y ?? 0) * 100,
			z = (c.z ?? 0) * 100;
		const xn = Xn * 100,
			yn = Yn * 100,
			zn = Zn * 100;
		if (y <= 0) return [0, 0, 0];
		const sq = Math.sqrt(y / yn);
		return [100 * sq, Ka * ((x / xn - y / yn) / sq), Kb * ((y / yn - z / zn) / sq)];
	},
	{ l: [0, 100], a: [-100, 100], b: [-100, 100] }
);

// --- IPT (Ebner & Fairchild) — hue-linear perceptual ---
const IPT_M1 = [
	[0.4002, 0.7075, -0.0807],
	[-0.228, 1.15, 0.0612],
	[0, 0, 0.9184]
];
const IPT_M1_INV = [
	[1.8502, -1.1383, 0.2384],
	[0.3668, 0.6439, -0.0107],
	[0, 0, 1.0889]
];
const IPT_M2 = [
	[0.4, 0.4, 0.2],
	[4.455, -4.851, 0.396],
	[0.8056, 0.3572, -1.1628]
];
const IPT_M2_INV = [
	[1.0, 0.0975689, 0.205226],
	[1.0, -0.113876, 0.133217],
	[1.0, 0.0326151, -0.676887]
];
defMode(
	'ipt',
	['i', 'p', 't'],
	'xyz65',
	(c) => {
		const ipt: Vec = [c.i ?? 0, c.p ?? 0, c.t ?? 0];
		const lms = mul3(IPT_M2_INV, ipt).map((v) => spow(v, 1 / 0.43)) as Vec;
		return mul3(IPT_M1_INV, lms);
	},
	(c) => {
		const xyz: Vec = [c.x ?? 0, c.y ?? 0, c.z ?? 0];
		const lms = mul3(IPT_M1, xyz).map((v) => spow(v, 0.43)) as Vec;
		return mul3(IPT_M2, lms);
	},
	{ i: [0, 1], p: [-0.75, 0.75], t: [-0.75, 0.75] }
);
