/**
 * Editor hover tooltips, driven by the manifest:
 *  - hover a live variable → its swatch + value
 *  - hover a constructor / builtin / method / channel / view → signature + doc
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

function lookup(name: string, getVarInfo: (n: string) => VarInfo | null): Tip | null {
	// 1) live user variable
	const v = getVarInfo(name);
	if (v) return { title: name, detail: v.hex ? 'color' : 'value', doc: v.text, swatch: v.hex };
	// 2) constructor
	const ctor = manifest.constructors.find((c) => c.name === name);
	if (ctor)
		return {
			title: name,
			detail: '(' + ctor.params.map((p) => p.name).join(', ') + ') → color',
			doc: ctor.doc
		};
	// 3) builtin function
	if (manifest.builtinNames.has(name) && BUILTIN_DOCS[name])
		return { title: name, detail: 'function', doc: BUILTIN_DOCS[name] };
	// 4) member: method / accessor / channel / view
	const m = manifest.members.get(name);
	if (m) {
		const detail =
			m.kind === 'view' ? 'view namespace' : m.kind === 'channel' ? 'channel · number' : m.detail;
		const doc =
			m.status === 'experimental'
				? `${m.doc} — experimental`
				: m.status === 'coming-soon'
					? `${m.doc} — coming soon (needs @lilbunnyrabbit/chromatics)`
					: m.doc;
		return { title: name, detail, doc };
	}
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

export function chromaHover(getVarInfo: (n: string) => VarInfo | null) {
	return hoverTooltip((view, pos): Tooltip | null => {
		const word = view.state.wordAt(pos);
		if (!word) return null;
		const text = view.state.sliceDoc(word.from, word.to);
		const tip = lookup(text, getVarInfo);
		if (!tip) return null;
		return {
			pos: word.from,
			end: word.to,
			above: true,
			create: () => ({ dom: render(tip) })
		};
	});
}
