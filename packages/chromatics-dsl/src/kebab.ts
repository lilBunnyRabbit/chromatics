/** `primaryFg` / `primary_fg` / `primary fg` → `primary-fg`: the CSS custom-property form of a name. */
export function kebab(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
