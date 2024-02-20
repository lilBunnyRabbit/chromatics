export function classNames<T extends Array<string | false | null | undefined>>(...classes: T): string {
  return classes.filter(Boolean).join(" ");
}

export const cx = classNames;
