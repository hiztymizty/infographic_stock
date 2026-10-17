// Chapter 07 · HB Center (scenes hb-1…hb-5). Source: New.mp4 12:17–13:01 (clips hb-a…c, clips/hb.json).
// Frame-checked 15 Okt (raw seconds): HB Center pressed from 739.2, page swaps 740.40 to a loading skeleton
// (740.40–740.77, cut out) and is loaded at 740.80; static until the scroll 749.57–751.80 (content up 900 px) to Live +
// Active signals; static to 763.2; scroll 763.20–763.93 (up 618 px) to Trade history page 1 (2026, mostly red);
// paging Next 768.2 … page 5 at 775.5 (Jan 2026 / Dec 2025), 6 at 777.3, 7 at 779.3 (Nov–Oct 2025) … to 11/26 at ~792;
// scroll back up 793.9–795.5. Only page 1 and pages 5–7 are used (the rest of the paging is cut).
// User 16 Okt (privacy / date-proofing): the Live signals row values (close, nilai 20D, tanggal, stop) and the Active
// signals values (entry date, entry, current, unrealized, days, stop) are blurred whenever they're on screen; tickers stay
// readable. No ring singles out a number or a setup: the stat cards are ringed as one group, the Performance table whole.
import type {Beat, BlurBox, CamPos, Rect} from '../../../core/tutorial/types';
import {FULL, NAV, REC, navCenter} from './common';

// Framings (centre + zoom, raw px)
/** Strategy vs IHSG + stat cards + Performance (view y 300–1649; subtitles from ~1481). */
const TOP: CamPos = {x: 1912, y: 975, zoom: 1.45};
/** Stat cards + Performance table, closer (view x 1592–3613, y 300–1329; subtitles from ~1201). */
const PERF: CamPos = {x: 2603, y: 815, zoom: 1.9};
/** After the first scroll: Live signals + Active signals (view x 541–3283, y 260–1657; subtitles from ~1483). */
const LIVE: CamPos = {x: 1912, y: 958, zoom: 1.4};
/** After the second scroll: Trade history title, tabs and 10 rows (view y 600–1997; subtitles from ~1823). */
const TRADES: CamPos = {x: 1912, y: 1298, zoom: 1.4};

// Elements (raw px). Top of the page (740.8–749.5):
const STRATEGY: Rect = {x: 610, y: 382, w: 1346, h: 780};
const TABS: Rect = {x: 1126, y: 442, w: 784, h: 62};
/** The three stat cards (Win rate, Avg RR, Total trades) as one group. */
const STATS: Rect = {x: 1992, y: 382, w: 1222, h: 202};
const PERF_CARD: Rect = {x: 1992, y: 614, w: 1222, h: 534};
// After the scroll at 751.8:
/** Live signals panel (title, columns, the one row). */
const LIVE_PANEL: Rect = {x: 610, y: 298, w: 2604, h: 366};
const ACTIVE: Rect = {x: 610, y: 702, w: 2604, h: 606};
// After the scroll at 763.93:
const HISTORY_TITLE: Rect = {x: 640, y: 768, w: 560, h: 84};
const RETURN_COL: Rect = {x: 2400, y: 952, w: 160, h: 856};

/**
 * Page scroll (content moved up, raw px), measured frame by frame (tutorial_probe scroll): 749.50–751.80 (900 px, to
 * Live + Active signals) and 763.13–763.93 (618 px more, to Trade history).
 */
const SCROLL = [
  {t: 749.5, dx: 0, dy: 0},
  {t: 749.567, dx: 0, dy: -4},
  {t: 749.633, dx: 0, dy: -16},
  {t: 749.667, dx: 0, dy: -62},
  {t: 749.7, dx: 0, dy: -110},
  {t: 749.8, dx: 0, dy: -150},
  {t: 750.0, dx: 0, dy: -156},
  {t: 750.033, dx: 0, dy: -166},
  {t: 750.067, dx: 0, dy: -178},
  {t: 750.1, dx: 0, dy: -204},
  {t: 750.133, dx: 0, dy: -232},
  {t: 750.167, dx: 0, dy: -286},
  {t: 750.2, dx: 0, dy: -300},
  {t: 750.6, dx: 0, dy: -300},
  {t: 750.667, dx: 0, dy: -316},
  {t: 750.733, dx: 0, dy: -340},
  {t: 750.767, dx: 0, dy: -396},
  {t: 750.8, dx: 0, dy: -432},
  {t: 750.833, dx: 0, dy: -450},
  {t: 751.1, dx: 0, dy: -452},
  {t: 751.133, dx: 0, dy: -460},
  {t: 751.167, dx: 0, dy: -470},
  {t: 751.2, dx: 0, dy: -492},
  {t: 751.233, dx: 0, dy: -526},
  {t: 751.267, dx: 0, dy: -570},
  {t: 751.333, dx: 0, dy: -600},
  {t: 751.367, dx: 0, dy: -604},
  {t: 751.4, dx: 0, dy: -610},
  {t: 751.433, dx: 0, dy: -650},
  {t: 751.467, dx: 0, dy: -688},
  {t: 751.5, dx: 0, dy: -728},
  {t: 751.533, dx: 0, dy: -746},
  {t: 751.6, dx: 0, dy: -752},
  {t: 751.633, dx: 0, dy: -756},
  {t: 751.667, dx: 0, dy: -770},
  {t: 751.7, dx: 0, dy: -802},
  {t: 751.733, dx: 0, dy: -848},
  {t: 751.767, dx: 0, dy: -878},
  {t: 751.8, dx: 0, dy: -900},
  {t: 763.133, dx: 0, dy: -900},
  {t: 763.233, dx: 0, dy: -910},
  {t: 763.3, dx: 0, dy: -974},
  {t: 763.333, dx: 0, dy: -1052},
  {t: 763.367, dx: 0, dy: -1136},
  {t: 763.4, dx: 0, dy: -1288},
  {t: 763.433, dx: 0, dy: -1316},
  {t: 763.5, dx: 0, dy: -1398},
  {t: 763.567, dx: 0, dy: -1478},
  {t: 763.633, dx: 0, dy: -1500},
  {t: 763.833, dx: 0, dy: -1502},
  {t: 763.9, dx: 0, dy: -1514},
  {t: 763.933, dx: 0, dy: -1518},
];

