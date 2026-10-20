import { StreamLanguage, type StreamParser } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { manifest } from './manifest.js';
import { BLOCK_LABELS, BLOCK_MEMBER_NAMES } from './block-scope.js';

// Token sets, derived from the one registry-built manifest (no drift).
const CONSTRUCTORS = manifest.constructorNames;
const BUILTINS = manifest.builtinNames;
const METHODS = manifest.methodNames;
const PROPERTIES = manifest.propertyNames;
const VIEWS = new Set(manifest.viewMembers.keys());

interface State {
	afterDot: boolean;
	depth: number; // brace nesting
	block: string | null; // active `label { … }` block
	blockDepth: number; // brace depth at which the active block's body lives
	pendingBlock: string | null; // a block keyword awaiting its opening `{`
}

const parser: StreamParser<State> = {
	startState(): State {
		return { afterDot: false, depth: 0, block: null, blockDepth: 0, pendingBlock: null };
	},

	token(stream, state): string | null {
		if (stream.eatSpace()) {
			state.afterDot = false;
			return null; // keep pendingBlock across the space before `{`
		}

		// Comments
		if (stream.match('//')) {
			stream.skipToEnd();
			return 'comment';
		}

		// Strings
		if (stream.match(/"[^"]*"/) || stream.match(/'[^']*'/)) {
			state.afterDot = false;
			state.pendingBlock = null;
			return 'string';
		}

		// Numbers
		if (stream.match(/^-?\d+\.?\d*/)) {
			state.afterDot = false;
			state.pendingBlock = null;
			return 'number';
		}

		// Member access dot
		if (stream.eat('.')) {
			state.afterDot = true;
			state.pendingBlock = null;
			return 'punctuation';
		}

		// Identifiers
		const wordMatch = stream.match(/^[a-zA-Z_]\w*/);
		if (wordMatch) {
			const word = typeof wordMatch === 'boolean' ? '' : wordMatch[0];

			if (state.afterDot) {
				state.afterDot = false;
				state.pendingBlock = null;
				if (METHODS.has(word)) return 'method';
				if (VIEWS.has(word)) return 'view';
				if (PROPERTIES.has(word)) return 'property';
				return 'property';
			}

			state.pendingBlock = null;

			// A block header — `label {` at the top level (the `{` follows on this line).
			if (
				state.depth === 0 &&
				state.block === null &&
				BLOCK_LABELS.has(word) &&
				stream.match(/^[ \t]*\{/, false)
			) {
				state.pendingBlock = word;
				return 'block';
			}

			// A bare member *call* inside a builder block (followed by `(`).
			if (state.block) {
				const members = BLOCK_MEMBER_NAMES.get(state.block);
				if (members && members.has(word) && stream.match(/^[ \t]*\(/, false)) return 'method';
			}

			if (CONSTRUCTORS.has(word)) return 'ctor';
			if (BUILTINS.has(word)) return 'builtin';
			if (word === 'true' || word === 'false') return 'bool';
			return 'variable';
		}

		// Block-tracking braces
		if (stream.eat('{')) {
			const wasTop = state.depth === 0;
			state.depth++;
			state.afterDot = false;
			if (state.pendingBlock && wasTop) {
				state.block = state.pendingBlock;
				state.blockDepth = state.depth;
			}
			state.pendingBlock = null;
			return 'punctuation';
		}
		if (stream.eat('}')) {
			if (state.depth > 0) state.depth--;
			if (state.block && state.depth < state.blockDepth) state.block = null;
			state.afterDot = false;
			state.pendingBlock = null;
			return 'punctuation';
		}

		// Operators
		if (stream.match(/^[+\-*/%=<>!&|?:]+/)) {
			state.afterDot = false;
			state.pendingBlock = null;
			return 'operator';
		}

		// Parens / brackets / commas
		if (stream.match(/^[()[\],]/)) {
			state.afterDot = false;
			state.pendingBlock = null;
			return 'punctuation';
		}

		stream.next();
		state.afterDot = false;
		state.pendingBlock = null;
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
		block: tags.namespace,
		property: tags.propertyName,
		variable: tags.variableName,
		operator: tags.operator,
		punctuation: tags.punctuation
	}
};

export const chromaDSL = StreamLanguage.define(parser);
