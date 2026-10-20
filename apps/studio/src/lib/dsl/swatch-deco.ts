/**
 * Inline color swatches in the editor: every variable that resolves to a live
 * color gets a visual marker next to / around its name, kept in sync with the
 * evaluated scheme. Pure decoration — it never edits the document.
 *
 * The marker style is configurable (see `SwatchMode`) so the look can be tuned;
 * the colour lookup is injected, so this module stays free of the app store.
 */
import {
	Decoration,
	type DecorationSet,
	EditorView,
	ViewPlugin,
	type ViewUpdate,
	WidgetType
} from '@codemirror/view';
import { RangeSetBuilder, StateEffect, type Range } from '@codemirror/state';
import { parse, oklch, formatHex, wcagLuminance } from 'culori';

export type SwatchMode = 'square' | 'dot' | 'background' | 'underline' | 'text' | 'outline';

/** Asks CodeMirror to rebuild swatches even without a doc change (colours moved). */
export const refreshSwatches = StateEffect.define<null>();

const IDENT = /[A-Za-z_]\w*/g;

/**
 * True if the identifier at the end of `prefix` (text from the line start up to
 * it) sits in real code — i.e. not inside a `//` comment or a string literal.
 */
function isCode(prefix: string): boolean {
	let inStr = false;
	let quote = '';
	for (let i = 0; i < prefix.length; i++) {
		const c = prefix[i];
		if (inStr) {
			if (c === quote) inStr = false;
		} else if (c === '"' || c === "'") {
			inStr = true;
			quote = c;
		} else if (c === '/' && prefix[i + 1] === '/') {
			return false;
		}
	}
	return !inStr;
}

/** Black or white text — whichever has more WCAG contrast on the `hex` chip. */
function readableInk(hex: string): string {
	const col = parse(hex);
	if (!col) return '#fff';
	const L = wcagLuminance(col); // 0..1
	const onWhite = 1.05 / (L + 0.05);
	const onBlack = (L + 0.05) / 0.05;
	return onWhite >= onBlack ? '#fff' : '#000';
}

/**
 * Relative luminance (0..1) of the editor's effective background — walks up from
 * the scroll element until it finds an opaque background. Used to keep coloured
 * names readable in both the light and dark themes.
 */
function bgLuminance(view: EditorView): number {
	let el: Element | null = view.scrollDOM;
	while (el) {
		const col = parse(getComputedStyle(el).backgroundColor);
		if (col && (col.alpha ?? 1) > 0.05) return wcagLuminance(col);
		el = el.parentElement;
	}
	return 0.1; // assume a darkish editor if nothing opaque was found
}

/**
 * Tint for a coloured variable name: keep the colour's hue and chroma but clamp
 * its OKLCH lightness into a band that stays legible against `bgLum`. On a dark
 * editor names are floored to a light L; on a light editor they're capped to a
 * dark L. Returns null if the colour can't be parsed.
 */
function readableText(hex: string, bgLum: number): string | null {
	const c = oklch(hex);
	if (!c) return null;
	const darkBg = bgLum < 0.4;
	const l = darkBg ? Math.max(c.l, 0.66) : Math.min(c.l, 0.5);
	return formatHex({ mode: 'oklch', l, c: c.c, h: c.h }) ?? hex;
}

class SwatchWidget extends WidgetType {
	constructor(
		readonly hex: string,
		readonly after: boolean
	) {
		super();
	}
	eq(o: SwatchWidget) {
		return o.hex === this.hex && o.after === this.after;
	}
	toDOM() {
		const s = document.createElement('span');
		s.className = `cm-swatch ${this.after ? 'cm-swatch-after' : 'cm-swatch-before'}`;
		s.style.background = this.hex;
		s.title = this.hex;
		return s;
	}
	ignoreEvent() {
		return false;
	}
}

