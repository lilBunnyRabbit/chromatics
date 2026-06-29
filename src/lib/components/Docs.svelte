<script lang="ts">
	import { manifest, BUILTIN_DOCS, type MemberInfo } from '$lib/dsl/manifest';
	import { MODEL_DOCS } from '$lib/dsl/model-docs';
	import type { ModelDef, MethodDef, ChannelDef } from '$lib/models';

	let { onclose }: { onclose?: () => void } = $props();
	let query = $state('');
	let showGuide = $state(true);

	const fmtRange = (r: [number, number]) =>
		`${Number.isInteger(r[0]) ? r[0] : +r[0].toFixed(2)} … ${Number.isInteger(r[1]) ? r[1] : +r[1].toFixed(2)}`;

	const FAMILY_LABEL: Record<string, string> = {
		root: 'Value shortcuts',
		'perceptual-cylindrical': 'Perceptual cylindrical',
		lab: 'Lab family (ΔE)',
		hue: 'Hue family',
		rgb: 'RGB family (a11y · CVD)',
		tristimulus: 'Tristimulus',
		video: 'Video / broadcast',
		subtractive: 'Subtractive',
		system: 'Color systems',
		other: 'Other / concepts'
	};
	const FAMILY_ORDER = [
		'root',
		'perceptual-cylindrical',
		'lab',
		'hue',
		'rgb',
		'tristimulus',
		'video',
		'subtractive',
		'system',
		'other'
	];

	const q = $derived(query.trim().toLowerCase());
	const sorted = $derived(
		[...manifest.models].sort(
			(a, b) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family)
		)
	);

	function modelNameMatch(m: ModelDef) {
		const aka = MODEL_DOCS[m.id]?.aka?.toLowerCase() ?? '';
		return m.label.toLowerCase().includes(q) || m.id.includes(q) || aka.includes(q);
	}
	function methodList(m: ModelDef): MethodDef[] {
		const all = Array.from(m.methods.values());
		if (!q || modelNameMatch(m)) return all;
		return all.filter((d) => d.name.toLowerCase().includes(q));
	}
	function channelList(m: ModelDef): ChannelDef[] {
		if (!q || modelNameMatch(m)) return m.channels;
		return m.channels.filter((c) => c.localKey.includes(q) || c.key.includes(q));
	}
	function showModel(m: ModelDef) {
		return !q || modelNameMatch(m) || methodList(m).length > 0 || channelList(m).length > 0;
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

	// Namespaces (preview.* / scale.* / component.*) — documented like models so a
	// member search ("button", "gradient", "ramp") finds them in one place.
	const NAMESPACES: { id: string; about: string }[] = [
		{ id: 'preview', about: 'Values that render as live cards in the Inspector & Preview.' },
		{ id: 'scale', about: 'Non-color token generators — type, spacing, radius, shadow.' },
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

	function sig(def: MethodDef) {
		return def.kind === 'method'
			? `(${def.params.map((p) => p.name + (p.optional ? '?' : '')).join(', ')}) → ${def.returns}`
			: `→ ${def.returns}`;
	}
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
								Every value <strong>carries its model</strong>. A color stays in the model it was
								built in and only changes when you ask — so a color exposes <em>its own</em> model's ops
								directly, and you name another model only to borrow its math.
							</p>
							<ul>
								<li>
									<strong>A color stays in its model.</strong>
									<code>HSL(265, 0.6, 0.62)</code> stays HSL — reading <code>.h</code> gives back
									<code>265</code>. Convert explicitly with <code>c.to("oklch")</code> or
									<code>OKLCH.from(c)</code> (direct edge where one exists, else routed through culori).
								</li>
								<li>
									<strong>Ops live on the model you're in</strong> — no prefix needed:
									<code>okColor.lighten(0.1)</code>, <code>okColor.rotate(30)</code>,
									<code>hslColor.tint(0.4)</code>. Each returns a new color.
								</li>
								<li>
									<strong>Borrow another model's math by naming it</strong> (an explicit
									conversion):
									<code>brand.oklch.lighten(0.1)</code> thinks in OKLCH from a non-OKLCH color;
									<code>c.lab.l</code> reads lightness in Lab.
								</li>
								<li>
									<strong>Binary ops need the same model.</strong>
									<code>mix</code>, <code>contrast</code> and <code>deltaE</code> require both
									colors in one model — <code>mix(a, b)</code> when they already match, else convert
									first:
									<code>mix(a.oklab, b.oklab)</code>.
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
								<code class="ctor-name">{c.name}</code><code class="ctor-args"
									>({c.params.map((p) => p.name).join(', ')})</code
								>
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
						{#each g.models as m (m.id)}
							<div class="model">
								<div class="model-head">
									<span class="model-label" class:stub={m.status === 'coming-soon'}>{m.label}</span>
									{#if m.id !== 'root'}<code class="view-chip">.{m.id}</code>{/if}
									{#if m.status === 'experimental'}<span class="status-badge experimental"
											>experimental</span
										>
									{:else if m.status === 'coming-soon'}<span class="status-badge soon"
											>coming soon</span
										>{/if}
								</div>
								{#if MODEL_DOCS[m.id]?.about}
									<p class="model-about">{MODEL_DOCS[m.id]?.about}</p>
								{/if}
								{#if MODEL_DOCS[m.id]?.aka}
									<div class="model-aka"><span>aka</span> {MODEL_DOCS[m.id]?.aka}</div>
								{/if}
								{#if channelList(m).length}
									<div class="chans">
										{#each channelList(m) as ch (ch.localKey)}
											<span class="chan">
												<code>.{ch.localKey}</code>{ch.label}
												<span class="chan-range">{fmtRange(ch.range)}</span>
											</span>
										{/each}
									</div>
								{/if}
								<div class="methods">
									{#each methodList(m) as def (def.name)}
										<div class="method">
											<code class="m-name {def.kind === 'method' ? 'is-method' : 'is-prop'}"
												>.{def.name}</code
											>
											<code class="m-sig">{sig(def)}</code>
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
	.model-label.stub {
		opacity: 0.55;
	}
	.view-chip {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--syn-view);
		background: var(--surface-2);
		padding: 1px 6px;
		border-radius: 99px;
	}
	.status-badge {
		margin-left: auto;
		font-size: 9.5px;
		font-weight: 600;
		border-radius: 99px;
		padding: 0 7px;
		text-transform: lowercase;
		letter-spacing: 0.02em;
	}
	.status-badge.experimental {
		color: var(--accent);
		border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
		background: color-mix(in srgb, var(--accent) 10%, transparent);
	}
	.status-badge.soon {
		color: var(--warn);
		border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent);
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
