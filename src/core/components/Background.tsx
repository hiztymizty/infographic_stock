import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';

/** Persistent backdrop: gradient, drifting glows, scrolling dot grid, vignette, grain. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.bgTop} 0%, ${C.bg} 50%, #070A10 100%)`}}>
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          left: -420 + Math.sin(t * 0.35) * 70,
          top: 120 + Math.cos(t * 0.27) * 90,
          background: 'radial-gradient(circle, rgba(57,135,229,0.20), transparent 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          right: -380 + Math.cos(t * 0.3) * 60,
          top: 1050 + Math.sin(t * 0.22) * 80,
          background: 'radial-gradient(circle, rgba(24,160,111,0.16), transparent 62%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.09) 1.6px, transparent 1.8px)',
          backgroundSize: '40px 40px',
          backgroundPosition: `0px ${-(frame * 0.5) % 40}px`,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 85%)',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.6) 100%)'}} />
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 6} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
