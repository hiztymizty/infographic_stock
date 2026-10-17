// Chapter 04 · Index (scenes idx-1…idx-8). Source: New.mp4 7:40.8–9:04 (clips idx-a…e, clips/idx.json).
// Frame-checked 15 Okt (times = raw seconds): Index clicked 459.93, skeleton to 460.8 (cut: the chapter opens on the
// loaded page); Indicators menu 465.17; MA50 double-click 465.80 (MA200 off at 466.0: the isolate works within the MA
// group); S/R, Tren, Cumulative switched off one by one 468.6–469.2; chart zoomed 470–473.5; S/R off 479.17, Tren on
// 479.55; Cumulative on 488.83 (the dashed line + "Cum. Foreign" tag 489.0); zoomed out 490.47, stable to 492.0;
// scroll 498.4–498.63 (+600 px: foreign-flow footer at y 1403), 498.97–499.27 (Sector panels), 501.67–501.87 (+150);
// Infrastructure legend double-click 506.75 → only Infrastructure 506.8; scroll 510.77–511.03 (+750: Index Health);
// scroll to the RRG 518.8–521.5; Finance chip (toggle row below the map) double-clicked 534.87 + 535.03 → only Finance;
// Finance in the sector filter row at the top of the RRG (x 1844–1936, y 350–390) hovered from ~539.4, clicked 539.63
// → "Loading RRG" 539.67–539.90 (cut) → Finance's stocks (BBRI, BBCA…) from 539.93. Re-checked frame by frame 16 Okt.
import type {Beat, CamPos, Rect} from '../../../core/tutorial/types';
import {NAV, REC} from './common';

const L = {
  cum: 'Garis putus-putus',
} as const;

// Framings (centre + zoom, raw px)
/** Menu bar, index tiles and the IHSG chart (view y 132–1529). */
const OPEN: CamPos = {x: 1912, y: 830, zoom: 1.4};
/** Index tiles + the IHSG header (view x 528–2272, y 256–1145). */
const TILES_CAM: CamPos = {x: 1400, y: 700, zoom: 2.2};
/** Indicators menu + chart (view y 498–1802): wide enough for the trendline at the bottom of the zoomed chart. */
const IND_WIDE: CamPos = {x: 2100, y: 1150, zoom: 1.5};
/** The whole chart incl. menu and the Cum. Foreign tag (view y 526–1975). */
const CHART: CamPos = {x: 1912, y: 1250, zoom: 1.35};
/** Foreign-flow footer after the 498.4 scroll (view x 1628–3372, y 856–1745). */
const FOOT: CamPos = {x: 2500, y: 1300, zoom: 2.2};
/** Sector Performance panel (page as at 500: view y 724–1655). */
const SP: CamPos = {x: 1320, y: 1190, zoom: 2.1};
/** Sector Foreign Flow panel (page as at 503: view x 1561–3390, y 594–1525). */
const SFF: CamPos = {x: 2476, y: 1060, zoom: 2.1};
/** Index Health after the 511 scroll (view y 389–1611). */
const IH: CamPos = {x: 1892, y: 1000, zoom: 1.6};
/** The whole RRG plot (y 473–1740) above the subtitles (view y 415–2045; plot bottom at window y 763). */
const RRG: CamPos = {x: 1912, y: 1230, zoom: 1.2};
/**
 * Lower map + the toggle chips together (view x 620–3180, y 784–2088): the Finance chip (window y ≈ 760–795, above the
 * subtitles) and the map where the other sectors vanish, so "cuma Finance yang tampil" reads at once (QA round 1 #7).
 */
const MAP_CHIPS: CamPos = {x: 1900, y: 1436, zoom: 1.5};
/** The sector filter row at the top of the map (view x 930–2850, y 132–1110; Finance tab at window y ≈ 210). Zoom 2.0
 * (not 2.6) so the pull-back to the whole map afterwards is gentle. */
const TAB_CAM: CamPos = {x: 1890, y: 621, zoom: 2.0};

