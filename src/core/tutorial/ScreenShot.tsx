import React, {createContext, useContext, useMemo} from 'react';
import {AbsoluteFill, Easing, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx} from '../audio';
import {CLAMP} from '../components/ui';
import {C, SANS} from '../theme';
import {useScene, useTiming} from '../timing';
import {SRC_FPS, WIN, XF} from './layout';
import {
  FootagePlan,
  PlannedRing,
  View,
  anchorFrame,
  camAt,
  ease,
  frameOfRec,
  planFootage,
  planRings,
  recAt,
  toScreen,
  viewOf,
  voiceFrame,
} from './plan';
import type {Anchor, BlurBox, FootageBeat, Mark, Rect, Shot, Side, TutorialDef, VoiceAnchor} from './types';

export const TutorialCtx = createContext<TutorialDef | null>(null);
export const useTutorial = () => {
  const t = useContext(TutorialCtx);
  if (!t) throw new Error('useTutorial() outside a TutorialComposition');
  return t;
};

// ---------------------------------------------------------------------------------------------
// Highlight look (15 Okt, "more elegant"): thin soft rings, gentle fades with a 1.03 → 1 settle (no bounce),
// quiet glass labels, a faint click ripple. Calm and premium; gold is not used here.

const RING = {
  stroke: 2,
  color: 'rgba(255,255,255,0.92)',
  glow: '0 0 0 1px rgba(0,0,0,0.28), 0 0 18px 1px rgba(255,255,255,0.16), inset 0 0 12px rgba(255,255,255,0.05)',
  inF: 14,
  outF: 10,
  dim: 0.5,
};
const easeOut = Easing.out(Easing.cubic);
const easeIn = Easing.in(Easing.cubic);
const radiusFor = (w: number, h: number) => Math.max(6, Math.min(14, Math.min(w, h) * 0.3));

// ---------------------------------------------------------------------------------------------
// Footage frames

/** One frame of a cut clip, drawn at the page viewport `b` (recording px; the clip may be scaled). */
const ClipFrame: React.FC<{src: string; frame: number; b: Rect}> = ({src, frame, b}) => (
  <Freeze frame={frame}>
    <OffthreadVideo src={staticFile(src)} muted style={{position: 'absolute', left: 0, top: 0, width: b.w, height: b.h}} />
  </Freeze>
);

const offsetAt = (track: {t: number; dx: number; dy: number}[] | undefined, rec: number) => {
  if (!track || track.length === 0) return {dx: 0, dy: 0};
  const ts = track.map((k) => k.t);
  return {dx: interpolate(rec, ts, track.map((k) => k.dx), CLAMP), dy: interpolate(rec, ts, track.map((k) => k.dy), CLAMP)};
};

const blurRect = (b: BlurBox, rec: number): Rect | null => {
  if ((b.from !== undefined && rec < b.from) || (b.to !== undefined && rec > b.to)) return null;
  const {dx, dy} = offsetAt(b.track, rec);
  return {x: b.x + dx, y: b.y + dy, w: b.w, h: b.h};
};

/**
 * Privacy blur: a blurred copy of the same frame clipped to the box (a real `filter` on a copy; backdrop-filter
 * proved too weak to hide text in headless renders). `r` is relative to the viewport. The copy keeps a margin so
 * the blur doesn't fade at the edges.
 */
const BlurPatch: React.FC<{r: Rect; sigma: number; tint: number; src: string; frame: number; b: Rect}> = ({r, sigma, tint, src, frame, b}) => {
  const m = Math.ceil(sigma * 3);
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', borderRadius: 10}}>
      <div style={{position: 'absolute', left: -m, top: -m, width: r.w + 2 * m, height: r.h + 2 * m, overflow: 'hidden', filter: `blur(${sigma}px)`}}>
        <div style={{position: 'absolute', left: -(r.x - m), top: -(r.y - m), width: b.w, height: b.h}}>
          <ClipFrame src={src} frame={frame} b={b} />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: `rgba(30,34,44,${tint})`}} />
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Highlights (screen space inside the window, so strokes and text keep their size at any zoom)

