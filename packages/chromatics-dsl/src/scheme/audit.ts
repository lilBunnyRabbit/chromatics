import { LinearSrgb, Srgb, type Color } from "@lilbunnyrabbit/chromatics";

/** A foreground / background role pair to measure. */
export interface AuditPair<R extends string = string> {
  label: string;
  fg: R;
  bg: R;
  /** The foreground's opacity, 0–1, composited over the background before measuring. */
  alpha?: number;
  /** Large text: WCAG's lower thresholds apply. Carried through, not used in the ratio. */
  large?: boolean;
}

/** A measured pair. */
export interface AuditRow<R extends string = string> extends AuditPair<R> {
  /** WCAG 2 contrast ratio, 1–21. */
  ratio: number;
}

/**
 * Measures each pair whose two roles have a color: WCAG 2 contrast (WCAG 2.2 #dfn-contrast-ratio) of the
 * foreground, composited at `alpha` in linear light when given, against the background. Pairs with an unbound
 * role are left out.
 */
export function audit<R extends string>(
  colors: Readonly<Partial<Record<R, Color>>>,
  pairs: readonly AuditPair<R>[]
): AuditRow<R>[] {
  const rows: AuditRow<R>[] = [];
  for (const pair of pairs) {
    const fg = colors[pair.fg];
    const bg = colors[pair.bg];
    if (!fg || !bg) continue;
    rows.push({ ...pair, ratio: contrast(fg, bg, pair.alpha) });
  }
  return rows;
}

/** WCAG 2 contrast of `fg` over `bg`, with `fg` at `alpha` (0–1) composited source-over in linear sRGB. */
export function contrast(fg: Color, bg: Color, alpha?: number): number {
  if (alpha === undefined || alpha >= 1) return fg.to(Srgb).contrast(bg.to(Srgb));
  const backdrop = bg.to(LinearSrgb);
  const shown = fg.to(LinearSrgb).set({ alpha }).over(backdrop);
  return shown.to(Srgb).contrast(backdrop.to(Srgb));
}
