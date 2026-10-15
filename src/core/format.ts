// Indonesian number formatting for on-screen text: dot thousands, comma decimals.
// Rp 5.000.000 · Rp 1,17 miliar · 15,6% · 6.043

const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dec = (x: number, digits: number) => x.toFixed(digits).replace('.', ',');

export const fmt = {
  /** Rp 1.168.051.283 */
  rp: (n: number) => `Rp ${group(n)}`,
  /** 6.043 (index points, lots, plain counts) */
  num: (n: number) => group(n),
  /** 15,6% (unsigned) */
  pct: (x: number, digits = 1) => `${dec(Math.abs(x) * 100, digits)}%`,
  /** +15,6% / −1,6% */
  signedPct: (x: number, digits = 1) => `${x >= 0 ? '+' : '−'}${dec(Math.abs(x) * 100, digits)}%`,
  /** Axis ticks: 250 jt, 1,2 M */
  axis: (n: number) => (n >= 1e9 ? `${dec(n / 1e9, n % 1e9 === 0 ? 0 : 1)} M` : `${Math.round(n / 1e6)} jt`),
  /** Rp 1,17 miliar · Rp 536 juta */
  words: (n: number) => (n >= 1e9 ? `Rp ${dec(n / 1e9, 2)} miliar` : `Rp ${Math.round(n / 1e6)} juta`),
  /** Rp 5,3 juta · Rp 6,34 juta · Rp 19 juta (juta with a chosen number of decimals) */
  juta: (n: number, digits = 1) => `Rp ${dec(n / 1e6, digits)} juta`,
};

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
/** "2025-12" → "DES 2025" */
export const monthLabel = (ym: string) => `${MON[Number(ym.slice(5)) - 1]} ${ym.slice(0, 4)}`;
export const monthShort = (ym: string) => MON[Number(ym.slice(5)) - 1];
/** "2026-10-09" → "9 OKT 2026" */
export const dateLabel = (iso: string) => `${Number(iso.slice(8, 10))} ${MON[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
