import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  Freeze,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Sfx, SfxName} from '../audio';
import {CLAMP, Kicker, Reveal, useIn} from '../components/ui';
import {C, MONO, SANS} from '../theme';
import {LineTiming, useScene, useTiming} from '../timing';
import {
  BlurBox,
  CLIPS,
  CamKey,
  Group,
  HAKABOT,
  Mark,
  OUTRO_GROUPS,
  OUTRO_LINE_PREFIX,
  RECORDINGS,
  Rect,
  SRC_FPS,
  SRC_H,
  SRC_W,
  Shot,
  Side,
  segClip,
} from './outroConfig';

// Layout (px). Content stays between y 190 and 1400; the caption box starts at 1460.
const WIN = {x: 60, y: 440, w: 960, bar: 52};
const MAX_H = 1392 - WIN.y - WIN.bar;
/** Base scale: zoom 1 fits the recording's full width (1920 px) into the 960 px window. */
const FIT = WIN.w / SRC_W;
/** Frames each shot crossfades over the previous one (between beats and inside a beat alike). */
const XF = 9;
/** Frames the end card is guaranteed, whatever the voice timing. */
const END_MIN_SEC = 3;
/** Picture changes this many frames before the voice line that goes with it. */
const LEAD_IN = 4;
/** Each group's first shot holds its first frame at least this long while the headline lands… */
const HEADLINE_HOLD = 8;
/** …and up to this long when the voice gives the beat more time than its footage needs. */
const MAX_START_HOLD = 20;
/**
 * Footage speed limits. v3.3 (user, 13 Okt): the approved v3.2 edit at about 1,5×, "still watchable".
 * (v3.1/v3.2 played real time, 0,95–1,15×.) Spare time becomes a hold at the start of the beat, then a
 * hold on the last frame; too little time trims the start.
 */
const MIN_RATE = 1.4;
const MAX_RATE = 1.6;

const ease = Easing.inOut(Easing.cubic);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------------------------------------
// Planning: where each group and shot sits in the scene, at what speed it plays.

type PlannedShot = {
  shot: Shot;
  from: number;
  dur: number;
  /** Frames the first picture holds before playing (a group's first shot waits while its headline lands). */
  hold: number;
  rate: number;
  skip: number;
  len: number;
  first: boolean;
  groupStart: boolean;
};
type PlannedGroup = {group: Group; from: number; to: number; shots: PlannedShot[]};
type Plan = {endAt: number; groups: PlannedGroup[]; shots: PlannedShot[]};

const segLen = (s: Shot) => sum(s.segs.map(([a, b]) => b - a));
const groupDesigned = (g: Group) => sum(g.shots.map((s) => s.dur));

/**
 * Lays the tour out on the scene's timing. With one voice line per group, each group starts with
 * its line; otherwise (an episode with fewer/more lines) groups split the tour in proportion to their
 * designed lengths. The end card lands on the last outro line and always gets at least 3 s.
 * Shots stretch or squeeze with their group (speed 0.5–2.5×, holding the last frame or trimming the
 * start beyond that); optional shots are dropped when a group gets far less time than designed.
 */