/** Short caption next to a highlight, kept inside the window (and out of the subtitle strip). */
const Label: React.FC<{anchor: Rect; side?: Side; text: string; age: number; fade: number}> = ({anchor: r, side, text, age, fade}) => {
  const p = interpolate(age, [0, 12], [0, 1], {...CLAMP, easing: easeOut});
  const estW = text.length * 12.4 + 34;
  const estH = 44;
  const gap = 14;
  const bottomLimit = WIN.h - 130; // subtitles
  let s: Side = side ?? (r.y < 90 ? 'below' : 'above');
  if (s === 'right' && r.x + r.w + gap + estW > WIN.w - 24) s = 'left';
  if (s === 'left' && r.x - gap - estW < 24) s = 'above';
  if (s === 'above' && r.y - gap - estH < 16) s = 'below';
  if (s === 'below' && r.y + r.h + gap + estH > bottomLimit) s = 'above';
  const cx = Math.min(WIN.w - 24 - estW / 2, Math.max(24 + estW / 2, r.x + r.w / 2));
  const cy = Math.min(bottomLimit - estH / 2, Math.max(16 + estH / 2, r.y + r.h / 2));
  const d = 6 * (1 - p);
  const pos =
    s === 'above'
      ? {left: cx, top: r.y - gap, tf: `translate(-50%, -100%) translateY(${d}px)`}
      : s === 'below'
        ? {left: cx, top: r.y + r.h + gap, tf: `translate(-50%, 0) translateY(${-d}px)`}
        : s === 'right'
          ? {left: r.x + r.w + gap, top: cy, tf: `translate(0, -50%) translateX(${-d}px)`}
          : {left: r.x - gap, top: cy, tf: `translate(-100%, -50%) translateX(${d}px)`};
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top,
        transform: pos.tf,
        opacity: p * fade,
        padding: '8px 16px',
        borderRadius: 10,
        background: 'rgba(12,16,25,0.86)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.38)',
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: '-0.005em',
        color: C.text,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** The ring itself (shared by rings and paths). `p` = entrance progress 0–1, `o` = overall opacity. */
const RingBox: React.FC<{box: Rect; p: number; o: number; spot?: number}> = ({box, p, o, spot = 0}) => {
  const rad = radiusFor(box.w, box.h);
  const sc = 1.03 - 0.03 * p;
  return (
    <>
      {spot > 0 && (
        <div
          style={{
            position: 'absolute',
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
            borderRadius: rad,
            boxShadow: `0 0 0 4000px rgba(5,8,14,${RING.dim * spot})`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          borderRadius: rad,
          border: `${RING.stroke}px solid ${RING.color}`,
          boxShadow: RING.glow,
          opacity: o,
          transform: `scale(${sc})`,
        }}
      />
    </>
  );
};

const RingView: React.FC<{ring: PlannedRing; f: number; view: View; rec: number}> = ({ring, f, view, rec}) => {
  const {mark} = ring;
  if (f < ring.from || f > ring.to + RING.outF) return null;
  const age = f - ring.from;
  const p = interpolate(age, [0, RING.inF], [0, 1], {...CLAMP, easing: easeOut});
  const out = interpolate(f, [ring.to, ring.to + RING.outF], [1, 0], {...CLAMP, easing: easeIn});
  const {dx, dy} = offsetAt(mark.track, rec);
  const r = toScreen({...mark.rect, x: mark.rect.x + dx, y: mark.rect.y + dy}, view);
  const pad = mark.pad ?? 8;
  const box = {x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2};
  const spot = mark.spot ? interpolate(age, [0, 18], [0, 1], {...CLAMP, easing: easeOut}) * out : 0;
  return (
    <>
      <RingBox box={box} p={p} o={p * out} spot={spot} />
      {mark.label && <Label anchor={box} side={mark.side} text={mark.label} age={age - 4} fade={out} />}
    </>
  );
};

const ClickView: React.FC<{m: Extract<Mark, {kind: 'click'}>; at: number; f: number; view: View}> = ({m, at, f, view}) => {
  const age = f - at;
  if (age < -2 || age > 40) return null;
  const sx = view.tx + m.x * view.s;
  const sy = view.ty + m.y * view.s;
  const q = interpolate(age, [0, 22], [0, 1], {...CLAMP, easing: easeOut});
  const r = 7 + 27 * q;
  const ringO = interpolate(age, [0, 3, 22], [0, 0.75, 0], CLAMP);
  const dotO = interpolate(age, [-2, 1, 8, 18], [0, 0.85, 0.85, 0], CLAMP);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: sx - r,
          top: sy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.9)',
          opacity: ringO,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: sx - 6,
          top: sy - 6,
          width: 12,
          height: 12,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.85)',
          boxShadow: '0 0 10px rgba(255,255,255,0.5)',
          opacity: dotO,
        }}
      />
      {m.label && (
        <Label anchor={{x: sx - 20, y: sy - 20, w: 40, h: 40}} side={m.side} text={m.label} age={age - 2} fade={interpolate(age, [30, 40], [1, 0], CLAMP)} />
      )}
    </>
  );
};

