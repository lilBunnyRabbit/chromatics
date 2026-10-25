<script lang="ts">
	import { manifest, BUILTIN_DOCS, type MemberInfo } from '$lib/dsl/manifest';
	import { MODEL_DOCS } from '$lib/dsl/model-docs';
	import { LEGACY_MODEL_IDS } from '$lib/color/legacy';
	import type { ModelInfo } from '$lib/color/catalog';

	let { onclose }: { onclose?: () => void } = $props();
	let query = $state('');
	let showGuide = $state(true);

	const fmtRange = (r: readonly [number, number]) =>
		`${Number.isInteger(r[0]) ? r[0] : +r[0].toFixed(2)} … ${Number.isInteger(r[1]) ? r[1] : +r[1].toFixed(2)}`;

	const FAMILY_LABEL: Record<string, string> = {
		perceptual: 'Perceptual cylindrical',
		lab: 'Lab family (ΔE)',
		hue: 'Hue family',
		rgb: 'RGB family (contrast · gamut · filters)',
		appearance: 'Appearance models',
		tristimulus: 'Tristimulus',
		video: 'Video / broadcast',
		subtractive: 'Subtractive'
	};
	const FAMILY_ORDER = Object.keys(FAMILY_LABEL);

	// The vault write-ups are keyed by the studio's old model ids.
	const OLD_ID = new Map<string, string>();
	for (const [old, name] of Object.entries(LEGACY_MODEL_IDS))
		if (!OLD_ID.has(name)) OLD_ID.set(name, old);
	const docOf = (m: ModelInfo) => MODEL_DOCS[OLD_ID.get(m.name) ?? ''];

	const q = $derived(query.trim().toLowerCase());
	const sorted = $derived(
		[...manifest.models].sort(
			(a, b) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family)
		)
	);

	function modelNameMatch(m: ModelInfo) {
		const aka = docOf(m)?.aka?.toLowerCase() ?? '';
		return m.label.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || aka.includes(q);
	}
	function memberList(m: ModelInfo): MemberInfo[] {
		const channels = new Set(m.channels.map((c) => c.name));
		const all = (manifest.modelMembers.get(m.name) ?? []).filter((x) => !channels.has(x.name));
		if (!q || modelNameMatch(m)) return all;
		return all.filter((d) => d.name.toLowerCase().includes(q));
	}
	function channelList(m: ModelInfo) {
		if (!q || modelNameMatch(m)) return m.channels;
		return m.channels.filter((c) => c.name.toLowerCase().includes(q));
	}
	function showModel(m: ModelInfo) {
		return !q || modelNameMatch(m) || memberList(m).length > 0 || channelList(m).length > 0;
	}

	const groups = $derived(
		FAMILY_ORDER.map((f) => ({
			family: f,
			label: FAMILY_LABEL[f] ?? f,
			models: sorted.filter((m) => m.family === f && showModel(m))
		})).filter((g) => g.models.length)
	);

	const ctors = $derived(
		manifest.constructors.filter((c) => !q || c.name.toLowerCase().includes(q))
	);
	const builtins = $derived(manifest.builtins.filter((b) => !q || b.includes(q)));

	const NAMESPACES: { id: string; about: string }[] = [
		{ id: 'preview', about: 'Values that render as live cards in the Inspector & Preview.' },
		{
			id: 'tokens',
			about: 'Non-color design tokens — type, spacing, radius, shadow, custom groups.'
		},
		{ id: 'component', about: 'Component specs rendered & auto-audited in the Styleguide tab.' }
	];
	function nsMembers(id: string): MemberInfo[] {
		const all = manifest.viewMembers.get(id) ?? [];
		if (!q || id.includes(q)) return all;
		return all.filter((m) => m.name.toLowerCase().includes(q) || m.doc.toLowerCase().includes(q));
	}
	const namespaceGroups = $derived(
		NAMESPACES.map((ns) => ({ ...ns, members: nsMembers(ns.id) })).filter((g) => g.members.length)
	);
</script>

