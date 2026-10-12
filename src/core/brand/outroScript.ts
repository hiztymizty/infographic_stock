// The standard Hakabot outro voice script (proposed; docs/hakabot.md), and an estimated timing
// built from it the same way `voiceover.py --estimate` does, so the outro can be previewed on its
// own (composition `hakabot-outro-preview`) before any episode voices it.

import type {CaptionChunk, LineTiming, SceneTiming, Timing, Word} from '../timing';
import {OUTRO_SCENE_ID} from './outroConfig';

/**
 * One line per beat group (outro-1…outro-3) and the URL line last: the end card lands on it.
 * Plain Bahasa for general viewers: every feature is said in words a non-investor understands.
 * The short pauses let each beat breathe before the next feature starts.
 */
export const OUTRO_SCRIPT: {leadSec: number; tailSec: number; minSec: number; lines: {id: string; text: string; pauseBefore?: number}[]} = {
  leadSec: 0.3,
  /** Hold after the URL line so the end card stays ≥ 3 s. */
  tailSec: 1.8,
  minSec: 12,
  lines: [
    {id: 'outro-1', text: 'Di chart Hakabot, tinggal klik dan garis aliran dana investor asing langsung muncul.'},
    {id: 'outro-2', text: 'Broker activity nunjukin broker mana yang lagi banyak beli atau jual.', pauseBefore: 0.3},
    {id: 'outro-3', text: 'Screener otomatis nyaring saham, misalnya yang lagi naik, lengkap sama chart.', pauseBefore: 0.3},
    {id: 'outro-4', text: 'Cek di {hakabot.com|hakabot dot com}.', pauseBefore: 0.3},
  ],
};

const EST_CPS = 15.5;
const GAP_SEC = 0.22;
const CHUNK_MAX_WORDS = 6;
const CHUNK_MAX_CHARS = 30;
const MARKUP = /\{([^{}|]+)\|([^{}]+)\}/g;

/** {display|spoken} markup → display text, spoken text and display tokens with spoken offsets. */
const parseLine = (text: string) => {
  const tokens: {text: string; a: number; b: number}[] = [];
  let display = '';
  let spoken = '';
  const plain = (chunk: string) => {
    for (const m of chunk.matchAll(/\S+/g)) tokens.push({text: m[0], a: spoken.length + m.index!, b: spoken.length + m.index! + m[0].length});
    display += chunk;
    spoken += chunk;
  };
  let pos = 0;
  for (const m of text.matchAll(MARKUP)) {
    plain(text.slice(pos, m.index));
    tokens.push({text: m[1], a: spoken.length, b: spoken.length + m[2].length});
    display += m[1];
    spoken += m[2];
    pos = m.index! + m[0].length;
  }
  plain(text.slice(pos));
  // Punctuation right after a {display|spoken} token belongs to that caption word.
  const merged: typeof tokens = [];
  for (const t of tokens) {
    const last = merged[merged.length - 1];
    if (last && /^[.,!?:;…%)]+$/.test(t.text)) merged[merged.length - 1] = {text: last.text + t.text, a: last.a, b: t.b};
    else merged.push(t);
  }
  return {display, spoken, tokens: merged};
};

const chunkWords = (words: Word[]) => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    const text = cur.map((x) => x.text).join(' ');
    const breaks = /[.,!?:;…]$/.test(w.text);
    if (cur.length >= CHUNK_MAX_WORDS || text.length >= CHUNK_MAX_CHARS || (breaks && cur.length >= 2)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) {
    const last = chunks[chunks.length - 1];
    if (last && cur.length === 1 && [...last, ...cur].map((x) => x.text).join(' ').length <= CHUNK_MAX_CHARS + 14) last.push(...cur);
    else chunks.push(cur);
  }
  return chunks;
};

/** Estimated timing for the outro scene alone (no audio), like `voiceover.py --estimate`. */
export const estimateOutroTiming = (fps = 30, script = OUTRO_SCRIPT): Timing => {
  const f = (sec: number) => Math.round(sec * fps);
  const lines: LineTiming[] = [];
  const captions: CaptionChunk[] = [];
  let t = script.leadSec;
  for (const ln of script.lines) {
    t += ln.pauseBefore ?? 0;
    const {display, spoken, tokens} = parseLine(ln.text);
    const dur = spoken.length / EST_CPS;
    const words: Word[] = tokens.map((tk) => ({
      text: tk.text,
      from: f(t + (dur * tk.a) / spoken.length),
      to: Math.max(f(t + (dur * tk.a) / spoken.length) + 1, f(t + (dur * tk.b) / spoken.length)),
    }));
    lines.push({id: ln.id, scene: OUTRO_SCENE_ID, from: f(t), dur: Math.max(1, f(dur)), audio: null, display, spoken});
    const groups = chunkWords(words);
    groups.forEach((g, i) => captions.push({line: ln.id, from: g[0].from, to: i + 1 < groups.length ? groups[i + 1][0].from : Math.max(g[g.length - 1].to, f(t + dur)), words: g}));
    t += dur + GAP_SEC;
  }
  const end = Math.max(script.minSec, t - GAP_SEC + script.tailSec);
  const scene: SceneTiming = {id: OUTRO_SCENE_ID, from: 0, dur: f(end)};
  return {episode: 'hakabot-outro-preview', fps, estimated: true, totalFrames: scene.dur, scenes: [scene], lines, captions};
};
