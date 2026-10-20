/**
 * Standalone SVG swatch sheet — a shareable image of the palette for Slack,
 * Figma, or a brand doc. Self-contained markup (system font, no external refs)
 * so it rasterizes cleanly to PNG via an <img>/canvas round-trip.
 */
import type { Scheme, SchemeEntry } from '../scheme/types.js';

function fmtOklch(e: SchemeEntry): string {
	const f = (v: number, d: number) => {
		const s = v.toFixed(d);
		return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
	};
	return `oklch(${f(e.color.channel('ok_l'), 3)} ${f(e.color.channel('ok_c'), 4)} ${f(e.color.channel('ok_h'), 1)})`;
}

/** Readable label color (black/white) over a given swatch, by relative luminance. */
function labelOn(e: SchemeEntry): string {
	const lin = (v: number) => {
		v = Math.min(1, Math.max(0, v));
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	const Y =
		0.2126 * lin(e.color.channel('r')) +
		0.7152 * lin(e.color.channel('g')) +
		0.0722 * lin(e.color.channel('b'));
	return Y > 0.36 ? '#11181c' : '#ffffff';
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Relative luminance of a #rgb / #rrggbb string; falls back to "light" (1). */
function hexLuminance(hex: string): number {
	const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
	if (!m) return 1;
	let h = m[1];
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	const lin = (v: number) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	const r = lin(parseInt(h.slice(0, 2), 16));
	const g = lin(parseInt(h.slice(2, 4), 16));
	const b = lin(parseInt(h.slice(4, 6), 16));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export interface SwatchOptions {
	title?: string;
	columns?: number;
	/** Sheet background (hex). Title text auto-adapts for legibility. */
	background?: string;
}

/** Build a complete, self-contained SVG document for the scheme's colors. */
export function toSwatchSVG(scheme: Scheme, opts: SwatchOptions = {}): string {
	const title = opts.title ?? 'Chromatics palette';
	const sheetBg = opts.background ?? '#fbfcfd';
	const lightSheet = hexLuminance(sheetBg) > 0.4;
	const titleColor = lightSheet ? '#11181c' : '#ffffff';
	const subColor = lightSheet ? '#687076' : 'rgba(255,255,255,0.72)';
	const entries = scheme.entries;
	const cols = Math.max(1, Math.min(opts.columns ?? (entries.length <= 6 ? entries.length : 4), 6));
	const rows = Math.ceil(entries.length / cols) || 1;

	const pad = 28;
	const headerH = 56;
	const cardW = 200;
	const cardH = 132;
	const gap = 16;
	const swatchH = 80;

	const width = pad * 2 + cols * cardW + (cols - 1) * gap;
	const height = headerH + pad * 2 + rows * cardH + (rows - 1) * gap;

	const cards = entries
		.map((e, i) => {
			const cx = pad + (i % cols) * (cardW + gap);
			const cy = headerH + pad + Math.floor(i / cols) * (cardH + gap);
			const fill = e.color.hex;
			const lab = labelOn(e);
			return `  <g transform="translate(${cx} ${cy})" clip-path="url(#cardClip)">
    <rect width="${cardW}" height="${swatchH}" fill="${fill}"/>
    <rect y="${swatchH}" width="${cardW}" height="${cardH - swatchH}" fill="#ffffff"/>
    <text x="14" y="26" font-size="13" font-weight="700" fill="${lab}" font-family="ui-sans-serif, system-ui, sans-serif">${esc(e.name)}</text>
    <text x="14" y="${swatchH - 14}" font-size="11" fill="${lab}" opacity="0.85" font-family="ui-monospace, monospace">${fill}</text>
    <text x="14" y="${swatchH + 26}" font-size="11" font-weight="600" fill="#11181c" font-family="ui-sans-serif, system-ui, sans-serif">${esc(e.name)}</text>
    <text x="14" y="${swatchH + 44}" font-size="10" fill="#687076" font-family="ui-monospace, monospace">${esc(fmtOklch(e))}</text>
  </g>`;
		})
		.join('\n');

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><clipPath id="cardClip"><rect width="${cardW}" height="${cardH}" rx="12"/></clipPath></defs>
  <rect width="${width}" height="${height}" fill="${sheetBg}"/>
  <text x="${pad}" y="${pad + 22}" font-size="20" font-weight="800" fill="${titleColor}" font-family="ui-sans-serif, system-ui, sans-serif">${esc(title)}</text>
  <text x="${pad}" y="${pad + 40}" font-size="12" fill="${subColor}" font-family="ui-sans-serif, system-ui, sans-serif">${entries.length} colors · generated with Chromatics</text>
${cards}
</svg>`;
}
