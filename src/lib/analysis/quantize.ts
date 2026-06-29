/**
 * Median-cut color quantization — extract a small dominant palette from image
 * pixels (a logo, a photo, a moodboard) to seed a brand scheme. Pure: takes raw
 * RGBA bytes, returns sorted RGB tuples. The canvas/file plumbing lives in the
 * component that calls this.
 */
export type RGB = [number, number, number];

interface Box {
	pixels: RGB[];
}

function channelRange(pixels: RGB[], ch: 0 | 1 | 2): number {
	let lo = 255,
		hi = 0;
	for (const p of pixels) {
		if (p[ch] < lo) lo = p[ch];
		if (p[ch] > hi) hi = p[ch];
	}
	return hi - lo;
}

function widestChannel(pixels: RGB[]): 0 | 1 | 2 {
	const r = channelRange(pixels, 0);
	const g = channelRange(pixels, 1);
	const b = channelRange(pixels, 2);
	if (r >= g && r >= b) return 0;
	return g >= b ? 1 : 2;
}

function average(pixels: RGB[]): RGB {
	let r = 0,
		g = 0,
		b = 0;
	for (const p of pixels) {
		r += p[0];
		g += p[1];
		b += p[2];
	}
	const n = pixels.length || 1;
	return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

/**
 * Extract up to `count` dominant colors from RGBA bytes. `alphaCutoff` skips
 * near-transparent pixels (important for logos on transparent backgrounds).
 */
export function quantize(data: Uint8ClampedArray, count = 6, alphaCutoff = 8): RGB[] {
	const pixels: RGB[] = [];
	// Subsample so huge images stay fast; cap at ~20k samples.
	const px = data.length / 4;
	const step = Math.max(1, Math.floor(px / 20000));
	for (let i = 0; i < px; i += step) {
		const o = i * 4;
		if (data[o + 3] < alphaCutoff) continue;
		pixels.push([data[o], data[o + 1], data[o + 2]]);
	}
	if (pixels.length === 0) return [];

	let boxes: Box[] = [{ pixels }];
	while (boxes.length < count) {
		// Split the box with the most pixels along its widest channel at the median.
		boxes.sort((a, b) => b.pixels.length - a.pixels.length);
		const box = boxes.shift();
		if (!box || box.pixels.length < 2) {
			if (box) boxes.push(box);
			break;
		}
		const ch = widestChannel(box.pixels);
		box.pixels.sort((a, b) => a[ch] - b[ch]);
		const mid = box.pixels.length >> 1;
		boxes.push({ pixels: box.pixels.slice(0, mid) }, { pixels: box.pixels.slice(mid) });
	}

	return boxes
		.filter((b) => b.pixels.length)
		.map((b) => ({ rgb: average(b.pixels), n: b.pixels.length }))
		.sort((a, b) => b.n - a.n)
		.map((b) => b.rgb);
}

export function rgbToHex([r, g, b]: RGB): string {
	const h = (v: number) => v.toString(16).padStart(2, '0');
	return `#${h(r)}${h(g)}${h(b)}`;
}
