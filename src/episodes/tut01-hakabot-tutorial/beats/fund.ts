// Chapter 03 · Fundamental (scenes fund-1…fund-5). Source: New.mp4 6:21.8–7:36.7 (clips fund-a…e, clips/fund.json).
// Frame-checked 15 Okt (times = raw seconds): Fundamental tab clicked 383.17 (skeleton to 383.57); scroll 384.73–388.2
// to Kualitas Fundamental + Rentang Wajar ("scroll A"); idle to 399.8; scroll down/up 399.8–401.03 leaves the page
// 150 px higher ("scroll B"); Piotroski open 401.93–403.03, Profitabilitas open 403.57–404.67; scroll to the key-stat
// chart 411.33–412.47 and 414.10–414.33 (another 150 px); ROE chip off 415.10 (not EPS), ROA 415.87/416.87, PER
// 417.30/418.23; scroll to the statements 419.37–420.57; Neraca 422.9, Arus Kas 424.17; scroll back up 434.6–437.8;
// + Watchlist clicked 441.17 (groups listed 441.33); "Test" typed 447.87–448.63; + clicked 449.87, Test row checked
// 450.60, dropdown closes 451.87; Watchlist page 454.03 (loaded 454.4), group Test clicked 455.37 → ERAA; the
// "Delete Test?" dialog from 456.77 is never shown.
import type {Beat, CamPos, Rect} from '../../../core/tutorial/types';
import {REC} from './common';

const L = {
  cap: 'Market cap',
} as const;

// Framings (centre + zoom, raw px)
/** Header, tabs and the Valuasi cards (view y 289–1511). */
const TOP: CamPos = {x: 1500, y: 900, zoom: 1.6};
/** Valuasi + Profitabilitas cards (view y 571–1689: Margin bersih ends at 1529, above the subtitles). */
const CARDS: CamPos = {x: 1400, y: 1130, zoom: 1.75};
/** Kualitas Fundamental at scroll A (view y 560–1449). */
const KQ_A: CamPos = {x: 1260, y: 1005, zoom: 2.2};
/** The same view at scroll B (page 150 px higher), so the two shots line up in the crossfade. */
const KQ_B: CamPos = {x: 1260, y: 855, zoom: 2.2};
/** Rentang Wajar card at scroll B (view x 1770–3370, y 432–1247). */
const RW_B: CamPos = {x: 2570, y: 840, zoom: 2.4};
/** Key-stat chart: chips + chart (view y 408–1712). */
const CHART: CamPos = {x: 1920, y: 1060, zoom: 1.5};
/** Financial statements: tabs, period toggle, first rows. */
const STMT: CamPos = {x: 1590, y: 830, zoom: 2.0};
/** Stock header with the + Watchlist button and its dropdown (view y 352–1167). */
const BTN: CamPos = {x: 1300, y: 760, zoom: 2.4};
/** Watchlist page (same framing as chapter 02). */
const WATCH: CamPos = {x: 1919, y: 780, zoom: 1.55};

