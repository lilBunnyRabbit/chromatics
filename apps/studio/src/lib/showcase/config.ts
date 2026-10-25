/**
 * `/showcase` — the embeddable, read-first view of a scheme.
 *
 * Everything the embed needs travels in the URL: the scheme itself in the hash
 * (the same `~1`/`~2` share payload as a Share link — see persistence/url-hash)
 * and the presentation knobs in the query string. Both are static-host friendly:
 * GitHub Pages never sees the hash, and the query is read client-side.
 *
 *   /showcase?views=code,inspector&tab=inspector&theme=dark#~2<payload>
 *
 * This module is pure (no DOM, no stores) so the parse + build round-trip is
 * unit-testable and the embed snippet the Export tab hands out is generated from
 * exactly the same code the page consumes.
 */

/** Every view an embed may show. Studio is deliberately absent — it rewrites source. */
export const SHOWCASE_VIEWS = [
	'code',
	'inspector',
	'preview',
	'styleguide',
	'matrix',
	'validate',
	'export'
] as const;

export type ShowcaseView = (typeof SHOWCASE_VIEWS)[number];

/** Shown when `views=` is absent — the brand-guidelines default set. */
export const DEFAULT_VIEWS: ShowcaseView[] = [
	'code',
	'inspector',
	'preview',
	'styleguide',
	'export'
];

export const SHOWCASE_VIEW_LABELS: Record<ShowcaseView, string> = {
	code: 'Code',
	inspector: 'Inspector',
	preview: 'Preview',
	styleguide: 'Design System',
	matrix: 'Matrix',
	validate: 'Validate',
	export: 'Export'
};

export type ShowcaseTheme = 'light' | 'dark' | 'auto';

/**
 * `none`  — locked, no edit affordance at all (pure guidelines widget)
 * `toggle`— locked, with a ✎ that forks it live (default)
 * `open`  — boots unlocked
 */
export type ShowcaseEdit = 'none' | 'toggle' | 'open';

export interface ShowcaseConfig {
	/** Tab strip, in order. Never empty. */
	views: ShowcaseView[];
	/** Landing view; always a member of `views`. */
	view: ShowcaseView;
	theme: ShowcaseTheme;
	edit: ShowcaseEdit;
	/** Header (palette strip) + footer. `chrome=0` gives a bare panel. */
	chrome: boolean;
	/** Optional heading shown in place of the "Chromatics" wordmark. */
	title: string;
	/** Post the content height to the embedding page so it can resize the iframe. */
	autoHeight: boolean;
}

export const DEFAULT_SHOWCASE_CONFIG: ShowcaseConfig = {
	views: DEFAULT_VIEWS,
	view: 'code',
	theme: 'auto',
	edit: 'toggle',
	chrome: true,
	title: '',
	autoHeight: true
};

const isView = (v: string): v is ShowcaseView => (SHOWCASE_VIEWS as readonly string[]).includes(v);

function parseBool(raw: string | null, fallback: boolean): boolean {
	if (raw === null) return fallback;
	const v = raw.trim().toLowerCase();
	if (v === '0' || v === 'false' || v === 'no' || v === 'off') return false;
	if (v === '' || v === '1' || v === 'true' || v === 'yes' || v === 'on') return true;
	return fallback;
}

/**
 * Read an embed config out of a query string. Unknown/garbage values fall back
 * to the default rather than erroring — a bad link still renders the scheme.
 */
export function parseShowcaseConfig(input: URLSearchParams | string): ShowcaseConfig {
	const p = typeof input === 'string' ? new URLSearchParams(input) : input;

	const requested = (p.get('views') ?? '')
		.split(',')
		.map((s) => s.trim().toLowerCase())
		.filter(isView);
	const views = requested.length ? [...new Set(requested)] : [...DEFAULT_VIEWS];

	const wanted = (p.get('tab') ?? p.get('view') ?? '').trim().toLowerCase();
	const view = isView(wanted) && views.includes(wanted) ? wanted : views[0];

	const rawTheme = (p.get('theme') ?? '').trim().toLowerCase();
	const theme: ShowcaseTheme =
		rawTheme === 'light' || rawTheme === 'dark' || rawTheme === 'auto'
			? rawTheme
			: DEFAULT_SHOWCASE_CONFIG.theme;

	const rawEdit = (p.get('edit') ?? '').trim().toLowerCase();
	const edit: ShowcaseEdit =
		rawEdit === 'none' || rawEdit === 'off' || rawEdit === '0'
			? 'none'
			: rawEdit === 'open' || rawEdit === 'on' || rawEdit === '1'
				? 'open'
				: DEFAULT_SHOWCASE_CONFIG.edit;

	return {
		views,
		view,
		theme,
		edit,
		chrome: parseBool(p.get('chrome'), DEFAULT_SHOWCASE_CONFIG.chrome),
		title: (p.get('title') ?? '').slice(0, 120),
		autoHeight: parseBool(p.get('autoheight'), DEFAULT_SHOWCASE_CONFIG.autoHeight)
	};
}

