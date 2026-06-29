/**
 * Vault models that are advertised but not implementable as a plain pointwise
 * sRGB transform — perceptual concepts (Impossible Color, iCAM), dimensionality-
 * losing or device-specific spaces (RG chromaticity, CcMmYK), or under-specified
 * legacy encodings (YJK). They surface in docs/autocomplete and throw an
 * actionable error on use.
 */
import { register, defineModel } from '../registry';
import type { Family } from '../types';
import { method, accessor, unbacked } from '../util';

interface Soon {
	id: string;
	label: string;
	family: Family;
	method: string;
	kind: 'method' | 'accessor';
	doc: string;
}

const SOON: Soon[] = [
	{
		id: 'impossible',
		label: 'Impossible Color',
		family: 'other',
		method: 'chimerical',
		kind: 'accessor',
		doc: 'Imaginary/chimerical colour outside the human gamut'
	},
	{
		id: 'icam',
		label: 'iCAM',
		family: 'other',
		method: 'appearance',
		kind: 'method',
		doc: 'Image colour-appearance prediction (spatial)'
	},
	{
		id: 'rgchroma',
		label: 'rg Chromaticity',
		family: 'other',
		method: 'chromaticity',
		kind: 'accessor',
		doc: 'Normalised r,g chromaticity (drops luminance)'
	},
	{
		id: 'rgcolor',
		label: 'RG Colour Model',
		family: 'other',
		method: 'mix',
		kind: 'method',
		doc: 'Two-primary red/green historical model'
	},
	{
		id: 'gl',
		label: 'GL (float RGB)',
		family: 'other',
		method: 'toFloat',
		kind: 'method',
		doc: 'OpenGL normalised float RGBA'
	},
	{
		id: 'ccmmyk',
		label: 'CcMmYK (hi-fi)',
		family: 'subtractive',
		method: 'separations',
		kind: 'method',
		doc: 'Six-ink light-cyan/light-magenta process (needs an ICC profile)'
	},
	{
		id: 'yjk',
		label: 'YJK (MSX)',
		family: 'video',
		method: 'decode',
		kind: 'method',
		doc: 'MSX2 YJK luma/chroma encoding'
	}
];

for (const s of SOON) {
	register(
		defineModel({
			id: s.id,
			label: s.label,
			family: s.family,
			status: 'coming-soon',
			ownMethods: [
				s.kind === 'accessor'
					? accessor(s.method, 'color', s.doc, () => unbacked(s.label))
					: method(s.method, [], 'color', s.doc, () => unbacked(s.label))
			]
		})
	);
}
