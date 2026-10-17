// Chapter 03 · Stock (scenes stock-1…stock-21). Source: New.mp4 1:29–6:16 (clips stock-a…q, clips/stock.json).
// Frame-checked 15 Okt (raw seconds): Stock nav 91.17 (PTBA page 91.7); search typed 96.4–97.3, ERAA picked 99.13
// (page 99.47). Tech menu 103.03; MA200 double-click 105.33/105.53; AVWAP 109.87; IHSG 112.57; menu shut 116.63 +
// chart drag 116.8–119.4. Menu again 121.43, IHSG off ~122.5, S/R 124.03, shut 125.9. Menu 132.5, Tren 133.73, shut
// 135.47, zoom-out 135.93. Menu 144.7, Breakout 146.6, shut 147.5, zoom-out 148.1–149.2; horizontal line drawn at 425
// placed 155.47 (boxes 161–164, deleted 167.73).
// Page scrolls 300 px 171.2–171.9. Flow menu 175.83 (a stray Tech menu 174.93); Bandar 176.93, Retail 179.6, Foreign
// 182.07, SM Local 184.6. Stats menu 187.87, HB Signals on 189.4 (REV chip) / off ~190.2; Drivers 193.47, candles
// 196.23 (13 Jul) + 199.03 (14 Okt) → panel. Insider 218.77, drag to 2025 220.93–227.2. Data Flows: scroll 242.97,
// Retail chip 246.53, Foreign 249.47, SM Local 252.2; note "Pola broker ritel tidak biasa: CP" 262.6–270.3 (other
// scroll). Broker summary: scroll 280.0; 13 Jul 299.47, 3 Sep 302.13, 4 Sep 306.23; POSITION scroll 326.47; Huge Nego
// 336.1; Broker Activity 339.2; AK isolated 360.73; BA fullscreen 367.43 / exit 370.0; chart fullscreen 374.47 / exit 379.567.
// Page layouts differ per scroll position, so every rect below is measured in the state it is ringed in (noted).
import type {Beat, CamPos, Rect} from '../../../core/tutorial/types';
import {FULL, NAV, REC, navCenter} from './common';

// No labels in this chapter: every ring is named by the voice (const L omitted on purpose).

// ---------------------------------------------------------------------------------------------
// Framings (centre + zoom, raw px)
/** Menu bar, search box, ERAA header and the chart toolbar (page top). */
const TOP: CamPos = {x: 1912, y: 800, zoom: 1.45};
/** Stock Health card (x 2612–3208, y 980–1660), bottom clear of the subtitles. */
const HEALTH: CamPos = {x: 2700, y: 1380, zoom: 2.3};
/** Tech menu (x 876–1190, y 841–1416) with the left of the chart. */
const TECH: CamPos = {x: 1500, y: 1180, zoom: 2.2};
/** Whole price chart before the scroll (menu top y 902 to the support line y 1826; axis tags x 2565). */
const CHART: CamPos = {x: 1590, y: 1455, zoom: 1.75};
/** Chart after the 300 px scroll (toolbar y 541, price pane to y 1600). Flow, Stats, Drivers, Insider. */
const FLOWV: CamPos = {x: 1600, y: 1080, zoom: 1.8};
/** Drivers panel (x 650–1307, y 725–945), close enough to read the rows. */
const DRV: CamPos = {x: 1340, y: 860, zoom: 2.6};
/** Drivers panel filling the window (x 650–1307, y 725–945): the colour boxes of each row are readable. */
const DRV_GRID: CamPos = {x: 978, y: 850, zoom: 4.6};
/** Data Flows histogram (y 985–1200) + its chips (y 1290–1340), page scrolled to the broker summary (243.5–256.7). */
const DF: CamPos = {x: 1620, y: 1080, zoom: 1.9};
/** Same state, closer: SM Local histogram with its yellow bars. */
const HIST: CamPos = {x: 1480, y: 1150, zoom: 2.2};
/** Scroll state 262–270: the readout line with the note, top-left of the chart. */
const NOTE: CamPos = {x: 1490, y: 870, zoom: 2.2};
/** Scroll state 262–270: SM Local histogram + chips + the "Anomali Broker Ritel: CP" badge. */
const BADGE: CamPos = {x: 1480, y: 1560, zoom: 2.2};
/** Both broker summary tables with the filter bar (state 281.6–287.5). */
const TABLES: CamPos = {x: 1910, y: 1000, zoom: 1.45};
/** Start Range date pickers and calendar (state 294.3–307.5). */
const PICK: CamPos = {x: 1620, y: 1300, zoom: 2.0};
/** Start Range table bottom: TOP 1/3/5 and BROKER rows (state 308.3–317.9). */
const TOPS: CamPos = {x: 1620, y: 1560, zoom: 2.0};
/** End Range pickers, calendar and top buyers (state 294.3–307.5). */
const ENDV: CamPos = {x: 2560, y: 1350, zoom: 2.0};
/** POSITION / Huge Nego / Broker Activity: full table width (x 700–3107). */
const POS: CamPos = {x: 1880, y: 1270, zoom: 1.55};
/** Broker Activity's top-right corner (fullscreen icon x 3117–3169, y 937–990). */
const BA_CORNER: CamPos = {x: 2700, y: 1250, zoom: 1.8};
/** Main chart in fullscreen: its small exit-fullscreen icon top-right (x 3758–3806, y 160–208), close up. */
// Both ends centred on the page's top-right corner: at zoom 1 that is the whole page (same picture as FULL), and as
// the zoom grows the clamped view stays pinned to the corner, so the icon is in frame for the whole move.
const EXIT_FROM: CamPos = {x: 3840, y: 132, zoom: 1};
const EXIT_CAM: CamPos = {x: 3840, y: 132, zoom: 3};

