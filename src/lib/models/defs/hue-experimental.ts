/**
 * Hue/other experimental models: HSP, TSL, RYB. Each carries a manipulation
 * characteristic of the space — HSP rotates hue at constant perceived
 * brightness, RYB blends like paint (blue + yellow → green).
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { ColorValue } from '../value';
import { method, num, color, wrapHue, assertSameModel, p } from '../util';

// --- HSP ---
register(
	defineModel({
		id: 'hsp',
		mode: 'hsp',
		label: 'HSP (brightness)',
		family: 'hue',
		status: 'experimental',
		ctor: {
			name: 'HSP',
			params: [p('h'), p('s'), p('p')],
			build: ([h, s, pp]) => ({ mode: 'hsp', h, s, p: pp }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hsp_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'hsp_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{
				key: 'hsp_p',
				localKey: 'p',
				label: 'Perceived brightness',
				culoriField: 'p',
				range: [0, 1]
			}
		],
		ownMethods: [
			method(
				'rotateHue',
				[p('degrees')],
				'color',
				'Rotate hue at constant perceived brightness',
				(self, [d]) => {
					const c = self.project('hsp') as unknown as Record<string, number | undefined>;
					return ColorValue.from({
						mode: 'hsp',
						h: wrapHue((c.h ?? 0) + num(d)),
						s: c.s ?? 0,
						p: c.p ?? 0
					} as unknown as CuloriColor);
				}
			)
		]
	})
);

// --- TSL ---
register(
	defineModel({
		id: 'tsl',
		mode: 'tsl',
		label: 'TSL',
		family: 'hue',
		status: 'experimental',
		ctor: {
			name: 'TSL',
			params: [p('t'), p('s'), p('l')],
			build: ([t, s, l]) => ({ mode: 'tsl', t, s, l }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'tsl_t', localKey: 't', label: 'Tint (0–1)', culoriField: 't', range: [0, 1] },
			{ key: 'tsl_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 1] },
			{ key: 'tsl_l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 1] }
		],
		ownMethods: [
			method(
				'rotateTint',
				[p('degrees')],
				'color',
				'Rotate the tint angle (hue analogue)',
				(self, [d]) => {
					const c = self.project('tsl') as unknown as Record<string, number | undefined>;
					let t = (c.t ?? 0) + num(d) / 360;
					t = ((t % 1) + 1) % 1;
					return ColorValue.from({
						mode: 'tsl',
						t,
						s: c.s ?? 0,
						l: c.l ?? 0
					} as unknown as CuloriColor);
				}
			)
		]
	})
);

// --- RYB ---
register(
	defineModel({
		id: 'ryb',
		mode: 'ryb',
		label: 'RYB (artists’ wheel)',
		family: 'subtractive',
		status: 'experimental',
		ctor: {
			name: 'RYB',
			params: [p('r'), p('y'), p('b')],
			build: ([r, y, b]) => ({ mode: 'ryb', r, y, b }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'ryb_r', localKey: 'r', label: 'Red', culoriField: 'r', range: [0, 1] },
			{ key: 'ryb_y', localKey: 'y', label: 'Yellow', culoriField: 'y', range: [0, 1] },
			{ key: 'ryb_b', localKey: 'b', label: 'Blue', culoriField: 'b', range: [0, 1] }
		],
		ownMethods: [
			method(
				'mix',
				[p('other', 'color'), p('t', 'number', { optional: true })],
				'color',
				'Mix like paint on the RYB wheel (blue + yellow → green)',
				(self, [o, t]) => {
					const a = self.project('ryb') as unknown as Record<string, number | undefined>;
					assertSameModel(self, color(o), 'mix');
					const b = color(o).project('ryb') as unknown as Record<string, number | undefined>;
					const r = t === undefined ? 0.5 : num(t);
					const lerp = (k: string) => (a[k] ?? 0) * (1 - r) + (b[k] ?? 0) * r;
					return ColorValue.from({
						mode: 'ryb',
						r: lerp('r'),
						y: lerp('y'),
						b: lerp('b')
					} as unknown as CuloriColor);
				}
			)
		]
	})
);
