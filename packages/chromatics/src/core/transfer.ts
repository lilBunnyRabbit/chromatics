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

// CSS Color 4 sample code `lin_a98rgb` / `gam_a98rgb`: a pure power 563/256, mirrored for negatives.
export function a98ToLinear(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 563 / 256);
}

export function linearToA98(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 256 / 563);
}

// CSS Color 4 sample code `lin_ProPhoto` / `gam_ProPhoto`: gamma 1.8 with a linear segment near 0
// (slope 16 up to 16/512 encoded, 1/512 linear), mirrored for negatives.
export function prophotoToLinear(v: number): number {
  const abs = Math.abs(v);
  if (abs <= 16 / 512) return v / 16;
  return Math.sign(v) * Math.pow(abs, 1.8);
}

export function linearToProphoto(v: number): number {
  const abs = Math.abs(v);
  if (abs >= 1 / 512) return Math.sign(v) * Math.pow(abs, 1 / 1.8);
  return 16 * v;
}

// CSS Color 4 sample code `lin_2020` / `gam_2020`: the ITU-R BT.1886 reference EOTF (gamma 2.4, black
// lift 0, gain 1) over the extended range.
export function rec2020ToLinear(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 2.4);
}

export function linearToRec2020(v: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), 1 / 2.4);
}
