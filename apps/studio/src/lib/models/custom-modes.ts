/**
 * Custom culori modes — the engine's extension seam.
 *
 * culori has no CMYK / HSLuv / HPLuv / HCT, so we teach its converter graph
 * about them here via `useMode`. Each mode declares how to go to/from `rgb`
 * (the hub), after which EVERYTHING else in the engine — projection, channel
 * reads, constructors, ΔE — works natively, exactly like a built-in mode.
 *
 * The math is real (not stubbed) but hand-rolled, so the models that use these
 * modes are registered with status:'experimental'. This is the only file other
 * than registry.ts that touches culori's mode machinery.
 */
import { useMode, interpolatorLinear, fixupHueShorter, fixupAlpha } from 'culori';

/** Linear interpolation for a list of cartesian channels, hue-aware for `h`. */
const interp = (channels: string[]): Record<string, unknown> => {
	const out: Record<string, unknown> = {};
	for (const ch of channels) {
		if (ch === 'h') out.h = { use: interpolatorLinear, fixup: fixupHueShorter };
		else if (ch === 'alpha') out.alpha = { use: interpolatorLinear, fixup: fixupAlpha };
		else out[ch] = { use: interpolatorLinear };
	}
	return out;
};

type Rgb = { mode: 'rgb'; r: number; g: number; b: number; alpha?: number };
const rgb = (r: number, g: number, b: number, alpha?: number): Rgb =>
	alpha === undefined ? { mode: 'rgb', r, g, b } : { mode: 'rgb', r, g, b, alpha };
const withAlpha = <T extends object>(o: T, alpha?: number): T =>
	alpha === undefined ? o : { ...o, alpha };

// ============================================================================
// CMYK — naive device subtractive (no ICC profile; the common GCR-free model)
// ============================================================================
type Cmyk = { mode: 'cmyk'; c: number; m: number; y: number; k: number; alpha?: number };

const cmykToRgb = (col: Record<string, number | undefined>): Rgb => {
	const c = col.c ?? 0,
		m = col.m ?? 0,
		y = col.y ?? 0,
		k = col.k ?? 0;
	return rgb((1 - c) * (1 - k), (1 - m) * (1 - k), (1 - y) * (1 - k), col.alpha);
};
const rgbToCmyk = (col: Record<string, number | undefined>): Cmyk => {
	const r = col.r ?? 0,
		g = col.g ?? 0,
		b = col.b ?? 0;
	const k = 1 - Math.max(r, g, b);
	const f = 1 - k;
	const c = f < 1e-8 ? 0 : (1 - r - k) / f;
	const m = f < 1e-8 ? 0 : (1 - g - k) / f;
	const y = f < 1e-8 ? 0 : (1 - b - k) / f;
	return withAlpha({ mode: 'cmyk', c, m, y, k } as Cmyk, col.alpha);
};

useMode({
	mode: 'cmyk',
	channels: ['c', 'm', 'y', 'k', 'alpha'],
	ranges: { c: [0, 1], m: [0, 1], y: [0, 1], k: [0, 1] },
	interpolate: interp(['c', 'm', 'y', 'k', 'alpha']),
	toMode: { rgb: cmykToRgb },
	fromMode: { rgb: rgbToCmyk },
	parse: [],
	serialize: 'cmyk'
} as unknown as Parameters<typeof useMode>[0]);

// ============================================================================
// HSLuv + HPLuv — perceptually-uniform HSL (full reference pipeline, hsluv.org)
// ============================================================================
// sRGB↔XYZ (D65) and the Luv reference whites, exactly as the reference impl.
const M = [
	[3.240969941904521, -1.537383177570093, -0.498610760293],
	[-0.96924363628087, 1.87596750150772, 0.041555057407175],
	[0.055630079696993, -0.20397695888897, 1.056971514242878]
];
const M_INV = [
	[0.41239079926595, 0.35758433938387, 0.18048078840183],
	[0.21263900587151, 0.71516867876775, 0.072192315360733],
	[0.019330818715591, 0.11919477979462, 0.95053215224966]
];
const REF_U = 0.19783000664283;
const REF_V = 0.46831999493879;
const KAPPA = 903.2962962;
const EPSILON = 0.0088564516;

