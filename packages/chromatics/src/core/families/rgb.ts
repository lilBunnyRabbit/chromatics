import { Oklab } from "../../models/oklab/oklab.js";
import { Oklch } from "../../models/oklch/oklch.js";
import type { ColorModel } from "../model.js";
import { RectangularColor } from "./rectangular.js";

/** Options for `gamutMap()`. */
export interface GamutMapOptions {
  /**
   * `"css4"` (default): CSS Color 4 Binary Search with Local MINDE, chroma reduction at constant
   * OkLCh lightness and hue. `"clip"`: clamp each channel, same as `clamp()`.
   */
  readonly method?: "css4" | "clip";
}

// CSS Color 4 #GMA-Binary-local-MINDE: "one JND is an OkLCh difference of 0.02"; search epsilon 0.0001.
const JND = 0.02;
const EPSILON = 0.0001;

// CSS Color 4 #color-difference-OK: Euclidean distance in Oklab.
function deltaEOk(a: Oklch, b: Oklch): number {
  const x = a.to(Oklab);
  const y = b.to(Oklab);
  return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b);
}

/**
 * RGB spaces with a 0–1 gamut (sRGB, linear sRGB, Display P3): gamut checks and mapping on top of
 * per-channel interpolation. Internal (grill 42).
 */
export abstract class RgbColor extends RectangularColor {
  /**
   * `true` when every channel is within [0, 1], give or take `tolerance` (default 7.5e-5, ADR-003: it
   * absorbs CSS strings rounded to 3 decimals and float noise).
   */
  inGamut(tolerance = 7.5e-5): boolean {
    return this.coords.every((v) => v >= -tolerance && v <= 1 + tolerance);
  }

  /** Clamps every channel into [0, 1] and returns this color (mutates). Alpha is untouched. Hue can shift; see `gamutMap()`. */
  clamp(): this {
    return this.assign(
      this.coords.map((v) => (v < 0 ? 0 : v > 1 ? 1 : v)),
      this.alpha
    );
  }

  /**
   * Brings this color into gamut and returns it (mutates). The default follows CSS Color 4 (what
   * browsers do): lower OkLCh chroma at constant lightness and hue until clipping is no longer
   * noticeable (ΔEOK < 0.02). In-gamut colors are unchanged; every result is within [0, 1].
   *
   * @example
   * ```ts
   * new Oklch(0.8, 0.35, 140).to(Srgb).gamutMap().to(Srgb8).toHex();
   * ```
   */
  gamutMap(options: GamutMapOptions = {}): this {
    if (options.method === "clip" || this.inGamut(0)) return this.clamp();
    const model = this.constructor as ColorModel<this>;
    const alpha = this.alpha;
    const origin = this.to(Oklch);
    const fromOklch = (c: Oklch) => c.to(model).clamp();
    // CSS converts oklab(1 0 0) / oklab(0 0 0). Every RGB space here maps Oklab's white to 1 per channel
    // (ProPhoto's D50 through Bradford), so return that exactly, without ~1e-15 of matrix noise.
    if (origin.l >= 1) return this.assign([1, 1, 1], alpha);
    if (origin.l <= 0) return this.assign([0, 0, 0], alpha);
    const inGamut = (c: Oklch) => (c.to(model) as RgbColor).inGamut(0);
    const clip = (c: Oklch) => fromOklch(c).to(Oklch);
    const current = origin.clone();
    let clipped = clip(current);
    if (deltaEOk(clipped, current) < JND) return this.assign(clipped.to(model).clamp().coords, alpha);
    let min = 0;
    let max = origin.c;
    let minInGamut = true;
    while (max - min > EPSILON) {
      const chroma = (min + max) / 2;
      current.c = chroma;
      if (minInGamut && inGamut(current)) {
        min = chroma;
        continue;
      }
      clipped = clip(current);
      const e = deltaEOk(clipped, current);
      if (e < JND) {
        if (JND - e < EPSILON) break;
        minInGamut = false;
        min = chroma;
      } else {
        max = chroma;
      }
    }
    return this.assign(clipped.to(model).clamp().coords, alpha);
  }
}
