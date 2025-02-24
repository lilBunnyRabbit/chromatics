export type Constructor<T, Args extends any[] = any[]> = new (...args: Args) => T;

export interface ColorModel {
  clone(): this;
  equals(comparator: unknown): boolean;
  toString(...args: unknown[]): string;
  toCSS(...args: unknown[]): string;
}
