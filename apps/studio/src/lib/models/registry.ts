/**
 * The model registry — the ONLY module that imports culori.
 *
 * Everything else in the engine reaches conversion/measurement primitives
 * through the re-exports here, so culori stays swappable behind one seam
 * (the future `@lilbunnyrabbit/chromatics` package boundary).
 */
import {
	converter,
	parse,
	formatHex,
	formatCss,
	clampChroma,
	toGamut,
	wcagContrast,
	wcagLuminance,
	displayable,
	inGamut,
	blend,
	differenceCie76,
	differenceCie94,
	differenceCiede2000,
	differenceCmc,
	differenceEuclidean,
	filterDeficiencyProt,
	filterDeficiencyDeuter,
	filterDeficiencyTrit,
	filterGrayscale,
	filterContrast,
	filterBrightness,
	filterSaturate,
	type Color as CuloriColor
} from 'culori';
import type { ModelDef, ModelSpec, ChannelDef, MethodDef } from './types';
// Side-effect: extends culori's converter graph with our hand-rolled modes.
// Must run before any converter is built.
import './custom-modes'; // cmyk, hsluv, hpluv, hct
import './modes'; // xyz-derived, rgb-working, video, hue, cam …

// --- culori primitives, re-exported (single import site) ---
export {
	parse,
	formatHex,
	formatCss,
	clampChroma,
	toGamut,
	wcagContrast,
	wcagLuminance,
	displayable,
	inGamut,
	blend,
	differenceCie76,
	differenceCie94,
	differenceCiede2000,
	differenceCmc,
	differenceEuclidean,
	filterDeficiencyProt,
	filterDeficiencyDeuter,
	filterDeficiencyTrit,
	filterGrayscale,
	filterContrast,
	filterBrightness,
	filterSaturate
};
export type { CuloriColor };

// --- mode converters (memoized) ---
const _conv = new Map<string, ReturnType<typeof converter>>();
export function toMode(mode: string) {
	let c = _conv.get(mode);
	if (!c) {
		c = converter(mode as Parameters<typeof converter>[0]);
		_conv.set(mode, c);
	}
	return c;
}

/**
 * Epsilon-tolerant sRGB gamut test. culori's strict `displayable` rejects
 * colors that sit a sub-epsilon outside [0,1] purely from float round-trips
 * (e.g. a gamut-mapped value whose green channel is -4e-16). For a "is this
 * color showable / did gamutMap succeed" predicate we absorb that noise.
 */
export function isDisplayable(c: CuloriColor, eps = 1e-5): boolean {
	const rgb = toMode('rgb')(c) as unknown as Record<string, number | undefined> | undefined;
	if (!rgb) return false;
	for (const k of ['r', 'g', 'b'] as const) {
		const v = rgb[k] ?? 0;
		if (v < -eps || v > 1 + eps) return false;
	}
	return true;
}

// --- the registry + global channel index ---
const _registry = new Map<string, ModelDef>();
const _byMode = new Map<string, ModelDef>();
export const CHANNELS = new Map<string, ChannelDef & { modelId: string; mode: string }>();

export function getModel(id: string): ModelDef | undefined {
	return _registry.get(id);
}
/** Look up a model by its culori MODE (e.g. 'rgb' → the srgb def). First wins. */
export function getModelByMode(mode: string): ModelDef | undefined {
	return _byMode.get(mode);
}
export function allModels(): ModelDef[] {
	return [..._registry.values()];
}

/** Compose a ModelSpec into a ModelDef: merge inherited ⊕ own methods. */
export function defineModel(spec: ModelSpec): ModelDef {
	const methods = new Map<string, MethodDef>();
	for (const m of spec.inherit ?? []) methods.set(m.name, m);
	for (const m of spec.ownMethods ?? []) methods.set(m.name, m); // own overrides inherited
	// status drives `backed`: only 'coming-soon' is unbacked (methods throw).
	const status = spec.status ?? (spec.backed === false ? 'coming-soon' : 'stable');
	const backed = spec.backed ?? status !== 'coming-soon';
	return {
		id: spec.id,
		mode: spec.mode ?? spec.id,
		label: spec.label,
		family: spec.family,
		ctor: spec.ctor,
		channels: spec.channels ?? [],
		methods,
		backed,
		status,
		priority: spec.priority,
		// Default per-model toCSS: serialize in the model's NATIVE mode (oklch→
		// "oklch(…)", hsl→"hsl(…)", lab→"lab(…)"); culori falls back to rgb css
		// for modes without a CSS form (cmyk/hct/…). Models may override.
		toCSS: spec.toCSS ?? ((self) => formatCss(self.project(spec.mode ?? spec.id)) ?? self.hex)
	};
}

