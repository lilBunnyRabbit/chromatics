/**
 * Scheme diff (CD-14). What does a brand-color change do across the whole derived
 * system? A "version" is a frozen `{ source, settings }` snapshot — nothing
 * derived is ever stored. Diffing = re-derive *both* snapshots through the shared
 * `deriveScheme()` spine (CD-12) and compare. Because both sides run the SAME pure
 * code, the diff is drift-free by construction.
 *
 * Three sections, in headline order:
 *  - **Contrast** — audit pairs that crossed a WCAG band (the payoff: "Muted text
 *    4.6 → 3.9, AA → Fail"). Compared in light AND dark (CD-13 inherits for free).
 *  - **Palette** — per-color add/remove/change with ΔE2000 + OKLCH L/C/H deltas.
 *  - **Roles** — role re-targets (effective binding moved) and dangling targets.
 *
 * Pure & Svelte-free: the History tab, an embeddable diff card, and any future
 * scriptable `preview.diff()` all consume this one function.
 */
import { deriveScheme, type RenderedScheme, type DeriveSettings } from './derive.js';
import type { Scheme } from './types.js';
import { ROLE_KEYS, NONE_ROLE, type Roles, type AuditPair } from './roles.js';
import { wcagLevels, type WcagLevel } from '../analysis/wcag.js';
import { deltaE2000 } from '../analysis/similarity.js';

// ── shapes ───────────────────────────────────────────────────────────────────

export type ChangeStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface PaletteDelta {
	name: string;
	status: ChangeStatus;
	/** Display hex on each side (undefined when added/removed). */
	before?: string;
	after?: string;
	/** ΔE2000 before→after (changed only). */
	deltaE?: number;
	/** OKLCH channel deltas, after − before (changed only). dH is shortest-arc. */
	dL?: number;
	dC?: number;
	dH?: number;
}

export interface RoleDelta {
	role: keyof Roles;
	/** added = newly bound · removed = lost its binding · retargeted = points elsewhere. */
	status: 'added' | 'removed' | 'retargeted' | 'unchanged';
	/** Effective entry name on each side (`''` = unbound / auto-resolved to nothing). */
	before: string;
	after: string;
	/** The after snapshot's intended target names a color that no longer exists. */
	dangling: boolean;
}

export interface ContrastDelta {
	label: string;
	status: ChangeStatus;
	before?: number;
	after?: number;
	beforeLevel?: WcagLevel;
	afterLevel?: WcagLevel;
	large: boolean;
	/** The WCAG band changed (AA → Fail, Fail → AAA, …) — the headline event. */
	crossed: boolean;
	direction: 'better' | 'worse' | 'same';
}

export interface DiffSummary {
	colorsChanged: number;
	colorsAdded: number;
	colorsRemoved: number;
	rolesChanged: number;
	/** Pairs that crossed to a WORSE band, across light + dark. */
	contrastRegressions: number;
	contrastImprovements: number;
	maxDeltaE: number;
	/** Anything at all differs between the two snapshots. */
	changed: boolean;
}

export interface SchemeDiff {
	palette: PaletteDelta[];
	roles: RoleDelta[];
	contrast: ContrastDelta[];
	/** Empty unless either snapshot authored a `theme.dark()`. */
	darkContrast: ContrastDelta[];
	hasDark: boolean;
	summary: DiffSummary;
}