/**
 * Signal values, blurred from the moment the page loads (rects as at the top of the page, 740.8–749.5; the track
 * follows both scrolls). Live row: CLOSE x 1940 … STOP x 3190, text y 1440–1468. It slides under the sticky menu during
 * the second scroll: the box ends at 763.38 (at frame 763.367 its top is at y 286, still below the menu; from 763.40 the
 * text is under the menu), so it never smears the menu. Active rows (y 1852 / 1934 / 2016 / 2098 at the top of the
 * page): ENTRY DATE x 1310 … STOP x 2776; after both scrolls the box top sits at y 294, still below the menu.
 */
const HB_BLUR: BlurBox[] = [
  {x: 1900, y: 1422, w: 1310, h: 64, from: 740.4, to: 763.38, sigma: 18, track: SCROLL},
  {x: 1290, y: 1812, w: 1510, h: 328, from: 740.4, to: 768.3, sigma: 18, track: SCROLL},
  // The browser's link-hover bubble bottom-left ("https://hakabot.com/screener" / "/hbcenter", 736.3–742.17; text
  // x 0–258, y 2053–2088): blurred and tinted to the page background (QA round 1 #8).
  {x: 0, y: 2044, w: 372, h: 44, from: 736.2, to: 742.25, sigma: 14, tint: 0.88},
];

export const beats: Record<string, Beat> = {
  // From the PTBA page: HB Center ringed on "HB" and clicked just after; the loading skeleton is cut (one jump cut).
  // The whole page shows (signal values already blurred), then one move in; the chart on "Chart", its tabs on "tab".
  'hb-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 737.0, to: 740.36, align: 740.33, at: {line: 'hb-1-open', word: 'HB', off: 0.5}},
          {from: 740.8, to: 744.0},
        ],
        cam: {from: FULL, to: TOP, at: {line: 'hb-1-open', word: 'yang'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NAV['HB Center'], at: {line: 'hb-1-open', word: 'HB'}, until: {rec: 740.33, off: 0.3}, pad: 4},
          {kind: 'click', ...navCenter('HB Center'), rec: 740.33},
          {kind: 'ring', rect: STRATEGY, at: {line: 'hb-1-chart', word: 'Chart'}},
          {kind: 'ring', rect: TABS, at: {line: 'hb-1-chart', word: 'tab'}, pad: 6},
        ],
        blur: HB_BLUR,
      },
    ],
  },
  // Closer on the stat cards: the three cards ringed as one group on "statistik" and held through hb-2-rr (no single
  // number singled out: user, 16 Okt).
  'hb-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 744.0, to: 746.0}],
        cam: {from: TOP, to: PERF, at: 0.1, dur: 1.8},
        marks: [{kind: 'ring', rect: STATS, at: {max: [{line: 'hb-2-win', word: 'statistik'}, 1.6]}, pad: 6}],
        blur: HB_BLUR,
      },
    ],
  },
  // Same view: the Performance table ringed as a whole on "Performance" (no row singled out).
  'hb-3': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 746.0, to: 748.0}],
        cam: {from: PERF},
        marks: [{kind: 'ring', rect: PERF_CARD, at: {line: 'hb-3-setups', word: 'Performance'}}],
        blur: HB_BLUR,
      },
    ],
  },
  // The page scrolls as "Live Signals" starts; the camera eases out with it. The Live signals panel on "Live" (once the
  // scroll has settled), the Active signals table on "Active". All values blurred (HB_BLUR).
  'hb-4': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 748.0, to: 752.4, align: 749.57, at: {line: 'hb-4-live'}}],
        cam: {from: PERF, to: LIVE, at: {rec: 749.6}, dur: 2.0},
        marks: [
          {kind: 'ring', rect: LIVE_PANEL, at: {max: [{line: 'hb-4-live', word: 'Live'}, {rec: 751.9}]}, pad: 4},
          {kind: 'ring', rect: ACTIVE, at: {line: 'hb-4-active', word: 'Active'}},
        ],
        blur: HB_BLUR,
      },
    ],
  },
  // Scroll down to Trade history (title ringed on "Trade"), page 1's Return column (mostly red, 2026) on "merahnya";
  // one jump cut over the paging to pages 5–7 (late 2025) during the caveat, held without a highlight.
  'hb-5': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 762.6, to: 767.9, align: 763.2, at: {line: 'hb-5-history'}},
          {from: 775.2, to: 781.4, at: {line: 'hb-5-caveat', word: 'sinyalnya'}},
        ],
        cam: {from: LIVE, to: TRADES, at: {rec: 763.2}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: HISTORY_TITLE, at: {max: [{line: 'hb-5-history', word: 'Trade'}, {rec: 764.2}]}, pad: 6},
          {kind: 'ring', rect: RETURN_COL, at: {line: 'hb-5-honest', word: 'merahnya'}, until: {line: 'hb-5-caveat', word: 'sinyalnya', off: -0.1}, pad: 6},
        ],
        blur: HB_BLUR,
      },
    ],
  },
};
