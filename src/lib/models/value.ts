import type { CuloriColor } from './registry';
import {
	getModel,
	getModelByMode,
	CHANNELS,
	formatHex,
	formatCss,
	isDisplayable,
	inGamut,
	clampChroma,
	resolveConversion
} from './registry';
import { ModelView } from './view';

export type PlainObject = { [key: string]: DSLValue };
export type DSLValue =
	| number
	| string
	| boolean
	| ColorValue
	| ModelView
	| DSLValue[]
	| PlainObject
	| DSLFunction;
export type DSLFunction = (...args: DSLValue[]) => DSLValue;

export function isColorValue(v: unknown): v is ColorValue {
	return v instanceof ColorValue;
}

/**
 * A model-tagged, immutable color. The color is stored NATIVELY in its own
 * model's coordinates (the mode it was constructed in) — there is NO single
 * canonical store. "HSL stays HSL unless explicitly converted": reading a
 * channel of the native model is exact; reading another model goes through a
 * conversion (`to()` / `project()`), memoized per mode.
 *
 * Behaviour does NOT live here — it lives in the registry and is surfaced
 * through views (c.hsl, c.lab, …) and the root flat-shortcuts (c.lighten, …).
 */
export class ColorValue {
	private readonly _native: CuloriColor;
	private readonly _model: string;
	private readonly _proj = new Map<string, CuloriColor>();
	private readonly _views = new Map<string, ModelView>();

	constructor(c: CuloriColor) {
		const mode = (c as unknown as { mode?: string })?.mode;
		if (!c || typeof mode !== 'string') throw new Error('Invalid color');
		this._native = c;
		this._model = mode;
		this._proj.set(mode, c);
	}

	static from(c: CuloriColor): ColorValue {
		return new ColorValue(c);
	}

	/** The model this color is stored in (its tag). */
	get model(): string {
		return this._model;
	}

	/**
	 * Memoized culori projection into any mode. Returns the raw CuloriColor — the
	 * low-level read path used internally (channels, methods, measurement). When
	 * `mode` is this color's own model it returns the native value untouched (no
	 * round-trip). For cross-model VALUES use `to()`, which returns a tagged color.
	 */
	project(mode: string): CuloriColor {
		let p = this._proj.get(mode);
		if (!p) {
			p = resolveConversion(this._model, mode)(this._native);
			this._proj.set(mode, p);
		}
		return p;
	}

	/**
	 * Convert to another model, returning a NEW model-tagged ColorValue. Identity
	 * (same object) when the target is this color's own model — the core of
	 * "HSL stays HSL". Accepts a model id ('hsl') or a model definition/ctor with
	 * an `id`/`mode`.
	 */
	to(model: string | { id?: string; mode?: string }): ColorValue {
		const id = typeof model === 'string' ? model : (model.id ?? model.mode);
		if (!id) throw new Error('to(): unknown target model');
		const def = getModel(id);
		const mode = def?.mode ?? id;
		if (mode === this._model) return this;
		return ColorValue.from(this.project(mode));
	}

	/** Read a namespaced channel (ok_l, lab_a, hwb_w, h, r…) regardless of view. */
	channel(key: string): number {
		const ch = CHANNELS.get(key);
		if (!ch) throw new Error(`Unknown channel: ${key}`);
		const v = (this.project(ch.mode) as unknown as Record<string, number | undefined>)[
			ch.culoriField
		];
		return (v ?? 0) * (ch.scale ?? 1);
	}

	/** Memoized view object: c.oklch / c.hsl / c.lab. */
	view(modelId: string): ModelView {
		let v = this._views.get(modelId);
		if (!v) {
			const def = getModel(modelId);
			if (!def) throw new Error(`Unknown model: ${modelId}`);
			v = new ModelView(this, def);
			this._views.set(modelId, v);
		}
		return v;
	}

	/**
	 * Member dispatch for a bare value: channels → conversion → OWN-model methods
	 * → cross-model views → root queries. The DSL evaluator routes `color.<prop>`
	 * through here.
	 *
	 * Crucially a color exposes ITS OWN model's methods directly: an OKLCH color
	 * answers `c.lighten()`, an HSL color answers `c.tint()`. You only prefix a
	 * view (`c.oklch.…`) to reach a DIFFERENT model — "ops live on the model the
	 * color is already in."
	 */
	member(prop: string): DSLValue | undefined {
		if (CHANNELS.has(prop)) return this.channel(prop);
		// Explicit conversion: c.to("oklch") or c.to(c.oklch). Returns a tagged color.
		if (prop === 'to') {
			return (m: DSLValue) => {
				const id = typeof m === 'string' ? m : m instanceof ModelView ? m.def.id : undefined;
				if (!id) throw new Error('to() expects a model name, e.g. to("oklch")');
				return this.to(id);
			};
		}
		// This color's OWN model methods, reachable without a view prefix.
		const ownDef = getModel(this._model) ?? getModelByMode(this._model);
		const own = ownDef?.methods.get(prop);
		if (own) {
			if (own.kind === 'accessor') return own.impl(this, []);
			return (...args: DSLValue[]) => own.impl(this, args);
		}
		if (prop !== 'root' && getModel(prop)) return this.view(prop);
		const root = getModel('root');
		const m = root?.methods.get(prop);
		if (m) {
			if (m.kind === 'accessor') return m.impl(this, []);
			return (...args: DSLValue[]) => m.impl(this, args);
		}
		return undefined;
	}

	get hex(): string {
		return formatHex(this._native) ?? '#000000';
	}
	get inGamut(): boolean {
		return isDisplayable(this._native);
	}
	get inP3(): boolean {
		return inGamut('p3')(this._native);
	}
	/** Chroma-clamped into the sRGB gamut (display convenience). Returns OKLCH. */
	get gamutMapped(): ColorValue {
		return ColorValue.from(clampChroma(this.project('oklch'), 'oklch'));
	}
	/** CSS string in this color's OWN model (hsl→"hsl(…)", oklch→"oklch(…)"). */
	toCSS(): string {
		const def = getModel(this._model) ?? getModelByMode(this._model);
		return def ? def.toCSS(this) : (formatCss(this._native) ?? this.hex);
	}
	toString(): string {
		return this.hex;
	}
}
