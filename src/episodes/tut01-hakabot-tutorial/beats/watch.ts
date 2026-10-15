// Chapter 02 · Watchlist (scenes watch-1…watch-7). Source: New.mp4 0:15.8–1:17 (clips watch-a…d, clips/watch.json).
// Frame-checked 15 Okt (times = raw seconds): Watchlist clicked 17.0, page loads in Acc/Dist view 17.5, Acc/Dist off
// 20.93; sort LAST 25.43, Δ% 27.20, VOLUME 29.07, VALUE 30.00; New list 33.2, "Blue chip" typed 34.5–35.8, Enter 36.5;
// search 39.2, "bbri" typed 40.9, BBRI picked 42.85, "bbca" typed 44.0–45.0, BBCA picked 45.55; × BBCA 49.77, × BBRI
// 50.93; group pencil 52.37 → Rename dialog, "Gorengan", Save 55.0; group × 58.47 → Delete dialog, Delete 59.67;
// Charts on 63.93; Acc/Dist on 68.93; BREN tooltips 14 Okt 72.03–74.0, 13 Okt 75.13–76.93, 12 Okt 78.03–79.93.
// Note: the group panel's vertical position shifts with the table height (New list y 492 with 3 rows, 426 with 2),
// so group-row rects are measured per moment.
import type {Beat, BlurBox, CamPos, Rect} from '../../../core/tutorial/types';
import {NAV, REC, navCenter} from './common';

const L = {
  value: 'Value = nilai transaksi (Rp)',
  days: '5 hari terakhir',
  left: 'Kiri · Top 5 broker',
  right: 'Kanan · jumlah broker',
} as const;

// Framings (centre + zoom, raw px)
/** Menu + groups + table/cards; the dialogs (to y 1262) stay clear of the subtitles. */
const WATCH: CamPos = {x: 1919, y: 780, zoom: 1.55};
/** Same, a little lower, for the remove/rename/delete dialogs (to y 1262): clear of two-line subtitles. */
const WATCH_LOW: CamPos = {x: 1919, y: 900, zoom: 1.55};
/** Table header + rows (left edge x 1280: just right of the group panel, so no sliver of it shows). */
const SORT: CamPos = {x: 2240, y: 640, zoom: 2.0};
/** Toolbar + mini chart cards (left edge x 1255). */
const CARDS: CamPos = {x: 2240, y: 690, zoom: 1.95};
/** Acc/Dist squares, BREN row (13 Okt pair in the middle). */
const SQUARES: CamPos = {x: 2040, y: 690, zoom: 2.6};
/** BREN 14/13 Okt tooltips (native browser tooltips, ~20 px text in 4K → ~29 px on screen). */
const TIPS: CamPos = {x: 1925, y: 700, zoom: 3.0};

// Elements (raw px)
const GROUPS: Rect = {x: 754, y: 574, w: 488, h: 160};
const HEADER: Rect = {x: 1282, y: 502, w: 1802, h: 60};
const COL_X = {last: 1844, pct: 2354, volume: 2592, value: 2860};
const HEADER_Y = 532;
const VALUE_COL: Rect = {x: 2760, y: 505, w: 210, h: 335};
const NEW_LIST: Rect = {x: 754, y: 492, w: 488, h: 74};
const SEARCH: Rect = {x: 2222, y: 415, w: 416, h: 61};
const PICK = {x: 2350, y: 532};
const X_ROW1: Rect = {x: 3014, y: 584, w: 48, h: 48};
const PENCIL: Rect = {x: 1130, y: 760, w: 42, h: 40};
const GROUP_X: Rect = {x: 1175, y: 760, w: 40, h: 40};
const DELETE_DIALOG: Rect = {x: 1564, y: 977, w: 712, h: 265};
const CHARTS_BTN: Rect = {x: 2654, y: 415, w: 157, h: 61};
const CARD_GRID: Rect = {x: 1282, y: 502, w: 1802, h: 410};
/** Acc/Dist toggle after it's on (table mode; in Charts mode it sits at x 2628). */
const ACCDIST_BTN: Rect = {x: 2827, y: 415, w: 181, h: 61};
const DATES: Rect = {x: 1784, y: 572, w: 1124, h: 40};
/** BREN 13 Okt: left square (Top 5 broker), right square (number of brokers). */
const SQ_LEFT: Rect = {x: 2003, y: 658, w: 18, h: 20};
const SQ_RIGHT: Rect = {x: 2028, y: 658, w: 18, h: 20};
const TIP_13: Rect = {x: 2047, y: 683, w: 259, h: 62};
const TIP_14: Rect = {x: 1795, y: 698, w: 263, h: 60};

