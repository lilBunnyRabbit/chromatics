import { describe, expect, expectTypeOf, it } from 'vitest';
import { Color } from './color.js';
import { edge } from './edge.js';
import type { Edge } from './model.js';
import { path, reachable } from './router.js';

class Hub extends Color {
	static readonly id = 'test-hub';
	static readonly edges: readonly Edge[] = [];
	static readonly terminal = false;
	readonly model = 'test-hub';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Hub(this.x, this.alpha) as this;
	}
	override toString() {
		return `hub(${this.x})`;
	}
}

class Doubled extends Color {
	static readonly id = 'test-doubled';
	static readonly edges: readonly Edge[] = [
		edge(
			Hub,
			(d: Doubled) => new Hub(d.x / 2, d.alpha),
			(h) => new Doubled(h.x * 2, h.alpha)
		)
	];
	static readonly terminal = false;
	readonly model = 'test-doubled';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Doubled(this.x, this.alpha) as this;
	}
	override toString() {
		return `doubled(${this.x})`;
	}
}

interface ShiftedOptions {
	readonly by?: number;
}

class Shifted extends Color {
	static readonly id = 'test-shifted';
	declare static readonly __options?: ShiftedOptions;
	static readonly edges: readonly Edge[] = [
		edge(
			Doubled,
			(s: Shifted) => new Doubled(s.x - 1, s.alpha),
			(d, o) => new Shifted(d.x + 1 + ((o as ShiftedOptions | undefined)?.by ?? 0), d.alpha)
		)
	];
	static readonly terminal = false;
	readonly model = 'test-shifted';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Shifted(this.x, this.alpha) as this;
	}
	override toString() {
		return `shifted(${this.x})`;
	}
}

class Rounded extends Color {
	static readonly id = 'test-rounded';
	static readonly edges: readonly Edge[] = [
		edge(
			Hub,
			(r: Rounded) => new Hub(r.x, r.alpha),
			(h) => new Rounded(Math.round(h.x), h.alpha)
		)
	];
	static readonly terminal = true;
	readonly model = 'test-rounded';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Rounded(this.x, this.alpha) as this;
	}
	override toString() {
		return `rounded(${this.x})`;
	}
}

// Only reachable through Rounded, which is terminal: a route must never pass through it.
class BehindByte extends Color {
	static readonly id = 'test-behind-byte';
	static readonly edges: readonly Edge[] = [
		edge(
			Rounded,
			(b: BehindByte) => new Rounded(b.x, b.alpha),
			(r) => new BehindByte(r.x, r.alpha)
		)
	];
	static readonly terminal = false;
	readonly model = 'test-behind-byte';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new BehindByte(this.x, this.alpha) as this;
	}
	override toString() {
		return `behind(${this.x})`;
	}
}

class Isolated extends Color {
	static readonly id = 'test-isolated';
	static readonly edges: readonly Edge[] = [];
	static readonly terminal = false;
	readonly model = 'test-isolated';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Isolated(this.x, this.alpha) as this;
	}
	override toString() {
		return `isolated(${this.x})`;
	}
}

let hops = 0;

class Far extends Color {
	static readonly id = 'test-far';
	static readonly edges: readonly Edge[] = [
		edge(
			Shifted,
			(f: Far) => (hops++, new Shifted(f.x, f.alpha)),
			(s) => (hops++, new Far(s.x, s.alpha))
		)
	];
	static readonly terminal = false;
	readonly model = 'test-far';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Far(this.x, this.alpha) as this;
	}
	override toString() {
		return `far(${this.x})`;
	}
}

class Bridge extends Color {
	static readonly id = 'test-bridge';
	static readonly edges: readonly Edge[] = [
		edge(
			Hub,
			(b: Bridge) => (hops++, new Hub(b.x, b.alpha)),
			(h) => (hops++, new Bridge(h.x, h.alpha))
		),
		edge(
			Far,
			(b: Bridge) => (hops++, new Far(b.x, b.alpha)),
			(f) => (hops++, new Bridge(f.x, f.alpha))
		)
	];
	static readonly terminal = false;
	readonly model = 'test-bridge';
	constructor(
		public x: number,
		public alpha = 1
	) {
		super();
	}
	get coords() {
		return [this.x] as const;
	}
	clone(): this {
		return new Bridge(this.x, this.alpha) as this;
	}
	override toString() {
		return `bridge(${this.x})`;
	}
}

const all = [Hub, Doubled, Shifted, Rounded, BehindByte, Isolated];

