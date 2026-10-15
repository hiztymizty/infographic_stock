import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP, Kicker, Panel, Reveal, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {Sfx} from '../../../core/audio';
import {T} from '../copy';
import {Check} from '../parts';

/**
 * The habit, as a 3-step checklist ticked one by one with the voice. The caveat footer and the
 * disclaimer pill are in from frame 20, so they read for the whole scene.
 */
export const Lesson: React.FC = () => {
  const frame = useCurrentFrame();
  const l2 = useLine('lesson-2').from;
  // Tick 1 on "BPS", tick 2 on "harus" (after "Hasil bersihnya"), tick 3 (green) on "tumbuh".
  const tick1 = Math.max(30, useWordAt('lesson-1', 'BPS'));
  const tick2 = Math.max(tick1 + 30, l2 + 4, useWordAt('lesson-2', 'harus'));
  const tick3 = Math.max(tick2 + 24, useWordAt('lesson-2', 'tumbuh'));
  const ticks = [tick1, tick2, tick3];
  const fine = useIn(20);
  const rowsIn = [useIn(6, true), useIn(12, true), useIn(18, true)];
  const tickP = ticks.map((t) => interpolate(frame, [t - 4, t + 10], [0, 1], CLAMP));
  // The active step is the next one to be ticked (or the last one ticked, once all are done).
  const starts = [0, tick1 + 6, tick2 + 6];
  const active = starts.filter((s) => frame >= s).length - 1;

  return (
    <AbsoluteFill>
      {/* The rows' entrance rides the shell's b-air. Ticks 1 and 2 are taps on their words; the last, green tick is
          the payoff: two soft pings on "tumbuh" (b-confirm peaks ~3 f in, 51% speech band, so it sits low under
          the word). */}
      <Sfx name="b-tap" at={tick1} volume={0.32} />
      <Sfx name="b-tap" at={tick2} volume={0.32} />
      <Sfx name="b-confirm" at={tick3 - 2} volume={0.2} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 200}}>
        <Kicker>{T.lesson.kicker}</Kicker>
        <Reveal delay={4} style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, color: C.text, letterSpacing: '-0.035em', lineHeight: 1.1, marginTop: 18}}>
          {T.lesson.title}
        </Reveal>
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 400, display: 'flex', flexDirection: 'column', gap: 20}}>
        {T.lesson.steps.map((s, i) => {
          const last = i === 2;
          const on = tickP[i];
          const tone = last ? C.value : C.invested;
          return (
            <Panel
              key={s.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '26px 34px',
                opacity: Math.min(1, rowsIn[i] * 2) * (active === i || on > 0.5 ? 1 : 0.5),
                transform: `translateY(${(1 - rowsIn[i]) * 24}px)`,
                borderColor: active === i ? 'rgba(255,255,255,0.28)' : C.panelBorder,
              }}
            >
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.mute, width: 30}}>{i + 1}</div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.1}}>{s.title}</div>
                <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.dim, marginTop: 6}}>{s.sub}</div>
              </div>
              <Check p={on} size={72} color={tone} />
            </Panel>
          );
        })}
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 1000, opacity: fine}}>
        <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, lineHeight: 1.5, color: C.dim}}>{T.lesson.footer}</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: 26,
            padding: '12px 26px',
            borderRadius: 999,
            border: `2px solid ${C.dim}`,
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 30,
            color: C.text,
          }}
        >
          {T.lesson.pill}
        </div>
      </div>
    </AbsoluteFill>
  );
};