// ---------------------------------------------------------------------------------------------
// Elements (raw px), with the moment they were measured
// Page top (89–171)
const SEARCH: Rect = {x: 615, y: 380, w: 900, h: 82};
const DROP_ROW: Rect = {x: 615, y: 474, w: 900, h: 90}; // 98.5, single "ERAA · Erajaya Swasembada Tbk" row
const ERAA_HEAD: Rect = {x: 708, y: 505, w: 380, h: 105}; // 100.5, ticker + company name
const HEALTH_GRID: Rect = {x: 2640, y: 1045, w: 540, h: 345}; // title + Trend/MA/Bandar/ATH/RS/VP grid
const RS: Rect = {x: 2652, y: 1306, w: 258, h: 74};
const SR_LEVELS: Rect = {x: 2645, y: 1538, w: 240, h: 92};
const TECH_BTN: Rect = {x: 876, y: 841, w: 152, h: 46};
const TECH_MENU: Rect = {x: 876, y: 902, w: 314, h: 514};
/** Tech menu rows (x 888–1178): MA50 908, MA100 965, MA200 1023, Vol MA50 1078, AVWAP 1135, IHSG 1190, S/R 1245, Tren 1300, Breakout 1355. */
const techItem = (top: number): Rect => ({x: 888, y: top, w: 290, h: 47});
const MA_ROWS: Rect = {x: 888, y: 908, w: 290, h: 165};
const ITEM_X = 1030;
const AVWAP_TAG: Rect = {x: 2378, y: 1250, w: 88, h: 32}; // 115
const AVWAP_ANCHOR: Rect = {x: 885, y: 1678, w: 40, h: 56}; // 115, the "V" start point
const IHSG_FALL: Rect = {x: 2020, y: 975, w: 440, h: 460}; // 115, IHSG sliding while ERAA candles stay flat
const R_LINE: Rect = {x: 680, y: 1002, w: 1890, h: 48}; // 129, R 645 line + tag
const TREN_YELLOW: Rect = {x: 680, y: 965, w: 1800, h: 75}; // 135.85
const TREN_BLUE: Rect = {x: 615, y: 1685, w: 1860, h: 150}; // 135.85
const BO_CANDLE: Rect = {x: 1585, y: 1385, w: 40, h: 85}; // 147.95, the yellow August candle
// After the chart's zoom-out (149.2–167.7): the user's hand-drawn horizontal line at 425 (placed 155.47, deleted
// 167.73), the yellow August candle that jumps over it, and the climb after it.
const DRAWN_LINE: Rect = {x: 680, y: 1455, w: 1790, h: 24}; // 158
const BO_CANDLE2: Rect = {x: 2056, y: 1378, w: 34, h: 85}; // 158
const BO_RISE2: Rect = {x: 2045, y: 985, w: 420, h: 495}; // 158
// Chart after the 300 px scroll (171.9–242)
const FLOW_MENU: Rect = {x: 1036, y: 600, w: 314, h: 240};
const FLOW_ITEM_Y = {bandar: 636, retail: 691, foreign: 746, sm: 802};
const BANDAR_TAG: Rect = {x: 2376, y: 683, w: 90, h: 32}; // 178.5
const RETAIL_FALL: Rect = {x: 1400, y: 660, w: 770, h: 780}; // 180.8, Aug–Oct slide
const SM_RISE: Rect = {x: 1950, y: 1095, w: 220, h: 340}; // 185.8, October rebound
const STATS_ITEM = {hb: {x: 1170, y: 612, w: 285, h: 46}, drivers: {x: 1170, y: 667, w: 285, h: 48}, insider: {x: 1170, y: 722, w: 285, h: 48}};
const REV_CHIP: Rect = {x: 1432, y: 546, w: 72, h: 36}; // 190.0
const DRIVERS_PANEL: Rect = {x: 650, y: 725, w: 657, h: 220}; // 200.5
const AK_ROW: Rect = {x: 655, y: 770, w: 580, h: 40};
const BK_ROW: Rect = {x: 655, y: 857, w: 545, h: 40};
/** Colour boxes per candle (state 203–210.9): all four rows; AK's most recent (right) boxes; BK's whole strip. */
const GRID_ALL: Rect = {x: 868, y: 772, w: 192, h: 165};
const AK_RECENT: Rect = {x: 985, y: 776, w: 74, h: 26};
const BK_STRIP: Rect = {x: 868, y: 864, w: 192, h: 26};
const UBAH: Rect = {x: 1172, y: 732, w: 120, h: 28};
const INSIDER_ARROW: Rect = {x: 1855, y: 1235, w: 45, h: 65}; // 229, 21 Mar '25
// Data Flows (state 243.5–256.7)
const HISTO: Rect = {x: 615, y: 980, w: 1450, h: 230};
const DF_CHIPS: Rect = {x: 636, y: 1290, w: 745, h: 52};
const SM_YELLOW: Rect = {x: 1895, y: 1075, w: 120, h: 110}; // 252.6, October yellow bars
// Data Flows (state 262–270)
const NOTE_LINE: Rect = {x: 640, y: 495, w: 400, h: 42};
const ANOMALY_BADGE: Rect = {x: 1398, y: 1744, w: 320, h: 44};
// Broker summary (state 281.6–287.5 and 308.3–317.9; the 294–307.5 state sits 298 px lower)
const TABLE_HEADS: Rect = {x: 680, y: 717, w: 2510, h: 130};
const FILTERS: Rect = {x: 630, y: 527, w: 980, h: 75};
const START_DATES: Rect = {x: 695, y: 1075, w: 550, h: 60}; // 294–307.5 state
const END_DATES: Rect = {x: 2005, y: 1077, w: 545, h: 55}; // 294–307.5 state
const END_BUYERS: Rect = {x: 2000, y: 1205, w: 560, h: 115}; // 306.5, BK 129,2B + KI 98,1B
const START_TOPS: Rect = {x: 690, y: 1645, w: 1120, h: 170}; // 312
const START_BROKERS: Rect = {x: 690, y: 1828, w: 1120, h: 55}; // 312, 25 vs 49
// POSITION (state 326.7–336.1)
const POSITION: Rect = {x: 690, y: 1034, w: 2430, h: 480};
const POS_AK: Rect = {x: 690, y: 1218, w: 2430, h: 52};
const POS_BK: Rect = {x: 690, y: 1278, w: 2430, h: 52};
const PLUS_BROKER: Rect = {x: 692, y: 1085, w: 255, h: 56};
// Huge Nego (state 336.9–339.2)
const HN_TITLE: Rect = {x: 685, y: 1114, w: 160, h: 44};
const HN_TABLE: Rect = {x: 690, y: 1170, w: 2410, h: 370}; // 338.5, header + 5 rows
const HN_ROW: Rect = {x: 690, y: 1422, w: 2410, h: 44}; // 2026-08-04 KI ← LG 50.63 B
// Broker Activity (state 339.9–367.4)
const BA_TITLE: Rect = {x: 640, y: 888, w: 210, h: 46};
const BA_RISERS: Rect = {x: 1990, y: 1147, w: 900, h: 520}; // BK + KI climbing
const BA_FALLERS: Rect = {x: 2490, y: 1492, w: 610, h: 190}; // AK + ZP easing off, with their tags
const BA_TABS: Rect = {x: 1418, y: 950, w: 628, h: 70};
const AK_CHIP: Rect = {x: 1104, y: 1058, w: 141, h: 44};
const AK_LATE: Rect = {x: 2560, y: 1152, w: 330, h: 240}; // 361.8, AK alone, falling since late Sep
const BA_FS: Rect = {x: 3117, y: 959, w: 52, h: 53};
const CHART_FS: Rect = {x: 2498, y: 717, w: 50, h: 50}; // 374.3 (page scrolled near the top)
const EXIT_FS: Rect = {x: 3758, y: 160, w: 48, h: 48}; // 379.4, chart fullscreen: exit icon (clicked 379.567)

