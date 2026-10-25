/**
 * Cascade-highlight diff for the Inspector's "edit a color, watch it cascade"
 * flash. Given the previous baseline (name → hex) and the current entries, it
 * returns the set of names whose color CHANGED, and updates `baseline` in place.
 *
 * The subtlety it exists to handle: a mid-edit invalid value (e.g. deleting a hex
 * digit) makes the whole scheme error out — entries momentarily empty and
 * `scheme.errors` non-empty. If the baseline were rebuilt to that empty set, the
 * recovered colors would look brand-new (no previous hex) and nothing would
 * flash. So while the scheme is in an ERROR state the baseline is RETAINED
 * (only present entries are refreshed, vanished ones kept); in a CLEAN state it
 * is rebuilt to exactly the current entries, so genuinely-removed variables don't
 * linger and resurface as phantom changes.
 */
export interface CascadeEntry {
	name: string;
	hex: string;
}

export interface CascadeOpts {
	/** The scheme currently has evaluation errors (a transient/invalid edit). */
	hasErrors: boolean;
	/** The baseline has been seeded — the very first render must never flash. */
	primed: boolean;
}

export function diffCascade(
	baseline: Map<string, string>,
	entries: Iterable<CascadeEntry>,
	opts: CascadeOpts
): Set<string> {
	const hits = new Set<string>();
	const present: [string, string][] = [];
	for (const e of entries) {
		present.push([e.name, e.hex]);
		const prev = baseline.get(e.name);
		if (opts.primed && prev !== undefined && prev !== e.hex) hits.add(e.name);
	}
	// Clean state: rebuild the baseline to exactly what's present (drop removed
	// names). Error state: keep the prior baseline, only refreshing present names.
	if (!opts.hasErrors) baseline.clear();
	for (const [name, hex] of present) baseline.set(name, hex);
	return hits;
}
