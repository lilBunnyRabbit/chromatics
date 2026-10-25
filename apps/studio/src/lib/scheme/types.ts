import type { Color } from '@lilbunnyrabbit/chromatics';
import type { Variable, EvalError } from '../dsl/evaluator.js';

export interface SchemeEntry {
	name: string;
	/** Frozen (ADR-016 78e): clone before changing it. */
	color: Color;
	deps: string[];
	line: number;
	/** Source slice of the RHS expression (matrix tooltip + markdown export). */
	description?: string;
	/** Position in the flat scheme — the universal index space. */
	index: number;
}

export interface SchemeGroup {
	label: string;
	entries: SchemeEntry[];
}

export interface Scheme {
	groups: SchemeGroup[];
	entries: SchemeEntry[];
	byName: Map<string, SchemeEntry>;
	errors: EvalError[];
	nonColorVars: Variable[];
}
