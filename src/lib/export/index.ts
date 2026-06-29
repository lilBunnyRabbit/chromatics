/** Scheme → string exporters. All pure and testable. */
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
	return `oklch(${f(e.color.channel('ok_l'), 5)} ${f(e.color.channel('ok_c'), 5)} ${f(e.color.channel('ok_h'), 5)})`;
}

/** :root { --name: oklch(...); } in each color's canonical CSS. */
export function toCssVars(scheme: Scheme): string {
	if (!scheme.entries.length) return ':root {\n}';
	const lines = scheme.entries.map((e) => `  --${kebab(e.name)}: ${e.color.toCSS()};`);
	return `:root {\n${lines.join('\n')}\n}`;
}

/** W3C Design Token (DTCG) JSON. */
export function toTokens(scheme: Scheme): string {
	const obj: Record<string, unknown> = {};
	for (const e of scheme.entries) {
		obj[e.name] = {
			$type: 'color',
			$value: e.color.hex,
			$extensions: {
				'com.chromatics': {
					oklch: e.color.toCSS(),
					model: e.model,
					...(e.description ? { source: e.description } : {})
				}
			}
		};
	}
	return JSON.stringify(obj, null, 2);
}

/** Tailwind v4 @theme block + a legacy config colors object. */
export function toTailwind(scheme: Scheme): string {
	const theme = scheme.entries.map((e) => `  --color-${kebab(e.name)}: ${e.color.hex};`).join('\n');
	const colors = scheme.entries
		.map((e) => `        '${kebab(e.name)}': '${e.color.hex}',`)
		.join('\n');
	return `@theme {\n${theme}\n}\n\n/* legacy tailwind.config.js */\nexport default {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      }\n    }\n  }\n};`;
}

/** Aligned markdown table: name | hex | oklch | comment. */
export function toMarkdown(scheme: Scheme): string {
	if (!scheme.entries.length) return '';
	const rows = scheme.entries.map((e) => ({
		name: e.name,
		hex: e.color.hex,
		oklch: fmtOklch(e),
		comment: e.description ?? ''
	}));
	const w = {
		name: Math.max(4, ...rows.map((r) => r.name.length)),
		hex: Math.max(3, ...rows.map((r) => r.hex.length)),
		oklch: Math.max(5, ...rows.map((r) => r.oklch.length)),
		comment: Math.max(7, ...rows.map((r) => r.comment.length))
	};
	const pad = (s: string, n: number) => s + ' '.repeat(n - s.length);
	const sep = `| ${'-'.repeat(w.name)} | ${'-'.repeat(w.hex)} | ${'-'.repeat(w.oklch)} | ${'-'.repeat(w.comment)} |`;
	const header = `| ${pad('name', w.name)} | ${pad('hex', w.hex)} | ${pad('oklch', w.oklch)} | ${pad('comment', w.comment)} |`;
	const body = rows.map(
		(r) =>
			`| ${pad(r.name, w.name)} | ${pad(r.hex, w.hex)} | ${pad(r.oklch, w.oklch)} | ${pad(r.comment, w.comment)} |`
	);
	return [header, sep, ...body].join('\n');
}

export type ExportFormat = 'css' | 'tokens' | 'tailwind' | 'markdown' | 'swatch';

export const EXPORT_FORMATS: { id: ExportFormat; label: string; lang: string }[] = [
	{ id: 'css', label: 'CSS variables', lang: 'css' },
	{ id: 'tokens', label: 'DTCG tokens', lang: 'json' },
	{ id: 'tailwind', label: 'Tailwind', lang: 'js' },
	{ id: 'markdown', label: 'Markdown', lang: 'md' },
	{ id: 'swatch', label: 'Swatch sheet', lang: 'svg' }
];

export function exportScheme(scheme: Scheme, format: ExportFormat): string {
	switch (format) {
		case 'css':
			return toCssVars(scheme);
		case 'tokens':
			return toTokens(scheme);
		case 'tailwind':
			return toTailwind(scheme);
		case 'markdown':
			return toMarkdown(scheme);
		case 'swatch':
			return toSwatchSVG(scheme);
	}
}