function decoFor(
	mode: SwatchMode,
	from: number,
	to: number,
	hex: string,
	bgLum: number
): Range<Decoration> | null {
	switch (mode) {
		case 'square':
			return Decoration.widget({ widget: new SwatchWidget(hex, false), side: -1 }).range(from);
		case 'dot':
			return Decoration.widget({ widget: new SwatchWidget(hex, true), side: 1 }).range(to);
		case 'background':
			return Decoration.mark({
				attributes: {
					class: 'cm-cv',
					style: `background:${hex};color:${readableInk(hex)};border-radius:3px;padding:0 2px;`
				}
			}).range(from, to);
		case 'underline':
			// Real text underline in the true colour; `skip-ink` lets descenders
			// cut into it, small offset keeps it tight to the text.
			return Decoration.mark({
				attributes: {
					style: `text-decoration:underline;text-decoration-color:${hex};text-decoration-thickness:2px;text-underline-offset:2px;text-decoration-skip-ink:auto;`
				}
			}).range(from, to);
		case 'outline':
			// True-colour box around the name (inset shadow → no layout shift).
			return Decoration.mark({
				attributes: {
					style: `box-shadow:inset 0 0 0 1.5px ${hex};border-radius:4px;padding:0 3px;`
				}
			}).range(from, to);
		case 'text': {
			const ink = readableText(hex, bgLum);
			if (!ink) return null;
			// `cm-cv` + the baseTheme rule force the inner syntax-highlight span to
			// inherit this colour (otherwise its own `color` wins for the text).
			return Decoration.mark({ attributes: { class: 'cm-cv', style: `color:${ink};` } }).range(
				from,
				to
			);
		}
	}
}

function build(
	view: EditorView,
	getHex: (name: string) => string | null,
	mode: SwatchMode
): DecorationSet {
	const bgLum = mode === 'text' ? bgLuminance(view) : 0;
	const ranges: Range<Decoration>[] = [];
	for (const { from, to } of view.visibleRanges) {
		const text = view.state.sliceDoc(from, to);
		IDENT.lastIndex = 0;
		let m: RegExpExecArray | null;
		while ((m = IDENT.exec(text))) {
			const at = from + m.index;
			// skip member access (`.ok_c`, `.lighten`) — only bare references count
			if (at > 0 && view.state.sliceDoc(at - 1, at) === '.') continue;
			const hex = getHex(m[0]);
			if (!hex) continue;
			// skip identifiers inside comments / strings
			const line = view.state.doc.lineAt(at);
			if (!isCode(line.text.slice(0, at - line.from))) continue;
			const deco = decoFor(mode, at, at + m[0].length, hex, bgLum);
			if (deco) ranges.push(deco);
		}
	}
	ranges.sort((a, b) => a.from - b.from || a.value.startSide - b.value.startSide);
	const b = new RangeSetBuilder<Decoration>();
	for (const r of ranges) b.add(r.from, r.to, r.value);
	return b.finish();
}

const swatchTheme = EditorView.baseTheme({
	'.cm-swatch': {
		display: 'inline-block',
		width: '0.72em',
		height: '0.72em',
		borderRadius: '3px',
		boxSizing: 'border-box',
		verticalAlign: 'baseline',
		cursor: 'pointer'
	},
	'.cm-swatch-before': { marginRight: '0.4em' },
	'.cm-swatch-after': { marginLeft: '0.4em' },
	// Coloured-name mode: make nested syntax-highlight spans take the tint.
	'.cm-cv span': { color: 'inherit !important' }
});

/**
 * Build the swatch extension. `getHex(name)` returns the variable's hex (or
 * null if it isn't a colour); `mode` selects the visual treatment.
 */
export function chromaSwatches(
	getHex: (name: string) => string | null,
	mode: SwatchMode = 'square'
) {
	const plugin = ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			frame = 0;
			themeObserver?: MutationObserver;
			constructor(view: EditorView) {
				this.decorations = build(view, getHex, mode);
				// Re-tint coloured names when the app theme (editor bg) flips.
				if (mode === 'text' && typeof MutationObserver !== 'undefined') {
					this.themeObserver = new MutationObserver(() =>
						view.dispatch({ effects: refreshSwatches.of(null) })
					);
					this.themeObserver.observe(document.documentElement, {
						attributes: true,
						attributeFilter: ['data-theme']
					});
				}
			}
			update(u: ViewUpdate) {
				const refresh = u.transactions.some((t) => t.effects.some((e) => e.is(refreshSwatches)));
				if (u.docChanged || u.viewportChanged || refresh) {
					this.decorations = build(u.view, getHex, mode);
				}
				// Colours derive from the doc one tick later; nudge a rebuild next frame.
				if (u.docChanged) {
					cancelAnimationFrame(this.frame);
					this.frame = requestAnimationFrame(() =>
						u.view.dispatch({ effects: refreshSwatches.of(null) })
					);
				}
			}
			destroy() {
				cancelAnimationFrame(this.frame);
				this.themeObserver?.disconnect();
			}
		},
		{ decorations: (v) => v.decorations }
	);
	return [plugin, swatchTheme];
}
