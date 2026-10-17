// Chapter 05 · Composition (scenes comp-1…comp-10). Source: New.mp4 9:19–11:29 (clips comp-a…i, clips/comp.json).
// Frame-checked 15 Okt (times = raw seconds): Composition clicked 560.5 (page 560.53, loaded 561.13, network settles
// ~562.2); ERAA hovered (lines lit) 563.6–565.6; nodes dragged 565.7–569.5; UBS AG LONDON clicked 572.23 → radial view
// of its stocks; page scrolls 150 px at 575.3; donut Local tab 579.27 (Perusahaan 56,5% tooltip 581.03–582.73), Foreign
// tab 585.03 (Bank 40,9% tooltip 585.53–586.8); scroll to Composition Over Time 589.3–591.0, point hovers ~593.4–597;
// Float Composition static 614.2–616.8; Kepemilikan + Perubahan static 630.8–637.5; "JP MORGAN SECURITIES PLC" in
// Kepemilikan Signifikan (text x 793–1117, y 878–902) clicked 637.87 → Per Investor 637.90 ("Loading investors" to 638.6,
// cut; the list opens already searched for JP Morgan); JP Morgan row 640.8 → card 641.17 (6 stocks); all investors 647.93; PEP chip
// 650.2 (loading 650.27–651.8); PEP tooltip (Garibaldi Thohir) 653.70–655.73; Konglo chip ~665.73 (loading 665.8–
// 669.0), Konglo tooltip 670.63–672.43; Perubahan tab 678.05 (loading 678.1–679.23), first row ENRG.
// Note: on screen the ENRG row reads 7.39% → 9.31% (% BEFORE / % AFTER), not 7.30%.
import type {Beat, CamPos, Rect} from '../../../core/tutorial/types';
import {FULL, NAV, REC, navCenter} from './common';

const L = {
  recent: 'Local turun, Foreign naik',
} as const;

// Framings (centre + zoom, raw px). Content column x 763–3060.
/** Tabs, ERAA header with free float, top of the network + donut panels. */
const TOP_C: CamPos = {x: 1912, y: 900, zoom: 1.6};
/** Holder Network panel (x 763–1890, y 738–1621): view y 736–1625. */
const NET: CamPos = {x: 1330, y: 1180, zoom: 2.2};
/** Ownership donut panel after the 150-px scroll (tabs y 759, legend rows to y ~1440): wide, then a slow push in. */
const DONUT_A: CamPos = {x: 2495, y: 1150, zoom: 2.0};
const DONUT: CamPos = {x: 2495, y: 1120, zoom: 2.3};
/** Composition Over Time panel (y 685–1673). */
const CHART: CamPos = {x: 1912, y: 1180, zoom: 1.65};
/** Right part of the chart (Jul–Sep) with the range buttons and the axis tag. */
const READ: CamPos = {x: 2300, y: 1180, zoom: 2.2};
/** Float Composition by Investor Type (title y 426, bars to y 1000). */
const FLOAT: CamPos = {x: 1912, y: 740, zoom: 1.65};
/** Kepemilikan Signifikan table, then down to Perubahan Pemegang Saham. */
const KEP: CamPos = {x: 1912, y: 920, zoom: 1.65};
/** Kepemilikan Signifikan, closer on the investor names (view x 427–2172, y 455–1344; JP Morgan row at mid-window). */
const KEP_JP: CamPos = {x: 1300, y: 900, zoom: 2.2};
const CHANGES: CamPos = {x: 1912, y: 1250, zoom: 1.65};
/** Per Investor: tabs, search, chips, JP Morgan row. */
const INV_TOP: CamPos = {x: 1912, y: 860, zoom: 1.65};
/** JP Morgan card: badge row y 887, six stock rows y 1135–1640. */
const CARD: CamPos = {x: 1800, y: 1300, zoom: 1.9};
/** Investor list with the filter chips. */
const LIST: CamPos = {x: 1912, y: 820, zoom: 1.7};
/** Chips + the first rows close enough to read the label tooltips (~18 px text in 4K → ~23 px on screen). */
const TIP: CamPos = {x: 1400, y: 880, zoom: 2.6};
/** Perubahan tab: tab row, filters, the first rows of the market-wide list. */
const PERU: CamPos = {x: 1912, y: 1000, zoom: 1.6};