const planOutro = (dur: number, lines: LineTiming[], sceneId: string, sceneFrom: number, fps: number): Plan => {
  const outro = lines
    .filter((l) => l.scene === sceneId && l.id.startsWith(OUTRO_LINE_PREFIX))
    .sort((a, b) => a.from - b.from);
  const rel = (l: LineTiming) => l.from - sceneFrom;
  const endLine = outro.length > 0 ? outro[outro.length - 1] : null;
  const latest = dur - Math.round(END_MIN_SEC * fps);
  const endAt = Math.max(Math.min(fps, latest), Math.min(endLine ? rel(endLine) - 6 : Math.round(dur * 0.82), latest));

  const tourLines = endLine ? outro.slice(0, -1) : [];
  const n = OUTRO_GROUPS.length;
  let starts = tourLines.length === n ? tourLines.map((l, i) => (i === 0 ? 0 : rel(l) - LEAD_IN)) : null;
  if (starts && !starts.every((s, i) => s < endAt - 10 && (i === 0 || s > starts![i - 1] + 10))) starts = null;
  if (!starts) {
    const designed = OUTRO_GROUPS.map(groupDesigned);
    const total = sum(designed);
    let acc = 0;
    starts = designed.map((d) => {
      const s = Math.round((acc / total) * endAt);
      acc += d;
      return s;
    });
  }

  const shots: PlannedShot[] = [];
  const groups = OUTRO_GROUPS.map((group, gi) => {
    const from = starts![gi];
    const to = gi + 1 < n ? starts![gi + 1] : endAt;
    const span = to - from;
    let kept = group.shots.slice();
    while (span < 0.8 * sum(kept.map((s) => s.dur)) * fps && kept.some((s) => s.optional)) {
      const drop = kept.map((s) => s.optional).lastIndexOf(true);
      kept = kept.filter((_, i) => i !== drop);
    }
    const designed = sum(kept.map((s) => s.dur));
    let at = from;
    const planned = kept.map((shot, si) => {
      const end = si === kept.length - 1 ? to : from + Math.round((span * sum(kept.slice(0, si + 1).map((s) => s.dur))) / designed);
      const d = Math.max(1, end - at);
      const first = shots.length === 0;
      let hold = si === 0 ? Math.min(HEADLINE_HOLD, Math.floor(d * 0.3)) : 0;
      const len = segLen(shot);
      const raw = len / ((d - hold) / fps);
      const rate = Math.min(MAX_RATE, Math.max(MIN_RATE, raw));
      // Spare time: a longer opening hold on a beat's first shot (the rest holds the last frame).
      if (si === 0 && raw < MIN_RATE) hold = Math.min(MAX_START_HOLD, Math.max(hold, Math.floor(d - hold - (len / rate) * fps) + hold));
      const skip = Math.max(0, len - ((d - hold) / fps) * rate);
      const p: PlannedShot = {shot, from: at, dur: d, hold, rate, skip, len, first, groupStart: si === 0};
      shots.push(p);
      at = end;
      return p;
    });
    return {group, from, to, shots: planned};
  });
  return {endAt, groups, shots};
};

// ---------------------------------------------------------------------------------------------
// Time remapping: output frame → position on the shot's edited timeline → recording second.

type Pos = {tl: number; seg: number; rec: number; segStartTl: number};

const posAt = (ps: PlannedShot, f: number, fps: number): Pos => {
  const last = ps.len - 1 / SRC_FPS;
  const tl = Math.max(0, Math.min(last, ps.skip + (Math.max(0, f - ps.hold) / fps) * ps.rate));
  let acc = 0;
  for (let i = 0; i < ps.shot.segs.length; i++) {
    const [a, b] = ps.shot.segs[i];
    const l = b - a;
    if (tl < acc + l || i === ps.shot.segs.length - 1) return {tl, seg: i, rec: a + Math.min(l, tl - acc), segStartTl: acc};
    acc += l;
  }
  return {tl, seg: 0, rec: ps.shot.segs[0][0], segStartTl: 0};
};

/** Timeline second of a recording second inside segment `seg` (clamped to the segment). */
const tlOf = (shot: Shot, seg: number, rec: number) => {
  const before = sum(shot.segs.slice(0, seg).map(([a, b]) => b - a));
  const [a, b] = shot.segs[seg];
  return before + Math.max(0, Math.min(b - a, rec - a));
};

/** Output frame (shot-relative) at which a recording second plays, or null if it's cut out. */
const frameOfRec = (ps: PlannedShot, rec: number, fps: number) => {
  const seg = ps.shot.segs.findIndex(([a, b]) => rec >= a && rec <= b);
  if (seg < 0) return null;
  const f = ps.hold + ((tlOf(ps.shot, seg, rec) - ps.skip) / ps.rate) * fps;
  return f >= 0 && f < ps.dur ? Math.round(f) : null;
};

// ---------------------------------------------------------------------------------------------
// Camera

const camAt = (keys: CamKey[], tl: number): CamKey => {
  if (tl <= keys[0].t) return keys[0];
  for (let i = keys.length - 2; i >= 0; i--) {
    const a = keys[i];
    const b = keys[i + 1];
    if (tl >= a.t && b.t > a.t) {
      if (tl >= b.t) return b;
      const p = ease((tl - a.t) / (b.t - a.t));
      return {t: tl, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, zoom: a.zoom + (b.zoom - a.zoom) * p};
    }
  }
  return keys[keys.length - 1];
};

