// ADR-016 gate: regenerated after the switch and diffed; differences are reviewed, not forbidden.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../src/lib/models/defs/index';
import { ColorValue } from '../src/lib/models/value';
import { allModels, parse, type CuloriColor } from '../src/lib/models/registry';
import type { ModelDef } from '../src/lib/models/types';
import { deriveScheme } from '../src/lib/scheme/derive';
import { emptyRoles, DEFAULT_OPACITIES } from '../src/lib/scheme/roles';
import { exportScheme } from '../src/lib/export/index';
import { examples } from '../src/routes/examples/index';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../tests/fixtures/baseline');

type Num = number | string | null;

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

function channels(def: ModelDef, c: ColorValue): Record<string, Num> {
	const native = c.project(def.mode) as unknown as Record<string, number | undefined>;
	const out: Record<string, Num> = {};
	for (const ch of def.channels) {
		const v = native[ch.culoriField];
		out[ch.localKey] = v === undefined ? null : num(v * (ch.scale ?? 1));
	}
	return out;
}

function record(def: ModelDef, c: ColorValue) {
	return {
		channels: safe(() => channels(def, c)),
		hex: safe(() => c.hex),
		css: safe(() => c.toCSS()),
		inGamut: safe(() => c.inGamut),
		gamutMapped: safe(() => c.gamutMapped.hex)
	};
}

function grid(): { id: string; color: CuloriColor }[] {
	const out: { id: string; color: CuloriColor }[] = [];
	const levels = [0, 0.5, 1];
	for (const r of levels)
		for (const g of levels)
			for (const b of levels)
				out.push({ id: `srgb(${r} ${g} ${b})`, color: { mode: 'rgb', r, g, b } });
	for (const v of [0.1, 0.2, 0.8, 0.9])
		out.push({ id: `srgb(${v} ${v} ${v})`, color: { mode: 'rgb', r: v, g: v, b: v } });
	for (const hexInput of ['#6c5ce7', '#e74c3c', '#2ecc71', '#f1c40f'])
		out.push({ id: hexInput, color: parse(hexInput) as CuloriColor });
	for (const l of [0.3, 0.6, 0.9])
		for (const h of [0, 90, 180, 270])
			out.push({ id: `oklch(${l} 0.35 ${h})`, color: { mode: 'oklch', l, c: 0.35, h } });
	out.push({ id: 'oklch(0.5 0 none)', color: { mode: 'oklch', l: 0.5, c: 0 } });
	return out;
}

// Built in the model itself, so the model → sRGB direction is recorded too.
function corners(def: ModelDef): { id: string; color: CuloriColor }[] {
	const axes = def.channels.map((ch) => {
		const [lo, hi] = ch.range;
		return [lo, (lo + hi) / 2, hi].map((v) => ({ ch, v }));
	});
	let combos: { ch: ModelDef['channels'][number]; v: number }[][] = [[]];
	for (const axis of axes) combos = combos.flatMap((p) => axis.map((a) => [...p, a]));
	return combos.map((combo) => {
		const color: Record<string, number | string> = { mode: def.mode };
		for (const { ch, v } of combo) color[ch.culoriField] = v / (ch.scale ?? 1);
		return {
			id: combo.map(({ ch, v }) => `${ch.localKey}=${num(v)}`).join(' '),
			color: color as unknown as CuloriColor
		};
	});
}

function models() {
	const out: Record<string, unknown> = {};
	const inputs = grid().map((g) => ({ id: g.id, value: ColorValue.from(g.color) }));
	for (const def of allModels()
		.filter((d) => d.backed && d.id !== 'root')
		.sort((a, b) => a.id.localeCompare(b.id))) {
		const fromGrid: Record<string, unknown> = {};
		for (const { id, value } of inputs) fromGrid[id] = safe(() => record(def, value.to(def.id)));
		const native: Record<string, unknown> = {};
		for (const { id, color } of corners(def))
			native[id] = safe(() => record(def, ColorValue.from(color)));
		out[def.id] = { mode: def.mode, label: def.label, status: def.status, fromGrid, native };
	}
	return out;
}

function exampleRecords() {
	const out: Record<string, unknown> = {};
	for (const ex of examples) {
		const r = deriveScheme(ex.source, { roles: emptyRoles(), opacities: DEFAULT_OPACITIES });
		const entries: Record<string, unknown> = {};
		for (const e of r.scheme.entries)
			entries[e.name] = {
				model: e.color.model,
				...record(allModels().find((d) => d.mode === e.color.model)!, e.color)
			};
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

export function generate(): Record<string, string> {
	return {
		'models.json': serialize(models()),
		'examples.json': serialize(exampleRecords())
	};
}

if (import.meta.main) {
	mkdirSync(OUT, { recursive: true });
	for (const [file, text] of Object.entries(generate())) writeFileSync(join(OUT, file), text);
}
