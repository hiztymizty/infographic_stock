import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {MusicBed, Sfx, VoiceTrack} from './audio';
import {HakabotOutro} from './brand/HakabotOutro';
import {OUTRO_SCENE_ID} from './brand/outroConfig';
import {Watermark} from './brand/Watermark';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {OVERLAP, SceneWrap} from './components/SceneWrap';
import {CLAMP} from './components/ui';
import {MONO} from './theme';
import {Timing, TimingProvider, SceneProvider} from './timing';

export type EpisodeDef = {
  id: string;
  timing: Timing;
  /** One component per scene id in script.json (the Hakabot outro is added automatically). */
  scenes: Record<string, React.FC>;
  /** Optional music bed in public/music, e.g. 'music/track.mp3'. */
  music?: {src: string; level?: number} | null;
};

/** Brand watermark, faded out while the outro's own logo is on screen. */
const BrandMark: React.FC<{outroFrom: number | null}> = ({outroFrom}) => {
  const frame = useCurrentFrame();
  const o = outroFrom === null ? 1 : interpolate(frame, [outroFrom - 6, outroFrom + 6], [1, 0], CLAMP);
  return o > 0 ? <Watermark opacity={o} /> : null;
};

/** Marks previews built from estimated timing so they are never mistaken for the final cut. */
const EstimatedBadge: React.FC = () => (
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
    PREVIEW · TIMING ESTIMATED · NO VOICEOVER
  </div>
);

/**
 * Everything every episode shares: backdrop, scene sequencing with transitions, the Hakabot
 * outro, watermark, voiceover, captions and music. Episodes only supply their scenes.
 */
export const EpisodeShell: React.FC<{episode: EpisodeDef; captions?: boolean}> = ({episode, captions = true}) => {
  const {timing, scenes, music} = episode;
  const outro = timing.scenes.find((s) => s.id === OUTRO_SCENE_ID);
  return (
    <TimingProvider value={timing}>
      <AbsoluteFill style={{backgroundColor: '#0B1019'}}>
        <Background />
        {timing.scenes.map((s, i) => {
          const Scene = s.id === OUTRO_SCENE_ID ? HakabotOutro : scenes[s.id];
          if (!Scene) throw new Error(`Episode ${episode.id} has no component for scene "${s.id}"`);
          const last = i === timing.scenes.length - 1;
          return (
            <Sequence key={s.id} name={s.id} from={s.from} durationInFrames={s.dur + (last ? 0 : OVERLAP)}>
              <SceneProvider value={s}>
                <SceneWrap dur={s.dur} first={i === 0} last={last}>
                  <Scene />
                </SceneWrap>
              </SceneProvider>
              {i > 0 && <Sfx name="b-air" at={0} volume={0.3} />}
            </Sequence>
          );
        })}
        <BrandMark outroFrom={outro ? outro.from : null} />
        {captions && <Captions />}
        <VoiceTrack />
        {music && <MusicBed src={music.src} level={music.level} />}
        {timing.estimated && <EstimatedBadge />}
      </AbsoluteFill>
    </TimingProvider>
  );
};
