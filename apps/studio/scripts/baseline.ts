// ADR-016 gate: `culori/` is the studio before the switch, frozen; `package/` is the same records
// from the package, read back under the old model ids, channel names and units so the two compare
// record for record. `review.md` summarises every difference; differences are reviewed, not forbidden.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Lab65, Oklch, Srgb, Srgb8, type Color, type ColorModel } from '@lilbunnyrabbit/chromatics';
import { parse } from '@lilbunnyrabbit/chromatics/all';
import { infoByName } from '../src/lib/color/catalog';
import {
	LEGACY_CHANNEL_CHANGES,
	LEGACY_CHANNELS,
	LEGACY_INCOMPATIBLE,
	LEGACY_MODEL_IDS
} from '../src/lib/color/legacy';
import { deriveScheme } from '../src/lib/scheme/derive';
import { emptyRoles, DEFAULT_OPACITIES } from '../src/lib/scheme/roles';
import { exportScheme } from '../src/lib/export/index';
import { examples } from '../src/routes/examples/index';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '../tests/fixtures/baseline');

type Num = number | string | null;
type Rec = Record<string, unknown>;

const read = (file: string) =>
	JSON.parse(readFileSync(join(DIR, file), 'utf8')) as Record<string, Rec>;

// 12 significant digits: last-bit float noise from a reordered conversion is not a finding.
function num(v: unknown): Num {
	if (typeof v !== 'number') return v === undefined ? null : String(v);
	if (Number.isNaN(v)) return 'NaN';
	if (!Number.isFinite(v)) return v > 0 ? 'Infinity' : '-Infinity';
	return Number(v.toPrecision(12));
}

function safe<T>(f: () => T): T | { error: string } {
	try {
		return f();
	} catch (e) {
		return { error: e instanceof Error ? e.message : String(e) };
	}
}

const hexOf = (c: Color) => c.to(Srgb).gamutMap().to(Srgb8).toHex();
const cssOf = (c: Color) => (c as Color & { toCss?: () => string }).toCss?.() ?? c.toString();

function changeOf(old: string, ch: string) {
	const c = LEGACY_CHANNEL_CHANGES[old]?.[ch];
	return { name: c?.name ?? ch, scale: c?.scale ?? 1, offset: c?.offset ?? 0 };
}

function record(old: string, c: Color) {
	return {
		channels: safe(() => {
			const out: Record<string, Num> = {};
			const values = c as unknown as Record<string, number>;
			for (const ch of LEGACY_CHANNELS[old]) {
				const { name, scale, offset } = changeOf(old, ch);
				out[ch] = num((values[name] - offset) / scale);
			}
			return out;
		}),
		hex: safe(() => hexOf(c)),
		css: safe(() => cssOf(c)),
		inGamut: safe(() => c.to(Srgb).inGamut()),
		gamutMapped: safe(() => hexOf(c))
	};
}

function gridColor(id: string): Color {
	const rgb = /^srgb\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(id);
	if (rgb) return new Srgb(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]));
	const lch = /^oklch\(([\d.]+) ([\d.]+) (\d+|none)\)$/.exec(id);
	if (lch) return new Oklch(Number(lch[1]), Number(lch[2]), lch[3] === 'none' ? 0 : Number(lch[3]));
	return parse(id);
}

function nativeColor(old: string, model: ColorModel, id: string): Color {
	const values: Record<string, number> = {};
	for (const part of id.split(' ')) {
		const [ch, v] = part.split('=');
		const { name, scale, offset } = changeOf(old, ch);
		values[name] = Number(v) * scale + offset;
	}
	return (model as unknown as { of(v: Record<string, number>): Color }).of(values);
}

function models(culori: Record<string, Rec>): Record<string, Rec> {
	const out: Record<string, Rec> = {};
	for (const [old, before] of Object.entries(culori)) {
		const name = LEGACY_MODEL_IDS[old];
		const info = name ? infoByName(name) : undefined;
		if (!info || LEGACY_INCOMPATIBLE[old]) {
			out[old] = {
				package: name ?? null,
				skipped: name ? LEGACY_INCOMPATIBLE[old] : 'no package model'
			};
			continue;
		}
		const fromGrid: Rec = {};
		for (const id of Object.keys(before.fromGrid as Rec)) {
			fromGrid[id] = safe(() => record(old, gridColor(id).to(info.model)));
		}
		const native: Rec = {};
		for (const id of Object.keys(before.native as Rec)) {
			native[id] = safe(() => record(old, nativeColor(old, info.model, id)));
		}
		out[old] = { package: name, fromGrid, native };
	}
	return out;
}

