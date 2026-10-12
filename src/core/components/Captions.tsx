import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, SANS} from '../theme';
import {useTiming} from '../timing';

export const CAPTION_TOP = 1460;

/**
 * Burned-in kinetic captions from the voiceover's word timings: each chunk pops in and the
 * word being spoken turns gold. Chunks come pre-split in timing.json, shared with the .srt.
 */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {captions} = useTiming();
  const chunk = captions.find((c) => frame >= c.from && frame < c.to);
  if (!chunk) return null;

  const pop = spring({frame: frame - chunk.from, fps, config: {damping: 14, stiffness: 240, mass: 0.6}});

  return (
    <AbsoluteFill style={{alignItems: 'center', top: CAPTION_TOP}}>
      <div
        style={{
          maxWidth: 920,
          padding: '16px 30px',
          borderRadius: 24,
          background: 'rgba(5,8,14,0.74)',
          border: '2px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 58,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          transform: `scale(${0.86 + pop * 0.14}) translateY(${(1 - pop) * 18}px)`,
          opacity: Math.min(1, pop * 2),
        }}
      >
        {chunk.words.map((w, i) => {
          const next = chunk.words[i + 1]?.from ?? chunk.to;
          const active = frame >= w.from && frame < next;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 0.13em',
                color: active ? C.gold : C.text,
                opacity: frame >= w.from ? 1 : 0.45,
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
