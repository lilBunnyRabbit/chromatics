/**
 * XYZ-derived spaces (closed-form, backed by custom modes in modes/xyz-derived).
 * Each exposes a manipulation characteristic of the space, not just channel
 * getters: xyY desaturates toward the white point, the 1960 UCS computes CCT,
 * IPT rotates hue in its hue-linear plane, etc.
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { mkDeltaEuclidean } from '../families';
import { ColorValue } from '../value';
import { method, accessor, num, color, assertSameModel, p } from '../util';

const WX = 0.3127;
const WY = 0.329; // D65 chromaticity

// --- CIE xyY ---
register(
	defineModel({
		id: 'xyy',
		mode: 'xyy',
		label: 'CIE xyY',
		family: 'tristimulus',
		status: 'experimental',
		ctor: {
			name: 'XYY',
			params: [p('x'), p('y'), p('Y')],
			build: ([x, y, Y]) => ({ mode: 'xyy', x, y, Y }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'xyy_x', localKey: 'x', label: 'x (chromaticity)', culoriField: 'x', range: [0, 0.8] },
			{ key: 'xyy_y', localKey: 'y', label: 'y (chromaticity)', culoriField: 'y', range: [0, 0.9] },
			{ key: 'xyy_Y', localKey: 'Y', label: 'Y (luminance)', culoriField: 'Y', range: [0, 1] }
		],
		ownMethods: [
			method(
				'desaturate',
				[p('amount')],
				'color',
				'Move chromaticity toward the D65 white point (0–1)',
				(self, [a]) => {
					const c = self.project('xyy') as unknown as Record<string, number | undefined>;
					const t = num(a);
					return ColorValue.from({
						mode: 'xyy',
						x: (c.x ?? 0) + (WX - (c.x ?? 0)) * t,
						y: (c.y ?? 0) + (WY - (c.y ?? 0)) * t,
						Y: c.Y ?? 0
					} as unknown as CuloriColor);
				}
			),
			method(
				'setLuminance',
				[p('Y')],
				'color',
				'Set Y luminance, keeping chromaticity',
				(self, [y]) => {
					const c = self.project('xyy') as unknown as Record<string, number | undefined>;
					return ColorValue.from({
						mode: 'xyy',
						x: c.x ?? 0,
						y: c.y ?? 0,
						Y: Math.max(0, num(y))
					} as unknown as CuloriColor);
				}
			)
		]
	})
);

// --- CIE 1976 UCS (u'v'Y) ---
register(
	defineModel({
		id: 'ucs',
		mode: 'ucs',
		label: 'CIE 1976 UCS',
		family: 'tristimulus',
		status: 'experimental',
		ctor: {
			name: 'UCS',
			params: [p('u'), p('v'), p('Y')],
			build: ([u, v, Y]) => ({ mode: 'ucs', u, v, Y }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'ucs_u', localKey: 'u', label: "u'", culoriField: 'u', range: [0, 0.7] },
			{ key: 'ucs_v', localKey: 'v', label: "v'", culoriField: 'v', range: [0, 0.6] },
			{ key: 'ucs_Y', localKey: 'Y', label: 'Y (luminance)', culoriField: 'Y', range: [0, 1] }
		],
		ownMethods: [
			method(
				'blendUniform',
				[p('other', 'color'), p('t', 'number', { optional: true })],
				'color',
				'Blend in the perceptually-uniform chromaticity plane',
				(self, [o, t]) => {
					const a = self.project('ucs') as unknown as Record<string, number | undefined>;
					assertSameModel(self, color(o), 'blendUniform');
					const b = color(o).project('ucs') as unknown as Record<string, number | undefined>;
					const r = t === undefined ? 0.5 : num(t);
					const lerp = (k: string) => (a[k] ?? 0) * (1 - r) + (b[k] ?? 0) * r;
					return ColorValue.from({
						mode: 'ucs',
						u: lerp('u'),
						v: lerp('v'),
						Y: lerp('Y')
					} as unknown as CuloriColor);
				}
			)
		]
	})
);

// --- CIE 1960 UCS (uvY) — the space CCT is defined in ---
function cctMcCamy(self: ColorValue): number {
	const c = self.project('xyy') as unknown as Record<string, number | undefined>;
	const x = c.x ?? 0,
		y = c.y ?? 0;
	const n = (x - 0.332) / (0.1858 - y);
	return 449 * n ** 3 + 3525 * n ** 2 + 6823.3 * n + 5520.33;
}
register(
	defineModel({
		id: 'ucs60',
		mode: 'ucs60',
		label: 'CIE 1960 UCS',
		family: 'tristimulus',
		status: 'experimental',
		ctor: {
			name: 'UCS60',
			params: [p('u'), p('v'), p('Y')],
			build: ([u, v, Y]) => ({ mode: 'ucs60', u, v, Y }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'ucs60_u', localKey: 'u', label: 'u', culoriField: 'u', range: [0, 0.7] },
			{ key: 'ucs60_v', localKey: 'v', label: 'v', culoriField: 'v', range: [0, 0.4] },
			{ key: 'ucs60_Y', localKey: 'Y', label: 'Y (luminance)', culoriField: 'Y', range: [0, 1] }
		],
		ownMethods: [
			accessor('cct', 'number', 'Correlated colour temperature in K (McCamy)', (self) =>
				cctMcCamy(self)
			),
			accessor('isWarm', 'boolean', 'CCT below 5000 K', (self) => cctMcCamy(self) < 5000)
		]
	})
);

// --- CIE 1964 U*V*W* ---
register(
	defineModel({
		id: 'uvw',
		mode: 'uvw',
		label: 'CIE 1964 U*V*W*',
		family: 'tristimulus',
		status: 'experimental',
		ctor: {
			name: 'UVW',
			params: [p('u'), p('v'), p('w')],
			build: ([u, v, w]) => ({ mode: 'uvw', u, v, w }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'uvw_u', localKey: 'u', label: 'U*', culoriField: 'u', range: [-100, 100] },
			{ key: 'uvw_v', localKey: 'v', label: 'V*', culoriField: 'v', range: [-100, 100] },
			{ key: 'uvw_w', localKey: 'w', label: 'W*', culoriField: 'w', range: [0, 100] }
		],
		ownMethods: [mkDeltaEuclidean('deltaE', 'uvw', 'Euclidean colour difference in U*V*W*')]
	})
);

// --- Hunter Lab ---
register(
	defineModel({
		id: 'hlab',
		mode: 'hlab',
		label: 'Hunter Lab',
		family: 'lab',
		status: 'experimental',
		ctor: {
			name: 'HLAB',
			params: [p('l'), p('a'), p('b')],
			build: ([l, a, b]) => ({ mode: 'hlab', l, a, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hlab_l', localKey: 'l', label: 'L', culoriField: 'l', range: [0, 100] },
			{ key: 'hlab_a', localKey: 'a', label: 'a', culoriField: 'a', range: [-100, 100] },
			{ key: 'hlab_b', localKey: 'b', label: 'b', culoriField: 'b', range: [-100, 100] }
		],
		ownMethods: [mkDeltaEuclidean('deltaE', 'hlab', 'Hunter colour difference (ΔE, Hunter units)')]
	})
);

// --- IPT (hue-linear) ---
register(
	defineModel({
		id: 'ipt',
		mode: 'ipt',
		label: 'IPT',
		family: 'lab',
		status: 'experimental',
		ctor: {
			name: 'IPT',
			params: [p('i'), p('p'), p('t')],
			build: ([i, pp, t]) => ({ mode: 'ipt', i, p: pp, t }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'ipt_i', localKey: 'i', label: 'I (intensity)', culoriField: 'i', range: [0, 1] },
			{
				key: 'ipt_p',
				localKey: 'p',
				label: 'P (red–green)',
				culoriField: 'p',
				range: [-0.75, 0.75]
			},
			{
				key: 'ipt_t',
				localKey: 't',
				label: 'T (yellow–blue)',
				culoriField: 't',
				range: [-0.75, 0.75]
			}
		],
		ownMethods: [
			method(
				'rotateHue',
				[p('degrees')],
				'color',
				'Rotate hue in IPT (its hue-linear P–T plane)',
				(self, [d]) => {
					const c = self.project('ipt') as unknown as Record<string, number | undefined>;
					const rad = (num(d) * Math.PI) / 180;
					const cos = Math.cos(rad),
						sin = Math.sin(rad);
					const pp = c.p ?? 0,
						tt = c.t ?? 0;
					return ColorValue.from({
						mode: 'ipt',
						i: c.i ?? 0,
						p: pp * cos - tt * sin,
						t: pp * sin + tt * cos
					} as unknown as CuloriColor);
				}
			),
			mkDeltaEuclidean('deltaE', 'ipt', 'Euclidean colour difference in IPT')
		]
	})
);
