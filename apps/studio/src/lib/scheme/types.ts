import type { Scheme as PackageScheme, SchemeEntry } from '@lilbunnyrabbit/chromatics-dsl/scheme';

export type { SchemeEntry };

export interface SchemeGroup {
	label: string;
	entries: SchemeEntry[];
}

/** The package's scheme plus the studio's name-heuristic groups (Matrix, Inspector). */
export interface Scheme extends PackageScheme {
	groups: SchemeGroup[];
}
