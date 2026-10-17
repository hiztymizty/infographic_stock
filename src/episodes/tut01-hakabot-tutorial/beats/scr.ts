// Chapter 06 · Screener (scenes scr-1…scr-4). Source: New.mp4 11:32–12:03 (clips scr-a…c, clips/scr.json).
// Frame-checked 15 Okt (raw seconds): Screener clicked 693.93, loading skeleton 693.97–694.3 (cut), page 694.3 with
// Dekat Support selected (ANTM, ITMG, tier A); Uptrend Fase 2 clicked 701.23 (a scrollbar appears: the layout shifts
// 8 px left from here); Filters opens 704.43; Tier S only 706.43 (9 → 7 rows); Charts on 711.07; page scrolls
// 712.87–714.17 (274 px) to the 7-card grid; PTBA card clicked 718.15 → Stock page 718.2, loaded 718.83, static until
// the chart re-zooms at 723.0.
// Note: the Tren + Retail lines are already on when the PTBA page opens (Flow 1 preset); the footage never shows them
// being switched on, so scr-4-flow just rings the Retail line's drop.
import type {Beat, CamPos, Rect} from '../../../core/tutorial/types';
import {FULL, NAV, REC, navCenter} from './common';

// Framings (centre + zoom, raw px)
/** Pattern cards + toolbar (Charts/Filters at y 400) + table header and first rows; view y 380–1729, subtitles from ~1561. */
const SCR: CamPos = {x: 1915, y: 1055, zoom: 1.45};
/** The 7 chart cards after the scroll (grid y 918–1698). */
const GRID: CamPos = {x: 1915, y: 1300, zoom: 1.55};
/** Stock page PTBA: title, chart and Stock Health (view y 420–1925). */
const STOCK: CamPos = {x: 1912, y: 1172, zoom: 1.3};
/** Closer: Stock Health + the right half of the chart where the Retail line drops (view x 1530–3550, y 900–1929). */
const HEALTH: CamPos = {x: 2540, y: 1415, zoom: 1.9};

// Elements (raw px). Before 701.23 (Dekat Support, no scrollbar):
const POLA: Rect = {x: 772, y: 504, w: 2296, h: 408};
const ALIRAN: Rect = {x: 772, y: 952, w: 1716, h: 204};
const TIER_COL: Rect = {x: 1124, y: 1210, w: 84, h: 244};
// From 701.23 (Uptrend Fase 2, 8 px further left):
const UP_CARD_CLICK = {x: 1222, y: 870};
const UP_HEADER: Rect = {x: 1404, y: 1204, w: 692, h: 44};
const FILTERS: Rect = {x: 2824, y: 400, w: 154, h: 62};
const TIER_S_ITEM = {x: 2780, y: 589};
/** The Filters button after Tier S only is picked (it widens: "Tier S only"). */
const TIER_S_PILL: Rect = {x: 2782, y: 400, w: 196, h: 62};
const CHARTS: Rect = {x: 2604, y: 400, w: 160, h: 62};
/** After the scroll (714.17): the 7 cards; PTBA's card; Stock page parts. */
const CARD_GRID: Rect = {x: 766, y: 918, w: 2292, h: 780};
const PTBA_CARD: Rect = {x: 1354, y: 1318, w: 546, h: 354};
const HEALTH_GRID: Rect = {x: 2650, y: 1142, w: 520, h: 220};
/** The Retail line's steep fall (Sep–Oct) down to its "Retail" tag. */
const RETAIL_DROP: Rect = {x: 1900, y: 1000, w: 560, h: 712};

