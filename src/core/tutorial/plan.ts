// Planning a tutorial shot: where each footage piece sits on the scene's timeline and at what speed,
// how anchors resolve to frames, where the camera looks, which ring is up when. Pure functions.
import {Easing} from 'remotion';
import type {LineTiming, Timing} from '../timing';
import {MAX_RATE, MIN_HOLD, SRC_FPS, WIN} from './layout';
import type {Anchor, Cam, CamPos, Clip, Mark, Piece, Rect, Shot, VoiceAnchor} from './types';

export const ease = Easing.inOut(Easing.cubic);

// ---------------------------------------------------------------------------------------------
// Voice anchors

/** Absolute frame of a voice anchor (number = seconds after `sceneFrom`). Throws on unknown lines (typos). */
export const voiceFrame = (a: VoiceAnchor, timing: Timing, sceneFrom: number): number => {
  const fps = timing.fps;
  if (typeof a === 'number') return sceneFrom + Math.round(a * fps);
  const line: LineTiming | undefined = timing.lines.find((l) => l.id === a.line);
  if (!line) throw new Error(`tutorial: no voice line "${a.line}" in timing.json`);
  let f = a.end ? line.from + line.dur : line.from;
  if (a.word) {
    const needle = a.word.toLowerCase();
    const hits = timing.captions
      .filter((c) => c.line === a.line)
      .flatMap((c) => c.words)
      .filter((w) => w.text.replace(/ /g, ' ').toLowerCase().startsWith(needle));
    const hit = hits[a.nth ?? 0];
    if (!hit) throw new Error(`tutorial: word "${a.word}" (#${a.nth ?? 0}) not found in line "${a.line}"`);
    f = hit.from;
  }
  return f + Math.round((a.off ?? 0) * fps);
};

// ---------------------------------------------------------------------------------------------
// Footage plan (frames are shot-relative)

export type PlannedPiece = {
  piece: Piece;
  clip: string;
  /** Frame the piece starts playing. */
  start: number;
  /** Seconds trimmed off the piece's start (when it had to start later than planned). */
  skip: number;
  /** Speed before / after `align`. */
  r1: number;
  r2: number;
  align: number;
  alignFrame: number;
  end: number;
};

export type FootagePlan = {pieces: PlannedPiece[]; dur: number};

/** The clip (from the episode's clip lists) that holds a whole piece of recording `rec`. */
const clipFor = (clips: Record<string, Clip>, rec: string, from: number, to: number): string => {
  const eps = 0.02;
  const hit = Object.entries(clips).find(([, c]) => c.rec === rec && c.start <= from + eps && c.end >= to - eps);
  if (!hit) throw new Error(`tutorial: no clip covers recording "${rec}" ${from}–${to} s`);
  return hit[0];
};

/**
 * Lays a shot's pieces out on its time span: each anchored piece starts so that its `align` second lands on its
 * anchor (if it can't start that early, its lead-in is trimmed); between pieces the picture holds; the part after
 * `align` speeds up (≤ MAX_RATE) when it would otherwise run into the next anchored piece or the shot's end;
 * whatever still doesn't fit is cut by the shot's end. Never slower than 1×.
 */
export const planFootage = (
  shot: Shot,
  dur: number,
  frameOf: (a: VoiceAnchor) => number,
  clips: Record<string, Clip>,
  fps: number,
): FootagePlan => {
  const out: PlannedPiece[] = [];
  let prevEnd = 0;
  const desiredStartOf = (p: Piece) => {
    if (p.at === undefined) return null;
    const base = Math.max(1, p.rate ?? 1);
    return frameOf(p.at) - (((p.align ?? p.from) - p.from) / base) * fps;
  };
  shot.pieces.forEach((p, i) => {
    const base = Math.max(1, p.rate ?? 1);
    const align = Math.min(p.to, Math.max(p.from, p.align ?? p.from));
    const desired = desiredStartOf(p) ?? prevEnd;
    const start = Math.max(desired, prevEnd, 0);
    const skip = start > desired ? Math.min(((start - desired) / fps) * base, align - p.from) : 0;
    const alignFrame = start + ((align - p.from - skip) / base) * fps;
    // The next anchored piece (or the shot end) is the deadline for the part after `align`.
    let limit = dur;
    for (let k = i + 1; k < shot.pieces.length; k++) {
      const d = desiredStartOf(shot.pieces[k]);
      if (d !== null) {
        limit = Math.min(limit, d);
        break;
      }
    }
    const post = p.to - align;
    const avail = (limit - alignFrame) / fps;
    const r2 = post <= 0 ? base : avail <= 0 ? MAX_RATE : Math.min(MAX_RATE, Math.max(base, post / avail));
    const end = alignFrame + (post / r2) * fps;
    out.push({piece: p, clip: clipFor(clips, shot.rec, p.from, p.to), start, skip, r1: base, r2, align, alignFrame, end});
    prevEnd = end;
  });
  return {pieces: out, dur};
};

