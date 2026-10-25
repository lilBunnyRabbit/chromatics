/**
 * The token manifest: one source for the highlighter, autocomplete, hover and the docs overlay, built
 * from the package's own classes and the JSDoc `scripts/package-docs.ts` extracts (ADR-016: the DSL
 * is the package's API).
 */
import docsJson from './package-docs.json' with { type: 'json' };
import { CATALOG, type ModelInfo } from '../color/catalog.js';
import { PREVIEW_SIGNATURES } from './preview.js';
import { TOKENS_SIGNATURES, TOKENS_DOC } from './tokens.js';
import { COMPONENT_SIGNATURES } from './components.js';
import { THEME_DOC, ROLES_DOC, THEME_SIGNATURES } from './theme.js';

type PackedMember = [kind: 0 | 1, sig: number, doc: number];
interface PackedDocs {
	strings: string[];
	models: Record<
		string,
		{
			doc: number;
			constructor: number;
			members: Record<string, PackedMember>;
			statics: Record<string, PackedMember>;
		}
	>;
	functions: Record<string, PackedMember>;
}
const docs = docsJson as unknown as PackedDocs;

export interface ConstructorInfo {
	name: string;
	params: string;
	doc: string;
}

export interface MemberInfo {
	name: string;
	kind: 'method' | 'property';
	detail: string;
	doc: string;
	owner: string;
}

export interface TokenManifest {
	constructors: ConstructorInfo[];
	builtins: string[];
	constructorNames: Set<string>;
	builtinNames: Set<string>;
	methodNames: Set<string>;
	propertyNames: Set<string>;
	modelMembers: Map<string, MemberInfo[]>;
	valueMembers: MemberInfo[];
	/** `Oklch.` statics and `preview.` / `tokens.` … namespace members. */
	viewMembers: Map<string, MemberInfo[]>;
	members: Map<string, MemberInfo>;
	models: readonly ModelInfo[];
}

export const BUILTIN_DOCS: Record<string, string> = {
	parse: 'parse(css) → color — any CSS color string or hex, in the model it names (`#…` is Srgb8)',
	ensureContrast:
		'ensureContrast(fg, bg, target?) → color — nearest color to fg that stays legible on bg (target: "AA" | "AAA" | "AA-large" | "AAA-large" | ratio, default "AA"); re-solves when fg/bg change',
	simulateCvd:
		'simulateCvd(srgb, "protan" | "deutan" | "tritan", severity = 1) → the same Srgb, as seen with that deficiency (Machado 2009, linear light; mutates)',
	clamp: 'clamp(value, min, max) → number',
	abs: 'abs(n) → number',
	min: 'min(…nums) → number',
	max: 'max(…nums) → number',
	round: 'round(n) → number',
	floor: 'floor(n) → number',
	ceil: 'ceil(n) → number',
	preview: 'preview.* — values that render as cards in the Inspector',
	tokens: TOKENS_DOC,
	component: 'component.* — component specs that render in the Styleguide tab',
	theme: THEME_DOC,
	roles: ROLES_DOC
};

const BUILTINS = Object.keys(BUILTIN_DOCS);

const unpack = (name: string, [kind, sig, doc]: PackedMember, owner: string): MemberInfo => ({
	name,
	kind: kind === 0 ? 'method' : 'property',
	detail: docs.strings[sig],
	doc: docs.strings[doc],
	owner
});

function namespace(id: string, sigs: Record<string, { sig: string; doc: string }>): MemberInfo[] {
	return Object.entries(sigs).map(([name, s]) => ({
		name,
		kind: 'method',
		detail: `${s.sig} → ${id}`,
		doc: s.doc,
		owner: id
	}));
}

export function buildManifest(): TokenManifest {
	const constructors: ConstructorInfo[] = [];
	const methodNames = new Set<string>();
	const propertyNames = new Set<string>();
	const modelMembers = new Map<string, MemberInfo[]>();
	const viewMembers = new Map<string, MemberInfo[]>();
	const valueByName = new Map<string, MemberInfo>();

	for (const info of CATALOG) {
		const d = docs.models[info.name];
		if (!d) throw new Error(`package-docs.json has no ${info.name}: run bun run package-docs`);
		constructors.push({
			name: info.name,
			params: docs.strings[d.constructor],
			doc: docs.strings[d.doc] || `A color in ${info.label}`
		});
		const instance = Object.entries(d.members).map(([n, m]) => unpack(n, m, info.name));
		modelMembers.set(info.name, instance);
		viewMembers.set(
			info.name,
			Object.entries(d.statics).map(([n, m]) => unpack(n, m, info.name))
		);
		for (const m of instance) {
			(m.kind === 'method' ? methodNames : propertyNames).add(m.name);
			if (!valueByName.has(m.name)) valueByName.set(m.name, m);
		}
	}

	viewMembers.set('preview', namespace('preview', PREVIEW_SIGNATURES));
	viewMembers.set('tokens', namespace('tokens', TOKENS_SIGNATURES));
	viewMembers.set('component', namespace('component', COMPONENT_SIGNATURES));
	viewMembers.set('theme', namespace('theme', THEME_SIGNATURES));
	for (const list of viewMembers.values()) for (const m of list) methodNames.add(m.name);

	const members = new Map<string, MemberInfo>(valueByName);
	for (const list of viewMembers.values())
		for (const m of list) if (!members.has(m.name)) members.set(m.name, m);

	return {
		constructors,
		builtins: BUILTINS,
		constructorNames: new Set(constructors.map((c) => c.name)),
		builtinNames: new Set(BUILTINS),
		methodNames,
		propertyNames,
		modelMembers,
		valueMembers: [...valueByName.values()],
		viewMembers,
		members,
		models: CATALOG
	};
}

export const manifest = buildManifest();
