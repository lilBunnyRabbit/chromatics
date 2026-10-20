// SMPTE 170M-2004 Table A.1 (100/7.5/100/7.5 bars, to 1e-4 IRE). Per Annex A eq. 10 the composite is
// 0.925·Y + 7.5 plus 0.925·(b − y)·sin + 0.925·(r − y)·cos, in IRE for R′G′B′ of 100: so luminance =
// 92.5·Y′ + 7.5, chroma level (peak to peak) = 2 · 92.5 · |(u, v)|, phase = atan2(v, u).
export const BARS = [
  ["yellow", [1, 1, 0], 89.455, 82.7567, 167.0812],
  ["cyan", [0, 1, 1], 72.3425, 116.9817, 283.4558],
  ["green", [0, 1, 0], 61.7972, 109.2338, 240.7098],
  ["magenta", [1, 0, 1], 45.7025, 109.2338, 60.7098],
  ["red", [1, 0, 0], 35.1575, 116.9817, 103.4558],
  ["blue", [0, 0, 1], 18.045, 82.7567, 347.0812],
] as const;

// Table A.1 prints green's luminance as 61.7972; its own Y′ weight 0.587 gives 61.7975 (red 35.1575 and blue
// 18.0450 match 0.299 and 0.114 exactly, and the three sum to 100 only with 61.7975). The tolerance covers it.
export const LUMINANCE_TOLERANCE = 3.5e-4;
