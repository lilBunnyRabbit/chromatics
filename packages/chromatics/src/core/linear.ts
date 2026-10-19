export type Matrix = readonly (readonly [number, number, number])[];

export function multiply(m: Matrix, a: number, b: number, c: number): [number, number, number] {
  const [r0, r1, r2] = m as readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
  ];
  return [r0[0] * a + r0[1] * b + r0[2] * c, r1[0] * a + r1[1] * b + r1[2] * c, r2[0] * a + r2[1] * b + r2[2] * c];
}