type PlannedPath = {rects: Rect[]; ats: number[]; to: number};

/** One ring gliding between elements (12-frame eased glide), fading in at the first and out at `to`. */
const PathView: React.FC<{path: PlannedPath; f: number; view: View}> = ({path, f, view}) => {
  const {rects, ats, to} = path;
  if (f < ats[0] || f > to + RING.outF) return null;
  let k = 0;
  for (let i = 0; i < ats.length; i++) if (ats[i] <= f) k = i;
  const a = rects[Math.max(0, k - 1)];
  const b = rects[k];
  const g = k === 0 ? 1 : ease(Math.min(1, (f - ats[k]) / 12));
  const r = toScreen({x: a.x + (b.x - a.x) * g, y: a.y + (b.y - a.y) * g, w: a.w + (b.w - a.w) * g, h: a.h + (b.h - a.h) * g}, view);
  const p = interpolate(f, [ats[0], ats[0] + RING.inF], [0, 1], {...CLAMP, easing: easeOut});
  const out = interpolate(f, [to, to + RING.outF], [1, 0], {...CLAMP, easing: easeIn});
  const pad = 8;
  return <RingBox box={{x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2}} p={p} o={p * out} />;
};

// ---------------------------------------------------------------------------------------------
// One shot

type ShotPlan = {
  footage: FootagePlan;
  rings: PlannedRing[];
  paths: PlannedPath[];
  clicks: {m: Extract<Mark, {kind: 'click'}>; at: number}[];
  camStart: number;
};

