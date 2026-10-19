import type { ColorModel } from "../core/model.js";
import { Hsl } from "../models/hsl/hsl.js";
import { Hsv } from "../models/hsv/hsv.js";
import { Hwb } from "../models/hwb/hwb.js";
import { Lch } from "../models/lch/lch.js";
import { Oklch } from "../models/oklch/oklch.js";

/**
 * What the harness needs to compare two colors of one model: which models round-trip for every real
 * triple, and for hue models the colorfulness that weights a hue error plus the coordinates that name
 * the same color (a grey's hue, Hsl's saturation at black or white).
 */
export interface Comparison {
  readonly unbounded?: boolean;
  readonly hueWeight?: (coords: readonly number[]) => number;
  readonly canonical?: (coords: readonly number[]) => readonly number[];
}

const at = (coords: readonly number[], i: number) => coords[i]!;

// NaN marks a channel that doesn't affect the color here; comparisons skip it when either side is NaN.
export const comparisons = new Map<ColorModel, Comparison>([
  [
    Oklch,
    {
      hueWeight: (c) => Math.abs(at(c, 1)),
      canonical: (c) => (at(c, 1) <= 0.000004 ? [at(c, 0), at(c, 1), NaN] : c),
    },
  ],
  [
    Lch,
    {
      hueWeight: (c) => Math.abs(at(c, 1)),
      canonical: (c) => (at(c, 1) <= 0.0015 ? [at(c, 0), at(c, 1), NaN] : c),
    },
  ],
  [
    Hsl,
    {
      hueWeight: (c) => Math.abs(at(c, 1)) * Math.max(0, Math.min(at(c, 2), 1 - at(c, 2))),
      canonical: (c) => {
        const [h, s, l] = [at(c, 0), at(c, 1), at(c, 2)];
        if (l <= 0 || l >= 1) return [NaN, NaN, l];
        return s <= 0.00001 ? [NaN, s, l] : [h, s, l];
      },
    },
  ],
  [
    Hsv,
    {
      hueWeight: (c) => Math.abs(at(c, 1)) * Math.max(0, at(c, 2)),
      canonical: (c) => {
        const [h, s, v] = [at(c, 0), at(c, 1), at(c, 2)];
        if (v <= 0) return [NaN, NaN, v];
        return s <= 0.00001 ? [NaN, s, v] : [h, s, v];
      },
    },
  ],
  [
    Hwb,
    {
      hueWeight: (c) => Math.max(0, 1 - at(c, 1) - at(c, 2)),
      canonical: (c) => {
        const [h, w, b] = [at(c, 0), at(c, 1), at(c, 2)];
        if (w + b >= 1) {
          const grey = w / (w + b);
          return [NaN, grey, 1 - grey];
        }
        return w + b >= 1 - 0.00001 ? [NaN, w, b] : [h, w, b];
      },
    },
  ],
]);

const RECTANGULAR = ["xyz-d65", "xyz-d50", "srgb-linear", "srgb", "display-p3", "oklab", "lab"];

/**
 * Round trips that hold for every real triple, tested again over 3× the reference ranges: the
 * rectangular models among themselves, and out-of-gamut sRGB through HSL (CSS Color 4 `rgbToHsl`
 * rotates negative saturation for exactly this, csswg-drafts #9222). HWB is left out (the spec notes
 * "No round-tripping of oog colors, unlike HSL"), and so is HSV, which no source defines out of gamut.
 */
export function extended(from: string, via: string): boolean {
  if (RECTANGULAR.includes(from) && RECTANGULAR.includes(via)) return true;
  return from === "srgb" && via === "hsl";
}
