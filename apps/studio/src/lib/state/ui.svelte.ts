/** UI/chrome state: theme, the resizable/collapsible editor, and the active tab. */
import type { SwatchMode } from '$lib/dsl/swatch-deco';

export type Theme = 'light' | 'dark';
export type Tab =
	| 'inspector'
	| 'studio'
	| 'matrix'
	| 'validate'
	| 'preview'
	| 'styleguide'
	| 'history'
	| 'export';

/**
 * Progressive disclosure: the relationship-first tabs a newcomer should see
 * first, vs. the deeper analysis tabs kept behind a "More" affordance. Shared by
 * both shells (desktop disclosure + mobile More sheet) so the split never drifts.
 * (The 3-D model viewer is NOT a tab — it lives on the /models encyclopedia.)
 */
export const PRIMARY_TABS: Tab[] = ['inspector', 'studio', 'preview', 'styleguide', 'export'];
export const ADVANCED_TABS: Tab[] = ['matrix', 'validate', 'history'];
export const ALL_TABS: Tab[] = [...PRIMARY_TABS, ...ADVANCED_TABS];
export const isAdvancedTab = (t: Tab): boolean => ADVANCED_TABS.includes(t);
export const isTab = (v: unknown): v is Tab => ALL_TABS.includes(v as Tab);

export class UiStore {
	theme = $state<Theme>('light');
	/** Editor pane width as a percentage of the window. */
	editorWidth = $state(46);
	editorCollapsed = $state(false);
	tab = $state<Tab>('inspector');
	/** How colour variables are marked in the editor. */
	swatchMode = $state<SwatchMode>('square');

	/**
	 * Viewport gate for the desktop/mobile shell split. Both stay false during
	 * SSR/prerender and on the first client (hydration) render, so the prerendered
	 * markup is always the desktop shell — no hydration mismatch. They flip in
	 * +layout.svelte onMount once matchMedia can be read safely. See
	 * src/routes/+page.svelte for the mount-gated chooser.
	 */
	mounted = $state(false);
	isMobile = $state(false);

	/**
	 * True while the `/showcase` embed owns the page. It suppresses everything
	 * that would leak the embed's presentation into the visitor's own studio:
	 * the `chromatics:theme` / `chromatics:ui` writes in +layout and the
	 * first-run welcome modal. Set in `showcase/+page.svelte`'s onMount and
	 * cleared on destroy (client-side nav back to `/` must restore normal UX).
	 */
	embed = $state(false);
	/**
	 * Source is display-only: `insert()` (the Studio/Design-System DSL emitters)
	 * becomes a no-op and the scaffold CTAs hide. The embed sets this while
	 * locked so a viewer can't silently rewrite the author's scheme.
	 */
	sourceLocked = $state(false);

	toggleTheme() {
		this.theme = this.theme === 'light' ? 'dark' : 'light';
	}
}

export const ui = new UiStore();