type View = {s: number; tx: number; ty: number};

/** Screen transform for a camera, clamped so the window never shows outside the app area. */
const viewOf = (cam: CamKey, w: number, h: number, b: Rect, mult = 1): View => {
  const s = Math.max(FIT * cam.zoom * mult, w / b.w, h / b.h);
  const hw = w / s / 2;
  const hh = h / s / 2;
  const x = Math.min(b.x + b.w - hw, Math.max(b.x + hw, cam.x));
  const y = Math.min(b.y + b.h - hh, Math.max(b.y + hh, cam.y));
  return {s, tx: w / 2 - x * s, ty: h / 2 - y * s};
};

const toScreen = (r: Rect, v: View): Rect => ({x: v.tx + r.x * v.s, y: v.ty + r.y * v.s, w: r.w * v.s, h: r.h * v.s});

const blurRect = (b: BlurBox, rec: number): Rect | null => {
  if ((b.from !== undefined && rec < b.from) || (b.to !== undefined && rec > b.to)) return null;
  if (!b.track || b.track.length === 0) return b;
  const ts = b.track.map((k) => k.t);
  const dx = interpolate(rec, ts, b.track.map((k) => k.dx), CLAMP);
  const dy = interpolate(rec, ts, b.track.map((k) => k.dy), CLAMP);
  return {x: b.x + dx, y: b.y + dy, w: b.w, h: b.h};
};

// ---------------------------------------------------------------------------------------------
// Highlights (drawn in screen space, so strokes and text keep their size at any zoom)

/**
 * Short label pill next to a highlight (`anchor` in window px). Kept inside the window and left of
 * the right-side app buttons (screen x < 980).
 */
const Label: React.FC<{anchor: Rect; side?: Side; w: number; text: string; dot?: string; age: number; fadeOut?: number}> = ({
  anchor: r,
  side,
  w,
  text,
  dot,
  age,
  fadeOut = 1,
}) => {
  const p = interpolate(age, [0, 9], [0, 1], {...CLAMP, easing: Easing.out(Easing.back(1.8))});
  const estW = text.length * 15 + 50 + (dot ? 28 : 0);
  const gap = 16;
  let s: Side = side ?? (r.y < 90 ? 'below' : 'above');
  if (s === 'right' && r.x + r.w + gap + estW > w - 40) s = 'above';
  if (s === 'left' && r.x - gap - estW < 20) s = 'above';
  const cx = Math.min(w - 40 - estW / 2, Math.max(20 + estW / 2, r.x + r.w / 2));
  const cy = r.y + r.h / 2;
  const pos =
    s === 'above'
      ? {left: cx, top: r.y - gap, tf: 'translate(-50%, -100%)', dx: 0, dy: 14}
      : s === 'below'
        ? {left: cx, top: r.y + r.h + gap, tf: 'translate(-50%, 0)', dx: 0, dy: -14}
        : s === 'right'
          ? {left: r.x + r.w + gap, top: cy, tf: 'translate(0, -50%)', dx: -14, dy: 0}
          : {left: r.x - gap, top: cy, tf: 'translate(-100%, -50%)', dx: 14, dy: 0};
  return (
    <div
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top,
        transform: `${pos.tf} translate(${(1 - p) * pos.dx}px, ${(1 - p) * pos.dy}px) scale(${0.8 + 0.2 * p})`,
        opacity: Math.min(1, p * 1.5) * fadeOut,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 20px',
        borderRadius: 999,
        background: 'rgba(9,12,19,0.92)',
        border: '2px solid rgba(255,255,255,0.22)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 28,
        color: C.text,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && <div style={{width: 16, height: 16, borderRadius: 8, background: dot}} />}
      {text}
    </div>
  );
};