// Elements (raw px)
const TILES: Rect = {x: 762, y: 384, w: 762, h: 141};
const IHSG_HDR: Rect = {x: 800, y: 622, w: 612, h: 118};
const IND_BTN: Rect = {x: 2514, y: 622, w: 222, h: 52};
const MA50_ITEM: Rect = {x: 2527, y: 697, w: 286, h: 44};
const TREN_ITEM: Rect = {x: 2527, y: 922, w: 286, h: 44};
const CUM_ITEM: Rect = {x: 2527, y: 977, w: 286, h: 46};
/** The "Cum. Foreign" tag at the end of the dashed line (zoomed out, 490.5–492.0). */
const CUM_TAG: Rect = {x: 2774, y: 1419, w: 134, h: 31};
/** Footer "5D: Rp 1.01 T" after the 498.4 scroll. */
const FOOT_5D: Rect = {x: 2632, y: 1384, w: 172, h: 38};
/** Sector Performance title + date, and the Technology tile (page as at 500). */
const SP_TITLE: Rect = {x: 780, y: 808, w: 300, h: 104};
const TECH: Rect = {x: 1499, y: 1267, w: 341, h: 148};
/** Sector Foreign Flow (page as at 503): the chart, the Infrastructure legend item, the isolated line. */
const SFF_CHART: Rect = {x: 1950, y: 680, w: 1100, h: 490};
const INFRA_LEG: Rect = {x: 2416, y: 1263, w: 184, h: 36};
const INFRA_LINE: Rect = {x: 1960, y: 815, w: 1000, h: 300};
/** Index Health after the 511 scroll: label + value of each item. */
const IH_TREND: Rect = {x: 780, y: 888, w: 210, h: 84};
const IH_HIGH: Rect = {x: 1525, y: 888, w: 245, h: 84};
const IH_FOREIGN: Rect = {x: 2266, y: 888, w: 172, h: 84};
/** RRG plot and its four quadrants (labels in the app). */
const PLOT: Rect = {x: 1275, y: 473, w: 1273, h: 1267};
const Q_TL: Rect = {x: 1275, y: 473, w: 637, h: 633};
const Q_TR: Rect = {x: 1912, y: 473, w: 636, h: 633};
const Q_BR: Rect = {x: 1912, y: 1106, w: 636, h: 634};
const Q_BL: Rect = {x: 1275, y: 1106, w: 637, h: 634};
const FIN_CHIP: Rect = {x: 2388, y: 1840, w: 149, h: 50};
/** "Finance" in the sector filter row above the map. */
const FIN_TAB: Rect = {x: 1844, y: 350, w: 92, h: 40};
const BBRI: Rect = {x: 1880, y: 910, w: 160, h: 66};
const BBCA: Rect = {x: 2078, y: 1176, w: 176, h: 62};

