/** How hue travels between two angles (CSS Color 4 `#hue-interpolation`). */
export type HueInterpolation = "shorter" | "longer" | "increasing" | "decreasing";

/** Options for interpolating hue models. */
export interface HueOptions {
  /** Which arc the hue takes. Default `"shorter"`, as in CSS. */
  readonly hue?: HueInterpolation;
}

// CSS Color 4 #hue-interpolation pseudo-code, one branch per strategy.
export function fixHues(h1: number, h2: number, strategy: HueInterpolation): [number, number] {
  const d = h2 - h1;
  switch (strategy) {
    case "shorter":
      if (d > 180) h1 += 360;
      else if (d < -180) h2 += 360;
      break;
    case "longer":
      if (d > 0 && d < 180) h1 += 360;
      else if (d > -180 && d <= 0) h2 += 360;
      break;
    case "increasing":
      if (h2 < h1) h2 += 360;
      break;
    case "decreasing":
      if (h1 < h2) h1 += 360;
      break;
  }
  return [h1, h2];
}

export interface Endpoint {
  readonly coords: readonly number[];
  readonly alpha: number;
  /** The hue is powerless (achromatic) and takes the other end's (ADR-003). */
  readonly hueMissing?: boolean;
}

/**
 * Linear interpolation at `t` (extrapolating outside [0, 1]) in premultiplied alpha, CSS Color 4
 * `#interpolation-alpha`: every component except the hue is multiplied by alpha before interpolating
 * and divided by the interpolated alpha after, unless that alpha is 0.
 */
export function interpolate(
  a: Endpoint,
  b: Endpoint,
  t: number,
  hueIndex = -1,
  strategy: HueInterpolation = "shorter"
): [coords: number[], alpha: number] {
  const alpha = a.alpha * (1 - t) + b.alpha * t;
  let h1 = hueIndex >= 0 ? a.coords[hueIndex]! : 0;
  let h2 = hueIndex >= 0 ? b.coords[hueIndex]! : 0;
  if (a.hueMissing && !b.hueMissing) h1 = h2;
  else if (b.hueMissing && !a.hueMissing) h2 = h1;
  [h1, h2] = fixHues(h1, h2, strategy);
  // (v₁a₁(1 − t) + v₂a₂t) / α, the CSS premultiply–interpolate–divide, written as weights: algebraically
  // the same, but nothing underflows for tiny alphas and t = 0 / 1 return the ends exactly.
  const w1 = alpha === 0 ? 0 : (a.alpha * (1 - t)) / alpha;
  const w2 = alpha === 0 ? 0 : (b.alpha * t) / alpha;
  const coords = a.coords.map((v1, i) => {
    if (i === hueIndex) return h1 * (1 - t) + h2 * t;
    const v2 = b.coords[i]!;
    if (alpha === 0) return v1 * a.alpha * (1 - t) + v2 * b.alpha * t;
    return v1 * w1 + v2 * w2;
  });
  return [coords, alpha];
}

export function stepCount(n: number): number {
  if (!Number.isInteger(n) || n < 2) throw new RangeError(`steps needs an integer count of at least 2, got ${n}`);
  return n;
}

/** Position `i` of `n` over `stops` evenly spaced stops: the segment and the local t within it. */
export function segment(i: number, n: number, stops: number): [index: number, t: number] {
  const u = (i / (n - 1)) * (stops - 1);
  const index = Math.min(Math.floor(u), stops - 2);
  return [index, u - index];
}
