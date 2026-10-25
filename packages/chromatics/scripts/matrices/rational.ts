export class Rational {
  readonly num: bigint;
  readonly den: bigint;

  private constructor(num: bigint, den: bigint) {
    if (den === 0n) throw new RangeError("Rational with zero denominator");
    const sign = den < 0n ? -1n : 1n;
    const g = gcd(num < 0n ? -num : num, den < 0n ? -den : den);
    this.num = (sign * num) / g;
    this.den = (sign * den) / g;
  }

  static of(num: bigint | number, den: bigint | number = 1n): Rational {
    return new Rational(BigInt(num), BigInt(den));
  }

  static decimal(literal: string): Rational {
    const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(literal);
    if (!match) throw new SyntaxError(`Not a decimal literal: ${literal}`);
    const [, sign = "", whole = "0", fraction = ""] = match;
    const num = BigInt(`${sign}${whole}${fraction}`);
    return new Rational(num, 10n ** BigInt(fraction.length));
  }

  add(o: Rational): Rational {
    return new Rational(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(o: Rational): Rational {
    return new Rational(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(o: Rational): Rational {
    return new Rational(this.num * o.num, this.den * o.den);
  }

  div(o: Rational): Rational {
    return new Rational(this.num * o.den, this.den * o.num);
  }

  equals(o: Rational): boolean {
    return this.num === o.num && this.den === o.den;
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  // Number() parses decimal strings with correct rounding; 40 digits can only misround within 1e-40 of a tie.
  toNumber(): number {
    if (this.num === 0n) return 0;
    const negative = this.num < 0n;
    const n = negative ? -this.num : this.num;
    let exponent = n.toString().length - this.den.toString().length;
    const digits = 40;
    const shift = digits - exponent;
    const scaled = shift >= 0 ? (n * 10n ** BigInt(shift)) / this.den : n / (this.den * 10n ** BigInt(-shift));
    const text = scaled.toString();
    exponent += text.length - digits - 1;
    return Number(`${negative ? "-" : ""}${text[0]}.${text.slice(1)}e${exponent}`);
  }

  toString(): string {
    return this.den === 1n ? `${this.num}` : `${this.num}/${this.den}`;
  }
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
}

export type Matrix3 = readonly [
  readonly [Rational, Rational, Rational],
  readonly [Rational, Rational, Rational],
  readonly [Rational, Rational, Rational],
];
export type Vector3 = readonly [Rational, Rational, Rational];

export function multiply(a: Matrix3, b: Matrix3): Matrix3 {
  const cell = (i: 0 | 1 | 2, j: 0 | 1 | 2) => a[i][0].mul(b[0][j]).add(a[i][1].mul(b[1][j])).add(a[i][2].mul(b[2][j]));
  return [
    [cell(0, 0), cell(0, 1), cell(0, 2)],
    [cell(1, 0), cell(1, 1), cell(1, 2)],
    [cell(2, 0), cell(2, 1), cell(2, 2)],
  ];
}

export function apply(m: Matrix3, v: Vector3): Vector3 {
  const row = (i: 0 | 1 | 2) => m[i][0].mul(v[0]).add(m[i][1].mul(v[1])).add(m[i][2].mul(v[2]));
  return [row(0), row(1), row(2)];
}

export function diagonal(v: Vector3): Matrix3 {
  const z = Rational.of(0);
  return [
    [v[0], z, z],
    [z, v[1], z],
    [z, z, v[2]],
  ];
}

export function invert(m: Matrix3): Matrix3 {
  const [[a, b, c], [d, e, f], [g, h, i]] = m;
  const A = e.mul(i).sub(f.mul(h));
  const B = f.mul(g).sub(d.mul(i));
  const C = d.mul(h).sub(e.mul(g));
  const det = a.mul(A).add(b.mul(B)).add(c.mul(C));
  if (det.isZero()) throw new RangeError("Singular matrix");
  const k = (x: Rational) => x.div(det);
  return [
    [k(A), k(c.mul(h).sub(b.mul(i))), k(b.mul(f).sub(c.mul(e)))],
    [k(B), k(a.mul(i).sub(c.mul(g))), k(c.mul(d).sub(a.mul(f)))],
    [k(C), k(b.mul(g).sub(a.mul(h))), k(a.mul(e).sub(b.mul(d)))],
  ];
}