const dot3 = (row: number[], v: number[]) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2];
const toLin = (c: number) => (c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92);
const fromLin = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

/** Boundary lines of the sRGB gamut in the CIELUV plane at lightness L. */
function getBounds(L: number): [number, number][] {
	const out: [number, number][] = [];
	const sub1 = Math.pow(L + 16, 3) / 1560896;
	const sub2 = sub1 > EPSILON ? sub1 : L / KAPPA;
	for (let c = 0; c < 3; c++) {
		const [m1, m2, m3] = M[c];
		for (let t = 0; t < 2; t++) {
			const top1 = (284517 * m1 - 94839 * m3) * sub2;
			const top2 = (838422 * m3 + 769860 * m2 + 731718 * m1) * L * sub2 - 769860 * t * L;
			const bottom = (632260 * m3 - 126452 * m2) * sub2 + 126452 * t;
			out.push([top1 / bottom, top2 / bottom]);
		}
	}
	return out;
}
function maxChromaForLH(L: number, H: number): number {
	const hrad = (H / 360) * 2 * Math.PI;
	let min = Infinity;
	for (const [slope, intercept] of getBounds(L)) {
		const len = intercept / (Math.sin(hrad) - slope * Math.cos(hrad));
		if (len >= 0) min = Math.min(min, len);
	}
	return min;
}
function maxSafeChromaForL(L: number): number {
	let min = Infinity;
	for (const [slope, intercept] of getBounds(L)) {
		min = Math.min(min, Math.abs(intercept) / Math.sqrt(slope * slope + 1));
	}
	return min;
}

const rgbToXyz = (r: number, g: number, b: number) => {
	const rl = [toLin(r), toLin(g), toLin(b)];
	return [dot3(M_INV[0], rl), dot3(M_INV[1], rl), dot3(M_INV[2], rl)];
};
const xyzToRgb = (x: number, y: number, z: number): [number, number, number] => [
	fromLin(dot3(M[0], [x, y, z])),
	fromLin(dot3(M[1], [x, y, z])),
	fromLin(dot3(M[2], [x, y, z]))
];
function xyzToLuv([X, Y, Z]: number[]): [number, number, number] {
	const div = X + 15 * Y + 3 * Z;
	const L = Y <= EPSILON ? Y * KAPPA : 116 * Math.cbrt(Y) - 16;
	if (L === 0) return [0, 0, 0];
	const vU = div === 0 ? 0 : (4 * X) / div;
	const vV = div === 0 ? 0 : (9 * Y) / div;
	return [L, 13 * L * (vU - REF_U), 13 * L * (vV - REF_V)];
}
function luvToXyz([L, U, V]: number[]): [number, number, number] {
	if (L === 0) return [0, 0, 0];
	const vU = U / (13 * L) + REF_U;
	const vV = V / (13 * L) + REF_V;
	const Y = L <= 8 ? L / KAPPA : Math.pow((L + 16) / 116, 3);
	const X = -(9 * Y * vU) / ((vU - 4) * vV - vU * vV);
	const Z = (9 * Y - 15 * vV * Y - vV * X) / (3 * vV);
	return [X, Y, Z];
}

