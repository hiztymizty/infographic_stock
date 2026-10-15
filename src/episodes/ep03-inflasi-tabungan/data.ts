// Typed access to the analyst's data (episodes/ep03-inflasi-tabungan/analysis/build_data.py →
// data/inflasi.json). Never hand-edit the JSON; every on-screen number is derived from it here or in copy.ts.
import raw from './data/inflasi.json';

type Product = 'kas' | 'tabungan' | 'deposito_lps' | 'deposito_bi';
type YearProduct = {gross: number; net: number; realNet: number; valueNominal: number; valueReal2010: number};
type Summary = {
  valueNominal: number;
  valueReal2010: number;
  netPerYear: number;
  grossValueNominal: number;
  grossPerYear: number;
  realPerYear: number;
  realChange: number;
  grossValueReal2010: number;
};
export type Year = {year: number; months: number; inflation: number; priceFactor: number} & Record<Product, YearProduct>;

type Inflasi = {
  principal: number;
  tax: number;
  /** PP 131/2000: the 20% tax applies above this total balance (Rp 7.500.000). */
  taxThreshold: number;
  start: string;
  end: string;
  months: number;
  years: number;
  inflation: {
    decDec: Record<string, number>;
    ytd2026: number;
    yoySep2026: number;
    priceFactor: number;
    priceRise: number;
    needToday: number;
    realValueOf10jt: number;
    path: {ym: string; priceFactor: number; realValue: number}[];
  };
  summary: Record<Product, Summary>;
  beatInflationYears: Record<'tabungan' | 'deposito_lps' | 'deposito_bi', number>;
  beatInflationYearList: Record<'tabungan' | 'deposito_lps' | 'deposito_bi', number[]>;
  fullYears: number;
  snapshot: {
    inflationYoy: number;
    inflationMonth: string;
    lpsRate: number;
    lpsPeriod: [string, string];
    lpsNet: number;
    lpsNetMinusInflation: number;
  };
  yearly: Year[];
};

export const D = raw as unknown as Inflasi;
export const P0 = D.principal;
export const INF = D.inflation;
export const SUM = D.summary;
export const SNAP = D.snapshot;

/** The full calendar years compared one by one (2010–2025). */
export const FULL_YEARS = D.yearly.filter((y) => y.months === 12).map((y) => y.year);
export const yearsBeat = (k: 'tabungan' | 'deposito_lps') => D.beatInflationYearList[k];
