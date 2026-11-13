// WCAG 2.2 SC 1.4.3 (Contrast, Minimum, AA): 4.5 for text, 3 for large text; SC 1.4.6 (Enhanced, AAA): 7 and 4.5.
const WCAG_TARGETS: Record<string, number> = {
  aa: 4.5,
  aaa: 7,
  "aa-large": 3,
  "aaa-large": 4.5,
};

/**
 * The ratio an `ensureContrast` target names: `"AA"` 4.5, `"AAA"` 7, `"AA-large"` 3, `"AAA-large"` 4.5 (case and
 * space insensitive), or a ratio 1–21 as is.
 *
 * @throws {Error} on an unknown name or a ratio outside [1, 21] (or `NaN`).
 * @see https://www.w3.org/TR/WCAG22/#contrast-minimum
 */
export function wcagTargetRatio(target: string | number): number {
  if (typeof target === "number") {
    if (!(target >= 1 && target <= 21)) {
      throw new Error(`contrast target must be a ratio 1–21 or "AA"/"AAA", got ${target}`);
    }
    return target;
  }
  const ratio = WCAG_TARGETS[target.trim().toLowerCase().replace(/\s+/g, "-")];
  if (ratio === undefined) {
    throw new Error(`unknown contrast target "${target}" — use "AA", "AAA", "AA-large", "AAA-large", or a ratio 1–21`);
  }
  return ratio;
}
