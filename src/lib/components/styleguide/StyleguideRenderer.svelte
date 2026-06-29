<script lang="ts">
	/**
	 * Generic renderer for a single component spec. A small {#if} ladder per kind,
	 * each building inline styles from the shared resolver — so what renders here,
	 * what exports, and what gets audited can never disagree. Button states are
	 * painted as static snapshots (no real :hover), so every state is visible and
	 * screenshot-friendly at once.
	 */
	import { resolveRef, type ResolveCtx } from '$lib/render/resolve';
	import type {
		ComponentSpec,
		ButtonSpec,
		ButtonVariant,
		ButtonSize,
		CardSpec,
		TypeStep
	} from '$lib/scheme/components';

	let { name, spec, ctx }: { name: string; spec: ComponentSpec; ctx: ResolveCtx } = $props();

	const css = (ref: string | undefined, fallback = 'transparent') =>
		ref ? resolveRef(ref, ctx).css : fallback;

	function btnStyle(v: ButtonVariant, s: ButtonSize, state = 'default'): string {
		const bg = css(v.bg);
		const fg = css(v.fg);
		const parts = [
			`background:${bg}`,
			`color:${fg}`,
			`border:1px solid ${v.border ? css(v.border) : 'transparent'}`,
			`padding:${css(s.padY, 'var(--space-2)')} ${css(s.padX, 'var(--space-4)')}`,
			`border-radius:${s.radius ? css(s.radius) : 'var(--radius-md)'}`,
			`font-size:${css(s.text, 'var(--text-base)')}`,
			`font-weight:${s.weight ? css(s.weight) : 'var(--weight-semibold)'}`,
			`font-family:var(--font-sans)`
		];
		if (state === 'disabled') parts.push('opacity:var(--op-disabled)', 'cursor:not-allowed');
		if (state === 'hover') parts.push(`background:color-mix(in srgb, ${bg} 90%, ${fg})`);
		if (state === 'active') parts.push(`background:color-mix(in srgb, ${bg} 82%, ${fg})`);
		return parts.join(';');
	}

	function cardStyle(c: CardSpec): string {
		return [
			`background:${css(c.bg, 'var(--surface)')}`,
			`color:${css(c.fg, 'var(--fg)')}`,
			`border:1px solid ${c.border ? css(c.border) : 'var(--border)'}`,
			`border-radius:${css(c.radius, 'var(--radius-lg)')}`,
			`padding:${css(c.pad, 'var(--space-6)')}`,
			`box-shadow:${c.shadow ? css(c.shadow) : 'none'}`
		].join(';');
	}

	function typeStyle(step: TypeStep): string {
		return [
			`font-size:${css(step.text, 'var(--text-base)')}`,
			`font-weight:${step.weight ? css(step.weight) : 'var(--weight-regular)'}`,
			`line-height:${step.leading ? css(step.leading) : 'var(--leading-tight)'}`,
			`color:var(--fg)`
		].join(';');
	}

	function collectRefs(s: ComponentSpec): string[] {
		if (s.__component === 'button')
			return [
				...s.variants.flatMap((v) => [v.bg, v.fg, v.border]),
				...s.sizes.flatMap((z) => [z.padY, z.padX, z.text, z.radius, z.weight])
			].filter((x): x is string => !!x);
		if (s.__component === 'card')
			return [s.bg, s.fg, s.border, s.radius, s.pad, s.shadow].filter((x): x is string => !!x);
		return s.steps
			.flatMap((st) => [st.text, st.weight, st.leading])
			.filter((x): x is string => !!x);
	}

	const bad = $derived([
		...new Set(collectRefs(spec).filter((x) => resolveRef(x, ctx).kind === 'unresolved'))
	]);
	const states = $derived(spec.__component === 'button' ? (spec as ButtonSpec).states : []);
</script>

<section class="sg-comp">
	<header class="sg-comp-head">
		<span class="sg-comp-name">{name}</span>
		<span class="sg-comp-kind">component.{spec.__component}</span>
		{#if bad.length}<span class="sg-comp-bad" title="Unresolved references">⚠ {bad.join(', ')}</span
			>{/if}
	</header>

	<div class="sg-comp-body">
		{#if spec.__component === 'button'}
			<div class="sg-variants">
				{#each spec.variants as v (v.name)}
					<div class="sg-var-row">
						<span class="sg-var-label">{v.name}</span>
						<div class="sg-btn-row">
							{#each spec.sizes as s (s.name)}
								<button class="sg-btn" style={btnStyle(v, s)} type="button">Button</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			{#if states.length > 1 || (states.length === 1 && states[0] !== 'default')}
				<div class="sg-states">
					<span class="sg-var-label">states</span>
					<div class="sg-btn-row">
						{#each states as st (st)}
							<button
								class="sg-btn"
								style={btnStyle(spec.variants[0], spec.sizes[spec.sizes.length - 1], st)}
								type="button">{st}</button
							>
						{/each}
					</div>
				</div>
			{/if}
		{:else if spec.__component === 'card'}
			<div class="sg-card-wrap">
				<article class="sg-card" style={cardStyle(spec)}>
					<div class="sg-card-title">{spec.title ?? name}</div>
					<p class="sg-card-text">The quick brown fox jumps over the lazy dog.</p>
					<div class="sg-card-foot"><span class="sg-card-link">Learn more →</span></div>
				</article>
			</div>
		{:else if spec.__component === 'type'}
			<div class="sg-type">
				{#each spec.steps as step, i (i)}
					<div class="sg-type-row" style={typeStyle(step)}>
						{step.sample ?? 'The quick brown fox jumps over the lazy dog'}
					</div>
				{/each}
			</div>
		{:else}
			<div class="sg-unsupported">Unsupported component</div>
		{/if}
	</div>
</section>

<style>
	.sg-comp {
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--bg);
		color: var(--fg);
	}
	.sg-comp-head {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
		color: var(--surface-fg);
	}
	.sg-comp-name {
		font-size: 13px;
		font-weight: 700;
	}
	.sg-comp-kind {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 11px;
		opacity: var(--op-muted);
	}
	.sg-comp-bad {
		margin-left: auto;
		font-size: 11px;
		font-weight: 600;
		color: #e0564f;
	}
	.sg-comp-body {
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.sg-variants,
	.sg-states {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.sg-states {
		border-top: 1px solid var(--border);
		padding-top: 14px;
	}
	.sg-var-row,
	.sg-states {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
	}
	.sg-var-label {
		width: 84px;
		flex-shrink: 0;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: var(--op-muted);
	}
	.sg-btn-row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.sg-btn {
		cursor: pointer;
		line-height: 1.1;
		white-space: nowrap;
	}

	.sg-card-wrap {
		max-width: 340px;
	}
	.sg-card {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.sg-card-title {
		font-size: var(--text-lg);
		font-weight: var(--weight-bold);
	}
	.sg-card-text {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-normal);
		opacity: var(--op-muted);
	}
	.sg-card-foot {
		margin-top: 2px;
	}
	.sg-card-link {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--primary);
	}

	.sg-type {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.sg-type-row {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sg-unsupported {
		font-size: 12px;
		opacity: var(--op-muted);
	}
</style>