function rgbToHsluv(col: Record<string, number | undefined>) {
	const [L, U, V] = xyzToLuv(rgbToXyz(col.r ?? 0, col.g ?? 0, col.b ?? 0));
	const C = Math.sqrt(U * U + V * V);
	let H = C < 1e-8 ? 0 : (Math.atan2(V, U) * 180) / Math.PI;
	if (H < 0) H += 360;
	if (L > 99.9999999) return withAlpha({ mode: 'hsluv', h: H, s: 0, l: 100 }, col.alpha);
	if (L < 1e-8) return withAlpha({ mode: 'hsluv', h: H, s: 0, l: 0 }, col.alpha);
	return withAlpha({ mode: 'hsluv', h: H, s: (C / maxChromaForLH(L, H)) * 100, l: L }, col.alpha);
}
function hsluvToRgb(col: Record<string, number | undefined>): Rgb {
	const h = col.h ?? 0;
	let l = col.l ?? 0,
		C: number;
	const s = col.s ?? 0;
	if (l > 99.9999999) {
		l = 100;
		C = 0;
	} else if (l < 1e-8) {
		l = 0;
		C = 0;
	} else C = (maxChromaForLH(l, h) / 100) * s;
	const hr = (h / 180) * Math.PI;
	const [r, g, b] = xyzToRgb(...luvToXyz([l, Math.cos(hr) * C, Math.sin(hr) * C]));
	return rgb(r, g, b, col.alpha);
}
function rgbToHpluv(col: Record<string, number | undefined>) {
	const [L, U, V] = xyzToLuv(rgbToXyz(col.r ?? 0, col.g ?? 0, col.b ?? 0));
	const C = Math.sqrt(U * U + V * V);
	let H = C < 1e-8 ? 0 : (Math.atan2(V, U) * 180) / Math.PI;
	if (H < 0) H += 360;
	if (L > 99.9999999) return withAlpha({ mode: 'hpluv', h: H, p: 0, l: 100 }, col.alpha);
	if (L < 1e-8) return withAlpha({ mode: 'hpluv', h: H, p: 0, l: 0 }, col.alpha);
	return withAlpha({ mode: 'hpluv', h: H, p: (C / maxSafeChromaForL(L)) * 100, l: L }, col.alpha);
}
function hpluvToRgb(col: Record<string, number | undefined>): Rgb {
	const h = col.h ?? 0;
	let l = col.l ?? 0,
		C: number;
	const pp = col.p ?? 0;
	if (l > 99.9999999) {
		l = 100;
		C = 0;
	} else if (l < 1e-8) {
		l = 0;
		C = 0;
	} else C = (maxSafeChromaForL(l) / 100) * pp;
	const hr = (h / 180) * Math.PI;
	const [r, g, b] = xyzToRgb(...luvToXyz([l, Math.cos(hr) * C, Math.sin(hr) * C]));
	return rgb(r, g, b, col.alpha);
}

useMode({
	mode: 'hsluv',
	channels: ['h', 's', 'l', 'alpha'],
	ranges: { h: [0, 360], s: [0, 100], l: [0, 100] },
	interpolate: interp(['h', 's', 'l', 'alpha']),
	toMode: { rgb: hsluvToRgb },
	fromMode: { rgb: rgbToHsluv },
	parse: [],
	serialize: 'hsluv'
} as unknown as Parameters<typeof useMode>[0]);

useMode({
	mode: 'hpluv',
	channels: ['h', 'p', 'l', 'alpha'],
	ranges: { h: [0, 360], p: [0, 100], l: [0, 100] },
	interpolate: interp(['h', 'p', 'l', 'alpha']),
	toMode: { rgb: hpluvToRgb },
	fromMode: { rgb: rgbToHpluv },
	parse: [],
	serialize: 'hpluv'
} as unknown as Parameters<typeof useMode>[0]);

// ============================================================================
// HCT (Material) — CAM16 hue + CAM16 chroma + CIELAB L* tone.
// Forward is faithful CAM16 (matches Material's published HCT). Inverse is a
// nested-bisection gamut solver: round-trips saturated colors to the exact hex.
// ============================================================================
const SRGB_TO_XYZ = [
	[0.41233895, 0.35762064, 0.18051042],
	[0.2126, 0.7152, 0.0722],
	[0.01932141, 0.11916382, 0.95034478]
];
const WHITE = [95.047, 100.0, 108.883];
const signum = (x: number) => (x < 0 ? -1 : x > 0 ? 1 : 0);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const labF = (t: number) => {
	const e = 216 / 24389,
		k = 24389 / 27;
	return t > e ? Math.cbrt(t) : (k * t + 16) / 116;
};
const labInvf = (ft: number) => {
	const e = 216 / 24389,
		k = 24389 / 27,
		f3 = ft ** 3;
	return f3 > e ? f3 : (116 * ft - 16) / k;
};
const yFromLstar = (l: number) => 100 * labInvf((l + 16) / 116);
const lstarFromY = (y: number) => 116 * labF(y / 100) - 16;

