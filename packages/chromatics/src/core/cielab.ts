import type { White } from "./luv.js";

// CSS Color 4 sample code `XYZ_to_Lab`: "from CIE standard, which now defines these as a rational fraction".
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

const POW25_7 = 25 ** 7;
const RAD = Math.PI / 180;

function hueDeg(b: number, a: number): number {
  if (a === 0 && b === 0) return 0;
  const h = Math.atan2(b, a) / RAD;
  return h < 0 ? h + 360 : h;
}

export interface LabLike {
  readonly l: number;
  readonly a: number;
  readonly b: number;
}

// CIEDE2000 (CIE 142-2001) in the form of Sharma, Wu & Dalal (2005), including their notes on the
// hue mean and difference when a chroma is 0.
export function deltaE2000(x: LabLike, y: LabLike): number {
  const c1 = Math.hypot(x.a, x.b);
  const c2 = Math.hypot(y.a, y.b);
  const cBar7 = ((c1 + c2) / 2) ** 7;
  const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + POW25_7)));
  const a1 = (1 + g) * x.a;
  const a2 = (1 + g) * y.a;
  const c1p = Math.hypot(a1, x.b);
  const c2p = Math.hypot(a2, y.b);
  const h1p = hueDeg(x.b, a1);
  const h2p = hueDeg(y.b, a2);
  const dL = y.l - x.l;
  const dC = c2p - c1p;
  let dh = 0;
  if (c1p * c2p !== 0) {
    dh = h2p - h1p;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(c1p * c2p) * Math.sin((dh / 2) * RAD);
  const lBar = (x.l + y.l) / 2;
  const cBarP = (c1p + c2p) / 2;
  let hBar = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hBar /= 2;
    else hBar = hBar < 360 ? (hBar + 360) / 2 : (hBar - 360) / 2;
  }
  const t =
    1 -
    0.17 * Math.cos((hBar - 30) * RAD) +
    0.24 * Math.cos(2 * hBar * RAD) +
    0.32 * Math.cos((3 * hBar + 6) * RAD) -
    0.2 * Math.cos((4 * hBar - 63) * RAD);
  const dTheta = 30 * Math.exp(-(((hBar - 275) / 25) ** 2));
  const cBarP7 = cBarP ** 7;
  const rC = 2 * Math.sqrt(cBarP7 / (cBarP7 + POW25_7));
  const l50 = (lBar - 50) ** 2;
  const sL = 1 + (0.015 * l50) / Math.sqrt(20 + l50);
  const sC = 1 + 0.045 * cBarP;
  const sH = 1 + 0.015 * cBarP * t;
  const rT = -Math.sin(2 * dTheta * RAD) * rC;
  const l = dL / sL;
  const c = dC / sC;
  const h = dH / sH;
  return Math.sqrt(l * l + c * c + h * h + rT * c * h);
}

function f(v: number): number {
  return v > EPSILON ? Math.cbrt(v) : (KAPPA * v + 16) / 116;
}

export function xyzToLab(x: number, y: number, z: number, white: White): [l: number, a: number, b: number] {
  const fx = f(x / white[0]);
  const fy = f(y / white[1]);
  const fz = f(z / white[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// CSS Color 4 sample code `Lab_to_XYZ`.
export function labToXyz(l: number, a: number, b: number, white: White): [x: number, y: number, z: number] {
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const x = fx ** 3 > EPSILON ? fx ** 3 : (116 * fx - 16) / KAPPA;
  const y = l > KAPPA * EPSILON ? fy ** 3 : l / KAPPA;
  const z = fz ** 3 > EPSILON ? fz ** 3 : (116 * fz - 16) / KAPPA;
  return [x * white[0], y * white[1], z * white[2]];
}
