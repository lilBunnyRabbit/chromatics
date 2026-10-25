/**
 * DSL emission — the bridge that lets visual tools write code back into the
 * editor instead of forking into hidden GUI state. Every generator (harmony,
 * ramp, gradient, auto-fix, eyedropper…) produces DSL statements through here,
 * so the editor stays the single source of truth.
 */
import { type Color, Oklch, Srgb, Srgb8 } from '@lilbunnyrabbit/chromatics';

export function round(n: number, d = 4): number {
	const f = 10 ** d;
	return Math.round(n * f) / f;
}

/** Oklch constructor literal — the canonical, gamut-independent form. */
export function oklchLiteral(c: Color): string {
	const { l, c: ch, h } = c.to(Oklch);
	return `Oklch(${round(l, 4)}, ${round(ch, 4)}, ${round(h, 2)})`;
}

/** A DSL expression reconstructing this color: a hex when it's in sRGB, else Oklch. */
export function colorLiteral(c: Color): string {
	return c.to(Srgb).inGamut()
		? `parse("${c.to(Srgb).gamutMap().to(Srgb8).toHex()}")`
		: oklchLiteral(c);
}

function sanitize(name: string): string {
	const s = name
		.trim()
		.replace(/[^a-zA-Z0-9_]+/g, '_')
		.replace(/^_+|_+$/g, '')
		.replace(/^([0-9])/, '_$1');
	return s || 'color';
}

/** A valid identifier not already present in `taken` (appends _2, _3, …). */
export function uniqueName(base: string, taken: Iterable<string>): string {
	const set = new Set(taken);
	const name = sanitize(base);
	if (!set.has(name)) return name;
	let i = 2;
	while (set.has(`${name}_${i}`)) i++;
	return `${name}_${i}`;
}

/**
 * Append a block of statements to existing source, separated by a blank line.
 * An optional comment is emitted as a leading `// …` line.
 */
export function appendStatements(source: string, lines: string[], comment?: string): string {
	const block = (comment ? [`// ${comment}`, ...lines] : lines).join('\n');
	const base = source.replace(/\s+$/, '');
	return base.length ? `${base}\n\n${block}\n` : `${block}\n`;
}
