// Chapter 08 · Akun (scenes akun-1…akun-3). Source: New.mp4 13:15–13:46 (clips akun-a…c, clips/akun.json); never past
// 830.9 (OBS from 831).
// Frame-checked 15 Okt (raw seconds): HB Center top; the account menu opens 797.10 (it shows the email) and closes on
// the Profile click 799.43; Akun page 801.10; Salin clicked 804.50; scroll 806.6–808.9 (content up 810 px); Ukuran
// tampilan only hovered (Kecil 812.5 … Sangat Besar 814.4, Normal stays); "Aktifkan notifikasi harian" clicked 818.55;
// the browser's permission prompt 818.97–821.23 (it hangs below the URL bar: its visible part, y ≥ 132, shows only
// "hakabot.com wants to · Show notifications · Allow · Block"; the URL bar and tab strip stay outside the crop); Allow
// 821.2; the card switches to "Matikan notifikasi harian" + "Kirim notifikasi uji" at 823.60; scroll back up 826.03.
// Privacy (user, 15 Okt): the email (menu + Info akun), the referral code and the display-name field (it holds the
// account name) are blurred; the account name top-right is blurred by the recording.
import type {Beat, BlurBox, CamPos, Rect} from '../../../core/tutorial/types';
import {ACCOUNT, FULL, REC} from './common';

// Framings (centre + zoom, raw px)
/** Info akun card (view y 300–1387; subtitles from ~1251). */
const TOP: CamPos = {x: 1912, y: 843, zoom: 1.8};
/** After the scroll: name field, password card, Ukuran tampilan (view y 280–1629; subtitles from ~1461). */
const MID: CamPos = {x: 1912, y: 955, zoom: 1.45};
/** Bottom of the page: Ukuran tampilan, Notifikasi, Keluar (view y 1001–2088; subtitles from ~1952). */
const NOTIF: CamPos = {x: 1912, y: 1545, zoom: 1.8};
/** Top-left corner, where the browser's permission prompt hangs (view x 0–2133, y 132–1219). */
const PROMPT_VIEW: CamPos = {x: 1067, y: 675, zoom: 1.8};

// Elements (raw px)
const PLAN: Rect = {x: 1350, y: 676, w: 480, h: 134};
const SALIN: Rect = {x: 1752, y: 884, w: 76, h: 44};
/** After the scroll (808.9): */
const NAME_FIELD: Rect = {x: 1352, y: 336, w: 1120, h: 90};
const PASSWORD: Rect = {x: 1312, y: 492, w: 1200, h: 700};
const SIZES: Rect = {x: 1352, y: 1325, w: 506, h: 66};
const ENABLE: Rect = {x: 1352, y: 1614, w: 352, h: 66};
const PROMPT: Rect = {x: 190, y: 140, w: 480, h: 210};
/** After 823.6: */
const NOTIF_TEXT: Rect = {x: 1352, y: 1699, w: 756, h: 31};
const TEST: Rect = {x: 1354, y: 1734, w: 268, h: 66};
const LOGOUT: Rect = {x: 1314, y: 1873, w: 136, h: 66};

/** The page scroll 806.6–808.9 (content moved up, px), measured frame by frame. */
const SCROLL = [
  {t: 806.5, dx: 0, dy: 0},
  {t: 806.6, dx: 0, dy: -4},
  {t: 806.7, dx: 0, dy: -34},
  {t: 806.8, dx: 0, dy: -178},
  {t: 806.9, dx: 0, dy: -298},
  {t: 807.0, dx: 0, dy: -322},
  {t: 807.1, dx: 0, dy: -440},
  {t: 807.2, dx: 0, dy: -504},
  {t: 807.3, dx: 0, dy: -600},
  {t: 808.0, dx: 0, dy: -600},
  {t: 808.1, dx: 0, dy: -626},
  {t: 808.2, dx: 0, dy: -728},
  {t: 808.3, dx: 0, dy: -750},
  {t: 808.5, dx: 0, dy: -750},
  {t: 808.7, dx: 0, dy: -758},
  {t: 808.8, dx: 0, dy: -806},
  {t: 808.9, dx: 0, dy: -810},
];

/**
 * Akun privacy blurs. The email and the referral code scroll up under the sticky menu (y < 280); each box stays on
 * until its text is fully under the menu (email 807.05, code 808.12; a 3-frame overlap of the menu edge during the
 * fast scroll is accepted over any frame of readable text), then the menu itself hides them.
 */
const AKUN_BLUR: BlurBox[] = [
  // HB Center (still on screen until the Akun page swaps in at 801.10; scrolled back to the top from 795.5, so the rects
  // match beats/hb.ts HB_BLUR at the top of the page): the Live signals row values and the Active signals values (user
  // 16 Okt: blurred whenever on screen). QA round 1 #1: these were readable under the Akun chapter card.
  {x: 1900, y: 1422, w: 1310, h: 64, from: 795.0, to: 801.08, sigma: 18},
  {x: 1290, y: 1812, w: 1510, h: 328, from: 795.0, to: 801.08, sigma: 18},
  // The browser's link-hover bubble bottom-left ("https://hakabot.com/profile", 798.3–799.87) while Profile is hovered.
  {x: 0, y: 2044, w: 372, h: 44, from: 798.2, to: 799.95, sigma: 14, tint: 0.88},
  // The account menu's email line (open 797.10–799.43).
  {x: 3405, y: 298, w: 205, h: 44, from: 796.9, to: 799.6, sigma: 18},
  // Info akun: email (text x 1586–1778, y 628–656).
  {x: 1574, y: 614, w: 224, h: 56, from: 800.9, to: 807.06, sigma: 18, track: SCROLL},
  // Info akun: referral code (text x 1616–1726, y 894–920).
  {x: 1604, y: 882, w: 136, h: 50, from: 800.9, to: 808.16, sigma: 18, track: SCROLL},
  // Nama tampilan field (holds the account name).
  {x: 1366, y: 1160, w: 230, h: 64, from: 800.9, to: 826.0, sigma: 18, track: SCROLL},
];

