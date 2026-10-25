// Grill 45: below this sRGB chroma (max − min) a color is grey. Grey from other spaces reaches sRGB with
// ~1e-16 of noise, and HSL's saturation divides by min(l, 1 − l) ≈ 1e-16 at white, turning that noise
// into 50% saturation. 1e-12 sits far above measured noise (≤ 1e-15) and far below visibility.
export const GREY_NOISE = 1e-12;

// CSS Color 4 sample code `rgbToHue` (rgbToHwb.js), returning 0 instead of NaN when max === min.
export function rgbToHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h >= 360 ? h - 360 : h;
}

// CSS Color 4 sample code `hslToRgb`, taking s and l as 0–1 fractions instead of 0–100.
export function hslToRgb(h: number, s: number, l: number): [r: number, g: number, b: number] {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}
