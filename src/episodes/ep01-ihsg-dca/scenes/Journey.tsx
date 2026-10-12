import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx} from '../../../core/audio';
import {bandPath, fadingTicks, linePath, type Pt} from '../../../core/components/chart';
import {CLAMP, ChangeChip, Panel, useIn} from '../../../core/components/ui';
import {fmt, monthShort} from '../../../core/format';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useScene, useWordAt} from '../../../core/timing';
import {T} from '../copy';
import {MONTHS, N, at, idx} from '../data';

const P = {x0: 140, x1: 985, y0: 700, y1: 1320};
const PLOT_H = P.y1 - P.y0;
const xs = (i: number) => P.x0 + (i / (N - 1)) * (P.x1 - P.x0);

type Tone = 'gain' | 'loss' | 'neutral';
type Ev = {ym: string; at: number; until: number; tone: Tone; box: 'right' | 'bottomRight' | {x: number; y: number}};

/** Frames the peak holds after "…67%!" ends before the fall starts (0,6 s). */
const PEAK_LAND = 18;
/** The 2026-06 callout stays readable this long before the exit transition starts (1,5 s). */
const CRASH_READ = 45;
/** SceneWrap starts the exit blur this many frames before the scene's end. */
const EXIT_LEAD = 6;
/** Frames the callout's pop spring needs before it reads. */
const POP = 4;
/** The head lands and its callout pops this many frames before the line's first word, so it reads on the word. */
const LEAD = 3;

/**
 * The chart's "time-warp", locked to the voiceover: the head arrives at each event as its
 * line starts, holds while it's spoken, and travels during the lines in between.
 * The 2026 crash has no line: it plays in the scene's tail after "…67%!", sized from the
 * tail that's actually there (peak hold ≥ PEAK_LAND, callout readable ≥ CRASH_READ before the exit).
 */
const usePlan = () => {
  const {dur} = useScene();
  const intro = useLine('j-intro');
  const e2015 = useLine('j-2015');
  const keep = useLine('j-keep');
  const covid = useLine('j-covid');
  const hold = useLine('j-1b');
  const oneB = useWordAt('j-1b', 'Rp');
  const climb = useLine('j-climb');
  const peak = useLine('j-peak');

  // Tail budget: 3,0 s → 0,6 s peak hold, ~0,6 s fall, 1,5 s of readable callout before the exit.
  // A longer tail stretches the fall (to 1,2 s) and then the peak hold (to +0,5 s).
  const landed = peak.end + PEAK_LAND;
  const latest = dur - EXIT_LEAD - CRASH_READ - POP;
  const fallDur = Math.max(15, Math.min(36, latest - landed));
  const fallFrom = Math.max(landed, Math.min(landed + 15, latest - fallDur));
  const crashAt = fallFrom + fallDur;
  // After the impact settles, the head runs the last 4 months to today.
  const todayFrom = crashAt + 10;
  const todayAt = Math.max(todayFrom + 12, Math.min(dur - 12, todayFrom + 22));
  const crash = {from: fallFrom, at: crashAt};

  const keys: [number, number][] = [
    [0, 0],
    [intro.from + 10, 0],
    [e2015.from - LEAD, idx('2015-09')],
    [keep.from, idx('2015-09')],
    [covid.from - LEAD, idx('2020-03')],
    [hold.from + 4, idx('2020-03')],
    [oneB, idx('2021-12')],
    [climb.from, idx('2021-12')],
    [peak.from - LEAD, idx('2025-12')],
    [fallFrom, idx('2025-12')],
    [crashAt, idx('2026-06')],
    [todayFrom, idx('2026-06')],
    [todayAt, N - 1],
  ];
  for (let k = 1; k < keys.length; k++) keys[k][0] = Math.max(keys[k][0], keys[k - 1][0] + 1);

  const events: Ev[] = [
    {ym: '2015-09', at: e2015.from - LEAD, until: keep.from + 8, tone: 'neutral', box: 'right'},
    {ym: '2020-03', at: covid.from - LEAD, until: hold.from + 12, tone: 'loss', box: {x: 160, y: 712}},
    {ym: '2021-12', at: oneB, until: climb.from + 30, tone: 'gain', box: {x: 160, y: 712}},
    {ym: '2025-12', at: peak.from - LEAD, until: fallFrom, tone: 'gain', box: {x: 160, y: 712}},
    {ym: '2026-06', at: crashAt, until: 1e9, tone: 'loss', box: 'bottomRight'},
  ];
  return {keys, events, covidAt: covid.from - LEAD, crash};
};

