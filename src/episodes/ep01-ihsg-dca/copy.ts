// All on-screen text for this episode (Bahasa, casual). Voiceover lives in
// episodes/ep01-ihsg-dca/script.json; numbers here are derived from the data, never typed in.
import {dateLabel, fmt, monthLabel} from '../../core/format';
import {DCA, MONTHS, idx} from './data';

const first = MONTHS[0];
const low = MONTHS[idx('2026-06')];

export const T = {
  hook: {
    kicker: `EKSPERIMEN ${Math.floor(MONTHS.length / 12)} TAHUN`,
    amount: fmt.rp(DCA.monthly),
    lines: ['tiap bulan', 'ke IHSG', 'sejak 2010.'],
    question: 'Sekarang jadi berapa?',
    note: '100.000',
  },
  rules: {
    kicker: 'DCA · DOLLAR COST AVERAGING',
    chips: [
      {big: fmt.rp(DCA.monthly), small: 'tiap bulan, jumlah sama'},
      {big: 'Nggak dijual', small: 'apa pun kondisinya'},
    ],
    total: (n: number) => `${n} BULAN · TOTAL MODAL`,
  },
  ihsg: {
    kicker: 'KENALAN DULU',
    title: 'IHSG',
    subtitle: 'Indeks Harga Saham Gabungan · data bulanan',
    start: {label: monthLabel(first.ym), value: fmt.num(first.close)},
    peak: {label: `${monthLabel(DCA.indexPeak.ym)} · PUNCAK`, value: fmt.num(DCA.indexPeak.close)},
    today: {label: 'HARI INI', value: fmt.num(DCA.todayPrice)},
    rise: fmt.signedPct(DCA.indexPeak.close / first.close - 1, 0),
    fall: fmt.signedPct(DCA.todayPrice / DCA.indexPeak.close - 1, 0),
  },
  journey: {
    invested: 'MODAL',
    value: 'NILAI INVESTASI',
    ret: 'UNTUNG/RUGI',
    today: 'HARI INI',
    events: {
      '2015-09': {title: '2015 · RUPIAH MELEMAH', sub: `untung tinggal ${fmt.signedPct(MONTHS[idx('2015-09')].value / MONTHS[idx('2015-09')].invested - 1)}`},
      '2020-03': {title: 'MAR 2020 · COVID-19', sub: 'sempat rugi'},
      '2021-12': {title: 'DES 2021', sub: 'tembus Rp 1 miliar'},
      '2025-12': {title: 'DES 2025 · PUNCAK', sub: fmt.words(DCA.peak.value)},
      '2026-06': {title: 'JUN 2026 · ANJLOK', sub: `IHSG ${fmt.signedPct(low.close / DCA.indexPeak.close - 1, 0)} dalam 6 bulan`},
    } as Record<string, {title: string; sub: string}>,
  },
  twist: {
    kicker: 'PLOT TWIST',
    peakLabel: `PUNCAK · ${monthLabel(DCA.peak.ym)}`,
    lowLabel: `TITIK TERENDAH · ${monthLabel(low.ym)}`,
    drop: (n: number) => `−${fmt.words(n)} dalam 6 bulan`,
  },
  result: {
    kicker: `HARI INI · ${dateLabel(DCA.asOf)}`,
    invested: 'Modal kamu',
    value: 'Nilainya sekarang',
    profit: (n: number) => `+${fmt.words(n)}`,
    total: 'TOTAL',
    annualLabel: 'setahun',
    annualNote: `waktu di puncak: ${fmt.pct(DCA.peak.annualized)} setahun`,
    avgLabel: 'Rata-rata kamu beli di',
    todayLabel: 'IHSG sekarang',
  },
  lesson: {
    kicker: 'PELAJARANNYA',
    lines: ['DCA bikin kamu', 'nggak pusing kapan beli,', 'tapi hasilnya tergantung', 'kapan kamu jual.'],
    question: 'Kamu tetap beli nggak waktu COVID?',
    disclaimer:
      `Cuma harga indeks: belum termasuk dividen, biaya & pajak. Beli di harga pembukaan tiap bulan. ` +
      `Data: Yahoo Finance (^JKSE), ${monthLabel(first.ym)} – ${dateLabel(DCA.asOf)}. Bukan rekomendasi investasi.`,
  },
};