/** Recording second on screen at shot frame `f`, and the piece it belongs to. */
export const recAt = (plan: FootagePlan, f: number, fps: number): {rec: number; pi: number} => {
  const ps = plan.pieces;
  if (f < ps[0].start) return {rec: ps[0].piece.from + ps[0].skip, pi: 0};
  let pi = 0;
  for (let i = 0; i < ps.length; i++) if (ps[i].start <= f) pi = i;
  const p = ps[pi];
  const rec =
    f <= p.alignFrame
      ? p.piece.from + p.skip + ((f - p.start) / fps) * p.r1
      : p.align + ((f - p.alignFrame) / fps) * p.r2;
  // Holds the piece's last frame (one source frame before `to`, so it stays inside the clip).
  return {rec: Math.min(rec, p.piece.to - 1 / SRC_FPS), pi};
};

/** Shot frame at which recording second `rec` plays (nearest piece boundary if it is cut out). */
export const frameOfRec = (plan: FootagePlan, rec: number, fps: number): number => {
  const ps = plan.pieces;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    const a = p.piece.from + p.skip;
    if (rec >= a && rec <= p.piece.to) {
      const f = rec <= p.align ? p.start + ((rec - a) / p.r1) * fps : p.alignFrame + ((rec - p.align) / p.r2) * fps;
      return Math.round(f);
    }
    if (rec < a) return Math.round(p.start);
  }
  return Math.round(ps[ps.length - 1].end);
};

// ---------------------------------------------------------------------------------------------
// Any anchor (shot-relative frames)

export const anchorFrame = (a: Anchor, voice: (v: VoiceAnchor) => number, plan: FootagePlan, fps: number): number => {
  if (typeof a === 'object' && 'max' in a) return Math.max(...a.max.map((x) => anchorFrame(x, voice, plan, fps)));
  if (typeof a === 'object' && 'rec' in a) return frameOfRec(plan, a.rec, fps) + Math.round((a.off ?? 0) * fps);
  return voice(a);
};

// ---------------------------------------------------------------------------------------------
// Camera and view

export const camAt = (cam: Cam, f: number, startF: number): CamPos => {
  if (!cam.to) return cam.from;
  const d = Math.max(1, Math.round((cam.dur ?? 1.6) * 30));
  const p = ease(Math.min(1, Math.max(0, (f - startF) / d)));
  return {
    x: cam.from.x + (cam.to.x - cam.from.x) * p,
    y: cam.from.y + (cam.to.y - cam.from.y) * p,
    zoom: cam.from.zoom + (cam.to.zoom - cam.from.zoom) * p,
  };
};

export type View = {s: number; tx: number; ty: number};

/**
 * Window transform for a camera position. The view never leaves the page viewport `b`; when the view is larger
 * than the viewport it is centred horizontally and aligned to the top (the strip below is painted with the fill).
 */
export const viewOf = (c: CamPos, b: Rect): View => {
  // zoom 1: the viewport's width fills the window.
  const s = (WIN.w / b.w) * c.zoom;
  const vw = WIN.w / s;
  const vh = WIN.h / s;
  const x = vw >= b.w ? b.x + b.w / 2 : Math.min(b.x + b.w - vw / 2, Math.max(b.x + vw / 2, c.x));
  const y = vh >= b.h ? b.y + vh / 2 : Math.min(b.y + b.h - vh / 2, Math.max(b.y + vh / 2, c.y));
  return {s, tx: WIN.w / 2 - x * s, ty: WIN.h / 2 - y * s};
};

export const toScreen = (r: Rect, v: View): Rect => ({x: v.tx + r.x * v.s, y: v.ty + r.y * v.s, w: r.w * v.s, h: r.h * v.s});

// ---------------------------------------------------------------------------------------------
// Rings: one at a time, each held ≥ MIN_HOLD

export type PlannedRing = {mark: Extract<Mark, {kind: 'ring'}>; from: number; to: number};

export const planRings = (marks: Mark[], dur: number, at: (a: Anchor) => number): PlannedRing[] => {
  const rings = marks
    .filter((m): m is Extract<Mark, {kind: 'ring'}> => m.kind === 'ring')
    .map((m) => ({mark: m, from: at(m.at)}))
    .sort((a, b) => a.from - b.from);
  for (let i = 1; i < rings.length; i++) rings[i].from = Math.max(rings[i].from, rings[i - 1].from + MIN_HOLD);
  return rings.map((r, i) => {
    const next = i + 1 < rings.length ? rings[i + 1].from : dur;
    const own = r.mark.until !== undefined ? Math.max(at(r.mark.until), r.from + MIN_HOLD) : next;
    return {mark: r.mark, from: r.from, to: Math.min(own, next)};
  });
};
