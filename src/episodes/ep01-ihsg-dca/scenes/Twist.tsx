import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {Sfx} from '../../../core/audio';
import {CLAMP, ChangeChip, Kicker, Panel, Triangle, useIn} from '../../../core/components/ui';
import {fmt} from '../../../core/format';
import {C, MONO, SANS} from '../../../core/theme';
import {useWordAt} from '../../../core/timing';
import {T} from '../copy';
import {DCA, MONTHS, idx} from '../data';

const LOW = MONTHS[idx('2026-06')];
const BAR_W = 820;

export const Twist: React.FC = () => {
  const frame = useCurrentFrame();
  // The fall plays as "Juni 2026, tinggal Rp 1,07 miliar" is spoken.
  const juni = Math.max(40, useWordAt('twist-1', 'Juni'));
  const DROP = [juni + 6, juni + 56] as const;
  const a = useIn(6, true);
  const b = useIn(juni - 30, true);
  const arrow = interpolate(frame, [juni - 26, juni], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const drop = interpolate(frame, [DROP[0], DROP[1]], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const lowValue = DCA.peak.value + (LOW.value - DCA.peak.value) * drop;
  // The low card starts as a copy of the peak card and counts down to June's figures (+67,5% → +8,3%),
  // so it never shows a return that belongs to neither month.
  const peakRet = DCA.peak.value / DCA.peak.invested - 1;
  const lowRet = peakRet + (LOW.value / LOW.invested - 1 - peakRet) * drop;
  const lostLabel = useIn(DROP[1] - 4, true);
  const shake = interpolate(frame, [DROP[1] - 6, DROP[1], DROP[1] + 14], [0, 8, 0], CLAMP);
  const sx = (random(`t${frame}`) - 0.5) * 2 * shake;

  const keep = (LOW.value / DCA.peak.value) * BAR_W;
  const barB = BAR_W - (BAR_W - keep) * drop;
  // The lost slice breaks off and falls away once the count lands.
  const fall = interpolate(frame, [DROP[1], DROP[1] + 40], [0, 1], {...CLAMP, easing: Easing.in(Easing.quad)});

  return (
    <AbsoluteFill style={{transform: `translateX(${sx}px)`}}>
      {/* swoosh-down and drop run under "Rp 1,6 miliar" and "Juni", so they sit below their table range. The impact
          is low-frequency and clips only the end of "dikit." before decaying into the pause, so it keeps its level. */}
      <Sfx name="b-tap" at={6} volume={0.35} />
      {/* The arrow draws down to the June card: a soft sine dip, no speech-band energy. */}
      <Sfx name="b-dip" at={juni - 26} volume={0.28} />
      <Sfx name="c-fall" at={DROP[0]} volume={0.25} />
      {/* Third and last impact of the video. A haptic hit, not the tape-stop again: Journey just used that for
          the same crash a few seconds earlier. */}
      <Sfx name="b-hit" at={DROP[1]} volume={0.45} />
      <div style={{position: 'absolute', left: 90, top: 200}}>
        <Kicker color={C.loss}>{T.twist.kicker}</Kicker>
      </div>

      <Panel style={{position: 'absolute', left: 90, right: 90, top: 280, padding: '34px 40px', transform: `scale(${0.85 + 0.15 * a})`, opacity: Math.min(1, a * 2)}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.14em', color: C.dim}}>{T.twist.peakLabel}</div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
            {fmt.rp(DCA.peak.value)}
          </div>
        </div>
        <ChangeChip x={peakRet} size={36} style={{marginTop: 14}} />
        <div style={{marginTop: 28, height: 40, width: BAR_W, borderRadius: 12, background: C.value}} />
      </Panel>

      {/* Drop arrow */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {arrow > 0 && <line x1={190} y1={700} x2={190} y2={700 + 150 * arrow} stroke={C.loss} strokeWidth={8} strokeLinecap="round" />}
        {arrow > 0.95 && <path d="M168,842 L190,876 L212,842 Z" fill={C.loss} />}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 250,
          top: 740,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: Math.min(1, lostLabel * 2),
          transform: `scale(${0.7 + 0.3 * lostLabel})`,
          transformOrigin: 'left center',
        }}
      >
        <Triangle up={false} size={34} color={C.loss} />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.text, letterSpacing: '-0.02em'}}>
          {T.twist.drop(DCA.peak.value - LOW.value)}
        </div>
      </div>

      <Panel
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 900,
          padding: '34px 40px',
          transform: `scale(${0.85 + 0.15 * b})`,
          opacity: Math.min(1, b * 2),
          borderColor: drop > 0.5 ? 'rgba(229,83,79,0.55)' : C.panelBorder,
        }}
      >
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: '0.14em', color: C.dim}}>{T.twist.lowLabel}</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginTop: 8}}>
          {fmt.rp(lowValue)}
        </div>
        <ChangeChip x={lowRet} size={36} style={{marginTop: 14}} />
        <div style={{position: 'relative', marginTop: 28, height: 40, width: BAR_W}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 40, width: barB, borderRadius: 12, background: C.value}} />
          {drop >= 1 && (
            <div
              style={{
                position: 'absolute',
                left: keep + 4,
                top: 0,
                height: 40,
                width: BAR_W - keep - 4,
                borderRadius: 12,
                background: C.loss,
                transform: `translateY(${fall * 260}px) rotate(${fall * 14}deg)`,
                opacity: 1 - fall,
              }}
            />
          )}
        </div>
      </Panel>
    </AbsoluteFill>
  );
};
