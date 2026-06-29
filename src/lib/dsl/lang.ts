import { StreamLanguage, type StreamParser } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { manifest } from './manifest.js';

// Token sets, derived from the one registry-built manifest (no drift).
const CONSTRUCTORS = manifest.constructorNames;
const BUILTINS = manifest.builtinNames;
const METHODS = manifest.methodNames;
const PROPERTIES = manifest.propertyNames;
const VIEWS = new Set(manifest.viewMembers.keys());

interface State {
	afterDot: boolean;
}

const parser: StreamParser<State> = {
	startState(): State {
		return { afterDot: false };
	},

	token(stream, state): string | null {
		if (stream.eatSpace()) {
			state.afterDot = false;
			return null;
		}

		// Comments
		if (stream.match('//')) {
			stream.skipToEnd();
			return 'comment';
		}

		// Strings
		if (stream.match(/"[^"]*"/) || stream.match(/'[^']*'/)) {
			state.afterDot = false;
			return 'string';
		}

		// Numbers
		if (stream.match(/^-?\d+\.?\d*/)) {
			state.afterDot = false;
			return 'number';
		}

		// Member access dot
		if (stream.eat('.')) {
			state.afterDot = true;
			return 'punctuation';
		}

		// Identifiers
		const wordMatch = stream.match(/^[a-zA-Z_]\w*/);
		if (wordMatch) {
			const word = typeof wordMatch === 'boolean' ? '' : wordMatch[0];

			if (state.afterDot) {
				state.afterDot = false;
				if (METHODS.has(word)) return 'method';
				if (VIEWS.has(word)) return 'view';
				if (PROPERTIES.has(word)) return 'property';
				return 'property';
			}

			if (CONSTRUCTORS.has(word)) return 'ctor';
			if (BUILTINS.has(word)) return 'builtin';
			if (word === 'true' || word === 'false') return 'bool';
			return 'variable';
		}

		// Operators
		if (stream.match(/^[+\-*/%=<>!&|?:]+/)) {
			state.afterDot = false;
			return 'operator';
		}

		// Parens / brackets / commas
		if (stream.match(/^[(){}[\],]/)) {
			state.afterDot = false;
			return 'punctuation';
		}

		stream.next();
		state.afterDot = false;
		return null;
	},

	// Map our token names to highlight tags (the Editor's HighlightStyle colors these).
	tokenTable: {
		comment: tags.lineComment,
		string: tags.string,
		number: tags.number,
		bool: tags.bool,
		ctor: tags.typeName,
		builtin: tags.function(tags.variableName),
		method: tags.function(tags.propertyName),
		view: tags.namespace,
		property: tags.propertyName,
		variable: tags.variableName,
		operator: tags.operator,
		punctuation: tags.punctuation
	}
};

export const chromaDSL = StreamLanguage.define(parser);
