import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx} from '../../../core/audio';
import {CLAMP, Kicker, Reveal, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine} from '../../../core/timing';
import {T} from '../copy';

const NOTES = 12;
/**
 * Frame 0 is the cover and the first impression, so the headline is already set on it: the
 * reveals are pre-rolled (springs settle in ~30 frames) and the block rises into place instead.
 */
const PRE_ROLLED = -30;

/** Stylised (not replica) red 100k note, drawn in CSS. */
const Banknote: React.FC<{style?: React.CSSProperties}> = ({style}) => (
  <div
    style={{
      position: 'absolute',
      width: 560,
      height: 250,
      borderRadius: 18,
      background: 'linear-gradient(120deg, #EC6A7E 0%, #C83A55 55%, #9E2440 100%)',
      boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
      overflow: 'hidden',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'repeating-linear-gradient(115deg, rgba(255,255,255,0.07) 0 2px, transparent 2px 14px), repeating-linear-gradient(25deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 18px)',
      }}
    />
    <div style={{position: 'absolute', inset: 14, borderRadius: 10, border: '3px solid rgba(255,255,255,0.35)'}} />
    <div
      style={{
        position: 'absolute',
        left: 40,
        top: 45,
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'repeating-radial-gradient(circle, rgba(255,255,255,0.28) 0 3px, transparent 3px 12px)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        right: 36,
        top: 26,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 64,
        color: 'rgba(255,255,255,0.92)',
        letterSpacing: '-0.02em',
      }}
    >
      {T.hook.note}
    </div>
    <div
      style={{
        position: 'absolute',
        right: 40,
        bottom: 30,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: '0.3em',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      RUPIAH
    </div>
  </div>
);

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ask = useLine('hook-2');
  const q = useIn(ask.from, true);
  const rise = interpolate(frame, [0, 40], [44, 0], {...CLAMP, easing: Easing.out(Easing.cubic)});

  return (
    <AbsoluteFill>
      {/* Notes drop into a loose pile — one month's Rp 5 juta, symbolically. */}
      <div style={{position: 'absolute', left: 260, top: 1010, width: 560, height: 250}}>
        {new Array(NOTES).fill(0).map((_, i) => {
          const delay = 30 + i * 4;
          const p = spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 140, mass: 0.8}});
          const rot = (random(`r${i}`) - 0.5) * 18;
          const dx = (random(`x${i}`) - 0.5) * 90;
          return (
            <Banknote
              key={i}
              style={{
                transform: `translate(${dx}px, ${(1 - p) * -1300 - i * 4}px) rotate(${rot * p + (1 - p) * 40}deg)`,
                opacity: p > 0.001 ? 1 : 0,
              }}
            />
          );
        })}
      </div>

      <div style={{position: 'absolute', left: 90, top: 230, right: 90, transform: `translateY(${rise}px)`}}>
        <Kicker delay={PRE_ROLLED}>{T.hook.kicker}</Kicker>
        <div style={{height: 26}} />
        <Reveal delay={PRE_ROLLED} style={{fontFamily: SANS, fontWeight: 800, fontSize: 132, color: C.gold, letterSpacing: '-0.035em', lineHeight: 1.02}}>
          {T.hook.amount}
        </Reveal>
        {T.hook.lines.map((line) => (
          <Reveal
            key={line}
            delay={PRE_ROLLED}
            style={{fontFamily: SANS, fontWeight: 800, fontSize: 104, color: C.text, letterSpacing: '-0.035em', lineHeight: 1.04}}
          >
            {line}
          </Reveal>
        ))}
      </div>

      {/* The rise rides the headline from frame 0; its air peaks ~7 frames in, its low tap lands as the text settles. */}
      <Sfx name="b-rise" at={0} volume={0.4} />
      {/* Soft haptic taps on three landing notes, then one pay chime as the pile completes. The taps are below
          the speech band; the chime is mostly 1-4 kHz and runs under hook-1, so it sits low. */}
      {[0, 3, 7].map((i) => (
        <Sfx key={i} name="b-tap" at={30 + i * 4 + 8} volume={0.22} />
      ))}
      <Sfx name="b-pay" at={30 + 9 * 4 + 8} volume={0.17} />
      {/* One frame ahead of the pill (b-tap peaks on its first frame). */}
      <Sfx name="b-tap" at={ask.from - 1} volume={0.38} />
      <div
        style={{
          position: 'absolute',
          top: 1300,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${q})`,
          opacity: Math.min(1, q * 2),
        }}
      >
        <div
          style={{
            padding: '20px 40px',
            borderRadius: 999,
            background: C.text,
            color: C.bg,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 48,
            letterSpacing: '-0.01em',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          {T.hook.question}
        </div>
      </div>
    </AbsoluteFill>
  );
};
