import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CLAMP} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {COPY} from '../copy';
import {FadeUp, SmallPrint, Stage, usePhase} from './Stage';

// intro-1 (full frame, redesigned 15 Okt: "minimal, one idea at a time"). Four phases, each leaves before the next
// arrives: cover (logo + title) → one line on what Hakabot is (three words appear as named) → the optional Signal
// plan → the chapters as a calm vertical list (each row as it's named; the current one bright, the rest quiet).
// Frame 0 is the composed cover. The disclaimer sits small in the bottom margin for the whole intro.
// Subtitles cover y ≈ 900–981: everything stays above y 800.

const T = COPY.intro;

const Cover: React.FC<{o: number}> = ({o}) => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, 120], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const line = interpolate(f, [2, 40], [0.6, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{textAlign: 'center', marginTop: -110, transform: `scale(${1.015 - 0.015 * settle})`}}>
        <Img src={staticFile('brand/hakabot-lockup-white.png')} style={{height: 46, opacity: 0.95}} />
        <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.34em', color: C.dim, marginTop: 64}}>{T.kicker}</div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: '-0.035em', color: C.text, lineHeight: 1.04, marginTop: 18}}>{T.title}</div>
        <div style={{width: 64 * line, height: 2, borderRadius: 1, background: C.gold, margin: '34px auto 0'}} />
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: C.dim, marginTop: 30, letterSpacing: '-0.01em'}}>{T.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

const What: React.FC<{o: number; rise: number; at: number[]}> = ({o, rise, at}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
    <div style={{textAlign: 'center', marginTop: -120, transform: `translateY(${(1 - rise) * 12}px)`}}>
      {T.whatTitle.map((l) => (
        <div key={l} style={{fontFamily: SANS, fontWeight: 800, fontSize: 88, letterSpacing: '-0.04em', color: C.text, lineHeight: 1.1}}>
          {l}
        </div>
      ))}
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34, marginTop: 64}}>
        {T.tools.map((t, i) => (
          <React.Fragment key={t.label}>
            {i > 0 && <FadeUp at={at[i]} dist={0}><div style={{width: 5, height: 5, borderRadius: 3, background: C.mute}} /></FadeUp>}
            <FadeUp at={at[i]}>
              <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.dim, letterSpacing: '-0.01em'}}>{t.label}</div>
            </FadeUp>
          </React.Fragment>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

const Signal: React.FC<{o: number; rise: number; destAt: number}> = ({o, rise, destAt}) => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
    <div style={{textAlign: 'center', marginTop: -120, transform: `translateY(${(1 - rise) * 12}px)`}}>
      <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.34em', color: C.dim}}>{T.signalKicker}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: '-0.045em', color: C.text, lineHeight: 1.05, marginTop: 18}}>{T.signalTitle}</div>
      <FadeUp at={destAt} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 52}}>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 36, color: C.dim}}>{T.signalArrow}</div>
        <div
          style={{
            padding: '12px 30px 13px',
            borderRadius: 999,
            background: C.brand,
            boxShadow: '0 14px 40px rgba(18,18,249,0.32)',
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 36,
            color: '#fff',
          }}
        >
          {T.signalDest}
        </div>
      </FadeUp>
    </div>
  </AbsoluteFill>
);

const Chapters: React.FC<{o: number; at: number[]}> = ({o, at}) => {
  const f = useCurrentFrame();
  let cur = -1;
  at.forEach((a, i) => {
    if (f >= a) cur = i;
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{marginTop: -110, width: 560}}>
        <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: '0.34em', color: C.dim, marginBottom: 34, paddingLeft: 74}}>
          {T.chaptersKicker}
        </div>
        {COPY.chapters.map((c, i) => {
          const active = i === cur;
          const k = interpolate(f, [at[i + 1] ?? 1e9, (at[i + 1] ?? 1e9) + 12], [1, 0], CLAMP);
          return (
            <FadeUp key={c.title} at={at[i]} dist={8} style={{display: 'flex', alignItems: 'center', height: 64}}>
              <div style={{width: 74, display: 'flex', alignItems: 'center', gap: 14}}>
                <div style={{width: 6, height: 6, borderRadius: 3, background: C.gold, opacity: active ? k : 0}} />
                <div style={{fontFamily: MONO, fontWeight: 500, fontSize: 22, color: C.mute, letterSpacing: '0.06em'}}>{String(i + 1).padStart(2, '0')}</div>
              </div>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 46,
                  letterSpacing: '-0.025em',
                  color: active ? C.text : C.dim,
                  opacity: active ? 1 : 0.72,
                }}
              >
                {c.title}
              </div>
            </FadeUp>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Intro: React.FC = () => {
  const what = useLine('intro-1-what');
  const signal = useLine('intro-1-signal');
  const chapters = useLine('intro-1-chapters');
  const toolAt = T.tools.map((t) => useWordAt('intro-1-what', t.word));
  const destAt = useWordAt('intro-1-signal', 'HB');
  const chAt = COPY.chapters.map((c) => useWordAt('intro-1-chapters', c.word));

  // A phase ends when the next line starts, but never before its last reveal has been up ~1,5 s (the last word of
  // a line is often the one that reveals something); the next phase follows right after.
  const HOLD = 45;
  const end0 = what.from - 2;
  const end1 = Math.max(signal.from - 2, Math.max(...toolAt) + HOLD);
  const end2 = Math.max(chapters.from - 2, destAt + HOLD);
  const p0 = usePhase(0, end0, true);
  const p1 = usePhase(end0 + 4, end1);
  const p2 = usePhase(end1 + 4, end2);
  const p3 = usePhase(end2 + 4, 1e9);
  return (
    <Stage>
      {p0.o > 0 && <Cover o={p0.o} />}
      {p1.o > 0 && <What o={p1.o} rise={p1.rise} at={toolAt} />}
      {p2.o > 0 && <Signal o={p2.o} rise={p2.rise} destAt={destAt} />}
      {p3.o > 0 && <Chapters o={p3.o} at={chAt} />}
      <SmallPrint lines={[T.disclaimer]} />
    </Stage>
  );
};