describe('to / from', () => {
	it('follows a declared edge forward and its reverse', () => {
		expect(new Doubled(8).to(Hub).x).toBe(4);
		expect(new Hub(4).to(Doubled).x).toBe(8);
	});

	it('chains edges declared on different models', () => {
		expect(new Shifted(9).to(Hub).x).toBe(4);
		expect(new Hub(4).to(Shifted).x).toBe(9);
	});

	it('carries alpha along the path', () => {
		expect(new Shifted(9, 0.25).to(Hub).alpha).toBe(0.25);
	});

	it('passes options to the steps', () => {
		expect(new Hub(4).to(Shifted, { by: 10 }).x).toBe(19);
		expect(Shifted.from(new Hub(4), { by: 10 }).x).toBe(19);
	});

	it('M.from(c) equals c.to(M)', () => {
		expect(Doubled.from(new Hub(3)).x).toBe(new Hub(3).to(Doubled).x);
	});

	it('to(SameModel) returns a new instance, never the receiver', () => {
		const a = new Hub(1);
		const b = a.to(Hub);
		expect(b).not.toBe(a);
		b.x = 99;
		expect(a.x).toBe(1);
	});

	it('never changes the receiver', () => {
		const a = new Shifted(9);
		a.to(Hub);
		expect(a.x).toBe(9);
	});

	it('converts to and from a terminal model', () => {
		expect(new Hub(1.6).to(Rounded).x).toBe(2);
		expect(new Rounded(2).to(Hub).x).toBe(2);
	});

	it('never routes through a terminal model', () => {
		expect(() => new Hub(1).to(BehindByte)).toThrow(
			'No conversion path from test-hub to test-behind-byte'
		);
		expect(new Rounded(2).to(BehindByte).x).toBe(2);
	});

	it('throws when no path exists', () => {
		expect(() => new Hub(1).to(Isolated)).toThrow(
			'No conversion path from test-hub to test-isolated'
		);
	});
});

describe('determinism', () => {
	it('a route depends only on its two models, not on what else was converted', () => {
		hops = 0;
		new Far(1).to(Hub);
		expect(hops).toBe(1);
		new Bridge(1).to(Hub);
		new Bridge(1).to(Far);
		hops = 0;
		new Far(1).to(Hub);
		expect(hops).toBe(1);
		expect(path(Far, Hub)).toEqual([Far, Shifted, Doubled, Hub]);
	});

	it('reachable depends only on its arguments', () => {
		const before = reachable(Hub, all);
		new Bridge(1).to(Far);
		expect(reachable(Hub, all)).toEqual(before);
	});
});

describe('is', () => {
	it('narrows by model id', () => {
		const c: Color = new Doubled(2);
		expect(c.is(Doubled)).toBe(true);
		expect(c.is(Hub)).toBe(false);
		if (c.is(Doubled)) expectTypeOf(c).toEqualTypeOf<Doubled>();
	});
});

describe('equals', () => {
	it('is exact', () => {
		expect(new Hub(1).equals(new Hub(1))).toBe(true);
		expect(new Hub(1).equals(new Hub(1 + Number.EPSILON))).toBe(false);
		expect(new Hub(1, 0.5).equals(new Hub(1))).toBe(false);
	});
});

describe('path / reachable', () => {
	it('lists the route, both ends included', () => {
		expect(path(Shifted, Hub)).toEqual([Shifted, Doubled, Hub]);
	});

	it('only lists a terminal model as an end', () => {
		expect(path(Hub, BehindByte)).toBeUndefined();
		expect(path(BehindByte, Hub)).toBeUndefined();
		expect(path(BehindByte, Rounded)).toEqual([BehindByte, Rounded]);
	});

	it('reachable excludes the start, unreachable and behind-terminal models', () => {
		const out = reachable(Hub, all);
		expect(new Set(out)).toEqual(new Set([Doubled, Shifted, Rounded]));
	});
});

describe('types', () => {
	it('types options per target model', () => {
		expectTypeOf(new Hub(1).to(Shifted, { by: 1 })).toEqualTypeOf<Shifted>();
		expectTypeOf(Doubled.from(new Hub(1))).toEqualTypeOf<Doubled>();
		// @ts-expect-error Hub takes no options
		new Doubled(1).to(Hub, { by: 1 });
		// @ts-expect-error unknown option for Shifted
		new Hub(1).to(Shifted, { nope: 1 });
	});

	it('equals takes the same model only', () => {
		// @ts-expect-error a Doubled is not a Hub, though both have `x` and `alpha`
		new Hub(1).equals(new Doubled(1));
	});
});
