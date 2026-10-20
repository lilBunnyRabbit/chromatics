/**
 * Vision-deficiency & condition simulation (the 10-mode set from master:oklch.ts),
 * re-typed against ColorValue. Applied as a per-surface view transform.
 */
import { ColorValue } from '../models/index.js';
import {
	filterDeficiencyProt,
	filterDeficiencyDeuter,
	filterDeficiencyTrit,
	filterGrayscale,
	filterContrast,
	filterBrightness,
	filterSaturate,
	type CuloriColor
} from '../models/registry.js';

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

type Filter = (c: CuloriColor) => CuloriColor;

const simFilters: Record<VisionSimulation, Filter | null> = {
	none: null,
	protanopia: filterDeficiencyProt(1) as Filter,
	deuteranopia: filterDeficiencyDeuter(1) as Filter,
	tritanopia: filterDeficiencyTrit(1) as Filter,
	grayscale: filterGrayscale(1) as Filter,
	'low-contrast': filterContrast(0.5) as Filter,
	'high-contrast': filterContrast(1.8) as Filter,
	'low-brightness': filterBrightness(0.5) as Filter,
	'high-saturation': filterSaturate(2) as Filter,
	'low-saturation': filterSaturate(0.3) as Filter
};

export function simulateVision(color: ColorValue, sim: VisionSimulation): ColorValue {
	const filter = simFilters[sim];
	if (!filter) return color;
	return ColorValue.from(filter(color.project('oklch')));
}
