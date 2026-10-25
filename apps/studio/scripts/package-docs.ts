// The DSL is the package's API (ADR-016), so hover and autocomplete read the package's own JSDoc
// and signatures, extracted from its sources here: JSDoc is gone at runtime.
import ts from 'typescript';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = join(HERE, '../../../packages/chromatics');
const OUT = join(HERE, '../src/lib/dsl/package-docs.json');

export interface MemberDoc {
	kind: 'method' | 'property';
	sig: string;
	doc: string;
}

/** On disk: `[kind, sig, doc]` as indexes into `strings`, since most members repeat across 70 classes. */
export type PackedMember = [kind: 0 | 1, sig: number, doc: number];

export interface ModelDoc {
	doc: string;
	constructor: string;
	members: Record<string, MemberDoc>;
	statics: Record<string, MemberDoc>;
}

export interface PackageDocs {
	models: Record<string, ModelDoc>;
	functions: Record<string, MemberDoc>;
}

const HIDDEN = new Set([
	'constructor',
	'assign',
	'write',
	'alphaOf',
	'edges',
	'terminal',
	'prototype'
]);

const clean = (sig: string) => sig.replace(/import\("[^"]*"\)\./g, '');

function firstParagraph(text: string): string {
	return text
		.split(/\n\s*\n/)[0]
		.replace(/\s+/g, ' ')
		.trim();
}

function docOf(symbol: ts.Symbol, checker: ts.TypeChecker): string {
	return firstParagraph(ts.displayPartsToString(symbol.getDocumentationComment(checker)));
}

function isPublic(decl: ts.Declaration | undefined): boolean {
	if (!decl) return true;
	const flags = ts.getCombinedModifierFlags(decl);
	return !(flags & ts.ModifierFlags.Private) && !(flags & ts.ModifierFlags.Protected);
}

function membersOf(type: ts.Type, checker: ts.TypeChecker, at: ts.Node): Record<string, MemberDoc> {
	const out: Record<string, MemberDoc> = {};
	for (const symbol of checker.getPropertiesOfType(type)) {
		const name = symbol.getName();
		if (name.startsWith('_') || name.startsWith('__') || HIDDEN.has(name)) continue;
		const decl = symbol.valueDeclaration ?? symbol.declarations?.[0];
		if (!isPublic(decl)) continue;
		const memberType = checker.getTypeOfSymbolAtLocation(symbol, at);
		const calls = memberType.getCallSignatures();
		const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature;
		out[name] = calls.length
			? {
					kind: 'method',
					sig: clean(checker.signatureToString(calls[0], at, flags)),
					doc: docOf(symbol, checker)
				}
			: {
					kind: 'property',
					sig: clean(checker.typeToString(memberType, at, flags)),
					doc: docOf(symbol, checker)
				};
	}
	return out;
}

export function generate(): PackageDocs {
	const configPath = join(PKG, 'tsconfig.json');
	const config = ts.readConfigFile(configPath, ts.sys.readFile);
	const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, PKG);
	const entry = join(PKG, 'src/index.ts');
	const all = join(PKG, 'src/all.ts');
	const cvd = join(PKG, 'src/cvd.ts');
	const program = ts.createProgram([entry, all, cvd], parsed.options);
	const checker = program.getTypeChecker();

	const docs: PackageDocs = { models: {}, functions: {} };
	const index = checker.getSymbolAtLocation(program.getSourceFile(entry)!)!;
	for (const exported of checker.getExportsOfModule(index)) {
		const symbol =
			exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
		const decl = symbol.valueDeclaration;
		if (!decl || !ts.isClassDeclaration(decl) || symbol.getName() === 'Color') continue;
		const name = exported.getName();
		const instance = checker.getDeclaredTypeOfSymbol(symbol);
		const statics = checker.getTypeOfSymbolAtLocation(symbol, decl);
		const ctor = statics.getConstructSignatures()[0];
		docs.models[name] = {
			doc: docOf(symbol, checker),
			constructor: ctor ? checker.signatureToString(ctor, decl).replace(/:\s*\w+$/, '') : '()',
			members: membersOf(instance, checker, decl),
			statics: membersOf(statics, checker, decl)
		};
	}
	for (const [file, names] of [
		[all, ['parse']],
		[cvd, ['simulateCvd']]
	] as const) {
		const mod = checker.getSymbolAtLocation(program.getSourceFile(file)!)!;
		for (const exported of checker.getExportsOfModule(mod)) {
			if (!(names as readonly string[]).includes(exported.getName())) continue;
			const decl = exported.valueDeclaration!;
			const sig = checker.getTypeOfSymbolAtLocation(exported, decl).getCallSignatures()[0];
			docs.functions[exported.getName()] = {
				kind: 'method',
				sig: checker.signatureToString(sig, decl),
				doc: docOf(exported, checker)
			};
		}
	}
	return docs;
}

export interface PackedDocs {
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

export function serialize(docs: PackageDocs): string {
	const strings: string[] = [];
	const index = new Map<string, number>();
	const id = (s: string) => {
		let i = index.get(s);
		if (i === undefined) index.set(s, (i = strings.push(s) - 1));
		return i;
	};
	const pack = (m: MemberDoc): PackedMember => [m.kind === 'method' ? 0 : 1, id(m.sig), id(m.doc)];
	const packAll = (r: Record<string, MemberDoc>) =>
		Object.fromEntries(Object.entries(r).map(([k, v]) => [k, pack(v)]));
	const packed: PackedDocs = {
		strings,
		models: Object.fromEntries(
			Object.entries(docs.models).map(([k, m]) => [
				k,
				{
					doc: id(m.doc),
					constructor: id(m.constructor),
					members: packAll(m.members),
					statics: packAll(m.statics)
				}
			])
		),
		functions: packAll(docs.functions)
	};
	return JSON.stringify(packed) + '\n';
}

if (import.meta.main) writeFileSync(OUT, serialize(generate()));
