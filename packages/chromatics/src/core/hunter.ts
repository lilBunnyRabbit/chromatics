// Hunter L, a, b (Hunter 1958) as colour-science `colour/models/hunter_lab.py` @ 248121e3 writes it, with Ka and
// Kb from the white by its `XYZ_to_K_ab_HunterLab1966`: Ka = 175·√(Xn / 98.043), Kb = 70·√(Zn / 118.115) on a 0–100
// scale. The primary HunterLab notes couldn't be reached (ADR-013).
import type { White } from "./luv.js";

function k(white: White): [ka: number, kb: number] {
  return [175 * Math.sqrt((100 * white[0]) / 98.043), 70 * Math.sqrt((100 * white[2]) / 118.115)];
}

export function fromXyz(x: number, y: number, z: number, white: White): [l: number, a: number, b: number] {
  const [ka, kb] = k(white);
  const yy = y / white[1];
  const root = Math.sign(yy) * Math.sqrt(Math.abs(yy));
  // Below the grill 45 floor a and b divide by an underflowing √Y; their color is invisible there.
  if (Math.abs(y) < 1e-12) return [100 * root, 0, 0];
  return [100 * root, (ka * (x / white[0] - yy)) / root, (kb * (yy - z / white[2])) / root];
}

export function toXyz(l: number, a: number, b: number, white: White): [x: number, y: number, z: number] {
  const [ka, kb] = k(white);
  const root = l / 100;
  const yy = Math.sign(root) * root * root;
  if (Math.abs(yy * white[1]) < 1e-12) return [white[0] * yy, white[1] * yy, white[2] * yy];
  return [white[0] * ((a * root) / ka + yy), white[1] * yy, white[2] * (yy - (b * root) / kb)];
}