// Elements (raw px), measured at the moment they're ringed
const TABS: Rect = {x: 770, y: 506, w: 590, h: 74};
const FREE_FLOAT: Rect = {x: 2925, y: 620, w: 150, h: 84};
/** ERAA node while hovered (564.3). */
const ERAA_NODE: Rect = {x: 1280, y: 1197, w: 96, h: 96};
/** After the 150-px scroll: legend row "Local 62.8%" (Local vs Foreign view). */
const LOCAL_LEG: Rect = {x: 1958, y: 1340, w: 540, h: 46};
/** Local + Foreign tab buttons (after the scroll). */
const TABS_LF: Rect = {x: 2822, y: 769, w: 195, h: 57};
const LOCAL_TAB = {x: 2863, y: 797};
const FOREIGN_TAB = {x: 2963, y: 797};
/** Local tab legend: "Perusahaan 56.5%". Foreign tab legend: "Bank 40.9%". */
const PERUSAHAAN: Rect = {x: 2505, y: 1340, w: 530, h: 46};
const BANK: Rect = {x: 1960, y: 1398, w: 535, h: 46};
const CHART_TITLE: Rect = {x: 785, y: 698, w: 310, h: 92};
const RANGE: Rect = {x: 2688, y: 832, w: 344, h: 58};
/** Jul–Sep stretch of both lines. */
const RECENT: Rect = {x: 2410, y: 1000, w: 480, h: 500};
const FLOAT_TITLE: Rect = {x: 770, y: 394, w: 470, h: 74};
const CORP: Rect = {x: 790, y: 580, w: 2040, h: 52};
const RETAIL: Rect = {x: 790, y: 726, w: 2040, h: 52};
const KEP_TABLE: Rect = {x: 768, y: 418, w: 2290, h: 600};
/** Perubahan Pemegang Saham, first row: 2026-09-30 JP MORGAN SECURITIES PLC +1.10%. */
const JP_CHANGE: Rect = {x: 768, y: 1344, w: 2290, h: 96};
/** "JP MORGAN SECURITIES PLC" in Kepemilikan Signifikan (row 4, as at 637.8). */
const JP_NAME: Rect = {x: 786, y: 868, w: 340, h: 44};
const PER_INV_TAB: Rect = {x: 1010, y: 510, w: 196, h: 68};
const JP_ROW_CLICK = {x: 1368, y: 932};
/** The card's six stock rows (ticker → %). */
const STOCKS: Rect = {x: 820, y: 1138, w: 1760, h: 530};
const PEP_CHIP: Rect = {x: 1278, y: 739, w: 84, h: 58};
const KONGLO_CHIP: Rect = {x: 1367, y: 739, w: 112, h: 58};
/** Row 1 (Garibaldi Thohir): PEP label + its tooltip. */
const PEP_TIP: Rect = {x: 1088, y: 898, w: 510, h: 88};
/** Konglo list row 1 (Drs Surono Subekti): KONGLO label + "Konglomerat / Tycoon" tooltip. */
const KONGLO_TIP: Rect = {x: 1132, y: 898, w: 306, h: 96};
const PERU_TAB: Rect = {x: 1188, y: 510, w: 182, h: 68};
const ENRG_ROW: Rect = {x: 768, y: 866, w: 2284, h: 108};