const sameViews = (a: ShowcaseView[], b: ShowcaseView[]) =>
	a.length === b.length && a.every((v, i) => v === b[i]);

/** Serialize only what differs from the defaults, so links stay short. */
export function showcaseSearch(cfg: ShowcaseConfig): string {
	const p = new URLSearchParams();
	if (!sameViews(cfg.views, DEFAULT_VIEWS)) p.set('views', cfg.views.join(','));
	if (cfg.view !== cfg.views[0]) p.set('tab', cfg.view);
	if (cfg.theme !== DEFAULT_SHOWCASE_CONFIG.theme) p.set('theme', cfg.theme);
	if (cfg.edit !== DEFAULT_SHOWCASE_CONFIG.edit) p.set('edit', cfg.edit);
	if (!cfg.chrome) p.set('chrome', '0');
	if (cfg.title) p.set('title', cfg.title);
	if (!cfg.autoHeight) p.set('autoheight', '0');
	const q = p.toString();
	return q ? '?' + q : '';
}

/**
 * `<origin><base>/showcase[?query]#<hash>` — hash last, so the share payload
 * survives the query string.
 */
export function buildShowcaseUrl(
	origin: string,
	base: string,
	hash: string,
	cfg: ShowcaseConfig
): string {
	const root = origin.replace(/\/$/, '') + (base || '');
	const frag = hash ? (hash.startsWith('#') ? hash : '#' + hash) : '';
	return `${root}/showcase${showcaseSearch(cfg)}${frag}`;
}

export interface EmbedSnippetOptions {
	/** Initial iframe height in px (also the fallback when auto-height is off). */
	height: number;
	/** Emit the ~10-line resize listener alongside the iframe. */
	autoHeight: boolean;
	/** `title` attribute — required for a11y on iframes. */
	title: string;
	/** Origin to accept height messages from; defaults to the URL's own origin. */
	origin?: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * The copy-paste block for a host page. The listener matches the frame by
 * `contentWindow` (not by index) and checks `event.origin`, so several embeds
 * can share one page and a hostile frame can't resize someone else's.
 */
export function buildEmbedSnippet(url: string, o: EmbedSnippetOptions): string {
	const iframe =
		`<iframe\n` +
		`  src="${esc(url)}"\n` +
		`  title="${esc(o.title || 'Color scheme — Chromatics')}"\n` +
		`  data-chromatics\n` +
		`  loading="lazy"\n` +
		`  style="width:100%;height:${Math.round(o.height)}px;border:0;border-radius:12px"\n` +
		`></iframe>`;
	if (!o.autoHeight) return iframe;

	let origin = o.origin ?? '';
	if (!origin) {
		const m = /^(https?:\/\/[^/]+)/i.exec(url);
		origin = m ? m[1] : '*';
	}
	const originCheck =
		origin === '*' ? '' : `\n    if (e.origin !== ${JSON.stringify(origin)}) return;`;

	return (
		iframe +
		`\n\n<script>\n` +
		`  // Chromatics embeds post their content height; resize the matching frame.\n` +
		`  window.addEventListener('message', function (e) {${originCheck}\n` +
		`    if (!e.data || e.data.type !== 'chromatics:height') return;\n` +
		`    document.querySelectorAll('iframe[data-chromatics]').forEach(function (f) {\n` +
		`      if (f.contentWindow === e.source) f.style.height = e.data.height + 'px';\n` +
		`    });\n` +
		`  });\n` +
		`<\/script>`
	);
}
