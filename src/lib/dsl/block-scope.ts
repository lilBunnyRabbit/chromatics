/**
 * Block-aware editor support, shared by the highlighter (`lang.ts`) and the
 * autocomplete (`complete.ts`). It tells the editor which `label { … }` block —
 * if any — encloses a position, and what completes inside it.
 *
 *  - `preview` / `component` / `tokens` are *builder* blocks: their members are
 *    called bare (`ramp(c)` means `preview.ramp(c)`), so inside the block those
 *    names highlight as methods and surface first in autocomplete.
 *  - `roles` is a *mapping* block (`role = colorName`): role keys complete on the
 *    left, your named colors on the right.
 *
 * Member sets come from the one `manifest`, so there's no drift with the
 * evaluator's actual namespaces.
 */
import { manifest, type MemberInfo } from './manifest.js';

/** Every label that opens a `label { … }` block — matches the evaluator's desugar. */
export const BLOCK_LABELS = new Set(['preview', 'component', 'tokens', 'roles']);

/** Builder blocks whose namespace members are called bare inside the block. */
const BUILDER_BLOCKS = ['preview', 'component', 'tokens'] as const;

/** block label → set of its bare member names (for the highlighter). */
export const BLOCK_MEMBER_NAMES: Map<string, Set<string>> = new Map(
	BUILDER_BLOCKS.map((b) => [b, new Set((manifest.viewMembers.get(b) ?? []).map((m) => m.name))])
);

/** The members offered as bare completions inside a builder block (null otherwise). */
export function blockMembers(label: string): MemberInfo[] | null {
	if (!BLOCK_MEMBER_NAMES.has(label)) return null;
	return manifest.viewMembers.get(label) ?? null;
}

/** Canonical theme-role keys offered on the left of a `roles { … }` line. */
export const ROLE_KEYS = [
	'bg',
	'fg',
	'surface',
	'border',
	'primary',
	'primaryFg',
	'secondary',
	'secondaryFg',
	'tertiary',
	'tertiaryFg',
	'accent',
	'accentFg'
];

/**
 * The block enclosing the end of `text` (everything before the cursor), or null
 * at the top level. Tracks brace depth so object-literal braces in arguments
 * don't close the block, and skips strings / line comments so their contents
 * never count. Blocks never nest, so a single active-block slot suffices.
 */
export function enclosingBlock(text: string): string | null {
	let depth = 0; // brace nesting
	let block: string | null = null; // active block label
	let blockDepth = 0; // depth at which the active block's body lives
	const n = text.length;
	let i = 0;
	while (i < n) {
		const c = text[i];
		// line comment — skip to end of line
		if (c === '/' && text[i + 1] === '/') {
			i += 2;
			while (i < n && text[i] !== '\n') i++;
			continue;
		}
		// string literal — skip past the closing quote (honouring escapes)
		if (c === '"' || c === "'") {
			const q = c;
			i++;
			while (i < n && text[i] !== q) {
				if (text[i] === '\\') i++;
				i++;
			}
			i++;
			continue;
		}
		if (c === '{') {
			depth++;
			i++;
			continue;
		}
		if (c === '}') {
			depth--;
			if (block && depth < blockDepth) block = null;
			i++;
			continue;
		}
		// identifier — a block keyword at top level (followed by `{`) opens a block
		if (/[A-Za-z_]/.test(c)) {
			let j = i + 1;
			while (j < n && /[A-Za-z0-9_]/.test(text[j])) j++;
			const word = text.slice(i, j);
			if (!block && depth === 0 && BLOCK_LABELS.has(word)) {
				let k = j;
				while (k < n && (text[k] === ' ' || text[k] === '\t')) k++;
				if (text[k] === '{') {
					block = word;
					depth++; // consume the opening brace
					blockDepth = depth;
					i = k + 1;
					continue;
				}
			}
			i = j;
			continue;
		}
		i++;
	}
	return block;
}
