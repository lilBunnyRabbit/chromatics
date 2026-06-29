/** Extra hue / cylindrical spaces, including the perceptual ok-hue spaces. */
import { register, defineModel, type CuloriColor } from '../registry';
import { HUE_OPS, LAB_OPS, mkRotateHueNative } from '../families';
import { p } from '../util';

register(
	defineModel({
		id: 'hsi',
		label: 'HSI',
		family: 'hue',
		ctor: {
			name: 'HSI',
			params: [p('h'), p('s'), p('i')],
			build: ([h, s, i]) => ({ mode: 'hsi', h, s, i }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hsi_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'hsi_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{ key: 'hsi_i', localKey: 'i', label: 'Intensity', culoriField: 'i', range: [0, 1] }
		],
		inherit: HUE_OPS
	})
);

register(
	defineModel({
		id: 'okhsl',
		label: 'Okhsl',
		family: 'perceptual-cylindrical',
		priority: 'high',
		ctor: {
			name: 'OKHSL',
			params: [p('h'), p('s'), p('l')],
			build: ([h, s, l]) => ({ mode: 'okhsl', h, s, l }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'okhsl_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'okhsl_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{ key: 'okhsl_l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 1] }
		],
		ownMethods: [mkRotateHueNative('okhsl')],
		inherit: LAB_OPS
	})
);
register(
	defineModel({
		id: 'okhsv',
		label: 'Okhsv',
		family: 'perceptual-cylindrical',
		ctor: {
			name: 'OKHSV',
			params: [p('h'), p('s'), p('v')],
			build: ([h, s, v]) => ({ mode: 'okhsv', h, s, v }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'okhsv_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'okhsv_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{ key: 'okhsv_v', localKey: 'v', label: 'Value', culoriField: 'v', range: [0, 1] }
		],
		ownMethods: [mkRotateHueNative('okhsv')],
		inherit: LAB_OPS
	})
);

register(
	defineModel({
		id: 'cubehelix',
		label: 'Cubehelix',
		family: 'hue',
		ctor: {
			name: 'CUBEHELIX',
			params: [p('h'), p('s'), p('l')],
			build: ([h, s, l]) => ({ mode: 'cubehelix', h, s, l }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'cube_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'cube_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 4] },
			{ key: 'cube_l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 1] }
		],
		ownMethods: [mkRotateHueNative('cubehelix')]
	})
);