/** The dashboard is still on screen before the Watchlist click: its "Welcome back, <account>" and the author line. */
const DASH_BEFORE_CLICK: BlurBox[] = [
  {x: 1236, y: 360, w: 470, h: 96, to: 17.06},
  {x: 826, y: 794, w: 196, h: 38, to: 17.06, sigma: 10},
];

export const beats: Record<string, Beat> = {
  // Click Watchlist on "Watchlist"; the page opens in Acc/Dist view; one jump cut over the user switching it off
  // (17.75 → 21.6) to the plain table. Rings: the menu item, then the group list on "kiri".
  'watch-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 16.2, to: 17.75, align: 17.0, at: {line: 'watch-1-open', word: 'Watchlist'}},
          {from: 21.6, to: 23.0},
        ],
        cam: {from: WATCH},
        marks: [
          {kind: 'ring', rect: NAV.Watchlist, at: {line: 'watch-1-open', word: 'menu'}, until: {rec: 17.0, off: 0.5}, pad: 4},
          {kind: 'click', ...navCenter('Watchlist'), rec: 17.0},
          {kind: 'ring', rect: GROUPS, at: {line: 'watch-1-group', word: 'kiri'}},
        ],
        blur: DASH_BEFORE_CLICK,
      },
    ],
  },
  // Sorting: the camera eases onto the table; each click lands on the word for its column (Last on "harga",
  // Δ% on "persen", Value on "Value"); then the Value column is ringed with a short label.
  'watch-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 23.0, to: 26.5, align: 25.43, at: {line: 'watch-2-sort', word: 'harga'}},
          {from: 26.5, to: 29.6, align: 27.2, at: {line: 'watch-2-sort', word: 'persen'}},
          {from: 29.6, to: 31.15, align: 30.0, at: {line: 'watch-2-sort', word: 'Value'}},
        ],
        cam: {from: WATCH, to: SORT, at: {line: 'watch-2-sort', word: 'Klik'}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: HEADER, at: {line: 'watch-2-sort', word: 'judul'}, pad: 4},
          {kind: 'click', x: COL_X.last, y: HEADER_Y, rec: 25.43},
          {kind: 'click', x: COL_X.pct, y: HEADER_Y, rec: 27.2},
          {kind: 'click', x: COL_X.volume, y: HEADER_Y, rec: 29.07},
          {kind: 'click', x: COL_X.value, y: HEADER_Y, rec: 30.0},
          {kind: 'ring', rect: VALUE_COL, at: {line: 'watch-2-value', word: 'Value'}, label: L.value, side: 'below'},
        ],
      },
    ],
  },
  // New group: back out to the page; the New list box is ringed, "Blue chip" is typed as it's said; then the search
  // box, "bbri" typed and picked, "bbca" typed and picked (both rows land in the table).
  'watch-3': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 31.9, to: 37.8, align: 34.5, at: {line: 'watch-3-group', word: 'Ketik'}},
          {from: 38.6, to: 43.3, align: 40.9, at: {line: 'watch-3-add', word: 'cari'}},
          {from: 43.6, to: 46.4},
        ],
        cam: {from: SORT, to: WATCH, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NEW_LIST, at: {line: 'watch-3-group', word: 'New'}, until: {rec: 36.45}, pad: 4},
          {kind: 'click', x: 1000, y: 529, rec: 33.2},
          {kind: 'ring', rect: SEARCH, at: {line: 'watch-3-add', word: 'cari'}, until: {rec: 42.9}, pad: 4},
          {kind: 'click', x: 2430, y: 445, rec: 39.2},
          {kind: 'click', ...PICK, rec: 42.85},
          {kind: 'click', ...PICK, rec: 45.55},
        ],
      },
    ],
  },
  // Remove / rename / delete, one framing (eases a little lower for the dialogs): × on the row (ringed on "Tanda",
  // clicked on "silang"); the group row's pencil → Rename dialog → "Gorengan"; the group's × → the confirmation
  // dialog, held (ringed on "nanya") while the voice explains it; the Delete click itself is left out.
  'watch-4': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 49.0, to: 51.3, align: 49.77, at: {line: 'watch-4-remove', word: 'silang'}},
          {from: 51.7, to: 55.4, align: 52.37, at: {line: 'watch-4-rename', word: 'pensil'}},
          {from: 57.7, to: 59.55, align: 58.47, at: {line: 'watch-4-delete', word: 'sebelahnya'}},
        ],
        cam: {from: WATCH, to: WATCH_LOW, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: X_ROW1, at: {line: 'watch-4-remove', word: 'Tanda'}, until: {rec: 49.8, off: 0.4}, pad: 4, spot: true},
          {kind: 'click', x: 3038, y: 608, rec: 49.77},
          {kind: 'click', x: 3038, y: 608, rec: 50.93},
          {kind: 'ring', rect: PENCIL, at: {max: [{line: 'watch-4-rename', word: 'Ikon'}, {rec: 51.9}]}, until: {rec: 52.37, off: 0.5}, pad: 4, spot: true},
          {kind: 'click', x: 1151, y: 780, rec: 52.37},
          {kind: 'click', x: 2190, y: 1196, rec: 55.0},
          {kind: 'ring', rect: GROUP_X, at: {max: [{line: 'watch-4-delete', word: 'Ikon'}, {rec: 58.0}]}, until: {rec: 58.47, off: 0.5}, pad: 4, spot: true},
          {kind: 'click', x: 1195, y: 780, rec: 58.47},
          {kind: 'ring', rect: DELETE_DIALOG, at: {max: [{line: 'watch-4-delete', word: 'nanya'}, {rec: 58.6}]}},
        ],
      },
    ],
  },
  // Charts on (63.93) on "Charts": the toggle is ringed, the camera eases onto the card grid (ringed on "kecil").
  'watch-5': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 62.6, to: 66.5, align: 63.93, at: {line: 'watch-5-charts', word: 'Charts'}}],
        cam: {from: WATCH_LOW, to: CARDS, at: {rec: 64.2}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: CHARTS_BTN, at: {line: 'watch-5-charts', word: 'Nyalain'}, until: {rec: 63.93, off: 0.4}, pad: 4},
          {kind: 'click', x: 2732, y: 445, rec: 63.93},
          {kind: 'ring', rect: CARD_GRID, at: {max: [{line: 'watch-5-charts', word: 'kecil'}, {rec: 64.6}]}},
        ],
      },
    ],
  },
  // Acc/Dist on (68.93) on "Acc/Dist": toggle, then the 5 dates; the camera eases onto BREN's squares; the left
  // and right square of 13 Okt are ringed in turn (spotlit: they're tiny) with the app's own legend words.
  'watch-6': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 68.4, to: 71.3, align: 68.93, at: {line: 'watch-6-toggle', word: 'Acc/Dist'}}],
        cam: {from: CARDS, to: SQUARES, at: {line: 'watch-6-left', word: 'Tiap'}, dur: 1.8},
        marks: [
          {kind: 'click', x: 2717, y: 445, rec: 68.93},
          {kind: 'ring', rect: ACCDIST_BTN, at: {max: [{line: 'watch-6-toggle', word: 'Acc/Dist'}, {rec: 69.0}]}, pad: 4},
          {kind: 'ring', rect: DATES, at: {line: 'watch-6-toggle', word: 'lima'}, label: L.days, side: 'above', pad: 4},
          {kind: 'ring', rect: SQ_LEFT, at: {line: 'watch-6-left', word: 'kiri'}, label: L.left, side: 'below', spot: true, pad: 4},
          {kind: 'ring', rect: SQ_RIGHT, at: {line: 'watch-6-right', word: 'kanan'}, label: L.right, side: 'below', spot: true, pad: 4},
        ],
      },
    ],
  },
  // Tooltips, closer still: 13 Okt first (recorded second, played first because the voice tells it first), then a
  // soft crossfade to 14 Okt ("Besoknya"). One ring per line, on the tooltip.
  'watch-7': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 74.05, to: 76.9, align: 75.13, at: {line: 'watch-7-acc', word: 'detail'}}],
        cam: {from: SQUARES, to: TIPS, at: 0.1, dur: 1.8},
        marks: [{kind: 'ring', rect: TIP_13, at: {max: [{line: 'watch-7-acc', word: 'Contohnya'}, {rec: 75.25}]}, pad: 6}],
      },
      {
        rec: REC,
        start: {line: 'watch-7-dist'},
        pieces: [{from: 71.4, to: 73.95, align: 72.03, at: {line: 'watch-7-dist', word: 'Besoknya', off: 0.2}}],
        cam: {from: TIPS},
        marks: [{kind: 'ring', rect: TIP_14, at: {max: [{line: 'watch-7-dist', word: 'net'}, {rec: 72.15}]}, pad: 6}],
      },
    ],
  },
};
