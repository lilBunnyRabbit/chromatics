/** Extra device-independent perceptual spaces — each with ΔE / native hue. */
import { register, defineModel, type CuloriColor } from '../registry';
import { LAB_OPS, mkRotateHueNative, mkDeltaEuclidean } from '../families';
import { p } from '../util';

// CIE Luv + LCh(uv)
register(
	defineModel({
		id: 'luv',
		label: 'CIE Luv',
		family: 'lab',
		ctor: {
			name: 'LUV',
			params: [p('l'), p('u'), p('v')],
			build: ([l, u, v]) => ({ mode: 'luv', l, u, v }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'luv_l', localKey: 'l', label: 'L*', culoriField: 'l', range: [0, 100] },
			{ key: 'luv_u', localKey: 'u', label: 'u*', culoriField: 'u', range: [-134, 220] },
			{ key: 'luv_v', localKey: 'v', label: 'v*', culoriField: 'v', range: [-140, 122] }
		],
		ownMethods: [mkDeltaEuclidean('deltaEuv', 'luv', 'Euclidean CIE Luv color difference')],
		inherit: LAB_OPS
	})
);
register(
	defineModel({
		id: 'lchuv',
		label: 'CIE LCh(uv)',
		family: 'perceptual-cylindrical',
		ctor: {
			name: 'LCHUV',
			params: [p('l'), p('c'), p('h')],
			build: ([l, c, h]) => ({ mode: 'lchuv', l, c, h }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'lchuv_l', localKey: 'l', label: 'L*', culoriField: 'l', range: [0, 100] },
			{ key: 'lchuv_c', localKey: 'c', label: 'C*', culoriField: 'c', range: [0, 150] },
			{ key: 'lchuv_h', localKey: 'h', label: 'h', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [mkRotateHueNative('lchuv')],
		inherit: LAB_OPS
	})
);

// CIE Lab / LCh at D65
register(
	defineModel({
		id: 'lab65',
		label: 'CIE Lab (D65)',
		family: 'lab',
		ctor: {
			name: 'LAB65',
			params: [p('l'), p('a'), p('b')],
			build: ([l, a, b]) => ({ mode: 'lab65', l, a, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'lab65_l', localKey: 'l', label: 'L*', culoriField: 'l', range: [0, 100] },
			{ key: 'lab65_a', localKey: 'a', label: 'a*', culoriField: 'a', range: [-128, 128] },
			{ key: 'lab65_b', localKey: 'b', label: 'b*', culoriField: 'b', range: [-128, 128] }
		],
		inherit: LAB_OPS
	})
);
register(
	defineModel({
		id: 'lch65',
		label: 'CIE LCh (D65)',
		family: 'perceptual-cylindrical',
		ctor: {
			name: 'LCH65',
			params: [p('l'), p('c'), p('h')],
			build: ([l, c, h]) => ({ mode: 'lch65', l, c, h }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'lch65_l', localKey: 'l', label: 'L*', culoriField: 'l', range: [0, 100] },
			{ key: 'lch65_c', localKey: 'c', label: 'C*', culoriField: 'c', range: [0, 150] },
			{ key: 'lch65_h', localKey: 'h', label: 'h', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [mkRotateHueNative('lch65')],
		inherit: LAB_OPS
	})
);

// DIN99o — designed for a near-Euclidean ΔE99
register(
	defineModel({
		id: 'dlab',
		label: 'DIN99o Lab',
		family: 'lab',
		ctor: {
			name: 'DLAB',
			params: [p('l'), p('a'), p('b')],
			build: ([l, a, b]) => ({ mode: 'dlab', l, a, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'dlab_l', localKey: 'l', label: 'L99', culoriField: 'l', range: [0, 100] },
			{ key: 'dlab_a', localKey: 'a', label: 'a99', culoriField: 'a', range: [-55, 55] },
			{ key: 'dlab_b', localKey: 'b', label: 'b99', culoriField: 'b', range: [-55, 55] }
		],
		ownMethods: [mkDeltaEuclidean('deltaE99', 'dlab', 'DIN99o color difference (ΔE99)')],
		inherit: LAB_OPS
	})
);
register(
	defineModel({
		id: 'dlch',
		label: 'DIN99o LCh',
		family: 'perceptual-cylindrical',
		ctor: {
			name: 'DLCH',
			params: [p('l'), p('c'), p('h')],
			build: ([l, c, h]) => ({ mode: 'dlch', l, c, h }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'dlch_l', localKey: 'l', label: 'L99', culoriField: 'l', range: [0, 100] },
			{ key: 'dlch_c', localKey: 'c', label: 'C99', culoriField: 'c', range: [0, 60] },
			{ key: 'dlch_h', localKey: 'h', label: 'h99', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [mkRotateHueNative('dlch')],
		inherit: LAB_OPS
	})
);

// JzAzBz / JzCzHz — HDR-capable perceptual
register(
	defineModel({
		id: 'jab',
		label: 'JzAzBz',
		family: 'lab',
		ctor: {
			name: 'JAB',
			params: [p('j'), p('a'), p('b')],
			build: ([j, a, b]) => ({ mode: 'jab', j, a, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'jab_j', localKey: 'j', label: 'Jz', culoriField: 'j', range: [0, 0.17] },
			{ key: 'jab_a', localKey: 'a', label: 'az', culoriField: 'a', range: [-0.1, 0.1] },
			{ key: 'jab_b', localKey: 'b', label: 'bz', culoriField: 'b', range: [-0.1, 0.1] }
		],
		ownMethods: [mkDeltaEuclidean('deltaEz', 'jab', 'JzAzBz color difference (ΔEz, HDR-friendly)')],
		inherit: LAB_OPS
	})
);
register(
	defineModel({
		id: 'jch',
		label: 'JzCzHz',
		family: 'perceptual-cylindrical',
		ctor: {
			name: 'JCH',
			params: [p('j'), p('c'), p('h')],
			build: ([j, c, h]) => ({ mode: 'jch', j, c, h }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'jch_j', localKey: 'j', label: 'Jz', culoriField: 'j', range: [0, 0.17] },
			{ key: 'jch_c', localKey: 'c', label: 'Cz', culoriField: 'c', range: [0, 0.16] },
			{ key: 'jch_h', localKey: 'h', label: 'hz', culoriField: 'h', range: [0, 360] }
		],
		ownMethods: [mkRotateHueNative('jch')],
		inherit: LAB_OPS
	})
);

// ICtCp — HDR video perceptual
register(
	defineModel({
		id: 'itp',
		label: 'ICtCp',
		family: 'lab',
		ctor: {
			name: 'ITP',
			params: [p('i'), p('t'), p('cp')],
			build: ([i, t, cp]) => ({ mode: 'itp', i, t, p: cp }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'itp_i', localKey: 'i', label: 'I (intensity)', culoriField: 'i', range: [0, 1] },
			{ key: 'itp_t', localKey: 't', label: 'Ct', culoriField: 't', range: [-0.5, 0.5] },
			{ key: 'itp_p', localKey: 'p', label: 'Cp', culoriField: 'p', range: [-0.5, 0.5] }
		],
		ownMethods: [mkDeltaEuclidean('deltaEitp', 'itp', 'ICtCp color difference (HDR)')],
		inherit: LAB_OPS
	})
);
