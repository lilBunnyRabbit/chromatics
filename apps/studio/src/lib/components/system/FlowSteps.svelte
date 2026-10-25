<script lang="ts">
	/**
	 * The left rail of the Design System flow: an ordered, clickable list of steps
	 * with a derived completeness state. Pure presentation — the step model and
	 * status come from `scheme/flow.ts`; selecting a step is the parent's concern.
	 */
	import type { FlowStep, FlowStepId } from '$lib/scheme/flow';

	interface Props {
		steps: FlowStep[];
		active: FlowStepId;
		doneCount: number;
		totalCount: number;
		onselect: (id: FlowStepId) => void;
	}

	let { steps, active, doneCount, totalCount, onselect }: Props = $props();
</script>

<nav class="flow" aria-label="Design system steps">
	<div class="flow-head">
		<span class="flow-title">Design System</span>
		<span class="flow-progress">{doneCount}/{totalCount}</span>
	</div>
	<ol class="flow-list">
		{#each steps as step, i (step.id)}
			<li>
				<button
					class="step"
					class:active={step.id === active}
					class:done={step.status === 'done'}
					class:soon={step.status === 'soon'}
					onclick={() => onselect(step.id)}
				>
					<span class="step-dot" aria-hidden="true">
						{#if step.status === 'done'}✓{:else if step.status === 'soon'}·{:else}{i + 1}{/if}
					</span>
					<span class="step-text">
						<span class="step-name">
							{step.title}
							{#if step.status === 'soon'}<span class="step-tag">soon</span>{/if}
						</span>
						<span class="step-blurb">{step.blurb}</span>
					</span>
				</button>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.flow {
		width: 240px;
		flex-shrink: 0;
		border-right: 1px solid var(--border);
		padding: 12px 10px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow-y: auto;
	}
	.flow-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		padding: 0 6px;
	}
	.flow-title {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
	}
	.flow-progress {
		font-size: 11px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}
	.flow-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.step {
		width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 9px 8px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		text-align: left;
		cursor: pointer;
		color: var(--text-muted);
		transition: background 0.12s;
	}
	.step:hover {
		background: var(--surface-2);
	}
	.step.active {
		background: var(--surface-2);
		border-color: var(--border-strong);
	}
	.step.soon {
		opacity: 0.6;
	}
	.step-dot {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 11px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		background: var(--surface-2);
		border: 1px solid var(--border-strong);
		color: var(--text-faint);
	}
	.step.active .step-dot {
		border-color: var(--accent);
		color: var(--accent);
	}
	.step.done .step-dot {
		background: color-mix(in srgb, var(--ok) 18%, transparent);
		border-color: var(--ok);
		color: var(--ok);
	}
	.step-text {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.step-name {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
	}
	.step-tag {
		font-size: 8.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--accent);
		background: color-mix(in srgb, var(--accent) 14%, transparent);
		padding: 0 4px;
		border-radius: 3px;
	}
	.step-blurb {
		font-size: 11px;
		line-height: 1.4;
		color: var(--text-faint);
	}

	@media (max-width: 768px) {
		.flow {
			width: 100%;
			border-right: none;
			border-bottom: 1px solid var(--border);
			padding: 10px;
		}
		.flow-list {
			flex-direction: row;
			overflow-x: auto;
			gap: 6px;
		}
		.step {
			flex-direction: column;
			align-items: flex-start;
			min-width: 140px;
			gap: 6px;
		}
		.step-blurb {
			display: none;
		}
	}
</style>