export const beats: Record<string, Beat> = {
  // Index page under the chapter card; Composition clicked on "Composition", the page loads, the camera eases in
  // to the tabs + header. Rings: the menu item, the three tabs, then FREE FLOAT 25.07%.
  'comp-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 559.0, to: 562.3, align: 560.5, at: {line: 'comp-1-open', word: 'Composition'}}],
        cam: {from: FULL, to: TOP_C, at: {rec: 561.3}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NAV.Composition, at: {line: 'comp-1-open', word: 'menu'}, until: {rec: 560.5, off: 0.4}, pad: 4},
          {kind: 'click', ...navCenter('Composition'), rec: 560.5},
          {kind: 'ring', rect: TABS, at: {max: [{line: 'comp-1-open', word: 'isinya'}, {rec: 562.0}]}, pad: 6},
          {kind: 'ring', rect: FREE_FLOAT, at: {line: 'comp-1-float', word: 'Free'}, pad: 8},
        ],
      },
    ],
  },
  // Holder Network: the camera eases onto the panel; ERAA is hovered (its lines light up) on "garisnya"; one jump
  // cut over the first drags; the user drags a node and clicks UBS AG LONDON on "diklik" → the radial view of its
  // stocks (no ring: user, 16 Okt).
  'comp-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 562.3, to: 565.5, align: 563.6, at: {line: 'comp-2-net', word: 'garisnya'}},
          {from: 568.8, to: 575.0, align: 572.23, at: {line: 'comp-2-drag', word: 'diklik'}},
        ],
        cam: {from: TOP_C, to: NET, at: 0.1, dur: 1.8},
        marks: [
          {kind: 'ring', rect: ERAA_NODE, at: {max: [{line: 'comp-2-net', word: 'garisnya'}, {rec: 563.65}]}, until: {rec: 565.5}, pad: 6},
        ],
      },
    ],
  },
  // The donut (after the page's 150-px scroll), a slow push in. "Local 62.8%" ringed on "investor"; the Local tab
  // clicked on "Local" (Perusahaan 56.5% ringed from "lokal"); one jump cut; Foreign clicked just before "asing"
  // (Bank 40.9% ringed from "asing": the line ends right after "Bank").
  'comp-3': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 575.5, to: 579.1},
          {from: 579.1, to: 582.7, align: 579.27, at: {line: 'comp-3-tabs', word: 'Local'}},
          {from: 584.8, to: 586.75, align: 585.03, at: {line: 'comp-3-tabs', word: 'asing', off: -0.4}},
        ],
        cam: {from: DONUT_A, to: DONUT, at: 0.1, dur: 3.0},
        marks: [
          {kind: 'ring', rect: LOCAL_LEG, at: {line: 'comp-3-donut', word: 'investor'}, pad: 6},
          {kind: 'ring', rect: TABS_LF, at: {line: 'comp-3-tabs', word: 'Tab'}, pad: 4},
          {kind: 'click', ...LOCAL_TAB, rec: 579.27},
          {kind: 'ring', rect: PERUSAHAAN, at: {max: [{line: 'comp-3-tabs', word: 'lokal'}, {rec: 579.4}]}, pad: 6},
          {kind: 'click', ...FOREIGN_TAB, rec: 585.03},
          {kind: 'ring', rect: BANK, at: {max: [{line: 'comp-3-tabs', word: 'asing'}, {rec: 585.2}]}, pad: 6},
        ],
      },
    ],
  },
  // Composition Over Time: title, then the range buttons; on "Belakangan" the camera eases to the right part of the
  // chart while the user hovers the Aug/Sep points; the Jul–Sep stretch is ringed on "Local".
  'comp-4': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 591.2, to: 598.3, align: 593.4, at: {line: 'comp-4-read', word: 'Belakangan'}}],
        cam: {from: CHART, to: READ, at: {line: 'comp-4-read', word: 'Belakangan'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: CHART_TITLE, at: {line: 'comp-4-chart', word: 'Composition'}, pad: 6},
          {kind: 'ring', rect: RANGE, at: {line: 'comp-4-chart', word: 'waktu'}, until: {line: 'comp-4-read', word: 'Belakangan'}, pad: 4},
          {kind: 'ring', rect: RECENT, at: {max: [{line: 'comp-4-read', word: 'Local'}, {line: 'comp-4-read', word: 'Belakangan', off: 1.8}]}, label: L.recent, side: 'left', pad: 6},
        ],
      },
    ],
  },
  // Float Composition by Investor Type (held): title on "Float", Corporate & Strategic 36.3% on "perusahaan",
  // Retail / Individual 14.8% on "ritel".
  'comp-5': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 614.6, to: 616.8}],
        cam: {from: FLOAT},
        marks: [
          {kind: 'ring', rect: FLOAT_TITLE, at: {line: 'comp-5-what', word: 'Float'}, pad: 6},
          {kind: 'ring', rect: CORP, at: {line: 'comp-5-corp', word: 'perusahaan'}, pad: 6},
          {kind: 'ring', rect: RETAIL, at: {line: 'comp-5-corp', word: 'ritel'}, pad: 6},
        ],
      },
    ],
  },
  // Kepemilikan Signifikan (ringed on "Kepemilikan"); on "bawahnya" the camera eases down to Perubahan Pemegang
  // Saham; its first row (JP Morgan +1.10%, 30 Sep) ringed on "JP".
  'comp-6': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 631.0, to: 637.4}],
        cam: {from: KEP, to: CHANGES, at: {line: 'comp-6-changes', word: 'bawahnya'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: KEP_TABLE, at: {line: 'comp-6-major', word: 'Kepemilikan'}, until: {line: 'comp-6-changes', word: 'bawahnya'}, pad: 6},
          {kind: 'ring', rect: JP_CHANGE, at: {max: [{line: 'comp-6-changes', word: 'JP'}, {line: 'comp-6-changes', word: 'bawahnya', off: 1.8}]}, pad: 6},
        ],
      },
    ],
  },
  // Continues from comp-6: the camera eases up and in on Kepemilikan Signifikan; "JP MORGAN SECURITIES PLC" ringed on
  // "Klik", clicked on "JP Morgan" (the real click). Crossfade over the "Loading investors" wait to Per Investor (tab ringed
  // on "dibawa"); the JP Morgan row clicked on "Investor"; the camera eases onto the card; its six stocks on "Kelihatan".
  'comp-7': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 637.4, to: 637.89, align: 637.87, at: {line: 'comp-7-investor', word: 'JP'}}],
        cam: {from: CHANGES, to: KEP_JP, at: 0.05, dur: 1.6},
        marks: [
          {kind: 'ring', rect: JP_NAME, at: {max: [{line: 'comp-7-investor', word: 'Klik'}, 1.0]}, until: {rec: 637.87, off: 0.6}, pad: 6},
          {kind: 'click', x: 940, y: 892, rec: 637.87},
        ],
      },
      {
        rec: REC,
        start: {line: 'comp-7-investor', word: 'dan'},
        pieces: [{from: 638.65, to: 643.5, align: 640.8, at: {line: 'comp-7-investor', word: 'Investor', nth: 1}}],
        cam: {from: INV_TOP, to: CARD, at: {rec: 641.2}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: PER_INV_TAB, at: {line: 'comp-7-investor', word: 'dibawa'}, until: {rec: 640.8}, pad: 4},
          {kind: 'click', ...JP_ROW_CLICK, rec: 640.8},
          {kind: 'ring', rect: STOCKS, at: {max: [{line: 'comp-7-investor', word: 'Kelihatan'}, {rec: 641.2, off: 1.6}]}, pad: 6},
        ],
      },
    ],
  },
  // Filters: the PEP chip ringed on "saring", clicked on "PEP"; the loading is cut; the filtered list holds while the
  // voice explains PEP; the camera eases closer and the user hovers the first PEP label on "Arahin" (tooltip ringed).
  'comp-8': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 648.2, to: 650.25, align: 650.2, at: {line: 'comp-8-filter', word: 'PEP'}},
          {from: 651.85, to: 652.9},
          {from: 652.9, to: 655.7, align: 653.7, at: {line: 'comp-8-hover', word: 'Arahin', off: 0.3}},
        ],
        cam: {from: LIST, to: TIP, at: {line: 'comp-8-hover'}, dur: 1.6},
        marks: [
          {kind: 'ring', rect: PEP_CHIP, at: {line: 'comp-8-filter', word: 'saring'}, until: {rec: 650.2, off: 0.5}, pad: 4, spot: true},
          {kind: 'click', x: 1320, y: 768, rec: 650.2},
          {kind: 'ring', rect: PEP_TIP, at: {max: [{line: 'comp-8-hover', word: 'labelnya'}, {rec: 653.75}]}, pad: 6},
        ],
      },
    ],
  },
  // Konglo: chip ringed on "Filter", clicked on "Konglo"; the loading is cut; the KONGLO label's tooltip ringed on "grup".
  'comp-9': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 665.0, to: 665.8, align: 665.73, at: {line: 'comp-9-konglo', word: 'Konglo'}},
          {from: 669.05, to: 672.4, align: 670.63, at: {line: 'comp-9-konglo', word: 'grup'}},
        ],
        cam: {from: TIP},
        marks: [
          {kind: 'ring', rect: KONGLO_CHIP, at: {line: 'comp-9-konglo', word: 'Filter'}, until: {rec: 665.73, off: 0.5}, pad: 4, spot: true},
          {kind: 'click', x: 1422, y: 768, rec: 665.73},
          {kind: 'ring', rect: KONGLO_TIP, at: {max: [{line: 'comp-9-konglo', word: 'grup'}, {rec: 670.7}]}, pad: 6},
        ],
      },
    ],
  },
  // Perubahan tab (market-wide): tab ringed on "Tab", clicked on "Perubahan"; the loading is cut; the first row
  // (ENRG · CGS International Sekuritas Indonesia, ADDED) ringed on "ENRG".
  'comp-10': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 677.0, to: 678.1, align: 678.05, at: {line: 'comp-10-page', word: 'Perubahan'}},
          {from: 679.25, to: 689.3},
        ],
        cam: {from: PERU},
        marks: [
          {kind: 'ring', rect: PERU_TAB, at: {line: 'comp-10-page', word: 'Tab'}, until: {rec: 678.05, off: 0.5}, pad: 4},
          {kind: 'click', x: 1278, y: 545, rec: 678.05},
          {kind: 'ring', rect: ENRG_ROW, at: {line: 'comp-10-enrg', word: 'ENRG'}, pad: 6},
        ],
      },
    ],
  },
};
