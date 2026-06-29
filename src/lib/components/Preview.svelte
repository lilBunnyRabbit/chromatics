<script lang="ts">
	import { app } from '$lib/state/app.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { cssVars, NONE_ROLE, type Roles } from '$lib/scheme/roles';
	import { simulateVision, visionSimulations } from '$lib/analysis/cvd';
	import { wcagLevels, wcagColor } from '$lib/analysis/wcag';
	import BrandMark from './demos/BrandMark.svelte';
	import StyleSheet from './demos/StyleSheet.svelte';
	import Collateral from './demos/Collateral.svelte';
	import DataViz from './demos/DataViz.svelte';
	import Sheet from './mobile/Sheet.svelte';

	const demos = [
		'Landing',
		'Dashboard',
		'Blog',
		'Brand mark',
		'Style sheet',
		'Collateral',
		'Data viz'
	];
	let demoIndex = $state(0);
	// Desktop shows the roles panel inline by default; on a phone it's a sheet,
	// closed until the user taps "Roles & audit".
	let panelOpen = $state(!ui.isMobile);

	// Roles auto-resolve in the store (app.effectiveRoles); no clobbering effect.
	const simEntries = $derived(
		app.visionSim === 'none'
			? app.scheme.entries
			: app.scheme.entries.map((e) => ({ ...e, color: simulateVision(e.color, app.visionSim) }))
	);
	// CVD re-tints the theme: rebuild byName off the simulated entries so cssVars
	// (which resolves roles by name) reads the filtered colors.
	const simScheme = $derived({
		...app.scheme,
		entries: simEntries,
		byName: new Map(simEntries.map((e) => [e.name, e]))
	});
	const vars = $derived(cssVars(simScheme, app.effectiveRoles, app.opacities));
	const fails = $derived(
		app.audit.filter(
			(a) => (a.large ? wcagLevels(a.ratio).large : wcagLevels(a.ratio).normal) === 'Fail'
		).length
	);

	const roleRows: [keyof Roles, string, boolean][] = [
		['bg', 'Background', false],
		['fg', 'Foreground', false],
		['primary', 'Primary', false],
		['primaryFg', 'Primary FG', true],
		['secondary', 'Secondary', true],
		['secondaryFg', 'Secondary FG', true],
		['tertiary', 'Tertiary', true],
		['tertiaryFg', 'Tertiary FG', true],
		['accent', 'Accent', true],
		['accentFg', 'Accent FG', true],
		['surface', 'Surface', true],
		['border', 'Border', true]
	];
	const opacityRows: [keyof typeof app.opacities, string][] = [
		['muted', 'Muted'],
		['disabled', 'Disabled'],
		['hover', 'Hover'],
		['active', 'Active']
	];
</script>

