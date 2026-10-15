// Chapter 01 · Dashboard (scenes dash-1…dash-4). Source: New.mp4 0:00.5–0:13 (clip dash-a, clips/dash.json).
// Frame-checked 15 Okt: page 1/2 static to 4.5; Next clicked 4.55 → page 2/2 "Grup Komunitas" at 4.60 (the panel
// shrinks); scroll 6.93–7.80 (content up 554 px); idle on Quick View + Community until the scroll back at 13.07.
import type {Beat, BlurBox, CamPos, Rect} from '../../../core/tutorial/types';
import {FULL, NAV, REC} from './common';

const L = {
  plan: 'Paket aktif + tanggal perpanjang',
} as const;

// Framings (centre + zoom, raw px)
/** Menu bar + plan badge in one view (view x 780–3180: "Welcome back" fully in, nav x 1030–2618, badge x 2596–3037). */
const TOP: CamPos = {x: 1980, y: 760, zoom: 1.6};
/** The Announcements panel. */
const ANN: CamPos = {x: 1912, y: 930, zoom: 1.55};
/** Quick View after the scroll (cards y 546–1180); top edge y 274 keeps the sticky menu's edge out. */
const QV: CamPos = {x: 1912, y: 905, zoom: 1.55};
/** Community cards + support line + disclaimer after the scroll. */
const COMM: CamPos = {x: 1912, y: 1420, zoom: 1.55};

// Elements
const BADGE: Rect = {x: 2596, y: 376, w: 441, h: 59};
const ANN_PANEL_1: Rect = {x: 787, y: 489, w: 2250, h: 941};
const NEXT: Rect = {x: 1962, y: 1307, w: 104, h: 65};
/** After the scroll (page 2/2): the three Quick View cards, one "Lihat Semua" link, the two community cards. */
const QV_CARDS: Rect = {x: 788, y: 546, w: 2248, h: 634};
const SEE_ALL: Rect = {x: 1330, y: 580, w: 166, h: 40};
const COMMUNITY: Rect = {x: 788, y: 1280, w: 2248, h: 274};

/** Scroll offsets (content moved up, px) measured frame by frame; blurs follow them. */
const SCROLL = [
  {t: 6.93, dx: 0, dy: 0},
  {t: 7.0, dx: 0, dy: -20},
  {t: 7.1, dx: 0, dy: -134},
  {t: 7.2, dx: 0, dy: -166},
  {t: 7.3, dx: 0, dy: -260},
  {t: 7.4, dx: 0, dy: -402},
  {t: 7.5, dx: 0, dy: -450},
  {t: 7.6, dx: 0, dy: -476},
  {t: 7.7, dx: 0, dy: -546},
  {t: 7.8, dx: 0, dy: -554},
];
/**
 * Dashboard-only blurs: the account name in "Welcome back, poppyzagamer." and the announcement author line
 * (a personal name). They scroll under the sticky menu, so they stop before reaching it.
 */
const DASH_BLUR: BlurBox[] = [
  {x: 1236, y: 360, w: 470, h: 96, track: SCROLL, to: 7.15},
  // Page 1/2: three author lines.
  {x: 826, y: 828, w: 196, h: 38, to: 4.59, sigma: 10},
  {x: 826, y: 1026, w: 196, h: 38, to: 4.59, sigma: 10},
  {x: 826, y: 1224, w: 196, h: 38, to: 4.59, sigma: 10},
  // Page 2/2: one author line.
  {x: 826, y: 794, w: 196, h: 38, from: 4.6, to: 7.75, sigma: 10, track: SCROLL},
];

export const beats: Record<string, Beat> = {
  // The whole page under the chapter card, then one move up to the menu + plan badge. The menu is ringed as one
  // element on "menu", then the badge on "paket".
  'dash-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [{from: 0.5, to: 4.4}],
        cam: {from: FULL, to: TOP, at: {line: 'dash-1-open', word: 'Semua'}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: NAV.bar, at: {line: 'dash-1-open', word: 'menu'}, pad: 6},
          {kind: 'ring', rect: BADGE, at: {line: 'dash-1-plan', word: 'paket'}, label: L.plan, side: 'below', pad: 6},
        ],
        blur: DASH_BLUR,
      },
    ],
  },
  // Same picture: the camera eases onto Announcements (ringed); Next is clicked on "Next" (ripple) → page 2/2.
  'dash-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 4.35, to: 6.0, align: 4.55, at: {line: 'dash-2-next', word: 'Next'}}],
        cam: {from: TOP, to: ANN, at: 0.1, dur: 1.8},
        marks: [
          // The panel ring leaves as "Klik" starts; Next gets only its click ripple (a ring there would outlive the
          // button: page 2/2 is shorter and Next jumps up at 4.60).
          {kind: 'ring', rect: ANN_PANEL_1, at: {line: 'dash-2-ann', word: 'pengumuman'}, until: {line: 'dash-2-next', word: 'Klik', off: -0.1}},
          {kind: 'click', x: NEXT.x + NEXT.w / 2, y: NEXT.y + NEXT.h / 2, rec: 4.55},
        ],
        blur: DASH_BLUR,
      },
    ],
  },
  // The page scrolls down (6.93) as "Quick View" begins; the camera follows to the cards (ringed as one), then
  // one "Lihat Semua" link.
  'dash-3': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 6.0, to: 8.6, align: 6.93, at: {line: 'dash-3-quick', word: 'Di', off: 0.2}}],
        cam: {from: ANN, to: QV, at: {rec: 6.95}, dur: 1.5},
        marks: [
          {kind: 'ring', rect: QV_CARDS, at: {max: [{line: 'dash-3-quick', word: 'Quick'}, {rec: 7.8, off: 0.4}]}},
          {kind: 'ring', rect: SEE_ALL, at: {line: 'dash-3-more', word: 'Lihat'}, pad: 6},
        ],
        blur: DASH_BLUR,
      },
    ],
  },
  // Continues down to the community cards (ringed as one element on "Telegram").
  'dash-4': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 8.6, to: 12.9}],
        cam: {from: QV, to: COMM, at: 0.1, dur: 1.8},
        marks: [{kind: 'ring', rect: COMMUNITY, at: {line: 'dash-4-community', word: 'Telegram'}}],
      },
    ],
  },
};
