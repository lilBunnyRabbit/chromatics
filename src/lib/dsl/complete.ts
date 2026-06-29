/**
 * Context-aware autocomplete, driven by the manifest:
 *  - at expression start  → constructors + builtins + live user variables
 *  - after `value.`       → channel accessors, view names, flat shortcuts
 *  - after `value.view.`  → ONLY that view's channels + methods
 *  - inside a `preview {}` / `component {}` / `tokens {}` block → that block's
 *    bare members surface first; inside `roles {}` → role keys then color names
 */
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { manifest, type MemberInfo } from './manifest.js';
import { enclosingBlock, blockMembers, ROLE_KEYS } from './block-scope.js';

const KIND_TO_TYPE: Record<MemberInfo['kind'], string> = {
	method: 'method',
	accessor: 'property',
	channel: 'property',
	view: 'namespace'
};

function toCompletion(m: MemberInfo): Completion {
	const info =
		m.status === 'experimental'
			? `${m.doc} — experimental`
			: m.status === 'coming-soon'
				? `${m.doc} — coming soon (needs @lilbunnyrabbit/chromatics)`
				: m.doc;
	const boost = m.status === 'coming-soon' ? -50 : m.status === 'experimental' ? -10 : 0;
	return { label: m.name, type: KIND_TO_TYPE[m.kind], detail: m.detail, info, boost };
}

export function chromaCompletions(getVars: () => string[]) {
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
					const members = manifest.viewMembers.get(prev) ?? manifest.valueMembers;
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

		// `roles { role = colorName }` — roles on the left, named colors on the right.
		if (block === 'roles') {
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
					detail: '(' + c.params.map((p) => p.name).join(', ') + ')',
					info: c.doc
				})
			),
			...manifest.builtins.map((b): Completion => ({ label: b, type: 'function' })),
			...getVars().map((v): Completion => ({ label: v, type: 'variable' }))
		);
		return { from, options, validFor: /\w*/ };
	};
}
