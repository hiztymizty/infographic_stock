// Hakabot outro: the edit. Which clip plays in each shot, which parts of it (jump cuts), where
// the "camera" looks, what gets highlighted and what gets blurred.
//
// Units: positions are recording pixels (Recording C is 1920×1080), times are seconds in the RAW
// recording (the same numbers as docs/outro-recordings.md), camera keys are seconds on screen since the
// shot appeared (so a slow move carries on through holds). zoom 1 = the recording's full width fills the
// window (960 px), so zoom 2 = 1 recording px per screen px. The shot log, the EDL (v3.3) and every
// identifier box are documented in docs/outro-recordings.md.
// When re-cutting: re-check every blur box against full-resolution frames.

import clipsJson from './outroClips.json';

export const SRC_W = 1920;
export const SRC_H = 1080;
export const SRC_FPS = 30;

export type Rect = {x: number; y: number; w: number; h: number};
export type RecId = keyof typeof clipsJson.recordings;
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

/** Camera key: centre (recording px) and zoom, at `t` seconds since the shot appeared on screen. */
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
  /** The clip the segments play from (omit for a `still` shot). */
  clip?: ClipName;
  /**
   * A still image instead of footage (e.g. a crisp screenshot for a close-up). `src` is under public/,
   * `w`×`h` its size in the same px as camera keys and marks. `segs` then only set the shot's length
   * ([[0, seconds]]); blur boxes are not applied, so a still must contain no identifiers.
   */
  still?: {src: string; w: number; h: number};
  /**
   * Pieces of the recording to play, in order (recording seconds). Gaps between them are jump cuts.
   * A third element plays that segment from another clip of the same recording (see `segClip`).
   */
  segs: [number, number, ClipName?][];
  /** Designed length in seconds (scaled with the voice line it plays under). */
  dur: number;
  /** Browser-window content height in px (width is always 960). Keep it the same within a group. */
  h: number;
  cam: CamKey[];
  marks?: Mark[];
  blur?: BlurBox[];
  /** Crossfade frames into this shot (default XF in HakabotOutro.tsx). */
  xf?: number;
  /** Dropped first when the voice gives its group much less time than designed. */
  optional?: boolean;
};

/**
 * A beat group: one voice line (outro-1…outro-N−1), one headline, optional chips, 1–3 shots.
 * Shots inside a group hard-cut; groups crossfade.
 */
export type Group = {line: string; title: string; chips: string[]; shots: Shot[]};

/**
 * The clip a segment plays from: its own (third element) or the shot's. Keep clips ≤ ~16 s: Remotion's
 * OffthreadVideo returned stale frames past ~24 s into a 31 s 1080p clip (found 12 Okt), so long
 * stretches are split into several clips.
 */
export const segClip = (shot: Shot, seg: number): ClipName => {
  const c = shot.segs[seg]?.[2] ?? shot.clip;
  if (!c) throw new Error(`outro shot ${shot.name} has no clip`);
  return c;
};

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

/**
 * Recording C (2026-10-12 11-56-49): account name "poppyzagamer" + avatar in the nav bar. One box covers
 * both browser-zoom states (100 % until 61,233 s, 90 % after).
 */
const ACCOUNT_C: BlurBox = {x: 1764, y: 10, w: 154, h: 46};

export const RECORDINGS: Record<RecId, {bounds: Rect; blur: BlurBox[]}> = {
  // C: app full-screen, no browser chrome; y ≥ 986 is a dark/black strip.
  c: {bounds: {x: 0, y: 4, w: 1920, h: 982}, blur: [ACCOUNT_C]},
  // D (2026-10-13 12-16-36): same app, same layout and 100 % zoom as C; the account sits in the same box.
  d: {bounds: {x: 0, y: 4, w: 1920, h: 982}, blur: [ACCOUNT_C]},
};

// ---------------------------------------------------------------------------------------------
// Identifier boxes used by several shots (Recording C, see docs/outro-recordings.md → Identifiers).

/** Composition page top: search-box ticker badge, then the header (logo, ticker, "IDX · Composition"). */
const COMP_BADGE: BlurBox = {x: 616, y: 106, w: 58, h: 34, to: 93.4};
const COMP_HEADER: BlurBox = {x: 424, y: 198, w: 160, h: 62, to: 93.4};
/** Holder network: every node carries a ticker or a holder name. Soft blur: bubbles and lines stay. */
const COMP_NETWORK: BlurBox = {x: 434, y: 324, w: 510, h: 340, from: 89.3, to: 92.1, sigma: 4, tint: 0.08};
// (v3 also used: the network strip after the scroll `432, 50, 516, 76` 93,3–98,8 and the holders table
// below the float card; boxes in docs/outro-recordings.md if those shots come back.)

