/**
 * Colour-appearance models: CAM16 (JCh), CAM16-UCS (J′a′b′), and CIECAM02.
 * CAM16 has a closed-form inverse (verified to match Material's published
 * correlates); CIECAM02 uses a faithful forward with a 3-D Newton inverse seeded
 * from CAM16. Viewing conditions: D65 white, average surround, L*=50 background.
 * All connect through xyz65 (which carries Y in [0,1]; CAM16 works in 0–100).
 */
import { defMode, mul3, type Vec } from './shared';

const sgn = (x: number) => (x < 0 ? -1 : x > 0 ? 1 : 0);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const WHITE: Vec = [95.047, 100, 108.883];
const labInvf = (ft: number) => {
	const e = 216 / 24389,
		k = 24389 / 27,
		f3 = ft ** 3;
	return f3 > e ? f3 : (116 * ft - 16) / k;
};
const yFromL = (l: number) => 100 * labInvf((l + 16) / 116);

const M16 = [
	[0.401288, 0.650173, -0.051461],
	[-0.250268, 1.204414, 0.045854],
	[-0.002079, 0.048952, 0.953127]
];
const M16_INV = [
	[1.8620678550872327, -1.0112546305316843, 0.14918677544445175],
	[0.38752654323613717, 0.6214474419314753, -0.008973985167612518],
	[-0.015841498849333856, -0.03412293802851557, 1.0499644368778496]
];

// --- CAM16 viewing conditions ---
const VC = (() => {
	const rW = mul3(M16, WHITE);
	const f = 1.0,
		c = lerp(0.59, 0.69, (f - 0.9) * 10),
		nc = f;
	const la = ((200 / Math.PI) * yFromL(50)) / 100;
	let d = f * (1 - (1 / 3.6) * Math.exp((-la - 42) / 92));
	d = Math.max(0, Math.min(1, d));
	const rgbD = rW.map((w) => d * (100 / w) + 1 - d);
	const k = 1 / (5 * la + 1),
		k4 = k ** 4;
	const fl = k4 * la + 0.1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * la);
	const n = yFromL(50) / WHITE[1];
	const z = 1.48 + Math.sqrt(n);
	const nbb = 0.725 / Math.pow(n, 0.2);
	const rgbAW = rW.map((w, i) => {
		const x = Math.pow((fl * rgbD[i] * w) / 100, 0.42);
		return (400 * x) / (x + 27.13);
	});
	const aw = (2 * rgbAW[0] + rgbAW[1] + 0.05 * rgbAW[2]) * nbb;
	return { rgbD, fl, n, z, nbb, ncb: nbb, c, nc, aw };
})();

interface Cam {
	J: number;
	C: number;
	h: number;
	M: number;
}
function cam16Forward(X: number, Y: number, Z: number): Cam {
	const rgb = mul3(M16, [X, Y, Z]);
	const rc = rgb.map((v, i) => VC.rgbD[i] * v);
	const ra = rc.map((v) => {
		const x = Math.pow((VC.fl * Math.abs(v)) / 100, 0.42);
		return (sgn(v) * 400 * x) / (x + 27.13);
	});
	const a = (11 * ra[0] - 12 * ra[1] + ra[2]) / 11;
	const b = (ra[0] + ra[1] - 2 * ra[2]) / 9;
	const u = (20 * ra[0] + 20 * ra[1] + 21 * ra[2]) / 20;
	const p2 = (40 * ra[0] + 20 * ra[1] + ra[2]) / 20;
	const hd = (Math.atan2(b, a) * 180) / Math.PI;
	const h = hd < 0 ? hd + 360 : hd >= 360 ? hd - 360 : hd;
	const J = 100 * Math.pow((p2 * VC.nbb) / VC.aw, VC.c * VC.z);
	const hp = h < 20.14 ? h + 360 : h;
	const et = 0.25 * (Math.cos((hp * Math.PI) / 180 + 2) + 3.8);
	const t = ((50000 / 13) * VC.nc * VC.ncb * et * Math.sqrt(a * a + b * b)) / (u + 0.305);
	const C = Math.pow(t, 0.9) * Math.sqrt(J / 100) * Math.pow(1.64 - Math.pow(0.29, VC.n), 0.73);
	return { J, C, h, M: C * Math.pow(VC.fl, 0.25) };
}
function cam16Inverse(J: number, C: number, h: number): Vec {
	const alpha = C === 0 || J === 0 ? 0 : C / Math.sqrt(J / 100);
	const t = Math.pow(alpha / Math.pow(1.64 - Math.pow(0.29, VC.n), 0.73), 1 / 0.9);
	const hr = (h * Math.PI) / 180;
	const et = 0.25 * (Math.cos(hr + 2) + 3.8);
	const ac = VC.aw * Math.pow(J / 100, 1 / VC.c / VC.z);
	const p1 = et * (50000 / 13) * VC.nc * VC.ncb;
	const p2 = ac / VC.nbb;
	const hs = Math.sin(hr),
		hc = Math.cos(hr);
	const gamma = (23 * (p2 + 0.305) * t) / (23 * p1 + 11 * t * hc + 108 * t * hs);
	const a = gamma * hc,
		b = gamma * hs;
	const ra = (460 * p2 + 451 * a + 288 * b) / 1403;
	const ga = (460 * p2 - 891 * a - 261 * b) / 1403;
	const ba = (460 * p2 - 220 * a - 6300 * b) / 1403;
	const inv1 = (v: number) => {
		const base = Math.max(0, (27.13 * Math.abs(v)) / (400 - Math.abs(v)));
		return sgn(v) * (100 / VC.fl) * Math.pow(base, 1 / 0.42);
	};
	const rc = [inv1(ra), inv1(ga), inv1(ba)];
	return mul3(M16_INV, [rc[0] / VC.rgbD[0], rc[1] / VC.rgbD[1], rc[2] / VC.rgbD[2]]);
}

