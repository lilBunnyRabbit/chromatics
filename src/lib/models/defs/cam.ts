/**
 * Colour-appearance models (backed by custom modes in modes/cam):
 *  - CAM16 / CIECAM02 — JCh correlates, with a native hue rotation.
 *  - CAM16-UCS — the uniform J′a′b′ form whose Euclidean distance is one of the
 *    best perceptual colour-difference metrics (its headline `deltaE`).
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { mkRotateHueNative, mkDeltaEuclidean } from '../families';
import { p } from '../util';

register(
	defineModel({
		id: 'cam16',
		mode: 'cam16',
		label: 'CAM16',
		family: 'perceptual-cylindrical',
		status: 'experimental',
		ctor: {
			name: 'CAM16',
			params: [p('j'), p('c'), p('h')],
			build: ([j, c, h]) => ({ mode: 'cam16', j, c, h }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'cam16_j', localKey: 'j', label: 'J (lightness)', culoriField: 'j', range: [0, 100] },
			{ key: 'cam16_c', localKey: 'c', label: 'C (chroma)', culoriField: 'c', range: [0, 150] },
			{ key: 'cam16_h', localKey: 'h', label: 'h (hue)', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [mkRotateHueNative('cam16')]
	})
);

register(
	defineModel({
		id: 'cam16ucs',
		mode: 'cam16ucs',
		label: 'CAM16-UCS',
		family: 'lab',
		status: 'experimental',
		ctor: {
			name: 'CAM16UCS',
			params: [p('j'), p('a'), p('b')],
			build: ([j, a, b]) => ({ mode: 'cam16ucs', j, a, b }) as unknown as CuloriColor
		},
		channels: [
			{
				key: 'cam16ucs_j',
				localKey: 'j',
				label: 'J′ (lightness)',
				culoriField: 'j',
				range: [0, 100]
			},
			{
				key: 'cam16ucs_a',
				localKey: 'a',
				label: 'a′ (red–green)',
				culoriField: 'a',
				range: [-50, 50]
			},
			{
				key: 'cam16ucs_b',
				localKey: 'b',
				label: 'b′ (yellow–blue)',
				culoriField: 'b',
				range: [-50, 50]
			}
		],
		ownMethods: [
			mkDeltaEuclidean(
				'deltaE',
				'cam16ucs',
				'CAM16-UCS colour difference (ΔE′, perceptually uniform)'
			)
		]
	})
);

register(
	defineModel({
		id: 'ciecam02',
		mode: 'ciecam02',
		label: 'CIECAM02',
		family: 'perceptual-cylindrical',
		status: 'experimental',
		ctor: {
			name: 'CIECAM02',
			params: [p('j'), p('c'), p('h')],
			build: ([j, c, h]) => ({ mode: 'ciecam02', j, c, h }) as unknown as CuloriColor
		},
		channels: [
			{
				key: 'ciecam02_j',
				localKey: 'j',
				label: 'J (lightness)',
				culoriField: 'j',
				range: [0, 100]
			},
			{ key: 'ciecam02_c', localKey: 'c', label: 'C (chroma)', culoriField: 'c', range: [0, 150] },
			{ key: 'ciecam02_h', localKey: 'h', label: 'h (hue)', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [mkRotateHueNative('ciecam02')]
	})
);
