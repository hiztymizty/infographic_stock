import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Sfx} from '../../../core/audio';
import {CLAMP, Kicker, Reveal, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useWordAt} from '../../../core/timing';
import {T} from '../copy';

/** One size for the whole statement, set so its widest line fits the 900 px content width. */
const LINE_SIZE = 78;

/**
 * The closing statement, then straight to the outro (no comment prompt since 13 Okt).
 * The disclaimer is in from frame 20, so it reads for the whole scene (≥ 5 s at minSec 5,5).
 */
export const Lesson: React.FC = () => {
  const frame = useCurrentFrame();
  // The gold half of the statement ("tapi hasilnya tergantung kapan kamu jual.") lands as it's spoken.
  const tapi = Math.max(30, useWordAt('lesson-1', 'tapi') - 4);
  const fine = useIn(20);
  // A short gold rule draws under the statement as the gold half lands, closing the block.
  const rule = interpolate(frame, [tapi + 14, tapi + 34], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      {/* Starts 2 frames before the reveal so its peak lands as the gold lines move, just ahead of "tapi". */}
      {/* Soft air puff into the turn; ~50% speech band and under lesson-1, so below the 0.3 transition level. */}
      <Sfx name="b-air" at={tapi - 2} volume={0.24} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 400}}>
        <Kicker>{T.lesson.kicker}</Kicker>
        <div style={{height: 30}} />
        {T.lesson.lines.map((line, i) => (
          <Reveal
            key={line}
            delay={i < 2 ? 4 + i * 7 : tapi + (i - 2) * 7}
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: LINE_SIZE,
              lineHeight: 1.06,
              letterSpacing: '-0.035em',
              // Lines break where the copy breaks them, never by wrapping.
              whiteSpace: 'nowrap',
              color: i < 2 ? C.text : C.gold,
            }}
          >
            {line}
          </Reveal>
        ))}
        <div style={{marginTop: 44, height: 8, width: 160 * rule, borderRadius: 4, background: C.gold}} />
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 1040, fontFamily: MONO, fontWeight: 500, fontSize: 24, lineHeight: 1.55, color: C.dim, opacity: fine}}>
        {T.lesson.disclaimer}
      </div>
    </AbsoluteFill>
  );
};
