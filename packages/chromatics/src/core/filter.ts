/** The color filter functions of CSS Filter Effects 1 §6.1 (blur, drop-shadow and opacity aren't color maps). */
export type FilterName = "grayscale" | "sepia" | "saturate" | "hue-rotate" | "invert" | "brightness" | "contrast";

type Rgb = [r: number, g: number, b: number];

const RAD = Math.PI / 180;

type Matrix = readonly [Rgb, Rgb, Rgb];

function matrix(m: Matrix, [r, g, b]: Rgb): Rgb {
  return m.map(([x, y, z]) => x * r + y * g + z * b) as Rgb;
}

// §6.1: "Negative values are not allowed" for every function but hue-rotate; for grayscale, sepia and
// invert "values of amount over 100% are allowed but UAs must clamp the values to 1".
function amountOf(name: FilterName, amount: number): number {
  if (!Number.isFinite(amount)) throw new RangeError(`${name}: amount must be finite, got ${amount}`);
  if (name === "hue-rotate") return amount;
  if (amount < 0) throw new RangeError(`${name}: amount must be ≥ 0 (CSS Filter Effects 1 §6.1), got ${amount}`);
  return name === "grayscale" || name === "sepia" || name === "invert" ? Math.min(amount, 1) : amount;
}

// Filter Effects 1 §13.1 "Filter primitive representation": the feColorMatrix values and
// feComponentTransfer functions each shorthand equals. `a` is the amount after amountOf().
export function applyFilter(name: FilterName, amount: number, rgb: Rgb): Rgb {
  const a = amountOf(name, amount);
  switch (name) {
    case "grayscale": {
      const k = 1 - a;
      return matrix(
        [
          [0.2126 + 0.7874 * k, 0.7152 - 0.7152 * k, 0.0722 - 0.0722 * k],
          [0.2126 - 0.2126 * k, 0.7152 + 0.2848 * k, 0.0722 - 0.0722 * k],
          [0.2126 - 0.2126 * k, 0.7152 - 0.7152 * k, 0.0722 + 0.9278 * k],
        ],
        rgb
      );
    }
    case "sepia": {
      const k = 1 - a;
      return matrix(
        [
          [0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k],
          [0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k],
          [0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k],
        ],
        rgb
      );
    }
    // feColorMatrix type="saturate" (Filter Effects 1 §9.6).
    case "saturate":
      return matrix(
        [
          [0.213 + 0.787 * a, 0.715 - 0.715 * a, 0.072 - 0.072 * a],
          [0.213 - 0.213 * a, 0.715 + 0.285 * a, 0.072 - 0.072 * a],
          [0.213 - 0.213 * a, 0.715 - 0.715 * a, 0.072 + 0.928 * a],
        ],
        rgb
      );
    // feColorMatrix type="hueRotate" (§9.6), the angle in degrees.
    case "hue-rotate": {
      const cos = Math.cos(a * RAD);
      const sin = Math.sin(a * RAD);
      return matrix(
        [
          [0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928],
          [0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.14, 0.072 - cos * 0.072 - sin * 0.283],
          [0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072],
        ],
        rgb
      );
    }
    // feFuncX type="table" tableValues="[amount] (1 - [amount])": C' = a + C·(1 − 2a).
    case "invert":
      return rgb.map((c) => a + c * (1 - 2 * a)) as Rgb;
    // feFuncX type="linear" slope="[amount]".
    case "brightness":
      return rgb.map((c) => c * a) as Rgb;
    // feFuncX type="linear" slope="[amount]" intercept="-(0.5 * [amount]) + 0.5".
    case "contrast":
      return rgb.map((c) => c * a - 0.5 * a + 0.5) as Rgb;
  }
}
