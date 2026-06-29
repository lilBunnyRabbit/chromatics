/**
 * Styleguide exporters — ship the whole design system, not just colors. Both
 * read a normalized `{ scheme, tokens, roles, opacities, components }` and resolve
 * every ref through the SAME resolver the renderer uses (`render/resolve`), so the
 * exported CSS is pixel-identical to the live preview.
 *
 *  - toStyleguideCss   → :root vars (colors + roles + tokens) + utility classes
 *  - toStyleguideHtml  → a self-contained .html styleguide page (the deliverable)
 */
import type { Scheme } from '../scheme/types.js';
import type { Roles, Opacities } from '../scheme/roles.js';
import { cssVars } from '../scheme/roles.js';
import type { StyleTokens } from '../scheme/tokens.js';
import { buildTokenVars } from '../scheme/tokens.js';
import type { NamedComponent, ButtonSpec, CardSpec, TypeSpec } from '../scheme/components.js';
import { resolveRef, type ResolveCtx } from '../render/resolve.js';
import { kebab } from './index.js';

export interface StyleguideInput {
	scheme: Scheme;
	tokens: StyleTokens;
	roles: Roles;
	opacities: Opacities;
	components: NamedComponent[];
}

const css = (ref: string | undefined, ctx: ResolveCtx, fallback = 'transparent') =>
	ref ? resolveRef(ref, ctx).css : fallback;

function declList(decls: string): string[] {
	return decls
		.split(';')
		.map((d) => d.trim())
		.filter(Boolean)
		.map((d) => `  ${d};`);
}

function rootBlock(input: StyleguideInput): string {
	const { scheme, tokens, roles, opacities } = input;
	const lines = [
		...declList(cssVars(scheme, roles, opacities)),
		...scheme.entries.map((e) => `  --color-${kebab(e.name)}: ${e.color.toCSS()};`),
		...declList(buildTokenVars(tokens))
	];
	return `:root {\n${lines.join('\n')}\n}`;
}

function buttonCss(name: string, spec: ButtonSpec, ctx: ResolveCtx): string {
	const base = kebab(name);
	const blocks: string[] = [
		`.${base} {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border: 1px solid transparent;\n  cursor: pointer;\n  font-family: var(--font-sans);\n  line-height: 1.1;\n}`
	];
	for (const s of spec.sizes) {
		blocks.push(
			`.${base}--${kebab(s.name)} {\n  padding: ${css(s.padY, ctx, 'var(--space-2)')} ${css(s.padX, ctx, 'var(--space-4)')};\n  border-radius: ${s.radius ? css(s.radius, ctx) : 'var(--radius-md)'};\n  font-size: ${css(s.text, ctx, 'var(--text-base)')};\n  font-weight: ${s.weight ? css(s.weight, ctx) : 'var(--weight-semibold)'};\n}`
		);
	}
	for (const v of spec.variants) {
		const border = v.border ? `\n  border-color: ${css(v.border, ctx)};` : '';
		blocks.push(
			`.${base}--${kebab(v.name)} {\n  background: ${css(v.bg, ctx)};\n  color: ${css(v.fg, ctx)};${border}\n}`
		);
	}
	if (spec.states.includes('disabled')) {
		blocks.push(`.${base}:disabled {\n  opacity: var(--op-disabled);\n  cursor: not-allowed;\n}`);
	}
	return blocks.join('\n');
}

function cardCss(name: string, spec: CardSpec, ctx: ResolveCtx): string {
	return `.${kebab(name)} {\n  background: ${css(spec.bg, ctx, 'var(--surface)')};\n  color: ${css(spec.fg, ctx, 'var(--fg)')};\n  border: 1px solid ${spec.border ? css(spec.border, ctx) : 'var(--border)'};\n  border-radius: ${css(spec.radius, ctx, 'var(--radius-lg)')};\n  padding: ${css(spec.pad, ctx, 'var(--space-6)')};\n  box-shadow: ${spec.shadow ? css(spec.shadow, ctx) : 'none'};\n}`;
}

