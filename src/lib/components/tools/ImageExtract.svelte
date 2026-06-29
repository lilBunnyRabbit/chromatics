<script lang="ts">
	import { hex } from '$lib/models';
	import { quantize, rgbToHex } from '$lib/analysis/quantize';
	import { nearestName } from '$lib/color-names';
	import { uniqueName } from '$lib/dsl/emit';
	import { takenNames, insert } from './shared';

	let count = $state(6);
	let colors = $state<{ hex: string; name: string }[]>([]);
	let fileName = $state('');
	let error = $state('');
	let lastData: Uint8ClampedArray | null = null;

	function extract() {
		if (!lastData) return;
		const rgb = quantize(lastData, count);
		colors = rgb.map((c) => {
			const h = rgbToHex(c);
			return { hex: h, name: nearestName(hex(h)).name };
		});
	}

	function onFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		error = '';
		fileName = file.name;
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, 160 / Math.max(img.width, img.height));
			const w = Math.max(1, Math.round(img.width * scale));
			const h = Math.max(1, Math.round(img.height * scale));
			const cv = document.createElement('canvas');
			cv.width = w;
			cv.height = h;
			const ctx = cv.getContext('2d');
			if (!ctx) {
				error = 'Canvas unavailable.';
				URL.revokeObjectURL(url);
				return;
			}
			ctx.drawImage(img, 0, 0, w, h);
			lastData = ctx.getImageData(0, 0, w, h).data;
			extract();
			URL.revokeObjectURL(url);
		};
		img.onerror = () => {
			error = 'Could not load that image.';
			URL.revokeObjectURL(url);
		};
		img.src = url;
	}

	function apply() {
		if (!colors.length) return;
		const taken = new Set(takenNames());
		const lines = colors.map((c) => {
			const name = uniqueName(c.name, taken);
			taken.add(name);
			return `${name} = hex("${c.hex}")`;
		});
		insert(lines, `Extracted from ${fileName || 'image'}`);
	}
</script>

<div class="tool">
	<div class="controls">
		<label class="btn file-btn">
			Choose image…
			<input type="file" accept="image/*" onchange={onFile} hidden />
		</label>
		<label class="field">
			<span>Colors · {count}</span>
			<input type="range" min="2" max="8" bind:value={count} onchange={extract} />
		</label>
		<button class="btn btn-accent" onclick={apply} disabled={!colors.length}>
			Insert {colors.length || ''} color{colors.length === 1 ? '' : 's'}
		</button>
	</div>

	{#if error}
		<p class="err">{error}</p>
	{/if}

	{#if colors.length}
		<div class="grid">
			{#each colors as c (c.hex)}
				<div class="cell">
					<span class="block" style="background:{c.hex}"></span>
					<span class="hx">{c.hex}</span>
					<span class="nm">{c.name}</span>
				</div>
			{/each}
		</div>
		<p class="hint">
			Dominant colors by median-cut, sorted by coverage. Names are the nearest CSS color.
		</p>
	{:else}
		<p class="hint">
			Upload a logo or photo to pull a starter palette. Transparent pixels are ignored.
		</p>
	{/if}
</div>

<style>
	.tool {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.controls {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		flex-wrap: wrap;
	}
	.file-btn {
		cursor: pointer;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 11px;
		color: var(--text-muted);
	}
	.field input[type='range'] {
		width: 120px;
		accent-color: var(--accent);
	}
	.btn-accent {
		margin-left: auto;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: 10px;
	}
	.cell {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.block {
		width: 100%;
		height: 64px;
		border-radius: 8px;
		border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
	}
	.hx {
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 11px;
		color: var(--text-muted);
	}
	.nm {
		font-size: 11px;
		color: var(--text-faint);
	}
	.hint {
		font-size: 12px;
		color: var(--text-faint);
	}
	.err {
		font-size: 12px;
		color: var(--danger);
	}

	@media (max-width: 420px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
		}
	}
</style>
