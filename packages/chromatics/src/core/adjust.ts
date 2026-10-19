import type { Color } from "./color.js";
import type { ColorModel } from "./model.js";
import { stepCount } from "./interpolate.js";

/** Options for `ramp()`. */
export interface RampOptions {
  /** Lightness of the first step, as a fraction of the lightness range. Default 0.05. */
  readonly from?: number;
  /** Lightness of the last step, as a fraction of the lightness range. Default 0.95. */
  readonly to?: number;
}

function span(color: Color, channel: string): [min: number, size: number] {
  const [min, max] = (color.constructor as ColorModel).channels[channel]!.range;
  return [min, max - min];
}

// Grill 33: the amount is a fraction of the channel's reference range, so `lighten(0.1)` means the same
// share in every model (+0.1 in Oklch, +10 in Lab). Nothing clamps (ADR-003).
export function shift<C extends Color>(color: C, channel: string, fraction: number): C {
  const target = color as unknown as Record<string, number>;
  target[channel] = target[channel]! + fraction * span(color, channel)[1];
  return color;
}

// Grill 40–41: evenly spaced lightness between `from` and `to`, other channels kept, no gamut mapping.
export function ramp<C extends Color>(color: C, channel: string, n: number, options: RampOptions): C[] {
  stepCount(n);
  const [min, size] = span(color, channel);
  const from = options.from ?? 0.05;
  const to = options.to ?? 0.95;
  return Array.from({ length: n }, (_, i) => {
    const step = color.clone();
    const u = i / (n - 1);
    // Weighted from both ends so the first and last steps are exactly `from` and `to`.
    (step as unknown as Record<string, number>)[channel] = min + size * (from * (1 - u) + to * u);
    return step;
  });
}