const monthAt = (keys: [number, number][], f: number) => {
  for (let k = 1; k < keys.length; k++) {
    const [f0, m0] = keys[k - 1];
    const [f1, m1] = keys[k];
    if (f <= f1) return interpolate(f, [f0, f1], [m0, m1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  }
  return keys[keys.length - 1][1];
};
const toneColor = (t: Tone) => (t === 'gain' ? C.value : t === 'loss' ? C.loss : C.dim);
/** Box width from glyph-width estimates (mono 22px title, sans 800 34px line), checked in renders. */
const boxWidth = (title: string, sub: string) => Math.ceil(48 + Math.max(title.length * 14.6, sub.length * 18.6));

/** Odometer-style year: digits roll during the Dec→Jan step. */
const YearRoll: React.FC<{m: number}> = ({m}) => {
  const i = Math.floor(m);
  const year = 2010 + Math.floor(i / 12);
  const p = i % 12 === 11 ? Math.min(1, (m - i) * 1.4) : 0;
  const LH = 150;
  return (
    <div style={{display: 'flex', height: LH, overflow: 'hidden'}}>
      {String(year)
        .split('')
        .map((d, k) => {
          const cur = Number(d);
          const changes = String(year + 1)[k] !== d;
          const pos = cur + (changes ? p : 0);
          return (
            <div key={k} style={{transform: `translateY(${-pos * LH}px)`}}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, j) => (
                <div key={j} style={{height: LH, lineHeight: `${LH}px`, width: '0.62em', textAlign: 'center'}}>
                  {n}
                </div>
              ))}
            </div>
          );
        })}
    </div>
  );
};

const Counter: React.FC<{color: string; label: string; value: number}> = ({color, label, value}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 82}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{width: 34, height: 8, borderRadius: 4, background: color}} />
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: '0.12em', color: C.dim}}>{label}</div>
    </div>
    <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>
      {fmt.rp(value)}
    </div>
  </div>
);

