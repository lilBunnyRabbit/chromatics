import type { Color as CuloriColor } from 'culori';
import type { ColorValue, DSLValue } from './value';

/**
 * Method "altitude" families from the color-model encyclopedia. Behaviour is
 * expressed as shared op-tables composed into each ModelDef, NOT as a runtime
 * class hierarchy. See families.ts.
 */
export type Family =
	| 'hue'
	| 'perceptual-cylindrical'
	| 'lab'
	| 'rgb'
	| 'subtractive'
	| 'tristimulus'
	| 'video'
	| 'system'
	| 'other'
	| 'root';

/**
 * Maturity of a model's implementation:
 *  - `stable`       — exact, culori-backed conversion math.
 *  - `experimental` — a real hand-rolled implementation (faithful but not
 *                     ICC/spec-certified, e.g. naive CMYK, HSLuv, HCT, RAL).
 *  - `coming-soon`  — advertised but not implemented yet; methods throw an
 *                     actionable error (needs a licensed dataset or the package).
 */
export type ModelStatus = 'stable' | 'experimental' | 'coming-soon';

export interface ChannelDef {
	/** Namespaced DSL accessor on the value: "ok_l" | "lab_a" | "hwb_w" | "lr" | "h". */
	key: string;
	/** Un-prefixed name inside the view: "l" | "a" | "w" | "r" | "h". */
	localKey: string;
	label: string;
	/** Field on the culori color of this model's mode. */
	culoriField: string;
	range: [number, number];
	/** Accessor scale (e.g. 255 for byte-RGB views; default 1). */
	scale?: number;
}

export interface ParamDef {
	name: string;
	kind: 'number' | 'color' | 'string' | 'enum' | 'object';
	optional?: boolean;
	enumValues?: string[];
}

export type MethodImpl = (self: ColorValue, args: DSLValue[]) => DSLValue;

export interface MethodDef {
	name: string;
	/** accessor = no-call getter (isGray, luminance); method = callable. */
	kind: 'method' | 'accessor';
	params: ParamDef[];
	returns: 'color' | 'colors' | 'number' | 'boolean' | 'string';
	doc: string;
	impl: MethodImpl;
	/** Family this method was inherited from, for docs grouping. */
	inheritedFrom?: string;
}

export interface CtorDef {
	name: string;
	params: ParamDef[];
	build: (a: number[]) => CuloriColor;
}

export interface ModelDef {
	/** DSL view name (also the registry key): "oklch" | "hsl" | "srgb" | "lab". */
	id: string;
	/** culori mode used for projections; defaults to `id`. e.g. srgb → "rgb". */
	mode: string;
	label: string;
	family: Family;
	ctor?: CtorDef;
	channels: ChannelDef[];
	/** own ⊕ family-inherited, composed at defineModel(). */
	methods: Map<string, MethodDef>;
	toCSS: (self: ColorValue) => string;
	/** true = conversion works (stable or experimental); false = coming-soon (methods throw). */
	backed: boolean;
	/** Implementation maturity, surfaced in docs/autocomplete badges. */
	status: ModelStatus;
	priority?: 'critical' | 'high' | 'normal';
}

/** Authoring shape for defineModel() — methods are composed into a Map there. */
export interface ModelSpec {
	id: string;
	mode?: string;
	label: string;
	family: Family;
	backed?: boolean;
	/** Maturity. Defaults: backed:false → 'coming-soon', otherwise 'stable'. */
	status?: ModelStatus;
	priority?: 'critical' | 'high' | 'normal';
	ctor?: CtorDef;
	channels?: ChannelDef[];
	ownMethods?: MethodDef[];
	inherit?: MethodDef[];
	toCSS?: (self: ColorValue) => string;
}
