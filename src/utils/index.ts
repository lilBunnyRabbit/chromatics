export * from "./Matrix";

export function clamp(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}

export function clamp01(value: number) {
  return clamp(value, 0, 1);
}

export function roundAndClamp(value: number, min: number, max: number) {
  return clamp(Math.round(value), min, max);
}

export function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

export function randomNumber(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function timeExecution(cb: () => any) {
  const start = performance.now();

  cb();

  return performance.now() - start;
}

/**
 * Returns a random floating-point number between min (inclusive) and max (exclusive).
 * @param min - The lower bound (inclusive)
 * @param max - The upper bound (exclusive)
 * @throws Error if min is not less than max.
 */
export function randomFloat(min: number, max: number): number {
  if (min >= max) {
    throw new Error("min must be less than max");
  }
  return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min and max, both inclusive.
 * @param min - The lower bound (inclusive)
 * @param max - The upper bound (inclusive)
 * @throws Error if min is greater than max.
 */
export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error("min must be less than or equal to max");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
