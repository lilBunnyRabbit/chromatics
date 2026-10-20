import {
	type Oklch,
	type Color as CuloriColor,
	converter,
	formatHex,
	clampChroma,
	wcagContrast,
	displayable,
	inGamut,
	parse
} from 'culori';

const toOklch = converter('oklch');
const toHsl = converter('hsl');
const toRgb = converter('rgb');

function makeOklch(l: number, c: number, h: number): Oklch {
	return { mode: 'oklch', l, c, h };
}

export class Color {
	private _oklch: Oklch;

	// Cache converted representations
	private _hsl?: ReturnType<typeof toHsl>;
	private _rgb?: ReturnType<typeof toRgb>;
	private _hex?: string;

	constructor(color: CuloriColor) {
		const converted = toOklch(color);
		if (!converted) throw new Error('Invalid color');
		this._oklch = converted;
	}

	// --- OKLCH channels ---

	get ok_l(): number {
		return this._oklch.l ?? 0;
	}
	get ok_c(): number {
		return this._oklch.c ?? 0;
	}
	get ok_h(): number {
		return this._oklch.h ?? 0;
	}

	// --- HSL channels ---

	private get hslColor() {
		return (this._hsl ??= toHsl(this._oklch));
	}
	get h(): number {
		return this.hslColor?.h ?? 0;
	}
	get s(): number {
		return this.hslColor?.s ?? 0;
	}
	get l(): number {
		return this.hslColor?.l ?? 0;
	}

	// --- RGB channels (0-1) ---

	private get rgbColor() {
		return (this._rgb ??= toRgb(this._oklch));
	}
	get r(): number {
		return this.rgbColor?.r ?? 0;
	}
	get g(): number {
		return this.rgbColor?.g ?? 0;
	}
	get b(): number {
		return this.rgbColor?.b ?? 0;
	}

	// --- Hex ---

	get hex(): string {
		return (this._hex ??= formatHex(this._oklch) ?? '#000000');
	}

	// --- Gamut ---

	get inGamut(): boolean {
		return displayable(this._oklch);
	}

	get inP3(): boolean {
		return inGamut('p3')(this._oklch);
	}

	get gamutMapped(): Color {
		return new Color(clampChroma(this._oklch, 'oklch'));
	}

	// --- Operations (all return new Color) ---

	lighten(amount: number): Color {
		return new Color(makeOklch(this.ok_l + amount, this.ok_c, this.ok_h));
	}

	darken(amount: number): Color {
		return new Color(makeOklch(this.ok_l - amount, this.ok_c, this.ok_h));
	}

	saturate(amount: number): Color {
		return new Color(makeOklch(this.ok_l, this.ok_c + amount, this.ok_h));
	}

	desaturate(amount: number): Color {
		return new Color(makeOklch(this.ok_l, this.ok_c - amount, this.ok_h));
	}

	rotate(degrees: number): Color {
		return new Color(makeOklch(this.ok_l, this.ok_c, (((this.ok_h + degrees) % 360) + 360) % 360));
	}

	invert(): Color {
		return new Color(makeOklch(1 - this.ok_l, this.ok_c, (((this.ok_h + 180) % 360) + 360) % 360));
	}

	complement(): Color {
		return this.rotate(180);
	}

	mix(other: Color, ratio: number = 0.5): Color {
		const l = this.ok_l * (1 - ratio) + other.ok_l * ratio;
		const c = this.ok_c * (1 - ratio) + other.ok_c * ratio;
		let h1 = this.ok_h;
		let h2 = other.ok_h;
		let diff = h2 - h1;
		if (diff > 180) diff -= 360;
		if (diff < -180) diff += 360;
		const h = (((h1 + diff * ratio) % 360) + 360) % 360;
		return new Color(makeOklch(l, c, h));
	}

	shift(deltas: { l?: number; c?: number; h?: number }): Color {
		return new Color(
			makeOklch(
				this.ok_l + (deltas.l ?? 0),
				this.ok_c + (deltas.c ?? 0),
				(((this.ok_h + (deltas.h ?? 0)) % 360) + 360) % 360
			)
		);
	}

	derive(overrides: { l?: number; c?: number; h?: number }): Color {
		return new Color(
			makeOklch(overrides.l ?? this.ok_l, overrides.c ?? this.ok_c, overrides.h ?? this.ok_h)
		);
	}

	contrast(other: Color): number {
		return wcagContrast(this._oklch, other._oklch);
	}

	toString(): string {
		return this.hex;
	}

	// --- Static constructors (used by the DSL environment) ---

	static HSL(h: number, s: number, l: number): Color {
		return new Color({ mode: 'hsl', h, s, l });
	}

	static RGB(r: number, g: number, b: number): Color {
		return new Color({ mode: 'rgb', r, g, b });
	}

	static OKLCH(l: number, c: number, h: number): Color {
		return new Color(makeOklch(l, c, h));
	}

	static hex(str: string): Color {
		const parsed = parse(str);
		if (!parsed) throw new Error(`Invalid hex color: ${str}`);
		return new Color(parsed);
	}
}
