export type Pt = [number, number];

export const linePath = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');

/** Closed polygon between an upper and a lower polyline sharing x positions. */
export const bandPath = (upper: Pt[], lower: Pt[]) =>
  `${linePath(upper)}${[...lower].reverse().map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join('')}Z`;

/**
 * Gridline levels on a doubling chain so finer levels fade out (instead of popping)
 * as the axis zooms out. Returns each tick value with its opacity.
 */
export const fadingTicks = (yMax: number, plotH: number, base: number, levels: number, minPx = 60, fullPx = 115) => {
  const steps = Array.from({length: levels}, (_, k) => base * 2 ** k);
  const alpha = (s: number) => Math.max(0, Math.min(1, ((s / yMax) * plotH - minPx) / (fullPx - minPx)));
  const ticks: {v: number; a: number}[] = [];
  for (let v = base; v <= yMax; v += base) {
    const coarsest = [...steps].reverse().find((s) => Math.abs(v / s - Math.round(v / s)) < 1e-9)!;
    const a = alpha(coarsest);
    if (a > 0.01) ticks.push({v, a});
  }
  return ticks;
};
