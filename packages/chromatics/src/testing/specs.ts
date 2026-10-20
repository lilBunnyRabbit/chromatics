import { maxChroma, maxChromaForHue, singular } from "../core/hsluv.js";
import { lightnessToY } from "../core/luv.js";
import { shapeless, toeInv } from "../core/okhsl.js";
import type { ColorModel } from "../core/model.js";
import { Cam16 } from "../models/cam16/cam16.js";
import { Cam16Lcd } from "../models/cam16-lcd/cam16-lcd.js";
import { Cam16Scd } from "../models/cam16-scd/cam16-scd.js";
import { Cam16Ucs } from "../models/cam16-ucs/cam16-ucs.js";
import { Ciecam02 } from "../models/ciecam02/ciecam02.js";
import { Hct } from "../models/hct/hct.js";
import { Hpluv } from "../models/hpluv/hpluv.js";
import { Okhsl } from "../models/okhsl/okhsl.js";
import { Okhsv } from "../models/okhsv/okhsv.js";
import { Oklab } from "../models/oklab/oklab.js";
import { Hsl } from "../models/hsl/hsl.js";
import { Hsluv } from "../models/hsluv/hsluv.js";
import { Hsv } from "../models/hsv/hsv.js";
import { Hwb } from "../models/hwb/hwb.js";
import { Jzczhz } from "../models/jzczhz/jzczhz.js";
import { Lch } from "../models/lch/lch.js";
import { Lchuv50 } from "../models/lchuv50/lchuv50.js";
import { Lchuv65 } from "../models/lchuv65/lchuv65.js";
import { Luv50 } from "../models/luv50/luv50.js";
import { Luv65 } from "../models/luv65/luv65.js";
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

// u* = 13·L*·(u′ − u′n): below L* 1e-12 (the grill 45 floor) u* v* carry no color, and the inverse is
// ill-conditioned there. Lchuv likewise, plus its borrowed 0.0015 grey threshold.
const luv: Comparison = { canonical: (c) => (Math.abs(at(c, 0)) < 1e-12 ? [at(c, 0), NaN, NaN] : c) };
const lchuv: Comparison = {
  hueWeight: (c) => Math.abs(at(c, 1)),
  canonical: (c) => {
    if (Math.abs(at(c, 0)) < 1e-12) return [at(c, 0), NaN, NaN];
    return at(c, 1) <= 0.0015 ? [at(c, 0), at(c, 1), NaN] : c;
  },
};

// NaN marks a channel that doesn't affect the color here; comparisons skip it when either side is NaN.
// HSLuv / HPLuv: s and p scale the Lchuv65 chroma, so the hue weight is that chroma (as a fraction of
// L*'s 100) and the hue is free where it is ≤ 0.0015; at the black / white points s and p are free too.
function luvHue(max: (l: number, h: number) => number): Comparison {
  const chroma = (c: readonly number[]) => Math.abs(at(c, 1)) * max(at(c, 2) * 100, at(c, 0));
  return {
    hueWeight: (c) => chroma(c) / 100,
    canonical: (c) => {
      if (singular(at(c, 2) * 100) !== undefined) return [NaN, NaN, at(c, 2)];
      return chroma(c) <= 0.0015 ? [NaN, at(c, 1), at(c, 2)] : c;
    },
  };
}

// Okhsl / Okhsv: the hue weight is the Oklab chroma; the hue is free at Oklch's 0.000004, and s too where
// the conversion drops chroma (grill 59 and the 1e-12 floor).
function ok(model: ColorModel): Comparison {
  const chroma = (c: readonly number[]) => {
    if (c.some(Number.isNaN)) return 0;
    const lab = new model(...c).to(Oklab) as Oklab;
    return Math.hypot(lab.a, lab.b);
  };
  return {
    hueWeight: chroma,
    canonical: (c) => {
      const lightness = toeInv(at(c, 2));
      if (at(c, 2) <= 0 || lightness >= 1 || shapeless(lightness)) return [NaN, NaN, at(c, 2)];
      return chroma(c) <= 0.000004 ? [NaN, at(c, 1), at(c, 2)] : c;
    },
  };
}

// Appearance models (ADR-012): J = 0 is black whatever M and h say; the hue is free at M ≤ 0.00105.
const jmh: Comparison = {
  hueWeight: (c) => Math.abs(at(c, 1)),
  canonical: (c) => {
    if (Math.abs(at(c, 0)) < 1e-12) return [at(c, 0), NaN, NaN];
    return Math.abs(at(c, 1)) <= 105 / 100000 ? [at(c, 0), at(c, 1), NaN] : c;
  },
};
const ucs: Comparison = { canonical: (c) => (at(c, 0) === 0 ? [0, NaN, NaN] : c) };
const hct: Comparison = {
  hueWeight: (c) => Math.abs(at(c, 1)),
  canonical: (c) => {
    if (Math.abs(lightnessToY(at(c, 2))) < 1e-12) return [NaN, NaN, at(c, 2)];
    return Math.abs(at(c, 1)) * Cam16.env.flRoot <= 105 / 100000 ? [NaN, at(c, 1), at(c, 2)] : c;
  },
};

export const comparisons = new Map<ColorModel, Comparison>([
  [Luv65, luv],
  [Luv50, luv],
  [Lchuv65, lchuv],
  [Lchuv50, lchuv],
  [Hsluv, luvHue(maxChromaForHue)],
  [Hpluv, luvHue((l) => maxChroma(l))],
  [
    Jzczhz,
    {
      hueWeight: (c) => Math.abs(at(c, 1)),
      canonical: (c) => (at(c, 1) <= 0.0000026 ? [at(c, 0), at(c, 1), NaN] : c),
    },
  ],
  [Cam16, jmh],
  [Ciecam02, jmh],
  [Cam16Ucs, ucs],
  [Cam16Lcd, ucs],
  [Cam16Scd, ucs],
  [Hct, hct],
  [Okhsl, ok(Okhsl)],
  [Okhsv, ok(Okhsv)],
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
        // Grill 45: an sRGB chroma below 1e-12 converts as grey.
        if (l <= 0 || l >= 1 || 2 * Math.abs(s) * Math.min(l, 1 - l) < 1e-12) return [NaN, NaN, l];
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
        if (v <= 0 || Math.abs(s) * v < 1e-12) return [NaN, NaN, v];
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

const RECTANGULAR = [
  "xyz-d65",
  "xyz-d50",
  "srgb-linear",
  "srgb",
  "display-p3",
  "display-p3-linear",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "oklab",
  "lab",
];

/**
 * Round trips that hold for every real triple, tested again over 3× the reference ranges: the
 * rectangular models among themselves, and out-of-gamut sRGB through HSL (CSS Color 4 `rgbToHsl`
 * rotates negative saturation for exactly this, csswg-drafts #9222). HWB is left out (the spec notes
 * "No round-tripping of oog colors, unlike HSL"), and so is HSV, which no source defines out of gamut.
 * Luv too: it stores chromaticity times L*, so XYZ with Y near 0 and X ≠ 0 loses v′ below vn's precision.
 */
export function extended(from: string, via: string): boolean {
  if (RECTANGULAR.includes(from) && RECTANGULAR.includes(via)) return true;
  return from === "srgb" && via === "hsl";
}