/** Screener result table: stock logos + tickers (until the results turn into cards). */
const SCR_TABLE: BlurBox = {x: 432, y: 498, w: 92, h: 446, to: 130.8};
/** Chart cards: the ticker label of each of the 9 cards (rows 1–2 × 4 columns, then 1 card). */
const SCR_CARDS: BlurBox[] = [
  ...[488, 660].flatMap((y) => [444, 703, 961, 1220].map((x) => ({x, y}))),
  {x: 444, y: 832},
].map(({x, y}) => ({x: x - 4, y: y - 2, w: 84, h: 30, from: 130.75}));
/** Preset cards the edit doesn't use: name, description and count (the column shifts 4 px at 126,83). */
const SCR_PRESET = (x: number, y: number): BlurBox => ({x, y, w: 262, h: 74, sigma: 7, tint: 0.25});
const SCR_DEKAT = SCR_PRESET(429, 179);
const SCR_VCP = SCR_PRESET(693, 179);
const SCR_HTF = SCR_PRESET(957, 179);
const SCR_BREAKOUT = SCR_PRESET(1221, 179);
const SCR_RETAIL = SCR_PRESET(429, 383);
const SCR_LSF = SCR_PRESET(693, 383);
const SCR_BANDAR = SCR_PRESET(957, 383);

// ---------------------------------------------------------------------------------------------
// The EDL (v3.3, 13 Okt 2026: the v3.2 edit at ≈ 1,5×; shot lengths and camera times are v3.2's ÷ 1,5). Group i plays under voice line outro-(i+1); the last line (the URL) brings
// the end card. Pacing rules (user, 13 Okt, after v1 and v3 were both "too fast"; kept for v3.2): at most
// 2 shots per beat (Indikator may have 3), each ≥ 2,5 s on screen with one thing happening; footage in
// ≈ 1,5× since v3.3 (1,4–1,6×, user request; spare time becomes a hold); at most one jump cut per shot and only over dead
// time; no punch-ins or zoom bounces, at most one slow eased camera move per shot (zoom change ≤ ~10 %);
// crossfades between shots; one highlight per shot.

/** POSITION close-up: a crisp screenshot (outro_raw/POSITION.png, 3278×1286) drawn 1920 wide. */
const POSITION_STILL = {src: 'outro/position.png', w: 1920, h: 753};