export const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {keys, events, covidAt, crash} = usePlan();
  const m = monthAt(keys, frame);
  const intro = useIn(0);
  const axisIn = useIn(6);

  // Axis follows the running max so new highs push the "camera" out.
  let runMax = 0;
  for (let i = 0; i <= Math.ceil(m); i++) runMax = Math.max(runMax, at(Math.min(i, m), 'value'), at(Math.min(i, m), 'invested'));
  const yMax = Math.max(80e6, runMax * 1.16);
  const ys = (v: number) => P.y1 - (v / yMax) * PLOT_H;

  const value: Pt[] = [];
  const invested: Pt[] = [];
  for (let i = 0; i <= Math.floor(m); i++) {
    value.push([xs(i), ys(MONTHS[i].value)]);
    invested.push([xs(i), ys(MONTHS[i].invested)]);
  }
  if (m % 1 > 0) {
    value.push([xs(m), ys(at(m, 'value'))]);
    invested.push([xs(m), ys(at(m, 'invested'))]);
  }
  const head = value[value.length - 1];
  const investedHead = invested[invested.length - 1];

  const v = at(m, 'value');
  const inv = MONTHS[Math.floor(m)].invested;
  const ret = v / at(m, 'invested') - 1;
  const isToday = m >= N - 1 - 1e-6;

  // COVID: red pulse. 2026 crash: camera shake through the fall, peaking on the impact.
  const pulse = interpolate(frame, [covidAt, covidAt + 8, covidAt + 50], [0, 1, 0], CLAMP);
  const shakeAmp = interpolate(frame, [crash.from, crash.from + 6, crash.at, crash.at + 3, crash.at + 12], [0, 0.6, 0.8, 1, 0], CLAMP) * 8;
  const sx = (random(`sx${frame}`) - 0.5) * 2 * shakeAmp;
  const sy = (random(`sy${frame}`) - 0.5) * 2 * shakeAmp;

  const ticks = fadingTicks(yMax, PLOT_H, 25e6, 7, 70, 100);
  const lineIn = interpolate(frame, [4, 30], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px)`}}>
      {/* HUD: date + return */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 170, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', opacity: intro}}>
        <div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 38, letterSpacing: '0.2em', color: isToday ? C.gold : C.dim}}>
            {isToday ? T.journey.today : monthShort(MONTHS[Math.floor(m)].ym)}
          </div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, color: C.text, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums'}}>
            <YearRoll m={m} />
          </div>
        </div>
        <div style={{marginBottom: 28, textAlign: 'right'}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.16em', color: C.dim, marginBottom: 12}}>{T.journey.ret}</div>
          <ChangeChip x={ret} size={50} />
        </div>
      </div>

      <Panel style={{position: 'absolute', left: 90, right: 90, top: 410, padding: '8px 34px', opacity: intro}}>
        <Counter color={C.invested} label={T.journey.invested} value={inv} />
        <div style={{height: 2, background: C.panelBorder}} />
        <Counter color={C.value} label={T.journey.value} value={v} />
      </Panel>

      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="above">
            <path d={`${linePath(invested)}L${investedHead[0]},${P.y0 - 400}L${P.x0},${P.y0 - 400}Z`} />
          </clipPath>
          <clipPath id="below">
            <path d={`${linePath(invested)}L${investedHead[0]},${P.y1 + 40}L${P.x0},${P.y1 + 40}Z`} />
          </clipPath>
          <linearGradient id="gainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.value} stopOpacity={0.34} />
            <stop offset="1" stopColor={C.value} stopOpacity={0.06} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid + axis labels */}
        <g opacity={axisIn}>
          {ticks.map(({v: tv, a}) => (
            <g key={tv} opacity={a}>
              <line x1={P.x0} x2={P.x1} y1={ys(tv)} y2={ys(tv)} stroke={C.grid} strokeWidth={2} />
              <text x={P.x0 - 16} y={ys(tv) + 8} textAnchor="end" fontFamily={MONO} fontSize={22} fill={C.mute}>
                {fmt.axis(tv)}
              </text>
            </g>
          ))}
          <line x1={P.x0} x2={P.x1} y1={P.y1} y2={P.y1} stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
          {[2010, 2014, 2018, 2022, 2026].map((y) => (
            <text key={y} x={xs(idx(`${y}-01`))} y={P.y1 + 44} textAnchor="middle" fontFamily={MONO} fontSize={24} fill={C.mute}>
              {y}
            </text>
          ))}
        </g>

        {value.length > 1 && (
          <g opacity={lineIn}>
            <path d={bandPath(value, invested)} fill="url(#gainFill)" clipPath="url(#above)" />
            <path d={bandPath(value, invested)} fill={C.loss} fillOpacity={0.45} clipPath="url(#below)" />
            <path d={linePath(invested)} fill="none" stroke={C.invested} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
            <path d={linePath(value)} fill="none" stroke={C.value} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" filter="url(#glow)" />
          </g>
        )}

        {/* "Now" cursor + head markers with surface rings */}
        <line x1={head[0]} x2={head[0]} y1={P.y0} y2={P.y1} stroke="rgba(255,255,255,0.14)" strokeWidth={2} />
        <circle cx={investedHead[0]} cy={investedHead[1]} r={11} fill={C.invested} stroke={C.bg} strokeWidth={5} />
        <circle cx={head[0]} cy={head[1]} r={22 + Math.sin(frame / 5) * 4} fill={C.value} opacity={0.18} />
        <circle cx={head[0]} cy={head[1]} r={13} fill={C.value} stroke={C.bg} strokeWidth={5} />

        {/* Event callouts */}
        {events.map((e) => {
          if (frame < e.at) return null;
          const i = idx(e.ym);
          const ax = xs(i);
          const ay = ys(MONTHS[i].value);
          const tone = toneColor(e.tone);
          const pop = spring({frame: frame - e.at, fps, config: {damping: 13, stiffness: 170, mass: 0.7}});
          const gone = interpolate(frame, [e.until, e.until + 10], [0, 1], CLAMP);
          const copy = T.journey.events[e.ym];
          const w = boxWidth(copy.title, copy.sub);
          const bh = 116;
          const bx = e.box === 'right' ? Math.min(ax + 44, 1040 - w) : e.box === 'bottomRight' ? P.x1 - w : e.box.x;
          const by = e.box === 'right' ? ay - 150 : e.box === 'bottomRight' ? P.y1 - bh - 26 : e.box.y;
          // Connector meets the nearest point on the box edge.
          const cx = Math.max(bx, Math.min(ax, bx + w));
          const cy = Math.max(by, Math.min(ay, by + bh));
          const show = pop * (1 - gone);
          return (
            <g key={e.ym}>
              <circle cx={ax} cy={ay} r={9} fill={tone} stroke={C.bg} strokeWidth={4} opacity={gone * 0.9} />
              <g opacity={show}>
                <line x1={ax} y1={ay} x2={ax + (cx - ax) * pop} y2={ay + (cy - ay) * pop} stroke={tone} strokeWidth={3} />
                <circle cx={ax} cy={ay} r={20 * pop} fill="none" stroke={tone} strokeWidth={4} />
                <g transform={`translate(${bx + w / 2}, ${by + bh / 2}) scale(${0.7 + 0.3 * pop}) translate(${-w / 2}, ${-bh / 2})`}>
                  <rect width={w} height={bh} rx={18} fill="rgba(8,12,20,0.92)" stroke={tone} strokeWidth={3} />
                  <text x={24} y={44} fontFamily={MONO} fontWeight={700} fontSize={22} letterSpacing="0.06em" fill={C.dim}>
                    {copy.title}
                  </text>
                  <text x={24} y={88} fontFamily={SANS} fontWeight={800} fontSize={34} fill={C.text}>
                    {copy.sub}
                  </text>
                </g>
              </g>
            </g>
          );
        })}
      </svg>

      {/* One cue per callout: only 2015 gets a plain pop, and the others are carried by their own accent. */}
      <Sfx name="pop" at={events[0].at} volume={0.35} />
      {/* Impact and glitch hit together, 3 frames before "Maret", so the glitch's crack is done before the word starts. */}
      <Sfx name="impact" at={covidAt} volume={0.45} />
      <Sfx name="glitch" at={covidAt} volume={0.3} />
      <Sfx name="ding" at={events[2].at} volume={0.3} />
      {/* The shimmer sits in the speech band and runs under "Di puncaknya", so it goes below its table level. */}
      <Sfx name="shimmer" at={events[3].at} volume={0.3} />
      {/* Wordless crash in the tail: the drop starts the fall, the impact lands with the Jun 2026 callout. */}
      <Sfx name="drop" at={crash.from + 2} volume={0.4} />
      <Sfx name="impact" at={crash.at} volume={0.55} />

      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 55%, transparent 35%, rgba(229,83,79,0.55) 100%)',
          opacity: pulse,
        }}
      />
    </AbsoluteFill>
  );
};
