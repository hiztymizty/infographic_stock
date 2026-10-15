// All on-screen text for ep03 (Bahasa, casual). Voiceover lives in episodes/ep03-inflasi-tabungan/script.json.
// Numbers are derived from data/inflasi.json (via data.ts), never typed in. Rounding follows facts.md → Display.
import {dateLabel, fmt, monthLabel} from '../../core/format';
import {D, FULL_YEARS, INF, P0, SNAP, SUM, yearsBeat} from './data';

const startYear = Number(D.start.slice(0, 4));
const endLabel = monthLabel(D.end); // SEP 2026
const endYear = D.end.slice(0, 4);
const endMonthName = (ym: string) => monthLabel(ym).slice(0, 3);
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
const nYears = FULL_YEARS.length; // 16
const pctTax = fmt.pct(D.tax, 0); // 20%
/** Keeps "Rp 7,5 juta" on one line in wrapped text. */
const NBSP = String.fromCharCode(160);

export const T = {
  hook: {
    kicker: `SIMULASI ${monthLabel(D.start)} – ${endLabel}`,
    amount: fmt.words(P0), // Rp 10 juta
    lines: ['di lemari', `sejak ${startYear}.`],
    question: 'Sekarang bisa beli apa?',
    stackTag: fmt.rp(P0),
    yearTag: String(startYear),
  },
  shrink: {
    kicker: 'INFLASI',
    def: ['Inflasi = harga-harga naik', 'pelan-pelan tiap tahun.'],
    money: 'UANGMU',
    moneyNote: 'angkanya tetap',
    power: `DAYA BELI · ${startYear}`,
    basket: 'HARGA BELANJAAN',
    basketNote: 'belanjaan yang sama',
    // First on-screen use of BPS: spelled out (the date range is in the hook kicker).
    source: 'SUMBER: BADAN PUSAT STATISTIK (BPS)',
    yearFrom: startYear,
    yearTo: endLabel,
    rise: INF.priceRise, // +90,3%
    need: INF.needToday,
    needApprox: `≈ ${fmt.juta(INF.needToday, 0)}`, // ≈ Rp 19 juta
    real: INF.realValueOf10jt,
    realApprox: `≈ ${fmt.juta(INF.realValueOf10jt, 1)}`, // ≈ Rp 5,3 juta
    lost: SUM.kas.realChange, // −47,5%
  },
  bank: {
    kicker: 'KALAU DITABUNG DI BANK?',
    options: ['Tabungan', 'Deposito'],
    tax: {
      bar: 'BUNGA TABUNGAN',
      bite: `pajak ${pctTax}`,
      note: 'dipotong otomatis',
    },
    verdictLabel: 'Menang lawan inflasi',
    verdict: (n: number) => `${n} dari ${nYears} tahun`,
    tabBeat: yearsBeat('tabungan').length, // 0
    tabNote: 'nggak pernah sekali pun',
    depBeat: yearsBeat('deposito_lps').length, // 12
    edgeKicker: ['Tapi cuma menang ', 'tipis'],
    edge: SUM.deposito_lps.realPerYear, // +0,7%
    edgeLabel: 'setahun di atas inflasi',
    lps: ['Itu pun pakai bunga deposito tertinggi', 'yang dijamin LPS (Lembaga Penjamin Simpanan).'],
  },
  formula: {
    kicker: 'RUMUS UNTUNG BENERAN',
    terms: [['Hasil', 'bersih'], ['Inflasi'], ['Untung', 'beneran']],
    def: 'Hasil bersih = hasil setelah pajak & biaya',
    rows: [
      {
        label: 'Bunga deposito hari ini',
        sub: `MAKS. DIJAMIN LPS · ${dateLabel(SNAP.lpsPeriod[0])}`,
        value: fmt.pct(SNAP.lpsRate, 2), // 3,75%
      },
      {label: `Setelah pajak ${pctTax}`, sub: 'HASIL BERSIH', value: fmt.pct(SNAP.lpsNet, 2)}, // 3,00%
      {
        label: 'Inflasi',
        sub: `${monthLabel(SNAP.inflationMonth)} · Y-ON-Y · BPS`,
        value: fmt.pct(SNAP.inflationYoy, 2), // 3,28%
      },
    ],
    net: fmt.pct(SNAP.lpsNet, 2),
    infl: fmt.pct(SNAP.inflationYoy, 2),
    result: SNAP.lpsNetMinusInflation, // −0,28%
    resultText: fmt.signedPct(SNAP.lpsNetMinusInflation, 2),
    perYear: 'setahun',
    saldo: {label: 'SALDO DEPOSITO', text: 'kelihatan nambah', value: fmt.signedPct(SNAP.lpsNet, 2)},
    nilai: {label: 'NILAI ASLINYA', text: 'sebenarnya turun', value: fmt.signedPct(SNAP.lpsNetMinusInflation, 2)},
    caveat: 'Bunga hari ini vs inflasi 12 bulan terakhir, ke depannya bisa berubah.',
  },
  lesson: {
    kicker: 'BIASAKAN INI',
    title: 'Sebelum naruh uang:',
    steps: [
      {title: 'Cek inflasi terbaru', sub: 'dari BPS (Badan Pusat Statistik)'},
      {title: 'Hitung hasil bersih', sub: 'setelah pajak & biaya'},
      {title: 'Di atas inflasi?', sub: 'baru uangmu beneran tumbuh'},
    ],
    footer:
      `Inflasi: BPS, y-on-y Desember ${FULL_YEARS[0]}–${FULL_YEARS[nYears - 1]} + Jan–${titleCase(endMonthName(D.end))} ${endYear}, ` +
      `data s.d. ${titleCase(endMonthName(D.end))} ${endYear}. ` +
      `Deposito: bunga penjaminan LPS, dipotong pajak ${pctTax}, diperpanjang tiap bulan; bunga di bank bisa lebih rendah. ` +
      `Tabungan: rata-rata bunga bank umum (Bank Indonesia), dipotong pajak ${pctTax}, belum dipotong biaya admin. ` +
      `Pajak ${pctTax} berlaku kalau total simpanan di atas ${fmt.juta(D.taxThreshold, 1).replace(/ /g, NBSP)}.`,
    pill: 'Bukan rekomendasi investasi',
  },
};
