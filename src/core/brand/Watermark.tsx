import React from 'react';
import {Img, staticFile} from 'remotion';

/** Hakabot lockup pinned top-right on every frame (the outro hides it while its own logo shows). */
export const Watermark: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <Img
    src={staticFile('brand/hakabot-lockup-white.png')}
    style={{
      position: 'absolute',
      top: 96,
      right: 60,
      width: 190,
      opacity: 0.78 * opacity,
      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
    }}
  />
);
