/**
 * Context-aware autocomplete, driven by the manifest:
 *  - at expression start  → model classes + builtins + live user variables
 *  - after `color.`       → that variable's model's members (from the last evaluation), else every model's
 *  - after `Oklch.`       → the class's statics; after `preview.` / `tokens.` … → the namespace's members
 *  - inside a `preview {}` / `component {}` / `tokens {}` block → that block's
 *    bare members surface first; inside `roles {}` → role keys then color names
 */
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { manifest, type MemberInfo } from './manifest.js';
import { enclosingBlock, blockMembers, ROLE_KEYS, MAPPING_BLOCKS } from './block-scope.js';

function toCompletion(m: MemberInfo): Completion {
	return { label: m.name, type: m.kind, detail: m.detail, info: m.doc };
}

/** `modelOf(name)` is the model name of a variable's value at the last evaluation, if it's a color. */
export function chromaCompletions(
	getVars: () => string[],
	modelOf: (name: string) => string | undefined = () => undefined
) {
	return (ctx: CompletionContext): CompletionResult | null => {
		const chain = ctx.matchBefore(/[\w.]+$/);

		// member access: …token.partial
		if (chain && chain.text.includes('.')) {
			const partial = /\.([A-Za-z_]\w*)?$/.exec(chain.text);
			if (partial) {
				const before = chain.text.slice(0, partial.index);
				const segs = before.split('.');
				const prev = segs[segs.length - 1];
				if (prev && /^[A-Za-z_]/.test(prev)) {
					const own = segs.length === 1 ? modelOf(prev) : undefined;
					const members =
						manifest.viewMembers.get(prev) ??
						(own ? manifest.modelMembers.get(own) : undefined) ??
						manifest.valueMembers;
					return {
						from: ctx.pos - (partial[1]?.length ?? 0),
						options: members.map(toCompletion),
						validFor: /\w*/
					};
				}
			}
		}

		// expression start
		const word = ctx.matchBefore(/\w+/);
		if (!word && !ctx.explicit) return null;
		const from = word ? word.from : ctx.pos;

		// Block-aware: what (if anything) encloses the cursor?
		const before = ctx.state.sliceDoc(0, ctx.pos);
		const block = enclosingBlock(before);

		// `roles { role = colorName }` (+ `light {}`/`dark {}`) — roles on the left,
		// named colors on the right.
		if (block && MAPPING_BLOCKS.has(block)) {
			const lineBefore = before.slice(before.lastIndexOf('\n') + 1);
			const options: Completion[] = lineBefore.includes('=')
				? getVars().map((v) => ({ label: v, type: 'variable' }))
				: ROLE_KEYS.map((r) => ({ label: r, type: 'property', info: 'theme role', boost: 50 }));
			return { from, options, validFor: /\w*/ };
		}

		const options: Completion[] = [];
		// Inside a builder block, that block's members come first.
		const members = block ? blockMembers(block) : null;
		if (members) options.push(...members.map((m) => ({ ...toCompletion(m), boost: 50 })));

		options.push(
			...manifest.constructors.map(
				(c): Completion => ({
					label: c.name,
					type: 'class',
					detail: c.params,
					info: c.doc
				})
			),
			...manifest.builtins.map((b): Completion => ({ label: b, type: 'function' })),
			...getVars().map((v): Completion => ({ label: v, type: 'variable' }))
		);
		return { from, options, validFor: /\w*/ };
	};
}
