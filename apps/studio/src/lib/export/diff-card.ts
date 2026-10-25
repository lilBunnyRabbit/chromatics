/**
 * Standalone SVG "scheme diff" card (CD-14) — a shareable/embeddable image of what
 * a brand change did across the system. Self-contained markup (system font, no
 * external refs) so it rasterizes cleanly to PNG via an <img>/canvas round-trip,
 * exactly like `export/swatch.ts`. Headline-first: contrast band crossings, then
 * the changed/added/removed colors.
 */
import type { SchemeDiff, PaletteDelta, ContrastDelta } from '../scheme/diff.js';
import { wcagColor } from '../analysis/wcag.js';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function hexLuminance(hex: string): number {
	const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
	if (!m) return 1;
	let h = m[1];
	if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
	const lin = (v: number) => {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return (
		0.2126 * lin(parseInt(h.slice(0, 2), 16)) +
		0.7152 * lin(parseInt(h.slice(2, 4), 16)) +
		0.0722 * lin(parseInt(h.slice(4, 6), 16))
	);
}

export interface DiffCardOptions {
	title?: string;
	beforeLabel?: string;
	afterLabel?: string;
	/** Sheet background (hex). Text auto-adapts for legibility. */
	background?: string;
	/** Max palette rows before "+N more". */
	maxRows?: number;
}

/** Build a complete, self-contained SVG document summarizing a scheme diff. */
export function toDiffCardSVG(diff: SchemeDiff, opts: DiffCardOptions = {}): string {
	const title = opts.title ?? 'Scheme diff';
	const sheetBg = opts.background ?? '#0f1115';
	const light = hexLuminance(sheetBg) > 0.4;
	const fg = light ? '#11181c' : '#ffffff';
	const sub = light ? '#687076' : 'rgba(255,255,255,0.66)';
	const rule = light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)';
	const chipBg = light ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)';

	const maxRows = opts.maxRows ?? 12;
	const beforeLabel = opts.beforeLabel ?? 'before';
	const afterLabel = opts.afterLabel ?? 'after';

	// Headline contrast crossings (light + dark), regressions first.
	const crossings = [...diff.contrast, ...diff.darkContrast]
		.filter((c) => c.crossed && c.beforeLevel && c.afterLevel)
		.sort((a, b) => Number(b.direction === 'worse') - Number(a.direction === 'worse'));
	const shownCrossings = crossings.slice(0, 8);

	// Changed / added / removed colors (skip unchanged).
	const rows = diff.palette.filter((p) => p.status !== 'unchanged');
	const shownRows = rows.slice(0, maxRows);

	const pad = 26;
	const width = 560;
	const headerH = 64;
	const s = diff.summary;
	const summaryLine =
		[
			s.colorsChanged ? `${s.colorsChanged} changed` : '',
			s.colorsAdded ? `${s.colorsAdded} added` : '',
			s.colorsRemoved ? `${s.colorsRemoved} removed` : '',
			s.rolesChanged ? `${s.rolesChanged} role${s.rolesChanged === 1 ? '' : 's'} re-targeted` : '',
			s.contrastRegressions
				? `${s.contrastRegressions} contrast regression${s.contrastRegressions === 1 ? '' : 's'}`
				: ''
		]
			.filter(Boolean)
			.join('  ·  ') || 'No changes';

	let y = headerH + pad;
	const parts: string[] = [];

	// — Contrast section —
	if (shownCrossings.length) {
		parts.push(
			`<text x="${pad}" y="${y}" font-size="12" font-weight="800" letter-spacing="0.08em" fill="${sub}" font-family="ui-sans-serif, system-ui, sans-serif">CONTRAST</text>`
		);
		y += 18;
		for (const c of shownCrossings) {
			const bc = wcagColor(c.beforeLevel!);
			const ac = wcagColor(c.afterLevel!);
			parts.push(`<g transform="translate(${pad} ${y})">
    <text x="0" y="11" font-size="13" fill="${fg}" font-family="ui-sans-serif, system-ui, sans-serif">${esc(c.label)}</text>
    <g transform="translate(${width - pad * 2 - 150} 0)">
      <rect width="56" height="18" rx="5" fill="${chipBg}"/>
      <circle cx="11" cy="9" r="4" fill="${bc}"/>
      <text x="20" y="13" font-size="11" font-weight="700" fill="${fg}" font-family="ui-monospace, monospace">${c.beforeLevel}</text>
      <text x="64" y="13" font-size="12" fill="${sub}" font-family="ui-sans-serif, system-ui">→</text>
      <rect x="78" width="56" height="18" rx="5" fill="${chipBg}"/>
      <circle cx="89" cy="9" r="4" fill="${ac}"/>
      <text x="98" y="13" font-size="11" font-weight="700" fill="${fg}" font-family="ui-monospace, monospace">${c.afterLevel}</text>
    </g>
  </g>`);
			y += 24;
		}
		if (crossings.length > shownCrossings.length) {
			parts.push(
				`<text x="${pad}" y="${y + 4}" font-size="11" fill="${sub}" font-family="ui-sans-serif, system-ui">+${crossings.length - shownCrossings.length} more band changes</text>`
			);
			y += 18;
		}
		y += 10;
	}

	// — Palette section —
	if (shownRows.length) {
		parts.push(
			`<text x="${pad}" y="${y}" font-size="12" font-weight="800" letter-spacing="0.08em" fill="${sub}" font-family="ui-sans-serif, system-ui, sans-serif">PALETTE</text>`
		);
		y += 18;
		for (const r of shownRows) {
			parts.push(renderPaletteRow(r, pad, y, fg, sub, rule, width - pad * 2));
			y += 30;
		}
		if (rows.length > shownRows.length) {
			parts.push(
				`<text x="${pad}" y="${y + 4}" font-size="11" fill="${sub}" font-family="ui-sans-serif, system-ui">+${rows.length - shownRows.length} more colors</text>`
			);
			y += 18;
		}
	}

	const height = y + pad;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${sheetBg}"/>
  <text x="${pad}" y="${pad + 6}" font-size="19" font-weight="800" fill="${fg}" font-family="ui-sans-serif, system-ui, sans-serif">${esc(title)}</text>
  <text x="${pad}" y="${pad + 26}" font-size="12" fill="${sub}" font-family="ui-sans-serif, system-ui, sans-serif">${esc(beforeLabel)} → ${esc(afterLabel)}  ·  ${esc(summaryLine)}</text>
  <line x1="${pad}" y1="${headerH}" x2="${width - pad}" y2="${headerH}" stroke="${rule}"/>
