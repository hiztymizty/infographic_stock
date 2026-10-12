import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Sfx} from '../../../core/audio';
import {linePath, type Pt} from '../../../core/components/chart';
import {CLAMP, Kicker, Reveal, Triangle, useIn} from '../../../core/components/ui';
import {fmt} from '../../../core/format';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {T} from '../copy';
import {DCA, MONTHS, N, at, idx} from '../data';

const P = {x0: 150, x1: 990, y0: 560, y1: 1230};
const Y_MAX = 10000;
const xs = (i: number) => P.x0 + (i / (N - 1)) * (P.x1 - P.x0);
const ys = (v: number) => P.y1 - (v / Y_MAX) * (P.y1 - P.y0);
type Seg = readonly [number, number];
const PEAK = idx(DCA.indexPeak.ym);
const TRAVEL = {...CLAMP, easing: Easing.inOut(Easing.cubic)};

const pathTo = (from: number, to: number): Pt[] => {
  const pts: Pt[] = [];
  for (let i = Math.ceil(from); i <= Math.floor(to); i++) pts.push([xs(i), ys(MONTHS[i].close)]);
  if (to % 1 > 0) pts.push([xs(to), ys(at(to, 'close'))]);
  return pts;
};

/** Month the draw-on has reached at scene frame f: rise to the peak, hold, then the 2026 fall. */
const drawMonth = (f: number, rise: Seg, fall: Seg) =>
  f < fall[0] ? interpolate(f, rise, [0, PEAK], TRAVEL) : interpolate(f, fall, [PEAK, N - 1], TRAVEL);

const Label: React.FC<{
  at: number;
  x: number;
  y: number;
  align: 'left' | 'right';
  label: string;
  value: string;
  change?: {text: string; up: boolean};
}> = ({at: delay, x, y, align, label, value, change}) => {
  const p = useIn(delay, true);
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        [align]: align === 'left' ? x : 1080 - x,
        textAlign: align,
        opacity: Math.min(1, p * 2),
        transform: `scale(${0.75 + 0.25 * p})`,
        transformOrigin: align === 'left' ? 'left top' : 'right top',
      }}
    >
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.1em', color: C.dim}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, justifyContent: align === 'left' ? 'flex-start' : 'flex-end'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.text, letterSpacing: '-0.02em'}}>{value}</div>
        {change && (
          <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.text}}>
            <Triangle up={change.up} size={22} color={change.up ? C.value : C.loss} />
            {change.text}
          </div>
        )}
      </div>
    </div>
  );
};

export const MeetIhsg: React.FC = () => {
  const frame = useCurrentFrame();
  // The head waits at Jan 2010 through "…mulai dari 2.600-an" (the start label lands on the number),
  // rises on "Lalu naik tiga kali lipat lebih" and lands on "8.600", holds, and the 2026 fall plays
  // from "Terus…" and lands on "2026 datang".
  const startAt = useWordAt('ihsg-1', '2.600') - 6;
  const riseFrom = Math.max(startAt + 20, useLine('ihsg-2').from - 2);
  const peakAt = Math.max(riseFrom + 45, useWordAt('ihsg-2', '8.600'));
  const fallFrom = Math.max(peakAt + 30, useLine('ihsg-3').from + 8);
  const RISE: Seg = [riseFrom, peakAt];
  const FALL: Seg = [fallFrom, Math.max(fallFrom + 24, useWordAt('ihsg-3', '2026') + 6)];
  const m = drawMonth(frame, RISE, FALL);
  const grid = useIn(10);
  const dot = useIn(14, true);

  const rise = pathTo(0, Math.min(m, PEAK));
  const fall = m > PEAK ? pathTo(PEAK, m) : [];
  const head: Pt = [xs(m), ys(at(m, 'close'))];
  // The running value tag hands over to the PUNCAK label at the peak (no tag during the fall).
  const headTag = interpolate(frame, [RISE[0] + 4, RISE[0] + 12, RISE[1] - 2, RISE[1] + 6], [0, 1, 1, 0], CLAMP);
  const drawn = pathTo(0, m);
  const area = drawn.length > 1 ? `${linePath(drawn)}L${drawn[drawn.length - 1][0]},${P.y1}L${P.x0},${P.y1}Z` : '';

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker>{T.ihsg.kicker}</Kicker>
        <Reveal delay={4} style={{fontFamily: SANS, fontWeight: 800, fontSize: 150, color: C.text, letterSpacing: '-0.04em', lineHeight: 1.05, marginTop: 10}}>
          {T.ihsg.title}
        </Reveal>
        <Reveal delay={10} style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: C.dim}}>
          {T.ihsg.subtitle}
        </Reveal>
      </div>

      {/* The riser (45 frames long) builds to the fall and cuts into the drop, which sits under "Terus…". */}
      <Sfx name="riser" at={FALL[0] - 45} volume={0.25} />
      <Sfx name="pop" at={startAt} volume={0.3} />
      <Sfx name="whoosh" at={RISE[0]} volume={0.3} />
      <Sfx name="pop" at={RISE[1] + 4} volume={0.35} />
      <Sfx name="drop" at={FALL[0] + 2} volume={0.3} />
      <Sfx name="pop" at={FALL[1] + 8} volume={0.35} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="idxFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.index} stopOpacity={0.16} />
            <stop offset="1" stopColor={C.index} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g opacity={grid}>
          {[2000, 4000, 6000, 8000, 10000].map((v) => (
            <g key={v}>
              <line x1={P.x0} x2={P.x1} y1={ys(v)} y2={ys(v)} stroke={C.grid} strokeWidth={2} />
              <text x={P.x0 - 16} y={ys(v) + 8} textAnchor="end" fontFamily={MONO} fontSize={22} fill={C.mute}>
                {fmt.num(v)}
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
        {area && <path d={area} fill="url(#idxFill)" />}
        {rise.length > 1 && <path d={linePath(rise)} fill="none" stroke={C.index} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />}
        {fall.length > 1 && <path d={linePath(fall)} fill="none" stroke={C.loss} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />}
        {/* The head breathes while it waits for "Lalu naik" and on the peak. */}
        {m <= PEAK && <circle cx={head[0]} cy={head[1]} r={(22 + Math.sin(frame / 5) * 4) * dot} fill={C.index} opacity={0.16} />}
        <circle cx={head[0]} cy={head[1]} r={13 * dot} fill={m > PEAK ? C.loss : C.index} stroke={C.bg} strokeWidth={5} />
        <g opacity={headTag} transform={`translate(${head[0]}, ${head[1] - 46})`}>
          <rect x={-80} y={-38} width={160} height={52} rx={12} fill={C.text} />
          <text y={-2} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={C.bg}>
            {fmt.num(at(m, 'close'))}
          </text>
        </g>
      </svg>

      <Label at={startAt} x={P.x0 + 20} y={ys(MONTHS[0].close) + 36} align="left" label={T.ihsg.start.label} value={T.ihsg.start.value} />
      <Label
        at={RISE[1] + 4}
        x={xs(PEAK) - 40}
        y={ys(DCA.indexPeak.close) - 70}
        align="right"
        label={T.ihsg.peak.label}
        value={T.ihsg.peak.value}
        change={{text: T.ihsg.rise, up: true}}
      />
      <Label
        at={FALL[1] + 8}
        x={P.x1 - 30}
        y={ys(DCA.todayPrice) + 150}
        align="right"
        label={T.ihsg.today.label}
        value={T.ihsg.today.value}
        change={{text: T.ihsg.fall, up: false}}
      />
    </AbsoluteFill>
  );
};