// CAM16 viewing conditions: D65 white, average surround, Lstar=50 background.
const VC = (() => {
	const xyz = WHITE;
	const rW = xyz[0] * 0.401288 + xyz[1] * 0.650173 + xyz[2] * -0.051461;
	const gW = xyz[0] * -0.250268 + xyz[1] * 1.204414 + xyz[2] * 0.045854;
	const bW = xyz[0] * -0.002079 + xyz[1] * 0.048952 + xyz[2] * 0.953127;
	const f = 1.0; // 0.8 + surround(2)/10
	const c = lerp(0.59, 0.69, (f - 0.9) * 10);
	const la = ((200.0 / Math.PI) * yFromLstar(50.0)) / 100.0;
	let d = f * (1.0 - (1.0 / 3.6) * Math.exp((-la - 42.0) / 92.0));
	d = d > 1 ? 1 : d < 0 ? 0 : d;
	const rgbD = [d * (100 / rW) + 1 - d, d * (100 / gW) + 1 - d, d * (100 / bW) + 1 - d];
	const k = 1 / (5 * la + 1),
		k4 = k ** 4,
		k4F = 1 - k4;
	const fl = k4 * la + 0.1 * k4F * k4F * Math.cbrt(5 * la);
	const n = yFromLstar(50.0) / WHITE[1];
	const z = 1.48 + Math.sqrt(n);
	const nbb = 0.725 / Math.pow(n, 0.2);
	const rA = [
		Math.pow((fl * rgbD[0] * rW) / 100, 0.42),
		Math.pow((fl * rgbD[1] * gW) / 100, 0.42),
		Math.pow((fl * rgbD[2] * bW) / 100, 0.42)
	];
	const rgbA = [
		(400 * rA[0]) / (rA[0] + 27.13),
		(400 * rA[1]) / (rA[1] + 27.13),
		(400 * rA[2]) / (rA[2] + 27.13)
	];
	const aw = (2 * rgbA[0] + rgbA[1] + 0.05 * rgbA[2]) * nbb;
	return { n, aw, nbb, ncb: nbb, c, nc: f, rgbD, fl, z };
})();

function cam16HueChroma(x: number, y: number, z: number) {
	const rC = 0.401288 * x + 0.650173 * y - 0.051461 * z;
	const gC = -0.250268 * x + 1.204414 * y + 0.045854 * z;
	const bC = -0.002079 * x + 0.048952 * y + 0.953127 * z;
	const rD = VC.rgbD[0] * rC,
		gD = VC.rgbD[1] * gC,
		bD = VC.rgbD[2] * bC;
	const rAF = Math.pow((VC.fl * Math.abs(rD)) / 100, 0.42);
	const gAF = Math.pow((VC.fl * Math.abs(gD)) / 100, 0.42);
	const bAF = Math.pow((VC.fl * Math.abs(bD)) / 100, 0.42);
	const rA = (signum(rD) * 400 * rAF) / (rAF + 27.13);
	const gA = (signum(gD) * 400 * gAF) / (gAF + 27.13);
	const bA = (signum(bD) * 400 * bAF) / (bAF + 27.13);
	const a = (11 * rA - 12 * gA + bA) / 11;
	const b = (rA + gA - 2 * bA) / 9;
	const u = (20 * rA + 20 * gA + 21 * bA) / 20;
	const p2 = (40 * rA + 20 * gA + bA) / 20;
	const atanDeg = (Math.atan2(b, a) * 180) / Math.PI;
	const hue = atanDeg < 0 ? atanDeg + 360 : atanDeg >= 360 ? atanDeg - 360 : atanDeg;
	const ac = p2 * VC.nbb;
	const J = 100 * Math.pow(ac / VC.aw, VC.c * VC.z);
	const huePrime = hue < 20.14 ? hue + 360 : hue;
	const eHue = 0.25 * (Math.cos((huePrime * Math.PI) / 180 + 2) + 3.8);
	const p1 = (50000 / 13) * eHue * VC.nc * VC.ncb;
	const t = (p1 * Math.sqrt(a * a + b * b)) / (u + 0.305);
	const alpha = Math.pow(t, 0.9) * Math.pow(1.64 - Math.pow(0.29, VC.n), 0.73);
	const C = alpha * Math.sqrt(J / 100);
	return { hue, C };
}
function rgbToHctParts(r: number, g: number, b: number) {
	const lr = toLin(r) * 100,
		lg = toLin(g) * 100,
		lb = toLin(b) * 100;
	const x = dot3(SRGB_TO_XYZ[0], [lr, lg, lb]);
	const y = dot3(SRGB_TO_XYZ[1], [lr, lg, lb]);
	const z = dot3(SRGB_TO_XYZ[2], [lr, lg, lb]);
	const cam = cam16HueChroma(x, y, z);
	return { h: cam.hue, c: cam.C, t: lstarFromY(y) };
}