export const beats: Record<string, Beat> = {
  // The account name (blurred) is ringed on "halaman" and clicked on "Klik"; its menu opens (email blurred), Profile →
  // one jump cut over the page load (799.5 → 801.0) → the Akun page; the camera eases onto Info akun. Plan + status (one
  // group; the line no longer says "8 hari", 16 Okt)
  // on "paket"; Salin ringed on "kode", clicked on "Salin".
  'akun-1': {
    kind: 'footage',
    shots: [
      {
        rec: REC,
        pieces: [
          {from: 795.6, to: 799.5, align: 797.1, at: {line: 'akun-1-open', word: 'Klik'}},
          {from: 801.0, to: 803.5, align: 801.1, at: {line: 'akun-1-plan', off: -0.4}},
          {from: 803.5, to: 806.4, align: 804.5, at: {line: 'akun-1-ref', word: 'Salin'}},
        ],
        cam: {from: FULL, to: TOP, at: {rec: 801.2}, dur: 1.8},
        marks: [
          {kind: 'ring', rect: ACCOUNT, at: {line: 'akun-1-open', word: 'halaman'}, until: {rec: 797.1, off: 0.3}, pad: 4},
          {kind: 'click', x: 3574, y: 222, rec: 797.07},
          {kind: 'click', x: 3440, y: 465, rec: 799.4},
          {kind: 'ring', rect: PLAN, at: {max: [{line: 'akun-1-plan', word: 'paket'}, {rec: 801.2, off: 1.6}]}, pad: 6},
          {kind: 'ring', rect: SALIN, at: {line: 'akun-1-ref', word: 'kode'}, pad: 4},
          {kind: 'click', x: 1790, y: 906, rec: 804.5},
        ],
        blur: AKUN_BLUR,
      },
    ],
  },
  // The page scrolls down as the line starts; the camera eases with it. Name field on "nama", password card on "kata",
  // the size switch on "Ukuran" (the cursor runs Kecil → Sangat Besar as they're named).
  'akun-2': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [
          // rate 1.5: the scroll settles at 809.0 (the rings' rects are measured there); at 1× the name ring waited
          // until 2,4 s and pushed "kata sandi" and the size ring 0,6–0,7 s past their words (real timing).
          {from: 806.4, to: 811.0, align: 806.6, at: {line: 'akun-2-name'}, rate: 1.5},
          {from: 811.0, to: 815.0, align: 812.5, at: {line: 'akun-2-size', word: 'Kecil'}},
        ],
        cam: {from: TOP, to: MID, at: {rec: 806.7}, dur: 1.5},
        marks: [
          {kind: 'ring', rect: NAME_FIELD, at: {max: [{line: 'akun-2-name', word: 'nama'}, {rec: 809.0}]}, pad: 6},
          {kind: 'ring', rect: PASSWORD, at: {line: 'akun-2-name', word: 'kata'}},
          {kind: 'ring', rect: SIZES, at: {line: 'akun-2-size', word: 'Ukuran'}, pad: 6},
        ],
        blur: AKUN_BLUR,
      },
    ],
  },
  // Down to Notifikasi: the button ringed on "Klik", clicked on "harian". Crossfade to the top-left corner for the
  // browser prompt (ringed, Allow clicked on "browser"). Crossfade back once the card has switched: its line of text on
  // "malam", Kirim notifikasi uji on "Kirim", Keluar on "Keluar".
  'akun-3': {
    kind: 'footage',
    enter: 'cut',
    shots: [
      {
        rec: REC,
        pieces: [{from: 815.0, to: 818.9, align: 818.55, at: {line: 'akun-3-on', word: 'harian'}}],
        cam: {from: MID, to: NOTIF, at: 0.1, dur: 1.6},
        marks: [
          {kind: 'ring', rect: ENABLE, at: {line: 'akun-3-on', word: 'Klik'}, until: {rec: 818.55, off: 0.4}, pad: 4},
          {kind: 'click', x: 1528, y: 1647, rec: 818.55},
        ],
        blur: AKUN_BLUR,
      },
      {
        rec: REC,
        start: {line: 'akun-3-on', word: 'lalu'},
        pieces: [{from: 818.9, to: 821.6, align: 821.2, at: {line: 'akun-3-on', word: 'browser', off: 0.3}}],
        cam: {from: PROMPT_VIEW},
        marks: [
          {kind: 'ring', rect: PROMPT, at: {max: [{line: 'akun-3-on', word: 'lalu'}, {rec: 819.2}]}, until: {rec: 821.2, off: 0.3}, pad: 4},
          {kind: 'click', x: 480, y: 293, rec: 821.2},
        ],
        blur: AKUN_BLUR,
      },
      {
        rec: REC,
        start: {line: 'akun-3-on', word: 'Notifikasinya'},
        pieces: [{from: 823.3, to: 825.9}],
        cam: {from: NOTIF},
        marks: [
          {kind: 'ring', rect: NOTIF_TEXT, at: {max: [{line: 'akun-3-on', word: 'malam'}, {rec: 823.8}]}, pad: 3},
          {kind: 'ring', rect: TEST, at: {line: 'akun-3-test', word: 'Kirim'}, pad: 4},
          {kind: 'ring', rect: LOGOUT, at: {line: 'akun-3-off', word: 'Keluar'}, pad: 4},
        ],
        blur: AKUN_BLUR,
      },
    ],
  },
};
