/**
 * A couple more real spaces: CMY (subtractive, no black) and LMS (cone
 * fundamentals via the Hunt-Pointer-Estevez matrix). Both verified to
 * round-trip.
 */
import { defMode, mul3, type Vec } from './shared';

// --- CMY (subtractive primaries, no key) ---
defMode(
	'cmy',
	['c', 'm', 'y'],
	'rgb',
	(col) => [1 - (col.c ?? 0), 1 - (col.m ?? 0), 1 - (col.y ?? 0)],
	(col) => [1 - (col.r ?? 0), 1 - (col.g ?? 0), 1 - (col.b ?? 0)],
	{ c: [0, 1], m: [0, 1], y: [0, 1] }
);

// --- LMS (cone responses; Hunt-Pointer-Estevez, normalised to D65) ---
const HPE = [
	[0.38971, 0.68898, -0.07868],
	[-0.22981, 1.1834, 0.04641],
	[0, 0, 1]
];
const HPE_INV = [
	[1.910197, -1.112124, 0.201908],
	[0.37095, 0.629054, -0.000008],
	[0, 0, 1]
];
defMode(
	'lms',
	['l', 'm', 's'],
	'xyz65',
	(col) => mul3(HPE_INV, [col.l ?? 0, col.m ?? 0, col.s ?? 0] as Vec),
	(col) => mul3(HPE, [col.x ?? 0, col.y ?? 0, col.z ?? 0] as Vec),
	{ l: [0, 1], m: [0, 1], s: [0, 1] }
);
