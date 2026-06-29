<script lang="ts">
	import type { SchemeEntry } from '$lib/scheme/types';

	let { entries }: { entries: SchemeEntry[] } = $props();

	// --- Brand color derivation ---------------------------------------------
	// Prefer an entry literally named 'primary' or 'brand', else the first
	// entry, else fall back to the chrome custom property.
	const primaryEntry = $derived(
		entries.find((e) => /^(primary|brand)$/i.test(e.name)) ?? entries[0]
	);
	const secondaryEntry = $derived(entries.find((e) => e !== primaryEntry) ?? entries[1]);

	const primary = $derived(primaryEntry ? primaryEntry.color.toCSS() : 'var(--primary)');
	const secondary = $derived(secondaryEntry ? secondaryEntry.color.toCSS() : 'var(--secondary)');

	// Pick a readable foreground for the primary fill by inspecting OKLCH
	// lightness (0–1). Light brand → dark glyph, dark brand → white glyph.
	function pickFg(entry: SchemeEntry | undefined): string {
		if (!entry) return 'var(--primary-fg)';
		try {
			const l = entry.color.channel('ok_l');
			return l > 0.62 ? '#111418' : '#ffffff';
		} catch {
			return '#ffffff';
		}
	}
	const primaryFg = $derived(pickFg(primaryEntry));

	// A rotating set of brand accents for the social dots — cycle entries,
	// padding with the derived primary/secondary so we always have ≥4.
	const accents = $derived.by(() => {
		const list = entries.map((e) => e.color.toCSS());
		while (list.length < 4) list.push(list.length % 2 ? secondary : primary);
		return list;
	});

	// --- Placeholder identity ------------------------------------------------
	const brand = 'Acme';
	const person = 'Jordan Reyes';
	const title = 'Product Designer';
	const email = 'hello@acme.com';
	const site = 'acme.com';

	const initials = person
		.split(/\s+/)
		.map((p) => p[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
</script>

<!--
	The inline glyph mark — overlapping rounded shapes — is repeated across
	every mockup. `fill` is passed in so it adapts to its background.
-->
{#snippet glyph(fill: string, size: number)}
	<svg
		class="glyph"
		width={size}
		height={size}
		viewBox="0 0 32 32"
		role="img"
		aria-label="{brand} mark"
	>
		<rect x="3" y="3" width="19" height="19" rx="6" {fill} opacity="0.95" />
		<circle cx="22" cy="22" r="8" {fill} opacity="0.55" />
	</svg>
{/snippet}

<div class="collateral-root">
	<!-- 1. Business card ---------------------------------------------------- -->
	<figure class="stage">
		<figcaption class="cap">Business card</figcaption>
		<div class="card-stage">
			<div class="bizcard" style="--p:{primary};--s:{secondary}">
				<div class="bizcard-accent"></div>
				<div class="bizcard-top">
					{@render glyph(primary, 26)}
					<span class="bizcard-brand">{brand}</span>
				</div>
				<div class="bizcard-bottom">
					<div class="bizcard-name">{person}</div>
					<div class="bizcard-title">{title}</div>
				</div>
			</div>
		</div>
	</figure>

	<!-- 2. Social avatar ---------------------------------------------------- -->
	<figure class="stage">
		<figcaption class="cap">Social avatar</figcaption>
		<div class="avatar-row">
			<div class="avatar avatar-square" style="background:{primary}">
				{@render glyph(primaryFg, 44)}
			</div>
			<div class="avatar avatar-circle" style="background:{primary}">
				{@render glyph(primaryFg, 44)}
			</div>
		</div>
	</figure>

	<!-- 3. App icon --------------------------------------------------------- -->
	<figure class="stage">
		<figcaption class="cap">App icon</figcaption>
		<div class="icon-stage">
			<div class="appicon" style="background:linear-gradient(135deg, {primary}, {secondary})">
				<div class="appicon-highlight"></div>
				{@render glyph(primaryFg, 48)}
			</div>
		</div>
	</figure>

	<!-- 4. Email signature -------------------------------------------------- -->
	<figure class="stage">
		<figcaption class="cap">Email signature</figcaption>
		<div class="sig">
			<div class="sig-avatar" style="background:{primary};color:{primaryFg}">{initials}</div>
			<div class="sig-body">
				<div class="sig-name">{person}</div>
				<div class="sig-title">{title}</div>
				<div class="sig-divider" style="background:{primary}"></div>
				<div class="sig-company">{brand}</div>
				<div class="sig-contact">{email} &nbsp;&middot;&nbsp; {site}</div>
				<div class="sig-dots">
					{#each accents.slice(0, 4) as c, i (i)}
						<span class="sig-dot" style="background:{c}"></span>
					{/each}
				</div>
			</div>
		</div>
	</figure>

	<!-- 5. Social banner / post --------------------------------------------- -->
	<figure class="stage stage-wide">
		<figcaption class="cap">Social banner</figcaption>
		<div class="banner" style="background:linear-gradient(120deg, {primary}, {secondary})">
			<div class="banner-tag">
				{@render glyph('#ffffff', 18)}
				<span>{brand}</span>
			</div>
			<div class="banner-headline">Design that ships.</div>
			<div class="banner-meta">{site}</div>
		</div>
	</figure>
</div>

<style>
	.collateral-root {
		width: 100%;
		padding: 28px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 22px;
		align-content: start;
		font-family:
			system-ui,
			-apple-system,
			'Segoe UI',
			Roboto,
			sans-serif;
		color: var(--surface-fg);
		box-sizing: border-box;
	}

	.stage {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.stage-wide {
		grid-column: 1 / -1;
	}
	@media (min-width: 720px) {
		.stage-wide {
			grid-column: span 2;
		}
	}

	.cap {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--fg);
		opacity: var(--op-muted);
	}

	.glyph {
		display: block;
		flex-shrink: 0;
	}

	/* Shared neutral mockup stage */
	.card-stage,
	.icon-stage {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 1. Business card ---------------------------------------------------- */
	.bizcard {
		position: relative;
		width: 100%;
		max-width: 280px;
		aspect-ratio: 3.5 / 2;
		background: var(--bg);
		color: var(--fg);
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		padding: 16px 18px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
	}
	.bizcard-accent {
		position: absolute;
		top: 0;
		right: 0;
		width: 42%;
		height: 8px;
		background: linear-gradient(90deg, var(--p), var(--s));
	}
	.bizcard-top {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.bizcard-brand {
		font-size: 17px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.bizcard-name {
		font-size: 14px;
		font-weight: 600;
	}
	.bizcard-title {
		font-size: 11px;
		opacity: var(--op-muted);
		margin-top: 2px;
	}

	/* 2. Social avatar ---------------------------------------------------- */
	.avatar-row {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 22px;
	}
	.avatar {
		width: 88px;
		height: 88px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
	}
	.avatar-square {
		border-radius: 22%;
	}
	.avatar-circle {
		border-radius: 50%;
	}

	/* 3. App icon --------------------------------------------------------- */
	.appicon {
		position: relative;
		width: 88px;
		height: 88px;
		border-radius: 22%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		overflow: hidden;
	}
	.appicon-highlight {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 55%);
		pointer-events: none;
	}
	.appicon .glyph {
		position: relative;
		z-index: 1;
	}

	/* 4. Email signature -------------------------------------------------- */
	.sig {
		background: var(--bg);
		color: var(--fg);
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		padding: 18px 20px;
		display: flex;
		gap: 16px;
		align-items: flex-start;
	}
	.sig-avatar {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 18px;
		flex-shrink: 0;
	}
	.sig-body {
		min-width: 0;
	}
	.sig-name {
		font-size: 15px;
		font-weight: 700;
	}
	.sig-title {
		font-size: 12px;
		opacity: var(--op-muted);
		margin-top: 1px;
	}
	.sig-divider {
		height: 2px;
		width: 100%;
		max-width: 160px;
		border-radius: 2px;
		margin: 10px 0;
	}
	.sig-company {
		font-size: 13px;
		font-weight: 600;
	}
	.sig-contact {
		font-size: 11px;
		opacity: var(--op-muted);
		margin-top: 2px;
	}
	.sig-dots {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}
	.sig-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* 5. Social banner / post --------------------------------------------- */
	.banner {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 1;
		border-radius: 14px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		padding: 24px 26px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		color: #ffffff;
		overflow: hidden;
	}
	.banner-tag {
		position: absolute;
		top: 20px;
		left: 26px;
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: -0.01em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
	}
	.banner-headline {
		font-size: 30px;
		font-weight: 800;
		line-height: 1.05;
		letter-spacing: -0.025em;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
	}
	.banner-meta {
		font-size: 12px;
		font-weight: 600;
		opacity: 0.92;
		margin-top: 8px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
	}

	/* Small-screen polish: tighten padding and let cards pack at a lower floor */
	@media (max-width: 600px) {
		.collateral-root {
			padding: 14px;
			grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		}
	}
</style>
