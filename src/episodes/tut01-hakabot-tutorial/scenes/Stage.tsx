import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from '../../../core/components/ui';
import {C, SANS} from '../../../core/theme';

// Shared look of tut01's full-frame cards (intro, end card): deep navy, one slow brand-blue glow, lots of space.

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 42%, #131B2E 0%, #0C111C 58%, #080B12 100%)'}}>
      <div
        style={{
          position: 'absolute',
          width: 1500,
          height: 1500,
          borderRadius: '50%',
          left: 210 + Math.sin(t * 0.11) * 50,
          top: -900 + Math.cos(t * 0.09) * 40,
          background: 'radial-gradient(circle, rgba(18,18,249,0.13), transparent 60%)',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};

/**
 * Opacity of a phase living from frame `a` to `b`: 14-frame ease in (none if `first`, so frame 0 is composed),
 * 10-frame ease out. `rise` is the matching 0→1 for a small upward settle.
 */
export const usePhase = (a: number, b: number, first = false) => {
  const f = useCurrentFrame();
  const i = first ? 1 : interpolate(f, [a, a + 14], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const o = interpolate(f, [b - 10, b], [1, 0], {...CLAMP, easing: Easing.in(Easing.cubic)});
  const rise = first ? 1 : interpolate(f, [a, a + 22], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return {o: Math.min(i, o), rise};
};

/** Fades + lifts its child in from frame `at` (calm, no bounce). Hidden before. */
export const FadeUp: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number}> = ({at, children, style, dist = 10}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  return <div style={{...style, opacity: p, transform: `translateY(${(1 - p) * dist}px)`}}>{children}</div>;
};

/** Small print in the bottom margin (disclaimer, source), below the subtitles. */
export const SmallPrint: React.FC<{lines: readonly string[]}> = ({lines}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
    {lines.map((l) => (
      <div key={l} style={{fontFamily: SANS, fontWeight: 500, fontSize: 22, color: C.mute, letterSpacing: '0.01em'}}>
        {l}
      </div>
    ))}
  </div>
);