// --- CAM16 (JCh) ---
defMode(
	'cam16',
	['j', 'c', 'h'],
	'xyz65',
	(col) => {
		const xyz = cam16Inverse(col.j ?? 0, col.c ?? 0, col.h ?? 0);
		return [xyz[0] / 100, xyz[1] / 100, xyz[2] / 100];
	},
	(col) => {
		const f = cam16Forward((col.x ?? 0) * 100, (col.y ?? 0) * 100, (col.z ?? 0) * 100);
		return [f.J, f.C, f.h];
	},
	{ j: [0, 100], c: [0, 150], h: [0, 360] }
);

// --- CAM16-UCS (J′ a′ b′) ---
defMode(
	'cam16ucs',
	['j', 'a', 'b'],
	'xyz65',
	(col) => {
		const Jp = col.j ?? 0,
			a = col.a ?? 0,
			b = col.b ?? 0;
		const Mp = Math.sqrt(a * a + b * b);
		const M = (Math.exp(Mp * 0.0228) - 1) / 0.0228;
		const h = (Math.atan2(b, a) * 180) / Math.PI;
		const J = Jp / (1.7 - 0.007 * Jp);
		const C = M / Math.pow(VC.fl, 0.25);
		const xyz = cam16Inverse(J, C, (h + 360) % 360);
		return [xyz[0] / 100, xyz[1] / 100, xyz[2] / 100];
	},
	(col) => {
		const f = cam16Forward((col.x ?? 0) * 100, (col.y ?? 0) * 100, (col.z ?? 0) * 100);
		const Jp = (1.7 * f.J) / (1 + 0.007 * f.J);
		const Mp = Math.log(1 + 0.0228 * f.M) / 0.0228;
		return [Jp, Mp * Math.cos((f.h * Math.PI) / 180), Mp * Math.sin((f.h * Math.PI) / 180)];
	},
	{ j: [0, 100], a: [-50, 50], b: [-50, 50] }
);

