<script lang="ts">
	import { onMount } from 'svelte';
	import {
		EditorView,
		keymap,
		lineNumbers,
		drawSelection,
		highlightActiveLine,
		highlightActiveLineGutter
	} from '@codemirror/view';
	import { EditorState, Compartment, type Extension } from '@codemirror/state';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { syntaxHighlighting, bracketMatching } from '@codemirror/language';
	import { HighlightStyle } from '@codemirror/language';
	import { tags } from '@lezer/highlight';
	import { chromaDSL } from '$lib/dsl/lang.js';
	import { autocompletion, type CompletionSource } from '@codemirror/autocomplete';
	import { highlightSelectionMatches } from '@codemirror/search';

	let {
		value = $bindable(''),
		onchange,
		completionSource,
		hover,
		swatch
	}: {
		value: string;
		onchange?: (value: string) => void;
		completionSource?: CompletionSource;
		hover?: Extension;
		swatch?: Extension;
	} = $props();

	let container: HTMLDivElement;
	let view: EditorView;
	const swatchCompartment = new Compartment();

	const theme = EditorView.theme({
		'&': {
			height: '100%',
			fontSize: '13px',
			backgroundColor: 'transparent',
			color: 'var(--cm-text)'
		},
		'.cm-content': {
			fontFamily:
				"'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
			padding: '16px 0',
			caretColor: 'var(--cm-caret)'
		},
		'.cm-line': {
			padding: '0 18px'
		},
		'.cm-gutters': {
			backgroundColor: 'transparent',
			color: 'var(--cm-gutter)',
			border: 'none',
			paddingLeft: '10px'
		},
		'.cm-activeLineGutter': {
			backgroundColor: 'transparent',
			color: 'var(--cm-gutter-active)'
		},
		'.cm-activeLine': {
			backgroundColor: 'var(--cm-active-line)'
		},
		'.cm-cursor': {
			borderLeftColor: 'var(--cm-caret)',
			borderLeftWidth: '2px'
		},
		'.cm-selectionBackground': {
			backgroundColor: 'var(--cm-selection) !important'
		},
		'&.cm-focused .cm-selectionBackground': {
			backgroundColor: 'var(--cm-selection-focus) !important'
		},
		'.cm-matchingBracket': {
			backgroundColor: 'var(--cm-bracket)',
			outline: 'none'
		},
		'.cm-selectionMatch': {
			backgroundColor: 'color-mix(in srgb, var(--accent) 24%, transparent)',
			borderRadius: '2px'
		},
		'.cm-tooltip': {
			backgroundColor: 'var(--surface)',
			border: '1px solid var(--border)',
			borderRadius: 'var(--radius-sm)',
			boxShadow: 'var(--shadow)',
			color: 'var(--text)',
			overflow: 'hidden'
		},
		'.cm-tooltip.cm-tooltip-autocomplete > ul': {
			fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
			fontSize: '12px'
		},
		'.cm-tooltip-autocomplete > ul > li': {
			padding: '3px 8px'
		},
		'.cm-tooltip-autocomplete > ul > li[aria-selected]': {
			backgroundColor: 'var(--accent)',
			color: 'var(--accent-fg)'
		},
		'.cm-completionDetail': {
			color: 'var(--text-faint)',
			fontStyle: 'normal',
			marginLeft: '8px'
		},
		'.cm-completionInfo': {
			backgroundColor: 'var(--surface)',
			border: '1px solid var(--border)',
			borderRadius: 'var(--radius-sm)',
			color: 'var(--text-muted)',
			padding: '6px 9px'
		},
		'.cm-chroma-tip': {
			padding: '7px 10px',
			maxWidth: '300px',
			fontFamily: 'ui-sans-serif, system-ui, sans-serif',
			fontSize: '12px',
			lineHeight: '1.5'
		},
		'.cm-chroma-tip .tip-head': {
			display: 'flex',
			alignItems: 'center',
			gap: '6px'
		},
		'.cm-chroma-tip .tip-sw': {
			width: '12px',
			height: '12px',
			borderRadius: '3px',
			border: '1px solid rgba(128,128,128,0.35)',
			flexShrink: '0'
		},
		'.cm-chroma-tip .tip-title': {
			color: 'var(--accent)',
			fontWeight: '600',
			fontFamily: "'JetBrains Mono', ui-monospace, monospace"
		},
		'.cm-chroma-tip .tip-detail': {
			color: 'var(--text-faint)',
			fontFamily: "'JetBrains Mono', ui-monospace, monospace",
			fontSize: '11px'
		},
		'.cm-chroma-tip .tip-doc': {
			color: 'var(--text-muted)',
			marginTop: '3px'
		}
	});

	const highlight = syntaxHighlighting(
		HighlightStyle.define([
			{ tag: tags.variableName, color: 'var(--syn-var)' },
			{ tag: tags.function(tags.variableName), color: 'var(--syn-fn)' },
			{ tag: tags.typeName, color: 'var(--syn-type)' },
			{ tag: tags.propertyName, color: 'var(--syn-prop)' },
			{ tag: tags.function(tags.propertyName), color: 'var(--syn-method)' },
			{ tag: tags.namespace, color: 'var(--syn-view)' },
			{ tag: tags.number, color: 'var(--syn-num)' },
			{ tag: tags.string, color: 'var(--syn-str)' },
			{ tag: tags.bool, color: 'var(--syn-num)' },
			{ tag: tags.operator, color: 'var(--syn-op)' },
			{ tag: tags.punctuation, color: 'var(--syn-punct)' },
			{ tag: tags.lineComment, color: 'var(--syn-comment)', fontStyle: 'italic' }
		])
	);

	const updateListener = EditorView.updateListener.of((update) => {
		if (update.docChanged) {
			const newValue = update.state.doc.toString();
			value = newValue;
			onchange?.(newValue);
		}
	});

	onMount(() => {
		view = new EditorView({
			state: EditorState.create({
				doc: value,
				extensions: [
					lineNumbers(),
					history(),
					drawSelection(),
					bracketMatching(),
					highlightActiveLine(),
					highlightActiveLineGutter(),
					highlightSelectionMatches({ highlightWordAroundCursor: true, minSelectionLength: 1 }),
					keymap.of([...defaultKeymap, ...historyKeymap]),
					chromaDSL,
					...(completionSource
						? [autocompletion({ override: [completionSource], activateOnTyping: true })]
						: []),
					...(hover ? [hover] : []),
					swatchCompartment.of(swatch ?? []),
					theme,
					highlight,
					updateListener
				]
			}),
			parent: container
		});

		return () => view.destroy();
	});

	// Sync external value changes back to CodeMirror
	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: value }
			});
		}
	});

	// Live-swap the swatch marker style when the caller passes a new extension.
	$effect(() => {
		if (view) view.dispatch({ effects: swatchCompartment.reconfigure(swatch ?? []) });
	});
</script>

<div bind:this={container} class="h-full"></div>
