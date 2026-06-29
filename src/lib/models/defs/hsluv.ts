/**
 * HSLuv + HPLuv — perceptually-uniform HSL. Faithful reference math (hsluv.org)
 * via the custom `hsluv` / `hpluv` culori modes. Real, but hand-rolled →
 * experimental. HSLuv keeps colors inside the sRGB gamut at full saturation;
 * HPLuv trades gamut coverage for constant perceived saturation (pastels).
 */
import { register, defineModel, type CuloriColor } from '../registry';
import { mkRotateHueNative } from '../families';
import { ColorValue } from '../value';
import { method, num, clamp01, p } from '../util';

register(
	defineModel({
		id: 'hsluv',
		mode: 'hsluv',
		label: 'HSLuv',
		family: 'hue',
		status: 'experimental',
		ctor: {
			name: 'HSLUV',
			params: [p('h'), p('s'), p('l')],
			build: ([h, s, l]) => ({ mode: 'hsluv', h, s, l }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hsluv_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{ key: 'hsluv_s', localKey: 's', label: 'Saturation', culoriField: 's', range: [0, 100] },
			{ key: 'hsluv_l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 100] }
		],
		ownMethods: [
			mkRotateHueNative('hsluv'),
			method(
				'saturate',
				[p('amount')],
				'color',
				'Add to perceptual saturation (0–100)',
				(self, [a]) => {
					const c = self.project('hsluv') as unknown as Record<string, number | undefined>;
					return ColorValue.from({
						mode: 'hsluv',
						h: c.h ?? 0,
						s: Math.max(0, Math.min(100, (c.s ?? 0) + num(a))),
						l: c.l ?? 0
					} as unknown as CuloriColor);
				}
			),
			method(
				'withLightness',
				[p('l')],
				'color',
				'Set perceptual lightness (0–100)',
				(self, [l]) => {
					const c = self.project('hsluv') as unknown as Record<string, number | undefined>;
					return ColorValue.from({
						mode: 'hsluv',
						h: c.h ?? 0,
						s: c.s ?? 0,
						l: clamp01(num(l) / 100) * 100
					} as unknown as CuloriColor);
				}
			)
		]
	})
);

register(
	defineModel({
		id: 'hpluv',
		mode: 'hpluv',
		label: 'HPLuv (pastel)',
		family: 'hue',
		status: 'experimental',
		ctor: {
			name: 'HPLUV',
			params: [p('h'), p('p'), p('l')],
			build: ([h, pp, l]) => ({ mode: 'hpluv', h, p: pp, l }) as unknown as CuloriColor
		},
		channels: [
			{ key: 'hpluv_h', localKey: 'h', label: 'Hue', culoriField: 'h', range: [0, 360] },
			{
				key: 'hpluv_p',
				localKey: 'p',
				label: 'Saturation (pastel)',
				culoriField: 'p',
				range: [0, 100]
			},
			{ key: 'hpluv_l', localKey: 'l', label: 'Lightness', culoriField: 'l', range: [0, 100] }
		],
		ownMethods: [mkRotateHueNative('hpluv')]
	})
);