// --- CIECAM02 (faithful forward + Newton inverse seeded from CAM16) ---
const MCAT02 = [
	[0.7328, 0.4296, -0.1624],
	[-0.7036, 1.6975, 0.0061],
	[0.003, 0.0136, 0.9834]
];
const MCAT02_INV = [
	[1.096124, -0.278869, 0.182745],
	[0.454369, 0.473533, 0.072098],
	[-0.009628, -0.005698, 1.015326]
];
const MHPE = [
	[0.38971, 0.68898, -0.07868],
	[-0.22981, 1.1834, 0.04641],
	[0, 0, 1]
];
const VC02 = (() => {
	const rW = mul3(MCAT02, WHITE);
	const f = 1.0,
		c = lerp(0.59, 0.69, (f - 0.9) * 10),
		nc = f;
	const la = ((200 / Math.PI) * yFromL(50)) / 100;
	let d = f * (1 - (1 / 3.6) * Math.exp((-la - 42) / 92));
	d = Math.max(0, Math.min(1, d));
	const rgbD = rW.map((w) => d * (100 / w) + 1 - d);
	const k = 1 / (5 * la + 1),
		k4 = k ** 4;
	const fl = k4 * la + 0.1 * (1 - k4) * (1 - k4) * Math.cbrt(5 * la);
	const n = yFromL(50) / WHITE[1];
	const z = 1.48 + Math.sqrt(n);
	const nbb = 0.725 / Math.pow(n, 0.2);
	const rgbWc = rW.map((w, i) => rgbD[i] * w);
	const rgbWp = mul3(MHPE, mul3(MCAT02_INV, rgbWc as Vec));
	const rgbAW = rgbWp.map((v) => {
		const x = Math.pow((fl * v) / 100, 0.42);
		return (400 * x) / (x + 27.13) + 0.1;
	});
	const aw = (2 * rgbAW[0] + rgbAW[1] + 0.05 * rgbAW[2] - 0.305) * nbb;
	return { rgbD, fl, n, z, nbb, ncb: nbb, c, nc, aw };
})();
function ciecam02Forward(X: number, Y: number, Z: number) {
	const rgb = mul3(MCAT02, [X, Y, Z]);
	const rc = rgb.map((v, i) => VC02.rgbD[i] * v);
	const rp = mul3(MHPE, mul3(MCAT02_INV, rc as Vec));
	const ra = rp.map((v) => {
		const x = Math.pow((VC02.fl * Math.abs(v)) / 100, 0.42);
		return sgn(v) * ((400 * x) / (x + 27.13)) + 0.1;
	});
	const a = ra[0] - (12 / 11) * ra[1] + ra[2] / 11;
	const b = (ra[0] + ra[1] - 2 * ra[2]) / 9;
	const hd = (Math.atan2(b, a) * 180) / Math.PI;
	const h = hd < 0 ? hd + 360 : hd;
	const A = (2 * ra[0] + ra[1] + 0.05 * ra[2] - 0.305) * VC02.nbb;
	const J = 100 * Math.pow(A / VC02.aw, VC02.c * VC02.z);
	const hp = h < 20.14 ? h + 360 : h;
	const et = 0.25 * (Math.cos((hp * Math.PI) / 180 + 2) + 3.8);
	const t =
		((50000 / 13) * VC02.nc * VC02.ncb * et * Math.sqrt(a * a + b * b)) /
		(ra[0] + ra[1] + (21 / 20) * ra[2]);
	const C = Math.pow(t, 0.9) * Math.sqrt(J / 100) * Math.pow(1.64 - Math.pow(0.29, VC02.n), 0.73);
	return { J, C, h, a: C * Math.cos((h * Math.PI) / 180), b: C * Math.sin((h * Math.PI) / 180) };
}
function ciecam02Inverse(J: number, C: number, h: number): Vec {
	const target = [J, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
	let v = cam16Inverse(J, C, h); // seed
	for (let it = 0; it < 30; it++) {
		const f = ciecam02Forward(v[0], v[1], v[2]);
		const F = [f.J, f.a, f.b];
		const e = [F[0] - target[0], F[1] - target[1], F[2] - target[2]];
		if (Math.abs(e[0]) + Math.abs(e[1]) + Math.abs(e[2]) < 1e-7) break;
		const hh = 1e-3;
		const J3 = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		];
		for (let j = 0; j < 3; j++) {
			const vp = [...v] as Vec;
			vp[j] += hh;
			const fp = ciecam02Forward(vp[0], vp[1], vp[2]);
			const Fp = [fp.J, fp.a, fp.b];
			for (let i = 0; i < 3; i++) J3[i][j] = (Fp[i] - F[i]) / hh;
		}
		const det =
			J3[0][0] * (J3[1][1] * J3[2][2] - J3[1][2] * J3[2][1]) -
			J3[0][1] * (J3[1][0] * J3[2][2] - J3[1][2] * J3[2][0]) +
			J3[0][2] * (J3[1][0] * J3[2][1] - J3[1][1] * J3[2][0]);
		if (Math.abs(det) < 1e-12) break;
		const I = [
			[
				(J3[1][1] * J3[2][2] - J3[1][2] * J3[2][1]) / det,
				(J3[0][2] * J3[2][1] - J3[0][1] * J3[2][2]) / det,
				(J3[0][1] * J3[1][2] - J3[0][2] * J3[1][1]) / det
			],
			[
				(J3[1][2] * J3[2][0] - J3[1][0] * J3[2][2]) / det,
				(J3[0][0] * J3[2][2] - J3[0][2] * J3[2][0]) / det,
				(J3[0][2] * J3[1][0] - J3[0][0] * J3[1][2]) / det
			],
			[
				(J3[1][0] * J3[2][1] - J3[1][1] * J3[2][0]) / det,
				(J3[0][1] * J3[2][0] - J3[0][0] * J3[2][1]) / det,
				(J3[0][0] * J3[1][1] - J3[0][1] * J3[1][0]) / det
			]
		];
		const d = [
			I[0][0] * e[0] + I[0][1] * e[1] + I[0][2] * e[2],
			I[1][0] * e[0] + I[1][1] * e[1] + I[1][2] * e[2],
			I[2][0] * e[0] + I[2][1] * e[1] + I[2][2] * e[2]
		];
		v = [v[0] - d[0], v[1] - d[1], v[2] - d[2]];
	}
	return v;
}
defMode(
	'ciecam02',
	['j', 'c', 'h'],
	'xyz65',
	(col) => {
		const xyz = ciecam02Inverse(col.j ?? 0, col.c ?? 0, col.h ?? 0);
		return [xyz[0] / 100, xyz[1] / 100, xyz[2] / 100];
	},
	(col) => {
		const f = ciecam02Forward((col.x ?? 0) * 100, (col.y ?? 0) * 100, (col.z ?? 0) * 100);
		return [f.J, f.C, f.h];
	},
	{ j: [0, 100], c: [0, 150], h: [0, 360] }
);
