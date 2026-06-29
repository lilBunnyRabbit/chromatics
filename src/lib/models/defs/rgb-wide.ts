/** Wide-gamut RGB working spaces. Same a11y/CVD features as sRGB + own gamut. */
import { register, defineModel, inGamut, type CuloriColor } from '../registry';
import { RGB_OPS } from '../families';
import { accessor, p } from '../util';

function wideRgb(id: string, label: string) {
	register(
		defineModel({
			id,
			label,
			family: 'rgb',
			priority: 'high',
			ctor: {
				name: id.toUpperCase(),
				params: [p('r'), p('g'), p('b')],
				build: ([r, g, b]) => ({ mode: id, r, g, b }) as unknown as CuloriColor
			},
			channels: [
				{ key: `${id}_r`, localKey: 'r', label: 'Red', culoriField: 'r', range: [0, 1] },
				{ key: `${id}_g`, localKey: 'g', label: 'Green', culoriField: 'g', range: [0, 1] },
				{ key: `${id}_b`, localKey: 'b', label: 'Blue', culoriField: 'b', range: [0, 1] }
			],
			ownMethods: [
				accessor(
					'isInGamut',
					'boolean',
					`Displayable in ${label}`,
					(self) =>
						!!(inGamut(id as Parameters<typeof inGamut>[0]) as (c: CuloriColor) => boolean)(
							self.project(id)
						)
				)
			],
			inherit: RGB_OPS
		})
	);
}

wideRgb('a98', 'Adobe RGB');
wideRgb('prophoto', 'ProPhoto RGB');
wideRgb('rec2020', 'Rec. 2020');
