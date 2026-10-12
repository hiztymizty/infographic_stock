import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from './ui';

/** Frames each scene overlaps the next, so exits and entrances cross. */
export const OVERLAP = 10;

/** Shared scene in/out: rise + de-blur in, push + blur out across the overlap. */
export const SceneWrap: React.FC<{dur: number; first?: boolean; last?: boolean; children: React.ReactNode}> = ({
  dur,
  first,
  last,
  children,
}) => {
  const f = useCurrentFrame();
  // The first scene is on screen from frame 0: it's the cover frame and the first impression.
  const enter = first ? 1 : interpolate(f, [0, 16], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const exit = last ? 0 : interpolate(f, [dur - 6, dur + OVERLAP], [0, 1], {...CLAMP, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill
      style={{
        opacity: enter * (1 - exit),
        transform: `translateY(${(1 - enter) * 70 - exit * 90}px) scale(${1 + exit * 0.04})`,
        filter: `blur(${(1 - enter) * 14 + exit * 16}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
