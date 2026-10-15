// Frame layout of a 16:9 tutorial (1920×1080). The screen footage sits in one large window on the navy
// backdrop; the chapter label lives in the top margin (never over app UI), the PREVIEW badge in the bottom margin,
// subtitles over the bottom of the window.

export const TW = 1920;
export const TH = 1080;
/** Frame rate of the screen recordings and of their cut clips. */
export const SRC_FPS = 30;

/**
 * The screen window (footage area). Its aspect (1,964) matches a 3840×1956 page viewport, so a full page at zoom 1
 * fills it edge to edge. Top margin y 0–72: chapter label. Bottom margin y 1009–1080: PREVIEW badge.
 */
export const WIN = {x: 40, y: 72, w: 1840, h: 937, radius: 18};

/** Subtitles: bottom of the subtitle box (frame px). Keep highlights above ~y 820 of the window. */
export const SUB_BOTTOM = WIN.y + WIN.h - 26;

/** Frames a fading beat or shot crossfades over the previous one. */
export const XF = 12;
/** Footage never plays faster than this (and never slower than 1×). */
export const MAX_RATE = 1.6;
/** A ring stays at least this long (frames) before the next one may replace it (house rule ≥ 1,2 s). */
export const MIN_HOLD = 36;
/** Chapter card: frames it is fully up (after a 12-frame fade in), then 12 frames out (≈ 1,6 s in all). */
export const CARD_HOLD = 24;
