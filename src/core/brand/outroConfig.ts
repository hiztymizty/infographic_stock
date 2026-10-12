// Hakabot outro: the edit. Which clip plays in each shot, which parts of it (jump cuts), where
// the "camera" looks, what gets highlighted and what gets blurred.
//
// Units: positions are recording pixels (1280×720 raw recordings), times are seconds in the RAW
// recording (the same numbers as docs/outro-recordings.md), camera keys are seconds on the shot's
// own edited timeline (its segments laid end to end). zoom 1 = the recording's full width fills the
// window. The shot log, the EDL and every identifier box are documented in docs/outro-recordings.md.
// When re-cutting: re-check every blur box against full-resolution frames.

import clipsJson from './outroClips.json';

export const SRC_W = 1280;
export const SRC_H = 720;
export const SRC_FPS = 30;

export type Rect = {x: number; y: number; w: number; h: number};
export type RecId = 'a' | 'b';
export type ClipName = keyof typeof clipsJson.clips;

/**
 * A blur box over an identifier. `from`/`to` limit it to a stretch of the recording (seconds);
 * `track` moves it with content that scrolls (offsets keyed by recording second, linear between keys).
 * `sigma` is the blur radius in recording pixels; `tint` the darkening on top (0–1).
 */
export type BlurBox = Rect & {
  from?: number;
  to?: number;
  sigma?: number;
  tint?: number;
  track?: {t: number; dx: number; dy: number}[];
};

/** Camera key: centre (recording px) and zoom, at `t` seconds of the shot's edited timeline. */
export type CamKey = {t: number; x: number; y: number; zoom: number};

/**
 * Highlights. Times are recording seconds, so they stay on the action whatever the playback speed.
 * ring: focus ring around `rect` (+ optional label; `spot` dims everything else; `noRing` = label only).
 * click: gold ripple where the user clicked (+ optional short label).
 */
export type Mark =
  | {kind: 'ring'; rect: Rect; from: number; to: number; label?: string; dot?: string; spot?: boolean; side?: Side; noRing?: boolean}
  | {kind: 'click'; x: number; y: number; at: number; label?: string; side?: Side};

/** Where a highlight's label sits relative to it (default: above, or below near the window top). */
export type Side = 'above' | 'below' | 'left' | 'right';

export type Shot = {
  /** Short id for logs and the EDL. */
  name: string;
  clip: ClipName;
  /** Pieces of the recording to play, in order (recording seconds). Gaps between them are jump cuts. */
  segs: [number, number][];
  /** Designed length in seconds (scaled with the voice line it plays under). */
  dur: number;
  /** Browser-window content height in px (width is always 960). */
  h: number;
  cam: CamKey[];
  marks?: Mark[];
  blur?: BlurBox[];
  /** Dropped first when the voice gives its group much less time than designed. */
  optional?: boolean;
};

/** A beat group: one voice line (outro-1…outro-N−1), one headline, a few chips, 1–3 shots. */
export type Group = {line: string; title: string; chips: string[]; shots: Shot[]};

export type Clip = {rec: RecId; start: number; end: number; frames: number};
export const CLIPS = Object.fromEntries(
  Object.entries(clipsJson.clips).map(([k, c]) => [
    k,
    {rec: c.rec as RecId, start: c.start, end: c.end, frames: Math.floor((c.end - c.start) * SRC_FPS + 1e-6)},
  ]),
) as Record<ClipName, Clip>;

// ---------------------------------------------------------------------------------------------
// Recordings: the part of the frame that is app (the camera never shows outside it) and the
// identifiers that are on screen in every frame.

/** Recording A (2026-10-09 18-35-30): account name + avatar in the sticky nav bar. */
const ACCOUNT_A: BlurBox = {x: 1118, y: 16, w: 150, h: 46};
/** Recording A, stock page at the top of its scroll: company logo, ticker, company name. */
const STOCK_ID_A: BlurBox = {x: 108, y: 56, w: 176, h: 66};
/** Recording B (2026-10-10 11-54-43): account name + avatar in the sticky nav bar. */
const ACCOUNT_B: BlurBox = {x: 1114, y: 89, w: 152, h: 40};

export const RECORDINGS: Record<RecId, {bounds: Rect; blur: BlurBox[]}> = {
  // A: the app window fills the frame inside a 12 px border.
  a: {bounds: {x: 14, y: 14, w: 1252, h: 692}, blur: [ACCOUNT_A]},
  // B: browser tab strip + URL bar (y 0–70) and a black strip (y > 667) are never shown.
  b: {bounds: {x: 14, y: 84, w: 1252, h: 582}, blur: [ACCOUNT_B]},
};

// Flow-line colours sampled from the app's own axis tags (used only for the label dots).
const FOREIGN = '#8AA2E2';
const SM_LOCAL = '#2CD2B8';

// ---------------------------------------------------------------------------------------------
// The EDL. Group i plays under voice line outro-(i+1); the last line (the URL) brings the end card.
// Pacing rules (user feedback, 10 Okt): few shots (avg ≥ 3 s), footage near real time (≈ 0,9–1,3×),
// at most one jump cut per shot, slow eased camera moves, one highlight at a time, labels ≥ 1,2 s,
// and each group's first shot holds still ~1 s so the headline can be read.