/** A frozen scheme input — the unit a version stores and a diff compares. */
export interface Snapshot {
	source: string;
	settings: DeriveSettings;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const WCAG_RANK: Record<WcagLevel, number> = { Fail: 0, AA: 1, AAA: 2 };

const levelOf = (p: AuditPair): WcagLevel =>
	p.large ? wcagLevels(p.ratio).large : wcagLevels(p.ratio).normal;

/** Signed shortest-arc hue delta in degrees; 0 when either side is achromatic. */
function hueDelta(from: number, to: number): number {
	if (Number.isNaN(from) || Number.isNaN(to)) return 0;
	let d = (((to - from) % 360) + 360) % 360;
	if (d > 180) d -= 360;
	return d;
}

// ── palette ──────────────────────────────────────────────────────────────────

function paletteDiff(before: Scheme, after: Scheme): PaletteDelta[] {
	const out: PaletteDelta[] = [];
	const seen = new Set<string>();

	// Walk the AFTER order first — it is the "current" palette the user sees.
	for (const e of after.entries) {
		seen.add(e.name);
		const b = before.byName.get(e.name);
		if (!b) {
			out.push({ name: e.name, status: 'added', after: e.color.hex });
			continue;
		}
		const bh = b.color.hex;
		const ah = e.color.hex;
		if (bh === ah) {
			out.push({ name: e.name, status: 'unchanged', before: bh, after: ah });
		} else {
			out.push({
				name: e.name,
				status: 'changed',
				before: bh,
				after: ah,
				deltaE: deltaE2000(b.color, e.color),
				dL: e.color.channel('ok_l') - b.color.channel('ok_l'),
				dC: e.color.channel('ok_c') - b.color.channel('ok_c'),
				dH: hueDelta(b.color.channel('ok_h'), e.color.channel('ok_h'))
			});
		}
	}
	// Colors that existed before and are now gone.
	for (const e of before.entries) {
		if (seen.has(e.name)) continue;
		out.push({ name: e.name, status: 'removed', before: e.color.hex });
	}
	return out;
}

// ── roles ────────────────────────────────────────────────────────────────────

function roleDiff(before: RenderedScheme, after: RenderedScheme): RoleDelta[] {
	const out: RoleDelta[] = [];
	for (const role of ROLE_KEYS) {
		const b = before.effectiveRoles[role];
		const a = after.effectiveRoles[role];
		// "Dangling" = the after snapshot's *intent* (theme() / UI override) names a
		// color that isn't in the after scheme — e.g. a color was renamed out from
		// under a `theme()` binding. NONE_ROLE / '' are deliberate, not dangling.
		const intent = after.mergedRoles[role];
		const dangling =
			!!intent && intent !== '' && intent !== NONE_ROLE && !after.scheme.byName.has(intent);

		let status: RoleDelta['status'];
		if (b === a) status = 'unchanged';
		else if (!b) status = 'added';
		else if (!a) status = 'removed';
		else status = 'retargeted';

		out.push({ role, status, before: b, after: a, dangling });
	}
	return out;
}

// ── contrast ─────────────────────────────────────────────────────────────────

/**
 * Zip two audit lists by label (the only stable join key). Labels are recomputed
 * per snapshot, so a component added/removed between versions shows as an
 * added/removed row — it must never crash on a missing label.
 */
function contrastDiff(before: AuditPair[], after: AuditPair[]): ContrastDelta[] {
	const beforeByLabel = new Map(before.map((p) => [p.label, p]));
	const afterByLabel = new Map(after.map((p) => [p.label, p]));

	const labels: string[] = [];
	const seen = new Set<string>();
	for (const p of after) {
		labels.push(p.label);
		seen.add(p.label);
	}
	for (const p of before) if (!seen.has(p.label)) labels.push(p.label);

	const out: ContrastDelta[] = [];
	for (const label of labels) {
		const b = beforeByLabel.get(label);
		const a = afterByLabel.get(label);
		if (b && a) {
			const bl = levelOf(b);
			const al = levelOf(a);
			const direction =
				a.ratio > b.ratio + 1e-9 ? 'better' : a.ratio < b.ratio - 1e-9 ? 'worse' : 'same';
			out.push({
				label,
				status: direction === 'same' ? 'unchanged' : 'changed',
				before: b.ratio,
				after: a.ratio,
				beforeLevel: bl,
				afterLevel: al,
				large: !!a.large,
				crossed: bl !== al,
				direction
			});
		} else if (a) {
			out.push({
				label,
				status: 'added',
				after: a.ratio,
				afterLevel: levelOf(a),
				large: !!a.large,
				crossed: false,
				direction: 'same'
			});
		} else if (b) {
			out.push({
				label,
				status: 'removed',
				before: b.ratio,
				beforeLevel: levelOf(b),
				large: !!b.large,
				crossed: false,
				direction: 'same'
			});
		}
	}
	return out;
}

function summarize(
	palette: PaletteDelta[],
	roles: RoleDelta[],
	contrast: ContrastDelta[],
	darkContrast: ContrastDelta[]
): DiffSummary {
	const colorsChanged = palette.filter((p) => p.status === 'changed').length;
	const colorsAdded = palette.filter((p) => p.status === 'added').length;
	const colorsRemoved = palette.filter((p) => p.status === 'removed').length;
	const rolesChanged = roles.filter((r) => r.status !== 'unchanged').length;

	let contrastRegressions = 0;
	let contrastImprovements = 0;
	for (const c of [...contrast, ...darkContrast]) {
		if (!c.crossed || !c.beforeLevel || !c.afterLevel) continue;
		const d = WCAG_RANK[c.afterLevel] - WCAG_RANK[c.beforeLevel];
		if (d < 0) contrastRegressions++;
		else if (d > 0) contrastImprovements++;
	}

	const maxDeltaE = palette.reduce((m, p) => Math.max(m, p.deltaE ?? 0), 0);
	const contrastTouched =
		contrast.some((c) => c.status !== 'unchanged') ||
		darkContrast.some((c) => c.status !== 'unchanged');

	return {
		colorsChanged,
		colorsAdded,
		colorsRemoved,
		rolesChanged,
		contrastRegressions,
		contrastImprovements,
		maxDeltaE,
		changed: colorsChanged + colorsAdded + colorsRemoved + rolesChanged > 0 || contrastTouched
	};
}

// ── entry points ─────────────────────────────────────────────────────────────

/** Compare two already-derived schemes (pure; no re-derivation). */
export function diffSchemes(before: RenderedScheme, after: RenderedScheme): SchemeDiff {
	const palette = paletteDiff(before.scheme, after.scheme);
	const roles = roleDiff(before, after);
	const contrast = contrastDiff(before.componentAudit, after.componentAudit);
	const hasDark = before.hasDarkTheme || after.hasDarkTheme;
	const darkContrast = hasDark
		? contrastDiff(before.darkComponentAudit, after.darkComponentAudit)
		: [];
	return {
		palette,
		roles,
		contrast,
		darkContrast,
		hasDark,
		summary: summarize(palette, roles, contrast, darkContrast)
	};
}

/** Derive a snapshot through the shared spine. */
export function deriveSnapshot(snap: Snapshot): RenderedScheme {
	return deriveScheme(snap.source, snap.settings);
}

/** Re-derive both snapshots and diff them — the canonical `{source,settings}` path. */
export function diffSnapshots(before: Snapshot, after: Snapshot): SchemeDiff {
	return diffSchemes(deriveSnapshot(before), deriveSnapshot(after));
}