const MarksLayer: React.FC<{ps: PlannedShot; pos: Pos; view: View; w: number; h: number; fps: number}> = ({ps, pos, view, w, h, fps}) => {
  const ageOf = (rec: number) => ((pos.tl - tlOf(ps.shot, pos.seg, rec)) / ps.rate) * fps;
  const [segA, segB] = ps.shot.segs[pos.seg];
  return (
    <>
      {(ps.shot.marks ?? []).map((m: Mark, i) => {
        if (m.kind === 'ring') {
          if (pos.rec < m.from || pos.rec > m.to || m.to < segA || m.from > segB) return null;
          // Already on screen in an earlier segment: carry on without popping in again.
          const age = m.from < segA && pos.seg > 0 ? 99 : ageOf(Math.max(m.from, segA));
          const p = interpolate(age, [0, 8], [0, 1], {...CLAMP, easing: Easing.out(Easing.back(1.6))});
          const r = toScreen(m.rect, view);
          const pad = 7;
          return (
            <React.Fragment key={i}>
              {!m.noRing && <div
                style={{
                  position: 'absolute',
                  left: r.x - pad,
                  top: r.y - pad,
                  width: r.w + pad * 2,
                  height: r.h + pad * 2,
                  borderRadius: 12,
                  border: `3px solid ${C.text}`,
                  boxShadow: `0 0 22px rgba(255,255,255,0.35)${m.spot ? `, 0 0 0 3000px rgba(4,7,12,${0.5 * Math.min(1, p)})` : ''}`,
                  opacity: Math.min(1, p * 1.4),
                  transform: `scale(${1.18 - 0.18 * p})`,
                }}
              />}
              {m.label && (
                <Label
                  anchor={{x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2}}
                  side={m.side}
                  w={w}
                  text={m.label}
                  dot={m.dot}
                  age={age - 2}
                />
              )}
            </React.Fragment>
          );
        }
        // click
        if (m.at < segA || m.at > segB || pos.rec < m.at) return null;
        const age = ageOf(m.at);
        const sx = view.tx + m.x * view.s;
        const sy = view.ty + m.y * view.s;
        const ripple = (delay: number) => {
          const q = interpolate(age - delay, [0, 16], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
          if (age - delay < 0 || q >= 1) return null;
          const r = 8 + 44 * q;
          return (
            <div
              key={delay}
              style={{
                position: 'absolute',
                left: sx - r,
                top: sy - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                border: `${4 - 2 * q}px solid ${C.gold}`,
                opacity: 1 - q,
              }}
            />
          );
        };
        const dotO = interpolate(age, [0, 2, 10, 16], [0, 1, 1, 0], CLAMP);
        return (
          <React.Fragment key={i}>
            {ripple(0)}
            {ripple(5)}
            <div style={{position: 'absolute', left: sx - 9, top: sy - 9, width: 18, height: 18, borderRadius: 9, background: C.gold, opacity: dotO * 0.9}} />
            {m.label && age < 36 && (
              <Label
                anchor={{x: sx - 22, y: sy - 22, w: 44, h: 44}}
                side={m.side ?? (sy < h * 0.3 ? 'below' : 'above')}
                w={w}
                text={m.label}
                age={age - 2}
                fadeOut={interpolate(age, [28, 36], [1, 0], CLAMP)}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// One shot inside the browser window

/** One frame of a clip, at recording size (time-remapped through <Freeze>). */
const ClipFrame: React.FC<{clip: string; frame: number}> = ({clip, frame}) => (
  <Freeze frame={frame}>
    <OffthreadVideo src={staticFile(`outro/${clip}.mp4`)} muted style={{position: 'absolute', left: 0, top: 0, width: SRC_W, height: SRC_H}} />
  </Freeze>
);

/**
 * Privacy blur: a blurred copy of the same frame, clipped to the box. (A real `filter` on a copy,
 * not `backdrop-filter`, which proved too weak to hide text in headless renders.) The copy keeps a
 * margin around the box so the blur doesn't fade to transparent at its edges.
 */
const BlurPatch: React.FC<{r: Rect; sigma: number; tint: number; clip: string; frame: number; round: number}> = ({r, sigma, tint, clip, frame, round}) => {
  const m = Math.ceil(sigma * 3);
  return (
    <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, overflow: 'hidden', borderRadius: round}}>
      <div style={{position: 'absolute', left: -m, top: -m, width: r.w + 2 * m, height: r.h + 2 * m, overflow: 'hidden', filter: `blur(${sigma}px)`}}>
        <div style={{position: 'absolute', left: -(r.x - m), top: -(r.y - m), width: SRC_W, height: SRC_H}}>
          <ClipFrame clip={clip} frame={frame} />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: `rgba(30,34,44,${tint})`}} />
    </div>
  );
};

const ShotView: React.FC<{ps: PlannedShot; h: number}> = ({ps, h}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {shot} = ps;
  const {still} = shot;
  const rec = still ? {bounds: {x: 0, y: 0, w: still.w, h: still.h}, blur: [] as BlurBox[]} : RECORDINGS[CLIPS[segClip(shot, 0)].rec];
  const w = WIN.w;

  const at = (ff: number) => {
    const pos = posAt(ps, ff, fps);
    // Camera keys are timed in seconds on screen (so a slow move carries on through holds). No punch-ins,
    // drift or settle zooms: the only camera motion is the shot's own eased keys (user rule, 13 Okt).
    return {pos, view: viewOf(camAt(shot.cam, Math.max(0, ff) / fps), w, h, rec.bounds)};
  };
  const now = at(f);
  const {pos, view} = now;
  // Each segment may come from its own clip (long clips are split: see outroConfig → segClip).
  const clipName = still ? null : segClip(shot, pos.seg);
  const clip = clipName ? CLIPS[clipName] : null;
  // Motion blur only on whip-pans (they hide the cuts), measured as how fast the picture under the
  // window centre travels plus how fast it scales, in screen px per frame. On the first frame of a
  // jump-cut segment the camera may jump on purpose: measure against the next frame instead.
  const centre = (v: View) => ({x: (w / 2 - v.tx) / v.s, y: (h / 2 - v.ty) / v.s});
  const before = at(f - 1);
  const after = at(f + 1);
  const pair = before.pos.seg === pos.seg ? [view, before.view] : after.pos.seg === pos.seg ? [after.view, view] : null;
  let speed = 0;
  if (pair && f > 0) {
    const [a, b] = pair;
    const ca = centre(a);
    const cb = centre(b);
    speed = Math.hypot(ca.x - cb.x, ca.y - cb.y) * a.s + (Math.abs(a.s - b.s) / a.s) * (w / 2);
  }
  const mblur = Math.min(8, Math.max(0, (speed - 30) * 0.12));

  const srcFrame = clip ? Math.max(0, Math.min(clip.frames - 1, Math.round((pos.rec - clip.start) * SRC_FPS))) : 0;
  // Every shot after the first crossfades in over the previous one.
  const fade = ps.first ? 1 : interpolate(f, [0, ps.shot.xf ?? XF], [0, 1], {...CLAMP, easing: ease});
  const blurs = clipName ? [...rec.blur, ...(shot.blur ?? [])] : [];

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <div
        style={{
          position: 'absolute',
          width: SRC_W,
          height: SRC_H,
          transformOrigin: '0 0',
          transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})`,
          filter: mblur > 0.3 ? `blur(${mblur / view.s}px)` : undefined,
        }}
      >
        {still ? (
          <Img src={staticFile(still.src)} style={{position: 'absolute', left: 0, top: 0, width: still.w, height: still.h}} />
        ) : (
          <ClipFrame clip={clipName!} frame={srcFrame} />
        )}
        {blurs.map((b, i) => {
          const r = blurRect(b, pos.rec);
          if (!r) return null;
          return <BlurPatch key={i} r={r} sigma={b.sigma ?? 9} tint={b.tint ?? 0.3} clip={clipName!} frame={srcFrame} round={b.sigma ? 4 : 8} />;
        })}
      </div>
      {/* Highlights leave as the next shot crossfades in: one highlight on screen at a time. */}
      <AbsoluteFill style={{opacity: interpolate(f, [ps.dur, ps.dur + 4], [1, 0], CLAMP)}}>
        <MarksLayer ps={ps} pos={pos} view={view} w={w} h={h} fps={fps} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Pieces of the frame

const Chip: React.FC<{label: string; delay: number; big?: boolean}> = ({label, delay, big}) => {
  const p = useIn(delay, true);
  return (
    <div
      style={{
        padding: big ? '14px 26px' : '9px 20px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '2px solid rgba(255,255,255,0.16)',
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: big ? 34 : 28,
        color: C.text,
        opacity: Math.min(1, p * 2),
        transform: `scale(${0.7 + 0.3 * p})`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
};

/** Headline + feature chips of one beat group. */
const GroupHeader: React.FC<{group: Group; len: number}> = ({group, len}) => {
  const f = useCurrentFrame();
  const out = interpolate(f, [len - 8, len], [1, 0], CLAMP);
  return (
    <div style={{opacity: out}}>
      <div style={{position: 'absolute', left: 90, right: 90, top: 262}}>
        <Reveal delay={0} style={{fontFamily: SANS, fontWeight: 800, fontSize: 74, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.05}}>
          {group.title}
        </Reveal>
      </div>
      <div style={{position: 'absolute', left: 90, right: 90, top: 360, display: 'flex', flexWrap: 'nowrap', gap: 12}}>
        {group.chips.map((c, k) => (
          <Chip key={c} label={c} delay={5 + k * 4} />
        ))}
      </div>
    </div>
  );
};

type Cue = {at: number; name: SfxName; volume: number; prio: number};

/** Keeps the SFX within the style guide: never two cues within 6 frames (higher priority wins). */
const thinCues = (cues: Cue[]) => {
  const sorted = cues.slice().sort((a, b) => a.at - b.at || b.prio - a.prio);
  const kept: Cue[] = [];
  for (const c of sorted) {
    const last = kept[kept.length - 1];
    if (last && c.at - last.at < 6) {
      if (c.prio > last.prio) kept[kept.length - 1] = c;
      continue;
    }
    kept.push(c);
  }
  return kept;
};

// ---------------------------------------------------------------------------------------------

/**
 * Standard closing scene for every episode: an edited tour of the Hakabot app (screen-recording
 * shots with jump cuts, camera moves, highlights and blurred identifiers), one beat group per voice
 * line, then the end card (logo, tagline, URL) on the last outro line. Driven entirely by the
 * episode's `hakabot-outro` scene timing; see docs/hakabot.md and docs/outro-recordings.md.
 */
export const HakabotOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scene = useScene();
  const {lines} = useTiming();
  const dur = scene.dur;
  const plan = useMemo(() => planOutro(dur, lines, scene.id, scene.from, fps), [dur, lines, scene.id, scene.from, fps]);
  const {endAt} = plan;

  // Window height follows the current shot (eased over 12 frames at each shot change).
  const cur = plan.shots.filter((s) => s.from <= frame).pop() ?? plan.shots[0];
  const ci = plan.shots.indexOf(cur);
  const prevH = ci > 0 ? plan.shots[ci - 1].shot.h : cur.shot.h;
  const h = Math.min(MAX_H, prevH + (cur.shot.h - prevH) * interpolate(frame - cur.from, [0, 12], [0, 1], {...CLAMP, easing: ease}));

  const tour = interpolate(frame, [endAt - 4, endAt + 12], [1, 0], {...CLAMP, easing: Easing.in(Easing.cubic)});
  const winIn = useIn(0);
  const urlPop = useIn(endAt + 14, true);
  const end = (k: number) => endAt + k;

  const cues = useMemo(() => {
    const cs: Cue[] = [];
    for (const ps of plan.shots) {
      // New feature: b-rise, started as the old headline fades (7 frames early: its air peaks ~7 frames in and its
      // low tap lands on the cut), so it's past its peak when the feature name is spoken (LEAD_IN frames after the
      // cut). Hard cuts inside a group get no transition sound: the click that lands on them is the sound.
      if (!ps.first && ps.groupStart) cs.push({at: Math.max(0, ps.from - 7), name: 'b-rise', volume: 0.35, prio: 3});
      // A second shot inside a beat crossfades in silently.
      for (const m of ps.shot.marks ?? []) {
        const rec = m.kind === 'click' ? m.at : m.label ? m.from : null;
        if (rec === null) continue;
        const f = frameOfRec(ps, rec, fps);
        // Clicks get the crisp UI click (~70% speech band, under the voice, so low); labels get the softer tap.
        if (f !== null)
          cs.push(
            m.kind === 'click'
              ? {at: ps.from + f, name: 'b-click', volume: 0.24, prio: 2}
              : {at: ps.from + f, name: 'b-tap', volume: 0.24, prio: 1},
          );
      }
    }
    for (const g of plan.groups) if (g.group.chips.length > 0) cs.push({at: g.from + 9, name: 'b-tap', volume: 0.28, prio: 0});
    return thinCues(cs.filter((c) => c.at < endAt - 2));
  }, [plan, fps, endAt]);

  return (
    <AbsoluteFill>
      {/* App tour */}
      {tour > 0 && (
        <AbsoluteFill style={{opacity: tour, transform: `scale(${0.9 + 0.1 * tour})`, filter: tour < 1 ? `blur(${(1 - tour) * 12}px)` : undefined}}>
          <div style={{position: 'absolute', left: 90, top: 196, display: 'flex', alignItems: 'center', gap: 18}}>
            <Kicker>{HAKABOT.kicker}</Kicker>
            <Img src={staticFile('brand/hakabot-lockup-white.png')} style={{height: 40, opacity: winIn}} />
          </div>
          {plan.groups.map((g) => (
            <Sequence key={g.group.title} from={g.from} durationInFrames={Math.max(1, g.to - g.from)} layout="none">
              <GroupHeader group={g.group} len={g.to - g.from} />
            </Sequence>
          ))}

          {/* Browser window: our own clean chrome; the recording's tab strip and URL bar are never shown. */}
          <div
            style={{
              position: 'absolute',
              left: WIN.x,
              top: WIN.y,
              width: WIN.w,
              height: h + WIN.bar,
              borderRadius: 26,
              overflow: 'hidden',
              background: '#14161C',
              border: '2px solid rgba(255,255,255,0.14)',
              boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(18,18,249,0.25)',
              opacity: winIn,
              transform: `translateY(${(1 - winIn) * 60}px) scale(${0.94 + 0.06 * winIn})`,
            }}
          >
            <div style={{height: WIN.bar, display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', background: '#1C1F27'}}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
              ))}
              <div style={{marginLeft: 18, flex: 1, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 16px', fontFamily: MONO, fontSize: 22, color: C.dim}}>
                {HAKABOT.url}
              </div>
            </div>
            <div style={{position: 'relative', width: WIN.w, height: h, overflow: 'hidden'}}>
              {plan.shots.map((ps, i) => (
                // A shot stays on under the next one while it crossfades in (the last one stays through the
                // tour's fade into the end card).
                <Sequence key={i} from={ps.from} durationInFrames={ps.dur + (i + 1 === plan.shots.length ? 16 : (plan.shots[i + 1].shot.xf ?? XF))} name={`outro:${ps.shot.name}`}>
                  <ShotView ps={ps} h={h} />
                </Sequence>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      )}
      {cues.map((c, i) => (
        <Sfx key={i} name={c.name} at={c.at} volume={c.volume} />
      ))}
      {/* End card: b-mark (low haptic thump + two sine pings) starts with the tour's fade-out (endAt − 4); its body
          is ~10 frames, so it's over as "Cek…" begins (endAt + 6). Its pings are ~50% speech band, hence a notch under
          0.4. The tap goes with the URL pill. Kept outside the end-card block, which mounts at endAt − 2. */}
      <Sfx name="b-mark" at={endAt - 4} volume={0.36} />
      <Sfx name="b-tap" at={end(14)} volume={0.35} />

      {/* End card */}
      {frame >= endAt - 2 && (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Img
              src={staticFile('brand/hakabot-lockup-white.png')}
              style={{
                width: 700,
                opacity: interpolate(frame, [end(0), end(12)], [0, 1], CLAMP),
                transform: `scale(${interpolate(frame, [end(0), end(18)], [0.86, 1], {...CLAMP, easing: Easing.out(Easing.back(1.6))})})`,
                filter: `blur(${interpolate(frame, [end(0), end(12)], [10, 0], CLAMP)}px)`,
              }}
            />
          </div>
          <div style={{position: 'absolute', top: 700, width: '100%', textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 50, color: C.dim, opacity: interpolate(frame, [end(8), end(20)], [0, 1], CLAMP)}}>
            {HAKABOT.tagline}
          </div>
          <div style={{position: 'absolute', top: 800, width: '100%', display: 'flex', justifyContent: 'center'}}>
            <div
              style={{
                padding: '22px 54px',
                borderRadius: 999,
                background: C.brand,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 72,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                boxShadow: '0 20px 60px rgba(18,18,249,0.45)',
                transform: `scale(${urlPop})`,
              }}
            >
              {HAKABOT.url}
            </div>
          </div>
          <div style={{position: 'absolute', top: 1000, left: 70, right: 70, display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center'}}>
            {HAKABOT.features.map((f, k) => (
              <Chip key={f} label={f} delay={end(22 + k * 3)} big />
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
