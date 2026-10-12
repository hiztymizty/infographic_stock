import raw from './data/dca.json';

export type Month = {ym: string; open: number; close: number; invested: number; value: number};

type Dca = {
  monthly: number;
  source: string;
  asOf: string;
  units: number;
  avgPrice: number;
  todayPrice: number;
  invested: number;
  value: number;
  annualized: number;
  peak: Month & {annualized: number};
  worst: Month;
  indexPeak: Month;
  months: Month[];
};

export const DCA = raw as Dca;
export const MONTHS = DCA.months;
export const N = MONTHS.length;

export const idx = (ym: string) => {
  const i = MONTHS.findIndex((m) => m.ym === ym);
  if (i < 0) throw new Error(`No month ${ym} in dataset`);
  return i;
};

/** Linear interpolation of a field at a fractional month index. */
export const at = (m: number, key: 'invested' | 'value' | 'close') => {
  const c = Math.max(0, Math.min(N - 1, m));
  const i = Math.floor(c);
  const j = Math.min(N - 1, i + 1);
  return MONTHS[i][key] + (MONTHS[j][key] - MONTHS[i][key]) * (c - i);
};
