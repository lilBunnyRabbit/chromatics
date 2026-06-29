/**
 * Context-aware autocomplete, driven by the manifest:
 *  - at expression start  → constructors + builtins + live user variables
 *  - after `value.`       → channel accessors, view names, flat shortcuts
 *  - after `value.view.`  → ONLY that view's channels + methods
 */
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import { manifest, type MemberInfo } from './manifest.js';

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
		const options: Completion[] = [
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
		];
		return { from: word ? word.from : ctx.pos, options, validFor: /\w*/ };
	};
}