export const beats: Record<string, Beat> = {
  // From the Composition page: Screener is ringed on "menu" and clicked on "Screener" (the short loading skeleton is cut); the camera eases from the whole
  // page onto the cards. Pola Teknikal ringed on "Pola"; the Peringkat Aliran Dana group ringed on "Peringkat" and held,
  // calm, through scr-1-sort (no per-screener detail: the footage only shows Pola Teknikal tables, so no column is ringed).
  'scr-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 692.6, to: 693.96, align: 693.93, at: {line: 'scr-1-open', word: 'Screener'}},
          {from: 694.3, to: 699.0},
        ],
        cam: {from: FULL, to: SCR, at: {line: 'scr-1-open', word: 'saringan'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NAV.Screener, at: {line: 'scr-1-open', word: 'menu'}, until: {rec: 693.93, off: 0.4}, pad: 4},
          {kind: 'click', ...navCenter('Screener'), rec: 693.93},
          {kind: 'ring', rect: POLA, at: {line: 'scr-1-groups', word: 'Pola'}},
          {kind: 'ring', rect: ALIRAN, at: {line: 'scr-1-flow', word: 'Peringkat'}},
        ],
      },
    ],
  },
  // Same view: the TIER column of the Dekat Support results on "tier"; Uptrend Fase 2 is clicked on its name and its
  // table's RS + vs MA columns are ringed on "RS".
  'scr-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 699.0, to: 703.4, align: 701.23, at: {line: 'scr-2-uptrend', word: 'Uptrend'}}],
        cam: {from: SCR},
        marks: [
          {kind: 'ring', rect: TIER_COL, at: {line: 'scr-2-tier', word: 'tier'}, until: {line: 'scr-2-uptrend', word: 'Uptrend', off: -0.1}, pad: 6},
          {kind: 'click', ...UP_CARD_CLICK, rec: 701.23},
          {kind: 'ring', rect: UP_HEADER, at: {max: [{line: 'scr-2-uptrend', word: 'RS'}, {rec: 701.5}]}, pad: 6},
        ],
      },
    ],
  },
  // Filters (ringed, clicked on "Filters") → Tier S only (clicked on "Tier"): the table drops to 7 rows and the
  // button now reads "Tier S only" (ringed on "Sisanya"). Charts on (clicked on "Charts"); the page scrolls and the
  // camera eases down with it onto the 7 cards.
  'scr-3': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 703.4, to: 705.0, align: 704.43, at: {line: 'scr-3-filter', word: 'Filters'}},
          {from: 705.0, to: 709.4, align: 706.43, at: {line: 'scr-3-filter', word: 'Tier'}},
          // rate 1.4: the page's scroll to the chart grid (712.9–714.2) must end early enough for the grid ring to hold
          // ≥ 1,2 s before the scene ends (real timing: at 1× it got 0,8 s).
          {from: 709.4, to: 715.2, align: 711.07, at: {line: 'scr-3-charts', word: 'Charts'}, rate: 1.4},
        ],
        cam: {from: SCR, to: GRID, at: {rec: 712.9}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: FILTERS, at: {line: 'scr-3-filter', word: 'Klik'}, until: {rec: 704.43, off: 0.4}, pad: 4},
          {kind: 'click', x: 2900, y: 431, rec: 704.43},
          {kind: 'click', ...TIER_S_ITEM, rec: 706.43},
          {kind: 'ring', rect: TIER_S_PILL, at: {max: [{line: 'scr-3-filter', word: 'Sisanya'}, {rec: 706.6}]}, pad: 4},
          {kind: 'ring', rect: CHARTS, at: {line: 'scr-3-charts', word: 'Nyalain'}, until: {rec: 711.07, off: 0.4}, pad: 4},
          {kind: 'click', x: 2668, y: 440, rec: 711.07},
          {kind: 'ring', rect: CARD_GRID, at: {max: [{line: 'scr-3-charts', word: 'sekilas'}, {rec: 714.3}]}},
        ],
      },
    ],
  },
  // PTBA's card is ringed and clicked on "PTBA"; the Stock page opens and the camera eases out to show it. Second shot
  // (same picture) eases in on Stock Health (ringed on "uptrend") and the Retail line's drop (ringed on "garis").
  'scr-4': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 715.2, to: 722.9, align: 718.15, at: {line: 'scr-4-ptba', word: 'PTBA'}}],
        cam: {from: GRID, to: STOCK, at: {rec: 718.9}, dur: 1.8},
        marks: [
          // No ring on the PTBA card: the scene starts ~0,4 s before the click, too short for a 1,2 s hold (house rule:
          // leave it out). QA r3 saw the ring float over the loading page. The click ripple marks it.
          {kind: 'click', x: 1594, y: 1442, rec: 718.15},
        ],
      },
      {
        rec: REC,
        start: {line: 'scr-4-health', off: -1.0},
        pieces: [{from: 721.5, to: 722.9}],
        cam: {from: STOCK, to: HEALTH, at: {line: 'scr-4-health', off: -0.9}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: HEALTH_GRID, at: {max: [{line: 'scr-4-health', word: 'uptrend'}, {line: 'scr-4-health', off: 0.7}]}, pad: 6},
          {kind: 'ring', rect: RETAIL_DROP, at: {line: 'scr-4-flow', word: 'garis'}},
        ],
      },
    ],
  },
};