// Elements (raw px)
const TAB: Rect = {x: 726, y: 724, w: 210, h: 62};
const CAP_CARD: Rect = {x: 615, y: 913, w: 358, h: 355};
const PE_CARD: Rect = {x: 1360, y: 913, w: 359, h: 355};
const MARGIN_CARD: Rect = {x: 988, y: 1343, w: 358, h: 186};
/** Scroll A: grade badge + "Skor gabungan 59 dari 100"; the Piotroski and Profitabilitas rows. */
const GRADE_A: Rect = {x: 650, y: 614, w: 520, h: 134};
const PIO_ROW_A: Rect = {x: 650, y: 784, w: 1216, h: 56};
const PROF_ROW_A: Rect = {x: 650, y: 872, w: 1216, h: 56};
/** Scroll B, Piotroski open: "4 dari 9 lolos" + the nine checks. */
const PIO_LIST_B: Rect = {x: 648, y: 706, w: 1218, h: 424};
/** Scroll B: the range bar + "Rentang wajar Rp 619 – Rp 739"; "Harga terakhir Rp 625 · di zona bawah rentang". */
const RANGE_B: Rect = {x: 1958, y: 578, w: 1220, h: 78};
const PRICE_B: Rect = {x: 1958, y: 512, w: 496, h: 52};
/** Key-stat chips as they sit at 413 (scrolled up 150 px more at 414.10–414.33: the track follows). */
const CHIPS: Rect = {x: 655, y: 770, w: 2165, h: 184};
const CHIPS_TRACK = [
  {t: 414.1, dx: 0, dy: 0},
  {t: 414.33, dx: 0, dy: -150},
];
const STMT_TABS: Rect = {x: 670, y: 370, w: 412, h: 60};
const PERIOD: Rect = {x: 655, y: 450, w: 282, h: 67};
const WL_BTN: Rect = {x: 721, y: 625, w: 164, h: 55};
const DROPDOWN: Rect = {x: 722, y: 687, w: 448, h: 234};
const NEW_INPUT: Rect = {x: 739, y: 845, w: 346, h: 56};
/** Group "Test" before the click (3rd row, y 742); the list reflows 102 px up when it opens (455.37–455.40). */
const TEST_ROW: Rect = {x: 754, y: 742, w: 488, h: 76};
const TEST_TRACK = [
  {t: 455.36, dx: 0, dy: 0},
  {t: 455.4, dx: 0, dy: -102},
];

