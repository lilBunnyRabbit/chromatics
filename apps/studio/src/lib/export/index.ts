/**
 * The studio's Export tab: its format menu and dispatcher over the package exporters. `css` is the palette
 * (every color variable); role CSS comes from the studio's `cssVars`.
 */
import {
	toPaletteVars,
	toTokens,
	toTailwind,
	toMarkdown,
	toSwatchSVG,
	DEFAULT_COLOR_FORMAT,
	type ColorFormat
} from '@lilbunnyrabbit/chromatics-dsl/export';
import type { Scheme } from '../scheme/types.js';

/** The CSS-renderable models — the menu for single-model output and the fallback. */
export const CSS_COLOR_MODELS: { id: string; label: string }[] = [
	{ id: 'hex', label: 'Hex' },
	{ id: 'Oklch', label: 'OKLCH' },
	{ id: 'Oklab', label: 'OKLab' },
	{ id: 'Lab', label: 'CIELAB' },
	{ id: 'Lch', label: 'CIELCH' },
	{ id: 'Hsl', label: 'HSL' },
	{ id: 'Hwb', label: 'HWB' },
	{ id: 'Srgb', label: 'sRGB' },
	{ id: 'DisplayP3', label: 'Display P3' },
	{ id: 'Rec2020', label: 'Rec. 2020' },
	{ id: 'A98Rgb', label: 'A98 RGB' },
	{ id: 'ProphotoRgb', label: 'ProPhoto' },
	{ id: 'LinearSrgb', label: 'Linear sRGB' },
	{ id: 'Xyz65', label: 'XYZ (D65)' },
	{ id: 'Xyz50', label: 'XYZ (D50)' }
];

export type ExportFormat = 'css' | 'tokens' | 'tailwind' | 'markdown' | 'swatch';

/** Formats whose output is affected by the ColorFormat representation. */
export const COLOR_FORMATTED: ReadonlySet<ExportFormat> = new Set<ExportFormat>([
	'css',
	'tokens',
	'tailwind',
	'markdown'
]);

export const EXPORT_FORMATS: { id: ExportFormat; label: string; lang: string }[] = [
	{ id: 'css', label: 'CSS variables', lang: 'css' },
	{ id: 'tokens', label: 'DTCG tokens', lang: 'json' },
	{ id: 'tailwind', label: 'Tailwind', lang: 'js' },
	{ id: 'markdown', label: 'Markdown', lang: 'md' },
	{ id: 'swatch', label: 'Swatch sheet', lang: 'svg' }
];

export function exportScheme(
	scheme: Scheme,
	format: ExportFormat,
	fmt: ColorFormat = DEFAULT_COLOR_FORMAT
): string {
	switch (format) {
		case 'css':
			return toPaletteVars(scheme, fmt);
		case 'tokens':
			return toTokens(scheme, fmt);
		case 'tailwind':
			return toTailwind(scheme, fmt);
		case 'markdown':
			return toMarkdown(scheme, fmt);
		case 'swatch':
			return toSwatchSVG(scheme);
	}
}
