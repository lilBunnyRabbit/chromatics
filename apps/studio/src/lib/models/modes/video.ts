/**
 * Video / broadcast luma–chroma spaces. Each is an affine transform of
 * gamma-encoded R'G'B' (culori's `rgb`): YCC = M·R'G'B' + offset. Rec.2100 is
 * the exception — PQ-encoded Rec.2020, connected through xyz65. All verified to
 * round-trip exactly.
 */
import { defMode, mul3, inv3, type Vec } from './shared';

export interface VideoSpace {
	id: string;
	label: string;
	/** channel descriptors: [luma, chroma1, chroma2]. */
	chan: { key: string; label: string }[];
	M: number[][]; // R'G'B' → YCC
	off: [number, number, number];
	chroma: [number, number]; // indices of the two chroma channels
}

export const VIDEO_SPACES: VideoSpace[] = [
	{
		id: 'ypbpr',
		label: 'YPbPr',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'pb', label: 'Pb' },
			{ key: 'pr', label: 'Pr' }
		],
		M: [
			[0.299, 0.587, 0.114],
			[-0.168736, -0.331264, 0.5],
			[0.5, -0.418688, -0.081312]
		],
		off: [0, 0, 0],
		chroma: [1, 2]
	},
	{
		id: 'ycbcr',
		label: 'YCbCr (Rec.709)',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'cb', label: 'Cb' },
			{ key: 'cr', label: 'Cr' }
		],
		M: [
			[0.2126, 0.7152, 0.0722],
			[-0.114572, -0.385428, 0.5],
			[0.5, -0.454153, -0.045847]
		],
		off: [0, 0.5, 0.5],
		chroma: [1, 2]
	},
	{
		id: 'rec601',
		label: 'Rec.601 YCbCr',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'cb', label: 'Cb' },
			{ key: 'cr', label: 'Cr' }
		],
		M: [
			[0.299, 0.587, 0.114],
			[-0.168736, -0.331264, 0.5],
			[0.5, -0.418688, -0.081312]
		],
		off: [0, 0.5, 0.5],
		chroma: [1, 2]
	},
	{
		id: 'yuv',
		label: 'YUV (PAL)',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'u', label: 'U' },
			{ key: 'v', label: 'V' }
		],
		M: [
			[0.299, 0.587, 0.114],
			[-0.14713, -0.28886, 0.436],
			[0.615, -0.51499, -0.10001]
		],
		off: [0, 0, 0],
		chroma: [1, 2]
	},
	{
		id: 'ydbdr',
		label: 'YDbDr',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'db', label: 'Db' },
			{ key: 'dr', label: 'Dr' }
		],
		M: [
			[0.299, 0.587, 0.114],
			[-0.45, -0.883, 1.333],
			[-1.333, 1.116, 0.217]
		],
		off: [0, 0, 0],
		chroma: [1, 2]
	},
	{
		id: 'secam',
		label: 'SECAM (YDbDr)',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'db', label: 'Db' },
			{ key: 'dr', label: 'Dr' }
		],
		M: [
			[0.299, 0.587, 0.114],
			[-0.45, -0.883, 1.333],
			[-1.333, 1.116, 0.217]
		],
		off: [0, 0, 0],
		chroma: [1, 2]
	},
	{
		id: 'ycgco',
		label: 'YCgCo',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'cg', label: 'Cg' },
			{ key: 'co', label: 'Co' }
		],
		M: [
			[0.25, 0.5, 0.25],
			[-0.25, 0.5, -0.25],
			[0.5, 0, -0.5]
		],
		off: [0, 0, 0],
		chroma: [1, 2]
	},
	{
		id: 'ycocgr',
		label: 'YCoCg-R',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'co', label: 'Co' },
			{ key: 'cg', label: 'Cg' }
		],
		M: [
			[0.25, 0.5, 0.25],
			[0.5, 0, -0.5],
			[-0.25, 0.5, -0.25]
		],
		off: [0, 0, 0],
		chroma: [1, 2]
	},
	{
		id: 'sycc',
		label: 'sYCC',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'cb', label: 'Cb' },
			{ key: 'cr', label: 'Cr' }
		],
		M: [
			[0.299, 0.587, 0.114],
			[-0.168736, -0.331264, 0.5],
			[0.5, -0.418688, -0.081312]
		],
		off: [0, 0.5, 0.5],
		chroma: [1, 2]
	},
	{
		id: 'xvycc',
		label: 'xvYCC',
		chan: [
			{ key: 'y', label: "Y'" },
			{ key: 'cb', label: 'Cb' },
			{ key: 'cr', label: 'Cr' }
		],
		M: [
			[0.2126, 0.7152, 0.0722],
			[-0.114572, -0.385428, 0.5],
			[0.5, -0.454153, -0.045847]
		],
		off: [0, 0.5, 0.5],
		chroma: [1, 2]
	}
];

for (const s of VIDEO_SPACES) {
	const mi = inv3(s.M);
	const names = s.chan.map((c) => c.key);
	defMode(
		s.id,
		names,
		'rgb',
		(c) => {
			// mode → rgb primaries
			const v: Vec = [
				(c[names[0]] ?? 0) - s.off[0],
				(c[names[1]] ?? 0) - s.off[1],
				(c[names[2]] ?? 0) - s.off[2]
			];
			return mul3(mi, v);
		},
		(c) => {
			// rgb → mode channels
			const y = mul3(s.M, [c.r ?? 0, c.g ?? 0, c.b ?? 0]);
			return [y[0] + s.off[0], y[1] + s.off[1], y[2] + s.off[2]];
		}
	);
}

// --- Rec.2100 (PQ-encoded Rec.2020), via xyz65 ---
const REC2020_XYZ = [
	[0.6369580483, 0.1446169036, 0.1688809752],
	[0.262700212, 0.6779980715, 0.0593017165],
	[0, 0.028072693, 1.0609850577]
];
const XYZ_REC2020 = [
	[1.716651188, -0.3556707838, -0.2533662814],
	[-0.6666843518, 1.6164812366, 0.0157685458],
	[0.0176398574, -0.0427706133, 0.9421031212]
];
const PQ_M1 = 0.1593017578125,
	PQ_M2 = 78.84375,
	PQ_C1 = 0.8359375,
	PQ_C2 = 18.8515625,
	PQ_C3 = 18.6875;
export const pqEncode = (L: number) => {
	const Lp = Math.pow(Math.max(L, 0), PQ_M1);
	return Math.pow((PQ_C1 + PQ_C2 * Lp) / (1 + PQ_C3 * Lp), PQ_M2);
};
export const pqDecode = (N: number) => {
	const Np = Math.pow(Math.max(N, 0), 1 / PQ_M2);
	return Math.pow(Math.max(Np - PQ_C1, 0) / (PQ_C2 - PQ_C3 * Np), 1 / PQ_M1);
};
defMode(
	'rec2100',
	['r', 'g', 'b'],
	'xyz65',
	(c) => mul3(REC2020_XYZ, [pqDecode(c.r ?? 0), pqDecode(c.g ?? 0), pqDecode(c.b ?? 0)] as Vec),
	(c) => {
		const lin = mul3(XYZ_REC2020, [c.x ?? 0, c.y ?? 0, c.z ?? 0] as Vec);
		return [pqEncode(lin[0]), pqEncode(lin[1]), pqEncode(lin[2])];
	}
);
