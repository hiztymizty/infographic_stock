// Tutorial editing system: the data a beat (one script scene) is configured with.
//
// Units: positions are pixels of the RAW recording (tut01's New.mp4 is 3840×2160, so 4K px: read them straight off
// a full-size frame, e.g. `ffmpeg -ss <t> -i temp/New.mp4 -frames:v 1 f.png`); footage times are seconds in the raw
// recording; scene-time positions are "anchors" (below), resolved against the episode's timing.json, so everything
// re-syncs when the real voice timing lands. Cut clips may be scaled: the player maps them back to raw px.
import type React from 'react';

export type Rect = {x: number; y: number; w: number; h: number};

/**
 * A moment in the scene.
 * - number: seconds after the scene starts (use only for entrances in the first ~20 frames)
 * - {line}: when a voice line starts (`end: true` → when it ends), optionally at a spoken word
 *   (`word`, case-insensitive prefix of the displayed word; `nth` picks a later match); `off` shifts it (seconds)
 * - {rec}: when that recording second plays in this beat's footage (after the footage plan), `off` seconds later
 * - {max}: the latest of several anchors (e.g. "on this word, but not before the scroll has finished")
 */
export type Anchor =
  | number
  | {line: string; word?: string; nth?: number; end?: boolean; off?: number}
  | {rec: number; off?: number}
  | {max: Anchor[]};

/** Anchors a footage piece may use (footage can't wait on itself). */
export type VoiceAnchor = number | {line: string; word?: string; nth?: number; end?: boolean; off?: number};

/**
 * A stretch of the recording to play. Pieces play in order; a gap between one piece's `to` and the next one's
 * `from` is a jump cut (house rule: at most one per shot, only over dead time). Between pieces the picture
 * holds (as if the user paused), so a piece can wait for the narration.
 */
export type Piece = {
  from: number;
  to: number;
  /** The recording second that should land on `at` (default `from`), e.g. the frame of a click. */
  align?: number;
  /** When `align` plays. Omitted: the piece starts right after the previous one (or at the shot start). */
  at?: VoiceAnchor;
  /** Base speed (default 1). The part after `align` speeds up to MAX_RATE when it must finish in time. Never < 1. */
  rate?: number;
};

/**
 * Camera: centre (recording px) and zoom. zoom 1 = the page viewport's full width fills the screen window
 * (a 3840-px-wide viewport: 1 recording px = 0,48 screen px; zoom 2 ≈ 1:1 with the 4K source, still sharp).
 * The view is clamped to the viewport, so a centre near an edge just sits against it.
 */
export type CamPos = {x: number; y: number; zoom: number};

/** One slow eased move per shot at most (house rule): `from` → `to`, starting at `at`, lasting `dur` seconds. */
export type Cam = {from: CamPos; to?: CamPos; at?: Anchor; dur?: number};

/** Where a highlight's label sits relative to it (default: above, or below near the window top). */
export type Side = 'above' | 'below' | 'left' | 'right';

/**
 * Highlights.
 * - ring: thin focus ring around `rect` from `at` until `until` (default: the next ring, or the end of the shot).
 *   Only one ring is on screen at a time, each held ≥ MIN_HOLD. `spot` softly dims everything else (use it when
 *   the element is small or the page is busy, not by default); `label` adds a short caption next to it (2–5 words;
 *   most rings need none, the voice says it); `track` follows content that scrolls (offsets keyed by recording second).
 * - click: subtle ripple at the frame the recording second `rec` plays (a real click in the footage).
 * - path: a single ring gliding between `rects` at the `at` moments (a ring on the move counts as one highlight).
 */
export type Mark =
  | {
      kind: 'ring';
      rect: Rect;
      at: Anchor;
      until?: Anchor;
      label?: string;
      side?: Side;
      spot?: boolean;
      /** Ring padding in screen px (default 8; use ~3 for tightly packed small elements). */
      pad?: number;
      track?: {t: number; dx: number; dy: number}[];
    }
  | {kind: 'click'; x: number; y: number; rec: number; label?: string; side?: Side}
  /** One ring that glides from element to element as each is named (e.g. a menu read out left to right). */
  | {kind: 'path'; rects: Rect[]; at: Anchor[]; until?: Anchor};

/**
 * A privacy blur over an identifier (account name, email, referral code…). Rect in recording px. `from`/`to` limit
 * it to recording seconds (e.g. only while a page is open); `track` moves it with content that scrolls (offsets
 * keyed by recording second, linear between keys); `sigma` is the blur radius in recording px (default 16, enough
 * for 4K text); `tint` darkens it (0–1, default 0.3). Put always-on blurs on the Recording, page-specific ones on
 * the Shot (`shot.blur`).
 */
export type BlurBox = Rect & {from?: number; to?: number; sigma?: number; tint?: number; track?: {t: number; dx: number; dy: number}[]};

/**
 * A source recording: the part of the frame that is app page (`bounds`, recording px), the colour painted outside
 * it, and always-on blurs. Cut clips are crops of `bounds` (any scale); they're drawn back at `bounds`.
 */
export type Recording = {
  /** Path of the raw file, relative to the repo root (documentation; the cut clips are what plays). */
  file: string;
  /** The page viewport. Nothing outside it is ever shown (tabs, taskbar, OBS): it's painted `fill`. */
  bounds: Rect;
  fill: string;
  blur: BlurBox[];
};

/** A cut clip of a recording, as listed in the episode's clips.json and written by scripts/tutorial_clips.py. */
export type Clip = {rec: string; start: number; end: number};

/** One shot: footage from one recording with its camera, highlights and blurs. */
export type Shot = {
  rec: string;
  pieces: Piece[];
  cam: Cam;
  marks?: Mark[];
  blur?: BlurBox[];
  /** When this shot starts (the first shot starts with the scene). Later shots crossfade in. */
  start?: VoiceAnchor;
};

/** A beat built from screen footage (most scenes). `enter: 'cut'` continues the previous beat's picture seamlessly. */
export type FootageBeat = {kind: 'footage'; shots: Shot[]; enter?: 'fade' | 'cut'};
/**
 * A code-made scene (title card, end card…). Drawn inside the screen window (WIN.w × WIN.h), or over the whole
 * 1920×1080 frame with `full: true` (intro, end card: no window, no chapter label).
 */
export type CustomBeat = {kind: 'custom'; component: React.FC; enter?: 'fade' | 'cut'; full?: boolean};
export type Beat = FootageBeat | CustomBeat;

/** A chapter: its card shows when its first scene starts; its label stays on screen until the next chapter. */
export type Chapter = {n: number; title: string; first: string; scenes: (id: string) => boolean};

export type TutorialDef = {
  id: string;
  timing: import('../timing').Timing;
  recordings: Record<string, Recording>;
  clips: Record<string, Clip>;
  /** Folder under public/ with the cut clips, e.g. 'tutorial/tut01'. */
  clipDir: string;
  beats: Record<string, Beat>;
  chapters: Chapter[];
  /** Auto SFX on clicks, rings and chapter cards (off for a silent preview; the sound designer tunes it). */
  sfx?: boolean;
};
