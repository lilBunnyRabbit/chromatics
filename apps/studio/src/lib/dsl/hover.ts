/**
 * Editor hover tooltips, driven by the manifest:
 *  - hover a live variable → its swatch + value
 *  - hover a model class / builtin / member → signature + the package's JSDoc
 */
import { hoverTooltip, type Tooltip } from '@codemirror/view';
import { manifest, BUILTIN_DOCS } from './manifest.js';

export interface VarInfo {
	hex?: string;
	text: string;
}

interface Tip {
	title: string;
	detail?: string;
	doc?: string;
	swatch?: string;
}

function lookup(
	name: string,
	receiver: string | null,
	getVarInfo: (n: string) => VarInfo | null,
	modelOf: (n: string) => string | undefined
): Tip | null {
	if (receiver !== null) {
		const varModel = modelOf(receiver);
		const list = varModel
			? manifest.modelMembers.get(varModel)
			: manifest.viewMembers.get(receiver);
		const m = list?.find((x) => x.name === name) ?? manifest.members.get(name);
		return m ? { title: `${m.owner}.${name}`, detail: m.detail, doc: m.doc } : null;
	}
	const v = getVarInfo(name);
	if (v) return { title: name, detail: v.hex ? 'color' : 'value', doc: v.text, swatch: v.hex };
	const ctor = manifest.constructors.find((c) => c.name === name);
	if (ctor) return { title: name, detail: `${ctor.params} → color`, doc: ctor.doc };
	if (manifest.builtinNames.has(name) && BUILTIN_DOCS[name])
		return { title: name, detail: 'function', doc: BUILTIN_DOCS[name] };
	return null;
}

function render(tip: Tip): HTMLElement {
	const dom = document.createElement('div');
	dom.className = 'cm-chroma-tip';

	const head = document.createElement('div');
	head.className = 'tip-head';
	if (tip.swatch) {
		const sw = document.createElement('span');
		sw.className = 'tip-sw';
		sw.style.background = tip.swatch;
		head.appendChild(sw);
	}
	const title = document.createElement('span');
	title.className = 'tip-title';
	title.textContent = tip.title;
	head.appendChild(title);
	if (tip.detail) {
		const det = document.createElement('span');
		det.className = 'tip-detail';
		det.textContent = tip.detail;
		head.appendChild(det);
	}
	dom.appendChild(head);

	if (tip.doc) {
		const doc = document.createElement('div');
		doc.className = 'tip-doc';
		doc.textContent = tip.doc;
		dom.appendChild(doc);
	}
	return dom;
}

export function chromaHover(
	getVarInfo: (n: string) => VarInfo | null,
	modelOf: (n: string) => string | undefined = () => undefined
) {
	return hoverTooltip((view, pos): Tooltip | null => {
		const word = view.state.wordAt(pos);
		if (!word) return null;
		const text = view.state.sliceDoc(word.from, word.to);
		const before = view.state.sliceDoc(Math.max(0, word.from - 80), word.from);
		const receiver = /([A-Za-z_]\w*)\.$/.exec(before)?.[1] ?? (before.endsWith('.') ? '' : null);
		const tip = lookup(text, receiver, getVarInfo, modelOf);
		if (!tip) return null;
		return {
			pos: word.from,
			end: word.to,
			above: true,
			create: () => ({ dom: render(tip) })
		};
	});
}