<div class="docs-overlay">
	<div class="docs-panel">
		<header class="docs-header">
			<div class="docs-title-row">
				<h2 class="docs-title">DSL Reference</h2>
				<span class="chip">{manifest.models.length} models</span>
				<button class="icon-btn" onclick={() => onclose?.()} aria-label="Close" title="Close (Esc)">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg
					>
				</button>
			</div>
			<input
				class="docs-search"
				placeholder="Search models, namespaces, methods…"
				bind:value={query}
			/>
		</header>

		<div class="docs-body scroll">
			{#if !q}
				<section class="guide">
					<button
						class="guide-head"
						onclick={() => (showGuide = !showGuide)}
						aria-expanded={showGuide}
					>
						<span class="guide-caret" class:open={showGuide}>▸</span>
						Working with color models — how conversion works
					</button>
					{#if showGuide}
						<div class="guide-body">
							<p>
								Every color is an instance of its model's class, the same classes as the
								<code>@lilbunnyrabbit/chromatics</code> package, and the DSL is plain JavaScript over
								them.
							</p>
							<ul>
								<li>
									<strong>Build</strong> with the class, with or without <code>new</code>:
									<code>Oklch(0.62, 0.15, 250)</code>, <code>Hsl(265, 0.6, 0.62)</code>, or parse
									any CSS string: <code>parse("#6c5ce7")</code>.
								</li>
								<li>
									<strong>Convert</strong> with <code>c.to(Lab)</code>, which always returns a new
									color. Channels are plain properties: <code>c.to(Oklch).l</code>.
								</li>
								<li>
									<strong>Methods change the color and return it.</strong>
									<code>bg = brand.lighten(0.3)</code> lightens <code>brand</code> too. Copy first:
									<code>brand.clone().lighten(0.3)</code>, or work on a conversion,
									<code>brand.to(Oklch).lighten(0.3)</code>.
								</li>
								<li>
									<strong>Set channels</strong> with <code>c.l = 0.5</code>,
									<code>c.set({'{'} l: 0.5 {'}'})</code>
									or nudge them with <code>c.shift({'{'} l: -0.03 {'}'})</code>.
								</li>
								<li>
									<strong>Two-color operations need one model</strong>:
									<code>a.to(Oklab).mix(b.to(Oklab), 0.5)</code>,
									<code>fg.to(Srgb).contrast(bg.to(Srgb))</code>,
									<code>a.to(Lab).deltaE2000(b.to(Lab))</code>.
								</li>
							</ul>
						</div>
					{/if}
				</section>
			{/if}

			{#if ctors.length}
				<section class="block">
					<h3 class="block-title">Constructors</h3>
					<div class="ctor-grid">
						{#each ctors as c (c.name)}
							<div class="ctor">
								<code class="ctor-name">{c.name}</code><code class="ctor-args">{c.params}</code>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if builtins.length}
				<section class="block">
					<h3 class="block-title">Functions</h3>
					<div class="fn-list">
						{#each builtins as b (b)}
							<div class="fn">
								<code class="fn-name">{b}</code><span class="fn-doc">{BUILTIN_DOCS[b] ?? ''}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if namespaceGroups.length}
				<section class="block">
					<h3 class="block-title">Namespaces</h3>
					<div class="models">
						{#each namespaceGroups as ns (ns.id)}
							<div class="model">
								<div class="model-head">
									<span class="model-label">{ns.id}</span>
									<code class="view-chip">{ns.id}.*</code>
								</div>
								<p class="model-about">{ns.about}</p>
								<div class="methods">
									{#each ns.members as m (m.name)}
										<div class="method">
											<code class="m-name is-method">.{m.name}</code>
											<code class="m-sig">{m.detail}</code>
											<span class="m-doc">{m.doc}</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#each groups as g (g.family)}
				<section class="block">
					<h3 class="block-title">{g.label}</h3>
					<div class="models">
						{#each g.models as m (m.name)}
							<div class="model">
								<div class="model-head">
									<span class="model-label">{m.label}</span>
									<code class="view-chip">{m.name}</code>
								</div>
								{#if docOf(m)?.about}
									<p class="model-about">{docOf(m)?.about}</p>
								{/if}
								{#if docOf(m)?.aka}
									<div class="model-aka"><span>aka</span> {docOf(m)?.aka}</div>
								{/if}
								{#if channelList(m).length}
									<div class="chans">
										{#each channelList(m) as ch (ch.name)}
											<span class="chan">
												<code>.{ch.name}</code>
												<span class="chan-range">{fmtRange(ch.range)}</span>
											</span>
										{/each}
									</div>
								{/if}
								<div class="methods">
									{#each memberList(m) as def (def.name)}
										<div class="method">
											<code class="m-name {def.kind === 'method' ? 'is-method' : 'is-prop'}"
												>.{def.name}</code
											>
											<code class="m-sig">{def.detail}</code>
											<span class="m-doc">{def.doc}</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}

			{#if groups.length === 0 && ctors.length === 0 && builtins.length === 0 && namespaceGroups.length === 0}
				<div class="no-results">No matches for “{query}”.</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.docs-overlay {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--surface) 96%, transparent);
		backdrop-filter: blur(4px);
		z-index: 40;
		display: flex;
		flex-direction: column;
	}
	.docs-panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 720px;
		margin: 0 auto;
		min-height: 0;
		flex: 1;
	}
	.docs-header {
		flex-shrink: 0;
		padding: 14px 18px 12px;
		border-bottom: 1px solid var(--border);
	}
	.docs-title-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}
	.docs-title {
		font-size: 14px;
		font-weight: 700;
		margin: 0;
	}
	.docs-title-row .icon-btn {
		margin-left: auto;
	}
	.docs-search {
		width: 100%;
		padding: 7px 11px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		outline: none;
	}
	.docs-search:focus {
		border-color: var(--accent);
	}
	.docs-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 8px 18px 24px;
	}
	.block {
		margin-top: 18px;
	}
	.block-title {
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-faint);
		margin: 0 0 8px;
	}
	.ctor-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 6px;
	}
	.ctor {
		padding: 5px 9px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xs);
		background: var(--surface);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12px;
	}
	.ctor-name {
		color: var(--syn-type);
		font-weight: 600;
	}
	.ctor-args {
		color: var(--text-faint);
	}
	.fn-list {
		display: grid;
		gap: 4px;
	}
	.fn {
		display: flex;
		gap: 10px;
		align-items: baseline;
		padding: 3px 4px;
	}
	.fn-name {
		color: var(--syn-fn);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 12px;
		font-weight: 600;
		width: 64px;
		flex-shrink: 0;
	}
	.fn-doc {
		font-size: 12px;
		color: var(--text-muted);
	}
	.models {
		display: grid;
		gap: 8px;
	}
	.model {
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		box-shadow: var(--shadow-sm);
		padding: 11px 13px;
	}
	.model-head {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 7px;
	}
	.model-label {
		font-weight: 650;
		font-size: 13px;
	}
	.view-chip {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--syn-view);
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: 99px;
	}
	.chans {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		margin-bottom: 8px;
	}
	.chan {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		font-size: 11px;
		color: var(--text-faint);
		background: var(--surface-2);
		border-radius: var(--radius-xs);
		padding: 2px 7px;
	}
	.chan code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		color: var(--syn-prop);
		font-weight: 600;
	}
	.methods {
		display: grid;
		gap: 4px;
	}
	.method {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px;
		font-size: 12px;
		line-height: 1.5;
	}
	.m-name {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-weight: 600;
	}
	.m-name.is-method {
		color: var(--syn-method);
	}
	.m-name.is-prop {
		color: var(--syn-prop);
	}
	.m-sig {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-faint);
	}
	.m-doc {
		color: var(--text-muted);
		flex: 1;
		min-width: 140px;
	}
	.no-results {
		padding: 40px 0;
		text-align: center;
		color: var(--text-faint);
		font-size: 13px;
	}

	/* conversion guide */
	.guide {
		margin-top: 14px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		overflow: hidden;
	}
	.guide-head {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 13px;
		background: var(--surface-2);
		border: none;
		color: var(--text);
		font-size: 12.5px;
		font-weight: 650;
		cursor: pointer;
		text-align: left;
	}
	.guide-caret {
		color: var(--accent);
		transition: transform 0.12s;
	}
	.guide-caret.open {
		transform: rotate(90deg);
	}
	.guide-body {
		padding: 12px 15px 14px;
		font-size: 12.5px;
		line-height: 1.6;
		color: var(--text-muted);
	}
	.guide-body p {
		margin: 0 0 8px;
	}
	.guide-body ul {
		margin: 0;
		padding-left: 18px;
		display: grid;
		gap: 6px;
	}
	.guide-body code {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11.5px;
		background: var(--surface-2);
		color: var(--syn-method);
		padding: 1px 5px;
		border-radius: var(--radius-xs);
	}
	.guide-body strong {
		color: var(--text);
	}
	.model-about {
		margin: 0 0 7px;
		font-size: 12px;
		line-height: 1.55;
		color: var(--text-muted);
	}
	.model-aka {
		margin: -2px 0 8px;
		font-size: 11px;
		color: var(--text-faint);
	}
	.model-aka span {
		text-transform: uppercase;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.06em;
		margin-right: 5px;
		color: var(--accent);
	}
	.chan-range {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 9.5px;
		color: var(--text-faint);
		opacity: 0.85;
	}
</style>
