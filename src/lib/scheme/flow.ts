/**
 * The "Design System" guided flow — a pure view-model over the derived scheme
 * (CD-13 P0). It does NOT introduce a new pipeline: step completeness is a pure
 * function of what's already authored in the DSL, and each unfinished step's
 * one-click Scaffold emits real DSL statements (through the normal append path)
 * that the editor re-evaluates like any other edit.
 *
 * Light/Dark is present as a `soon` step (CD-13 P1) so the flow shows the full
 * shape while the role-rebinding machinery lands next.
 */
import type { Scheme } from './types.js';
import { autoAssign, ROLE_KEYS, type Roles } from './roles.js';
import { uniqueName } from '../dsl/emit.js';

export type FlowStepId = 'roles' | 'modes' | 'components' | 'tokens' | 'handoff';

/** `done` = authored & resolving · `todo` = actionable now · `soon` = P1, locked. */
export type FlowStatus = 'done' | 'todo' | 'soon';

export interface FlowStep {
	id: FlowStepId;
	title: string;
	/** One-line description shown under the step title. */
	blurb: string;
	status: FlowStatus;
}

export interface FlowInput {
	/** bg + fg + primary all resolve (i.e. `cssVars(...) !== ''`). */
	rolesComplete: boolean;
	/** A `theme.dark()` mapping is authored. */
	darkAuthored: boolean;
	/** At least one `scale.*` / `token(...)` group is authored. */
	tokensAuthored: boolean;
	/** Number of `component.*` specs authored. */
	componentCount: number;
}

/** The ordered step model with per-step completeness, purely derived. */
export function buildFlow(input: FlowInput): FlowStep[] {
	const { rolesComplete, darkAuthored, tokensAuthored, componentCount } = input;
	return [
		{
			id: 'roles',
			title: 'Roles',
			blurb: 'Map your named colors onto semantic roles (bg, fg, primary, …).',
			status: rolesComplete ? 'done' : 'todo'
		},
		{
			id: 'modes',
			title: 'Light & Dark',
			blurb: 'Re-point bg/fg/surface/border for a dark theme.',
			status: darkAuthored ? 'done' : 'todo'
		},
		{
			id: 'components',
			title: 'Components',
			blurb: 'Buttons, cards and type, rendered live and auto-audited.',
			status: componentCount > 0 ? 'done' : 'todo'
		},
		{
			id: 'tokens',
			title: 'Tokens',
			blurb: 'Type, spacing, radius and font scales for the system.',
			status: tokensAuthored ? 'done' : 'todo'
		},
		{
			id: 'handoff',
			title: 'Handoff',
			blurb: 'Audit the contrast and export CSS, tokens and a styleguide.',
			status: rolesComplete ? 'done' : 'todo'
		}
	];
}

/** A scaffold = the DSL lines to append plus the `// comment` that labels them. */
export interface Scaffold {
	lines: string[];
	comment: string;
}

function takenNames(scheme: Scheme): string[] {
	return [...scheme.entries.map((e) => e.name), ...scheme.nonColorVars.map((v) => v.name)];
}

/**
 * A `theme({...})` block binding the auto-assigned role → named-color mapping.
 * Only roles that resolve to a real color are emitted. `null` when there are no
 * colors to map yet.
 */
export function rolesScaffold(scheme: Scheme): Scaffold | null {
	if (scheme.entries.length === 0) return null;
	const auto: Roles = autoAssign(scheme.entries);
	const valid = new Set(scheme.entries.map((e) => e.name));
	const pairs = ROLE_KEYS.filter((k) => auto[k] && valid.has(auto[k])).map(
		(k) => [k, auto[k]] as const
	);
	if (pairs.length === 0) return null;

	const name = uniqueName('roles', takenNames(scheme));
	const body = pairs.map(([k, v], i) => `  ${k}: "${v}"${i < pairs.length - 1 ? ',' : ''}`);
	return {
		comment: 'Map named colors onto theme roles (editable, shareable)',
		lines: [`${name} = theme({`, ...body, `})`]
	};
}

/** Type / spacing / radius / font scales — valid regardless of the palette. */
export function tokensScaffold(scheme: Scheme): Scaffold {
	const taken = takenNames(scheme);
	const text = uniqueName('text', taken);
	const space = uniqueName('space', [...taken, text]);
	const radius = uniqueName('radius', [...taken, text, space]);
	const font = uniqueName('font', [...taken, text, space, radius]);
	return {
		comment: 'Design tokens — generators expand the scales',
		lines: [
			`${text} = scale.text(16, 1.25)`,
			`${space} = scale.space(4)`,
			`${radius} = scale.radius(10)`,
			`${font} = token("font", { sans: "Inter, system-ui, sans-serif", mono: "JetBrains Mono, monospace" })`
		]
	};
}

/**
 * A starter dark theme: inverted-lightness bg/fg/surface/border (keeping each
 * color's hue/chroma), plus a `dark { … }` block re-pointing onto them.
 * primary/accent stay shared. Needs resolved light bg/fg — returns null otherwise.
 */
export function modesScaffold(scheme: Scheme, lightRoles: Roles): Scaffold | null {
	const bgName = lightRoles.bg;
	const fgName = lightRoles.fg;
	if (!bgName || !fgName || !scheme.byName.has(bgName) || !scheme.byName.has(fgName)) return null;

	const taken = takenNames(scheme);
	const bgD = uniqueName('bg_dark', taken);
	const surfaceD = uniqueName('surface_dark', [...taken, bgD]);
	const fgD = uniqueName('fg_dark', [...taken, bgD, surfaceD]);
	const borderD = uniqueName('border_dark', [...taken, bgD, surfaceD, fgD]);
	return {
		comment: 'Dark mode — re-point bg/fg/surface/border onto inverted-lightness colors',
		lines: [
			`${bgD} = OKLCH(0.18, ${bgName}.ok_c, ${bgName}.ok_h)`,
			`${surfaceD} = ${bgD}.lighten(0.06)`,
			`${fgD} = OKLCH(0.95, ${fgName}.ok_c, ${fgName}.ok_h)`,
			`${borderD} = ${surfaceD}.lighten(0.14)`,
			``,
			`dark {`,
			`  bg = ${bgD}`,
			`  fg = ${fgD}`,
			`  surface = ${surfaceD}`,
			`  border = ${borderD}`,
			`}`
		]
	};
}

/** A button + a type ramp, wired to roles so they theme automatically. */
export function componentsScaffold(scheme: Scheme): Scaffold {
	const taken = takenNames(scheme);
	const button = uniqueName('button', taken);
	const headings = uniqueName('headings', [...taken, button]);
	return {
		comment: 'Components — rendered live and audited against your roles',
		lines: [
			`${button} = component.button({`,
			`  variants: [`,
			`    { name: "primary", bg: "primary", fg: "primary-fg" },`,
			`    { name: "ghost",   bg: "bg",      fg: "fg", border: "border" }`,
			`  ],`,
			`  sizes: [`,
			`    { name: "md", padY: "2", padX: "4", text: "base" },`,
			`    { name: "lg", padY: "3", padX: "5", text: "lg" }`,
			`  ],`,
			`  states: ["default", "hover", "active", "disabled"]`,
			`})`,
			``,
			`${headings} = component.type([`,
			`  { text: "3xl", weight: "bold", sample: "Display heading" },`,
			`  { text: "base", sample: "Body — the quick brown fox jumps over the lazy dog." }`,
			`])`
		]
	};
}
