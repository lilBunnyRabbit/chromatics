/** Scheme → string exporters. All pure and testable. */
import { Oklch, Srgb, Srgb8, type Color } from '@lilbunnyrabbit/chromatics';
import { infoByName } from '../color/catalog.js';
import type { Scheme, SchemeEntry } from '../scheme/types.js';
import { toSwatchSVG } from './swatch.js';

export { toSwatchSVG } from './swatch.js';

export function kebab(name: string): string {
	return name
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/^-+|-+$/g, '')
		.toLowerCase();
}

function fmtOklch(e: SchemeEntry): string {
	const f = (v: number, d: number) => {
		const s = v.toFixed(d);
		return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
	};
	const { l, c, h } = e.color.to(Oklch);
	return `oklch(${f(l, 5)} ${f(c, 5)} ${f(h, 5)})`;
}

// ── Color representation ────────────────────────────────────────────────────
// How a color is written into an export. Two modes (per the studio's promise of
// "any color, any model"):
//   • as-defined — keep each color in the model it was AUTHORED in when that's a
//     valid CSS color; otherwise fall through to a selectable fallback model.
//   • single     — normalise every color into one chosen model.
// Only CSS-valid models are offered (see CSS_COLOR_MODELS), so the output always
// renders in a browser.

export type ColorFormatMode = 'as-defined' | 'single';

export interface ColorFormat {
	mode: ColorFormatMode;
	/** as-defined → fallback model for non-CSS colors; single → the target model. `hex` or a model name. */
	model: string;
}

export const DEFAULT_COLOR_FORMAT: ColorFormat = { mode: 'as-defined', model: 'hex' };

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

// CSS Color 4 predefined-RGB and XYZ spaces accepted inside color(); anything else won't render.
const CSS_PREDEFINED = new Set([
	'srgb',
	'srgb-linear',
	'display-p3',
	'a98-rgb',
	'prophoto-rgb',
	'rec2020',
	'xyz',
	'xyz-d50',
	'xyz-d65'
]);
const CSS_FUNCS = /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\(/i;

/** Whether a serialized color string actually renders as CSS. */
export function isCssColor(css: string): boolean {
	if (!css) return false;
	if (css[0] === '#') return true;
	if (CSS_FUNCS.test(css)) return true;
	const m = /^color\(\s*([a-z0-9-]+)/i.exec(css);
	return m ? CSS_PREDEFINED.has(m[1].toLowerCase()) : false;
}

function cssOf(color: Color): string | null {
	const css = (color as Color & { toCss?: () => string }).toCss?.();
	return css && isCssColor(css) ? css : null;
}

function formatIn(color: Color, model: string): string | null {
	if (model === 'hex') return color.to(Srgb).gamutMap().to(Srgb8).toHex();
	const info = infoByName(model);
	return info ? cssOf(color.to(info.model)) : null;
}

/** Serialize one entry's color per the chosen ColorFormat (always valid CSS). */
export function serializeColor(
	entry: SchemeEntry,
	fmt: ColorFormat = DEFAULT_COLOR_FORMAT
): string {
	if (fmt.mode === 'single')
		return formatIn(entry.color, fmt.model) ?? entry.color.to(Srgb).gamutMap().to(Srgb8).toHex();
	return (
		cssOf(entry.color) ??
		formatIn(entry.color, fmt.model) ??
		entry.color.to(Srgb).gamutMap().to(Srgb8).toHex()
	);
}

/** :root { --name: <color>; } — each color per the chosen representation. */
export function toCssVars(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
	if (!scheme.entries.length) return ':root {\n}';
	const lines = scheme.entries.map((e) => `  --${kebab(e.name)}: ${serializeColor(e, fmt)};`);
	return `:root {\n${lines.join('\n')}\n}`;
}

/** W3C Design Token (DTCG) JSON. */
export function toTokens(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
	const obj: Record<string, unknown> = {};
	for (const e of scheme.entries) {
		obj[e.name] = {
			$type: 'color',
			$value: serializeColor(e, fmt),
			$extensions: {
				'com.chromatics': {
					hex: e.color.to(Srgb).gamutMap().to(Srgb8).toHex(),
					oklch: fmtOklch(e),
					model: e.color.model,
					...(e.description ? { source: e.description } : {})
				}
			}
		};
	}
	return JSON.stringify(obj, null, 2);
}

/** Tailwind v4 @theme block + a legacy config colors object. */
export function toTailwind(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
	const theme = scheme.entries
		.map((e) => `  --color-${kebab(e.name)}: ${serializeColor(e, fmt)};`)
		.join('\n');
	const colors = scheme.entries
		.map((e) => `        '${kebab(e.name)}': '${serializeColor(e, fmt)}',`)
		.join('\n');
	return `@theme {\n${theme}\n}\n\n/* legacy tailwind.config.js */\nexport default {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n};`;
}

/** Aligned markdown table: name | value | oklch | comment. */
export function toMarkdown(scheme: Scheme, fmt: ColorFormat = DEFAULT_COLOR_FORMAT): string {
	if (!scheme.entries.length) return '';
	const rows = scheme.entries.map((e) => ({
		name: e.name,
		value: serializeColor(e, fmt),
		oklch: fmtOklch(e),
		comment: e.description ?? ''
	}));
	const w = {
		name: Math.max(4, ...rows.map((r) => r.name.length)),
		value: Math.max(5, ...rows.map((r) => r.value.length)),
		oklch: Math.max(5, ...rows.map((r) => r.oklch.length)),
		comment: Math.max(7, ...rows.map((r) => r.comment.length))
	};
	const pad = (s: string, n: number) => s + ' '.repeat(n - s.length);
	const sep = `| ${'-'.repeat(w.name)} | ${'-'.repeat(w.value)} | ${'-'.repeat(w.oklch)} | ${'-'.repeat(w.comment)} |`;
	const header = `| ${pad('name', w.name)} | ${pad('value', w.value)} | ${pad('oklch', w.oklch)} | ${pad('comment', w.comment)} |`;
	const body = rows.map(
		(r) =>
			`| ${pad(r.name, w.name)} | ${pad(r.value, w.value)} | ${pad(r.oklch, w.oklch)} | ${pad(r.comment, w.comment)} |`
	);
	return [header, sep, ...body].join('\n');
}

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
			return toCssVars(scheme, fmt);
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
