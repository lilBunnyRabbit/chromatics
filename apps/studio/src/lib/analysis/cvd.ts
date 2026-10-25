/** Vision-deficiency and condition simulation, applied as a per-surface view transform. */
import { Srgb, type Color } from '@lilbunnyrabbit/chromatics';
import { simulateCvd } from '@lilbunnyrabbit/chromatics/cvd';

export type VisionSimulation =
	| 'none'
	| 'protanopia'
	| 'deuteranopia'
	| 'tritanopia'
	| 'grayscale'
	| 'low-contrast'
	| 'high-contrast'
	| 'low-brightness'
	| 'high-saturation'
	| 'low-saturation';

export const visionSimulations: { value: VisionSimulation; label: string }[] = [
	{ value: 'none', label: 'Normal vision' },
	{ value: 'protanopia', label: 'Protanopia (no red)' },
	{ value: 'deuteranopia', label: 'Deuteranopia (no green)' },
	{ value: 'tritanopia', label: 'Tritanopia (no blue)' },
	{ value: 'grayscale', label: 'Grayscale' },
	{ value: 'low-contrast', label: 'Low contrast' },
	{ value: 'high-contrast', label: 'High contrast' },
	{ value: 'low-brightness', label: 'Low brightness' },
	{ value: 'high-saturation', label: 'High saturation' },
	{ value: 'low-saturation', label: 'Low saturation' }
];

type Filter = (c: Srgb) => Srgb;

const simFilters: Record<VisionSimulation, Filter | null> = {
	none: null,
	protanopia: (c) => simulateCvd(c, 'protan'),
	deuteranopia: (c) => simulateCvd(c, 'deutan'),
	tritanopia: (c) => simulateCvd(c, 'tritan'),
	grayscale: (c) => c.filter('grayscale', 1),
	'low-contrast': (c) => c.filter('contrast', 0.5),
	'high-contrast': (c) => c.filter('contrast', 1.8),
	'low-brightness': (c) => c.filter('brightness', 0.5),
	'high-saturation': (c) => c.filter('saturate', 2),
	'low-saturation': (c) => c.filter('saturate', 0.3)
};

/** `color` as seen under `sim`: a new Srgb colour, or `color` itself for normal vision. */
export function simulateVision(color: Color, sim: VisionSimulation): Color {
	const filter = simFilters[sim];
	return filter ? filter(color.to(Srgb)) : color;
}
