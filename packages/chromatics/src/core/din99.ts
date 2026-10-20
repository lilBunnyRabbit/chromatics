// The DIN99 family: CIELAB (D65) compressed by a log in lightness and chroma and rotated by an angle.
// Parameters c1–c8 as colour-science `colour/models/din99.py` @ 248121e3 lays them out (from DIN 6176:2001 and
// ASTM D2244-07, Cui et al. 2002), with k_E = k_CH = 1.
export interface Din99Parameters {
  readonly c1: number;
  readonly c2: number;
  readonly c3: number;
  readonly c4: number;
  readonly c5: number;
  readonly c6: number;
  readonly c7: number;
  readonly c8: number;
}

const RAD = Math.PI / 180;

export function fromLab(p: Din99Parameters, l: number, a: number, b: number): [l: number, a: number, b: number] {
  const cos = Math.cos(p.c3 * RAD);
  const sin = Math.sin(p.c3 * RAD);
  const e = cos * a + sin * b;
  const f = p.c4 * (-sin * a + cos * b);
  const g = Math.hypot(e, f);
  const h = Math.atan2(f, e) + p.c7 * RAD;
  const c = (p.c5 * Math.log1p(p.c6 * g)) / p.c8;
  return [p.c1 * Math.sign(l) * Math.log1p(p.c2 * Math.abs(l)), c * Math.cos(h), c * Math.sin(h)];
}

export function toLab(p: Din99Parameters, l: number, a: number, b: number): [l: number, a: number, b: number] {
  const c = Math.hypot(a, b);
  const h = Math.atan2(b, a) - p.c7 * RAD;
  const g = Math.expm1((p.c8 * c) / p.c5) / p.c6;
  const e = g * Math.cos(h);
  const f = g * Math.sin(h);
  const cos = Math.cos(p.c3 * RAD);
  const sin = Math.sin(p.c3 * RAD);
  return [
    (Math.sign(l) * Math.expm1(Math.abs(l) / p.c1)) / p.c2,
    e * cos - (f / p.c4) * sin,
    e * sin + (f / p.c4) * cos,
  ];
}

// colour-science `DIN99_METHODS["DIN99"]` (DIN 6176:2001, ASTM D2244-07).
export const DIN99: Din99Parameters = { c1: 105.509, c2: 0.0158, c3: 16, c4: 0.7, c5: 1, c6: 0.045, c7: 0, c8: 0.045 };

// DIN99o (Cui et al. 2002, as de.wikipedia "DIN99-Farbraum" and culori 4.0.2 `dlch`): 100 / ln 1.39 makes
// white exactly 100; C = ln(1 + 0.075 G) / 0.0435, hue rotated by 26°.
export const DIN99O: Din99Parameters = {
  c1: 100 / Math.log(1.39),
  c2: 0.0039,
  c3: 26,
  c4: 0.83,
  c5: 1 / 0.0435,
  c6: 0.075,
  c7: 26,
  c8: 1,
};