export const OUTRO_GROUPS: Group[] = [
  {
    line: 'outro-1',
    title: 'Indikator',
    chips: [],
    shots: [
      {
        // The Tech menu opens, the cursor goes down its nine indicators, Trend is switched on and its
        // support/resistance lines appear on the chart. One continuous take.
        name: 'tech-trend',
        clip: 'chart-a',
        segs: [[2.03, 5.4]],
        dur: 2.53,
        h: 660,
        cam: [
          {t: 0.0, x: 660, y: 395, zoom: 2.3},
          {t: 2.53, x: 675, y: 400, zoom: 2.42},
        ],
        marks: [{kind: 'click', x: 463, y: 420, at: 4.2}],
      },
      {
        // Flow menu: Bandar's line appears and goes, then Retail is switched on and its line appears.
        name: 'flow-retail',
        clip: 'chart-a',
        segs: [[10.85, 13.38]],
        dur: 1.73,
        h: 660,
        cam: [
          {t: 0.0, x: 720, y: 400, zoom: 2.3},
          {t: 1.73, x: 735, y: 405, zoom: 2.4},
        ],
        marks: [{kind: 'click', x: 585, y: 245, at: 12.567}],
      },
      {
        // Stats menu → Drivers: a shaded range and the broker panel (who drove the move) appear.
        name: 'drivers',
        clip: 'chart-b',
        segs: [[19.0, 21.65]],
        dur: 1.8,
        h: 660,
        cam: [
          {t: 0.0, x: 720, y: 400, zoom: 2.1},
          {t: 1.8, x: 730, y: 405, zoom: 2.2},
        ],
        marks: [{kind: 'click', x: 660, y: 255, at: 19.533}],
      },
    ],
  },
  {
    line: 'outro-2',
    title: 'Bandarmology',
    chips: [],
    shots: [
      {
        // Recording D: the filled START/END tables, then the page scrolls (1,2–2,4) and POSITION comes
        // fully into frame: per broker, adding or exiting, with the P/L of those exiting.
        name: 'tables-position',
        clip: 'position-d',
        segs: [[0.3, 3.6]],
        dur: 2.47,
        h: 460,
        cam: [
          {t: 0.0, x: 955, y: 430, zoom: 1.44},
          {t: 2.47, x: 955, y: 430, zoom: 1.5},
        ],
        // No highlight here: the page's own scroll is the motion; the close-up that follows rings P/L.
      },
      {
        // POSITION close up from the crisp screenshot: one slow pan from the broker codes and lots to
        // EXIT/ADD and P/L (RX −74,3 % −6,58 % (81,2b); BK +60,1 % adding; AK −78,5 % …).
        name: 'position-still',
        still: POSITION_STILL,
        segs: [[0, 2.8]],
        dur: 1.87,
        h: 460,
        // Short crossfade: the screenshot is drawn ~1,36× larger than the D footage, so a long dissolve
        // double-exposes two table scales.
        xf: 4,
        // One calm eased pan (1,2 s of screen time, zoom 1,4): broker codes at the start (column at screen
        // x ≈ 70), P/L at the end with its ring's right edge at x ≈ 968 (≤ 980, clear of the app buttons).
        // Peak speed ≈ 25 screen px/frame, under the motion-blur threshold (≈ 32); no overshoot.
        cam: [
          {t: 0.0, x: 787, y: 425, zoom: 1.4},
          {t: 0.1, x: 787, y: 425, zoom: 1.4},
          {t: 1.3, x: 1215, y: 425, zoom: 1.4},
        ],
        // No ring: at ≈ 1,5× it could only show ≈ 0,45 s after the pan (QA round 5: reads as a blink, under the
        // 1,2 s highlight minimum). The pan itself ends on the P/L column.
        marks: [],
      },
    ],
  },
  {
    line: 'outro-3',
    title: 'Komposisi',
    chips: [],
    shots: [
      {
        // The holder network springs open and the ownership donut lands; then it rests.
        name: 'holder-network',
        clip: 'composition',
        segs: [[89.6, 92.0]],
        dur: 2.93,
        h: 600,
        cam: [
          {t: 0.0, x: 955, y: 462, zoom: 1.72},
          {t: 2.93, x: 955, y: 470, zoom: 1.82},
        ],
        blur: [COMP_BADGE, COMP_HEADER, COMP_NETWORK],
      },
    ],
  },
  {
    line: 'outro-4',
    title: 'Screener',
    chips: [],
    shots: [
      {
        // Pick the Uptrend Fase 2 pattern; one jump cut over idle hovering to the results turning into
        // chart cards, while the camera eases down from the patterns to the card grid.
        name: 'screener',
        clip: 'screener',
        segs: [
          [126.35, 127.8],
          [130.55, 133.6],
        ],
        dur: 3.47,
        h: 600,
        cam: [
          {t: 0.0, x: 760, y: 360, zoom: 1.9},
          {t: 1.07, x: 760, y: 360, zoom: 1.9},
          {t: 2.27, x: 955, y: 700, zoom: 1.74},
        ],
        marks: [{kind: 'click', x: 605, y: 327, at: 126.867}],
        blur: [SCR_DEKAT, SCR_VCP, SCR_HTF, SCR_BREAKOUT, SCR_RETAIL, SCR_LSF, SCR_BANDAR, SCR_TABLE, ...SCR_CARDS],
      },
    ],
  },
];

export const HAKABOT = {
  url: 'hakabot.com',
  tagline: 'Tools analisis saham',
  kicker: 'ANALISA SENDIRI DI',
  features: ['Bandarmology', 'Fundamental', 'Technical', 'Analisa Kepentingan', 'Komposisi', 'Screener', 'Signals', 'Custom Indicators'],
};

/** Scene id the shell treats as the Hakabot outro (every script.json ends with it). */
export const OUTRO_SCENE_ID = 'hakabot-outro';
/** Voice lines of the outro are `outro-1…outro-N`; the LAST one (the URL line) brings the end card. */
export const OUTRO_LINE_PREFIX = 'outro-';
