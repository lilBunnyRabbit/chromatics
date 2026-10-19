export type Matrix = readonly (readonly [number, number, number])[];

// Neumaier-compensated sum of three products. A plain left-to-right sum rounds sRGB white's Y to
// 0.9999999999999999, although the exact sum of the matrix row's doubles is 1 − 1.4e-17 (rounds to 1).
function dot(row: readonly [number, number, number], a: number, b: number, c: number): number {
  const p0 = row[0] * a;
  const p1 = row[1] * b;
  const p2 = row[2] * c;
  let sum = p0;
  let err = 0;
  for (const p of [p1, p2]) {
    const t = sum + p;
    err += Math.abs(sum) >= Math.abs(p) ? sum - t + p : p - t + sum;
    sum = t;
  }
  return sum + err;
}

export function multiply(m: Matrix, a: number, b: number, c: number): [number, number, number] {
  return [dot(m[0]!, a, b, c), dot(m[1]!, a, b, c), dot(m[2]!, a, b, c)];
}