const mid = (r: Rect) => ({x: r.x + r.w / 2, y: r.y + r.h / 2});

export const beats: Record<string, Beat> = {
  // Watchlist → Stock (91.17) on "Stock" under the chapter card's tail; the whole page, then one move to the top
  // area once PTBA has loaded. Search ringed on "Ketik" (typing from 96.4), the single ERAA row on "lalu", the pick
  // on "daftarnya"; ERAA's header ringed on "ERAA".
  'stock-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 89.6, to: 92.6, align: 91.17, at: {line: 'stock-1-open', word: 'Stock'}},
          {from: 94.6, to: 98.1, align: 96.4, at: {line: 'stock-1-search', word: 'Ketik'}},
          {from: 98.1, to: 100.6, align: 99.13, at: {line: 'stock-1-search', word: 'daftarnya'}},
        ],
        cam: {from: FULL, to: TOP, at: {rec: 91.8}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NAV.Stock, at: {line: 'stock-1-open', word: 'menu'}, until: {rec: 91.17, off: 0.5}, pad: 4},
          {kind: 'click', ...navCenter('Stock'), rec: 91.17},
          {kind: 'ring', rect: SEARCH, at: {line: 'stock-1-search', word: 'Ketik'}, until: {rec: 97.3}, pad: 4},
          {kind: 'ring', rect: DROP_ROW, at: {max: [{line: 'stock-1-search', word: 'lalu'}, {rec: 97.35}]}, until: {rec: 99.13, off: 0.3}, pad: 4},
          {kind: 'click', x: 785, y: 525, rec: 99.13},
          {kind: 'ring', rect: ERAA_HEAD, at: {line: 'stock-1-eraa', word: 'ERAA'}, pad: 6},
        ],
      },
    ],
  },
  // The ERAA page held; the camera eases onto Stock Health. One ring per line: the health grid, the RS cell, the
  // S/R levels.
  'stock-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 100.6, to: 102.9}],
        cam: {from: TOP, to: HEALTH, at: {line: 'stock-2-health', word: 'kanan'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: HEALTH_GRID, at: {line: 'stock-2-health', word: 'Stock'}, pad: 6},
          {kind: 'ring', rect: RS, at: {line: 'stock-2-rs', word: 'RS'}, pad: 4},
          {kind: 'ring', rect: SR_LEVELS, at: {line: 'stock-2-sr', word: 'bawahnya'}, pad: 6},
        ],
      },
    ],
  },
  // Back to the chart's corner: Tech opens on "Tech" (103.03), the three MA rows ringed on "MA50"; the menu on the
  // second line's "Klik"; MA200 ringed and double-clicked (105.53) on "kali" → only MA200 stays.
  'stock-3': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 102.9, to: 105.2, align: 103.03, at: {line: 'stock-3-tech', word: 'Tech'}},
          {from: 105.2, to: 107.6, align: 105.53, at: {line: 'stock-3-click', word: 'kali'}},
        ],
        cam: {from: HEALTH, to: TECH, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: TECH_BTN, at: {line: 'stock-3-tech', word: 'Buka'}, until: {rec: 103.03, off: 0.5}, pad: 4},
          {kind: 'click', x: 952, y: 864, rec: 103.03},
          {kind: 'ring', rect: MA_ROWS, at: {line: 'stock-3-tech', word: 'MA50'}, pad: 4},
          {kind: 'ring', rect: TECH_MENU, at: {line: 'stock-3-click', word: 'Klik'}, pad: 4},
          {kind: 'ring', rect: techItem(1023), at: {line: 'stock-3-click', word: 'Klik', nth: 1}, until: {rec: 105.53, off: 0.6}, pad: 3, spot: true},
          {kind: 'click', x: 945, y: 1046, rec: 105.33},
          {kind: 'click', x: 945, y: 1046, rec: 105.53},
        ],
      },
    ],
  },
  // AVWAP on (109.87) on "AVWAP"; the camera eases out to the whole chart; the AVWAP tag, then its auto anchor (the
  // "V" at the June low, spotlit). IHSG on (112.57) on "IHSG"; the stretch where IHSG slides while ERAA holds flat.
  'stock-4': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 109.4, to: 112.0, align: 109.87, at: {line: 'stock-4-avwap', word: 'AVWAP'}},
          {from: 112.0, to: 116.5, align: 112.57, at: {line: 'stock-4-ihsg', word: 'IHSG'}},
        ],
        cam: {from: TECH, to: CHART, at: {line: 'stock-4-avwap', word: 'harga'}, dur: 1.8},
        marks: [
          {kind: 'click', x: ITEM_X, y: 1157, rec: 109.87},
          {kind: 'ring', rect: AVWAP_TAG, at: {line: 'stock-4-avwap', word: 'ditimbang'}, pad: 6},
          {kind: 'ring', rect: AVWAP_ANCHOR, at: {line: 'stock-4-avwap', word: 'titik'}, pad: 6, spot: true},
          {kind: 'ring', rect: techItem(1190), at: {line: 'stock-4-ihsg', word: 'Klik'}, until: {rec: 112.57, off: 0.5}, pad: 3},
          {kind: 'click', x: ITEM_X, y: 1213, rec: 112.57},
          {kind: 'ring', rect: IHSG_FALL, at: {line: 'stock-4-ihsg', word: 'Waktu'}, pad: 6},
        ],
      },
    ],
  },
  // Menu reopened (IHSG already off): S/R on (124.03) on "S/R"; the R 645 line ringed on "Resistance-nya".
  'stock-5': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 123.2, to: 131.8, align: 124.03, at: {line: 'stock-5-sr', word: 'S/R'}}],
        cam: {from: CHART},
        marks: [
          {kind: 'ring', rect: techItem(1245), at: {line: 'stock-5-sr', word: 'Klik'}, until: {rec: 124.03, off: 0.5}, pad: 3},
          {kind: 'click', x: ITEM_X, y: 1268, rec: 124.03},
          {kind: 'ring', rect: R_LINE, at: {line: 'stock-5-sr', word: 'Resistance-nya'}, pad: 4},
        ],
      },
    ],
  },
  // Tren on (133.73) on "Tren" (S/R off in the same pass); held before the zoom-out: yellow line on "Kuning", blue
  // on "biru".
  'stock-6': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 132.3, to: 135.9, align: 133.73, at: {line: 'stock-6-tren', word: 'Tren'}}],
        cam: {from: CHART},
        marks: [
          {kind: 'click', x: ITEM_X, y: 1323, rec: 133.73},
          {kind: 'ring', rect: TREN_YELLOW, at: {line: 'stock-6-tren', word: 'Kuning'}, pad: 4},
          {kind: 'ring', rect: TREN_BLUE, at: {line: 'stock-6-tren', word: 'biru'}, pad: 4},
        ],
      },
    ],
  },
  // Breakout on (146.6) on "Breakout"; held before the zoom-out: the yellow August candle (spotlit). Second shot
  // (crossfade, chart already zoomed out) on "Garis": the user's horizontal line is placed at 425 (155.47) on
  // "manual" and ringed; the yellow candle that jumps over it on "candle"; the climb after it on "harganya".
  'stock-7': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 145.6, to: 148.05, align: 146.6, at: {line: 'stock-7-breakout', word: 'Breakout'}}],
        cam: {from: CHART},
        marks: [
          {kind: 'ring', rect: techItem(1355), at: {line: 'stock-7-breakout', word: 'Klik'}, until: {rec: 146.6, off: 0.5}, pad: 3},
          {kind: 'click', x: ITEM_X, y: 1378, rec: 146.6},
          {kind: 'ring', rect: BO_CANDLE, at: {line: 'stock-7-breakout', word: 'diwarnai'}, pad: 6, spot: true},
        ],
      },
      {
        rec: REC,
        start: {line: 'stock-7-drawn'},
        pieces: [{from: 153.3, to: 161.0, align: 155.467, at: {line: 'stock-7-drawn', word: 'manual'}}],
        cam: {from: CHART},
        marks: [
          {kind: 'click', x: 1170, y: 1467, rec: 155.467},
          {kind: 'ring', rect: DRAWN_LINE, at: {max: [{line: 'stock-7-drawn', word: 'manual'}, {rec: 155.6}]}, pad: 4},
          {kind: 'ring', rect: BO_CANDLE2, at: {line: 'stock-7-drawn', word: 'candle'}, pad: 6, spot: true},
          {kind: 'ring', rect: BO_RISE2, at: {line: 'stock-7-aug', word: 'harganya'}, pad: 6},
        ],
      },
    ],
  },
  // After the page scroll: Flow menu opens on "Flow"; Bandar on as it's named (176.93), Retail on "Retail" (179.6),
  // Foreign (182.07) and SM Local (184.6) on their words. Rings: the menu, the Bandar tag, Retail's slide, SM Local's
  // October rebound.
  'stock-8': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 175.85, to: 178.8, align: 175.85, at: {line: 'stock-8-flow', word: 'Flow'}},
          {from: 178.8, to: 181.4, align: 179.6, at: {line: 'stock-8-retail', word: 'Retail'}},
          {from: 181.4, to: 184.0, align: 182.07, at: {line: 'stock-8-rest', word: 'Foreign'}},
          {from: 184.0, to: 186.6, align: 184.6, at: {line: 'stock-8-rest', word: 'SM'}},
        ],
        cam: {from: FLOWV},
        marks: [
          {kind: 'ring', rect: FLOW_MENU, at: {line: 'stock-8-flow', word: 'isinya'}, pad: 4},
          {kind: 'click', x: 1150, y: FLOW_ITEM_Y.bandar, rec: 176.93},
          {kind: 'ring', rect: BANDAR_TAG, at: {line: 'stock-8-bandar', word: 'Bandar'}, pad: 6},
          {kind: 'click', x: 1150, y: FLOW_ITEM_Y.retail, rec: 179.6},
          {kind: 'ring', rect: RETAIL_FALL, at: {line: 'stock-8-retail', word: 'turun'}, pad: 6},
          {kind: 'click', x: 1150, y: FLOW_ITEM_Y.foreign, rec: 182.07},
          {kind: 'click', x: 1150, y: FLOW_ITEM_Y.sm, rec: 184.6},
          {kind: 'ring', rect: SM_RISE, at: {line: 'stock-8-rest', word: 'belakangan'}, pad: 6},
        ],
      },
    ],
  },
  // Stats menu: HB Signals ringed on "HB Signals", switched on (189.4) on "nandain"; held with the REV chip showing
  // (the user switched it off again at ~190.2), chip ringed on "REV".
  'stock-9': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 187.9, to: 190.1, align: 189.4, at: {line: 'stock-9-hbsig', word: 'nandain'}}],
        cam: {from: FLOWV},
        marks: [
          {kind: 'ring', rect: STATS_ITEM.hb, at: {line: 'stock-9-hbsig', word: 'HB'}, pad: 3},
          {kind: 'click', x: 1230, y: 635, rec: 189.4},
          {kind: 'ring', rect: REV_CHIP, at: {line: 'stock-9-hbsig', word: 'REV'}, pad: 6, spot: true},
        ],
      },
    ],
  },
  // Drivers clicked (193.47) on "Drivers"; first candle (13 Jul, 196.23) on "awal", last (14 Okt, 199.03) on
  // "akhir" → the panel; the panel ringed on "Drivers" (second line).
  'stock-10': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 190.3, to: 196.0, align: 193.47, at: {line: 'stock-10-click', word: 'Drivers'}},
          {from: 196.0, to: 197.0, align: 196.23, at: {line: 'stock-10-click', word: 'awal'}},
          // Jump cut over 197.0–198.6 (cursor already parked at the last candle): on the real voice "awal" and
          // "akhir" are only 0,5 s apart, so without it the end click landed 1,2 s after "akhir".
          {from: 198.6, to: 201.4, align: 199.03, at: {line: 'stock-10-click', word: 'akhir'}},
        ],
        cam: {from: FLOWV},
        marks: [
          {kind: 'ring', rect: STATS_ITEM.drivers, at: {line: 'stock-10-click', word: 'klik'}, until: {rec: 193.47, off: 0.5}, pad: 3},
          {kind: 'click', x: 1230, y: 691, rec: 193.47},
          {kind: 'click', x: 1353, y: 1342, rec: 196.23},
          {kind: 'click', x: 2155, y: 845, rec: 199.03},
          {kind: 'ring', rect: DRIVERS_PANEL, at: {line: 'stock-10-what', word: 'Drivers'}, pad: 6},
        ],
      },
    ],
  },
  // One slow move in until the Drivers panel fills the window (zoom 4,6: every colour box readable). AK's row on
  // "AK", BK's on "BK"; all four box strips on "kotak"; AK's most recent (right-hand, red/purple) boxes on "AK" of the
  // read line (spotlit), BK's whole strip (green/blue) on "BK"; "Ubah range" on "Ubah".
  'stock-11': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 203.0, to: 210.9}],
        cam: {from: FLOWV, to: DRV_GRID, at: 0.1, dur: 2.2},
        marks: [
          {kind: 'ring', rect: AK_ROW, at: {line: 'stock-11-ak', word: 'AK'}, pad: 4},
          {kind: 'ring', rect: BK_ROW, at: {line: 'stock-11-bk', word: 'BK'}, pad: 4},
          {kind: 'ring', rect: GRID_ALL, at: {line: 'stock-11-grid', word: 'kotak'}, pad: 6},
          {kind: 'ring', rect: AK_RECENT, at: {line: 'stock-11-read', word: 'AK'}, pad: 4, spot: true},
          {kind: 'ring', rect: BK_STRIP, at: {line: 'stock-11-read', word: 'BK'}, pad: 4, spot: true},
          {kind: 'ring', rect: UBAH, at: {line: 'stock-11-range', word: 'Ubah'}, pad: 4},
        ],
      },
    ],
  },
  // Back out to the chart: Insider ringed and switched on (218.77) on "Insider"; the drag back to 2025 starts with
  // the second line at 1,6× (no words about it any more); the green insider arrow (spotlit) on "panah", held to
  // the end (the hover readout above it shows on its own; no second ring, the line is short).
  'stock-12': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 217.4, to: 220.85, align: 218.77, at: {line: 'stock-12-insider', word: 'Insider'}},
          {from: 220.85, to: 229.5, align: 220.93, at: {line: 'stock-12-arrow'}, rate: 1.6},
        ],
        cam: {from: DRV_GRID, to: FLOWV, at: 0.1, dur: 2.0},
        marks: [
          {kind: 'ring', rect: STATS_ITEM.insider, at: {line: 'stock-12-insider', word: 'Klik'}, until: {rec: 218.77, off: 0.6}, pad: 3},
          {kind: 'click', x: 1230, y: 746, rec: 218.77},
          {kind: 'ring', rect: INSIDER_ARROW, at: {max: [{line: 'stock-12-arrow', word: 'panah'}, {rec: 228.0}]}, pad: 6, spot: true},
        ],
      },
    ],
  },
  // Scroll down to Data Flows on "Di bawah chart"; the histogram ringed; the chips on "Klik" as Retail (246.53) and
  // Foreign (249.47) are switched.
  'stock-13': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 242.6, to: 251.5, align: 246.53, at: {line: 'stock-13-toggle', word: 'Klik'}}],
        cam: {from: DF},
        marks: [
          {kind: 'ring', rect: HISTO, at: {max: [{line: 'stock-13-data', word: 'Data'}, {rec: 243.6}]}, pad: 6},
          {kind: 'ring', rect: DF_CHIPS, at: {line: 'stock-13-toggle', word: 'Klik'}, pad: 6},
          {kind: 'click', x: 998, y: 1317, rec: 246.53},
          {kind: 'click', x: 1142, y: 1317, rec: 249.47},
        ],
      },
    ],
  },
  // SM Local histogram (252.2) on "SM Local", closer; the yellow October bars (spotlit) on "kuning". Then the later
  // pass with the hover note (262.6): the note on "catatannya", one move down to the badge on the third line.
  'stock-14': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 251.6, to: 256.6, align: 252.2, at: {line: 'stock-14-yellow', word: 'SM'}}],
        cam: {from: DF, to: HIST, at: 0.1, dur: 1.6},
        marks: [
          {kind: 'click', x: 1300, y: 1317, rec: 252.2},
          {kind: 'ring', rect: SM_YELLOW, at: {line: 'stock-14-yellow', word: 'kuning'}, pad: 6, spot: true},
        ],
      },
      {
        rec: REC,
        start: {line: 'stock-14-note'},
        pieces: [{from: 262.45, to: 270.2, align: 262.6, at: {line: 'stock-14-note', word: 'catatannya'}}],
        cam: {from: NOTE, to: BADGE, at: {line: 'stock-14-badge'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NOTE_LINE, at: {max: [{line: 'stock-14-note', word: 'catatannya'}, {rec: 262.7}]}, pad: 4},
          {kind: 'ring', rect: ANOMALY_BADGE, at: {line: 'stock-14-badge', word: 'Anomali'}, pad: 4},
        ],
      },
    ],
  },
  // Scroll to the broker summary on "Geser lagi"; both tables' headers ringed on "dua"; the filter bar on "atasnya".
  'stock-15': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 279.9, to: 287.4, align: 280.03, at: {line: 'stock-15-tables', word: 'Geser'}}],
        cam: {from: TABLES},
        marks: [
          {kind: 'ring', rect: TABLE_HEADS, at: {max: [{line: 'stock-15-tables', word: 'dua'}, {rec: 281.7}]}, pad: 6},
          {kind: 'ring', rect: FILTERS, at: {line: 'stock-15-filters', word: 'atasnya'}, pad: 6},
        ],
      },
    ],
  },
  // Start Range: pickers ringed on "Start"; 13 Jul picked on "periode" (the important one), 3 Sep on "terakhir". Then the filled table's bottom:
  // TOP 1/3/5 on "TOP 1", the broker count (25 vs 49) on "cuma".
  'stock-16': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 295.3, to: 299.6, align: 299.47, at: {line: 'stock-16-range', word: 'periode', nth: 1}},
          {from: 299.6, to: 302.6, align: 302.13, at: {line: 'stock-16-range', word: 'terakhir'}},
        ],
        cam: {from: PICK},
        marks: [
          {kind: 'ring', rect: START_DATES, at: {line: 'stock-16-range', word: 'Start'}, pad: 4},
          {kind: 'click', x: 795, y: 1415, rec: 299.47},
          {kind: 'click', x: 1243, y: 1293, rec: 302.13},
        ],
      },
      {
        rec: REC,
        start: {line: 'stock-16-top'},
        pieces: [{from: 308.4, to: 317.8}],
        cam: {from: TOPS},
        marks: [
          {kind: 'ring', rect: START_TOPS, at: {line: 'stock-16-top', word: 'TOP', off: 0.3}, pad: 6},
          {kind: 'ring', rect: START_BROKERS, at: {line: 'stock-16-count', word: 'cuma'}, pad: 4},
        ],
      },
    ],
  },
  // End Range (recorded before the scroll, so its own shot): 4 Sep picked on "konsolidasi"; the pickers ringed, then
  // the new top buyers BK and KI on "BK".
  'stock-17': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 304.4, to: 307.4, align: 306.23, at: {line: 'stock-17-range', word: 'konsolidasi'}}],
        cam: {from: ENDV},
        marks: [
          {kind: 'ring', rect: END_DATES, at: {line: 'stock-17-range', word: 'End'}, pad: 4},
          {kind: 'click', x: 2318, y: 1293, rec: 306.23},
          {kind: 'ring', rect: END_BUYERS, at: {line: 'stock-17-buyers', word: 'BK'}, pad: 6},
        ],
      },
    ],
  },
  // Scroll to POSITION on "Begitu"; the table on "Position", AK's row on "AK", BK's on "BK", "+ Broker" on "tombol".
  'stock-18': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 326.3, to: 335.9, align: 326.47, at: {line: 'stock-18-what', word: 'Begitu'}}],
        cam: {from: POS},
        marks: [
          {kind: 'ring', rect: POSITION, at: {max: [{line: 'stock-18-what', word: 'Position'}, {rec: 326.8}]}, pad: 6},
          {kind: 'ring', rect: POS_AK, at: {line: 'stock-18-ak', word: 'AK'}, pad: 4},
          {kind: 'ring', rect: POS_BK, at: {line: 'stock-18-bk', word: 'BK'}, pad: 4},
          {kind: 'ring', rect: PLUS_BROKER, at: {line: 'stock-18-add', word: 'tombol'}, pad: 4},
        ],
      },
    ],
  },
  // Scroll to Huge Nego as it's named; the title, then the 4 Agustus row (KI ← LG 50.63 B); the page holds on the
  // table through the third line, the whole table ringed on "Huge Nego" (it filters the big ones for you).
  'stock-19': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 335.95, to: 339.15}],
        cam: {from: POS},
        marks: [
          {kind: 'ring', rect: HN_TITLE, at: {max: [{line: 'stock-19-what', word: 'Huge'}, {rec: 336.95}]}, pad: 6},
          {kind: 'ring', rect: HN_ROW, at: {line: 'stock-19-example', word: 'Contohnya'}, pad: 4},
          {kind: 'ring', rect: HN_TABLE, at: {line: 'stock-19-manual', word: 'Huge'}, pad: 6},
        ],
      },
    ],
  },
  // Scroll to Broker Activity at once; its title, BK + KI climbing, AK + ZP easing off, the range/origin tabs.
  'stock-20': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 339.15, to: 353.9}],
        cam: {from: POS},
        marks: [
          {kind: 'ring', rect: BA_TITLE, at: {max: [{line: 'stock-20-panel', word: 'Broker'}, {rec: 340.0}]}, pad: 6},
          {kind: 'ring', rect: BA_RISERS, at: {line: 'stock-20-read', word: 'BK'}, pad: 6},
          {kind: 'ring', rect: BA_FALLERS, at: {line: 'stock-20-read', word: 'AK'}, pad: 6},
          {kind: 'ring', rect: BA_TABS, at: {line: 'stock-20-tabs', word: 'Rentang'}, pad: 4},
        ],
      },
    ],
  },
  // AK chip ringed, double-clicked (360.73) on "cuma" → only AK; its late slide ringed on "Jelas". New shot on the
  // second line: the fullscreen icon (spotlit), clicked (367.43) on "layar" while the camera eases out to the whole
  // page; the panel stays fullscreen (its exit at 370.0 is not shown). Last shot on "Chart": the main chart's
  // fullscreen icon, clicked (374.47) on "tombol"; fullscreen holds; on the exit line the camera eases in on the small
  // exit icon top-right, ringed from "keluar", clicked (379.567) on "pojok"; on "atas" a crossfade to the whole
  // windowed page.
  'stock-21': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 359.8, to: 362.0, align: 360.73, at: {line: 'stock-21-dbl', word: 'cuma'}}],
        cam: {from: POS},
        marks: [
          {kind: 'ring', rect: AK_CHIP, at: {line: 'stock-21-dbl', word: 'nama'}, until: {rec: 360.73, off: 0.6}, pad: 4},
          {kind: 'click', ...mid(AK_CHIP), rec: 360.5},
          {kind: 'click', ...mid(AK_CHIP), rec: 360.73},
          {kind: 'ring', rect: AK_LATE, at: {line: 'stock-21-dbl', word: 'Jelas'}, pad: 6},
        ],
      },
      {
        rec: REC,
        start: {line: 'stock-21-full'},
        pieces: [{from: 366.6, to: 369.9, align: 367.43, at: {line: 'stock-21-full', word: 'layar'}}],
        cam: {from: BA_CORNER, to: FULL, at: {rec: 367.5}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: BA_FS, at: {line: 'stock-21-full', word: 'pojok'}, until: {rec: 367.43, off: 0.3}, pad: 6, spot: true},
          {kind: 'click', ...mid(BA_FS), rec: 367.43},
        ],
      },
      {
        rec: REC,
        start: {line: 'stock-21-full', word: 'Chart'},
        pieces: [
          {from: 373.85, to: 375.6, align: 374.47, at: {line: 'stock-21-full', word: 'tombol'}},
          // Jump cut over 375.6–377.5 (fullscreen chart static, only the cursor travels to the corner).
          {from: 377.5, to: 380.0, align: 379.567, at: {line: 'stock-21-exit', word: 'pojok'}},
        ],
        cam: {from: EXIT_FROM, to: EXIT_CAM, at: {line: 'stock-21-exit'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: CHART_FS, at: {line: 'stock-21-full', word: 'Chart', off: 0.3}, until: {rec: 374.47, off: 0.3}, pad: 6, spot: true},
          {kind: 'click', ...mid(CHART_FS), rec: 374.47},
          {kind: 'ring', rect: EXIT_FS, at: {line: 'stock-21-exit', word: 'keluar'}, until: {rec: 379.567, off: 0.2}, pad: 5},
          {kind: 'click', ...mid(EXIT_FS), rec: 379.567},
        ],
      },
      // Back in the windowed page, whole view (crossfade) for the last words.
      {
        rec: REC,
        start: {line: 'stock-21-exit', word: 'atas'},
        pieces: [{from: 379.7, to: 380.7}],
        cam: {from: FULL},
      },
    ],
  },
};
