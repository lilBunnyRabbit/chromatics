import type { Color } from './color.js';
import type { ColorModel, ConversionOptions } from './model.js';

type Step = (color: Color, options?: ConversionOptions) => Color;

const graph = new Map<ColorModel, Map<ColorModel, Step>>();
const closures = new Map<ColorModel, ReadonlySet<ColorModel>>();
const paths = new Map<ColorModel, Map<ColorModel, readonly Step[]>>();

function link(from: ColorModel, to: ColorModel, step: Step): void {
	let out = graph.get(from);
	if (!out) graph.set(from, (out = new Map()));
	if (!out.has(to)) out.set(to, step);
}

// Every model reachable from `model` through declared edges. It depends only on static class data, so a
// route between two models never changes with what else the process has converted.
function closure(model: ColorModel): ReadonlySet<ColorModel> {
	const cached = closures.get(model);
	if (cached) return cached;
	const seen = new Set<ColorModel>();
	const pending = [model];
	while (pending.length > 0) {
		const current = pending.pop()!;
		if (seen.has(current)) continue;
		seen.add(current);
		for (const edge of current.edges) {
			link(current, edge.target, (c, o) => edge.forward(c, o));
			link(edge.target, current, (c, o) => edge.backward(c, o));
			pending.push(edge.target);
		}
	}
	closures.set(model, seen);
	return seen;
}

function scope(models: readonly ColorModel[]): Set<ColorModel> {
	const out = new Set<ColorModel>();
	for (const m of models) for (const c of closure(m)) out.add(c);
	return out;
}

function search(
	from: ColorModel,
	to: ColorModel,
	allowed: ReadonlySet<ColorModel>
): ColorModel[] | undefined {
	const previous = new Map<ColorModel, ColorModel | null>([[from, null]]);
	const queue = [from];
	for (let i = 0; i < queue.length; i++) {
		const current = queue[i]!;
		if (current === to) break;
		if (current !== from && current.terminal) continue;
		for (const next of graph.get(current)?.keys() ?? []) {
			if (previous.has(next) || !allowed.has(next)) continue;
			previous.set(next, current);
			queue.push(next);
		}
	}
	if (!previous.has(to)) return undefined;
	const route = [to];
	for (let node = previous.get(to); node; node = previous.get(node)) route.unshift(node);
	return route;
}

function stepsFor(from: ColorModel, to: ColorModel): readonly Step[] {
	const cached = paths.get(from)?.get(to);
	if (cached) return cached;
	const route = search(from, to, scope([from, to]));
	if (!route) throw new Error(`No conversion path from ${from.id} to ${to.id}`);
	const steps = route.slice(1).map((node, i) => graph.get(route[i]!)!.get(node)!);
	let row = paths.get(from);
	if (!row) paths.set(from, (row = new Map()));
	row.set(to, steps);
	return steps;
}

export function convert<T extends Color>(
	color: Color,
	target: ColorModel<T>,
	options?: ConversionOptions
): T {
	const source = color.constructor as ColorModel;
	if (source === target) return color.clone() as T;
	let current = color;
	for (const step of stepsFor(source, target)) current = step(current, options);
	return current as T;
}

/**
 * Every model `from` converts to, among `models` and whatever their edges reach. The answer depends only
 * on the arguments. Pass the array from `@lilbunnyrabbit/chromatics/all` for the full set.
 *
 * @example
 * ```ts
 * import { models, reachable } from '@lilbunnyrabbit/chromatics/all';
 * reachable(Hsl, models); // [Srgb, Hsv, Hwb, LinearSrgb, Xyz65, …]
 * ```
 */
export function reachable(from: ColorModel, models: readonly ColorModel[]): ColorModel[] {
	const allowed = scope([from, ...models]);
	return [...allowed].filter((m) => m !== from && search(from, m, allowed) !== undefined);
}

/**
 * The models `from.to(to)` passes through, both ends included, or `undefined` when there is no route.
 * Byte models (`Srgb8`) only ever appear as an end.
 *
 * @example
 * ```ts
 * path(Hsl, Lab); // [Hsl, Srgb, LinearSrgb, Xyz65, Xyz50, Lab]
 * ```
 */
export function path(from: ColorModel, to: ColorModel): ColorModel[] | undefined {
	return search(from, to, scope([from, to]));
}
