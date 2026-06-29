/**
 * RGB working/colour spaces: a set of primaries (linear matrix to/from XYZ) plus
 * a transfer function. All connect through culori's xyz65. The ACES spaces are
 * D60-referenced (faithfully — ACES white is ~D60, so ACES white renders a touch
 * warm on a D65 display); scRGB and SMPTE-C are D65.
 */
import { defMode, mul3, type Vec } from './shared';

const id = (x: number) => x;

// --- linear primaries matrices ---
const AP0_XYZ = [
	[0.9525523959, 0, 0.0000936786],
	[0.3439664498, 0.7281660966, -0.0721325464],
	[0, 0, 1.0088251844]
];
const XYZ_AP0 = [
	[1.0498110175, 0, -0.0000974845],
	[-0.4959030231, 1.3733130458, 0.0982400361],
	[0, 0, 0.9912520182]
];
const AP1_XYZ = [
	[0.6624541811, 0.1340042065, 0.156187687],
	[0.2722287168, 0.6740817658, 0.0536895174],
	[-0.0055746495, 0.0040607335, 1.0103391003]
];
const XYZ_AP1 = [
	[1.6410233797, -0.3248032942, -0.2364246952],
	[-0.6636628587, 1.6153315917, 0.0167563477],
	[0.0117218943, -0.008284442, 0.9883948585]
];
const SRGB_XYZ = [
	[0.4123907993, 0.3575843394, 0.1804807884],
	[0.2126390059, 0.7151686788, 0.0721923154],
	[0.0193308187, 0.1191947798, 0.9505321522]
];
const XYZ_SRGB = [
	[3.2409699419, -1.5373831776, -0.4986107603],
	[-0.9692436363, 1.8759675015, 0.0415550574],
	[0.0556300797, -0.2039769589, 1.0569715142]
];
const SMPTEC_XYZ = [
	[0.3935209, 0.3652581, 0.1916769],
	[0.2123764, 0.7010599, 0.0865638],
	[0.0187391, 0.1119339, 0.9583847]
];
const XYZ_SMPTEC = [
	[3.505396, -1.7394894, -0.543964],
	[-1.0690722, 1.9778245, 0.0351722],
	[0.05632, -0.1970226, 1.0502026]
];

// --- ACES log transfers ---
const lin2cc = (l: number) =>
	l <= 0
		? (-16 + 9.72) / 17.52
		: l < 2 ** -15
			? (Math.log2(2 ** -16 + l * 0.5) + 9.72) / 17.52
			: (Math.log2(l) + 9.72) / 17.52;
const cc2lin = (c: number) => {
	const lo = (9.72 - 15) / 17.52;
	return c <= lo
		? (2 ** (c * 17.52 - 9.72) - 2 ** -16) * 2
		: c < (Math.log2(65504) + 9.72) / 17.52
			? 2 ** (c * 17.52 - 9.72)
			: 65504;
};
const XB = 0.0078125,
	CB = 0.0729055341958355,
	CA = 10.5402377416545,
	YB = CA * XB + CB;
const lin2cct = (l: number) => (l <= XB ? CA * l + CB : (Math.log2(l) + 9.72) / 17.52);
const cct2lin = (c: number) => (c > YB ? 2 ** (c * 17.52 - 9.72) : (c - CB) / CA);

export interface WorkingSpace {
	id: string;
	label: string;
	toX: number[][];
	fromX: number[][];
	enc: (x: number) => number; // linear → stored
	dec: (x: number) => number; // stored → linear
	scene: boolean; // scene-referred (exposure is meaningful)
}

export const RGB_WORKING: WorkingSpace[] = [
	{
		id: 'aces',
		label: 'ACES2065-1 (AP0)',
		toX: AP0_XYZ,
		fromX: XYZ_AP0,
		enc: id,
		dec: id,
		scene: true
	},
	{
		id: 'acescg',
		label: 'ACEScg (AP1)',
		toX: AP1_XYZ,
		fromX: XYZ_AP1,
		enc: id,
		dec: id,
		scene: true
	},
	{
		id: 'acescc',
		label: 'ACEScc',
		toX: AP1_XYZ,
		fromX: XYZ_AP1,
		enc: lin2cc,
		dec: cc2lin,
		scene: true
	},
	{
		id: 'acescct',
		label: 'ACEScct',
		toX: AP1_XYZ,
		fromX: XYZ_AP1,
		enc: lin2cct,
		dec: cct2lin,
		scene: true
	},
	{ id: 'scrgb', label: 'scRGB', toX: SRGB_XYZ, fromX: XYZ_SRGB, enc: id, dec: id, scene: true },
	{
		id: 'smptec',
		label: 'SMPTE-C',
		toX: SMPTEC_XYZ,
		fromX: XYZ_SMPTEC,
		enc: id,
		dec: id,
		scene: false
	}
];

for (const w of RGB_WORKING) {
	defMode(
		w.id,
		['r', 'g', 'b'],
		'xyz65',
		(c) => mul3(w.toX, [w.dec(c.r ?? 0), w.dec(c.g ?? 0), w.dec(c.b ?? 0)] as Vec), // mode → xyz
		(c) => {
			const lin = mul3(w.fromX, [c.x ?? 0, c.y ?? 0, c.z ?? 0] as Vec); // xyz → mode
			return [w.enc(lin[0]), w.enc(lin[1]), w.enc(lin[2])];
		},
		{ r: [0, 1], g: [0, 1], b: [0, 1] }
	);
}
