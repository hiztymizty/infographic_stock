import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fmt} from '../format';
import {C, MONO, SANS} from '../theme';

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0→1 spring starting at `delay` frames. `bouncy` adds overshoot for pop-ins. */
export const useIn = (delay = 0, bouncy = false) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: bouncy ? {damping: 11, stiffness: 160, mass: 0.7} : {damping: 200, stiffness: 120, mass: 0.6},
  });
};

/** 0→1 eased ramp between two frames. */
export const useRamp = (from: number, to: number, ease = Easing.inOut(Easing.cubic)) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, to], [0, 1], {...CLAMP, easing: ease});
};

/** Masked slide-up text reveal, the After Effects "text from mask" move. */
export const Reveal: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  children,
  style,
}) => {
  const p = useIn(delay);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.22em', marginBottom: '-0.22em'}}>
      <div style={{transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 3), ...style}}>{children}</div>
    </div>
  );
};

export const Kicker: React.FC<{children: React.ReactNode; delay?: number; color?: string}> = ({
  children,
  delay = 0,
  color = C.gold,
}) => {
  const p = useIn(delay);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{width: 56 * p, height: 5, borderRadius: 3, background: color}} />
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: '0.22em',
          color,
          opacity: p,
          transform: `translateX(${(1 - p) * -20}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Triangle: React.FC<{up: boolean; size: number; color: string}> = ({up, size, color}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 10 8" style={{transform: up ? undefined : 'rotate(180deg)'}}>
    <path d="M5 0 L10 8 L0 8 Z" fill={color} />
  </svg>
);

/** Gain/loss pill: colour + arrow + sign, so it never relies on colour alone. */
export const ChangeChip: React.FC<{x: number; size?: number; style?: React.CSSProperties}> = ({
  x,
  size = 40,
  style,
}) => {
  const up = x >= 0;
  const tone = up ? C.value : C.loss;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.3,
        padding: `${size * 0.2}px ${size * 0.5}px`,
        borderRadius: 999,
        background: up ? 'rgba(24,160,111,0.16)' : 'rgba(229,83,79,0.18)',
        border: `3px solid ${tone}`,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        color: C.text,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      <Triangle up={up} size={size * 0.62} color={tone} />
      {fmt.signedPct(x)}
    </div>
  );
};

export const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: C.panel,
      border: `2px solid ${C.panelBorder}`,
      borderRadius: 28,
      backdropFilter: 'blur(6px)',
      ...style,
    }}
  >
    {children}
  </div>
);