export const beats: Record<string, Beat> = {
  // The loaded Index page under the chapter card (the skeleton is cut); the Index menu item, then the IHSG header on
  // "chart"; one move onto the index tiles, ringed on "LQ45".
  'idx-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 461.0, to: 465.0}],
        cam: {from: OPEN, to: TILES_CAM, at: {line: 'idx-1-open', word: 'IHSG'}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: NAV.Index, at: {line: 'idx-1-open', word: 'Index'}, pad: 4},
          {kind: 'ring', rect: IHSG_HDR, at: {line: 'idx-1-open', word: 'chart'}},
          {kind: 'ring', rect: TILES, at: {line: 'idx-1-tiles', word: 'LQ45'}, pad: 6},
        ],
      },
    ],
  },
  // Camera eases to the Indicators menu (ringed); it opens and MA50 is double-clicked on "dua" (MA200 drops out).
  // Crossfade: Tren clicked on "Tren", the blue trendline appears.
  'idx-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 464.9, to: 466.4, align: 465.8, at: {line: 'idx-2-menu', word: 'dua'}}],
        cam: {from: TILES_CAM, to: IND_WIDE, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: IND_BTN, at: {line: 'idx-2-menu', word: 'Indicators'}, until: {rec: 465.17, off: 0.3}, pad: 4},
          {kind: 'click', x: 2625, y: 647, rec: 465.15},
          {kind: 'ring', rect: MA50_ITEM, at: {max: [{line: 'idx-2-menu', word: 'termasuk'}, {rec: 465.3}]}, pad: 4},
          {kind: 'click', x: 2600, y: 718, rec: 465.8},
        ],
      },
      {
        rec: REC,
        start: {line: 'idx-2-tren'},
        pieces: [{from: 478.9, to: 481.0, align: 479.55, at: {line: 'idx-2-tren', word: 'Tren'}}],
        cam: {from: IND_WIDE},
        marks: [
          {kind: 'ring', rect: TREN_ITEM, at: {line: 'idx-2-tren', word: 'Klik'}, until: {rec: 479.55, off: 0.6}, pad: 4},
          {kind: 'click', x: 2620, y: 944, rec: 479.55},
        ],
      },
    ],
  },
  // Cumulative switched on (menu item ringed on "Cum.", clicked on "itu"); the chart zooms out and the dashed line's
  // tag is ringed on "garis" (the overlay, nothing more). Crossfade: the page scrolls on "Lima", the footer's 5D figure is ringed on "net".
  'idx-3': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 487.3, to: 491.9, align: 488.83, at: {line: 'idx-3-cum', word: 'itu'}}],
        cam: {from: CHART},
        marks: [
          {kind: 'ring', rect: CUM_ITEM, at: {line: 'idx-3-cum', word: 'Cum'}, until: {rec: 489.0, off: 0.8}, pad: 4},
          {kind: 'click', x: 2622, y: 1000, rec: 488.83},
          {kind: 'ring', rect: CUM_TAG, at: {max: [{line: 'idx-3-cum', word: 'garis'}, {rec: 491.0}]}, label: L.cum, side: 'left', pad: 6},
        ],
      },
      {
        rec: REC,
        start: {line: 'idx-3-footer'},
        pieces: [{from: 498.0, to: 498.93, align: 498.4, at: {line: 'idx-3-footer', word: 'Lima'}}],
        cam: {from: FOOT},
        marks: [{kind: 'ring', rect: FOOT_5D, at: {max: [{line: 'idx-3-footer', word: 'net'}, {rec: 498.7}]}, pad: 6}],
      },
    ],
  },
  // The page scrolls to the sector panels; camera onto Sector Performance (title ringed), then Technology.
  'idx-4': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 498.93, to: 501.6}],
        cam: {from: FOOT, to: SP, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: SP_TITLE, at: {max: [{line: 'idx-4-sector', word: 'Sector'}, {rec: 499.3}]}, pad: 6},
          {kind: 'ring', rect: TECH, at: {line: 'idx-4-sector', word: 'Technology'}, pad: 4},
        ],
      },
    ],
  },
  // Camera across to Sector Foreign Flow (chart ringed); one jump cut over the legend tooltips; Infrastructure in the
  // legend ringed (spotlit) and double-clicked on "Infrastructure"; then the lone falling line on "Garisnya".
  'idx-5': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 501.6, to: 502.2},
          {from: 506.0, to: 509.5, align: 506.75, at: {line: 'idx-5-dbl', word: 'Infrastructure'}},
        ],
        cam: {from: SP, to: SFF, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: SFF_CHART, at: {max: [{line: 'idx-5-panel', word: 'Sector'}, {rec: 501.9}]}},
          {kind: 'ring', rect: INFRA_LEG, at: {line: 'idx-5-dbl', word: 'titik'}, until: {rec: 506.75, off: 0.5}, spot: true, pad: 4},
          {kind: 'click', x: 2500, y: 1281, rec: 506.75},
          {kind: 'ring', rect: INFRA_LINE, at: {max: [{line: 'idx-5-dbl', word: 'Garisnya'}, {rec: 506.9}]}},
        ],
      },
    ],
  },
  // The page scrolls to Index Health (camera follows); one ring glides Downtrend → 35.2% below → Danger as each is said.
  'idx-6': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 509.5, to: 513.9}],
        cam: {from: SFF, to: IH, at: 0.1, dur: 1.8},
        marks: [
          {
            kind: 'path',
            rects: [IH_TREND, IH_HIGH, IH_FOREIGN],
            at: [
              {line: 'idx-6-health', word: 'downtrend'},
              {line: 'idx-6-health', word: '35%'},
              {line: 'idx-6-health', word: 'Danger'},
            ],
          },
        ],
      },
    ],
  },
  // Scroll to the RRG (camera eases back to fit the whole plot); the plot ringed on "peta"; then one ring glides
  // through the four labelled quadrants as each is named.
  'idx-7': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 518.6, to: 522.6}],
        cam: {from: IH, to: RRG, at: {rec: 518.9}, dur: 2.4},
        marks: [
          {kind: 'ring', rect: PLOT, at: {max: [{line: 'idx-7-rrg', word: 'peta'}, {rec: 521.6}]}, until: {line: 'idx-7-tl'}},
          {
            kind: 'path',
            rects: [Q_TL, Q_TR, Q_BR, Q_BL],
            at: [
              {line: 'idx-7-tl', word: 'Kiri'},
              {line: 'idx-7-tr', word: 'Kanan'},
              {line: 'idx-7-br', word: 'Kanan'},
              {line: 'idx-7-bl', word: 'kiri'},
            ],
          },
        ],
      },
    ],
  },
  // Three shots on the same static page, each one eased camera move (the crossfades join identical frames):
  // 1 the camera eases down to the lower map + the toggle chips (both in view); the Finance chip ringed with a spotlight,
  // double-clicked on "Finance", and the other sectors vanish from the map in the same view;
  // 2 eases up to the sector filter row above the map, Finance
  // ringed on "pilih" and clicked on "atas" (the "Loading RRG" wait is cut); 3 eases back out (2,4 s) to the map with
  // Finance's stocks, BBRI then BBCA ringed as they're named; the ring leaves on idx-8-why and the map holds.
  'idx-8': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 534.3, to: 535.6, align: 535.03, at: {line: 'idx-8-chips', word: 'Finance'}},
          {from: 535.6, to: 538.5},
        ],
        cam: {from: RRG, to: MAP_CHIPS, at: 0.05, dur: 1.3},
        marks: [
          {kind: 'ring', rect: FIN_CHIP, at: {max: [{line: 'idx-8-chips', word: 'dua'}, 1.0]}, until: {rec: 535.03, off: 0.9}, spot: true, pad: 5},
          {kind: 'click', x: 2462, y: 1865, rec: 534.87},
        ],
      },
      {
        rec: REC,
        start: {line: 'idx-8-stocks'},
        pieces: [{from: 538.5, to: 539.64, align: 539.63, at: {line: 'idx-8-stocks', word: 'atas'}}],
        cam: {from: MAP_CHIPS, to: TAB_CAM, at: {line: 'idx-8-stocks'}, dur: 2.0},
        marks: [
          {kind: 'ring', rect: FIN_TAB, at: {max: [{line: 'idx-8-stocks', word: 'pilih'}, {line: 'idx-8-stocks', off: 2.0}]}, until: {rec: 539.63, off: 0.5}, spot: true, pad: 4},
          {kind: 'click', x: 1890, y: 370, rec: 539.63},
        ],
      },
      {
        rec: REC,
        // Starts right after the click (the "Loading RRG" wait is cut) so the pull-back can take 2,4 s and settle before
        // BBRI is named (QA round 1 #7: the 1,8-s pull-back read as fast).
        start: {line: 'idx-8-stocks', word: 'peta', off: 0.3},
        pieces: [{from: 539.93, to: 544.0}],
        cam: {from: TAB_CAM, to: RRG, at: {line: 'idx-8-stocks', word: 'peta', off: 0.3}, dur: 2.4},
        marks: [
          {
            kind: 'path',
            rects: [BBRI, BBCA],
            at: [
              {max: [{line: 'idx-8-stocks', word: 'BBRI', off: -0.2}, {line: 'idx-8-stocks', word: 'peta', off: 2.6}]},
              {max: [{line: 'idx-8-stocks', word: 'BBCA'}, {line: 'idx-8-stocks', word: 'peta', off: 4.0}]},
            ],
            until: {line: 'idx-8-why'},
          },
        ],
      },
    ],
  },
};