export const beats: Record<string, Beat> = {
  // Under the chapter card: the stock page on the Grafik tab; the Fundamental tab is ringed and clicked on
  // "Fundamental"; one move down to the cards; market cap, PE, then the net margin card, each on its word.
  'fund-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 381.9, to: 384.7, align: 383.17, at: {line: 'fund-1-tab', word: 'Fundamental'}}],
        cam: {from: TOP, to: CARDS, at: {line: 'fund-1-tab', word: 'angka'}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: TAB, at: {line: 'fund-1-tab', word: 'tab'}, until: {rec: 383.17, off: 0.5}, pad: 4},
          {kind: 'click', x: 831, y: 755, rec: 383.17},
          {kind: 'ring', rect: CAP_CARD, at: {line: 'fund-1-cap', word: 'market'}, label: L.cap, side: 'above'},
          {kind: 'ring', rect: PE_CARD, at: {line: 'fund-1-pe', word: 'PE'}},
          {kind: 'ring', rect: MARGIN_CARD, at: {line: 'fund-1-pe', word: 'bersihnya'}},
        ],
      },
    ],
  },
  // The page scrolls to Kualitas Fundamental (the camera follows); the grade, then Profitabilitas and Piotroski rows.
  // Second shot (crossfade, same content position): Piotroski opens on "cek" and its frame holds while the voice
  // reads it (it was open only ~1 s in the recording).
  'fund-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 384.7, to: 388.4}],
        cam: {from: CARDS, to: KQ_A, at: 0.1, dur: 2.4},
        marks: [
          {kind: 'ring', rect: GRADE_A, at: {max: [{line: 'fund-2-grade', word: 'Kualitas'}, {rec: 388.25}]}, pad: 6},
          {kind: 'ring', rect: PROF_ROW_A, at: {line: 'fund-2-parts', word: 'Profitabilitas'}, pad: 4},
          {kind: 'ring', rect: PIO_ROW_A, at: {line: 'fund-2-parts', word: 'Piotroski'}, pad: 4},
        ],
      },
      {
        rec: REC,
        start: {line: 'fund-2-pio'},
        pieces: [{from: 401.2, to: 402.95, align: 401.93, at: {line: 'fund-2-pio', word: 'cek'}}],
        cam: {from: KQ_B},
        marks: [
          {kind: 'click', x: 682, y: 662, rec: 401.93},
          {kind: 'ring', rect: PIO_LIST_B, at: {max: [{line: 'fund-2-pio', word: '9'}, {rec: 402.0}]}},
        ],
      },
    ],
  },
  // Same page, Piotroski closed again: one move right onto Rentang Wajar; the range bar + its Rp 619–739 caption,
  // then the last price "625 · di zona bawah rentang".
  'fund-3': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 404.75, to: 406.6}],
        cam: {from: KQ_B, to: RW_B, at: 0.1, dur: 2.0},
        marks: [
          {kind: 'ring', rect: RANGE_B, at: {line: 'fund-3-range', word: 'kisaran'}, pad: 4},
          {kind: 'ring', rect: PRICE_B, at: {line: 'fund-3-price', word: 'Harganya'}, pad: 6},
        ],
      },
    ],
  },
  // The page scrolls to the key-stat chart on "Geser" (chips ringed on "grafik"; ROE switched off 415.10), then a
  // crossfade to the statements: Neraca clicked on "Neraca", Arus Kas after it; tabs, then the period toggle.
  'fund-4': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 411.0, to: 416.0, align: 411.33, at: {line: 'fund-4-chart', word: 'Geser'}}],
        cam: {from: CHART},
        marks: [
          {kind: 'ring', rect: CHIPS, at: {max: [{line: 'fund-4-chart', word: 'grafik'}, {rec: 412.5}]}, track: CHIPS_TRACK, pad: 6},
          {kind: 'click', x: 1295, y: 665, rec: 415.1},
        ],
      },
      {
        rec: REC,
        start: {line: 'fund-4-reports'},
        pieces: [{from: 420.6, to: 424.9, align: 422.9, at: {line: 'fund-4-reports', word: 'Neraca'}}],
        cam: {from: STMT},
        marks: [
          {kind: 'ring', rect: STMT_TABS, at: {line: 'fund-4-reports', word: 'Laba'}, pad: 6},
          {kind: 'click', x: 882, y: 398, rec: 422.9},
          {kind: 'click', x: 1020, y: 398, rec: 424.17},
          {kind: 'ring', rect: PERIOD, at: {line: 'fund-4-reports', word: 'kuartal'}, pad: 4},
        ],
      },
    ],
  },
  // Back at the top: + Watchlist ringed and clicked on "+ Watchlist"; the group list (ringed on "Pilih"); one jump
  // cut over the retyping to "Test" in the new-list box, + clicked on "bikin"; then a crossfade to the Watchlist
  // page, where the new group Test is ringed and clicked (ERAA in it).
  'fund-5': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 439.6, to: 443.3, align: 441.17, at: {line: 'fund-5-button', word: '+'}},
          {from: 447.75, to: 451.8, align: 449.87, at: {line: 'fund-5-new', word: 'bikin'}},
        ],
        cam: {from: BTN},
        marks: [
          {kind: 'ring', rect: WL_BTN, at: {line: 'fund-5-button', word: 'tombol'}, until: {rec: 441.17, off: 0.4}, pad: 4},
          {kind: 'click', x: 803, y: 652, rec: 441.17},
          {kind: 'ring', rect: DROPDOWN, at: {max: [{line: 'fund-5-new', word: 'Pilih'}, {rec: 441.4}]}, pad: 4},
          {kind: 'ring', rect: NEW_INPUT, at: {max: [{line: 'fund-5-new', word: 'ketik'}, {rec: 447.75}]}, until: {rec: 449.87, off: 0.3}, pad: 4},
          {kind: 'click', x: 1123, y: 874, rec: 449.87},
        ],
      },
      {
        rec: REC,
        start: {line: 'fund-5-check'},
        pieces: [{from: 454.45, to: 456.65, align: 455.37, at: {line: 'fund-5-check', word: 'muncul'}}],
        cam: {from: WATCH},
        marks: [
          {kind: 'ring', rect: TEST_ROW, at: {line: 'fund-5-check', word: 'Grupnya'}, track: TEST_TRACK, pad: 4},
          {kind: 'click', x: 962, y: 784, rec: 455.37},
        ],
      },
    ],
  },
};
