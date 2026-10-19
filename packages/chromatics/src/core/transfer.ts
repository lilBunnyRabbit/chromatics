// CSS Color 4 sample code `lin_sRGB`: the extended transfer function, mirrored for negative values so
// out-of-gamut channels survive a round trip.
export function srgbToLinear(v: number): number {
  const abs = Math.abs(v);
  if (abs <= 0.04045) return v / 12.92;
  return Math.sign(v) * Math.pow((abs + 0.055) / 1.055, 2.4);
}

// CSS Color 4 sample code `gam_sRGB`.
export function linearToSrgb(v: number): number {
  const abs = Math.abs(v);
  if (abs > 0.0031308) return Math.sign(v) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  return 12.92 * v;
}