export const OUTRO_GROUPS: Group[] = [
  {
    line: 'outro-1',
    title: 'Chart & Indikator',
    chips: ['Indikator', 'Aliran Dana'],
    shots: [
      {
        // The toggle, close up: the Flow menu is open, the user clicks Foreign and it switches on.
        name: 'flow-menu',
        clip: 'flow-toggles',
        segs: [[10.9, 12.52]],
        dur: 2.77,
        h: 780,
        cam: [
          {t: 0, x: 335, y: 262, zoom: 2.9},
          {t: 1.62, x: 350, y: 278, zoom: 3.25},
        ],
        marks: [
          {kind: 'click', x: 345, y: 284, at: 11.3},
          {kind: 'ring', rect: {x: 291, y: 271, w: 118, h: 22}, from: 11.3, to: 12.52, spot: true},
        ],
        blur: [STOCK_ID_A],
      },
      {
        // The same click replayed on the chart: the Foreign line appears; one jump cut (dead time
        // while both lines are off) to SM Local switching on.
        name: 'flow-chart',
        clip: 'flow-toggles',
        segs: [
          [11.08, 12.52],
          [13.45, 14.98],
        ],
        dur: 3.13,
        h: 780,
        cam: [
          {t: 0, x: 690, y: 410, zoom: 1.95},
          {t: 2.97, x: 712, y: 398, zoom: 2.3},
        ],
        marks: [
          {kind: 'ring', rect: {x: 819, y: 379, w: 48, h: 21}, from: 11.3, to: 12.52, label: 'Investor asing', dot: FOREIGN, side: 'left'},
          {kind: 'ring', rect: {x: 818, y: 389, w: 50, h: 21}, from: 13.733, to: 14.98, label: 'Pemain besar lokal', dot: SM_LOCAL, side: 'left'},
        ],
        blur: [STOCK_ID_A],
      },
    ],
  },
  {
    line: 'outro-2',
    title: 'Broker Activity',
    chips: ['Beli / jual per broker'],
    shots: [
      {
        // Broker activity chart (below the broker summary): one line per broker over the price.
        // Static footage; a slow push from the whole chart to where the lines climb.
        name: 'broker-activity',
        clip: 'broker-activity',
        segs: [[114.2, 118.2]],
        dur: 5.0,
        h: 780,
        cam: [
          {t: 0, x: 800, y: 440, zoom: 1.75},
          {t: 4.0, x: 905, y: 455, zoom: 2.1},
        ],
        marks: [{kind: 'ring', rect: {x: 1090, y: 336, w: 38, h: 226}, from: 115.3, to: 118.2, label: 'Tiap garis = 1 broker', side: 'left'}],
      },
    ],
  },
  {
    line: 'outro-3',
    title: 'Screener',
    chips: ['Saring otomatis', 'Mode Chart'],
    shots: [
      {
        // Pattern presets: the user picks Uptrend Fase 2 and the result table refills.
        name: 'screener-presets',
        clip: 'screener',
        segs: [[5.3, 6.95]],
        dur: 2.6,
        h: 780,
        cam: [
          {t: 0, x: 430, y: 380, zoom: 1.9},
          {t: 1.65, x: 395, y: 400, zoom: 2.12},
        ],
        marks: [
          {kind: 'ring', rect: {x: 180, y: 313, w: 224, h: 88}, from: 5.55, to: 6.95, label: 'Uptrend = lagi naik', side: 'right'},
          {kind: 'click', x: 333, y: 357, at: 5.967},
        ],
        blur: [{x: 182, y: 526, w: 98, h: 146, from: 5.2, to: 8.93}],
      },
      {
        // Chart mode: the results turn into cards whose charts load; one jump cut past the scroll
        // to the full card grid.
        name: 'screener-charts',
        clip: 'screener',
        segs: [
          [8.55, 9.85],
          [10.15, 11.55],
        ],
        dur: 2.6,
        h: 780,
        cam: [
          {t: 0, x: 750, y: 340, zoom: 2.05},
          {t: 1.3, x: 760, y: 350, zoom: 2.15},
          {t: 1.3, x: 630, y: 390, zoom: 1.85},
          {t: 2.7, x: 650, y: 400, zoom: 2.02},
        ],
        marks: [
          {kind: 'click', x: 962, y: 191, at: 8.9},
          {kind: 'ring', rect: {x: 930, y: 178, w: 72, h: 30}, from: 8.6, to: 9.85, label: 'Tampilkan chart', side: 'left'},
        ],
        blur: [
          // Results table rows (stock logos + tickers) until the cards replace them.
          {x: 182, y: 526, w: 98, h: 146, from: 5.2, to: 8.93},
          // Result cards before the scroll: ticker label of each card in row 1.
          ...[186, 414, 643, 871].map((x) => ({x, y: 512, w: 68, h: 26, from: 8.88, to: 9.9})),
          // Result cards after the scroll: rows 1–3 × columns 1–4.
          ...[199, 355, 504].flatMap((y) => [186, 414, 643, 871].map((x) => ({x, y, w: 68, h: 27, from: 10.05, to: 11.8}))),
        ],
      },
    ],
  },
];

export const HAKABOT = {
  url: 'hakabot.com',
  tagline: 'Tools analisis saham',
  kicker: 'ANALISA SENDIRI DI',
  features: ['Bandarmology', 'Fundamental', 'Technical', 'Analisa Kepentingan', 'Screener', 'Signals', 'Custom Indicators'],
};

/** Scene id the shell treats as the Hakabot outro (every script.json ends with it). */
export const OUTRO_SCENE_ID = 'hakabot-outro';
/** Voice lines of the outro are `outro-1…outro-N`; the LAST one (the URL line) brings the end card. */
export const OUTRO_LINE_PREFIX = 'outro-';
