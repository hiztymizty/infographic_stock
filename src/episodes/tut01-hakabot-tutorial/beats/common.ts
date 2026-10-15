// Shared by every chapter of tut01 (owner: Step-1 motion-designer; add to it only with the producer's OK).
// All positions are raw New.mp4 px (3840×2160, 4K). Viewport = x 0–3840, y 132–2088 (recordings.json).
import type {CamPos, Rect} from '../../../core/tutorial/types';

/** The recording every chapter plays (recordings.json → "n", temp/New.mp4). */
export const REC = 'n';

/** The whole page (zoom 1: the 3840-px viewport fills the window). Use briefly when a new page opens. */
export const FULL: CamPos = {x: 1920, y: 1110, zoom: 1};

/**
 * Top menu items (sticky: same place on every page and scroll position). Ring one as it's named or clicked;
 * click ripples go at its centre (`navCenter`).
 */
export const NAV: Record<'bar' | 'Dashboard' | 'Watchlist' | 'HB Center' | 'Screener' | 'Stock' | 'Index' | 'Composition' | 'Subscription' | 'Resources', Rect> = {
  bar: {x: 1030, y: 186, w: 1588, h: 70},
  Dashboard: {x: 1038, y: 189, w: 174, h: 63},
  Watchlist: {x: 1220, y: 189, w: 150, h: 63},
  'HB Center': {x: 1398, y: 189, w: 188, h: 63},
  Screener: {x: 1592, y: 189, w: 172, h: 63},
  Stock: {x: 1798, y: 189, w: 110, h: 63},
  Index: {x: 1918, y: 189, w: 106, h: 63},
  Composition: {x: 2034, y: 189, w: 186, h: 63},
  Subscription: {x: 2254, y: 189, w: 188, h: 63},
  Resources: {x: 2451, y: 189, w: 164, h: 63},
};
export const navCenter = (k: keyof typeof NAV) => ({x: NAV[k].x + NAV[k].w / 2, y: NAV[k].y + NAV[k].h / 2});

/** The account name + avatar, top-right (always blurred by the recording; the Akun page opens from here). */
export const ACCOUNT: Rect = {x: 3456, y: 176, w: 316, h: 90};