function typeCss(name: string, spec: TypeSpec, ctx: ResolveCtx): string {
	return spec.steps
		.map(
			(step, i) =>
				`.${kebab(name)}-${i + 1} {\n  font-size: ${css(step.text, ctx, 'var(--text-base)')};\n  font-weight: ${step.weight ? css(step.weight, ctx) : 'var(--weight-regular)'};\n  line-height: ${step.leading ? css(step.leading, ctx) : 'var(--leading-tight)'};\n}`
		)
		.join('\n');
}

function componentCss(c: NamedComponent, ctx: ResolveCtx): string {
	if (c.spec.__component === 'button') return buttonCss(c.name, c.spec, ctx);
	if (c.spec.__component === 'card') return cardCss(c.name, c.spec, ctx);
	return typeCss(c.name, c.spec, ctx);
}

/** :root custom properties (colors + roles + tokens) + component utility classes. */
export function toStyleguideCss(input: StyleguideInput): string {
	const ctx: ResolveCtx = { tokens: input.tokens, scheme: input.scheme, roles: input.roles };
	const root = rootBlock(input);
	const classes = input.components.map((c) => componentCss(c, ctx)).join('\n\n');
	return classes ? `${root}\n\n${classes}\n` : `${root}\n`;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function componentHtml(c: NamedComponent): string {
	const base = kebab(c.name);
	if (c.spec.__component === 'button') {
		const spec = c.spec;
		const rows = spec.variants
			.map((v) => {
				const btns = spec.sizes
					.map(
						(s) =>
							`<button class="${base} ${base}--${kebab(v.name)} ${base}--${kebab(s.name)}">Button</button>`
					)
					.join('\n        ');
				return `      <div class="sg-row"><span class="sg-key">${esc(v.name)}</span>\n        ${btns}\n      </div>`;
			})
			.join('\n');
		return `    <div class="sg-comp"><h3>${esc(c.name)}</h3>\n${rows}\n    </div>`;
	}
	if (c.spec.__component === 'card') {
		return `    <div class="sg-comp"><h3>${esc(c.name)}</h3>\n      <div class="${base}" style="max-width:340px">\n        <div style="font-size:var(--text-lg);font-weight:var(--weight-bold)">${esc(c.spec.title ?? c.name)}</div>\n        <p style="opacity:var(--op-muted);font-size:var(--text-sm)">The quick brown fox jumps over the lazy dog.</p>\n      </div>\n    </div>`;
	}
	const steps = c.spec.steps
		.map(
			(s, i) =>
				`      <div class="${base}-${i + 1}">${esc(s.sample ?? 'The quick brown fox jumps over the lazy dog')}</div>`
		)
		.join('\n');
	return `    <div class="sg-comp"><h3>${esc(c.name)}</h3>\n${steps}\n    </div>`;
}

/** A self-contained styleguide page — hand it to a client; hosts anywhere. */
export function toStyleguideHtml(input: StyleguideInput): string {
	const sheet = toStyleguideCss(input);
	const body = input.components.length
		? input.components.map(componentHtml).join('\n')
		: '    <p style="opacity:var(--op-muted)">No components defined.</p>';
	const page = `    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font-sans);padding:40px;display:flex;flex-direction:column;gap:32px}
    h1{font-size:var(--text-3xl);margin:0}
    h2{font-size:var(--text-xl);margin:32px 0 0;border-bottom:1px solid var(--border);padding-bottom:8px}
    h3{font-size:var(--text-base);margin:0 0 12px;opacity:.7}
    .sg-comp{border:1px solid var(--border);border-radius:12px;padding:20px;background:var(--surface);color:var(--surface-fg)}
    .sg-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
    .sg-key{width:90px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.6}`;
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Design System</title>
<style>
${sheet}
${page}
</style>
</head>
<body>
  <h1>Design System</h1>
  <h2>Components</h2>
${body}
</body>
</html>
`;
}
