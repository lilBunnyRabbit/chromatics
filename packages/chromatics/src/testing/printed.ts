/** Half a unit in the last printed digit of `text`: the rounding a published value carries. */
export function halfDigit(text: string): number {
  const decimals = text.split(".")[1]?.length ?? 0;
  return 0.5 * 10 ** -decimals;
}

function distance(a: number, b: number, hue: boolean): number {
  if (!hue) return Math.abs(a - b);
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * A printed input is itself rounded: its true value lies within `half` of each channel. Converts every
 * corner of that box and returns, per output channel, the largest distance from the centre's result, so
 * the input's rounding joins the output tolerance. `hue` marks circular output channels.
 */
export function cornerSpread(
  input: readonly number[],
  half: number,
  convert: (...coords: number[]) => readonly number[],
  hue: readonly boolean[] = []
): number[] {
  const center = convert(...input);
  const out = center.map(() => 0);
  for (let m = 0; m < 1 << input.length; m++) {
    const corner = input.map((v, i) => v + (m & (1 << i) ? half : -half));
    convert(...corner).forEach((v, i) => (out[i] = Math.max(out[i]!, distance(v, center[i]!, hue[i] === true))));
  }
  return out;
}

/** Distance between two hue angles in degrees, 0–180. */
export function hueDistance(a: number, b: number): number {
  return distance(a, b, true);
}
