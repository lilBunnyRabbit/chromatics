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
