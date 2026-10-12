import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Sfx} from '../../../core/audio';
import {CLAMP, Kicker, Panel, Reveal, useIn} from '../../../core/components/ui';
import {fmt} from '../../../core/format';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {T} from '../copy';
import {DCA} from '../data';

const MAX_W = 900;
const scale = (v: number) => (v / DCA.value) * MAX_W;

const Bar: React.FC<{label: string; value: number; color: string; grow: number}> = ({label, value, color, grow}) => (
  <div style={{opacity: Math.min(1, grow * 5)}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: C.dim}}>{label}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 58, color: C.text, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums'}}>
        {fmt.rp(value * grow)}
      </div>
    </div>
    <div style={{marginTop: 14, height: 56, width: scale(value) * grow, borderRadius: '6px 14px 14px 6px', background: color}} />
  </div>
);

export const Result: React.FC = () => {
  const frame = useCurrentFrame();
  // Bars grow on "modal … jadi …", the per-year figure lands on "atau cuma 1,7%".
  const r1 = useLine('result-1').from;
  const worth = Math.max(r1 + 20, useWordAt('result-1', 'Rp', 1));
  const atau = Math.max(worth + 40, useWordAt('result-2', 'atau'));
  const g1 = interpolate(frame, [r1 + 4, r1 + 44], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const g2 = interpolate(frame, [worth - 10, worth + 30], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const bracket = useIn(worth + 30, true);
  const big = useIn(atau - 6, true);
  const yr = interpolate(frame, [atau - 6, atau + 34], [0, DCA.annualized], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const tiles = useIn(atau + 30);
  const profit = DCA.value - DCA.invested;
  const gx = 90 + scale(DCA.invested);

  return (
    <AbsoluteFill>
      <Sfx name="whoosh" at={r1 + 4} volume={0.35} />
      {/* The second bar's whoosh peaks just before the spoken "Rp 1,2 miliar", so it goes a notch lower. */}
      <Sfx name="whoosh" at={worth - 10} volume={0.3} />
      <Sfx name="pop" at={worth + 30} volume={0.35} />
      {/* Sits in the breath between "lebih," and "atau". */}
      <Sfx name="pop" at={atau - 6} volume={0.45} />
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker>{T.result.kicker}</Kicker>
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 290}}>
        <Bar label={T.result.invested} value={DCA.invested} color={C.invested} grow={g1} />
        <div style={{height: 40}} />
        <Bar label={T.result.value} value={DCA.value} color={C.value} grow={g2} />
      </div>

      {/* Bracket marking the profit slice */}
      <div style={{position: 'absolute', left: gx, top: 624, width: 90 + MAX_W - gx, opacity: bracket}}>
        <div style={{height: 22, borderLeft: `3px solid ${C.text}`, borderRight: `3px solid ${C.text}`, borderBottom: `3px solid ${C.text}`, borderRadius: '0 0 8px 8px'}} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 90,
          top: 662,
          textAlign: 'right',
          opacity: Math.min(1, bracket * 2),
          transform: `translateY(${(1 - bracket) * 20}px)`,
        }}
      >
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 52, color: C.text}}>{T.result.profit(profit)}</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.dim, letterSpacing: '0.08em'}}>
          {fmt.signedPct(DCA.value / DCA.invested - 1)} {T.result.total}
        </div>
      </div>

      <div style={{position: 'absolute', left: 90, top: 790, opacity: Math.min(1, big * 2), transform: `scale(${0.8 + 0.2 * big})`, transformOrigin: 'left center'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 20}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 200, color: C.gold, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
            {fmt.pct(yr)}
          </div>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.text}}>{T.result.annualLabel}</div>
        </div>
        <Reveal delay={atau + 10} style={{fontFamily: SANS, fontWeight: 500, fontSize: 36, color: C.dim, marginTop: 10}}>
          {T.result.annualNote}
        </Reveal>
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 1130, display: 'flex', gap: 24, opacity: tiles, transform: `translateY(${(1 - tiles) * 30}px)`}}>
        {[
          {label: T.result.avgLabel, value: fmt.num(DCA.avgPrice)},
          {label: T.result.todayLabel, value: fmt.num(DCA.todayPrice)},
        ].map((t) => (
          <Panel key={t.label} style={{flex: 1, padding: '24px 30px'}}>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.08em', color: C.dim}}>{t.label.toUpperCase()}</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.text, letterSpacing: '-0.02em'}}>{t.value}</div>
          </Panel>
        ))}
      </div>
    </AbsoluteFill>
  );
};
