import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Sfx} from '../../../core/audio';
import {Kicker, Reveal, useIn} from '../../../core/components/ui';
import {C, MONO, SANS} from '../../../core/theme';
import {useLine, useWordAt} from '../../../core/timing';
import {T} from '../copy';

/** One size for the whole statement, set so its widest line fits the 900 px content width. */
const LINE_SIZE = 78;

export const Lesson: React.FC = () => {
  const ask = useLine('lesson-2').from;
  // The gold half of the statement ("tapi hasilnya tergantung kapan kamu jual.") lands as it's spoken.
  const tapi = Math.max(30, useWordAt('lesson-1', 'tapi') - 4);
  const q = useIn(ask, true);
  const fine = useIn(20);
  return (
    <AbsoluteFill>
      <Sfx name="pop" at={ask} volume={0.45} />
      {/* Starts 2 frames before the reveal so its peak lands as the gold lines move, just ahead of "tapi". */}
      <Sfx name="whoosh-soft" at={tapi - 2} volume={0.3} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 300}}>
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
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 940, display: 'flex', opacity: Math.min(1, q * 2), transform: `scale(${0.8 + 0.2 * q})`, transformOrigin: 'left center'}}>
        <div style={{padding: '24px 36px', borderRadius: 28, background: C.text, color: C.bg, fontFamily: SANS, fontWeight: 800, fontSize: 44, lineHeight: 1.2}}>
          {T.lesson.question}
        </div>
      </div>

      <div style={{position: 'absolute', left: 90, right: 90, top: 1200, fontFamily: MONO, fontWeight: 500, fontSize: 22, lineHeight: 1.55, color: C.dim, opacity: fine}}>
        {T.lesson.disclaimer}
      </div>
    </AbsoluteFill>
  );
};
