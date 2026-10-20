import { describe, expect, test } from 'bun:test';
import {
	DEFAULT_SHOWCASE_CONFIG,
	DEFAULT_VIEWS,
	SHOWCASE_VIEWS,
	buildEmbedSnippet,
	buildShowcaseUrl,
	parseShowcaseConfig,
	showcaseSearch,
	type ShowcaseConfig
} from '../src/lib/showcase/config';

describe('parseShowcaseConfig', () => {
	test('empty query is the default config', () => {
		expect(parseShowcaseConfig('')).toEqual(DEFAULT_SHOWCASE_CONFIG);
	});

	test('views filter to known ids, keep order, dedupe', () => {
		const cfg = parseShowcaseConfig('views=preview,code,preview,nope');
		expect(cfg.views).toEqual(['preview', 'code']);
		// Landing view falls back to the first listed view.
		expect(cfg.view).toBe('preview');
	});

	test('all-garbage views fall back to the default set', () => {
		expect(parseShowcaseConfig('views=nope,alsonope').views).toEqual(DEFAULT_VIEWS);
	});

	test('tab must be inside views', () => {
		expect(parseShowcaseConfig('views=code,export&tab=export').view).toBe('export');
		expect(parseShowcaseConfig('views=code,export&tab=matrix').view).toBe('code');
		expect(parseShowcaseConfig('tab=preview').view).toBe('preview');
	});

	test('view= is an alias of tab=', () => {
		expect(parseShowcaseConfig('view=inspector').view).toBe('inspector');
	});

	test('theme, chrome, autoheight, title', () => {
		const cfg = parseShowcaseConfig('theme=dark&chrome=0&autoheight=false&title=Brand%20palette');
		expect(cfg.theme).toBe('dark');
		expect(cfg.chrome).toBe(false);
		expect(cfg.autoHeight).toBe(false);
		expect(cfg.title).toBe('Brand palette');
	});

	test('unknown theme falls back to auto', () => {
		expect(parseShowcaseConfig('theme=neon').theme).toBe('auto');
	});

	test('edit accepts its aliases', () => {
		expect(parseShowcaseConfig('edit=none').edit).toBe('none');
		expect(parseShowcaseConfig('edit=off').edit).toBe('none');
		expect(parseShowcaseConfig('edit=0').edit).toBe('none');
		expect(parseShowcaseConfig('edit=open').edit).toBe('open');
		expect(parseShowcaseConfig('edit=1').edit).toBe('open');
		expect(parseShowcaseConfig('edit=whatever').edit).toBe('toggle');
	});

	test('title is length-capped', () => {
		expect(parseShowcaseConfig('title=' + 'x'.repeat(400)).title.length).toBe(120);
	});

	test('a bare flag reads as true', () => {
		expect(parseShowcaseConfig('chrome').chrome).toBe(true);
	});
});

describe('showcaseSearch', () => {
	test('defaults serialize to nothing', () => {
		expect(showcaseSearch(DEFAULT_SHOWCASE_CONFIG)).toBe('');
	});

	test('only non-defaults are emitted', () => {
		const q = showcaseSearch({ ...DEFAULT_SHOWCASE_CONFIG, theme: 'dark', chrome: false });
		expect(q).toBe('?theme=dark&chrome=0');
	});

	test('landing view is omitted when it is the first tab', () => {
		const cfg: ShowcaseConfig = {
			...DEFAULT_SHOWCASE_CONFIG,
			views: ['preview', 'code'],
			view: 'preview'
		};
		expect(showcaseSearch(cfg)).toBe('?views=preview%2Ccode');
	});

	test('round-trips through parse', () => {
		const cfg: ShowcaseConfig = {
			views: ['inspector', 'export'],
			view: 'export',
			theme: 'light',
			edit: 'none',
			chrome: false,
			title: 'Acme brand',
			autoHeight: false
		};
		expect(parseShowcaseConfig(showcaseSearch(cfg).slice(1))).toEqual(cfg);
	});

	test('every view id round-trips', () => {
		for (const v of SHOWCASE_VIEWS) {
			const cfg: ShowcaseConfig = { ...DEFAULT_SHOWCASE_CONFIG, views: [v], view: v };
			expect(parseShowcaseConfig(showcaseSearch(cfg).slice(1)).views).toEqual([v]);
		}
	});
});

describe('buildShowcaseUrl', () => {
	test('query first, hash last', () => {
		const url = buildShowcaseUrl('https://example.test', '/chromatics', '~2AAA', {
			...DEFAULT_SHOWCASE_CONFIG,
			theme: 'dark'
		});
		expect(url).toBe('https://example.test/chromatics/showcase?theme=dark#~2AAA');
	});

	test('tolerates a trailing slash on the origin, an empty base and a #-prefixed hash', () => {
		expect(buildShowcaseUrl('https://example.test/', '', '#~1BBB', DEFAULT_SHOWCASE_CONFIG)).toBe(
			'https://example.test/showcase#~1BBB'
		);
	});

	test('no hash yields a bare showcase URL', () => {
		expect(buildShowcaseUrl('https://example.test', '', '', DEFAULT_SHOWCASE_CONFIG)).toBe(
			'https://example.test/showcase'
		);
	});
});

describe('buildEmbedSnippet', () => {
	const url = 'https://example.test/chromatics/showcase#~2AAA';

	test('iframe only when auto-height is off', () => {
		const s = buildEmbedSnippet(url, { height: 640, autoHeight: false, title: 'Brand' });
		expect(s).toContain('<iframe');
		expect(s).toContain('height:640px');
		expect(s).toContain('title="Brand"');
		expect(s).not.toContain('addEventListener');
	});

	test('auto-height adds an origin-checked listener keyed on the frame window', () => {
		const s = buildEmbedSnippet(url, { height: 720, autoHeight: true, title: '' });
		expect(s).toContain('data-chromatics');
		expect(s).toContain('e.origin !== "https://example.test"');
		expect(s).toContain("e.data.type !== 'chromatics:height'");
		expect(s).toContain('f.contentWindow === e.source');
		// The snippet is pasted into a host page, so it carries a real closing tag.
		expect(s).toContain('</script>');
	});

	test('an explicit origin overrides the one inferred from the URL', () => {
		const s = buildEmbedSnippet(url, {
			height: 500,
			autoHeight: true,
			title: '',
			origin: 'https://other.test'
		});
		expect(s).toContain('"https://other.test"');
	});

	test('a non-http URL drops the origin check rather than emitting a broken one', () => {
		const s = buildEmbedSnippet('/showcase#~2AAA', { height: 500, autoHeight: true, title: '' });
		expect(s).not.toContain('e.origin !==');
	});

	test('attribute values are escaped', () => {
		const s = buildEmbedSnippet('https://x.test/showcase?a=1&b=2', {
			height: 400,
			autoHeight: false,
			title: 'He said "hi" <b>'
		});
		expect(s).toContain('a=1&amp;b=2');
		expect(s).toContain('title="He said &quot;hi&quot; &lt;b>"');
	});
});