function exampleRecords(): Record<string, Rec> {
	const out: Record<string, Rec> = {};
	for (const ex of examples) {
		const r = deriveScheme(ex.source, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
		const entries: Rec = {};
		for (const e of r.scheme.entries) {
			entries[e.name] = { model: e.color.model, hex: hexOf(e.color), css: cssOf(e.color) };
		}
		out[ex.name] = {
			errors: r.result.errors.map((e) => `${e.line}: ${e.message}`),
			entries,
			roles: r.effectiveRoles,
			darkRoles: r.hasDarkTheme ? r.darkEffectiveRoles : null,
			themeVars: r.themeVars,
			darkThemeVars: r.hasDarkTheme ? r.darkThemeVars : null,
			css: exportScheme(r.scheme, 'css')
		};
	}
	return out;
}

// One record per line, so the reviewed diff reads per record.
function serialize(data: Record<string, unknown>): string {
	const lines = Object.entries(data).map(([k, v]) => {
		if (v && typeof v === 'object' && !Array.isArray(v)) {
			const inner = Object.entries(v).map(([ik, iv]) => {
				if (iv && typeof iv === 'object' && !Array.isArray(iv) && Object.keys(iv).length > 0) {
					const leaves = Object.entries(iv).map(
						([lk, lv]) => `      ${JSON.stringify(lk)}: ${JSON.stringify(lv)}`
					);
					return `    ${JSON.stringify(ik)}: {\n${leaves.join(',\n')}\n    }`;
				}
				return `    ${JSON.stringify(ik)}: ${JSON.stringify(iv)}`;
			});
			return `  ${JSON.stringify(k)}: {\n${inner.join(',\n')}\n  }`;
		}
		return `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`;
	});
	return `{\n${lines.join(',\n')}\n}\n`;
}

const dE = (a: string, b: string) => parse(a).to(Lab65).deltaE2000(parse(b).to(Lab65));
const isHex = (v: unknown): v is string => typeof v === 'string' && v.startsWith('#');
const failed = (r: Rec | undefined) =>
	!r || 'error' in r || !!(r.channels as Rec | undefined)?.error;

function exampleReview(before: Record<string, Rec>, after: Record<string, Rec>): string[] {
	const summary = [
		'## Examples',
		'',
		'Each example as it was (old DSL, culori) against its rewrite (migrated by `dsl/migrate.ts`, then hand-polished).',
		'',
		'| Example | Same hex | Changed, was in sRGB | Changed, was out of sRGB | Max ΔE (was in sRGB) | Errors |',
		'| --- | --- | --- | --- | --- | --- |'
	];
	const rows: string[] = [];
	for (const [name, b] of Object.entries(before)) {
		const a = after[name];
		const was = b.entries as Record<string, Rec>;
		const now = (a?.entries ?? {}) as Record<string, Rec>;
		let same = 0;
		let inG = 0;
		let outG = 0;
		let max = 0;
		for (const [k, rec] of Object.entries(was)) {
			const hex = now[k]?.hex;
			if (!isHex(hex) || !isHex(rec.hex)) {
				rows.push(`| ${name} | ${k} | ${String(rec.hex)} → removed | | |`);
				continue;
			}
			if (hex === rec.hex) {
				same++;
				continue;
			}
			const d = dE(rec.hex, hex);
			if (rec.inGamut) {
				inG++;
				max = Math.max(max, d);
			} else outG++;
			rows.push(
				`| ${name} | ${k} | ${rec.hex} → ${hex} | ${d.toFixed(2)} | ${rec.inGamut ? 'in' : 'out of'} sRGB |`
			);
		}
		const errors = (a?.errors as string[] | undefined)?.length ?? 'missing';
		summary.push(`| ${name} | ${same} | ${inG} | ${outG} | ${max.toFixed(2)} | ${errors} |`);
	}
	return [
		...summary,
		'',
		'### Changed entries',
		'',
		'| Example | Entry | Hex | ΔE | Culori colour was |',
		'| --- | --- | --- | --- | --- |',
		...rows
	];
}

function modelReview(culori: Record<string, Rec>, pkg: Record<string, Rec>): string[] {
	const out = [
		'## Models',
		'',
		'The 48 grid colours converted into each model, and each model built at its channel corners, read back in the old channel names and units. Channel Δ is the largest absolute difference in old units.',
		'',
		'| Old id | Package | Records | Max channel Δ | Hex changed (was in sRGB) | Max ΔE (was in sRGB) | Errors culori → package |',
		'| --- | --- | --- | --- | --- | --- | --- |'
	];
	for (const [old, before] of Object.entries(culori)) {
		const after = pkg[old];
		if (!after || after.skipped) {
			out.push(
				`| ${old} | ${String(after?.package ?? '—')} | skipped: ${String(after?.skipped)} | | | | |`
			);
			continue;
		}
		let n = 0;
		let maxCh = 0;
		let hexChanged = 0;
		let maxDE = 0;
		let errBefore = 0;
		let errAfter = 0;
		for (const part of ['fromGrid', 'native'] as const) {
			for (const [id, rb] of Object.entries(before[part] as Record<string, Rec>)) {
				const ra = (after[part] as Record<string, Rec>)[id];
				n++;
				if (failed(rb)) errBefore++;
				if (failed(ra)) {
					errAfter++;
					continue;
				}
				const cb = rb.channels as Record<string, unknown> | undefined;
				const ca = ra.channels as Record<string, unknown>;
				for (const ch of Object.keys(cb ?? {})) {
					const x = cb?.[ch];
					const y = ca[ch];
					if (typeof x !== 'number' || typeof y !== 'number') continue;
					const d = Math.abs(x - y);
					maxCh = Math.max(maxCh, ch === 'h' ? Math.min(d % 360, 360 - (d % 360)) : d);
				}
				if (isHex(rb.hex) && isHex(ra.hex) && rb.hex !== ra.hex && rb.inGamut === true) {
					hexChanged++;
					maxDE = Math.max(maxDE, dE(rb.hex, ra.hex));
				}
			}
		}
		out.push(
			`| ${old} | ${String(after.package)} | ${n} | ${maxCh.toPrecision(3)} | ${hexChanged} | ${maxDE.toFixed(2)} | ${errBefore} → ${errAfter} |`
		);
	}
	return out;
}

export function generate(): Record<string, string> {
	const culori = read('culori/models.json');
	const pkg = models(culori);
	const exAfter = exampleRecords();
	const review = [
		'# Culori → package baseline review',
		'',
		'Generated by `bun run baseline` (ADR-016 gate). Hex is what the studio displays: culori clipped out-of-sRGB channels, the package gamut-maps them (CSS Color 4). ΔE is CIEDE2000 (D65) between the two hexes.',
		'',
		'## Known differences',
		'',
		'- **Out-of-sRGB colours** (most example diffs): culori clipped each channel; the package gamut-maps (CSS Color 4 MINDE, ADR-016 78d), so hue holds and the hex moves.',
		"- **In-sRGB hexes within ~2 ΔE**: colours on the gamut edge that culori's 1e-5 tolerance called in-gamut, mapped instead of clipped; and one-byte rounding.",
		"- **HCT**: culori's HCT re-solved chroma into sRGB on every write; the package stores the tone and chroma as given (ADR-012), and display gamut-maps. Showcase `brand_20` / `brand_90` / `warning`.",
		'- **CVD** (Showcase `cvd`): Machado 2009 runs in linear light in the package; culori applied the same matrices to gamma sRGB and snapped severity to 0.1 steps (grill 79).',
		'- **Okhsl, HSP corners**: degenerate corners (s = 1 at l = 0 / 1) land on different out-of-gamut points before mapping.',
		"- **RYB** (Gossett cube, Newton inverse; throws where the cube can't reach: the 4 errors), **SMPTE-C** (170M curve; the studio's was linear), **Rec. 2100 PQ** (white at 203 cd/m²), **Rec. 2020** and **ACES**: the package follows the spec where the studio approximated (ROADMAP parity table).",
		'- **Skipped**: CAM16 / CIECAM02 (old J C h, now J M h), TSL (tint angle), XYB (B = S′), RAL (licensing).',
		'- **Achromatic hues**: culori left hue undefined, the package stores 0 (ADR-003), so hue Δ up to 180 on greys is not a finding.',
		'',
		...exampleReview(read('culori/examples.json'), exAfter),
		'',
		...modelReview(culori, pkg)
	];
	return {
		'package/models.json': serialize(pkg),
		'package/examples.json': serialize(exAfter),
		'review.md': review.join('\n') + '\n'
	};
}

if (import.meta.main) {
	mkdirSync(join(DIR, 'package'), { recursive: true });
	for (const [file, text] of Object.entries(generate())) writeFileSync(join(DIR, file), text);
}
