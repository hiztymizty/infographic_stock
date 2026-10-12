import React, {createContext, useContext} from 'react';

/** Shape of src/episodes/<id>/timing.json, written by scripts/voiceover.py. */
export type Word = {text: string; from: number; to: number};
export type SceneTiming = {id: string; from: number; dur: number};
export type LineTiming = {
  id: string;
  scene: string;
  from: number;
  dur: number;
  audio: string | null;
  display: string;
  spoken: string;
};
export type CaptionChunk = {line: string; from: number; to: number; words: Word[]};
/** One voiced take: a scene (or part of one) read in a single breath. */
export type VoiceTake = {id: string; scene: string; from: number; dur: number; audio: string | null; display: string; spoken: string};
export type Timing = {
  episode: string;
  fps: number;
  estimated: boolean;
  totalFrames: number;
  scenes: SceneTiming[];
  /** Voice audio by take (timings written before takes existed carry audio on `lines` instead). */
  voice?: VoiceTake[];
  lines: LineTiming[];
  captions: CaptionChunk[];
};

const TimingCtx = createContext<Timing | null>(null);
const SceneCtx = createContext<SceneTiming | null>(null);

export const TimingProvider = TimingCtx.Provider;
export const SceneProvider = SceneCtx.Provider;

export const useTiming = () => {
  const t = useContext(TimingCtx);
  if (!t) throw new Error('useTiming() outside an EpisodeShell');
  return t;
};

/** The scene this component renders in: frames are relative to its start. */
export const useScene = () => {
  const s = useContext(SceneCtx);
  if (!s) throw new Error('useScene() outside a scene');
  return s;
};

/**
 * A voiceover line's position relative to the current scene, so animation can land on the
 * words. `from`/`end` are scene-relative frames.
 */
export const useLine = (id: string) => {
  const timing = useTiming();
  const scene = useScene();
  const line = timing.lines.find((l) => l.id === id);
  if (!line) throw new Error(`No voiceover line "${id}" in timing.json`);
  return {from: line.from - scene.from, dur: line.dur, end: line.from - scene.from + line.dur};
};

/**
 * Scene-relative frame where a caption word starts, e.g. useWordAt('twist-1', 'Juni').
 * Matches the displayed word (case-insensitive prefix); `nth` picks a later match.
 * Falls back to the line start if the word is missing.
 */
export const useWordAt = (lineId: string, word: string, nth = 0) => {
  const timing = useTiming();
  const scene = useScene();
  const needle = word.toLowerCase();
  const hits = timing.captions
    .filter((c) => c.line === lineId)
    .flatMap((c) => c.words)
    .filter((w) => w.text.replace(/ /g, ' ').toLowerCase().startsWith(needle));
  const line = timing.lines.find((l) => l.id === lineId);
  const abs = hits[nth]?.from ?? line?.from ?? scene.from;
  return abs - scene.from;
};
