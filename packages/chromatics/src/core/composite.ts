/**
 * Porter-Duff source-over (CSS Compositing and Blending 1 §5.1 "Simple alpha compositing", §9.1.4):
 * αo = αs + αb·(1 − αs), co = cs·αs + cb·αb·(1 − αs), and the result color is co / αo. A fully
 * transparent result has no color; its channels are 0. Channels and alphas are used as given: nothing
 * clamps (ADR-003).
 */
export function sourceOver(
  source: readonly number[],
  sourceAlpha: number,
  backdrop: readonly number[],
  backdropAlpha: number
): [channels: number[], alpha: number] {
  const alpha = sourceAlpha + backdropAlpha * (1 - sourceAlpha);
  const channels = source.map((cs, i) => {
    const co = cs * sourceAlpha + backdrop[i]! * backdropAlpha * (1 - sourceAlpha);
    return alpha === 0 ? 0 : co / alpha;
  });
  return [channels, alpha];
}
