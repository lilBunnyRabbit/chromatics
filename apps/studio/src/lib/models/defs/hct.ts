/**
 * HCT (Material) — CAM16 Hue, CAM16 Chroma, CIELAB Tone (L*). Faithful CAM16
 * (matches Material's published HCT) via the custom `hct` culori mode; the
 * tone/hue solver round-trips saturated colors to the exact hex. Hand-rolled →
 * experimental. The headline feature is Material's tonal palette.
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { ColorValue, type DSLValue } from '../value';
import { method, num, wrapHue, p } from '../util';

type Hct = { h: number; c: number; t: number };
function hctOf(self: ColorValue): Hct {
	const c = self.project('hct') as unknown as Record<string, number | undefined>;
	return { h: c.h ?? 0, c: c.c ?? 0, t: c.t ?? 0 };
}
function fromHct(o: Hct): ColorValue {
	return ColorValue.from({ mode: 'hct', ...o } as unknown as CuloriColor);
}

/** Material's default tonal-palette tones (0 = black, 100 = white). */
const DEFAULT_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

register(
	defineModel({
		id: 'hct',
		mode: 'hct',
		label: 'HCT (Material)',
		family: 'perceptual-cylindrical',
		status: 'experimental',
		ctor: {
			name: 'HCT',
			params: [p('h'), p('c'), p('t')],
			build: ([h, c, t]) => ({ mode: 'hct', h, c, t }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hct_h', localKey: 'h', label: 'Hue (CAM16)', culoriField: 'h', range: [0, 360] },
			{ key: 'hct_c', localKey: 'c', label: 'Chroma (CAM16)', culoriField: 'c', range: [0, 145] },
			{ key: 'hct_t', localKey: 't', label: 'Tone (L*)', culoriField: 't', range: [0, 100] }
		],
		ownMethods: [
			method('rotateHue', [p('degrees')], 'color', 'Rotate the CAM16 hue', (self, [d]) => {
				const { h, c, t } = hctOf(self);
				return fromHct({ h: wrapHue(h + num(d)), c, t });
			}),
			method(
				'atTone',
				[p('tone')],
				'color',
				'Same hue & chroma at a given tone (L* 0–100)',
				(self, [tn]) => {
					const { h, c } = hctOf(self);
					return fromHct({ h, c, t: Math.max(0, Math.min(100, num(tn))) });
				}
			),
			method(
				'withChroma',
				[p('chroma')],
				'color',
				'Same hue & tone at a given CAM16 chroma',
				(self, [cc]) => {
					const { h, t } = hctOf(self);
					return fromHct({ h, c: Math.max(0, num(cc)), t });
				}
			),
			method(
				'tonalPalette',
				[p('tones', 'object', { optional: true })],
				'colors',
				'Material tonal palette — this hue/chroma sampled across tones',
				(self, [tones]) => {
					const { h, c } = hctOf(self);
					const list = Array.isArray(tones)
						? (tones as DSLValue[]).map((x) => num(x))
						: DEFAULT_TONES;
					return list.map((t) => fromHct({ h, c, t: Math.max(0, Math.min(100, t)) }));
				}
			),
			method(
				'materialRoles',
				[],
				'colors',
				'Material 3 key tones [primary 40, container 90, on-container 10, on-primary 100]',
				(self) => {
					const { h, c } = hctOf(self);
					return [40, 90, 10, 100].map((t) => fromHct({ h, c, t }));
				}
			)
		]
	})
);
