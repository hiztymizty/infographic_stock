import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from '../components/ui';
import {C, MONO, SANS} from '../theme';
import {useTiming} from '../timing';
import {CARD_HOLD, SUB_BOTTOM, TH, TW, WIN} from './layout';
import type {Chapter} from './types';

/** Navy backdrop behind the screen window (16:9 version of the house background, without the busy grid). */
export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.bgTop} 0%, ${C.bg} 55%, #070A10 100%)`}}>
      <div
        style={{
          position: 'absolute',
          width: 1400,
          height: 1400,
          borderRadius: '50%',
          left: -600 + Math.sin(t * 0.2) * 60,
          top: -500 + Math.cos(t * 0.17) * 60,
          background: 'radial-gradient(circle, rgba(57,135,229,0.16), transparent 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1300,
          height: 1300,
          borderRadius: '50%',
          right: -560 + Math.cos(t * 0.18) * 60,
          bottom: -620 + Math.sin(t * 0.15) * 60,
          background: 'radial-gradient(circle, rgba(18,18,249,0.14), transparent 62%)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Subtitles

type Sub = {from: number; to: number; text: string};

/** Longest subtitle (characters): two lines of 36 px in the 1380-px box. */
const SUB_MAX = 84;

type W = {text: string; from: number; to: number};
const joinW = (ws: W[]) => ws.map((w) => w.text).join(' ');

/** Splits a run of words into pieces of ≤ SUB_MAX characters, breaking after a comma near the middle when it can. */
const splitRun = (ws: W[]): W[][] => {
  if (joinW(ws).length <= SUB_MAX || ws.length < 2) return [ws];
  const total = joinW(ws).length;
  let best = -1;
  let bestScore = Infinity;
  for (let i = 1; i < ws.length; i++) {
    const left = joinW(ws.slice(0, i)).length;
    const right = total - left - 1;
    if (left > SUB_MAX && right > SUB_MAX) continue;
    // Balanced halves, a strong preference for breaking after a comma, never leaving a 1–2 word stub.
    const comma = /[,;:]$/.test(ws[i - 1].text) ? -0.5 * total : 0;
    const stub = i < 3 || ws.length - i < 3 ? total : 0;
    const score = Math.abs(left - right) + comma + stub;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (best < 0) best = Math.ceil(ws.length / 2);
  return [...splitRun(ws.slice(0, best)), ...splitRun(ws.slice(best))];
};

/**
 * Subtitles rebuilt from the voice's words (timing.json, estimated now, real once voiced): one sentence per
 * subtitle, long sentences split into balanced pieces (after a comma when possible), very short sentences joined to
 * the next one of the same line. Never starts a subtitle with the tail of the previous sentence.
 */
export const useSubtitles = (): Sub[] => {
  const {captions} = useTiming();
  return useMemo(() => {
    const byLine = new Map<string, W[]>();
    for (const c of captions) byLine.set(c.line, [...(byLine.get(c.line) ?? []), ...c.words]);
    const subs: Sub[] = [];
    for (const words of byLine.values()) {
      // Sentences.
      const sentences: W[][] = [];
      let cur: W[] = [];
      for (const w of words) {
        cur.push(w);
        if (/[.?!]["”)]?$/.test(w.text)) {
          sentences.push(cur);
          cur = [];
        }
      }
      if (cur.length) sentences.push(cur);
      // Pieces, then join short neighbours.
      const pieces = sentences.flatMap(splitRun);
      const merged: W[][] = [];
      for (const p of pieces) {
        const last = merged[merged.length - 1];
        if (last && (joinW(last).length < 24 || joinW(p).length < 12) && joinW(last).length + 1 + joinW(p).length <= SUB_MAX) last.push(...p);
        else merged.push([...p]);
      }
      for (const m of merged) subs.push({from: m[0].from, to: m[m.length - 1].to, text: joinW(m)});
    }
    subs.sort((x, y) => x.from - y.from);
    // Close small gaps so subtitles don't blink between sentences of one take.
    for (let i = 0; i + 1 < subs.length; i++) if (subs[i + 1].from - subs[i].to < 12) subs[i].to = subs[i + 1].from;
    return subs;
  }, [captions]);
};

/** One line up to ~60 characters; longer ones break into two even lines (after a comma near the middle if any). */
const subLines = (text: string): string[] => {
  if (text.length <= 60) return [text];
  const words = text.split(' ');
  let best = 1;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = text.length - a - 1;
    const score = Math.abs(a - b) - (/[,;:]$/.test(words[i - 1]) ? 0.25 * text.length : 0);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
};

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const subs = useSubtitles();
  const sub = subs.find((s) => frame >= s.from && frame < s.to);
  if (!sub) return null;
  const o = interpolate(frame, [sub.from, sub.from + 4, sub.to - 3, sub.to], [0, 1, 1, 0], CLAMP);
  const lines = subLines(sub.text);
  return (
    <div style={{position: 'absolute', left: 0, width: TW, bottom: TH - SUB_BOTTOM, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          maxWidth: 1380,
          padding: '10px 24px 11px',
          borderRadius: 12,
          background: 'rgba(7,10,17,0.8)',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 36,
          lineHeight: 1.3,
          color: C.text,
          textAlign: 'center',
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Chapters

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Chapter card when a chapter's first scene starts (the footage softly dims, "Bab 03" + title rise in, hold ~1 s,
 * fade), then a quiet label in the frame's top margin until the next chapter: it never sits on the app's UI.
 */
export const ChapterOverlay: React.FC<{chapters: Chapter[]; sceneAt: (f: number) => {id: string; from: number} | null}> = ({chapters, sceneAt}) => {
  const frame = useCurrentFrame();
  const {scenes} = useTiming();
  const scene = sceneAt(frame);
  if (!scene) return null;
  const ch = chapters.find((c) => c.scenes(scene.id));
  if (!ch) return null;
  const first = scenes.find((s) => s.id === ch.first);
  const start = first ? first.from : scene.from;
  const age = frame - start;
  const cardIn = interpolate(age, [0, 12], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const cardOut = interpolate(age, [12 + CARD_HOLD, 24 + CARD_HOLD], [1, 0], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const card = cardIn * cardOut;
  const rise = interpolate(age, [0, 22], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const label = interpolate(age, [6, 22], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return (
    <>
      {card > 0 && (
        <div style={{position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.radius, overflow: 'hidden'}}>
          <AbsoluteFill style={{background: `rgba(8,11,18,${0.66 * card})`}} />
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: card}}>
            <div style={{transform: `translateY(${(1 - rise) * 14}px)`, textAlign: 'center', marginTop: -40}}>
              <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.32em', color: C.dim}}>BAB {pad2(ch.n)}</div>
              <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 92, letterSpacing: '-0.035em', color: C.text, marginTop: 14, lineHeight: 1.05}}>
                {ch.title}
              </div>
              <div style={{width: 56 * rise, height: 2, borderRadius: 1, background: C.gold, margin: '26px auto 0', opacity: 0.9}} />
            </div>
          </AbsoluteFill>
        </div>
      )}
      {label > 0 && (
        <div
          style={{
            position: 'absolute',
            left: WIN.x + 6,
            top: 0,
            height: WIN.y,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            opacity: label,
          }}
        >
          <span style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.14em', color: C.mute}}>{pad2(ch.n)}</span>
          <span style={{width: 1, height: 20, background: 'rgba(255,255,255,0.16)'}} />
          <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.dim, letterSpacing: '-0.005em'}}>{ch.title}</span>
        </div>
      )}
    </>
  );
};

/** Marks previews built from estimated timing so they are never mistaken for the final cut (house rule). */
export const PreviewBadge: React.FC = () => (
  // Bottom-right of the frame margin under the window: covers no footage, subtitles or label.
  <div
    style={{
      position: 'absolute',
      right: WIN.x,
      bottom: Math.round((TH - WIN.y - WIN.h - 30) / 2),
      height: 30,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      borderRadius: 7,
      background: 'rgba(229,83,79,0.9)',
      fontFamily: MONO,
      fontWeight: 700,
      fontSize: 18,
      color: '#fff',
      letterSpacing: '0.08em',
    }}
  >
    PREVIEW · TIMING ESTIMATED · NO VOICEOVER
  </div>
);
