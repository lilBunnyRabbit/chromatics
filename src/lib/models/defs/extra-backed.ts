/**
 * Extra culori-backed spaces that were trivial wins:
 *  - xyz50: CIE XYZ under D50 — the ICC profile-connection space.
 *  - xyb:   JPEG-XL's opponent space (LMS-derived X/Y/B).
 * Both are exact, so they ship as stable.
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { mkDeltaEuclidean } from '../families';
import { ColorValue } from '../value';
import { method, num, p } from '../util';

register(
	defineModel({
		id: 'xyz50',
		mode: 'xyz50',
		label: 'CIE XYZ (D50)',
		family: 'tristimulus',
		ctor: {
			name: 'XYZ50',
			params: [p('x'), p('y'), p('z')],
			build: ([x, y, z]) => ({ mode: 'xyz50', x, y, z }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'xyz50_x', localKey: 'x', label: 'X', culoriField: 'x', range: [0, 1] },
			{ key: 'xyz50_y', localKey: 'y', label: 'Y (luminance)', culoriField: 'y', range: [0, 1] },
			{ key: 'xyz50_z', localKey: 'z', label: 'Z', culoriField: 'z', range: [0, 1] }
		],
		ownMethods: [
			method(
				'scaleLuminance',
				[p('factor')],
				'color',
				'Scale luminance (X,Y,Z) preserving chromaticity',
				(self, [f]) => {
					const c = self.project('xyz50') as unknown as Record<string, number | undefined>;
					const k = num(f);
					return ColorValue.from({
						mode: 'xyz50',
						x: (c.x ?? 0) * k,
						y: (c.y ?? 0) * k,
						z: (c.z ?? 0) * k
					} as unknown as CuloriColor);
				}
			)
		]
	})
);

register(
	defineModel({
		id: 'xyb',
		mode: 'xyb',
		label: 'XYB (JPEG-XL)',
		family: 'tristimulus',
		ctor: {
			name: 'XYB',
			params: [p('x'), p('y'), p('b')],
			build: ([x, y, b]) => ({ mode: 'xyb', x, y, b }) as unknown as CuloriColor
		},
		channels: [
			{
				key: 'xyb_x',
				localKey: 'x',
				label: 'X (red–green)',
				culoriField: 'x',
				range: [-0.03, 0.03]
			},
			{ key: 'xyb_y', localKey: 'y', label: 'Y (luminance)', culoriField: 'y', range: [0, 1] },
			{
				key: 'xyb_b',
				localKey: 'b',
				label: 'B (blue–yellow)',
				culoriField: 'b',
				range: [-0.5, 0.5]
			}
		],
		ownMethods: [mkDeltaEuclidean('deltaExyb', 'xyb', 'Euclidean XYB color difference')]
	})
);