${parts.join('\n')}
</svg>`;
}

function renderPaletteRow(
	r: PaletteDelta,
	x: number,
	y: number,
	fg: string,
	sub: string,
	rule: string,
	innerW: number
): string {
	const sw = 22;
	const before = r.before
		? `<rect width="${sw}" height="${sw}" rx="5" fill="${r.before}" stroke="${rule}"/>`
		: `<rect width="${sw}" height="${sw}" rx="5" fill="none" stroke="${rule}" stroke-dasharray="3 3"/>`;
	const after = r.after
		? `<rect width="${sw}" height="${sw}" rx="5" fill="${r.after}" stroke="${rule}"/>`
		: `<rect width="${sw}" height="${sw}" rx="5" fill="none" stroke="${rule}" stroke-dasharray="3 3"/>`;
	const tag =
		r.status === 'added'
			? '+ added'
			: r.status === 'removed'
				? '− removed'
				: r.deltaE != null
					? `ΔE ${r.deltaE.toFixed(1)}`
					: '';
	return `<g transform="translate(${x} ${y})">
    <g transform="translate(0 0)">${before}</g>
    <text x="${sw + 8}" y="${sw / 2 + 4}" font-size="12" fill="${sub}" font-family="ui-sans-serif, system-ui">→</text>
    <g transform="translate(${sw + 22} 0)">${after}</g>
    <text x="${sw * 2 + 52}" y="${sw / 2 + 4}" font-size="13" fill="${fg}" font-family="ui-sans-serif, system-ui, sans-serif">${esc(r.name)}</text>
    <text x="${innerW}" y="${sw / 2 + 4}" text-anchor="end" font-size="11" fill="${sub}" font-family="ui-monospace, monospace">${esc(tag)}</text>
  </g>`;
}
