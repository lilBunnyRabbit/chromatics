/**
 * Format a color in its OWN model — e.g. "hsl(155 0.5 0.55)", "lab(53 80 67)".
 * Shared by the Inspector (own-model readout) and the editor hover tooltip so
 * both show a color the way it was authored, not always OKLCH. A color authored
 * as a hex literal (`model === 'hex'`) and channel-less/unbacked models fall
 * back to the hex string.
 */
import { getModel, getModelByMode } from './registry';
import type { ColorValue } from './value';

const rNum = (v: number) => String(Math.round(v * 1000) / 1000);

export function formatOwnModel(c: ColorValue, model: string = c.model): string {
	if (model === 'hex') return c.hex;
	const def = getModel(c.model) ?? getModelByMode(c.model);
	if (!def || !def.channels.length) return c.hex;
	const proj = c.project(def.mode) as unknown as Record<string, number | undefined>;
	const vals = def.channels.map((ch) => rNum((proj[ch.culoriField] ?? 0) * (ch.scale ?? 1)));
	return `${def.id}(${vals.join(' ')})`;
}
