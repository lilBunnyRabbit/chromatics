/**
 * The package's EvalResult → Scheme split, plus the studio's display groups: a name heuristic that buckets
 * colors into Core / Background / Foreground / Accents / Semantic.
 */
import type { EvalResult } from '@lilbunnyrabbit/chromatics-dsl';
import { schemeFromEvalResult as split } from '@lilbunnyrabbit/chromatics-dsl/scheme';
import type { Scheme, SchemeEntry, SchemeGroup } from './types.js';

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
	const scheme = split(result, source);

	const buckets = new Map<string, SchemeEntry[]>();
	for (const e of scheme.entries) {
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

	return { groups, ...scheme };
}
