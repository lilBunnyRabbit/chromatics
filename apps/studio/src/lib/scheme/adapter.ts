/**
 * The integration seam that unifies the two apps: turn an EvalResult (a flat,
 * model-agnostic map of variables) into a display-ready Scheme of package colours —
 * with the dependency graph and source descriptions preserved.
 */
import type { EvalResult, Variable } from '../dsl/evaluator.js';
import { isColor } from '../dsl/values.js';
import type { Scheme, SchemeEntry, SchemeGroup } from './types.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Source slice of the RHS expression, using acorn's character offsets. */
function describe(source: string, node: unknown): string | undefined {
	const rhs = (node as any)?.right;
	if (rhs && typeof rhs.start === 'number' && typeof rhs.end === 'number') {
		return source.slice(rhs.start, rhs.end).trim();
	}
	return undefined;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

function groupLabel(name: string): string {
	const n = name.toLowerCase();
	if (/^(bg|background|surface)/.test(n)) return 'Background';
	if (/^(fg|foreground|text|muted|on[_-])/.test(n)) return 'Foreground';
	if (/success|warning|error|danger|info/.test(n)) return 'Semantic';
	if (/triad|tetrad|split|analog|complement|accent|harmon/.test(n)) return 'Accents';
	return 'Core';
}

const GROUP_ORDER = ['Core', 'Background', 'Foreground', 'Accents', 'Semantic'];

export function schemeFromEvalResult(result: EvalResult, source: string): Scheme {
	const entries: SchemeEntry[] = [];
	const nonColorVars: Variable[] = [];
	let index = 0;

	for (const name of result.order) {
		const v = result.variables.get(name);
		if (!v) continue;
		if (isColor(v.value)) {
			entries.push({
				name: v.name,
				color: v.value,
				deps: v.deps,
				line: v.line,
				description: describe(source, v.node),
				index: index++
			});
		} else {
			nonColorVars.push(v);
		}
	}

	const byName = new Map(entries.map((e) => [e.name, e]));

	const buckets = new Map<string, SchemeEntry[]>();
	for (const e of entries) {
		const label = groupLabel(e.name);
		const arr = buckets.get(label);
		if (arr) arr.push(e);
		else buckets.set(label, [e]);
	}

	const groups: SchemeGroup[] = [];
	for (const label of GROUP_ORDER) {
		const es = buckets.get(label);
		if (es?.length) groups.push({ label, entries: es });
	}
	for (const [label, es] of buckets) {
		if (!GROUP_ORDER.includes(label) && es.length) groups.push({ label, entries: es });
	}

	return { groups, entries, byName, errors: result.errors, nonColorVars };
}
