export function finite(value: number, model: string, channel: string): number {
	if (!Number.isFinite(value)) {
		throw new TypeError(`${model}.${channel} must be a finite number, got ${value}`);
	}
	return value;
}

export function wrapHue(value: number, model: string, channel = 'h'): number {
	const h = finite(value, model, channel) % 360;
	const wrapped = h < 0 ? h + 360 : h;
	// -0, and a tiny negative hue whose `+ 360` rounds to exactly 360, both have to land on 0.
	return wrapped === 360 || wrapped === 0 ? 0 : wrapped;
}

export function byte(value: number, model: string, channel: string): number {
	const v = Math.round(finite(value, model, channel));
	// `<= 0` also folds Math.round's -0 (any input in [-0.5, 0]) into +0.
	return v <= 0 ? 0 : v > 255 ? 255 : v;
}