/** Register a model and contribute its channels to the global CHANNELS index. */
export function register(def: ModelDef): ModelDef {
	_registry.set(def.id, def);
	if (!_byMode.has(def.mode)) _byMode.set(def.mode, def); // first model to claim a mode wins
	for (const ch of def.channels) {
		// First registration wins, so a model never clobbers a sibling's flat key.
		if (!CHANNELS.has(ch.key)) {
			CHANNELS.set(ch.key, { ...ch, modelId: def.id, mode: def.mode });
		}
	}
	return def;
}

// --- the conversion graph (the seam over the backing lib) ---
//
// This is the heart of the future @lilbunnyrabbit/chromatics engine, living in
// the app today: a registry of DIRECT model-to-model edges (keyed by culori
// MODE) plus a BFS resolver. `resolveConversion(from, to)` prefers a direct
// hand-written edge, else composes the shortest path of edges, else falls back
// to culori (which routes through RGB). culori is thus demoted from "identity
// hub" to "leaf edge-math + fallback": registering a direct edge makes that pair
// bypass the RGB round-trip. Swapping the backing lib later only touches this
// file — the graph/resolver is engine-agnostic.

/** A conversion edge: maps a color in `from` mode to a color in `to` mode. */
export type ConversionEdge = (c: CuloriColor) => CuloriColor;

const EDGES = new Map<string, Map<string, ConversionEdge>>();
const PATH_CACHE = new Map<string, ConversionEdge>();

const IDENTITY: ConversionEdge = (c) => c;

/** Register a DIRECT edge `from -> to` (culori modes). Use for non-RGB paths. */
export function registerEdge(from: string, to: string, edge: ConversionEdge): void {
	let m = EDGES.get(from);
	if (!m) {
		m = new Map();
		EDGES.set(from, m);
	}
	m.set(to, edge);
	PATH_CACHE.clear(); // a new edge can shorten previously-resolved paths
}

/** BFS over registered edges; returns a composed edge or null when unreachable. */
function findEdgePath(from: string, to: string): ConversionEdge | null {
	const queue: string[] = [from];
	const prev = new Map<string, { node: string; edge: ConversionEdge }>();
	const visited = new Set<string>([from]);
	while (queue.length) {
		const cur = queue.shift() as string;
		const neighbors = EDGES.get(cur);
		if (!neighbors) continue;
		for (const [next, edge] of neighbors) {
			if (visited.has(next)) continue;
			visited.add(next);
			prev.set(next, { node: cur, edge });
			if (next === to) {
				const chain: ConversionEdge[] = [];
				let n = to;
				while (n !== from) {
					const step = prev.get(n) as { node: string; edge: ConversionEdge };
					chain.unshift(step.edge);
					n = step.node;
				}
				return (c) => chain.reduce((acc, fn) => fn(acc), c);
			}
			queue.push(next);
		}
	}
	return null;
}

/**
 * Resolve a conversion `from -> to` (culori modes): identity → direct edge →
 * BFS-composed path → culori fallback. Result is memoized per ordered pair.
 */
export function resolveConversion(from: string, to: string): ConversionEdge {
	if (from === to) return IDENTITY;
	const key = `${from}>${to}`;
	const cached = PATH_CACHE.get(key);
	if (cached) return cached;

	const direct = EDGES.get(from)?.get(to);
	if (direct) {
		PATH_CACHE.set(key, direct);
		return direct;
	}

	const path = findEdgePath(from, to);
	if (path) {
		PATH_CACHE.set(key, path);
		return path;
	}

	// Fallback: the backing lib (culori). It routes via RGB internally.
	const fallback: ConversionEdge = (c) => {
		const out = toMode(to)(c) as CuloriColor | undefined;
		if (!out) throw new Error(`No conversion from ${from} to ${to}`);
		return out;
	};
	PATH_CACHE.set(key, fallback);
	return fallback;
}