const ShotView: React.FC<{shot: Shot; plan: ShotPlan; dur: number; fadeIn: boolean}> = ({shot, plan, dur, fadeIn}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const def = useTutorial();
  const rec = def.recordings[shot.rec];
  const {rec: t, pi} = recAt(plan.footage, f, fps);
  const pp = plan.footage.pieces[pi];
  const clip = def.clips[pp.clip];
  const src = `${def.clipDir}/${pp.clip}.mp4`;
  const frames = Math.floor((clip.end - clip.start) * SRC_FPS + 1e-6);
  const srcFrame = Math.max(0, Math.min(frames - 1, Math.round((t - clip.start) * SRC_FPS)));
  const b = rec.bounds;
  const view = viewOf(camAt(shot.cam, f, plan.camStart), b);
  const blurs = [...rec.blur, ...(shot.blur ?? [])];
  const fade = fadeIn ? interpolate(f, [0, XF], [0, 1], {...CLAMP, easing: ease}) : 1;
  return (
    <AbsoluteFill style={{opacity: fade, background: rec.fill}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`}}>
        {/* Only the page viewport is ever drawn: tabs, taskbar and OBS stay outside `bounds`. */}
        <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, overflow: 'hidden'}}>
          <ClipFrame src={src} frame={srcFrame} b={b} />
          {blurs.map((bb, i) => {
            const r = blurRect(bb, t);
            return r ? (
              <BlurPatch key={i} r={{...r, x: r.x - b.x, y: r.y - b.y}} sigma={bb.sigma ?? 16} tint={bb.tint ?? 0.3} src={src} frame={srcFrame} b={b} />
            ) : null;
          })}
        </div>
      </div>
      <AbsoluteFill style={{opacity: interpolate(f, [dur, dur + 6], [1, 0], CLAMP)}}>
        {plan.rings.map((r, i) => (
          <RingView key={`r${i}`} ring={r} f={f} view={view} rec={t} />
        ))}
        {plan.paths.map((p, i) => (
          <PathView key={`p${i}`} path={p} f={f} view={view} />
        ))}
        {plan.clicks.map((c, i) => (
          <ClickView key={`c${i}`} m={c.m} at={c.at} f={f} view={view} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A beat made of screen footage: its shots laid out on the scene's timing (time-remapped pieces, one eased camera
 * move per shot, rings synced to the voice, click ripples on the real clicks, privacy blurs). Renders in window
 * coordinates (WIN.w × WIN.h).
 */
export const FootageBeatView: React.FC<{beat: FootageBeat}> = ({beat}) => {
  const timing = useTiming();
  const scene = useScene();
  const {fps} = useVideoConfig();
  const def = useTutorial();

  const shots = useMemo(() => {
    const voiceAbs = (a: VoiceAnchor) => voiceFrame(a, timing, scene.from);
    const starts = beat.shots.map((s, i) => (i === 0 || s.start === undefined ? 0 : voiceAbs(s.start) - scene.from));
    return beat.shots.map((shot, i) => {
      const from = starts[i];
      const to = i + 1 < starts.length ? starts[i + 1] : scene.dur;
      const dur = Math.max(1, to - from);
      const voice = (a: VoiceAnchor) => voiceAbs(a) - scene.from - from;
      const footage = planFootage(shot, dur, voice, def.clips, fps);
      const at = (a: Anchor) => anchorFrame(a, voice, footage, fps);
      const marks = shot.marks ?? [];
      const plan: ShotPlan = {
        footage,
        rings: planRings(marks, dur, at),
        paths: marks
          .filter((m): m is Extract<Mark, {kind: 'path'}> => m.kind === 'path')
          .map((m) => {
            const ats: number[] = [];
            m.at.forEach((a, k) => ats.push(Math.max(at(a), k > 0 ? ats[k - 1] + 8 : -1e9)));
            return {rects: m.rects, ats, to: m.until === undefined ? dur : at(m.until)};
          }),
        clicks: marks.filter((m): m is Extract<Mark, {kind: 'click'}> => m.kind === 'click').map((m) => ({m, at: frameOfRec(footage, m.rec, fps)})),
        camStart: shot.cam.at === undefined ? 0 : at(shot.cam.at),
      };
      return {shot, plan, from, dur};
    });
  }, [beat, timing, scene, fps, def]);

  return (
    <AbsoluteFill>
      {shots.map(({shot, plan, from, dur}, i) => (
        <Sequence key={i} from={from} durationInFrames={dur + XF} name={`shot ${i}`}>
          <ShotView shot={shot} plan={plan} dur={dur} fadeIn={i > 0} />
          {def.sfx && plan.clicks.map((c, k) => <Sfx key={`c${k}`} name="b-click" at={c.at} volume={0.24} />)}
          {def.sfx && plan.rings.filter((r) => r.mark.label).map((r, k) => <Sfx key={`r${k}`} name="b-tap" at={r.from + 3} volume={0.22} />)}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