const XYZ65_TO_LINRGB = [
	[3.2409699419045226, -1.537383177570094, -0.4986107602930034],
	[-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
	[0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
function labToRgbTriplet(L: number, a: number, b: number): [number, number, number] {
	const fy = (L + 16) / 116,
		fx = fy + a / 500,
		fz = fy - b / 200;
	const X = (labInvf(fx) * WHITE[0]) / 100;
	const Y = (labInvf(fy) * WHITE[1]) / 100;
	const Z = (labInvf(fz) * WHITE[2]) / 100;
	return [
		fromLin(dot3(XYZ65_TO_LINRGB[0], [X, Y, Z])),
		fromLin(dot3(XYZ65_TO_LINRGB[1], [X, Y, Z])),
		fromLin(dot3(XYZ65_TO_LINRGB[2], [X, Y, Z]))
	];
}
const inGamutEps = (t: [number, number, number], eps = 1e-4) =>
	t.every((v) => v >= -eps && v <= 1 + eps);
const clamp3 = (t: [number, number, number]): [number, number, number] => [
	Math.max(0, Math.min(1, t[0])),
	Math.max(0, Math.min(1, t[1])),
	Math.max(0, Math.min(1, t[2]))
];

function hctToRgb(col: Record<string, number | undefined>): Rgb {
	const h = col.h ?? 0,
		c = col.c ?? 0,
		t = col.t ?? 0;
	if (t <= 0.01) return rgb(0, 0, 0, col.alpha);
	if (t >= 99.99) return rgb(1, 1, 1, col.alpha);
	if (c < 0.5) {
		const g = clamp3(labToRgbTriplet(t, 0, 0));
		return rgb(g[0], g[1], g[2], col.alpha);
	}
	let phi = (h * Math.PI) / 180;
	let best = clamp3(labToRgbTriplet(t, 0, 0));
	for (let iter = 0; iter < 16; iter++) {
		const cos = Math.cos(phi),
			sin = Math.sin(phi);
		// largest in-gamut Lab radius at this tone & hue-angle
		let lo = 0,
			hi = 200;
		for (let i = 0; i < 28; i++) {
			const mid = (lo + hi) / 2;
			if (inGamutEps(labToRgbTriplet(t, mid * cos, mid * sin))) lo = mid;
			else hi = mid;
		}
		const gmax = lo;
		const camCAt = (r: number) => rgbToHctParts(...clamp3(labToRgbTriplet(t, r * cos, r * sin))).c;
		// radius whose CAM16 chroma hits the target (clamped to the gamut max)
		let a = 0,
			b = gmax;
		for (let i = 0; i < 26; i++) {
			const mid = (a + b) / 2;
			if (camCAt(mid) < c) a = mid;
			else b = mid;
		}
		const r = camCAt(gmax) < c ? gmax : (a + b) / 2;
		best = clamp3(labToRgbTriplet(t, r * cos, r * sin));
		const got = rgbToHctParts(...best);
		let err = h - got.h;
		while (err > 180) err -= 360;
		while (err < -180) err += 360;
		if (Math.abs(err) < 0.02) break;
		phi += (err * Math.PI) / 180;
	}
	return rgb(best[0], best[1], best[2], col.alpha);
}
function rgbToHct(col: Record<string, number | undefined>) {
	const { h, c, t } = rgbToHctParts(col.r ?? 0, col.g ?? 0, col.b ?? 0);
	return withAlpha({ mode: 'hct', h, c, t }, col.alpha);
}

useMode({
	mode: 'hct',
	channels: ['h', 'c', 't', 'alpha'],
	ranges: { h: [0, 360], c: [0, 145], t: [0, 100] },
	interpolate: interp(['h', 'c', 't', 'alpha']),
	toMode: { rgb: hctToRgb },
	fromMode: { rgb: rgbToHct },
	parse: [],
	serialize: 'hct'
} as unknown as Parameters<typeof useMode>[0]);
