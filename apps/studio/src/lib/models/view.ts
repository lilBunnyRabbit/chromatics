import type { ColorValue, DSLValue, DSLFunction } from './value';
import type { ModelDef } from './types';
import { getModel } from './registry';

/**
 * The ONE runtime view class (not 70). Binds a ColorValue to a ModelDef and
 * resolves channel reads + method calls against the model's data table.
 * This is the A-ergonomics / C-data hybrid in a single object.
 */
export class ModelView {
	constructor(
		readonly self: ColorValue,
		readonly def: ModelDef
	) {}

	member(prop: string): DSLValue | undefined {
		// 1) this model's channels, un-prefixed inside the view (c.hsl.h, c.lab.a)
		const ch = this.def.channels.find((c) => c.localKey === prop || c.key === prop);
		if (ch) {
			const v = (this.self.project(this.def.mode) as unknown as Record<string, number | undefined>)[
				ch.culoriField
			];
			return (v ?? 0) * (ch.scale ?? 1);
		}
		// 2) this model's methods (own ⊕ family-inherited)
		const m = this.def.methods.get(prop);
		if (m) {
			if (m.kind === 'accessor') return m.impl(this.self, []);
			return ((...args: DSLValue[]) => m.impl(this.self, args)) as DSLFunction;
		}
		// 3) cross-model re-entry: c.lab.oklch
		if (getModel(prop)) return this.self.view(prop) as unknown as DSLValue;
		return undefined;
	}
}
