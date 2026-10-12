import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Sfx} from '../audio';
import {Background} from '../components/Background';
import {Captions} from '../components/Captions';
import {SceneWrap} from '../components/SceneWrap';
import {MONO} from '../theme';
import {SceneProvider, TimingProvider} from '../timing';
import {HakabotOutro} from './HakabotOutro';
import {estimateOutroTiming} from './outroScript';

/** Synthetic timing from the standard outro script (estimated durations, no voice). */
export const OUTRO_PREVIEW_TIMING = estimateOutroTiming(30);

/**
 * Composition `hakabot-outro-preview`: the shared outro on its own, timed from the proposed
 * standard voice lines, with the normal backdrop and burned-in captions but no voiceover.
 */
export const OutroPreview: React.FC = () => {
  const scene = OUTRO_PREVIEW_TIMING.scenes[0];
  return (
    <TimingProvider value={OUTRO_PREVIEW_TIMING}>
      <AbsoluteFill style={{backgroundColor: '#0B1019'}}>
        <Background />
        <SceneProvider value={scene}>
          <SceneWrap dur={scene.dur} last>
            <HakabotOutro />
          </SceneWrap>
        </SceneProvider>
        {/* In an episode the shell plays this on every scene change. */}
        <Sfx name="whoosh-soft" at={0} volume={0.3} />
        <Captions />
        <div
          style={{
            position: 'absolute',
            left: 40,
            bottom: 40,
            padding: '10px 18px',
            borderRadius: 10,
            background: 'rgba(229,83,79,0.9)',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 22,
            color: '#fff',
            letterSpacing: '0.08em',
          }}
        >
          OUTRO PREVIEW · TIMING ESTIMATED · NO VOICEOVER
        </div>
      </AbsoluteFill>
    </TimingProvider>
  );
};
