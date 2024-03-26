export * from "./Matrix";
export * from "./type.util";

export function clamp(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}

export function roundAndClamp(value: number, min: number, max: number) {
  return clamp(Math.round(value), min, max);
}

export function round(value: number, decimals: number) {
  return Number.parseFloat(value.toFixed(decimals));
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
