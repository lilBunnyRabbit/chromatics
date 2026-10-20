import type { ColorValue } from '../models/index.js';
import type { Variable, EvalError } from '../dsl/evaluator.js';

/** Which model a variable was authored in (drives the inspector coord readout). */
export type AuthoringModel =
	| 'oklch'
	| 'oklab'
	| 'hsl'
	| 'hsv'
	| 'hwb'
	| 'lab'
	| 'lch'
	| 'srgb'
	| 'p3'
	| 'hex'
	| 'unknown';

export interface SchemeEntry {
	name: string;
	color: ColorValue;
	model: AuthoringModel;
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