<div class="preview-root">
	<div class="pv-toolbar">
		<div class="seg">
			{#each demos as d, i (d)}
				<button class="seg-item {demoIndex === i ? 'active' : ''}" onclick={() => (demoIndex = i)}
					>{d}</button
				>
			{/each}
		</div>
		<select class="select" bind:value={app.visionSim}>
			{#each visionSimulations as sim (sim.value)}<option value={sim.value}>{sim.label}</option
				>{/each}
		</select>
		<div class="pv-spacer"></div>
		<span class="pv-fails" class:bad={fails > 0}>
			{#if fails > 0}{fails} of {app.audit.length} failing{:else}all {app.audit.length} pass{/if}
		</span>
		<button class="btn" onclick={() => (panelOpen = !panelOpen)}>
			{panelOpen ? 'Hide roles' : 'Roles & audit'}
		</button>
	</div>

	<div class="pv-body">
		{#snippet panelBody()}
			<div class="pv-section-title">Color Roles</div>
			{#each roleRows as [key, label, optional] (key)}
				{@const active = app.effectiveRoles[key]}
				<div class="role-row">
					<div
						class="role-swatch"
						style="background: {active
							? (app.scheme.byName.get(active)?.color.toCSS() ?? 'var(--border-strong)')
							: 'var(--border-strong)'}"
					></div>
					<label class="role-label"
						>{label}
						<select class="role-select" bind:value={app.roles[key]}>
							<option value="">Auto</option>
							{#if optional}<option value={NONE_ROLE}>None</option>{/if}
							{#each app.scheme.entries as e (e.name)}
								<option value={e.name}>{e.name} ({e.color.hex})</option>
							{/each}
						</select>
					</label>
				</div>
			{/each}

			<div class="pv-section-title">Foreground Opacities</div>
			{#each opacityRows as [key, label] (key)}
				<label class="opacity-label">
					<span class="opacity-name">{label}</span>
					<input type="range" min="0" max="1" step="0.01" bind:value={app.opacities[key]} />
					<span class="opacity-value">{app.opacities[key].toFixed(2)}</span>
				</label>
			{/each}

			<div class="pv-section-title">Audit ({fails} failing)</div>
			<div class="audit-list">
				{#each app.audit as item (item.label)}
					{@const level = item.large ? wcagLevels(item.ratio).large : wcagLevels(item.ratio).normal}
					<div class="audit-row" class:audit-fail={level === 'Fail'}>
						<div class="audit-label">{item.label}</div>
						<div class="audit-detail">{item.fg} / {item.bg}</div>
						<div class="audit-result">
							<span class="audit-ratio">{item.ratio.toFixed(2)}</span>
							<span class="audit-level" style="color: {wcagColor(level)}">{level}</span>
						</div>
					</div>
				{/each}
			</div>
		{/snippet}

		{#if !ui.isMobile && panelOpen}
			<aside class="pv-panel">{@render panelBody()}</aside>
		{/if}

		{#if ui.isMobile}
			<Sheet open={panelOpen} onclose={() => (panelOpen = false)} title="Roles & audit">
				<div class="pv-panel-sheet">{@render panelBody()}</div>
			</Sheet>
		{/if}

		<main class="demo-scroll">
			{#if !vars}
				<div class="pv-empty">Define at least background, foreground and primary colors.</div>
			{:else}
				<div class="demo" style={vars}>
					{#if demoIndex === 0}
						<!-- Landing -->
						<nav class="d-nav">
							<div class="d-nav-inner">
								<span class="d-logo">Acme</span>
								<div class="d-nav-links">
									<a href="#f">Features</a><a href="#p">Pricing</a><a href="#a">About</a>
								</div>
								<button class="d-btn d-btn-primary">Get Started</button>
							</div>
						</nav>
						<section class="d-hero">
							<h1 class="d-hero-title">Build better products,<br />faster than ever</h1>
							<p class="d-hero-sub">
								The modern platform for teams who ship. Streamline your workflow, collaborate in
								real-time, and deliver with confidence.
							</p>
							<div class="d-hero-actions">
								<button class="d-btn d-btn-primary d-btn-lg">Start Free Trial</button>
								<button class="d-btn d-btn-outline d-btn-lg">Watch Demo</button>
							</div>
						</section>
						<section class="d-section">
							<h2 class="d-section-title">Everything you need</h2>
							<p class="d-section-sub">Powerful features to help your team succeed</p>
							<div class="d-cards-3">
								<div class="d-card">
									<div
										class="d-card-icon"
										style="background: var(--primary); color: var(--primary-fg)"
									>
										&#9672;
									</div>
									<h3 class="d-card-title">Lightning Fast</h3>
									<p class="d-card-text">
										Optimized for speed at every level. Your team won't wait for tools to catch up.
									</p>
								</div>
								<div class="d-card">
									<div
										class="d-card-icon"
										style="background: var(--secondary); color: var(--secondary-fg)"
									>
										&#9881;
									</div>
									<h3 class="d-card-title">Fully Configurable</h3>
									<p class="d-card-text">
										Adapt the platform to your workflow. Custom fields, automations, and
										integrations.
									</p>
								</div>
								<div class="d-card">
									<div
										class="d-card-icon"
										style="background: var(--tertiary); color: var(--tertiary-fg)"
									>
										&#9734;
									</div>
									<h3 class="d-card-title">Team Collaboration</h3>
									<p class="d-card-text">
										Real-time editing, comments, and notifications keep everyone aligned.
									</p>
								</div>
							</div>
						</section>
						<section class="d-stats-banner">
							<div class="d-stats-grid">
								<div class="d-stat">
									<div class="d-stat-num">10K+</div>
									<div class="d-stat-label">Teams</div>
								</div>
								<div class="d-stat">
									<div class="d-stat-num">2M</div>
									<div class="d-stat-label">Projects</div>
								</div>
								<div class="d-stat">
									<div class="d-stat-num">99.9%</div>
									<div class="d-stat-label">Uptime</div>
								</div>
								<div class="d-stat">
									<div class="d-stat-num">24/7</div>
									<div class="d-stat-label">Support</div>
								</div>
							</div>
						</section>
						<section class="d-cta-banner">
							<h2 class="d-cta-title">Ready to get started?</h2>
							<p class="d-cta-sub">Join thousands of teams already using Acme.</p>
							<button class="d-btn d-btn-primary d-btn-lg">Start Free Trial</button>
						</section>
					{:else if demoIndex === 1}
						<!-- Dashboard -->
						<div class="dash">
							<aside class="dash-sidebar">
								<div class="d-logo" style="padding: 16px">App</div>
								<nav class="dash-nav">
									<a href="#d" class="dash-nav-item active"
										><span class="dash-nav-icon">&#9632;</span> Dashboard</a
									>
									<a href="#pr" class="dash-nav-item"
										><span class="dash-nav-icon">&#9776;</span> Projects</a
									>
									<a href="#t" class="dash-nav-item"
										><span class="dash-nav-icon">&#9745;</span> Tasks</a
									>
									<a href="#m" class="dash-nav-item"
										><span class="dash-nav-icon">&#9993;</span> Messages</a
									>
									<a href="#s" class="dash-nav-item"
										><span class="dash-nav-icon">&#9881;</span> Settings</a
									>
								</nav>
							</aside>
							<div class="dash-main">
								<header class="dash-topbar">
									<h1 class="dash-page-title">Dashboard</h1>
									<div class="dash-topbar-right">
										<button class="d-btn d-btn-outline" style="font-size:13px">&#9993; 3</button>
										<div
											class="d-avatar d-avatar-sm"
											style="background: var(--primary); color: var(--primary-fg)"
										>
											U
										</div>
									</div>
								</header>
								<div class="dash-content">
									<div class="d-cards-4">
										<div class="d-card dash-stat-card">
											<div class="d-card-text">Revenue</div>
											<div class="dash-stat-value">$12,480</div>
											<div class="dash-stat-change" style="color: var(--primary)">+12.5%</div>
										</div>
										<div class="d-card dash-stat-card">
											<div class="d-card-text">Users</div>
											<div class="dash-stat-value">1,845</div>
											<div class="dash-stat-change" style="color: var(--secondary)">+8.2%</div>
										</div>
										<div class="d-card dash-stat-card">
											<div class="d-card-text">Orders</div>
											<div class="dash-stat-value">284</div>
											<div class="dash-stat-change" style="color: var(--tertiary)">+23.1%</div>
										</div>
										<div class="d-card dash-stat-card">
											<div class="d-card-text">Conversion</div>
											<div class="dash-stat-value">3.2%</div>
											<div class="dash-stat-change" style="color: var(--accent)">+0.4%</div>
										</div>
									</div>
									<div class="d-cards-2" style="margin-top: 20px">
										<div class="d-card">
											<div class="dash-card-header">
												<h3 class="d-card-title">Recent Orders</h3>
												<a href="#v" class="dash-view-all">View all</a>
											</div>
											<table class="dash-table">
												<thead
													><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr
													></thead
												>
												<tbody>
													<tr
														><td>#1234</td><td>Alice Johnson</td><td>$120.00</td><td
															><span
																class="d-badge"
																style="background: var(--primary); color: var(--primary-fg)"
																>Active</span
															></td
														></tr
													>
													<tr
														><td>#1233</td><td>Bob Williams</td><td>$85.50</td><td
															><span
																class="d-badge"
																style="background: var(--secondary); color: var(--secondary-fg)"
																>Shipped</span
															></td
														></tr
													>
													<tr
														><td>#1232</td><td>Carol Davis</td><td>$210.00</td><td
															><span
																class="d-badge"
																style="background: var(--primary); color: var(--primary-fg)"
																>Active</span
															></td
														></tr
													>
													<tr
														><td>#1231</td><td>Dan Miller</td><td>$45.00</td><td
															><span class="d-badge d-badge-muted">Complete</span></td
														></tr
													>
												</tbody>
											</table>
										</div>
										<div class="d-card">
											<h3 class="d-card-title">Performance</h3>
											<div class="dash-chart">
												{#each [65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 70, 88] as val, i (i)}
													<div class="dash-bar-col">
														<div
															class="dash-bar"
															style="height: {val}%; background: var({i % 3 === 0
																? '--primary'
																: i % 3 === 1
																	? '--secondary'
																	: '--tertiary'})"
														></div>
														<span class="dash-bar-label"
															>{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][
																i
															]}</span
														>
													</div>
												{/each}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					{:else if demoIndex === 2}
						<!-- Blog -->
						<nav class="d-nav">
							<div class="d-nav-inner">
								<span class="d-logo">The Journal</span>
								<div class="d-nav-links">
									<a href="#h">Home</a><a href="#ca">Categories</a><a href="#ab">About</a>
								</div>
								<button class="d-btn d-btn-outline" style="font-size: 13px">Subscribe</button>
							</div>
						</nav>
						<div class="blog-layout">
							<article class="blog-article">
								<div class="blog-category" style="color: var(--primary)">Design</div>
								<h1 class="blog-title">The Art of Color Theory in Modern Interface Design</h1>
								<div class="blog-meta">
									<div
										class="d-avatar d-avatar-sm"
										style="background: var(--primary); color: var(--primary-fg)"
									>
										MK
									</div>
									<span>Maya Kim</span>
									<span style="color: var(--fg); opacity: var(--op-muted)"
										>&middot; Jan 15, 2025 &middot; 8 min read</span
									>
								</div>
								<div class="blog-hero-img" style="background: var(--primary); opacity: 0.15"></div>
								<div class="blog-body">
									<p>
										Color is one of the most powerful tools in a designer's arsenal. It guides
										attention, communicates meaning, and shapes the emotional experience of an
										interface.
									</p>
									<h2>Understanding OKLCH</h2>
									<p>
										The OKLCH color space provides perceptually uniform lightness, making it
										possible to create palettes where perceived contrast is consistent across hues.
									</p>
									<blockquote class="blog-quote">
										"Good color isn't about picking pretty hues. It's about building a system where
										every color has a purpose."
									</blockquote>
									<p>
										Start with your background and foreground. These two colors define the
										foundation of your visual hierarchy.
									</p>
									<div class="blog-callout">
										<div class="blog-callout-title">Key Takeaway</div>
										<p>
											Always test your color combinations in context. A color that looks great in
											isolation may fail when paired with your background.
										</p>
									</div>
								</div>
								<div class="blog-tags">
									<span class="d-badge" style="background: var(--primary); color: var(--primary-fg)"
										>Design</span
									>
									<span
										class="d-badge"
										style="background: var(--secondary); color: var(--secondary-fg)"
										>Color Theory</span
									>
									<span
										class="d-badge"
										style="background: var(--tertiary); color: var(--tertiary-fg)">UI</span
									>
									<span class="d-badge d-badge-muted">OKLCH</span>
								</div>
							</article>
							<aside class="blog-sidebar">
								<div class="d-card">
									<h3 class="d-card-title">Categories</h3>
									<div class="blog-cat-list">
										<a href="#d" class="blog-cat-item"
											><span>Design</span><span
												class="blog-cat-count"
												style="background: var(--primary); color: var(--primary-fg)">12</span
											></a
										>
										<a href="#e" class="blog-cat-item"
											><span>Engineering</span><span
												class="blog-cat-count"
												style="background: var(--secondary); color: var(--secondary-fg)">8</span
											></a
										>
										<a href="#p" class="blog-cat-item"
											><span>Product</span><span
												class="blog-cat-count"
												style="background: var(--tertiary); color: var(--tertiary-fg)">5</span
											></a
										>
									</div>
								</div>
							</aside>
						</div>
					{:else if demoIndex === 3}
						<BrandMark entries={simEntries} />
					{:else if demoIndex === 4}
						<StyleSheet entries={simEntries} />
					{:else if demoIndex === 5}
						<Collateral entries={simEntries} />
					{:else}
						<DataViz entries={simEntries} />
					{/if}
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.preview-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		background: var(--bg);
	}
	.pv-toolbar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 14px;
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.pv-spacer {
		flex: 1;
	}
	.pv-fails {
		padding: 2px 10px;
		border-radius: 99px;
		font-size: 11px;
		font-weight: 600;
		background: color-mix(in srgb, var(--ok) 16%, transparent);
		color: var(--ok);
	}
	.pv-fails.bad {
		background: color-mix(in srgb, var(--danger) 16%, transparent);
		color: var(--danger);
	}
	.pv-body {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.pv-panel {
		width: 220px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		padding: 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		overflow-y: auto;
		color: var(--text-muted);
	}
	.pv-section-title {
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-faint);
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}
	.role-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.role-swatch {
		width: 14px;
		height: 14px;
		border-radius: 3px;
		border: 1px solid var(--border-strong);
		flex-shrink: 0;
	}
	.role-label {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 11px;
	}
	.role-select {
		background: var(--surface-2);
		color: var(--text);
		border: 1px solid var(--border-strong);
		border-radius: 3px;
		padding: 2px 4px;
		font-size: 11px;
		width: 100%;
	}
	.opacity-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
	}
	.opacity-name {
		width: 52px;
		flex-shrink: 0;
	}
	.opacity-label input {
		flex: 1;
		min-width: 0;
		accent-color: var(--text-muted);
	}
	.opacity-value {
		font-family: monospace;
		font-size: 10px;
		color: var(--text-faint);
		width: 28px;
		text-align: right;
	}
	.audit-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.audit-row {
		padding: 3px 5px;
		border-radius: 3px;
		font-size: 10px;
	}
	.audit-fail {
		background: rgba(239, 68, 68, 0.1);
	}
	.audit-label {
		color: var(--text);
		font-weight: 600;
	}
	.audit-detail {
		color: var(--text-faint);
		font-size: 9px;
	}
	.audit-result {
		display: flex;
		gap: 6px;
		align-items: baseline;
	}
	.audit-ratio {
		font-family: monospace;
		color: var(--text-muted);
	}
	.audit-level {
		font-weight: 700;
	}
	.pv-empty {
		padding: 32px;
		color: var(--text-faint);
		font-size: 13px;
	}

	/* Demo surface */
	.demo-scroll {
		flex: 1;
		min-width: 0;
		overflow: auto;
	}
	.demo {
		background: var(--bg);
		color: var(--fg);
		min-height: 100%;
	}
	.d-nav {
		border-bottom: 1px solid var(--border);
	}
	.d-nav-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 12px 24px;
	}
	.d-logo {
		font-size: 18px;
		font-weight: 700;
		color: var(--fg);
	}
	.d-nav-links {
		display: flex;
		gap: 20px;
		margin-left: auto;
	}
	.d-nav-links a {
		color: var(--fg);
		opacity: var(--op-muted);
		text-decoration: none;
		font-size: 14px;
	}
	.d-btn {
		padding: 8px 18px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		border: none;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
	}
	.d-btn-primary {
		background: var(--primary);
		color: var(--primary-fg);
	}
	.d-btn-outline {
		background: none;
		color: var(--fg);
		border: 1px solid var(--border);
	}
	.d-btn-lg {
		padding: 12px 28px;
		font-size: 16px;
	}
	.d-hero {
		text-align: center;
		padding: 64px 24px;
		max-width: 720px;
		margin: 0 auto;
	}
	.d-hero-title {
		font-size: 44px;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.03em;
	}
	.d-hero-sub {
		margin-top: 16px;
		font-size: 18px;
		color: var(--fg);
		opacity: var(--op-muted);
		line-height: 1.6;
	}
	.d-hero-actions {
		margin-top: 32px;
		display: flex;
		gap: 12px;
		justify-content: center;
	}
	.d-section {
		max-width: 1100px;
		margin: 0 auto;
		padding: 48px 24px;
	}
	.d-section-title {
		font-size: 30px;
		font-weight: 700;
		text-align: center;
	}
	.d-section-sub {
		text-align: center;
		color: var(--fg);
		opacity: var(--op-muted);
		margin-top: 8px;
	}
	.d-cards-2,
	.d-cards-3,
	.d-cards-4 {
		display: grid;
		gap: 16px;
		margin-top: 28px;
	}
	.d-cards-2 {
		grid-template-columns: 1fr 1fr;
	}
	.d-cards-3 {
		grid-template-columns: 1fr 1fr 1fr;
	}
	.d-cards-4 {
		grid-template-columns: 1fr 1fr 1fr 1fr;
	}
	.d-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 18px;
	}
	.d-card-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		margin-bottom: 12px;
	}
	.d-card-title {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 6px;
	}
	.d-card-text {
		font-size: 14px;
		color: var(--fg);
		opacity: var(--op-muted);
		line-height: 1.5;
	}
	.d-stats-banner {
		background: var(--primary);
		color: var(--primary-fg);
		padding: 40px 24px;
	}
	.d-stats-grid {
		max-width: 800px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 24px;
		text-align: center;
	}
	.d-stat-num {
		font-size: 32px;
		font-weight: 800;
	}
	.d-stat-label {
		font-size: 14px;
		opacity: 0.8;
		margin-top: 4px;
	}
	.d-cta-banner {
		background: var(--secondary);
		color: var(--secondary-fg);
		text-align: center;
		padding: 52px 24px;
	}
	.d-cta-title {
		font-size: 30px;
		font-weight: 700;
	}
	.d-cta-sub {
		margin-top: 8px;
		font-size: 16px;
		opacity: 0.85;
	}
	.d-cta-banner .d-btn {
		margin-top: 24px;
	}
	.d-badge {
		display: inline-block;
		padding: 2px 10px;
		border-radius: 99px;
		font-size: 12px;
		font-weight: 600;
	}
	.d-badge-muted {
		background: var(--border);
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.d-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 14px;
		flex-shrink: 0;
	}
	.d-avatar-sm {
		width: 28px;
		height: 28px;
		font-size: 12px;
	}

	/* Dashboard */
	.dash {
		display: flex;
		min-height: 100%;
	}
	.dash-sidebar {
		width: 180px;
		background: var(--surface);
		border-right: 1px solid var(--border);
		flex-shrink: 0;
	}
	.dash-nav {
		display: flex;
		flex-direction: column;
		padding: 8px;
		gap: 2px;
	}
	.dash-nav-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-radius: 6px;
		color: var(--fg);
		opacity: var(--op-muted);
		text-decoration: none;
		font-size: 14px;
	}
	.dash-nav-item.active {
		color: var(--primary-fg);
		background: var(--primary);
		opacity: 1;
	}
	.dash-nav-icon {
		width: 18px;
		text-align: center;
	}
	.dash-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.dash-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 20px;
		border-bottom: 1px solid var(--border);
	}
	.dash-topbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.dash-page-title {
		font-size: 20px;
		font-weight: 600;
	}
	.dash-content {
		padding: 18px 20px;
	}
	.dash-stat-card {
		text-align: center;
	}
	.dash-stat-value {
		font-size: 26px;
		font-weight: 800;
		margin: 4px 0;
	}
	.dash-stat-change {
		font-size: 13px;
		font-weight: 600;
	}
	.dash-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}
	.dash-view-all {
		font-size: 13px;
		color: var(--primary);
		text-decoration: none;
	}
	.dash-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	.dash-table th {
		text-align: left;
		padding: 8px 10px;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--fg);
		opacity: var(--op-muted);
		border-bottom: 1px solid var(--border);
	}
	.dash-table td {
		padding: 9px 10px;
		border-bottom: 1px solid var(--border);
	}
	.dash-chart {
		display: flex;
		align-items: flex-end;
		gap: 6px;
		height: 140px;
		margin-top: 12px;
	}
	.dash-bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		justify-content: flex-end;
	}
	.dash-bar {
		width: 100%;
		border-radius: 4px 4px 0 0;
		min-height: 4px;
	}
	.dash-bar-label {
		font-size: 11px;
		color: var(--fg);
		opacity: var(--op-muted);
		margin-top: 6px;
	}

	/* Blog */
	.blog-layout {
		max-width: 1100px;
		margin: 0 auto;
		padding: 32px 24px;
		display: grid;
		grid-template-columns: 1fr 260px;
		gap: 28px;
	}
	.blog-category {
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.blog-title {
		font-size: 34px;
		font-weight: 800;
		line-height: 1.15;
		margin-top: 8px;
	}
	.blog-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 16px;
		font-size: 14px;
		flex-wrap: wrap;
	}
	.blog-hero-img {
		height: 200px;
		border-radius: 10px;
		margin-top: 24px;
	}
	.blog-body {
		margin-top: 28px;
		font-size: 16px;
		line-height: 1.75;
	}
	.blog-body h2 {
		font-size: 23px;
		font-weight: 700;
		margin: 28px 0 12px;
	}
	.blog-body p {
		margin-bottom: 16px;
	}
	.blog-quote {
		border-left: 3px solid var(--accent);
		padding: 12px 20px;
		margin: 24px 0;
		font-size: 18px;
		color: var(--fg);
		opacity: var(--op-muted);
		font-style: italic;
	}
	.blog-callout {
		background: var(--surface);
		border: 1px solid var(--border);
		border-left: 3px solid var(--primary);
		border-radius: 6px;
		padding: 16px 20px;
		margin: 24px 0;
	}
	.blog-callout-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--primary);
		margin-bottom: 6px;
	}
	.blog-callout p {
		margin: 0;
		font-size: 14px;
		color: var(--fg);
		opacity: var(--op-muted);
	}
	.blog-tags {
		display: flex;
		gap: 8px;
		margin-top: 28px;
		flex-wrap: wrap;
	}
	.blog-sidebar {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.blog-cat-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 8px;
	}
	.blog-cat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 6px 0;
		text-decoration: none;
		color: var(--fg);
		font-size: 14px;
		border-bottom: 1px solid var(--border);
	}
	.blog-cat-count {
		font-size: 11px;
		font-weight: 600;
		padding: 1px 8px;
		border-radius: 99px;
	}

	/* roles/audit panel content when hosted in the mobile sheet */
	.pv-panel-sheet {
		display: flex;
		flex-direction: column;
		gap: 6px;
		color: var(--text-muted);
	}

	/* ---- mobile (phone) layout: full-width demo, scrollable chrome,
	   single-column website mockups ---- */
	@media (max-width: 768px) {
		.pv-toolbar {
			flex-wrap: wrap;
			gap: 8px 10px;
			padding: 9px 12px;
		}
		.pv-toolbar .seg {
			flex-wrap: nowrap;
			overflow-x: auto;
			max-width: 100%;
			scrollbar-width: none;
		}
		.pv-toolbar .seg::-webkit-scrollbar {
			display: none;
		}
		.pv-toolbar .seg-item {
			flex: 0 0 auto;
			white-space: nowrap;
		}
		.pv-spacer {
			display: none;
		}

		.d-cards-2,
		.d-cards-3,
		.d-cards-4 {
			grid-template-columns: 1fr;
		}
		.d-stats-grid {
			grid-template-columns: 1fr 1fr;
			gap: 16px;
		}
		.d-nav-inner {
			gap: 12px;
			padding: 12px 16px;
			flex-wrap: wrap;
		}
		.d-nav-links {
			gap: 14px;
		}
		.d-hero {
			padding: 36px 18px;
		}
		.d-hero-title {
			font-size: 30px;
		}
		.d-hero-sub {
			font-size: 15px;
			margin-top: 12px;
		}
		.d-hero-actions {
			flex-direction: column;
		}
		.d-section {
			padding: 32px 16px;
		}
		.d-section-title {
			font-size: 24px;
		}
		.d-stats-banner,
		.d-cta-banner {
			padding: 32px 18px;
		}
		.d-cta-title {
			font-size: 24px;
		}

		.dash {
			flex-direction: column;
		}
		.dash-sidebar {
			width: 100%;
			border-right: none;
			border-bottom: 1px solid var(--border);
		}
		.dash-nav {
			flex-direction: row;
			flex-wrap: wrap;
		}
		.dash-nav-item {
			font-size: 13px;
			padding: 7px 10px;
		}
		.dash-content {
			padding: 14px;
		}
		.dash-table {
			font-size: 12.5px;
		}
		.dash-table th,
		.dash-table td {
			padding: 7px 6px;
		}

		.blog-layout {
			grid-template-columns: 1fr;
			gap: 20px;
			padding: 24px 16px;
		}
		.blog-title {
			font-size: 26px;
		}
		.blog-body {
			font-size: 15px;
		}
	}
</style>
