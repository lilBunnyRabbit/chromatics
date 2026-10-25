// CSS Color 4 sample code `Lab_to_LCH` / `OKLab_to_OKLCH`, with grey hue 0 instead of NaN (ADR-003).
export function toPolar(a: number, b: number, achromatic: number): [c: number, h: number] {
  // hypot, not sqrt(a² + b²): the squares overflow above 1.3e154 while the chroma itself still fits (grill 32).
  const c = Math.hypot(a, b);
  if (c <= achromatic) return [c, 0];
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return [c, h < 0 ? h + 360 : h];
}

// CSS Color 4 sample code `LCH_to_Lab` / `OKLCH_to_OKLab`.
export function fromPolar(c: number, h: number): [a: number, b: number] {
  const rad = (h * Math.PI) / 180;
  return [c * Math.cos(rad), c * Math.sin(rad)];
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}
